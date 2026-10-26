import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

async function records(page: Page, table = "documents") {
  return page.evaluate(async (tableName) => {
    const db = await new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open("guided-document-editor");
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    try {
      return await new Promise<Record<string, unknown>[]>((resolve, reject) => {
        const request = db.transaction(tableName).objectStore(tableName).getAll();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    } finally {
      db.close();
    }
  }, table);
}
async function open(page: Page, path = "/") {
  await page.goto(path);
  await expect(
    page.getByRole("heading", { name: "A little structure. Your own words." }),
  ).toBeVisible();
}
async function inputOutput(page: Page) {
  await page
    .getByRole("combobox", { name: "Writing style", exact: true })
    .selectOption({ label: "Input + processing + output" });
}
async function fillInputOutput(page: Page) {
  await inputOutput(page);
  const guidance = page.locator("gtl-guidance-panel");
  await guidance.getByRole("textbox", { name: "What does the user provide?" }).fill("pasted JSON");
  await guidance.getByRole("button", { name: "Next", exact: false }).click();
  await guidance
    .getByRole("textbox", { name: "What happens to the input?" })
    .fill("checks it for syntax errors");
  await guidance.getByRole("button", { name: "Next", exact: false }).click();
  await guidance
    .getByRole("textbox", { name: "What does the application produce?" })
    .fill("a readable formatted version");
}
async function flush(page: Page) {
  await page
    .locator("gtl-document-list")
    .getByRole("button", { name: "Settings", exact: true })
    .click();
  await expect.poll(async () => (await records(page)).length).toBeGreaterThan(0);
}

test("untouched previews, focus, and reverted input never create saved documents", async ({
  page,
}) => {
  await open(page);
  await inputOutput(page);
  await page.getByRole("button", { name: "Edit processing: required" }).click();
  await expect(
    page.locator("gtl-guidance-panel").getByText("Describe the main operation", { exact: false }),
  ).toBeVisible();
  const answer = page.locator("gtl-guidance-panel").getByRole("textbox");
  await answer.fill("something");
  await answer.fill("");
  await page
    .locator("gtl-document-list")
    .getByRole("button", { name: "Settings", exact: true })
    .click();
  expect(await records(page)).toHaveLength(0);
  await page.reload();
  expect(await records(page)).toHaveLength(0);
});

test("complete, save, recover snapshot, switch independent versions, copy and export", async ({
  page,
  context,
}, testInfo) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await open(page);
  await expect(page.getByRole("button", { name: "Copy text", exact: true })).toBeDisabled();
  await fillInputOutput(page);
  const expected =
    "Takes pasted JSON, checks it for syntax errors, and produces a readable formatted version.";
  await expect(page.locator(".result-text")).toHaveText(expected);
  await page.getByRole("button", { name: "Copy text", exact: true }).click();
  await expect.poll(() => page.evaluate(() => navigator.clipboard.readText())).toBe(expected);
  await page.getByRole("button", { name: "Copy rich text" }).click();
  await expect(page.locator(".notice")).toHaveText("Rich text copied.");
  const rich = await page.evaluate(async () => {
    const item = (await navigator.clipboard.read())[0]!;
    return { types: item.types, html: await (await item.getType("text/html")).text() };
  });
  expect(rich.types).toEqual(expect.arrayContaining(["text/plain", "text/html"]));
  expect(rich.html).toContain(expected);
  expect(rich.html).not.toContain("placeholder");
  for (const [label, extension] of [
    ["Text (.txt)", "txt"],
    ["Markdown (.md)", "md"],
    ["HTML (.html)", "html"],
  ]) {
    await page.locator(".export-menu summary").click();
    const pending = page.waitForEvent("download");
    await page.getByRole("button", { name: label, exact: true }).click();
    const downloaded = await pending;
    expect(downloaded.suggestedFilename().endsWith(`.${extension}`)).toBe(true);
    const stream = await downloaded.createReadStream();
    const chunks: Buffer[] = [];
    for await (const chunk of stream!) chunks.push(Buffer.from(chunk));
    const text = Buffer.concat(chunks).toString("utf8");
    expect(text).toContain(extension === "md" ? expected.replace(".", "\\.") : expected);
    expect(text).not.toContain("Field notes");
  }
  await flush(page);
  expect(await records(page)).toHaveLength(1);
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Your space, your preferences." }),
  ).not.toBeVisible();
  await expect(page.locator(".result-text")).toHaveText(expected);
  await page
    .getByRole("combobox", { name: "Writing style", exact: true })
    .selectOption({ label: "Purpose + function" });
  await expect(page.locator("gtl-guidance-panel").getByRole("textbox")).toHaveValue("");
  await page.locator("gtl-guidance-panel").getByRole("textbox").fill("separate tool");
  await page
    .getByRole("combobox", { name: "Writing style", exact: true })
    .selectOption({ label: "Input + processing + output" });
  await expect(page.locator(".result-text")).toHaveText(expected);
  await expect.poll(async () => (await records(page)).length).toBe(2);
  await page.screenshot({ path: testInfo.outputPath("desktop-complete.png") });
  expect(errors).toEqual([]);
});

