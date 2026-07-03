import { test, expect } from "../../framework/test/base-test.js";
import { expectStandardOracle } from "../../framework/support/oracle.js";
import { openFileByPickerFlow } from "../../flows/open-file.flow.js";
import { switchModeFlow } from "../../flows/switch-mode.flow.js";
import {
  expectAllBlocksNumbered,
  expectPerBlockRestart,
} from "../../framework/support/line-number-assertions.js";
import { createBaseline } from "../../framework/support/baseline.js";
import { PROFILES } from "../../framework/support/adaptive-baseline.js";

/**
 * Markdown code-block line numbers (gap-closure spec M00). Roman reads code-heavy
 * notes; fenced code blocks render a non-selectable gutter with one number per
 * source line. These tests assert the numbering contract, containment on mobile,
 * per-block restart, language labelling, and that numbers never leak to storage.
 */
test.describe("markdown code line numbers", () => {
  test("CODE001 every fenced block is numbered 1..N matching its line count", async ({ makeApp }) => {
    const app = await makeApp();
    await openFileByPickerFlow(app, "romanBinarySearch", "FIXTURE_ROMAN_BINARY_SEARCH_TITLE");
    await expectAllBlocksNumbered(app.codeBlock());
    await expectStandardOracle(app, { documentOpen: true });
  });

  test("CODE002 numbers restart per block in a multi-block note", async ({ makeApp }) => {
    const app = await makeApp();
    await openFileByPickerFlow(app, "romanJsDebug", "FIXTURE_ROMAN_JS_DEBUG_TITLE");
    const count = await app.codeBlock().count();
    expect(count, "js-debug note has several code blocks").toBeGreaterThan(1);
    await expectPerBlockRestart(app.codeBlock());
    await expectAllBlocksNumbered(app.codeBlock());
    await expectStandardOracle(app, { documentOpen: true });
  });

  test("CODE003 code blocks stay contained on a narrow phone (no body overflow)", async ({ makeApp }) => {
    const app = await makeApp({ viewport: { width: 360, height: 780 } });
    await openFileByPickerFlow(app, "romanRateLimit", "FIXTURE_ROMAN_RATE_LIMIT_TITLE");
    const count = await app.codeBlock().count();
    for (let i = 0; i < count; i++) await app.codeBlock().expectContained(i);
    await expectStandardOracle(app, { documentOpen: true });
  });

  test("CODE004 language label is captured from the fence info string", async ({ makeApp }) => {
    const app = await makeApp();
    await openFileByPickerFlow(app, "romanMixedNotes", "FIXTURE_ROMAN_MIXED_NOTES_TITLE");
    const langs: (string | null)[] = [];
    const count = await app.codeBlock().count();
    for (let i = 0; i < count; i++) langs.push(await app.codeBlock().language(i));
    // The mixed note declares sh and json fences.
    expect(langs).toContain("sh");
    expect(langs).toContain("json");
    await expectStandardOracle(app, { documentOpen: true });
  });

  test("CODE005 numbering survives a mode switch and stays clean", async ({ makeApp }) => {
    const app = await makeApp();
    await openFileByPickerFlow(app, "romanSlidingWindow", "FIXTURE_ROMAN_SLIDING_WINDOW_TITLE");
    await expectAllBlocksNumbered(app.codeBlock());

    const baseline = createBaseline(app, ["FIXTURE_ROMAN_SLIDING_WINDOW_TITLE"]);
    await baseline.capture();
    await switchModeFlow(app, "scroll");
    await baseline.expectAfter("switch to scroll", PROFILES.modeChange);

    await expectAllBlocksNumbered(app.codeBlock());
    await expectStandardOracle(app, { documentOpen: true });
  });

  test("CODE006 code text and line numbers never persist to storage", async ({ makeApp }) => {
    const app = await makeApp();
    await openFileByPickerFlow(app, "romanBinarySearch", "FIXTURE_ROMAN_BINARY_SEARCH_TITLE");
    const codeText = await app.codeBlock().codeText(0);
    // Grab a distinctive token from the code body.
    expect(codeText).toContain("Math.floor");
    await app.storage.assertNoContent(["Math.floor", "FIXTURE_ROMAN_BINARY_SEARCH_TITLE"]);
    await app.storage.assertOnlyPreferences();
  });
});
