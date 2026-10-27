/** Controls are generated from schema metadata, including labels and validation. */
import { el, emit, shadow } from "../../../platform/ui/dom";
import { settingsSchema } from "../schema";
import type { Settings } from "../schema";
export class SettingsPage extends HTMLElement {
  private root = shadow(
    this,
    `
    :host{display:block}.category{margin:32px 0 40px}.category h2{font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:var(--accent);font-weight:600;border-bottom:1px solid var(--line);padding-bottom:13px}
    .setting{display:grid;grid-template-columns:minmax(0,1fr) 180px;gap:25px;padding:19px 0;align-items:center;border-bottom:1px solid var(--line-soft)}
    .title{display:block;font-size:14px;margin-bottom:5px}.description{display:block;color:var(--muted);font-size:12px;line-height:1.8}
    select,input{width:100%;font-size:12px}input[type=checkbox]{width:18px;height:18px;accent-color:var(--accent);justify-self:end}
    .error{display:block;color:var(--danger);font-size:12px;margin-top:5px}
    @media(max-width:600px){.setting{grid-template-columns:minmax(0,1fr);gap:12px}.setting input[type=checkbox]{justify-self:start}}
  `,
  );
  private controls = new Map<keyof Settings, HTMLInputElement | HTMLSelectElement>();
  constructor(private compact = false) {
    super();
    const definitions = settingsSchema.filter(
      (item) =>
        !compact ||
        ["theme", "density", "browserSuggestions", "documentTextSize", "fieldTextSize"].includes(
          item.id,
        ),
    );
    for (const category of new Set(definitions.map((item) => item.category))) {
      const section = el("section", "category", el("h2", "", category));
      for (const definition of definitions.filter((item) => item.category === category)) {
        const id = `setting-${compact ? "compact-" : ""}${definition.id}`;
        const label = el(
          "label",
          "",
          el("span", "title", definition.title),
          el("span", "description", definition.description),
        );
        label.htmlFor = id;
        const control = definition.control === "select" ? el("select") : el("input");
        control.id = id;
        const name = definition.id.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
        control.dataset.testid = `guided-settings-${compact ? "compact" : "main"}-${definition.control === "select" ? "select" : "input"}-${name}`;
        control.setAttribute("aria-label", definition.title);
        if (control instanceof HTMLInputElement) {
          control.type = definition.control === "checkbox" ? "checkbox" : "number";
          if (definition.control === "number") control.required = true;
          if (definition.min !== undefined) control.min = String(definition.min);
          if (definition.max !== undefined) control.max = String(definition.max);
          control.step = "1";
        } else {
          for (const option of definition.options ?? []) {
            const node = el("option", "", option.label);
            node.value = option.value;
            control.append(node);
          }
        }
        const error = el("span", "error");
        error.id = `${id}-error`;
        error.dataset.testid = "guided-settings-main-status-validation";
        control.setAttribute("aria-describedby", error.id);
        control.addEventListener("change", () => {
          if (!control.checkValidity()) {
            error.textContent = `Enter a whole number from ${definition.min} to ${definition.max}.`;
            control.setAttribute("aria-invalid", "true");
            return;
          }
          error.textContent = "";
          control.removeAttribute("aria-invalid");
          const value =
            control instanceof HTMLInputElement && control.type === "checkbox"
              ? control.checked
              : definition.control === "number"
                ? Number(control.value)
                : control.value;
          emit(this, "setting-change", { id: definition.id, value });
        });
        this.controls.set(definition.id, control);
        section.append(el("div", "setting", label, el("div", "", control, error)));
      }
      this.root.append(section);
    }
  }
  connectedCallback(): void {
    this.dataset.testid = `guided-settings-${this.compact ? "compact" : "main"}-panel-root`;
  }
  update(settings: Settings): void {
    for (const [id, control] of this.controls) {
      if (control instanceof HTMLInputElement && control.type === "checkbox")
        control.checked = Boolean(settings[id]);
      else control.value = String(settings[id]);
    }
  }
}
customElements.define("gtl-settings-page", SettingsPage);