test("keyboard arrows preserve selection, modifiers and IME and keep dock focus", async ({
  page,
}) => {
  await open(page);
  await inputOutput(page);
  const guide = page.locator("gtl-guidance-panel");
  let input = guide.getByRole("textbox");
  await input.fill("data");
  await input.press("End");
  await input.press("ArrowRight");
  input = guide.getByRole("textbox", { name: "What happens to the input?" });
  await expect(input).toBeFocused();
  await input.fill("process");
  await input.evaluate((element) => (element as HTMLInputElement).setSelectionRange(0, 7));
  await input.press("ArrowLeft");
  await expect(input).toBeFocused();
  await input.press("Control+ArrowLeft");
  await expect(input).toBeFocused();
  await input.evaluate((element) =>
    element.dispatchEvent(new CompositionEvent("compositionstart", { bubbles: true })),
  );
  await input.press("Home");
  await input.press("ArrowLeft");
  await expect(input).toBeFocused();
  await input.evaluate((element) =>
    element.dispatchEvent(new CompositionEvent("compositionend", { bubbles: true })),
  );
  await input.press("ArrowLeft");
  await expect(guide.getByRole("textbox", { name: "What does the user provide?" })).toBeFocused();
  await expect(guide.getByRole("textbox")).toHaveValue("data");
  await guide.getByRole("textbox").press("Tab");
  await expect(guide.getByRole("textbox")).not.toBeFocused();
});

test("blank notes retain native multiline behavior and choices interpolate labels", async ({
  page,
}) => {
  await open(page);
  await page.locator(".template-card").filter({ hasText: "Blank note" }).click();
  const body = page
    .locator("gtl-guidance-panel")
    .getByRole("textbox", { name: "Write your note." });
  await body.fill("First line\n\nLast line");
  await body.press("Home");
  await body.press("ArrowUp");
  await expect(body).toBeFocused();
  await expect(page.locator(".result-text")).toHaveText("First line\n\nLast line");
  await page.locator(".template-card").filter({ hasText: "Thoughtful email" }).click();
  await page.getByRole("button", { name: "Edit closing: required" }).click();
  const choice = page.locator("gtl-guidance-panel").getByRole("combobox");
  await expect(choice).toHaveValue("");
  await choice.selectOption("regards");
  await expect(page.locator(".result-text")).toContainText("Kind regards");
  await expect(page.locator(".result-text")).not.toContainText("[notes]");
});

