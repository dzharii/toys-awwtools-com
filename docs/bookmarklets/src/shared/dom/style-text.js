/**
 * Inserts or updates a scoped style block so bookmarklet UI styling remains centralized and repeatable.
 */
export function upsertStyle(root, styleId, cssText) {
  if (!root) {
    throw new Error("upsertStyle requires a ShadowRoot");
  }

  if (!styleId) {
    throw new Error("upsertStyle requires a styleId");
  }

  let style = root.querySelector(`style[data-style-id="${styleId}"]`);

  if (!style) {
    style = document.createElement("style");
    style.dataset.styleId = styleId;
    root.appendChild(style);
  }

  style.textContent = cssText;
  return style;
}
