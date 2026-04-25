import test from "node:test";
import assert from "node:assert/strict";
import { TAGS, PUBLIC_TOKENS } from "../src/core/constants.js";
import { copyToClipboard } from "../src/core/clipboard.js";
import { createId, normalizeAlignment, normalizeDensity, normalizeOrientation, normalizeTone } from "../src/core/component-utils.js";
import { sanitizeHtml } from "../src/core/sanitize.js";
import { buildSearchUrl, deriveHostname, isHttpUrl, normalizeSearchTemplate, resolveNavigationInput } from "../src/core/url.js";

test("application-kit tags are public", () => {
  assert.equal(TAGS.appShell, "awwbookmarklet-app-shell");
  assert.equal(TAGS.toolbar, "awwbookmarklet-toolbar");
  assert.equal(TAGS.field, "awwbookmarklet-field");
  assert.equal(TAGS.statusLine, "awwbookmarklet-status-line");
  assert.equal(TAGS.alert, "awwbookmarklet-alert");
  assert.equal(TAGS.dialog, "awwbookmarklet-dialog");
  assert.equal(TAGS.toast, "awwbookmarklet-toast");
  assert.equal(TAGS.emptyState, "awwbookmarklet-empty-state");
  assert.equal(TAGS.stateOverlay, "awwbookmarklet-state-overlay");
  assert.equal(TAGS.list, "awwbookmarklet-list");
  assert.equal(TAGS.listItem, "awwbookmarklet-list-item");
  assert.equal(TAGS.card, "awwbookmarklet-card");
  assert.equal(TAGS.richPreview, "awwbookmarklet-rich-preview");
  assert.equal(TAGS.browserPanel, "awwbookmarklet-browser-panel");
  assert.equal(TAGS.manualCopy, "awwbookmarklet-manual-copy");
  assert.equal(TAGS.commandPalette, "awwbookmarklet-command-palette");
  assert.equal(TAGS.shortcutHelp, "awwbookmarklet-shortcut-help");
  assert.equal(TAGS.urlPicker, "awwbookmarklet-url-picker");
  assert.equal(TAGS.metricCard, "awwbookmarklet-metric-card");
});

test("application-kit tokens have stable CSS variable names", () => {
  assert.equal(PUBLIC_TOKENS.appShellBg, "--awwbookmarklet-app-shell-bg");
  assert.equal(PUBLIC_TOKENS.warningBg, "--awwbookmarklet-warning-bg");
  assert.equal(PUBLIC_TOKENS.dangerBorder, "--awwbookmarklet-danger-border");
  assert.equal(PUBLIC_TOKENS.overlayBackdrop, "--awwbookmarklet-overlay-backdrop");
  assert.equal(PUBLIC_TOKENS.cardSelectedBg, "--awwbookmarklet-card-selected-bg");
  assert.equal(PUBLIC_TOKENS.metricBg, "--awwbookmarklet-metric-bg");
  assert.equal(PUBLIC_TOKENS.codeBg, "--awwbookmarklet-code-bg");
});

test("component normalizers use safe fallbacks", () => {
  assert.equal(normalizeTone("danger"), "danger");
  assert.equal(normalizeTone("unknown"), "neutral");
  assert.equal(normalizeDensity("compact"), "compact");
  assert.equal(normalizeDensity("huge"), "normal");
  assert.equal(normalizeAlignment("between"), "between");
  assert.equal(normalizeAlignment("right"), "start");
  assert.equal(normalizeOrientation("inline"), "inline");
  assert.equal(normalizeOrientation("sideways"), "horizontal");
  assert.match(createId("x"), /^x-\d+$/);
});

test("sanitizeHtml removes active content in fallback mode", () => {
  const output = sanitizeHtml(`<p onclick="run()">Safe</p><script>alert(1)</script><a href="javascript:alert(1)">bad</a><iframe src="x"></iframe>`);
  assert.match(output, /Safe/);
  assert.doesNotMatch(output, /script/i);
  assert.doesNotMatch(output, /onclick/i);
  assert.doesNotMatch(output, /javascript:/i);
  assert.doesNotMatch(output, /iframe/i);
});

test("copyToClipboard returns fallback when clipboard API is unavailable", async () => {
  const result = await copyToClipboard({ text: "copy me" }, { navigator: {} });
  assert.equal(result.ok, false);
  assert.equal(result.status, "fallback");
  assert.equal(result.fallbackText, "copy me");
});

test("copyToClipboard writes plain text when writeText exists", async () => {
  const writes = [];
  const result = await copyToClipboard({ text: "copy me" }, {
    navigator: {
      clipboard: {
        async writeText(value) {
          writes.push(value);
        }
      }
    }
  });

  assert.equal(result.ok, true);
  assert.equal(result.method, "writeText");
  assert.deepEqual(writes, ["copy me"]);
});

test("copyToClipboard returns failed result on rejection", async () => {
  const result = await copyToClipboard({ text: "copy me" }, {
    navigator: {
      clipboard: {
        async writeText() {
          throw new Error("denied");
        }
      }
    }
  });

  assert.equal(result.ok, false);
  assert.equal(result.status, "failed");
  assert.equal(result.fallbackText, "copy me");
  assert.equal(result.reason, "denied");
});

test("copyToClipboard reports empty payload", async () => {
  const result = await copyToClipboard({}, { navigator: { clipboard: {} } });
  assert.equal(result.ok, false);
  assert.equal(result.status, "empty");
});

test("URL helpers classify navigation, search, and blocked input", () => {
  assert.equal(isHttpUrl("https://example.com/a"), true);
  assert.equal(isHttpUrl("javascript:alert(1)"), false);
  assert.equal(normalizeSearchTemplate("bad"), "https://www.google.com/search?q={query}");
  assert.equal(buildSearchUrl("hello world", "https://search.example/?q={query}"), "https://search.example/?q=hello%20world");
  assert.deepEqual(resolveNavigationInput("example.com/docs").kind, "navigate_url");
  assert.deepEqual(resolveNavigationInput("plain search").kind, "search");
  assert.deepEqual(resolveNavigationInput("javascript:alert(1)").kind, "blocked_protocol");
  assert.equal(deriveHostname("https://example.com/path"), "example.com");
});