test("schema-generated settings apply to other tabs and autosave respects the interval", async ({
  page,
  context,
}) => {
  await open(page);
  const second = await context.newPage();
  await open(second);
  await page
    .locator("gtl-document-list")
    .getByRole("button", { name: "Settings", exact: true })
    .click();
  await page.getByRole("combobox", { name: "Theme", exact: true }).selectOption("light");
  await expect(second.locator("html")).toHaveAttribute("data-theme", "light");
  await page.getByRole("combobox", { name: "Background" }).selectOption("sage");
  await expect(second.locator("html")).toHaveAttribute("data-background", "sage");
  await page.getByRole("spinbutton", { name: "Autosave interval" }).fill("1");
  await page.getByRole("spinbutton", { name: "Autosave interval" }).press("Tab");
  await second.locator("gtl-guidance-panel").getByRole("textbox").fill("autosaved tool");
  await expect.poll(async () => (await records(second)).length).toBe(1);
  await expect(second.locator(".save-status")).toHaveText("Saved");
  await second.reload();
  await expect(second.locator("gtl-guidance-panel").getByRole("textbox")).toHaveValue(
    "autosaved tool",
  );
});

test("two tabs reject stale IndexedDB saves and preserve a local conflict copy", async ({
  page,
  context,
}) => {
  await open(page);
  await page.locator("gtl-guidance-panel").getByRole("textbox").fill("initial tool");
  await flush(page);
  await page.reload();
  const second = await context.newPage();
  await open(second);
  await page.locator("gtl-guidance-panel").getByRole("textbox").fill("winner tool");
  await flush(page);
  await second.locator("gtl-guidance-panel").getByRole("textbox").fill("local tool");
  await second
    .locator("gtl-document-list")
    .getByRole("button", { name: "Settings", exact: true })
    .click();
  await second
    .locator("gtl-document-list")
    .getByRole("button", { name: /^Purpose \+ function/ })
    .click();
  await expect(second.locator(".save-status")).toHaveText("Save conflict");
  await expect(second.locator("gtl-guidance-panel").getByRole("textbox")).toHaveValue("local tool");
  await second.getByRole("button", { name: "Preserve local copy", exact: true }).click();
  await expect.poll(async () => (await records(second)).length).toBe(2);
  const saved = await records(second);
  expect(
    saved.some((record) => (record.answers as Record<string, string>).tool === "winner tool"),
  ).toBe(true);
  expect(
    saved.some((record) => (record.answers as Record<string, string>).tool === "local tool"),
  ).toBe(true);
});

test("invalid authoring source is diagnosed, saved, downloaded and restored without changing built-ins", async ({
  page,
}, testInfo) => {
  await open(page);
  await page
    .locator("gtl-document-list")
    .getByRole("button", { name: "Template Authoring" })
    .click();
  const source = "TEMPLATE: Broken draft\n\nTEXT:\n  Hello {{$name}\n";
  await page.getByRole("textbox", { name: "Template source" }).fill(source);
  await page.getByRole("button", { name: "Save now", exact: true }).click();
  await expect.poll(async () => (await records(page, "authoringDrafts")).length).toBe(1);
  await page.locator(".issues summary").click();
  await expect(
    page.locator(".issues").getByRole("button", { name: /Unclosed placeholder reference/ }),
  ).toBeVisible();
  await page
    .locator(".issues")
    .getByRole("button", { name: /Unclosed placeholder reference/ })
    .click();
  await expect(page.getByRole("textbox", { name: "Template source" })).toBeFocused();
  const pending = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download .gtl", exact: false }).click();
  expect((await pending).suggestedFilename()).toBe("Broken draft.gtl");
  await page.screenshot({ path: testInfo.outputPath("authoring-diagnostics.png") });
  await page.reload();
  await page
    .locator("gtl-document-list")
    .getByRole("button", { name: "Template Authoring" })
    .click();
  await page
    .getByRole("combobox", { name: "Saved template drafts" })
    .selectOption({ label: "Broken draft" });
  await expect(page.getByRole("textbox", { name: "Template source" })).toHaveValue(source);
  const valid = "TEMPLATE: Greeting\nTEXT:\n  Hello {{$name}}.\n$name: Your name?\n  EXAMPLE: Alex";
  await page.getByRole("textbox", { name: "Template source" }).fill(valid);
  await expect(page.getByText("VALID GTL", { exact: true })).toBeVisible();
  await page
    .locator("gtl-guidance-panel")
    .getByRole("textbox", { name: "Your name?" })
    .fill("Morgan");
  await expect(page.locator(".authoring-preview .result-text")).toHaveText("Hello Morgan.");
  await page
    .getByRole("combobox", { name: "Open bundled template" })
    .selectOption("project-description");
  await expect(page.getByRole("textbox", { name: "Template source" })).toHaveValue(
    /TEMPLATE: Project description/,
  );
});

