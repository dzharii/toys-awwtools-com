type SettingsObject = Record<string, unknown>;
type SettingsValue = unknown;
type SettingsLeafType = 'array' | 'object' | 'number' | 'boolean' | 'string' | 'unknown';

interface SettingOption {
  value: string | number | boolean;
  label?: string;
}

interface SettingDefinition {
  keyPath: string;
  debugName?: string;
  label?: string;
  description?: string;
  type?: SettingsLeafType;
  defaultValue?: SettingsValue;
  value?: SettingsValue;
  allowedValues?: SettingsValue[];
  min?: number;
  max?: number;
  step?: number | string;
  unit?: string;
  uiControl?: string;
  options?: SettingOption[];
}

interface SettingsCategory {
  id?: string;
  label?: string;
  description?: string;
  order?: number;
  settings?: SettingDefinition[];
}

interface SettingsDocument extends SettingsObject {
  version: number;
  categories: SettingsCategory[];
}

interface SchemaMeta {
  keyPath: string;
  type: SettingsLeafType;
  defaultValue: SettingsValue;
  allowedValues: SettingsValue[] | null;
  min: number | null;
  max: number | null;
}

interface SchemaNode {
  children: Record<string, SchemaNode>;
  meta: SchemaMeta | null;
}

interface NormalizedSettingsRecord {
  schemaVersion: number;
  overrides: SettingsObject;
}

interface NormalizedStoredSettings {
  effectiveDoc: SettingsDocument;
  overrides: SettingsObject;
  normalizedRecord: NormalizedSettingsRecord;
  changed: boolean;
}

type SettingsGlobal = typeof globalThis & {
  lpSettings?: unknown;
  lpLog?: unknown;
};

