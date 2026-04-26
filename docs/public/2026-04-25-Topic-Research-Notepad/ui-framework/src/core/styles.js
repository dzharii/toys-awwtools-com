const canAdoptSheets =
  typeof ShadowRoot !== "undefined" &&
  "adoptedStyleSheets" in ShadowRoot.prototype &&
  typeof CSSStyleSheet !== "undefined" &&
  "replaceSync" in CSSStyleSheet.prototype;

const sheetCache = new Map();
const textCache = new Map();

function hashStyle(text) {
  let hash = 0;
  for (let i = 0; i < text.length; i += 1) {
    hash = (hash * 31 + text.charCodeAt(i)) | 0;
  }
  return `s${Math.abs(hash)}`;
}

function getSheet(text) {
  let sheet = sheetCache.get(text);
  if (!sheet) {
    sheet = new CSSStyleSheet();
    sheet.replaceSync(text);
    sheetCache.set(text, sheet);
  }
  return sheet;
}

function ensureStyleTag(shadowRoot, text) {
  const key = hashStyle(text);
  if (shadowRoot.querySelector(`style[data-aww-style='${key}']`)) return;

  const style = document.createElement("style");
  style.dataset.awwStyle = key;
  style.textContent = text;
  shadowRoot.append(style);
}

export function adoptStyles(shadowRoot, styleTexts) {
  if (canAdoptSheets) {
    const adopted = shadowRoot.adoptedStyleSheets;
    const next = [...adopted];

    for (const text of styleTexts) {
      const sheet = getSheet(text);
      if (!next.includes(sheet)) next.push(sheet);
    }

    shadowRoot.adoptedStyleSheets = next;
    return;
  }

  for (const text of styleTexts) ensureStyleTag(shadowRoot, text);
}

export function css(strings, ...values) {
  let output = "";
  for (let i = 0; i < strings.length; i += 1) {
    output += strings[i];
    if (i < values.length) output += String(values[i] ?? "");
  }

  if (!textCache.has(output)) textCache.set(output, output);
  return textCache.get(output);
}

export const BASE_COMPONENT_STYLES = css`
  @layer reset, tokens, base, components, states, utilities;

  @layer reset {
    :host {
      box-sizing: border-box;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      font-size: 13px;
      color: var(--awwbookmarklet-input-fg, #111720);
      text-rendering: optimizeLegibility;
    }

    *,
    *::before,
    *::after {
      box-sizing: inherit;
    }
  }

  @layer base {
    :host([hidden]) {
      display: none !important;
    }

    :host {
      --_ring: 0 0 0 var(--awwbookmarklet-focus-ring-width, 2px) var(--awwbookmarklet-focus-ring, #154fbc);
      --_control-radius: var(--awwbookmarklet-radius-control, 0);
      --_surface-radius: var(--awwbookmarklet-radius-surface, 0);
      --_control-border-width: var(--awwbookmarklet-border-width-control, 1px);
      --_surface-border-width: var(--awwbookmarklet-border-width-surface, 1px);
    }

    ::selection {
      background: var(--awwbookmarklet-selection-bg, #1f5eae);
      color: var(--awwbookmarklet-selection-fg, #f2f8ff);
    }
  }
`;
