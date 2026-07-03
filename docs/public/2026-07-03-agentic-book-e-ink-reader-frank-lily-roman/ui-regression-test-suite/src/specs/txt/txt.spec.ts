import { test, expect } from "../../framework/test/base-test.js";
import { expectStandardOracle } from "../../framework/support/oracle.js";
import { openFileByPickerFlow, openFileByDropFlow } from "../../flows/open-file.flow.js";

/**
 * TXT parsing suite (manual plan). Plain text renders as readable paragraphs,
 * different line endings are handled, Unicode is preserved, a single long line
 * wraps without horizontal overflow, and whitespace-only input is handled
 * calmly.
 */
test.describe("txt", () => {
  test("T001 simple prose renders with its markers", async ({ makeApp }) => {
    const app = await makeApp();
    await openFileByPickerFlow(app, "simpleProse", "FIXTURE_SIMPLE_TXT_TITLE");
    expect(await app.reader().contentText()).toContain("FIXTURE_SIMPLE_TXT_END");
    await expectStandardOracle(app, { documentOpen: true });
  });

  test("T002 CRLF line endings are handled", async ({ makeApp }) => {
    const app = await makeApp();
    await openFileByDropFlow(app, "crlfEndings", "FIXTURE_CRLF_MARKER");
    expect(await app.reader().contentText()).toContain("FIXTURE_CRLF_END");
    await expectStandardOracle(app, { documentOpen: true });
  });

  test("T003 CR-only line endings are handled", async ({ makeApp }) => {
    const app = await makeApp();
    await openFileByDropFlow(app, "crEndings", "FIXTURE_CR_MARKER");
    await expectStandardOracle(app, { documentOpen: true });
  });

  test("T004 Unicode content is preserved", async ({ makeApp }) => {
    const app = await makeApp();
    await openFileByPickerFlow(app, "unicodeMixed", "FIXTURE_UNICODE_CYRILLIC_MARKER");
    const text = await app.reader().contentText();
    expect(text).toContain("Привет");
    expect(text).toContain("你好世界");
    await expectStandardOracle(app, { documentOpen: true });
  });

  test("T005 one very long line wraps without horizontal overflow", async ({ makeApp }) => {
    const app = await makeApp();
    await openFileByPickerFlow(app, "oneLongLine", "FIXTURE_ONE_LONG_LINE");
    // The oracle asserts no body horizontal overflow.
    await expectStandardOracle(app, { documentOpen: true });
  });

  test("T006 a long book paginates into many pages", async ({ makeApp }) => {
    const app = await makeApp({ seededPreferences: { readerMode: "paged" } });
    await openFileByPickerFlow(app, "longBook", "FIXTURE_LONG_BOOK_CH1");
    const state = await app.reader().pageState();
    expect(state).not.toBeNull();
    expect(state!.count).toBeGreaterThan(1);
    await expectStandardOracle(app, { documentOpen: true, mode: "paged" });
  });

  test("T007 whitespace-only file does not leave a stuck busy or blank reader", async ({ makeApp }) => {
    const app = await makeApp();
    await app.openScreen().expectReady();
    await app.openScreen().openByPicker("whitespaceOnly");
    await app.busy().waitHidden();
    // Either the reader opens with (near) empty content, or a calm notice shows;
    // in both cases there must be no stuck overlay and no errors.
    await app.timeouts.waitUntil(
      async () => (await app.reader().isVisible()) || (await app.openScreen().isNoticeVisible()),
      { timeoutMs: app.timeouts.normal, description: "reader or notice after whitespace-only file" },
    );
    expect(app.diagnostics.pageErrors()).toEqual([]);
  });
});
