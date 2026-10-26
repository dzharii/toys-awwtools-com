import { registerAllComponents } from '../../../../vendor/retroos-ui-v001/src/components/register-all.js';
import {
  hideManualCopyPanel,
  pulseButtonLabelWithFixedWidth,
  revealManualCopyPanel
} from './rich-text-to-markdown-ui.js';
import { focusDefaultControl } from '../../_shared/default_focus.js';
import {
  applyBuiltinToolName,
  BUILTIN_TOOL_NAME_RICH_TEXT_TO_MARKDOWN
} from '../../_shared/builtin_tool_names.js';

type RichTextManualCopyPanel = HTMLElement & {
  hidden: boolean;
  value?: string;
  selectText?: () => void;
};

type ButtonLikeElement = HTMLElement & {
  disabled: boolean;
};

type SanitizerFragment = DocumentFragment | Element | string;
type BrowserSanitizer = {
  sanitizeFor?: (element: string, html: string) => SanitizerFragment;
  sanitize?: (html: string) => SanitizerFragment;
};
type BrowserSanitizerConstructor = new (config?: unknown) => BrowserSanitizer;
type ElementWithSetHtml = Element & {
  setHTML?: (html: string, options?: { sanitizer?: BrowserSanitizer }) => void;
};

/**
 * Finds a required tool element and narrows it to the expected DOM subtype.
 * @param id Element id.
 * @param ctor Expected element constructor.
 * @returns Matching element.
 */
function getRequiredElement<T extends HTMLElement>(id: string, ctor: { new(): T }): T {
  const element = document.getElementById(id);
  if (!(element instanceof ctor)) {
    throw new Error(`Missing required element: ${id}`);
  }
  return element;
}

