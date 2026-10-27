import { expect } from "@playwright/test";
import type { DocumentWorkspacePage } from "../page-objects/document-workspace.page";
import type { TemplateCatalogPage } from "../page-objects/template-catalog.page";
import type { FieldEditorPage } from "../page-objects/field-editor.page";

export class CreateGuidedDocument {
  constructor(
    private readonly documents: DocumentWorkspacePage,
    private readonly templates: TemplateCatalogPage,
    private readonly editor: FieldEditorPage,
  ) {}

  async run(example: {
    template: string;
    style: string;
    answers: readonly (readonly [string, string])[];
    text: string;
  }): Promise<void> {
    await this.templates.selectTemplate(example.template);
    await this.documents.selectWritingStyle(example.style);
    for (const [name, value] of example.answers) {
      await this.documents.selectField(name);
      await this.editor.expectField(name);
      await this.editor.enterAnswer(value);
    }
    await expect(this.documents.result).toHaveText(example.text);
    await expect(this.documents.copyButton).toBeEnabled();
  }
}
