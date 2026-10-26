/**
 * Pure helper functions for Markdown to HTML conversion.
 * No DOM access — safe to import in tests and workers.
 */

import { MARKDOWN_TO_HTML_THEMES, DEFAULT_THEME } from './markdown-to-html-themes.js';
import { markdownItTaskLists } from './markdown-it-task-lists.js';

const TASK_LIST_ALLOWED_CLASSES = Object.freeze([
  'contains-task-list',
  'task-list-item',
  'enabled',
  'task-list-item-checkbox'
]);

/**
 * Valid renderer preset values.
 */
const VALID_PRESETS: ReadonlyArray<string> = ['default', 'commonmark', 'zero'];
const MARKDOWN_EDITOR_TAB_TEXT = '    ';

export type MarkdownToHtmlOptions = {
  theme: string;
  renderPreset: string;
  allowRawHtml: boolean;
  autoLinkPlainUrls: boolean;
  useSmartPunctuation: boolean;
  convertSingleLineBreaks: boolean;
  useXhtmlSelfClosingTags: boolean;
  codeLanguageClassPrefix: string;
  enableCodeHighlighting: boolean;
};

type MarkdownItOptions = {
  html: boolean;
  linkify: boolean;
  typographer: boolean;
  breaks: boolean;
  xhtmlOut: boolean;
  langPrefix: string;
};

type MarkdownRenderer = {
  render(markdown: string): string;
  use(plugin: unknown, options?: Record<string, unknown>): void;
};

type MarkdownTheme = {
  value: string;
  file: string;
};

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' ? value as Record<string, unknown> : {};
}

/**
 * Normalizes a textarea selection offset into the source bounds.
 */
function normalizeSelectionOffset(value: unknown, sourceLength: number) {
  const numericValue = Number(value);
  return Math.max(0, Math.min(sourceLength, Number.isFinite(numericValue) ? numericValue : 0));
}

/**
 * Returns the start offset of the line containing the provided offset.
 */
function findLineStart(source: string, offset: number) {
  return source.lastIndexOf('\n', Math.max(0, offset - 1)) + 1;
}

/**
 * Returns the end offset for all lines touched by a selection.
 */
function findTouchedLinesEnd(source: string, selectionStart: number, selectionEnd: number) {
  const effectiveEnd = selectionEnd > selectionStart && source.charAt(selectionEnd - 1) === '\n'
    ? selectionEnd - 1
    : selectionEnd;
  const nextLineBreak = source.indexOf('\n', effectiveEnd);
  return nextLineBreak === -1 ? source.length : nextLineBreak;
}

/**
 * Counts indentation characters removed by one Shift+Tab operation.
 */
function countRemovableIndent(line: string) {
  if (line.startsWith('\t')) {
    return 1;
  }

  let count = 0;
  while (count < MARKDOWN_EDITOR_TAB_TEXT.length && line.charAt(count) === ' ') {
    count += 1;
  }
  return count;
}

/**
 * Applies editor-style Tab or Shift+Tab behavior to Markdown source text.
 */
export function applyMarkdownEditorTab(value: string, selectionStart: number, selectionEnd: number, outdent: boolean = false) {
  const source = typeof value === 'string' ? value : '';
  const start = normalizeSelectionOffset(selectionStart, source.length);
  const end = normalizeSelectionOffset(selectionEnd, source.length);
  const rangeStart = Math.min(start, end);
  const rangeEnd = Math.max(start, end);

  if (!outdent && rangeStart === rangeEnd) {
    const nextValue = source.slice(0, rangeStart) + MARKDOWN_EDITOR_TAB_TEXT + source.slice(rangeEnd);
    const nextOffset = rangeStart + MARKDOWN_EDITOR_TAB_TEXT.length;
    return {
      value: nextValue,
      selectionStart: nextOffset,
      selectionEnd: nextOffset
    };
  }

  const lineStart = findLineStart(source, rangeStart);
  const blockEnd = findTouchedLinesEnd(source, rangeStart, rangeEnd);
  const block = source.slice(lineStart, blockEnd);

  if (!outdent) {
    const lines = block.split('\n');
    const nextBlock = lines.map(line => MARKDOWN_EDITOR_TAB_TEXT + line).join('\n');
    const insertedCount = lines.length * MARKDOWN_EDITOR_TAB_TEXT.length;
    return {
      value: source.slice(0, lineStart) + nextBlock + source.slice(blockEnd),
      selectionStart: rangeStart + MARKDOWN_EDITOR_TAB_TEXT.length,
      selectionEnd: rangeEnd + insertedCount
    };
  }

  let currentOffset = lineStart;
  let totalRemoved = 0;
  let removedBeforeStart = 0;
  const nextLines = block.split('\n').map((line) => {
    const removeCount = countRemovableIndent(line);
    totalRemoved += removeCount;
    removedBeforeStart += Math.min(removeCount, Math.max(0, rangeStart - currentOffset));
    currentOffset += line.length + 1;
    return line.slice(removeCount);
  });

  return {
    value: source.slice(0, lineStart) + nextLines.join('\n') + source.slice(blockEnd),
    selectionStart: rangeStart - removedBeforeStart,
    selectionEnd: Math.max(rangeStart - removedBeforeStart, rangeEnd - totalRemoved)
  };
}

