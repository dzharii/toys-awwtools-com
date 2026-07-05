export function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export function hasBooleanAttribute(element, name) {
  return element.hasAttribute(name) && element.getAttribute(name) !== "false";
}

export function defineComponent(tagName, ComponentClass) {
  if (!customElements.get(tagName)) {
    customElements.define(tagName, ComponentClass);
  }
}

export function getInitialText(element) {
  if (!element.dataset.initialText) {
    element.dataset.initialText = element.textContent.trim();
  }

  return element.dataset.initialText;
}