(() => {
  'use strict';

  registerAllComponents();
  applyBuiltinToolName(BUILTIN_TOOL_NAME_RICH_TEXT_TO_MARKDOWN);

  if (globalThis.lpLog && typeof globalThis.lpLog.initFromSettings === 'function') {
    globalThis.lpLog.initFromSettings();
  }
  const lpLog = globalThis.lpLog || console;

  const inputEl = getRequiredElement('input', HTMLElement);
  const outputEl = getRequiredElement('output', HTMLTextAreaElement);
  const copyBtn = getRequiredElement('copy-btn', HTMLElement) as ButtonLikeElement;
  const clearBtn = getRequiredElement('clear-btn', HTMLElement) as ButtonLikeElement;
  const errorMessage = document.getElementById('error-message');
  const manualCopyPanel = document.getElementById('manual-copy-panel') as RichTextManualCopyPanel | null;

  const debounceMs = 150;
  let debounceId: number | null = null;
  const turndownService = createTurndownService();
  const MAX_CLIPBOARD_CHARS = 1000000;
  const ALLOWED_ELEMENTS = new Set([
    'p', 'br', 'hr',
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'blockquote',
    'ul', 'ol', 'li',
    'em', 'i', 'strong', 'b', 'del', 's', 'strike',
    'code', 'pre',
    'a',
    'table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td'
  ]);
  const DISALLOWED_ELEMENTS = new Set([
    'script', 'style',
    'iframe', 'object', 'embed',
    'link', 'meta',
    'img',
    'svg', 'math',
    'video', 'audio', 'source', 'track', 'canvas'
  ]);
  const ALLOWED_ATTRIBUTES: Partial<Record<string, Set<string>>> = {
    a: new Set(['href', 'title']),
    th: new Set(['align']),
    td: new Set(['align'])
  };

  function normalizeText(text: string): string {
    return text.replace(/\u00a0/g, ' ').trim();
  }

  function escapeMarkdown(str: string): string {
    return str.replace(/[\u2018\u2019\u00b4]/g, "'")
      .replace(/[\u201c\u201d\u2033]/g, '"')
      .replace(/[\u2212\u2022\u00b7\u25aa]/g, '-')
      .replace(/[\u2013\u2015]/g, '--')
      .replace(/\u2014/g, '---')
      .replace(/\u2026/g, '...')
      .replace(/[ ]+\n/g, '\n')
      .replace(/\s*\\\n/g, '\\\n')
      .replace(/\s*\\\n\s*\\\n/g, '\n\n')
      .replace(/\s*\\\n\n/g, '\n\n')
      .replace(/\n-\n/g, '\n')
      .replace(/\n\n\s*\\\n/g, '\n\n')
      .replace(/\n\n\n*/g, '\n\n')
      .replace(/[ ]+$/gm, '')
      .replace(/^\s+|[\s\\]+$/g, '');
  }

  function createTurndownService() {
    if (!window.TurndownService) {
      throw new Error('Turndown is not available');
    }

    const service = new window.TurndownService();
    const gfm = window.turndownPluginGfm && window.turndownPluginGfm.gfm;

    service.addRule('table', {
      filter: 'table',
      replacement: function (content, node) {
        function escapePipe(text: string): string {
          return text.replace(/\|/g, '\\|');
        }

        if (!(node instanceof Element)) {
          return '';
        }

        const rows = Array.from(node.querySelectorAll('tr'));
        if (!rows.length) {
          return '';
        }
        const firstRow = rows[0];
        if (!firstRow) {
          return '';
        }

        let markdown = '';
        const headerCells = firstRow.querySelectorAll('th');
        let headers: string[] = [];
        let alignments: string[] = [];

        if (headerCells.length) {
          headers = Array.from(headerCells).map(cell =>
            escapePipe(service.turndown((cell.textContent || '').trim()))
          );

          alignments = Array.from(headerCells).map(cell => {
            const align = (cell.getAttribute('align') || '').toLowerCase();
            if (align === 'left') {
              return ':---';
            }
            if (align === 'right') {
              return '---:';
            }
            if (align === 'center') {
              return ':---:';
            }
            return '---';
          });

          rows.shift();
        } else {
          const firstRowCells = firstRow.querySelectorAll('td');
          headers = Array.from(firstRowCells).map(cell =>
            escapePipe(service.turndown((cell.textContent || '').trim()))
          );
          alignments = headers.map(() => '---');
          rows.shift();
        }

        markdown += `| ${headers.join(' | ')} |\n`;
        markdown += `| ${alignments.join(' | ')} |\n`;

        rows.forEach(row => {
          const cells = Array.from(row.querySelectorAll('th, td')).map(cell =>
            escapePipe(service.turndown((cell.textContent || '').trim()))
          );
          markdown += `| ${cells.join(' | ')} |\n`;
        });

        return `\n${markdown}\n`;
      }
    });

    if (gfm) {
      service.use([gfm]);
    }

    return service;
  }

  function enforceAllowedAttributes(root: ParentNode): void {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT);
    let node: Node | null = walker.currentNode;
    while (node) {
      if (!(node instanceof Element)) {
        node = walker.nextNode();
        continue;
      }
      const element = node;
      const tag = element.tagName.toLowerCase();
      const allowed = ALLOWED_ATTRIBUTES[tag] || new Set();
      Array.from(element.attributes).forEach((attr) => {
        if (!allowed.has(attr.name)) {
          element.removeAttribute(attr.name);
        }
      });

      if (tag === 'a') {
        const href = element.getAttribute('href');
        if (href) {
          let isSafe = false;
          try {
            const url = new URL(href, 'https://example.invalid');
            isSafe = url.protocol === 'http:' || url.protocol === 'https:';
          } catch (error) {
            isSafe = false;
          }
          if (!isSafe) {
            element.removeAttribute('href');
          }
        }
      }

      if (tag === 'th' || tag === 'td') {
        const align = element.getAttribute('align');
        if (align) {
          const normalized = align.toLowerCase();
          if (normalized === 'left' || normalized === 'right' || normalized === 'center') {
            element.setAttribute('align', normalized);
          } else {
            element.removeAttribute('align');
          }
        }
      }

      node = walker.nextNode();
    }
  }

  function sanitizeWithSanitizer(html: string): HTMLElement | null {
    try {
      const SanitizerCtor = (window as Window & { Sanitizer?: BrowserSanitizerConstructor }).Sanitizer;
      if (typeof SanitizerCtor !== 'function') {
        return null;
      }
      const sanitizer = new SanitizerCtor({
        allowElements: Array.from(ALLOWED_ELEMENTS),
        allowAttributes: {
          a: ['href', 'title'],
          th: ['align'],
          td: ['align']
        }
      });

      let fragment: SanitizerFragment | null = null;
      if (typeof sanitizer.sanitizeFor === 'function') {
        fragment = sanitizer.sanitizeFor('div', html);
      } else if (typeof sanitizer.sanitize === 'function') {
        fragment = sanitizer.sanitize(html);
      } else if (typeof Element !== 'undefined' && typeof (Element.prototype as ElementWithSetHtml).setHTML === 'function') {
        const container = document.createElement('div');
        (container as ElementWithSetHtml).setHTML?.(html, { sanitizer });
        fragment = document.createDocumentFragment();
        while (container.firstChild) {
          fragment.appendChild(container.firstChild);
        }
      }

      if (!fragment) {
        return null;
      }

      if (typeof fragment === 'string') {
        const temp = document.createElement('div');
        temp.innerHTML = fragment;
        const wrapperFragment = document.createDocumentFragment();
        while (temp.firstChild) {
          wrapperFragment.appendChild(temp.firstChild);
        }
        fragment = wrapperFragment;
      }

      if (!(fragment instanceof Node)) {
        return null;
      }

      const container = document.createElement('div');
      container.appendChild(fragment.cloneNode(true));
      enforceAllowedAttributes(container);
      return container;
    } catch (error) {
      return null;
    }
  }

  function sanitizeNode(node: Node): Node {
    if (node.nodeType === Node.TEXT_NODE) {
      return document.createTextNode(node.textContent || '');
    }

    if (node.nodeType !== Node.ELEMENT_NODE) {
      return document.createDocumentFragment();
    }

    if (!(node instanceof Element)) {
      return document.createDocumentFragment();
    }

    const tag = node.tagName.toLowerCase();

    if (DISALLOWED_ELEMENTS.has(tag)) {
      return document.createDocumentFragment();
    }

    if (!ALLOWED_ELEMENTS.has(tag)) {
      const fragment = document.createDocumentFragment();
      Array.from(node.childNodes).forEach((child) => {
        fragment.appendChild(sanitizeNode(child));
      });
      return fragment;
    }

    const cleanEl = document.createElement(tag);
    const allowed = ALLOWED_ATTRIBUTES[tag] || new Set();
    Array.from(node.attributes).forEach((attr) => {
      if (!allowed.has(attr.name)) {
        return;
      }
      if (tag === 'a' && attr.name === 'href') {
        let isSafe = false;
        try {
          const url = new URL(attr.value, 'https://example.invalid');
          isSafe = url.protocol === 'http:' || url.protocol === 'https:';
        } catch (error) {
          isSafe = false;
        }
        if (!isSafe) {
          return;
        }
      }
      if ((tag === 'th' || tag === 'td') && attr.name === 'align') {
        const normalized = attr.value.toLowerCase();
        if (normalized !== 'left' && normalized !== 'right' && normalized !== 'center') {
          return;
        }
        cleanEl.setAttribute('align', normalized);
        return;
      }
      cleanEl.setAttribute(attr.name, attr.value);
    });

    Array.from(node.childNodes).forEach((child) => {
      cleanEl.appendChild(sanitizeNode(child));
    });

    return cleanEl;
  }

  function sanitizeWithFallback(html: string): HTMLElement {
    const parser = new DOMParser();
    const doc = parser.parseFromString(`<div>${html}</div>`, 'text/html');
    const container = doc.body.firstChild || doc.body;
    const fragment = document.createDocumentFragment();
    Array.from(container.childNodes).forEach((child) => {
      fragment.appendChild(sanitizeNode(child));
    });
    const wrapper = document.createElement('div');
    wrapper.appendChild(fragment);
    enforceAllowedAttributes(wrapper);
    return wrapper;
  }

  function sanitizeHtmlToContainer(html: string): HTMLElement {
    if (typeof (window as Window & { Sanitizer?: BrowserSanitizerConstructor }).Sanitizer === 'function') {
      const sanitizerResult = sanitizeWithSanitizer(html);
      if (sanitizerResult) {
        return sanitizerResult;
      }
    }
    return sanitizeWithFallback(html);
  }

  function sanitizeHtmlString(html: string): string {
    const container = sanitizeHtmlToContainer(html);
    return container.innerHTML;
  }

  /**
   * Clean the sanitized DOM before Turndown conversion to remove HTML
   * artefacts that produce noisy or useless Markdown.
   *
   * Runs four passes in order:
   *  A. Remove anchors whose visible text is empty or whitespace-only.
   *     Catches header-navigation anchors like <a name="x" href="#x"></a>.
   *  B. Unwrap anchors whose href is fragment-only (#...).  The link target
   *     is meaningless outside the original page, but the visible text may
   *     still be useful, so children are kept as plain DOM nodes.
   *  C. Simplify self-referencing links where the visible text equals the URL
   *     (e.g. <a href="https://x">https://x</a>).  Turndown would produce
   *     the redundant [url](url); a bare URL reads better.
   *  D. Remove block elements (p, blockquote, li, h1-h6) that ended up empty
   *     after the previous passes (or were empty in the source).
   *
   * @param container The sanitized wrapper element (mutated in place).
   */
  function preprocessDOM(container: HTMLElement): void {
    // --- Pass A: remove anchors with empty/whitespace-only text ---
    container.querySelectorAll('a').forEach((a) => {
      if (a.textContent.trim() === '') {
        a.remove();
      }
    });

    // --- Pass B: unwrap fragment-only href anchors ---
    container.querySelectorAll('a').forEach((a) => {
      const href = (a.getAttribute('href') || '').trim();
      if (href.startsWith('#')) {
        a.replaceWith(...a.childNodes);
      }
    });

    // --- Pass C: simplify self-referencing links (text === url) ---
    container.querySelectorAll('a').forEach((a) => {
      const href = (a.getAttribute('href') || '').trim();
      if (href && a.textContent.trim() === href) {
        a.replaceWith(document.createTextNode(href));
      }
    });

    // --- Pass D: remove empty block elements ---
    container.querySelectorAll(
      'p, blockquote, li, h1, h2, h3, h4, h5, h6'
    ).forEach((el) => {
      if (el.textContent.trim() === '' && el.children.length === 0) {
        el.remove();
      }
    });
  }

  function buildFragmentFromHtml(html: string): DocumentFragment {
    const container = sanitizeHtmlToContainer(html);
    const fragment = document.createDocumentFragment();
    while (container.firstChild) {
      fragment.appendChild(container.firstChild);
    }
    return fragment;
  }

  function isInputEmpty() {
    const text = normalizeText(inputEl.textContent || '');
    if (text.length > 0) {
      return false;
    }
    const hasMedia = inputEl.querySelector('img, table, svg, video, audio, iframe');
    return !hasMedia;
  }

  function hideErrorMessage() {
    if (!errorMessage) {
      return;
    }
    errorMessage.hidden = true;
    errorMessage.removeAttribute('open');
  }

  function showErrorMessage() {
    if (!errorMessage) {
      return;
    }
    errorMessage.hidden = false;
    errorMessage.setAttribute('open', '');
  }

  function updateCopyAvailability() {
    const hasOutput = normalizeText(outputEl.value || '').length > 0;
    copyBtn.disabled = !hasOutput;
  }

  function setEmptyState() {
    outputEl.value = '';
    hideErrorMessage();
    hideManualCopyPanel(manualCopyPanel);
    updateCopyAvailability();
  }

  function setReadyState(markdown: string): void {
    outputEl.value = markdown;
    hideErrorMessage();
    hideManualCopyPanel(manualCopyPanel);
    updateCopyAvailability();
  }

  function setErrorState() {
    showErrorMessage();
    updateCopyAvailability();
  }

  function convertToMarkdown() {
    const html = inputEl.innerHTML || '';
    const container = sanitizeHtmlToContainer(html);
    preprocessDOM(container);
    return escapeMarkdown(turndownService.turndown(container.innerHTML));
  }

  function performConversion() {
    hideManualCopyPanel(manualCopyPanel);

    if (isInputEmpty()) {
      setEmptyState();
      return;
    }

    try {
      const markdown = convertToMarkdown();
      if (typeof markdown !== 'string') {
        throw new Error('Invalid markdown output');
      }
      setReadyState(markdown);
      lpLog.info('[rich-text-to-markdown] Conversion succeeded');
    } catch (error) {
      lpLog.error('[rich-text-to-markdown] Conversion failed:', error);
      setErrorState();
    }
  }

  function scheduleConversion() {
    if (debounceId) {
      window.clearTimeout(debounceId);
    }
    debounceId = window.setTimeout(performConversion, debounceMs);
  }

  function showCopiedFeedback() {
    pulseButtonLabelWithFixedWidth(copyBtn, 'Copied', { timeoutMs: 1000 });
  }

  function tryExecCopy() {
    outputEl.focus();
    outputEl.select();
    try {
      return document.execCommand('copy');
    } catch (error) {
      return false;
    }
  }

  async function handleCopy() {
    const text = outputEl.value || '';
    if (!normalizeText(text)) {
      return;
    }
    lpLog.info('[rich-text-to-markdown] Attempting to copy markdown output');

    let copied = false;

    if (navigator.clipboard && navigator.clipboard.writeText) {
      try {
        await navigator.clipboard.writeText(text);
        copied = true;
      } catch (error) {
        copied = false;
      }
    }

    if (!copied) {
      copied = tryExecCopy();
    }

    if (copied) {
      lpLog.info('[rich-text-to-markdown] Markdown copied to clipboard');
      hideManualCopyPanel(manualCopyPanel);
      showCopiedFeedback();
    } else {
      lpLog.warn('[rich-text-to-markdown] Copy to clipboard failed; manual copy fallback shown');
      revealManualCopyPanel(manualCopyPanel, text);
    }
  }

  function handleClear() {
    lpLog.info('[rich-text-to-markdown] Clearing input and output');
    inputEl.innerHTML = '';
    setEmptyState();
    inputEl.focus();
  }

  function getClipboardPayload(event: ClipboardEvent): { html: string; text: string } {
    const clipboard = event.clipboardData;
    if (!clipboard) {
      return { html: '', text: '' };
    }

    let html = clipboard.getData('text/html') || '';
    let text = clipboard.getData('text/plain') || '';

    if (html.length > MAX_CLIPBOARD_CHARS) {
      html = '';
    }

    if (text.length > MAX_CLIPBOARD_CHARS) {
      text = text.slice(0, MAX_CLIPBOARD_CHARS);
    }

    return { html, text };
  }

  function ensureSelectionInInput() {
    const selection = window.getSelection();
    if (!selection) {
      return null;
    }

    if (!selection.rangeCount || !inputEl.contains(selection.getRangeAt(0).commonAncestorContainer)) {
      const range = document.createRange();
      range.selectNodeContents(inputEl);
      range.collapse(false);
      selection.removeAllRanges();
      selection.addRange(range);
    }

    return selection;
  }

  function insertFragmentAtSelection(fragment: DocumentFragment): void {
    const selection = ensureSelectionInInput();
    if (!selection || !selection.rangeCount) {
      inputEl.appendChild(fragment);
      return;
    }

    const range = selection.getRangeAt(0);
    range.deleteContents();
    const nodes = Array.from(fragment.childNodes);
    range.insertNode(fragment);

    if (nodes.length) {
      const lastNode = nodes[nodes.length - 1];
      if (!lastNode) {
        return;
      }
      const afterRange = document.createRange();
      afterRange.setStartAfter(lastNode);
      afterRange.collapse(true);
      selection.removeAllRanges();
      selection.addRange(afterRange);
    }
  }

  function insertTextAtSelection(text: string): void {
    if (!text) {
      return;
    }

    const selection = ensureSelectionInInput();
    if (!selection || !selection.rangeCount) {
      inputEl.appendChild(document.createTextNode(text));
      return;
    }

    try {
      document.execCommand('insertText', false, text);
      return;
    } catch (error) {
      // Fall through to range insertion.
    }

    const range = selection.getRangeAt(0);
    range.deleteContents();
    const textNode = document.createTextNode(text);
    range.insertNode(textNode);
    range.setStartAfter(textNode);
    range.collapse(true);
    selection.removeAllRanges();
    selection.addRange(range);
  }

  function handlePaste(event: ClipboardEvent): void {
    event.preventDefault();
    lpLog.info('[rich-text-to-markdown] Attempting to paste rich text');
    const { html, text } = getClipboardPayload(event);

    if (html) {
      const fragment = buildFragmentFromHtml(html);
      insertFragmentAtSelection(fragment);
    } else {
      insertTextAtSelection(text);
    }

    scheduleConversion();
  }

  inputEl.addEventListener('input', scheduleConversion);
  inputEl.addEventListener('paste', handlePaste);
  copyBtn.addEventListener('click', handleCopy);
  clearBtn.addEventListener('click', handleClear);

  setEmptyState();
  focusDefaultControl(inputEl);
})();