test("authoring preview safely renders prototype-like names and choice labels", async ({
  page,
}) => {
  await open(page);
  await page
    .locator("gtl-document-list")
    .getByRole("button", { name: "Template Authoring" })
    .click();
  await page
    .getByRole("textbox", { name: "Template source" })
    .fill(
      [
        "TEMPLATE: Preview types",
        "TEXT:",
        "  {{$constructor}}{{$tone}}.",
        "$constructor OPTIONAL: Add a prefix?",
        "$tone: Choose a tone?",
        "  OPTION warm: A warm message",
      ].join("\n"),
    );
  const prose = page.locator(".author-preview-prose");
  await expect(prose.getByRole("button", { name: "constructor", exact: true })).toBeVisible();
  await prose.getByRole("button", { name: "tone", exact: true }).click();
  await page.locator("gtl-guidance-panel").getByRole("combobox").selectOption("warm");
  await expect(prose.getByRole("button", { name: "A warm message", exact: true })).toBeVisible();
  await expect(page.locator(".authoring-preview .result-text")).toHaveText("A warm message.");
});

test("authoring fields recover after removing and restoring placeholder references", async ({
  page,
}) => {
  await open(page);
  await page
    .locator("gtl-document-list")
    .getByRole("button", { name: "Template Authoring" })
    .click();
  const source = page.getByRole("textbox", { name: "Template source" });
  const original = await source.inputValue();
  const guidance = page.locator("gtl-guidance-panel");
  await expect(guidance.getByRole("textbox", { name: "Who is this for?" })).toBeVisible();
  await source.fill(original.replace("{{$name}}", "everyone"));
  await expect(guidance.getByRole("textbox")).toHaveCount(0);
  await source.fill(original);
  const answer = guidance.getByRole("textbox", { name: "Who is this for?" });
  await expect(answer).toBeVisible();
  await answer.fill("Alex");
  await expect(page.locator(".authoring-preview .result-text")).toHaveText("Hello Alex.");
});

test("refreshing clean authoring drafts keeps displayed source and revision coherent", async ({
  page,
  context,
}) => {
  await open(page);
  await page
    .locator("gtl-document-list")
    .getByRole("button", { name: "Template Authoring" })
    .click();
  const original = "TEMPLATE: Shared source\nTEXT:\n  Original text.";
  const latest = "TEMPLATE: Shared source\nTEXT:\n  Updated in the first tab.";
  await page.getByRole("textbox", { name: "Template source" }).fill(original);
  await page.getByRole("button", { name: "Save now", exact: true }).click();
  await expect.poll(async () => (await records(page, "authoringDrafts"))[0]?.revision).toBe(1);
  const second = await context.newPage();
  await open(second);
  await second
    .locator("gtl-document-list")
    .getByRole("button", { name: "Template Authoring" })
    .click();
  await second
    .getByRole("combobox", { name: "Saved template drafts" })
    .selectOption({ label: "Shared source" });
  const secondSource = second.getByRole("textbox", { name: "Template source" });
  await expect(secondSource).toHaveValue(original);
  await page.getByRole("textbox", { name: "Template source" }).fill(latest);
  await page.getByRole("button", { name: "Save now", exact: true }).click();
  await expect.poll(async () => (await records(page, "authoringDrafts"))[0]?.revision).toBe(2);
  await page
    .locator("gtl-document-list")
    .getByRole("button", { name: "Settings", exact: true })
    .click();
  const mode = page.getByRole("combobox", { name: "Storage mode" });
  await mode.selectOption("memory");
  await expect(secondSource).toBeDisabled();
  await mode.selectOption("indexeddb");
  await expect(secondSource).toBeEnabled();
  await expect(secondSource).toHaveValue(latest);
  const updated = (await secondSource.inputValue()).replace("first tab", "first tab and retained");
  await secondSource.fill(updated);
  await second.getByRole("button", { name: "Save now", exact: true }).click();
  await expect
    .poll(async () => (await records(second, "authoringDrafts"))[0]?.source)
    .toBe(updated);
});