/**
 * Normalize raw user/session options into a consistent shape with defaults applied.
 */
export function normalizeMarkdownToHtmlOptions(rawOptions: unknown): MarkdownToHtmlOptions {
  const opts = asRecord(rawOptions);
  return {
    theme: typeof opts.theme === 'string' && opts.theme.trim() ? opts.theme.trim() : DEFAULT_THEME,
    renderPreset: typeof opts.renderPreset === 'string' && VALID_PRESETS.includes(opts.renderPreset) ? opts.renderPreset : 'default',
    allowRawHtml: opts.allowRawHtml === true,
    autoLinkPlainUrls: opts.autoLinkPlainUrls === true,
    useSmartPunctuation: opts.useSmartPunctuation === true,
    convertSingleLineBreaks: opts.convertSingleLineBreaks === true,
    useXhtmlSelfClosingTags: opts.useXhtmlSelfClosingTags === true,
    codeLanguageClassPrefix: typeof opts.codeLanguageClassPrefix === 'string'
      ? opts.codeLanguageClassPrefix
      : 'language-',
    enableCodeHighlighting: opts.enableCodeHighlighting !== false
  };
}

/**
 * Map normalized UI options to markdown-it constructor options.
 */
export function buildMarkdownItOptions(normalizedOptions: MarkdownToHtmlOptions): MarkdownItOptions {
  return {
    html: normalizedOptions.allowRawHtml,
    linkify: normalizedOptions.autoLinkPlainUrls,
    typographer: normalizedOptions.useSmartPunctuation,
    breaks: normalizedOptions.convertSingleLineBreaks,
    xhtmlOut: normalizedOptions.useXhtmlSelfClosingTags,
    langPrefix: normalizedOptions.codeLanguageClassPrefix
  };
}

/**
 * Build a stable cache key from normalized options that affect renderer behavior.
 */
export function buildMarkdownRendererCacheKey(normalizedOptions: MarkdownToHtmlOptions) {
  return [
    normalizedOptions.renderPreset,
    normalizedOptions.allowRawHtml ? '1' : '0',
    normalizedOptions.autoLinkPlainUrls ? '1' : '0',
    normalizedOptions.useSmartPunctuation ? '1' : '0',
    normalizedOptions.convertSingleLineBreaks ? '1' : '0',
    normalizedOptions.useXhtmlSelfClosingTags ? '1' : '0',
    normalizedOptions.codeLanguageClassPrefix
  ].join('|');
}

/**
 * Resolve the markdown-it preset string from normalized options.
 */
export function resolveMarkdownItPreset(normalizedOptions: Pick<MarkdownToHtmlOptions, 'renderPreset'>) {
  if (VALID_PRESETS.includes(normalizedOptions.renderPreset)) {
    return normalizedOptions.renderPreset;
  }
  return 'default';
}

/**
 * Create a new markdown-it renderer instance from the factory.
 * @param markdownitFactory - The window.markdownit constructor
 * @returns markdown-it instance
 */
