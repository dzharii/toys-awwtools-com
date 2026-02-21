export function createUiAdapter({ doc = document } = {}) {
  function setText(el, text) {
    if (!el) return;
    el.textContent = text;
  }

  function setHtml(el, html) {
    if (!el) return;
    el.innerHTML = html;
  }

  function toggleClass(el, className, enabled) {
    if (!el) return;
    el.classList.toggle(className, !!enabled);
  }

  function show(el) {
    toggleClass(el, "hidden", false);
  }

  function hide(el) {
    toggleClass(el, "hidden", true);
  }

  function setDisabled(el, disabled) {
    if (!el) return;
    el.disabled = !!disabled;
  }

  return {
    doc,
    setText,
    setHtml,
    toggleClass,
    show,
    hide,
    setDisabled
  };
}