test("storage modes do not migrate or delete records, and memory-only work disappears on reload", async ({
  page,
}) => {
  await open(page);
  await page.locator("gtl-guidance-panel").getByRole("textbox").fill("stored tool");
  await flush(page);
  await page.getByRole("combobox", { name: "Storage mode" }).selectOption("memory");
  await page
    .locator("gtl-document-list")
    .getByRole("button", { name: /New Document/ })
    .click();
  await page.locator("gtl-guidance-panel").getByRole("textbox").fill("ephemeral tool");
  await page
    .locator("gtl-document-list")
    .getByRole("button", { name: "Settings", exact: true })
    .click();
  expect(await records(page)).toHaveLength(1);
  await page.reload();
  await expect(page.locator("gtl-guidance-panel").getByRole("textbox")).toHaveValue("");
  await page
    .locator("gtl-document-list")
    .getByRole("button", { name: "Settings", exact: true })
    .click();
  await page.getByRole("combobox", { name: "Storage mode" }).selectOption("indexeddb");
  await expect(
    page.locator("gtl-document-list").getByRole("button", { name: /^Purpose \+ function/ }),
  ).toBeVisible();
  await page
    .locator("gtl-document-list")
    .getByRole("button", { name: /^Purpose \+ function/ })
    .click();
  await expect(page.locator("gtl-guidance-panel").getByRole("textbox")).toHaveValue("stored tool");
});

test("localStorage persists safely and corrupt collections are preserved with visible recovery", async ({
  page,
}) => {
  await open(page);
  await page
    .locator("gtl-document-list")
    .getByRole("button", { name: "Settings", exact: true })
    .click();
  await page.getByRole("combobox", { name: "Storage mode" }).selectOption("local");
  await page
    .locator("gtl-document-list")
    .getByRole("button", { name: /New Document/ })
    .click();
  await page.locator("gtl-guidance-panel").getByRole("textbox").fill("local tool");
  await page
    .locator("gtl-document-list")
    .getByRole("button", { name: "Settings", exact: true })
    .click();
  await expect
    .poll(() => page.evaluate(() => localStorage.getItem("gtl.documents.v1")))
    .toContain("local tool");
  await page.reload();
  await expect(page.locator("gtl-guidance-panel").getByRole("textbox")).toHaveValue("local tool");
  await page.evaluate(() => localStorage.setItem("gtl.documents.v1", "{broken"));
  await page.reload();
  await expect(page.getByRole("alert")).toContainText("invalid JSON");
  expect(await page.evaluate(() => localStorage.getItem("gtl.documents.v1"))).toBe("{broken");
  await page.locator("gtl-guidance-panel").getByRole("textbox").fill("recoverable tool");
  await page
    .locator("gtl-document-list")
    .getByRole("button", { name: "Settings", exact: true })
    .click();
  await expect(page.getByRole("alert")).toContainText("invalid JSON");
  expect(await page.evaluate(() => localStorage.getItem("gtl.documents.v1"))).toBe("{broken");
});