export function createMarkdownRenderer(
  markdownitFactory: (...args: unknown[]) => unknown,
  normalizedOptions: MarkdownToHtmlOptions
): MarkdownRenderer {
  const preset = resolveMarkdownItPreset(normalizedOptions);
  const mdOptions = buildMarkdownItOptions(normalizedOptions);
  const renderer = markdownitFactory(preset, mdOptions);
  if (renderer && typeof renderer === 'object' && typeof (renderer as Partial<MarkdownRenderer>).use === 'function') {
    (renderer as MarkdownRenderer).use(markdownItTaskLists, { interactive: false });
  }
  return renderer as MarkdownRenderer;
}

/**
 * Render Markdown source text to unsafe HTML using a markdown-it instance.
 * @param renderer - markdown-it instance with .render() method
 */
export function renderMarkdownToUnsafeHtml(markdown: string, renderer: MarkdownRenderer) {
  const source = typeof markdown === 'string' ? markdown : '';
  if (!source) {
    return '';
  }
  return renderer.render(source);
}

/**
 * Sanitize rendered HTML through the provided sanitizer function.
 * Returns an object indicating whether unsafe content was removed.
 */
export function sanitizeRenderedMarkdownHtml(unsafeHtml: string, sanitizer: (html: string, options?: Record<string, unknown>) => string) {
  if (!unsafeHtml) {
    return { html: '', hadUnsafeContent: false };
  }
  const sanitized = sanitizer(unsafeHtml, {
    allowedClasses: TASK_LIST_ALLOWED_CLASSES,
    taskCheckboxes: true
  });
  const hadUnsafeContent = sanitized.length < unsafeHtml.length;
  return { html: sanitized, hadUnsafeContent };
}

/**
 * Resolve a theme value against available themes, falling back to default.
 */
export function resolveMarkdownTheme(rawTheme: unknown, availableThemes: MarkdownTheme[], fallbackTheme: string) {
  const themeValue = typeof rawTheme === 'string' ? rawTheme.trim() : '';
  const match = availableThemes.find(t => t.value === themeValue);
  if (match) {
    return { value: match.value, file: match.file, isFallback: false };
  }
  const fallback = availableThemes.find(t => t.value === fallbackTheme);
  if (fallback) {
    return { value: fallback.value, file: fallback.file, isFallback: true };
  }
  // Absolute last resort — use first available theme
  const firstTheme = availableThemes[0];
  if (firstTheme) {
    return { value: firstTheme.value, file: firstTheme.file, isFallback: true };
  }
  return { value: '', file: '', isFallback: true };
}

/** Status state constants used by Markdown-to-HTML status presentation. */
export const STATUS_STATES = {
  EMPTY: 'empty',
  RENDERING: 'rendering',
  RENDERED: 'rendered',
  THEME_CHANGED: 'theme_changed',
  SETTING_CHANGED: 'setting_changed',
  COPIED: 'copied',
  COPY_FAILED: 'copy_failed',
  MISSING_RENDERER: 'missing_renderer',
  MISSING_THEME: 'missing_theme',
  RENDER_FAILED: 'render_failed',
  SANITIZED_UNSAFE: 'sanitized_unsafe'
};

/**
 * Build a user-facing status message from a state key.
 * @param state - One of STATUS_STATES values
 */
export function buildMarkdownToHtmlStatus(state: string) {
  switch (state) {
    case STATUS_STATES.EMPTY:
      return 'Paste Markdown to render HTML.';
    case STATUS_STATES.RENDERING:
      return 'Rendering Markdown...';
    case STATUS_STATES.RENDERED:
      return 'Rendered preview updated.';
    case STATUS_STATES.THEME_CHANGED:
      return 'Preview theme changed for this session.';
    case STATUS_STATES.SETTING_CHANGED:
      return 'Renderer option changed for this session.';
    case STATUS_STATES.COPIED:
      return 'HTML copied.';
    case STATUS_STATES.COPY_FAILED:
      return 'Copy failed. Select the HTML below and copy it manually.';
    case STATUS_STATES.MISSING_RENDERER:
      return 'Markdown renderer is unavailable. Check that src/content/libs/markdown-it-14.2.0.js is loaded before the tool script.';
    case STATUS_STATES.MISSING_THEME:
      return 'Selected Markdown theme is unavailable. Using the default GitHub theme.';
    case STATUS_STATES.RENDER_FAILED:
      return 'Render failed. Check the Markdown input and renderer settings.';
    case STATUS_STATES.SANITIZED_UNSAFE:
      return 'Unsafe HTML was removed from the rendered output.';
    default:
      return '';
  }
}
