import { button, el, emit } from "../../../platform/ui/dom";
import type { TemplateDefinition } from "../model";
import { structuralExcerpt } from "../samples";

export class VersionPicker extends HTMLElement {
  private group = el("fieldset", "version-tiles");
  readonly select = el("select", "style-select");
  private source = "";
  private committed = "";
  private name = crypto.randomUUID();
  private confirm = button(
    "Use this writing style",
    () => emit(this, "template-version-select", this.select.value),
    "secondary",
    "guided-templates-version-button-confirm",
  );
  constructor() {
    super();
    this.select.dataset.testid = "guided-templates-version-select-writing-style";
    this.select.setAttribute("aria-label", "Writing style");
    this.group.dataset.testid = "guided-templates-version-group-writing-style";
    this.append(this.group, this.select, this.confirm);
  }
  update(template: TemplateDefinition, selected: string, disabled: boolean): void {
    this.dataset.count = String(template.versions.length);
    this.dataset.many = String(template.versions.length > 6);
    if (this.source !== template.source) {
      this.source = template.source;
      this.committed = "";
      this.select.replaceChildren();
      this.group.replaceChildren(el("legend", "eyebrow", "Writing style"));
      for (const version of template.versions) {
        const option = el("option", "", version.name);
        option.value = version.id;
        this.select.append(option);
        const radio = el("input");
        radio.type = "radio";
        radio.name = this.name;
        radio.value = version.id;
        radio.dataset.testid = "guided-templates-version-radio-style";
        radio.dataset.versionId = version.id;
        radio.addEventListener("change", () => {
          if (radio.checked) this.select.value = version.id;
        });
        const description = el("span", "version-excerpt", structuralExcerpt(version));
        description.id = `version-${this.name}-${version.id}`;
        radio.setAttribute("aria-label", version.name);
        radio.setAttribute("aria-describedby", description.id);
        this.group.append(
          el(
            "label",
            "version-tile",
            radio,
            el("span", "", el("strong", "", version.name), description),
          ),
        );
      }
    }
    if (this.committed !== selected || !this.committed) {
      this.committed = selected;
      this.resetSelection();
    }
    this.select.disabled = disabled;
    this.group.disabled = disabled;
    this.confirm.disabled = disabled;
  }
  resetSelection(): void {
    this.select.value = this.committed;
    for (const radio of this.group.querySelectorAll<HTMLInputElement>("input"))
      radio.checked = radio.value === this.committed;
  }
}
customElements.define("gtl-version-picker", VersionPicker);