test("document deletion confirms identity and leaves other versions untouched", async ({
  page,
}) => {
  await open(page);
  await page.locator("gtl-guidance-panel").getByRole("textbox").fill("first");
  await flush(page);
  await page.reload();
  await page
    .getByRole("combobox", { name: "Writing style", exact: true })
    .selectOption({ label: "Problem + solution" });
  await page.locator("gtl-guidance-panel").getByRole("textbox").fill("second");
  await flush(page);
  await page
    .locator("gtl-document-list")
    .getByRole("button", { name: "Delete Purpose + function", exact: true })
    .click();
  await expect(page.getByRole("dialog")).toContainText("Purpose + function");
  await page.getByRole("button", { name: "Cancel", exact: true }).click();
  expect(await records(page)).toHaveLength(2);
  await page
    .locator("gtl-document-list")
    .getByRole("button", { name: "Delete Purpose + function", exact: true })
    .click();
  await page.getByRole("button", { name: "Delete document", exact: true }).click();
  await expect.poll(async () => (await records(page)).length).toBe(1);
});

test("subdirectory hosting and mobile guidance retain accessible controls without horizontal overflow", async ({
  page,
}, testInfo) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await open(page, "/editor/");
  await page.getByRole("button", { name: "Edit tool: required" }).click();
  const input = page.locator("gtl-guidance-panel").getByRole("textbox");
  await input.fill("mobile tool");
  await expect(input).toBeFocused();
  const bounds = await input.boundingBox();
  expect(bounds!.x).toBeGreaterThanOrEqual(0);
  expect(bounds!.y + bounds!.height).toBeLessThanOrEqual(844);
  const main = await page.locator(".main-region").boundingBox();
  const guidance = await page.locator(".context-region").boundingBox();
  expect(main!.height).toBeGreaterThan(400);
  expect(Math.abs(guidance!.y + guidance!.height - 844)).toBeLessThan(2);
  expect(guidance!.y).toBeGreaterThanOrEqual(main!.y + main!.height - 1);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  await page.screenshot({ path: testInfo.outputPath("mobile-guidance.png") });
  await page.setViewportSize({ width: 390, height: 520 });
  await input.click();
  const resized = await input.boundingBox();
  expect(resized!.y + resized!.height).toBeLessThanOrEqual(520);
  await page.getByRole("button", { name: "Open document navigation" }).click();
  await page.getByRole("button", { name: "Settings", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Your space, your preferences." })).toBeVisible();
  await expect(page.getByRole("dialog")).not.toBeVisible();
});

test("unavailable workers keep editing and valid file exports usable", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, "Worker", {
      value: class {
        constructor() {
          throw new Error("Worker blocked");
        }
      },
    });
  });
  await open(page);
  await expect(page.getByRole("alert")).toContainText("Could not start browser storage");
  await fillInputOutput(page);
  await expect(page.getByRole("button", { name: "Copy text", exact: true })).toBeEnabled();
  await page.locator(".export-menu summary").click();
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "Text (.txt)", exact: true }).click();
  expect((await download).suggestedFilename()).toContain(".txt");
});

test("quota failures keep partial answers, offer recovery, and clear only after successful retry", async ({
  page,
}) => {
  await page.addInitScript(() => {
    const original = Storage.prototype.setItem;
    Storage.prototype.setItem = function (key, value) {
      if (key === "gtl.documents.v1" && Reflect.get(window, "rejectDocumentWrites"))
        throw new DOMException("Storage quota exceeded.", "QuotaExceededError");
      original.call(this, key, value);
    };
    Reflect.set(window, "rejectDocumentWrites", true);
  });
  await open(page);
  await page
    .locator("gtl-document-list")
    .getByRole("button", { name: "Settings", exact: true })
    .click();
  await page.getByRole("combobox", { name: "Storage mode" }).selectOption("local");
  await page
    .locator("gtl-document-list")
    .getByRole("button", { name: /New Document/ })
    .click();
  await page.locator("gtl-guidance-panel").getByRole("textbox").fill("important partial answer");
  await page
    .locator("gtl-document-list")
    .getByRole("button", { name: "Settings", exact: true })
    .click();
  await page
    .locator("gtl-document-list")
    .getByRole("button", { name: /^Purpose \+ function/ })
    .click();
  await expect(page.locator(".save-status")).toHaveText("Save failed");
  await page.locator("gtl-guidance-panel").getByRole("textbox").fill("newer partial answer");
  await expect(page.locator(".save-status")).toHaveText("Save failed");
  await expect(page.getByRole("button", { name: "Copy text", exact: true })).toBeDisabled();
  const recovery = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download recovery file" }).click();
  expect((await recovery).suggestedFilename()).toContain(".recovery.json");
  await page.evaluate(() => Reflect.set(window, "rejectDocumentWrites", false));
  await page.getByRole("button", { name: "Retry storage", exact: true }).click();
  await expect(page.locator(".save-status")).toHaveText("Saved");
  await expect(page.getByRole("alert")).not.toBeVisible();
  const stored = await page.evaluate(
    () => JSON.parse(localStorage.getItem("gtl.documents.v1")!).records,
  );
  expect(stored).toHaveLength(1);
  expect(stored[0].answers.tool).toBe("newer partial answer");
});

