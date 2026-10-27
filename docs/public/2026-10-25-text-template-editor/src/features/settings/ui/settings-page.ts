/** Controls are generated from schema metadata, including labels and validation. */
import { el, emit, shadow } from "../../../platform/ui/dom";
import { settingsSchema } from "../schema";
import type { Settings } from "../schema";
export class SettingsPage extends HTMLElement {
  private root = shadow(
    this,
    `
    :host{display:block;container-type:inline-size}.category{margin:24px 0 32px}.category h2{font-size:12px;letter-spacing:.1em;text-transform:uppercase;color:var(--accent);font-weight:600;border-bottom:1px solid var(--line);padding-bottom:13px}
    .setting{display:grid;grid-template-columns:minmax(0,1fr) 180px;gap:4px 24px;padding:19px 0;align-items:center;border-bottom:1px solid var(--line-soft)}
    label{grid-column:1;grid-row:1;min-height:28px;padding:3px 0}.title{display:block;font-size:14px}
    .description{grid-column:1;grid-row:2;margin:0;color:var(--muted);font-size:12px;line-height:1.6;overflow-wrap:anywhere}
    .control{grid-column:2;grid-row:1 / 3}
    select,input{width:100%;font-size:13px;min-height:40px}input[type=checkbox]{width:24px;height:24px;min-height:24px;accent-color:var(--accent)}
    .error{display:block;color:var(--danger);font-size:12px;margin-top:5px}
    details{margin-top:8px}summary{cursor:pointer;min-height:24px}
    @container(max-width:650px){.description{grid-column:1 / -1}.control{grid-row:1}.setting{grid-template-columns:minmax(0,1fr) minmax(130px,180px)}}
    @container(max-width:450px){.setting{grid-template-columns:minmax(0,1fr);gap:8px}.control{grid-column:1;grid-row:2}.description{grid-row:3}}
  `,
  );
  private controls = new Map<keyof Settings, HTMLInputElement | HTMLSelectElement>();
  constructor(private compact = false) {
    super();
    const definitions = settingsSchema.filter(
      (item) =>
        !compact ||
        [
          "theme",
          "background",
          "density",
          "browserSuggestions",
          "documentTextSize",
          "fieldTextSize",
        ].includes(item.id),
    );
    for (const category of new Set(definitions.map((item) => item.category))) {
      const section = el("section", "category", el("h2", "", category));
      for (const definition of definitions.filter((item) => item.category === category)) {
        const id = `setting-${compact ? "compact-" : ""}${definition.id}`;
        const label = el("label", "", el("span", "title", definition.title));
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
        const description = el("div", "description", definition.description);
        description.id = `${id}-description`;
        if (definition.help)
          description.append(
            el(
              "details",
              "",
              el("summary", "", "Browser limitations"),
              el("p", "", definition.help),
            ),
          );
        control.setAttribute("aria-describedby", `${description.id} ${error.id}`);
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
        section.append(
          el("div", "setting", label, el("div", "control", control, error), description),
        );
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
