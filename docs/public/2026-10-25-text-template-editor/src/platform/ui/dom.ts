/** Small DOM builders adapted from the reference UI; user values are always text nodes. */
export function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  className = "",
  ...children: (Node | string)[]
): HTMLElementTagNameMap[K] {
  const element = document.createElement(tag);
  if (className) element.className = className;
  element.append(...children);
  return element;
}
export function button(
  text: string,
  action: () => void,
  className = "",
  testId?: string,
): HTMLButtonElement {
  const element = el("button", className, text);
  element.type = "button";
  if (testId) element.dataset.testid = testId;
  element.addEventListener("click", action);
  return element;
}
export function emit(target: HTMLElement, name: string, detail?: unknown): void {
  target.dispatchEvent(new CustomEvent(name, { detail, bubbles: true, composed: true }));
}
export const sharedStyles = `
  :host { color:var(--text); font:inherit; box-sizing:border-box; }
  * { box-sizing:border-box; }
  button,input,select,textarea { font:inherit; color:inherit; }
  button { cursor:pointer; }
  button:disabled { cursor:default; opacity:.45; }
  :focus-visible { outline:2px solid var(--focus); outline-offset:3px; }
  input,textarea,select { min-width:0; background:var(--input); border:1px solid var(--line); border-radius:8px; padding:10px 12px; }
  button { border:0; background:transparent; border-radius:8px; }
  p { margin:0 0 14px; }
  .muted { color:var(--muted); }
  .small { font-size:12px; line-height:1.6; }
  .label { font-size:10px; text-transform:uppercase; letter-spacing:.13em; color:var(--muted); font-weight:650; }
  .action { border:1px solid var(--line); padding:7px 11px; font-size:12px; }
  .action:hover { background:var(--surface); }
  [hidden] { display:none!important; }
`;
export function shadow(element: HTMLElement, styles: string): ShadowRoot {
  const root = element.attachShadow({ mode: "open" });
  root.append(el("style", "", sharedStyles + styles));
  return root;
}
export function labeledControl(label: string, control: HTMLElement, help?: string): HTMLElement {
  const wrapper = el("label", "field-label", el("span", "", label), control);
  if (help) wrapper.append(el("span", "muted small", help));
  return wrapper;
}