test("localStorage revision checks prevent competing tabs from silently overwriting", async ({
  page,
  context,
}) => {
  await open(page);
  await page
    .locator("gtl-document-list")
    .getByRole("button", { name: "Settings", exact: true })
    .click();
  await page.getByRole("combobox", { name: "Storage mode" }).selectOption("local");
  await page
    .locator("gtl-document-list")
    .getByRole("button", { name: /New Document/ })
    .click();
  await page.locator("gtl-guidance-panel").getByRole("textbox").fill("initial");
  await page
    .locator("gtl-document-list")
    .getByRole("button", { name: "Settings", exact: true })
    .click();
  await expect
    .poll(() => page.evaluate(() => localStorage.getItem("gtl.documents.v1")))
    .toContain("initial");
  await page.reload();
  const second = await context.newPage();
  await open(second);
  await page.locator("gtl-guidance-panel").getByRole("textbox").fill("local winner");
  await page
    .locator("gtl-document-list")
    .getByRole("button", { name: "Settings", exact: true })
    .click();
  await expect
    .poll(() => page.evaluate(() => localStorage.getItem("gtl.documents.v1")))
    .toContain("local winner");
  await second.locator("gtl-guidance-panel").getByRole("textbox").fill("local conflict");
  await second
    .locator("gtl-document-list")
    .getByRole("button", { name: "Settings", exact: true })
    .click();
  await second
    .locator("gtl-document-list")
    .getByRole("button", { name: /^Purpose \+ function/ })
    .click();
  await expect(second.locator(".save-status")).toHaveText("Save conflict");
  await expect(second.locator("gtl-guidance-panel").getByRole("textbox")).toHaveValue(
    "local conflict",
  );
  expect(
    await page.evaluate(
      () => JSON.parse(localStorage.getItem("gtl.documents.v1")!).records[0].answers.tool,
    ),
  ).toBe("local winner");
});

test("memory-only source drafts are not unexpectedly persisted", async ({ page }) => {
  await open(page);
  await page
    .locator("gtl-document-list")
    .getByRole("button", { name: "Settings", exact: true })
    .click();
  await page.getByRole("combobox", { name: "Storage mode" }).selectOption("memory");
  await page
    .locator("gtl-document-list")
    .getByRole("button", { name: "Template Authoring" })
    .click();
  await page
    .getByRole("textbox", { name: "Template source" })
    .fill("This source must stay ephemeral.");
  await page.getByRole("button", { name: "Save now", exact: true }).click();
  await expect(page.locator(".authoring-workspace .save-status")).toHaveText(
    "In memory · this tab",
  );
  expect(await records(page, "authoringDrafts")).toHaveLength(0);
  expect(await page.evaluate(() => localStorage.getItem("gtl.authoring.v1"))).toBeNull();
  await page.reload();
  await page
    .locator("gtl-document-list")
    .getByRole("button", { name: "Template Authoring" })
    .click();
  await expect(page.getByRole("textbox", { name: "Template source" })).not.toHaveValue(
    "This source must stay ephemeral.",
  );
});

