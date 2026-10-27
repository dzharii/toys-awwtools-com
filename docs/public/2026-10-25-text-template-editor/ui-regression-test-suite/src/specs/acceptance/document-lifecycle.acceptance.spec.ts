import { test, expect } from "../../framework/guided-test";
import { PersistDocument } from "../../flows/persist-document.flow";
import { BrowserState } from "../../support/browser-state";

test("AC03 · independent document identities survive rename, incomplete navigation, and targeted deletion", async ({
  app,
  page,
}) => {
  const state = new BrowserState(page);
  const persist = new PersistDocument(app.documents(), app.navigation(), app.settings());
  let firstId: unknown;
  let secondId: unknown;
  await test.step("Two explicit document instances keep separate identities and answers", async () => {
    await app.documents().selectField("tool");
    await app.fieldEditor().enterAnswer("first tool");
    await app.documents().rename("First document");
    await persist.run("First document");
    firstId = (await state.records())[0]?.id;
    await app.documents().newDocument();
    await app.documents().selectField("tool");
    await app.fieldEditor().enterAnswer("second tool");
    await app.documents().rename("Second document");
    await persist.run("Second document");
    const records = await state.records();
    expect(records).toHaveLength(2);
    secondId = records.find((record) => record.title === "Second document")?.id;
    expect(secondId).toBeTruthy();
    expect(secondId).not.toBe(firstId);
  });
  await test.step("Renaming an existing record preserves identity and another incomplete document stays navigable", async () => {
    await app.documents().rename("Second document renamed");
    await persist.run("Second document renamed");
    expect(
      (await state.records()).find((record) => record.title === "Second document renamed")?.id,
    ).toBe(secondId);
    await app.documents().newDocument();
    await app.documents().rename("Incomplete but intentional");
    await app.documents().selectField("tool");
    await app.fieldEditor().enterAnswer("unfinished tool");
    await expect(app.documents().copyButton).toBeDisabled();
    await persist.run("Incomplete but intentional");
    await app.navigation().selectDocument("First document");
    await app.documents().selectField("tool");
    await expect(app.fieldEditor().answer.locator).toHaveValue("first tool");
  });
  await test.step("Deletion identifies the target, defaults to Cancel, and affects only that record", async () => {
    await app.navigation().deleteDocument("Second document renamed");
    await app.confirmation.expectIdentity("Second document renamed");
    await app.confirmation.cancel();
    expect(await state.records()).toHaveLength(3);
    await app.navigation().deleteDocument("Second document renamed");
    await app.confirmation.expectIdentity("Second document renamed");
    await app.confirmation.confirm();
    await expect.poll(() => state.records()).toHaveLength(2);
    expect((await state.records()).some((record) => record.id === secondId)).toBe(false);
    expect((await state.records()).some((record) => record.id === firstId)).toBe(true);
  });
  await test.step("Reload preserves the final list and both surviving answers", async () => {
    await app.reload();
    await expect(app.navigation().row("Second document renamed")).toHaveCount(0);
    await app.navigation().selectDocument("First document");
    await app.documents().selectField("tool");
    await expect(app.fieldEditor().answer.locator).toHaveValue("first tool");
    await app.navigation().selectDocument("Incomplete but intentional");
    await app.documents().selectField("tool");
    await expect(app.fieldEditor().answer.locator).toHaveValue("unfinished tool");
    await expect(app.documents().copyButton).toBeDisabled();
    await expect(app.navigation().rows).toHaveCount(2);
  });
});
