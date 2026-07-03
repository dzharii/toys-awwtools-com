import { test, expect } from "../../framework/test/base-test.js";
import { expectStandardOracle } from "../../framework/support/oracle.js";
import { openFileByPickerFlow } from "../../flows/open-file.flow.js";
import { ERROR_COPY, FILE_LIMITS } from "../../config/suite-config.js";
import { fixtureMarkers } from "../../framework/support/fixtures.js";

/**
 * File-handling suite (manual plan D00/F00): supported extensions open, the
 * multi-file / unsupported / empty / oversized paths show calm, specific,
 * non-technical notices, and the reader is never left in a broken state.
 */
test.describe("files", () => {
  test("F001 .txt opens through the picker", async ({ makeApp }) => {
    const app = await makeApp();
    await openFileByPickerFlow(app, "simpleProse", fixtureMarkers("simpleProse")[0]);
    await expectStandardOracle(app, { documentOpen: true });
  });

  test("F002 .md opens through the picker", async ({ makeApp }) => {
    const app = await makeApp();
    await openFileByPickerFlow(app, "standardMarkdown", fixtureMarkers("standardMarkdown")[0]);
    await expectStandardOracle(app, { documentOpen: true });
  });

  test("F003 .markdown extension opens through the picker", async ({ makeApp }) => {
    const app = await makeApp();
    await openFileByPickerFlow(app, "standardMarkdownAlt", fixtureMarkers("standardMarkdownAlt")[0]);
    await expectStandardOracle(app, { documentOpen: true });
  });

  test("F004 dropping multiple files at once is rejected with a calm notice", async ({ makeApp }) => {
    const app = await makeApp();
    await app.openScreen().expectReady();
    await app.openScreen().dropFiles(["simpleProse", "standardMarkdown"]);
    await expect
      .poll(async () => app.openScreen().noticeText(), { timeout: 8000 })
      .toMatch(ERROR_COPY.multipleFiles);
    // App stays on the open screen; nothing is loaded.
    expect(await app.reader().isVisible()).toBe(false);
    await expectStandardOracle(app, { documentOpen: false });
  });

  test("F005 an unsupported file type is rejected with guidance", async ({ makeApp }) => {
    const app = await makeApp();
    await app.openScreen().expectReady();
    await app.openScreen().openByPicker("unsupportedJson");
    await expect
      .poll(async () => app.openScreen().noticeText(), { timeout: 8000 })
      .toMatch(ERROR_COPY.unsupportedType);
    expect(await app.reader().isVisible()).toBe(false);
    await expectStandardOracle(app, { documentOpen: false });
  });

  test("F006 an empty file is rejected with a calm notice", async ({ makeApp }) => {
    const app = await makeApp();
    await app.openScreen().expectReady();
    await app.openScreen().openByPicker("empty");
    await expect
      .poll(async () => app.openScreen().noticeText(), { timeout: 8000 })
      .toMatch(ERROR_COPY.emptyFile);
    expect(await app.reader().isVisible()).toBe(false);
    await expectStandardOracle(app, { documentOpen: false });
  });

  test("F007 an oversized file (> hard limit) is rejected safely", async ({ makeApp }) => {
    const app = await makeApp();
    await app.openScreen().expectReady();
    await app.openScreen().openOversizedInPage(FILE_LIMITS.hardLimitBytes + 512 * 1024);
    await expect
      .poll(async () => app.openScreen().noticeText(), { timeout: 12000 })
      .toMatch(ERROR_COPY.tooLarge);
    expect(await app.reader().isVisible()).toBe(false);
    await expectStandardOracle(app, { documentOpen: false });
  });

  test("F008 recovering after a rejected file: a valid file still opens", async ({ makeApp }) => {
    const app = await makeApp();
    await app.openScreen().expectReady();
    await app.openScreen().openByPicker("unsupportedJson");
    await expect.poll(async () => app.openScreen().noticeText(), { timeout: 8000 }).toMatch(ERROR_COPY.unsupportedType);
    // Now open a good file — the app must recover cleanly.
    await openFileByPickerFlow(app, "simpleProse", fixtureMarkers("simpleProse")[0]);
    await expectStandardOracle(app, { documentOpen: true });
  });

  test("F009 opening a second book replaces the first", async ({ makeApp }) => {
    const app = await makeApp();
    await openFileByPickerFlow(app, "simpleProse", fixtureMarkers("simpleProse")[0]);
    // While in the reader, choosing another file through the (shared, hidden)
    // picker input replaces the current book.
    await app.openScreen().openByPicker("standardMarkdown");
    await app.busy().waitHidden();
    await app.reader().waitForMarker(fixtureMarkers("standardMarkdown")[0]);
    // First file's marker must no longer be present.
    const text = await app.reader().contentText();
    expect(text).not.toContain("FIXTURE_SIMPLE_TXT_TITLE");
    await expectStandardOracle(app, { documentOpen: true });
  });
});
