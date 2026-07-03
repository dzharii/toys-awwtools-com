import { readFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Fixture registry: maps logical fixture names to files under tests/fixtures and
 * records the unique text marker(s) each fixture contains. Tests assert against
 * these markers instead of brittle large text blocks.
 */
const HERE = dirname(fileURLToPath(import.meta.url));
// Fixtures live at the E Ink Reader project root: tests/fixtures.
// support -> framework -> src -> ui-regression-test-suite -> project root.
export const FIXTURES_ROOT = resolve(HERE, "../../../../tests/fixtures");

export interface FixtureInfo {
  readonly file: string;
  readonly markers: string[];
  readonly binary?: boolean;
}

export const FIXTURES = {
  simpleProse: { file: "simple-prose.txt", markers: ["FIXTURE_SIMPLE_TXT_TITLE"] },
  longBook: { file: "long-book.txt", markers: ["FIXTURE_LONG_BOOK_CH1"] },
  oneLongLine: { file: "one-long-line.txt", markers: ["FIXTURE_ONE_LONG_LINE"] },
  unicodeMixed: { file: "unicode-mixed.txt", markers: ["FIXTURE_UNICODE_CYRILLIC_MARKER"] },
  empty: { file: "empty.txt", markers: [] },
  whitespaceOnly: { file: "whitespace-only.txt", markers: [] },
  crlfEndings: { file: "crlf-endings.txt", markers: ["FIXTURE_CRLF_MARKER"] },
  crEndings: { file: "cr-endings.txt", markers: ["FIXTURE_CR_MARKER"] },
  txtCommandOutput: { file: "txt-command-output.txt", markers: ["FIXTURE_TXT_COMMAND_OUTPUT"] },
  standardMarkdown: { file: "standard-markdown.md", markers: ["FIXTURE_STANDARD_MD_HEADING"] },
  standardMarkdownAlt: { file: "standard-markdown.markdown", markers: ["FIXTURE_STANDARD_MD_HEADING"] },
  codeHeavyNotes: { file: "code-heavy-notes.md", markers: ["FIXTURE_CODE_HEAVY_JS_SNIPPET"] },
  unsafeMarkdown: { file: "unsafe-markdown.md", markers: ["FIXTURE_UNSAFE_SCRIPT_MARKER"] },
  markdownTable: { file: "markdown-table.md", markers: ["FIXTURE_MD_TABLE_CELL"] },
  malformedMarkdown: { file: "malformed-markdown.md", markers: ["FIXTURE_MALFORMED_MD"] },
  manyHeadings: { file: "many-headings.md", markers: ["FIXTURE_MANY_HEADINGS"] },
  largeAccepted: { file: "large-accepted.md", markers: ["FIXTURE_LARGE_ACCEPTED"] },
  unsupportedPdf: { file: "unsupported.pdf", markers: [], binary: true },
  unsupportedJson: { file: "unsupported.json", markers: [] },
  remoteImage: { file: "remote-image.md", markers: ["FIXTURE_REMOTE_IMAGE_ALT"] },
  links: { file: "links.md", markers: ["FIXTURE_LINKS_END", "FIXTURE_LINKS_EXTERNAL"] },
  romanBinarySearch: { file: "roman-leetcode-binary-search.md", markers: ["FIXTURE_ROMAN_BINARY_SEARCH_TITLE"] },
  romanSlidingWindow: { file: "roman-leetcode-sliding-window.md", markers: ["FIXTURE_ROMAN_SLIDING_WINDOW_TITLE"] },
  romanJsDebug: { file: "roman-debugging-javascript.md", markers: ["FIXTURE_ROMAN_JS_DEBUG_TITLE"] },
  romanRateLimit: { file: "roman-system-design-rate-limit.md", markers: ["FIXTURE_ROMAN_RATE_LIMIT_TITLE"] },
  romanMixedNotes: { file: "roman-mixed-quotes-and-code.md", markers: ["FIXTURE_ROMAN_MIXED_NOTES_TITLE"] },
} satisfies Record<string, FixtureInfo>;

export type FixtureName = keyof typeof FIXTURES;

export function fixturePath(name: FixtureName): string {
  return join(FIXTURES_ROOT, FIXTURES[name].file);
}

export function fixtureMarkers(name: FixtureName): string[] {
  return FIXTURES[name].markers;
}

/** Read a text fixture's content (used for drag-drop simulation via string). */
export async function readFixtureText(name: FixtureName): Promise<string> {
  return readFile(fixturePath(name), "utf8");
}

/** MIME type sent for a dropped file, matching what a browser would report. */
export function fixtureMimeType(name: FixtureName): string {
  const file = FIXTURES[name].file;
  if (file.endsWith(".txt")) return "text/plain";
  if (file.endsWith(".md") || file.endsWith(".markdown")) return "text/markdown";
  if (file.endsWith(".json")) return "application/json";
  if (file.endsWith(".pdf")) return "application/pdf";
  return "application/octet-stream";
}
