"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const http = require("node:http");
const path = require("node:path");
const { chromium } = require("playwright");

const root = path.resolve(__dirname, "..");
const mimeTypes = {
  ".css": "text/css",
  ".html": "text/html",
  ".ico": "image/x-icon",
  ".jpg": "image/jpeg",
  ".js": "text/javascript",
  ".json": "application/json",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webmanifest": "application/manifest+json"
};

function startServer() {
  const server = http.createServer((request, response) => {
    const requestPath = decodeURIComponent(new URL(request.url, "http://localhost").pathname);
    const relative = requestPath === "/" ? "index.html" : requestPath.replace(/^\//, "");
    const filename = path.resolve(root, relative);
    if (!filename.startsWith(root + path.sep) || !fs.existsSync(filename) || fs.statSync(filename).isDirectory()) {
      response.writeHead(404).end("Not found");
      return;
    }
    response.setHeader("Content-Type", mimeTypes[path.extname(filename)] || "application/octet-stream");
    response.end(fs.readFileSync(filename));
  });
  return new Promise((resolve) => server.listen(0, "127.0.0.1", () => resolve(server)));
}

async function newPage(browser, baseUrl) {
  const context = await browser.newContext({ acceptDownloads: true });
  const page = await context.newPage();
  await page.goto(baseUrl);
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.waitForSelector("#editor");
  return { context, page };
}

async function setText(page, text) {
  await page.locator("#editor").fill(text);
}

async function run() {
  const server = await startServer();
  const address = server.address();
  const baseUrl = `http://127.0.0.1:${address.port}/`;
  const browser = await chromium.launch({ headless: true });
  let passed = 0;

  async function test(name, callback) {
    try {
      await callback();
      passed += 1;
      console.log(`ok ${passed} - ${name}`);
    } catch (error) {
      console.error(`not ok - ${name}`);
      throw error;
    }
  }

  try {
    await test("pure filename, export, and indentation helpers", async () => {
      const { context, page } = await newPage(browser, baseUrl);
      const result = await page.evaluate(() => ({
        sanitized: SkillLanguageEditor.sanitizeFilename('  bad<name>:?.md.  '),
        stripped: SkillLanguageEditor.stripRevisionSuffix("skill.experimental-rev-20260913-1324.md"),
        revision: SkillLanguageEditor.revisionFilename("skill.experimental-rev-20260913-1324.md", new Date(2026, 8, 13, 14, 2)),
        normalized: SkillLanguageEditor.normalizeForExport("a\r\n\r\n\r\n"),
        two: SkillLanguageEditor.inferIndentUnit("A\n  b\n    c"),
        four: SkillLanguageEditor.inferIndentUnit("A\n    b\n        c"),
        three: SkillLanguageEditor.inferIndentUnit("A\n   b\n      c")
      }));
      assert.equal(result.sanitized, "bad-name---.md");
      assert.equal(result.stripped, "skill.experimental.md");
      assert.equal(result.revision, "skill.experimental-rev-20260913-1402.md");
      assert.equal(result.normalized, "a\n");
      assert.equal(result.two, 2);
      assert.equal(result.four, 4);
      assert.equal(result.three, 3);
      await context.close();
    });

    await test("structural and conservative Markdown highlighting", async () => {
      const { context, page } = await newPage(browser, baseUrl);
      await setText(page, [
        "ordinary API prose",
        "WHEN doing this",
        "FOR EACH item",
        "MY CUSTOM RULE do this",
        "API request behavior",
        "## SKILL Something",
        "**bold** and **unfinished",
        "`code` and `**still code**`",
        "options (guidance):",
        "",
        "  - first",
        "Note:",
        "ordinary prose",
        "<script>window.__unsafe = true</script>"
      ].join("\n"));

      const result = await page.evaluate(() => ({
        keywords: [...document.querySelectorAll(".syntax-keyword")].map((node) => node.textContent),
        heading: document.querySelector(".line-heading").textContent,
        bold: [...document.querySelectorAll(".syntax-bold")].map((node) => node.textContent),
        code: [...document.querySelectorAll(".syntax-code")].map((node) => node.textContent),
        definitions: [...document.querySelectorAll(".syntax-definition")].map((node) => node.textContent),
        scripts: document.querySelectorAll("#highlight-layer script").length,
        literal: document.querySelector("#highlight-layer").textContent.includes("<script>window.__unsafe = true</script>")
      }));
      assert.deepEqual(result.keywords, ["WHEN", "FOR EACH", "MY CUSTOM RULE", "API"]);
      assert.equal(result.heading, "## SKILL Something");
      assert.deepEqual(result.bold, ["bold"]);
      assert.deepEqual(result.code, ["code", "**still code**"]);
      assert.deepEqual(result.definitions, ["options (guidance)"]);
      assert.equal(result.scripts, 0);
      assert.equal(result.literal, true);
      await context.close();
    });

    await test("caret navigation does not retokenize and selection hides current line", async () => {
      const { context, page } = await newPage(browser, baseUrl);
      await setText(page, "WHEN one\n  do two");
      const editor = page.locator("#editor");
      await editor.press("End");
      const before = await page.evaluate(() => SkillLanguageEditor.getSyntaxRenderCount());
      await editor.press("ArrowLeft");
      const after = await page.evaluate(() => SkillLanguageEditor.getSyntaxRenderCount());
      assert.equal(after, before);
      assert.equal(await page.locator(".source-line.is-current").count(), 1);
      await page.evaluate(() => {
        const editor = document.querySelector("#editor");
        editor.setSelectionRange(0, 4);
        editor.dispatchEvent(new Event("select"));
      });
      assert.equal(await page.locator(".source-line.is-current").count(), 0);
      await context.close();
    });

    await test("Tab, Shift+Tab, Enter, and undo retain editor semantics", async () => {
      const { context, page } = await newPage(browser, baseUrl);
      const editor = page.locator("#editor");
      await setText(page, "WHEN one\n  - item");
      await page.evaluate(() => document.querySelector("#editor").setSelectionRange(8, 8));
      await editor.press("Tab");
      assert.equal(await editor.inputValue(), "WHEN one  \n  - item");
      await editor.press("Control+z");
      assert.equal(await editor.inputValue(), "WHEN one\n  - item");

      await page.evaluate(() => {
        const editor = document.querySelector("#editor");
        editor.setSelectionRange(9, editor.value.length);
      });
      await editor.press("Tab");
      assert.equal(await editor.inputValue(), "WHEN one\n    - item");
      await editor.press("Shift+Tab");
      assert.equal(await editor.inputValue(), "WHEN one\n  - item");

      await page.evaluate(() => {
        const editor = document.querySelector("#editor");
        editor.setSelectionRange(editor.value.length, editor.value.length);
      });
      await editor.press("Enter");
      assert.equal(await editor.inputValue(), "WHEN one\n  - item\n  ");
      assert.equal((await editor.inputValue()).endsWith("\n  - "), false);
      await context.close();
    });

    await test("autosave restores text, filename, selection, and scroll", async () => {
      const { context, page } = await newPage(browser, baseUrl);
      const text = Array.from({ length: 120 }, (_, index) => `WHEN line ${index}\n  detail ${index}`).join("\n");
      await setText(page, text);
      const filename = page.locator("#filename-input");
      await filename.fill("restored:skill.md");
      await filename.press("Enter");
      await page.evaluate(() => {
        const editor = document.querySelector("#editor");
        editor.setSelectionRange(140, 140);
        editor.scrollTop = 600;
        editor.dispatchEvent(new Event("scroll"));
      });
      await page.waitForTimeout(550);
      assert.equal(await page.locator("#document-state").textContent(), "Saved locally");
      await page.reload();
      await page.waitForSelector("#editor");
      await page.waitForTimeout(80);
      assert.equal(await page.locator("#filename-input").inputValue(), "restored-skill.md");
      assert.equal(await page.locator("#editor").inputValue(), text);
      const restored = await page.evaluate(() => {
        const editor = document.querySelector("#editor");
        return { selectionStart: editor.selectionStart, scrollTop: editor.scrollTop };
      });
      assert.equal(restored.selectionStart, 140);
      assert(restored.scrollTop > 300);
      await context.close();
    });

    await test("New is guarded until an unchanged revision has been downloaded", async () => {
      const { context, page } = await newPage(browser, baseUrl);
      await setText(page, "valuable draft");
      await page.locator("#new-button").click();
      await expectVisible(page, "#replacement-bar");
      assert.equal(await page.locator("#editor").inputValue(), "valuable draft");
      await page.locator("#keep-button").click();
      assert.equal(await page.locator("#replacement-bar").isHidden(), true);
      assert.equal(await page.locator("#editor").inputValue(), "valuable draft");

      const downloadPromise = page.waitForEvent("download");
      await page.locator("#save-button").click();
      await downloadPromise;
      await page.locator("#new-button").click();
      assert.equal(await page.locator("#replacement-bar").isHidden(), true);
      assert.match(await page.locator("#editor").inputValue(), /^## SKILL Describe the skill/);
      await context.close();
    });

    await test("Save exports one normalized newline and a single revision suffix", async () => {
      const { context, page } = await newPage(browser, baseUrl);
      await setText(page, "first\n\n\n");
      await page.locator("#filename-input").fill("skill.experimental-rev-20260913-1324.md");
      await page.locator("#filename-input").press("Enter");
      const downloadPromise = page.waitForEvent("download");
      await page.locator("#save-button").click();
      const download = await downloadPromise;
      assert.match(download.suggestedFilename(), /^skill\.experimental-rev-\d{8}-\d{4}\.md$/);
      assert.equal((download.suggestedFilename().match(/-rev-/g) || []).length, 1);
      const stream = await download.createReadStream();
      const chunks = [];
      for await (const chunk of stream) chunks.push(chunk);
      assert.equal(Buffer.concat(chunks).toString("utf8"), "first\n");
      await context.close();
    });

    await test("Ctrl+S exports while storage failure remains visible and non-blocking", async () => {
      const { context, page } = await newPage(browser, baseUrl);
      await page.evaluate(() => {
        Storage.prototype.setItem = function () {
          throw new DOMException("Storage disabled", "QuotaExceededError");
        };
      });
      await setText(page, "WHEN storage fails");
      await page.waitForTimeout(450);
      assert.equal(await page.locator("#document-state").textContent(), "Autosave unavailable");
      const downloadPromise = page.waitForEvent("download");
      await page.locator("#editor").press("Control+s");
      const download = await downloadPromise;
      assert.match(download.suggestedFilename(), /-rev-\d{8}-\d{4}\.md$/);
      assert.equal(await page.locator("#editor").isEditable(), true);
      await context.close();
    });

    await test("Open imports CRLF through inline replacement confirmation", async () => {
      const { context, page } = await newPage(browser, baseUrl);
      await setText(page, "current draft");
      const chooserPromise = page.waitForEvent("filechooser");
      await page.locator("#open-button").click();
      const chooser = await chooserPromise;
      await chooser.setFiles({
        name: "opened-rev-20260913-1200.md",
        mimeType: "text/markdown",
        buffer: Buffer.from("WHEN imported\r\n  keep CRLF safe\r\n")
      });
      await expectVisible(page, "#replacement-bar");
      assert.equal(await page.locator("#editor").inputValue(), "current draft");
      await page.locator("#replace-button").click();
      await page.waitForFunction(() => document.querySelector("#editor").value.startsWith("WHEN imported"));
      assert.equal(await page.locator("#editor").inputValue(), "WHEN imported\n  keep CRLF safe\n");
      assert.equal(await page.locator("#filename-input").inputValue(), "opened.md");
      await context.close();
    });

    await test("multi-file drop is non-destructive", async () => {
      const { context, page } = await newPage(browser, baseUrl);
      await setText(page, "keep this");
      await page.evaluate(() => {
        const transfer = new DataTransfer();
        transfer.items.add(new File(["one"], "one.md", { type: "text/markdown" }));
        transfer.items.add(new File(["two"], "two.md", { type: "text/markdown" }));
        document.querySelector("#editor-frame").dispatchEvent(new DragEvent("drop", {
          bubbles: true,
          cancelable: true,
          dataTransfer: transfer
        }));
      });
      assert.equal(await page.locator("#editor").inputValue(), "keep this");
      assert.equal(await page.locator("#notice").textContent(), "Open one file at a time.");
      await context.close();
    });

    await test("one-file drop follows the guarded Open pipeline", async () => {
      const { context, page } = await newPage(browser, baseUrl);
      await setText(page, "keep until confirmed");
      await page.evaluate(() => {
        const transfer = new DataTransfer();
        transfer.items.add(new File(["WHEN dropped\r\n  imported"], "drop.md", { type: "text/markdown" }));
        document.querySelector("#editor-frame").dispatchEvent(new DragEvent("drop", {
          bubbles: true,
          cancelable: true,
          dataTransfer: transfer
        }));
      });
      await expectVisible(page, "#replacement-bar");
      assert.equal(await page.locator("#editor").inputValue(), "keep until confirmed");
      await page.locator("#replace-button").click();
      await page.waitForFunction(() => document.querySelector("#editor").value.startsWith("WHEN dropped"));
      assert.equal(await page.locator("#editor").inputValue(), "WHEN dropped\n  imported");
      await context.close();
    });

    await test("real sample and 500 KB document remain aligned and editable", async () => {
      const { context, page } = await newPage(browser, baseUrl);
      const sampleNames = fs.readdirSync(path.join(root, "examples/skills")).filter((name) => name.endsWith(".md"));
      for (const sampleName of sampleNames) {
        const sample = fs.readFileSync(path.join(root, "examples/skills", sampleName), "utf8");
        await setText(page, sample);
        assert.equal(await page.locator(".source-line").count(), sample.split("\n").length, sampleName);
        assert.equal(
          await page.locator("#highlight-layer").textContent(),
          (await page.locator("#editor").inputValue()).replace(/\r\n?/g, "\n"),
          sampleName
        );
      }

      const seed = "DIRECTIVE examine the current input\n  preserve ordinary technical prose and source fidelity\n";
      const largeText = seed.repeat(Math.ceil(500000 / seed.length)).slice(0, 500000);
      const timing = await page.evaluate((text) => {
        const editor = document.querySelector("#editor");
        const before = performance.now();
        editor.value = text;
        editor.dispatchEvent(new InputEvent("input", { bubbles: true, inputType: "insertText", data: null }));
        const loaded = performance.now() - before;
        editor.setSelectionRange(250000, 250000);
        const editStart = performance.now();
        editor.setRangeText("X", 250000, 250000, "end");
        editor.dispatchEvent(new InputEvent("input", { bubbles: true, inputType: "insertText", data: "X" }));
        return { loaded, edit: performance.now() - editStart };
      }, largeText);
      assert(timing.loaded < 1500, `large initial render took ${timing.loaded}ms`);
      assert(timing.edit < 250, `large single-character edit took ${timing.edit}ms`);

      await page.evaluate(() => {
        const editor = document.querySelector("#editor");
        editor.scrollTop = 800;
        editor.dispatchEvent(new Event("scroll"));
      });
      const alignment = await page.evaluate(() => {
        const editor = document.querySelector("#editor");
        const mirror = document.querySelector("#highlight-layer");
        return {
          editorScroll: editor.scrollTop,
          mirrorScroll: mirror.scrollTop,
          editorHeight: editor.scrollHeight,
          mirrorHeight: mirror.scrollHeight
        };
      });
      assert.equal(alignment.mirrorScroll, alignment.editorScroll);
      assert(Math.abs(alignment.editorHeight - alignment.mirrorHeight) < 30, JSON.stringify(alignment));
      await context.close();
    });

    await test("service worker controls an offline reload", async () => {
      const { context, page } = await newPage(browser, baseUrl);
      await page.waitForFunction(async () => {
        if (!("serviceWorker" in navigator)) return false;
        await navigator.serviceWorker.ready;
        return true;
      });
      await page.reload();
      await page.waitForFunction(() => Boolean(navigator.serviceWorker.controller));
      await context.setOffline(true);
      await page.reload();
      await page.waitForSelector("#editor");
      assert.match(await page.title(), /Skill Language Editor/);
      await context.setOffline(false);
      await context.close();
    });

    await test("file URL launches the complete core editor", async () => {
      const context = await browser.newContext();
      const page = await context.newPage();
      await page.goto(`file://${path.join(root, "index.html")}`);
      await page.waitForSelector("#editor");
      await page.locator("#editor").fill("WHEN local file mode");
      assert.equal(await page.locator(".syntax-keyword").textContent(), "WHEN");
      await context.close();
    });

    console.log(`1..${passed}`);
  } finally {
    await browser.close();
    await new Promise((resolve) => server.close(resolve));
  }
}

async function expectVisible(page, selector) {
  await page.waitForFunction((value) => {
    const element = document.querySelector(value);
    return element && !element.hidden;
  }, selector);
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