(function (global: SettingsGlobal) {
  'use strict';

  if (global.lpSettings && global.lpLog) {
    return;
  }

  const SETTINGS_STORAGE_KEY = 'lpSettingsDocument';
  const SCHEMA_VERSION = 17;

  const DEFAULT_SETTINGS_DOCUMENT = {
    version: SCHEMA_VERSION,
    categories: [
      {
        id: 'general',
        label: 'General behavior',
        description: 'Core behavior for preview windows.',
        order: 10,
        settings: [
          {
            keyPath: 'previewWindow.defaultSizePreset',
            debugName: 'previewWindow.defaultSizePreset',
            label: 'Default preview window size',
            description: 'Initial size preset used for new preview windows.',
            type: 'string',
            defaultValue: 'M',
            value: null,
            allowedValues: ['M', 'L', 'XL'],
            uiControl: 'radio'
          }
        ]
      },
      {
        id: 'openTools',
        label: 'Open Tools',
        description: 'Control which tools are shown in the Open Tools menu.',
        order: 12,
        settings: [
          {
            keyPath: 'openTools.showRichTextToMarkdown',
            debugName: 'openTools.showRichTextToMarkdown',
            label: 'Show Rich Text to Markdown tool',
            description: 'Controls visibility of the Rich Text to Markdown tool in Open Tools.',
            type: 'boolean',
            defaultValue: true,
            value: null,
            uiControl: 'checkbox'
          },
          {
            keyPath: 'openTools.showMiniWebBrowser',
            debugName: 'openTools.showMiniWebBrowser',
            label: 'Show Mini Web Browser tool',
            description: 'Controls visibility of the Mini Web Browser tool in Open Tools.',
            type: 'boolean',
            defaultValue: true,
            value: null,
            uiControl: 'checkbox'
          },
          {
            keyPath: 'openTools.showBookmarksManager',
            debugName: 'openTools.showBookmarksManager',
            label: 'Show Bookmarks Manager tool',
            description: 'Controls visibility of the Bookmarks Manager tool in Open Tools.',
            type: 'boolean',
            defaultValue: true,
            value: null,
            uiControl: 'checkbox'
          },
          {
            keyPath: 'openTools.showMarkdownToHtml',
            debugName: 'openTools.showMarkdownToHtml',
            label: 'Show Markdown to HTML tool',
            description: 'Controls visibility of the Markdown to HTML tool in Open Tools.',
            type: 'boolean',
            defaultValue: true,
            value: null,
            uiControl: 'checkbox'
          }
        ]
      },
      {
        id: 'markdownToHtml',
        label: 'Markdown to HTML',
        description: 'Default renderer and theme options for the Markdown to HTML tool.',
        order: 13,
        settings: [
          {
           keyPath: 'markdownToHtml.defaultTheme',
           debugName: 'markdownToHtml.defaultTheme',
           label: 'Preview theme',
           description: 'Controls the CSS used for the rendered Markdown preview. This session can override the global default without saving it.',
           type: 'string',
           defaultValue: 'github-auto',
           value: null,
           allowedValues: ['github-auto', 'github-light', 'github-dark', 'github-dark-dimmed', 'github-dark-high-contrast', 'github-dark-colorblind', 'github-light-colorblind'],
           uiControl: 'select'
          },
          {
           keyPath: 'markdownToHtml.renderPreset',
           debugName: 'markdownToHtml.renderPreset',
           label: 'Markdown compatibility mode',
           description: 'Chooses the base Markdown rule set. Default mode is the recommended renderer mode. CommonMark mode is stricter. Zero mode starts with most Markdown rules disabled and should be treated as advanced.',
           type: 'string',
           defaultValue: 'default',
           value: null,
           allowedValues: ['default', 'commonmark', 'zero'],
           uiControl: 'select'
          },
          {
           keyPath: 'markdownToHtml.allowRawHtml',
           debugName: 'markdownToHtml.allowRawHtml',
           label: 'Allow raw HTML from Markdown source',
           description: 'Allows HTML tags typed inside the Markdown source to be rendered. Rendered output is still sanitized before preview and copy. Leave this off for safer document preview.',
           type: 'boolean',
           defaultValue: false,
           value: null,
           uiControl: 'checkbox'
          },
          {
           keyPath: 'markdownToHtml.autoLinkPlainUrls',
           debugName: 'markdownToHtml.autoLinkPlainUrls',
           label: 'Turn plain URLs into links',
           description: 'Converts URL-like text such as https://example.com into clickable links even when the Markdown source did not use Markdown link syntax.',
           type: 'boolean',
           defaultValue: false,
           value: null,
           uiControl: 'checkbox'
          },
          {
           keyPath: 'markdownToHtml.useSmartPunctuation',
           debugName: 'markdownToHtml.useSmartPunctuation',
           label: 'Use smart punctuation replacements',
           description: 'Converts some plain punctuation into typographic replacements such as smart quotes and replacement symbols.',
           type: 'boolean',
           defaultValue: false,
           value: null,
           uiControl: 'checkbox'
          },
          {
           keyPath: 'markdownToHtml.convertSingleLineBreaks',
           debugName: 'markdownToHtml.convertSingleLineBreaks',
           label: 'Show single line breaks as line breaks',
           description: 'Treats a single newline inside a paragraph as a visible line break. This is useful for chat-style Markdown but may differ from standard Markdown documents.',
           type: 'boolean',
           defaultValue: false,
           value: null,
           uiControl: 'checkbox'
          },
          {
           keyPath: 'markdownToHtml.enableCodeHighlighting',
           debugName: 'markdownToHtml.enableCodeHighlighting',
           label: 'Highlight code blocks',
           description: 'Adds lightweight syntax colors to Markdown code blocks in the preview. Works without choosing a programming language. This only changes the rendered preview.',
           type: 'boolean',
           defaultValue: true,
           value: null,
           uiControl: 'checkbox'
          },
          {
           keyPath: 'markdownToHtml.useXhtmlSelfClosingTags',
           debugName: 'markdownToHtml.useXhtmlSelfClosingTags',
           label: 'Use XHTML-style self-closing tags',
           description: 'Outputs self-closing tags such as <br /> instead of <br>. This is mainly for strict compatibility needs.',
           type: 'boolean',
           defaultValue: false,
           value: null,
           uiControl: 'checkbox'
          },
          {
           keyPath: 'markdownToHtml.codeLanguageClassPrefix',
           debugName: 'markdownToHtml.codeLanguageClassPrefix',
           label: 'Code block language CSS prefix',
           description: 'Prefix added to fenced code block language classes. Keep language- unless a syntax highlighter expects a different prefix.',
           type: 'string',
           defaultValue: 'language-',
           value: null,
           uiControl: 'text'
          }
        ]
      },
      {
        id: 'textExpander',
        label: 'Text expander',
        description: 'Enable or tune commit-based text expansion and command execution behavior.',
        order: 15,
        settings: [
          {
            keyPath: 'textExpander.enabled',
            debugName: 'textExpander.enabled',
            label: 'Enable text expander',
            description: 'Controls whether text-expander matching and commands run on editable surfaces.',
            type: 'boolean',
            defaultValue: true,
            value: null,
            uiControl: 'checkbox'
          },
          {
            keyPath: 'textExpander.maxLookbackChars',
            debugName: 'textExpander.maxLookbackChars',
            label: 'Max lookback characters',
            description: 'Maximum number of characters inspected before caret when evaluating trigger tokens.',
            type: 'number',
            defaultValue: 80,
            value: null,
            min: 16,
            max: 500,
            uiControl: 'number',
            unit: 'chars'
          },
          {
            keyPath: 'textExpander.maxSuffixChecks',
            debugName: 'textExpander.maxSuffixChecks',
            label: 'Max suffix checks',
            description: 'Maximum number of suffix candidates evaluated per commit event.',
            type: 'number',
            defaultValue: 12,
            value: null,
            min: 1,
            max: 64,
            uiControl: 'number',
            unit: 'checks'
          },
          {
            keyPath: 'textExpander.respectCompositionEvents',
            debugName: 'textExpander.respectCompositionEvents',
            label: 'Respect IME composition',
            description: 'When enabled, expansions do not run while IME composition is active.',
            type: 'boolean',
            defaultValue: true,
            value: null,
            uiControl: 'checkbox'
          },
          {
            keyPath: 'textExpander.ignorePasswordFields',
            debugName: 'textExpander.ignorePasswordFields',
            label: 'Ignore password fields',
            description: 'When enabled, expansion is disabled in password inputs.',
            type: 'boolean',
            defaultValue: true,
            value: null,
            uiControl: 'checkbox'
          },
          {
            keyPath: 'textExpander.minibufferBrowseMenuLayout',
            debugName: 'textExpander.minibufferBrowseMenuLayout',
            label: 'Minibuffer browse menu layout',
            description: 'Choose how grouped Actions and Tools are displayed in the minibuffer browse menu.',
            type: 'string',
            defaultValue: 'spacious',
            value: null,
            allowedValues: ['spacious', 'compact'],
            options: [
              { value: 'spacious', label: 'Spacious' },
              { value: 'compact', label: 'Compact' }
            ],
            uiControl: 'select'
          },
          {
            keyPath: 'textExpander.minibufferRanking.enableUsageBoost',
            debugName: 'textExpander.minibufferRanking.enableUsageBoost',
            label: 'Minibuffer usage ranking',
            description: 'Boosts recently used minibuffer commands using local-only aggregate counters.',
            type: 'boolean',
            defaultValue: true,
            value: null,
            uiControl: 'checkbox'
          },
          {
            keyPath: 'textExpander.minibufferRanking.usageHalfLifeDays',
            debugName: 'textExpander.minibufferRanking.usageHalfLifeDays',
            label: 'Usage half-life',
            description: 'Number of days before local minibuffer usage influence decays by half.',
            type: 'number',
            defaultValue: 7,
            value: null,
            min: 1,
            max: 60,
            uiControl: 'number',
            unit: 'days'
          },
          {
            keyPath: 'textExpander.minibufferRanking.maxUsageBoost',
            debugName: 'textExpander.minibufferRanking.maxUsageBoost',
            label: 'Max usage boost',
            description: 'Upper bound for adaptive minibuffer command ranking influence.',
            type: 'number',
            defaultValue: 12,
            value: null,
            min: 0,
            max: 40,
            uiControl: 'number',
            unit: 'points'
          },
          {
            keyPath: 'textExpander.minibufferRanking.toolCommandBoost',
            debugName: 'textExpander.minibufferRanking.toolCommandBoost',
            label: 'Tool command boost',
            description: 'Ranking boost for primary tool commands.',
            type: 'number',
            defaultValue: 12,
            value: null,
            min: 0,
            max: 40,
            uiControl: 'number',
            unit: 'points'
          },
          {
            keyPath: 'textExpander.minibufferRanking.actionCommandBoost',
            debugName: 'textExpander.minibufferRanking.actionCommandBoost',
            label: 'Action command boost',
            description: 'Ranking boost for action commands.',
            type: 'number',
            defaultValue: 5,
            value: null,
            min: 0,
            max: 40,
            uiControl: 'number',
            unit: 'points'
          },
          {
            keyPath: 'textExpander.minibufferRanking.specializedCommandPenalty',
            debugName: 'textExpander.minibufferRanking.specializedCommandPenalty',
            label: 'Specialized command penalty',
            description: 'Ranking penalty for wrapper commands unless the query targets them directly.',
            type: 'number',
            defaultValue: 18,
            value: null,
            min: 0,
            max: 60,
            uiControl: 'number',
            unit: 'points'
          }
        ]
      },
      {
        id: 'longPressCopy',
        label: 'Long-Press Actions',
        description: 'Open actions for supported page text, links, and media with a deliberate mouse-button hold.',
        order: 18,
        settings: [
          {
            keyPath: 'longPressCopy.invocationMode',
            debugName: 'longPressCopy.invocationMode',
            label: 'Open Long-Press Actions With',
            description: 'Choose which mouse buttons can open the long-press action overlay for supported text, links, and media. A short click still performs its normal action. The Primary button is usually the left mouse button, and the Secondary button is usually the right mouse button. This may vary based on the user\'s mouse settings.',
            type: 'string',
            defaultValue: 'primary-and-secondary',
            value: null,
            allowedValues: ['primary-and-secondary', 'primary-only', 'secondary-only', 'none'],
            options: [
              { value: 'primary-and-secondary', label: 'Primary and Secondary' },
              { value: 'primary-only', label: 'Primary only' },
              { value: 'secondary-only', label: 'Secondary only' },
              { value: 'none', label: 'None' }
            ],
            uiControl: 'select'
          }
        ]
      },
      {
        id: 'bookmarks',
        label: 'Bookmarks',
        description: 'Manual bookmark controls and automatic collection behavior.',
        order: 40,
        settings: [
          {
            keyPath: 'bookmarks.enableManualBookmarkButtons',
            debugName: 'bookmarks.enableManualBookmarkButtons',
            label: 'Enable manual bookmark buttons',
            description: 'Controls visibility of manual Add bookmark buttons in the preview window and minibuffer Actions menu.',
            type: 'boolean',
            defaultValue: true,
            value: null,
            uiControl: 'checkbox'
          },
          {
            keyPath: 'bookmarks.enableAutomaticBookmarksCollection',
            debugName: 'bookmarks.enableAutomaticBookmarksCollection',
            label: 'Enable automatic bookmark collection',
            description: 'When enabled, the extension records automatic bookmarks based on activity tracking. Disable to stop collecting automatic bookmarks.',
            type: 'boolean',
            defaultValue: true,
            value: null,
            uiControl: 'checkbox'
          }
        ]
      },
      {
        id: 'privacySecurity',
        label: 'Privacy and security',
        description: 'Header bypass, URL privacy, and automatic activity bookmark behavior.',
        order: 50,
        settings: [
          {
            keyPath: 'privacySecurity.autoRemoveTrackingParams',
            debugName: 'privacySecurity.autoRemoveTrackingParams',
            label: 'Automatically remove tracking parameters',
            description: 'Automatically removes known advertising and analytics tracking parameters from website URLs without reloading the page. Other URL parameters are preserved.',
            type: 'boolean',
            defaultValue: true,
            value: null,
            uiControl: 'checkbox'
          },
          {
            keyPath: 'privacySecurity.enableHeaderBypass',
            debugName: 'privacySecurity.enableHeaderBypass',
            label: 'Allow header bypass for framed previews',
            description: 'When enabled, the extension removes certain response headers such as X-Frame-Options and Content-Security-Policy for preview iframes to allow framing more sites. When disabled, site framing protections are respected and some previews may fail.',
            type: 'boolean',
            defaultValue: true,
            value: null,
            uiControl: 'checkbox'
          },
          {
            keyPath: 'privacySecurity.enableAutomaticActivityBookmarks',
            debugName: 'privacySecurity.enableAutomaticActivityBookmarks',
            label: 'Enable automatic activity bookmarks',
            description: 'When enabled, the extension records reading activity and automatically creates or updates bookmarks based on keyboard usage and certain button clicks. Data is stored locally and not sent to any server.',
            type: 'boolean',
            defaultValue: true,
            value: null,
            uiControl: 'checkbox'
          }
        ]
      },
      {
        id: 'urlPicker',
        label: 'URL picker',
        description: 'Controls the enhanced URL picker used by Mini Web Browser.',
        order: 65,
        settings: [
          {
            keyPath: 'urlPicker.enableSuggestions',
            debugName: 'urlPicker.enableSuggestions',
            label: 'Enable enhanced URL picker suggestions',
            description: 'Shows ranked local suggestions in the Mini Web Browser address input.',
            type: 'boolean',
            defaultValue: true,
            value: null,
            uiControl: 'checkbox'
          },
          {
            keyPath: 'urlPicker.includeHistorySuggestions',
            debugName: 'urlPicker.includeHistorySuggestions',
            label: 'Include history-based suggestions',
            description: 'Allows visit-derived activity records to influence picker suggestions and ranking.',
            type: 'boolean',
            defaultValue: true,
            value: null,
            uiControl: 'checkbox'
          },
          {
            keyPath: 'urlPicker.showInlineBookmarkControls',
            debugName: 'urlPicker.showInlineBookmarkControls',
            label: 'Show inline bookmark controls',
            description: 'Shows a bookmark toggle button on picker suggestion rows.',
            type: 'boolean',
            defaultValue: true,
            value: null,
            uiControl: 'checkbox'
          },
          {
            keyPath: 'urlPicker.showSuggestionsOnEmptyInput',
            debugName: 'urlPicker.showSuggestionsOnEmptyInput',
            label: 'Show suggestions on empty input',
            description: 'Opens a short Recent and Frequent list when the picker input is focused with no text.',
            type: 'boolean',
            defaultValue: true,
            value: null,
            uiControl: 'checkbox'
          },
          {
            keyPath: 'urlPicker.alwaysOnTopRecentCount',
            debugName: 'urlPicker.alwaysOnTopRecentCount',
            label: 'Always-on-top recent suggestions',
            description: 'How many most-recently selected pages stay pinned to the top of URL picker search results before normal ranking is applied. Set to 0 to disable.',
            type: 'number',
            defaultValue: 3,
            value: null,
            min: 0,
            max: 10,
            uiControl: 'number'
          },
          {
            keyPath: 'urlPicker.showFavicons',
            debugName: 'urlPicker.showFavicons',
            label: 'Show favicons in picker results',
            description: 'Displays stored favicons in picker rows when available and falls back to placeholders otherwise.',
            type: 'boolean',
            defaultValue: true,
            value: null,
            uiControl: 'checkbox'
          }
        ]
      },
      {
        id: 'miniWebBrowser',
        label: 'Mini Web Browser',
        description: 'Search template and behavior defaults for the Mini Web Browser atool.',
        order: 67,
        settings: [
          {
            keyPath: 'miniWebBrowser.searchTemplate',
            debugName: 'miniWebBrowser.searchTemplate',
            label: 'Search URL template',
            description: 'Template used for text queries in Mini Web Browser. Use {q} as the encoded query placeholder.',
            type: 'string',
            defaultValue: 'https://duckduckgo.com/?q={q}',
            value: null,
            uiControl: 'text'
          },
          {
            keyPath: 'miniWebBrowser.sandboxMode',
            debugName: 'miniWebBrowser.sandboxMode',
            label: 'Sandbox mode',
            description: 'Compatibility mode allows same-origin behavior for embedded sites and improves rendering of modern apps. Strict mode is more isolated but may break many sites.',
            type: 'string',
            defaultValue: 'compatibility',
            value: null,
            uiControl: 'select',
            allowedValues: ['compatibility', 'strict'],
            options: [
              { value: 'compatibility', label: 'Compatibility (recommended)' },
              { value: 'strict', label: 'Strict isolation' }
            ]
          },
          {
            keyPath: 'miniWebBrowser.allowPopups',
            debugName: 'miniWebBrowser.allowPopups',
            label: 'Allow popup windows',
            description: 'Allows embedded pages to open popup windows from user actions. Disable to keep popup behavior blocked by sandbox.',
            type: 'boolean',
            defaultValue: false,
            value: null,
            uiControl: 'checkbox'
          },
          {
            keyPath: 'miniWebBrowser.autoApplyReaderMode',
            debugName: 'miniWebBrowser.autoApplyReaderMode',
            label: 'Apply reader mode automatically after page load',
            description: 'After an HTTP(S) page loads successfully in Mini Web Browser, try to show its simplified reader view. If reader mode is unavailable, keep the original page.',
            type: 'boolean',
            defaultValue: false,
            value: null,
            uiControl: 'checkbox'
          }
        ]
      },
      {
        id: 'titleFade',
        label: 'Title fade',
        description: 'Tab maturity indicator using emoji sequences in the page title.',
        order: 70,
        settings: [
          {
            keyPath: 'titleFade.enabled',
            debugName: 'titleFade.enabled',
            label: 'Enable title fade',
            description: 'Toggle the title fade indicator that decorates the page title over time.',
            type: 'boolean',
            defaultValue: true,
            value: null,
            uiControl: 'checkbox'
          },
          {
            keyPath: 'titleFade.fadeStepMinutes',
            debugName: 'titleFade.fadeStepMinutes',
            label: 'Fade step minutes',
            description: 'Minutes between title fade stages.',
            type: 'number',
            defaultValue: 10,
            value: null,
            min: 1,
            max: 180,
            uiControl: 'number',
            unit: 'min'
          },
          {
            keyPath: 'titleFade.sequence',
            debugName: 'titleFade.sequence',
            label: 'Title fade sequence',
            description: 'Choose the emoji sequence used to show tab maturity.',
            type: 'string',
            defaultValue: 'maturity',
            value: null,
            uiControl: 'select',
            options: [
              { value: 'maturity', label: 'Maturity • 🟢 → 🟡 → 🟠 → 🔴 → 🟤 → ⚫' },
              { value: 'daylight', label: 'Daylight • 🌅 → 🌤 → ☀️ → 🌇 → 🌙' },
              { value: 'battery', label: 'Battery • 🔋 → 🟩 → 🟨 → 🟧 → ⚪' },
              { value: 'numbers', label: 'Numbers • 1️⃣ → 2️⃣ → 3️⃣ → 4️⃣ → 5️⃣' },
              { value: 'hourglass', label: 'Hourglass • ⏳ → ⌛ → 🕒 → 🕕 → 🕛' }
            ],
            allowedValues: ['maturity', 'daylight', 'battery', 'numbers', 'hourglass']
          }
        ]
      },
      {
        id: 'logging',
        label: 'Logging',
        description: 'Console logging verbosity for extension diagnostics.',
        order: 80,
        settings: [
          {
            keyPath: 'logging.level',
            debugName: 'logging.level',
            label: 'Logging verbosity',
            description: 'Controls how much is written to the browser console.',
            type: 'string',
            defaultValue: 'error',
            value: null,
            allowedValues: ['debug', 'informational', 'warning', 'error'],
            uiControl: 'select',
            options: [
              { value: 'debug', label: 'Debug (most verbose)' },
              { value: 'informational', label: 'Informational' },
              { value: 'warning', label: 'Warning' },
              { value: 'error', label: 'Error only' }
            ]
          }
        ]
      }
    ]
  } satisfies SettingsDocument;

  function isUnset(value: unknown): value is null | undefined {
    return value === undefined || value === null;
  }

  function deepClone<T>(obj: T): T {
    return JSON.parse(JSON.stringify(obj)) as T;
  }

  function isPlainObject(value: unknown): value is SettingsObject {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
  }

  function deriveLeafType(setting: SettingDefinition): SettingsLeafType {
    if (!isUnset(setting.defaultValue)) {
      const value = setting.defaultValue;
      if (Array.isArray(value)) {
        return 'array';
      }
      if (value === null) {
        if (typeof setting.type === 'string') {
          return setting.type;
        }
        logError('[LP Settings] Null default without explicit type for', setting.keyPath);
        return 'unknown';
      }
      const type = typeof value;
      if (type === 'number' || type === 'boolean' || type === 'string') {
        return type;
      }
      return type === 'object' ? 'object' : 'unknown';
    }
    if (typeof setting.type === 'string') {
      return setting.type;
    }
    logError('[LP Settings] Missing default value and type for', setting.keyPath);
    return 'unknown';
  }

  function addSchemaPath(tree: SchemaNode, keyPath: string, meta: SchemaMeta): void {
    const parts = keyPath.split('.');
    let node = tree;
    for (const part of parts) {
      if (!node.children[part]) {
        node.children[part] = { children: {}, meta: null };
      }
      node = node.children[part];
    }
    if (node.meta) {
      logWarn('[LP Settings] Duplicate schema keyPath detected:', keyPath);
    }
    node.meta = meta;
  }

  function buildSchemaIndex(doc: SettingsDocument): { metaByKeyPath: Map<string, SchemaMeta>; tree: SchemaNode } {
    const metaByKeyPath = new Map<string, SchemaMeta>();
    const tree: SchemaNode = { children: {}, meta: null };

    for (const category of doc.categories || []) {
      for (const setting of category.settings || []) {
        if (!setting?.keyPath) {
          continue;
        }
        const type = deriveLeafType(setting);
        const meta = {
          keyPath: setting.keyPath,
          type,
          defaultValue: deepClone(setting.defaultValue),
          allowedValues: Array.isArray(setting.allowedValues) ? [...setting.allowedValues] : null,
          min: typeof setting.min === 'number' ? setting.min : null,
          max: typeof setting.max === 'number' ? setting.max : null
        };
        metaByKeyPath.set(setting.keyPath, meta);
        addSchemaPath(tree, setting.keyPath, meta);
      }
    }

    return { metaByKeyPath, tree };
  }

  const schemaIndex = buildSchemaIndex(DEFAULT_SETTINGS_DOCUMENT);

  const state: {
    cachedDoc: SettingsDocument | null;
    cachedOverrides: SettingsObject | null;
    cachedRecord: NormalizedSettingsRecord | null;
    loadingPromise: Promise<SettingsDocument> | null;
  } = {
    cachedDoc: null,
    cachedOverrides: null,
    cachedRecord: null,
    loadingPromise: null
  };

  function stableStringify(value: unknown): string {
    if (value === undefined) {
      return 'undefined';
    }
    if (value === null || typeof value !== 'object') {
      return JSON.stringify(value);
    }
    if (Array.isArray(value)) {
      return `[${value.map(stableStringify).join(',')}]`;
    }
    const record = value as SettingsObject;
    const keys = Object.keys(record).sort();
    const pairs = keys.map((key) => `${JSON.stringify(key)}:${stableStringify(record[key])}`);
    return `{${pairs.join(',')}}`;
  }

  function valuesEqual(a: unknown, b: unknown): boolean {
    if (a === b) return true;
    const aObj = typeof a === 'object' && a !== null;
    const bObj = typeof b === 'object' && b !== null;
    if (!aObj || !bObj) return false;
    return stableStringify(a) === stableStringify(b);
  }

  function buildStoredSettingsRecord(overrides: SettingsObject | null | undefined): NormalizedSettingsRecord {
    return {
      schemaVersion: SCHEMA_VERSION,
      overrides: overrides || {}
    };
  }

  function isStoredRecordEquivalent(rawRecord: unknown, normalizedRecord: NormalizedSettingsRecord): boolean {
    if (isUnset(rawRecord)) {
      return valuesEqual(normalizedRecord?.overrides || {}, {});
    }
    return valuesEqual(rawRecord, normalizedRecord);
  }

  function getNestedValue(obj: unknown, keyPath: string): unknown {
    const parts = keyPath.split('.');
    let node: unknown = obj;
    for (const part of parts) {
      if (!isPlainObject(node) && !Array.isArray(node)) {
        return undefined;
      }
      if (!(part in node)) {
        return undefined;
      }
      node = (node as SettingsObject)[part];
    }
    return node;
  }

  function setNestedValue(obj: SettingsObject, keyPath: string, value: unknown): void {
    const parts = keyPath.split('.');
    let node: SettingsObject = obj;
    parts.slice(0, -1).forEach((part) => {
      if (!isPlainObject(node[part])) {
        node[part] = {};
      }
      node = node[part] as SettingsObject;
    });
    const leaf = parts.at(-1);
    if (leaf) {
      node[leaf] = value;
    }
  }

  function deleteNestedValue(obj: SettingsObject, keyPath: string): void {
    const parts = keyPath.split('.');
    const stack: Array<{ node: SettingsObject; part: string }> = [];
    let node: SettingsObject = obj;
    for (const part of parts) {
      if (!isPlainObject(node) || !(part in node)) {
        return;
      }
      stack.push({ node, part });
      node = node[part] as SettingsObject;
    }
    const last = stack.pop();
    if (last) {
      delete last.node[last.part];
    }
    for (let i = stack.length - 1; i >= 0; i -= 1) {
      const item = stack[i];
      if (!item) continue;
      const { node: parent, part } = item;
      if (isPlainObject(parent[part]) && Object.keys(parent[part]).length === 0) {
        delete parent[part];
      } else {
        break;
      }
    }
  }

  function pruneCandidateOverrides(candidateOverrides: unknown, schemaNode: SchemaNode, path = ''): SettingsObject | undefined {
    if (!isPlainObject(candidateOverrides)) {
      if (!isUnset(candidateOverrides) && path) {
        logSettingsWarn('Rejected settings overrides because schema expects an object', {
          keyPath: path
        });
      }
      return undefined;
    }

    const result: SettingsObject = {};
    for (const [key, value] of Object.entries(candidateOverrides)) {
      const childNode = schemaNode.children[key];
      const nextPath = path ? `${path}.${key}` : key;
      if (!childNode) {
        logSettingsWarn('Rejected unsupported settings override path', {
          keyPath: nextPath
        });
        continue;
      }
      if (childNode.meta) {
        result[key] = value;
        continue;
      }
      const prunedChild = pruneCandidateOverrides(value, childNode, nextPath);
      if (!isUnset(prunedChild)) {
        result[key] = prunedChild;
      }
    }

    return Object.keys(result).length ? result : undefined;
  }

  function extractCandidateOverrideValue(rawValue: unknown): { value: unknown; usedWrapper: boolean } {
    if (isPlainObject(rawValue) && Object.prototype.hasOwnProperty.call(rawValue, 'value')) {
      return { value: rawValue.value, usedWrapper: true };
    }
    return { value: rawValue, usedWrapper: false };
  }

  function isValidType(value: unknown, expectedType: SettingsLeafType): boolean {
    if (expectedType === 'array') {
      return Array.isArray(value);
    }
    if (expectedType === 'object') {
      return isPlainObject(value);
    }
    if (expectedType === 'number') {
      return typeof value === 'number' && Number.isFinite(value);
    }
    if (expectedType === 'boolean') {
      return typeof value === 'boolean';
    }
    if (expectedType === 'string') {
      return typeof value === 'string';
    }
    return false;
  }

  function getErrorMessage(error: unknown): string {
    if (error instanceof Error && typeof error.message === 'string') {
      return error.message;
    }
    return typeof error === 'string' ? error : 'unknown_error';
  }

  function logSettingsAttempt(message: string, details: SettingsObject = {}): void {
    logInfo(`[settings] Attempting to ${message}`, details);
  }

  function logSettingsSuccess(message: string, details: SettingsObject = {}): void {
    logInfo(`[settings] ${message}`, details);
  }

  function logSettingsWarn(message: string, details: SettingsObject = {}): void {
    logWarn(`[settings] ${message}`, details);
  }

  function logSettingsFailure(message: string, error: unknown, details: SettingsObject = {}): void {
    logError(`[settings] ${message}`, {
      ...details,
      reason: getErrorMessage(error)
    });
  }

  function validateOverrideValue(
    keyPath: string,
    rawValue: unknown,
    meta: SchemaMeta
  ): { valid: true; value: unknown; usedWrapper: boolean } | { valid: false; reason: string; usedWrapper: boolean } {
    const extracted = extractCandidateOverrideValue(rawValue);
    let value = extracted.value;

    if (isUnset(value)) {
      return { valid: false, reason: 'unset', usedWrapper: extracted.usedWrapper };
    }

    if (keyPath === 'urlPicker.alwaysOnTopRecentCount' && typeof value === 'number' && Number.isFinite(value)) {
      const normalized = Math.trunc(value);
      if (normalized < 0) {
        logSettingsWarn('Rejected settings override because value is below minimum', {
          keyPath
        });
        return { valid: false, reason: 'min', usedWrapper: extracted.usedWrapper };
      }
      value = Math.min(10, normalized);
    }

    if (!isValidType(value, meta.type)) {
      logSettingsWarn('Rejected settings override because value type is invalid', {
        keyPath,
        expectedType: meta.type,
        actualType: Array.isArray(value) ? 'array' : typeof value
      });
      return { valid: false, reason: 'type', usedWrapper: extracted.usedWrapper };
    }

    if (Array.isArray(meta.allowedValues) && meta.allowedValues.length > 0) {
      if (!meta.allowedValues.includes(value)) {
        logSettingsWarn('Rejected settings override because value is not allowed', {
          keyPath
        });
        return { valid: false, reason: 'enum', usedWrapper: extracted.usedWrapper };
      }
    }

    if (meta.type === 'number') {
      const numberValue = typeof value === 'number' ? value : Number.NaN;
      if (typeof meta.min === 'number' && numberValue < meta.min) {
        logSettingsWarn('Rejected settings override because value is below minimum', {
          keyPath
        });
        return { valid: false, reason: 'min', usedWrapper: extracted.usedWrapper };
      }
      if (typeof meta.max === 'number' && numberValue > meta.max) {
        logSettingsWarn('Rejected settings override because value exceeds maximum', {
          keyPath
        });
        return { valid: false, reason: 'max', usedWrapper: extracted.usedWrapper };
      }
    }

    return { valid: true, value, usedWrapper: extracted.usedWrapper };
  }

  function computeMinimalOverrides(candidateOverrides: SettingsObject): SettingsObject {
    const overrides: SettingsObject = {};
    for (const [keyPath, meta] of schemaIndex.metaByKeyPath.entries()) {
      const rawValue = getNestedValue(candidateOverrides, keyPath);
      if (isUnset(rawValue)) {
        continue;
      }
      const validation = validateOverrideValue(keyPath, rawValue, meta);
      if (!validation.valid) {
        if (validation.usedWrapper) {
          logSettingsWarn('Rejected wrapper settings override', {
            keyPath
          });
        }
        continue;
      }
      if (valuesEqual(validation.value, meta.defaultValue)) {
        logDebug('[LP Settings] Dropping override equal to default for', keyPath);
        continue;
      }
      setNestedValue(overrides, keyPath, deepClone(validation.value));
    }
    return overrides;
  }

  function buildEffectiveDocument(defaultDoc: SettingsDocument, overrides: SettingsObject): SettingsDocument {
    const doc = deepClone(defaultDoc);
    for (const category of doc.categories || []) {
      for (const setting of category.settings || []) {
        if (!setting?.keyPath) {
          continue;
        }
        const overrideValue = getNestedValue(overrides, setting.keyPath);
        setting.value = isUnset(overrideValue) ? null : deepClone(overrideValue);
      }
    }
    return doc;
  }

  function computeOverridesFromEffectiveDoc(doc: SettingsDocument): SettingsObject {
    const overrides: SettingsObject = {};
    for (const [keyPath, meta] of schemaIndex.metaByKeyPath.entries()) {
      const setting = findSetting(doc, keyPath);
      const effectiveValue = setting
        ? (isUnset(setting.value) ? setting.defaultValue : setting.value)
        : meta.defaultValue;
      if (isUnset(effectiveValue)) {
        continue;
      }
      const validation = validateOverrideValue(keyPath, effectiveValue, meta);
      if (!validation.valid) {
        logSettingsWarn('Rejected invalid effective settings value', {
          keyPath
        });
        continue;
      }
      if (!valuesEqual(validation.value, meta.defaultValue)) {
        setNestedValue(overrides, keyPath, deepClone(validation.value));
      }
    }
    return overrides;
  }

  function isNewFormatRecord(record: unknown): record is SettingsObject & { schemaVersion: unknown; overrides?: unknown } {
    return isPlainObject(record) && Object.prototype.hasOwnProperty.call(record, 'schemaVersion');
  }

  async function loadStoredRecord(): Promise<unknown> {
    const stored = await chrome.storage.local.get(SETTINGS_STORAGE_KEY);
    return stored?.[SETTINGS_STORAGE_KEY];
  }

  function extractOverridesFromLegacy(rawRecord: unknown): SettingsObject {
    if (!rawRecord) {
      return {};
    }
    if (isPlainObject(rawRecord) && Array.isArray(rawRecord.categories)) {
      logSettingsAttempt('migrate legacy settings document overrides', {
        format: 'legacy_document'
      });
      const overrides = {};
      for (const category of rawRecord.categories || []) {
        for (const setting of category.settings || []) {
          if (!setting?.keyPath) {
            continue;
          }
          if (!isUnset(setting.value)) {
            setNestedValue(overrides, setting.keyPath, deepClone(setting.value));
          }
        }
      }
      logSettingsSuccess('Migrated legacy settings document overrides', {
        format: 'legacy_document'
      });
      return overrides;
    }
    if (isPlainObject(rawRecord)) {
      logSettingsAttempt('migrate legacy settings overrides object', {
        format: 'legacy_overrides'
      });
      return rawRecord;
    }
    logSettingsWarn('Rejected unsupported legacy settings format');
    return {};
  }

  function migrateLegacyOverrides(candidateOverrides: unknown): SettingsObject {
    if (!isPlainObject(candidateOverrides)) {
      return {};
    }
    const migrated = deepClone(candidateOverrides);
    const legacyBookmarksManager = getNestedValue(migrated, 'bookmarks.enableBookmarksManagerButtons');
    const nextBookmarksManager = getNestedValue(migrated, 'openTools.showBookmarksManager');
    if (!isUnset(legacyBookmarksManager) && isUnset(nextBookmarksManager)) {
      setNestedValue(migrated, 'openTools.showBookmarksManager', deepClone(legacyBookmarksManager));
      logSettingsSuccess('Migrated legacy bookmarks manager setting path', {
        from: 'bookmarks.enableBookmarksManagerButtons',
        to: 'openTools.showBookmarksManager'
      });
    }
    deleteNestedValue(migrated, 'bookmarks.enableBookmarksManagerButtons');
    return migrated;
  }

  function normalizeStoredRecord(rawRecord: unknown): NormalizedStoredSettings {
    let candidateOverrides: SettingsObject = {};
    let isLegacy = false;
    let schemaVersion: unknown = null;
    let invalidOverridesRecord = false;

    if (isNewFormatRecord(rawRecord)) {
      schemaVersion = rawRecord.schemaVersion;
      if (!isPlainObject(rawRecord.overrides)) {
        logSettingsWarn('Rejected invalid settings overrides record');
        candidateOverrides = {};
        invalidOverridesRecord = true;
      } else {
        candidateOverrides = rawRecord.overrides;
      }
    } else if (!isUnset(rawRecord)) {
      isLegacy = true;
      candidateOverrides = extractOverridesFromLegacy(rawRecord);
    }

    candidateOverrides = migrateLegacyOverrides(candidateOverrides);
    const pruned = pruneCandidateOverrides(candidateOverrides, schemaIndex.tree) || {};
    const minimalOverrides = computeMinimalOverrides(pruned);
    const effectiveDoc = buildEffectiveDocument(DEFAULT_SETTINGS_DOCUMENT, minimalOverrides);

    let changed = false;
    if (isLegacy || invalidOverridesRecord) {
      changed = true;
    }
    if (!isUnset(schemaVersion) && schemaVersion !== SCHEMA_VERSION) {
      logSettingsWarn('Settings schema version mismatch; normalized overrides will be persisted', {
        previousVersion: schemaVersion,
        nextVersion: SCHEMA_VERSION
      });
      changed = true;
    }
    if (isNewFormatRecord(rawRecord)) {
      const rawOverrides = isPlainObject(rawRecord.overrides) ? rawRecord.overrides : {};
      if (!valuesEqual(rawOverrides, minimalOverrides)) {
        logSettingsSuccess('Normalized settings overrides diff during load');
        changed = true;
      }
    }

    const normalizedRecord = buildStoredSettingsRecord(minimalOverrides);
    if (!isUnset(rawRecord) && !isStoredRecordEquivalent(rawRecord, normalizedRecord)) {
      changed = true;
    }

    return { effectiveDoc, overrides: minimalOverrides, normalizedRecord, changed };
  }

  async function saveOverrides(overrides: SettingsObject, reason = 'update'): Promise<SettingsDocument> {
    logSettingsAttempt('persist settings overrides', {
      reason
    });
    const normalizedOverrides = computeMinimalOverrides(
      pruneCandidateOverrides(overrides || {}, schemaIndex.tree) || {}
    );
    const record = buildStoredSettingsRecord(normalizedOverrides);
    const nextDoc = buildEffectiveDocument(DEFAULT_SETTINGS_DOCUMENT, normalizedOverrides);
    if (state.cachedRecord && isStoredRecordEquivalent(state.cachedRecord, record)) {
      state.cachedRecord = deepClone(record);
      state.cachedOverrides = deepClone(normalizedOverrides);
      state.cachedDoc = nextDoc;
      logSettingsSuccess('Skipped settings override persist because cache already matches', {
        reason
      });
      return state.cachedDoc;
    }
    const storedRecord = await loadStoredRecord();
    if (isStoredRecordEquivalent(storedRecord, record)) {
      state.cachedRecord = deepClone(record);
      state.cachedOverrides = deepClone(normalizedOverrides);
      state.cachedDoc = nextDoc;
      logSettingsSuccess('Skipped settings override persist because storage already matches', {
        reason
      });
      return state.cachedDoc;
    }
    try {
      await chrome.storage.local.set({ [SETTINGS_STORAGE_KEY]: record });
      state.cachedRecord = deepClone(record);
      state.cachedOverrides = deepClone(normalizedOverrides);
      state.cachedDoc = nextDoc;
      logSettingsSuccess('Persisted settings overrides', {
        reason,
        overrideCount: Object.keys(normalizedOverrides).length
      });
      return state.cachedDoc;
    } catch (error) {
      logSettingsFailure('Failed to persist settings overrides', error, {
        reason
      });
      throw error;
    }
  }

  async function saveSettingsDocument(doc: SettingsDocument): Promise<SettingsDocument> {
    const overrides = computeOverridesFromEffectiveDoc(doc);
    return saveOverrides(overrides, 'saveSettingsDocument');
  }

  async function loadSettingsDocument(forceRefresh = false): Promise<SettingsDocument> {
    logSettingsAttempt('load settings document', {
      forceRefresh
    });
    if (state.cachedDoc && !forceRefresh) {
      logSettingsSuccess('Loaded settings document from cache', {
        forceRefresh
      });
      return state.cachedDoc;
    }
    if (state.loadingPromise && !forceRefresh) {
      logSettingsSuccess('Joined in-flight settings document load', {
        forceRefresh
      });
      return state.loadingPromise;
    }

    state.loadingPromise = (async () => {
      try {
        const rawRecord = await loadStoredRecord();
        const { effectiveDoc, overrides, normalizedRecord, changed } = normalizeStoredRecord(rawRecord);
        state.cachedDoc = effectiveDoc;
        state.cachedOverrides = deepClone(overrides);
        if (changed) {
          state.cachedRecord = null;
          await saveOverrides(overrides, 'loadSettingsDocument');
        } else {
          state.cachedRecord = deepClone(normalizedRecord);
        }
        logSettingsSuccess('Loaded settings document from storage', {
          forceRefresh,
          changed
        });
        return state.cachedDoc;
      } catch (error) {
        logSettingsFailure('Failed to load settings document', error, {
          forceRefresh
        });
        throw error;
      } finally {
        state.loadingPromise = null;
      }
    })();

    return state.loadingPromise;
  }

  function findSetting(doc: SettingsObject | null | undefined, keyPath: string): SettingDefinition | null {
    const categories = Array.isArray(doc?.categories) ? doc.categories as SettingsCategory[] : null;
    if (!categories) return null;
    for (const category of categories) {
      for (const setting of category.settings || []) {
        if (setting.keyPath === keyPath) {
          return setting;
        }
      }
    }
    return null;
  }

  function getEffectiveValue(doc: SettingsObject | null | undefined, keyPath: string): unknown {
    const setting = findSetting(doc, keyPath);
    if (!setting) return undefined;
    return isUnset(setting.value) ? setting.defaultValue : setting.value;
  }

  async function setSetting(keyPath: string, value: unknown): Promise<unknown> {
    logSettingsAttempt('apply setting change', {
      keyPath,
      isResetToDefault: isUnset(value)
    });
    const meta = schemaIndex.metaByKeyPath.get(keyPath);
    if (!meta) {
      logSettingsWarn('Rejected setting change because setting is unknown', {
        keyPath
      });
      throw new Error(`Unknown setting: ${keyPath}`);
    }

    const validation = validateOverrideValue(keyPath, value, meta);
    if (!validation.valid && !isUnset(value)) {
      logSettingsWarn('Rejected invalid setting change', {
        keyPath
      });
      return meta.defaultValue;
    }

    const rawRecord = await loadStoredRecord();
    const normalized = normalizeStoredRecord(rawRecord);
    const nextOverrides = deepClone(normalized.overrides || {});

    const normalizedValue = validation.valid ? validation.value : value;

    if (isUnset(normalizedValue) || valuesEqual(normalizedValue, meta.defaultValue)) {
      deleteNestedValue(nextOverrides, keyPath);
    } else {
      setNestedValue(nextOverrides, keyPath, deepClone(normalizedValue));
    }

    const minimalOverrides = computeMinimalOverrides(nextOverrides);
    if (valuesEqual(minimalOverrides, normalized.overrides || {})) {
      state.cachedRecord = deepClone(normalized.normalizedRecord);
      state.cachedOverrides = deepClone(normalized.overrides || {});
      state.cachedDoc = normalized.effectiveDoc;
      logSettingsSuccess('Skipped setting change because effective value is unchanged', {
        keyPath
      });
      return getEffectiveValue(state.cachedDoc, keyPath);
    }
    await saveOverrides(minimalOverrides, 'setSetting');
    logSettingsSuccess('Applied setting change', {
      keyPath,
      loggingLevelChanged: keyPath === 'logging.level'
    });
    return getEffectiveValue(state.cachedDoc, keyPath);
  }

  async function getSetting(keyPath: string): Promise<unknown> {
    const doc = await loadSettingsDocument();
    return getEffectiveValue(doc, keyPath);
  }

  async function resetAllSettings(): Promise<SettingsDocument | null> {
    logSettingsAttempt('reset all settings');
    const rawRecord = await loadStoredRecord();
    const normalized = normalizeStoredRecord(rawRecord);
    if (valuesEqual(normalized.overrides || {}, {})) {
      state.cachedRecord = deepClone(normalized.normalizedRecord);
      state.cachedOverrides = deepClone(normalized.overrides || {});
      state.cachedDoc = normalized.effectiveDoc;
      logSettingsSuccess('Skipped resetting all settings because overrides are already empty');
      return state.cachedDoc;
    }
    await saveOverrides({}, 'resetAllSettings');
    logSettingsSuccess('Reset all settings');
    return state.cachedDoc;
  }

  async function resetSetting(keyPath: string): Promise<unknown> {
    logSettingsAttempt('reset setting to default', {
      keyPath
    });
    const meta = schemaIndex.metaByKeyPath.get(keyPath);
    if (!meta) {
      logSettingsWarn('Rejected setting reset because setting is unknown', {
        keyPath
      });
      throw new Error(`Unknown setting: ${keyPath}`);
    }
    const rawRecord = await loadStoredRecord();
    const normalized = normalizeStoredRecord(rawRecord);
    const nextOverrides = deepClone(normalized.overrides || {});
    deleteNestedValue(nextOverrides, keyPath);
    const minimalOverrides = computeMinimalOverrides(nextOverrides);
    if (valuesEqual(minimalOverrides, normalized.overrides || {})) {
      state.cachedRecord = deepClone(normalized.normalizedRecord);
      state.cachedOverrides = deepClone(normalized.overrides || {});
      state.cachedDoc = normalized.effectiveDoc;
      logSettingsSuccess('Skipped setting reset because setting is already at default', {
        keyPath
      });
      return getEffectiveValue(state.cachedDoc, keyPath);
    }
    await saveOverrides(minimalOverrides, 'resetSetting');
    logSettingsSuccess('Reset setting to default', {
      keyPath
    });
    return getEffectiveValue(state.cachedDoc, keyPath);
  }

  const LOG_LEVELS = {
    debug: 10,
    informational: 20,
    warning: 30,
    error: 40
  };

  const logState: {
    level: keyof typeof LOG_LEVELS;
    initPromise: Promise<keyof typeof LOG_LEVELS> | null;
    listenerAttached: boolean;
  } = {
    level: 'error',
    initPromise: null,
    listenerAttached: false
  };

  function normalizeLogLevel(level: unknown): keyof typeof LOG_LEVELS {
    if (typeof level !== 'string') {
      return 'error';
    }
    return level in LOG_LEVELS ? level as keyof typeof LOG_LEVELS : 'error';
  }

  function setLogLevel(level: unknown): keyof typeof LOG_LEVELS {
    logState.level = normalizeLogLevel(level);
    return logState.level;
  }

  function shouldLog(level: unknown): boolean {
    const target = LOG_LEVELS[normalizeLogLevel(level)];
    const current = LOG_LEVELS[normalizeLogLevel(logState.level)];
    return target >= current;
  }

  function setLogLevelFromDocument(doc: SettingsObject | null | undefined): keyof typeof LOG_LEVELS {
    if (!doc) {
      return setLogLevel('error');
    }
    return setLogLevel(getEffectiveValue(doc, 'logging.level'));
  }

  function attachLogLevelListener(): void {
    if (logState.listenerAttached) {
      return;
    }
    if (typeof chrome === 'undefined' || !chrome.storage || !chrome.storage.onChanged) {
      return;
    }
    logState.listenerAttached = true;
    chrome.storage.onChanged.addListener((changes, area) => {
      if (area !== 'local' || !changes[SETTINGS_STORAGE_KEY]) {
        return;
      }
      const nextRecord = changes[SETTINGS_STORAGE_KEY].newValue;
      if (nextRecord) {
        const normalized = normalizeStoredRecord(nextRecord);
        state.cachedRecord = deepClone(normalized.normalizedRecord);
        state.cachedOverrides = deepClone(normalized.overrides || {});
        state.cachedDoc = normalized.effectiveDoc;
        setLogLevelFromDocument(normalized.effectiveDoc);
        return;
      }
      loadSettingsDocument(true).then(setLogLevelFromDocument).catch(() => {
        setLogLevel('error');
      });
    });
  }

  async function initLogLevel(): Promise<keyof typeof LOG_LEVELS> {
    if (logState.initPromise) {
      return logState.initPromise;
    }
    logState.initPromise = (async () => {
      try {
        const doc = await loadSettingsDocument();
        setLogLevelFromDocument(doc);
      } catch (error) {
        setLogLevel('error');
      }
      attachLogLevelListener();
      return logState.level;
    })();
    return logState.initPromise;
  }

  function logDebug(...args: unknown[]): void {
    if (shouldLog('debug')) {
      console.log(...args);
    }
  }

  function logInfo(...args: unknown[]): void {
    if (shouldLog('informational')) {
      console.log(...args);
    }
  }

  function logWarn(...args: unknown[]): void {
    if (shouldLog('warning')) {
      console.warn(...args);
    }
  }

  function logError(...args: unknown[]): void {
    if (shouldLog('error')) {
      console.error(...args);
    }
  }

  global.lpSettings = {
    loadSettingsDocument,
    saveSettingsDocument,
    getSetting,
    setSetting,
    resetAllSettings,
    resetSetting,
    getEffectiveValue,
    findSetting,
    getDefaultDocument: () => deepClone(DEFAULT_SETTINGS_DOCUMENT),
    SETTINGS_STORAGE_KEY,
    isUnset
  };

  global.lpLog = {
    initFromSettings: initLogLevel,
    setLevel: setLogLevel,
    getLevel: () => logState.level,
    setLevelFromSettingsDocument: setLogLevelFromDocument,
    debug: logDebug,
    info: logInfo,
    warn: logWarn,
    error: logError
  };
})(globalThis);