test("saved template snapshots outlive replaced bundled files", async ({ page }) => {
  await open(page);
  await fillInputOutput(page);
  await flush(page);
  await page.route("**/templates/project-description.gtl", (route) =>
    route.fulfill({
      contentType: "text/plain",
      body: "TEMPLATE: Project description\nTEXT:\n  A completely different deployed template.",
    }),
  );
  await page.reload();
  await expect(page.locator(".result-text")).toHaveText(
    "Takes pasted JSON, checks it for syntax errors, and produces a readable formatted version.",
  );
  await expect(page.getByRole("combobox", { name: "Writing style", exact: true })).toHaveValue(
    "version-3",
  );
});

test("denied clipboard access never claims success and explains alternative recovery", async ({
  page,
}) => {
  await open(page);
  await fillInputOutput(page);
  await page.evaluate(() =>
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: {
        writeText: () => Promise.reject(new DOMException("Denied", "NotAllowedError")),
        write: () => Promise.reject(new DOMException("Denied", "NotAllowedError")),
      },
    }),
  );
  await page.getByRole("button", { name: "Copy text", exact: true }).click();
  await expect(page.getByRole("alert")).toContainText("Clipboard access was denied");
  await expect(page.locator(".notice")).toBeEmpty();
  await page.getByRole("button", { name: "Copy rich text", exact: true }).click();
  await expect(page.getByRole("alert")).toContainText("Try Copy text");
});

test("blocked preferences use visible defaults without interrupting writing", async ({ page }) => {
  await page.addInitScript(() => {
    const original = Storage.prototype.getItem;
    Storage.prototype.getItem = function (key) {
      if (key === "gtl.preferences.v1") throw new DOMException("Blocked", "SecurityError");
      return original.call(this, key);
    };
  });
  await open(page);
  await expect(page.getByRole("alert")).toContainText("Preferences could not be read");
  await page.locator("gtl-guidance-panel").getByRole("textbox").fill("still editable");
  await expect(page.locator(".result-text")).toContainText("still editable");
});

test("keyboard style selection and sidebar focus survive asynchronous saves", async ({ page }) => {
  await open(page);
  const style = page.getByRole("combobox", { name: "Writing style", exact: true });
  await style.focus();
  await style.press("ArrowDown");
  await expect(style).toBeFocused();
  await expect(style).toHaveValue("version-2");
  await page
    .locator("gtl-document-list")
    .getByRole("button", { name: "Settings", exact: true })
    .click();
  await page.getByRole("spinbutton", { name: "Autosave interval" }).fill("1");
  await page.getByRole("spinbutton", { name: "Autosave interval" }).press("Tab");
  await page
    .locator("gtl-document-list")
    .getByRole("button", { name: /New Document/ })
    .click();
  await page.locator("gtl-guidance-panel").getByRole("textbox").fill("keyboard-friendly tool");
  const documentLink = page
    .locator("gtl-document-list")
    .getByRole("button", { name: /^Purpose \+ function/ });
  await documentLink.focus();
  await expect(page.locator(".save-status")).toHaveText("Saved");
  await expect(documentLink).toBeFocused();
});

test("document, settings, authoring and mobile surfaces meet automated accessibility checks", async ({
  page,
}) => {
  await open(page);
  const scan = async () => {
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();
    expect(
      results.violations.map((issue) => ({
        id: issue.id,
        description: issue.description,
        nodes: issue.nodes.map((node) => node.target),
      })),
    ).toEqual([]);
  };
  await scan();
  await page
    .locator("gtl-document-list")
    .getByRole("button", { name: "Settings", exact: true })
    .click();
  await scan();
  await page.getByRole("combobox", { name: "Theme", exact: true }).selectOption("light");
  await scan();
  await page
    .locator("gtl-document-list")
    .getByRole("button", { name: "Template Authoring" })
    .click();
  await scan();
  await page.setViewportSize({ width: 390, height: 844 });
  await scan();
});
