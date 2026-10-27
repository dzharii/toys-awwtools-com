import { expect } from "@playwright/test";
import type { GuidedApp } from "../framework/guided-app";
import { PersistDocument } from "./persist-document.flow";

export class ResolveDocumentConflict {
  constructor(
    private readonly winner: GuidedApp,
    private readonly stale: GuidedApp,
  ) {}

  async run(
    title: string,
    winningAnswer: string,
    localAnswer: string,
    resolution: "copy" | "latest",
  ): Promise<void> {
    await this.stale.documents().selectField("tool");
    await this.stale.fieldEditor().enterAnswer(localAnswer);
    await this.winner.documents().selectField("tool");
    await this.winner.fieldEditor().enterAnswer(winningAnswer);
    await new PersistDocument(
      this.winner.documents(),
      this.winner.navigation(),
      this.winner.settings(),
    ).run(title);
    await this.stale.settings().open();
    await this.stale.navigation().selectDocument(title);
    await expect(this.stale.documents().saveStatus).toHaveText("Save conflict");
    await expect(this.stale.fieldEditor().answer.locator).toHaveValue(localAnswer);
    await expect(this.winner.fieldEditor().answer.locator).toHaveValue(winningAnswer);
    if (resolution === "copy") {
      await this.stale.panels().preserveLocalCopy();
      await this.stale.documents().expectSaved();
      await expect(this.stale.documents().title).toHaveText(`${title} (local copy)`);
      await this.stale.documents().selectField("tool");
      await expect(this.stale.fieldEditor().answer.locator).toHaveValue(localAnswer);
      await expect(this.stale.navigation().row(title)).toBeVisible();
    } else {
      await this.stale.panels().reopenLatest();
      await this.stale.confirmation.expectIdentity("Your unsaved local changes");
      await this.stale.confirmation.confirm();
      await this.stale.documents().expectSaved();
      await this.stale.documents().selectField("tool");
      await expect(this.stale.fieldEditor().answer.locator).toHaveValue(winningAnswer);
    }
  }
}
