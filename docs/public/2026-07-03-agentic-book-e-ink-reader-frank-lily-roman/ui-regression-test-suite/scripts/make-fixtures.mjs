// Generates the fixture files referenced by the suite's FIXTURES registry.
// Each text fixture embeds a unique marker so tests assert on markers rather
// than brittle text. Run with: node scripts/make-fixtures.mjs
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, "../../tests/fixtures");
mkdirSync(ROOT, { recursive: true });

function w(name, content) {
  writeFileSync(join(ROOT, name), content);
  console.log("wrote", name, content.length, "bytes");
}

// --- simple prose (short TXT) ---
w(
  "simple-prose.txt",
  `FIXTURE_SIMPLE_TXT_TITLE

This is a short, calm piece of prose used to verify basic TXT rendering.
It has a few paragraphs so pagination and scrolling both have something to show.

The second paragraph continues the thought. Reading should feel comfortable,
with a constrained line width and generous line height.

A third paragraph closes the sample. FIXTURE_SIMPLE_TXT_END
`,
);

// --- long book (spans many pages) ---
{
  const paras = [];
  paras.push("FIXTURE_LONG_BOOK_CH1 Chapter One");
  for (let i = 1; i <= 400; i++) {
    paras.push(
      `Paragraph ${i}. ` +
        "The quiet reader turned another page, and the words settled like dust in a still room. " +
        "Nothing hurried them; nothing pulled them away. Sentence followed sentence in calm order, " +
        "and the margins held the text like a frame holds a picture. ".repeat(2),
    );
    if (i === 200) paras.push("FIXTURE_LONG_BOOK_MID Chapter Two");
  }
  paras.push("FIXTURE_LONG_BOOK_END The end.");
  w("long-book.txt", paras.join("\n\n") + "\n");
}

// --- one very long line (wrapping / no horizontal overflow) ---
w(
  "one-long-line.txt",
  "FIXTURE_ONE_LONG_LINE " +
    "word ".repeat(4000).trim() +
    " FIXTURE_ONE_LONG_LINE_END\n",
);

// --- unicode mixed ---
w(
  "unicode-mixed.txt",
  `FIXTURE_UNICODE_TITLE

FIXTURE_UNICODE_CYRILLIC_MARKER Привет, мир. Это проверка Юникода.
Greek: Καλημέρα κόσμε. Δοκιμή.
CJK: 你好世界。これはテストです。안녕하세요.
Emoji: 📖🕯️🌫️ Math: ∑ ∫ √ ≈ ∞ Arrows: → ← ↔
RTL sample: مرحبا بالعالم — שלום עולם
FIXTURE_UNICODE_END
`,
);

// --- empty ---
w("empty.txt", "");

// --- whitespace only ---
w("whitespace-only.txt", "   \n\n\t   \n   \n");

// --- CRLF endings ---
w(
  "crlf-endings.txt",
  ["FIXTURE_CRLF_MARKER", "", "Line one.", "Line two.", "", "Paragraph two after blank.", "FIXTURE_CRLF_END", ""].join(
    "\r\n",
  ),
);

// --- CR-only endings ---
w(
  "cr-endings.txt",
  ["FIXTURE_CR_MARKER", "", "Old Mac line one.", "Old Mac line two.", "FIXTURE_CR_END", ""].join("\r"),
);

// --- standard markdown (.md) ---
const standardMd = `# FIXTURE_STANDARD_MD_HEADING

A standard Markdown document exercising common constructs.

## Emphasis

This paragraph has **bold**, *italic*, and \`inline code\` spans. FIXTURE_STANDARD_MD_INLINE

## Lists

- First item
- Second item
  - Nested item
- Third item

1. Ordered one
2. Ordered two

## Quote

> A calm quote for the reader. FIXTURE_STANDARD_MD_QUOTE

## Rule

---

That is all. FIXTURE_STANDARD_MD_END
`;
w("standard-markdown.md", standardMd);

// --- standard markdown (.markdown extension variant) ---
w("standard-markdown.markdown", standardMd);

// --- code-heavy notes ---
w(
  "code-heavy-notes.md",
  `# FIXTURE_CODE_HEAVY_TITLE

Engineering notes with fenced code blocks.

## JavaScript

\`\`\`js
// FIXTURE_CODE_HEAVY_JS_SNIPPET
function longLineExample() {
  const aVeryLongVariableNameThatShouldNotForceHorizontalPageScroll = "abcdefghijklmnopqrstuvwxyz0123456789_abcdefghijklmnopqrstuvwxyz";
  return aVeryLongVariableNameThatShouldNotForceHorizontalPageScroll.length;
}
\`\`\`

Inline \`const x = 1;\` should stay inline.

## Shell

\`\`\`bash
echo "FIXTURE_CODE_HEAVY_BASH" && ls -la /very/long/path/that/keeps/going/and/going/and/going/to/test/wrapping
\`\`\`

End. FIXTURE_CODE_HEAVY_END
`,
);

// --- unsafe markdown (XSS attempts must be neutralized) ---
w(
  "unsafe-markdown.md",
  `# FIXTURE_UNSAFE_TITLE

FIXTURE_UNSAFE_SCRIPT_MARKER

<script>window.__unsafeMarkdownExecuted = true;</script>

<img src="x" onerror="window.__unsafeMarkdownExecuted = true;">

<a href="javascript:window.__unsafeMarkdownExecuted = true;">click</a>

[link with js scheme](javascript:window.__unsafeMarkdownExecuted=true)

<iframe src="https://example.com/should-not-load"></iframe>

<div onclick="window.__unsafeMarkdownExecuted = true;">div</div>

Normal paragraph after unsafe content. FIXTURE_UNSAFE_END
`,
);

// --- markdown table ---
w(
  "markdown-table.md",
  `# FIXTURE_MD_TABLE_TITLE

| Feature | FIXTURE_MD_TABLE_CELL | Status |
| ------- | --------------------- | ------ |
| Paged   | yes                   | ok     |
| Scroll  | yes                   | ok     |
| Tables  | maybe                 | check  |

After the table. FIXTURE_MD_TABLE_END
`,
);

// --- malformed markdown (should still render or fall back to plain text) ---
w(
  "malformed-markdown.md",
  `# FIXTURE_MALFORMED_MD

Unclosed code fence follows:

\`\`\`js
function broken() {
  return "no closing fence";

Unbalanced [link](http://ok and **bold without close and *italic without close

<div><span>unclosed tags

More text after the mess. FIXTURE_MALFORMED_END
`,
);

// --- many headings (TOC / long structure) ---
{
  const lines = ["# FIXTURE_MANY_HEADINGS", ""];
  for (let i = 1; i <= 60; i++) {
    lines.push(`## Section ${i}`, "", `Body text for section ${i}. `.repeat(3), "");
  }
  lines.push("FIXTURE_MANY_HEADINGS_END");
  w("many-headings.md", lines.join("\n"));
}

// --- large but accepted (< 15MB hard limit) ---
{
  const lines = ["# FIXTURE_LARGE_ACCEPTED", ""];
  for (let i = 1; i <= 1500; i++) {
    lines.push(`Paragraph ${i} of a large accepted document. `.repeat(6), "");
  }
  lines.push("FIXTURE_LARGE_ACCEPTED_END");
  w("large-accepted.md", lines.join("\n"));
}

// --- unsupported types ---
w(
  "unsupported.pdf",
  "%PDF-1.4\n% FIXTURE_UNSUPPORTED_PDF fake pdf content, not a real document.\n%%EOF\n",
);
w(
  "unsupported.json",
  JSON.stringify({ marker: "FIXTURE_UNSUPPORTED_JSON", note: "not a book file" }, null, 2) + "\n",
);

// --- remote image (must not auto-load) ---
w(
  "remote-image.md",
  `# FIXTURE_REMOTE_IMAGE_TITLE

Below is a remote image reference that must NOT be fetched at runtime:

![FIXTURE_REMOTE_IMAGE_ALT](https://example.com/should-not-be-requested.png)

Text after the image. FIXTURE_REMOTE_IMAGE_END
`,
);

// --- links ---
w(
  "links.md",
  `# FIXTURE_LINKS_TITLE

An [external link](https://example.com/FIXTURE_LINKS_EXTERNAL) that should open
safely with rel=noopener and must not be auto-followed.

Another [relative-looking link](./somewhere.md) FIXTURE_LINKS_RELATIVE.

A javascript-scheme link [do not run](javascript:window.__linkJsExecuted=true) FIXTURE_LINKS_JS.

End. FIXTURE_LINKS_END
`,
);

// --- TXT command-output-like note (Roman TXT009) ---
w(
  "txt-command-output.txt",
  `FIXTURE_TXT_COMMAND_OUTPUT

DEPLOYMENT CHECK

$ bun run validate
typecheck: ok
tests: ok
network: 0 external requests

Indented note:
    The reader should preserve this indentation enough
    that old technical notes remain understandable.
`,
);

// --- Roman developer notes (code-heavy technical notes) ---
w(
  "roman-leetcode-binary-search.md",
  `# Rotated Binary Search Notes
FIXTURE_ROMAN_BINARY_SEARCH_TITLE

Problem: Search in Rotated Sorted Array
Source: https://leetcode.com/problems/search-in-rotated-sorted-array/

## Why this matters

Binary search is easy to remember in the abstract and easy to break in practice.
The useful question is not "is the array sorted?".
The useful question is "which half is sorted right now?"

## JavaScript solution

\`\`\`js
function search(nums, target) {
  let left = 0;
  let right = nums.length - 1;

  while (left <= right) {
    const mid = left + Math.floor((right - left) / 2);

    if (nums[mid] === target) return mid;

    if (nums[left] <= nums[mid]) {
      if (nums[left] <= target && target < nums[mid]) {
        right = mid - 1;
      } else {
        left = mid + 1;
      }
    } else {
      if (nums[mid] < target && target <= nums[right]) {
        left = mid + 1;
      } else {
        right = mid - 1;
      }
    }
  }

  return -1;
}
\`\`\`

## Complexity

| Case    | Time     | Space |
| ------- | -------- | ----- |
| Average | O(log n) | O(1)  |
| Worst   | O(log n) | O(1)  |

## Mistakes I made

- I forgot that equality on the left sorted half matters.
- I moved both pointers in one branch and skipped the target.
- I tested only arrays without duplicates.

> The point of the pattern is to keep one invariant alive. FIXTURE_ROMAN_BINARY_SEARCH_QUOTE

End. FIXTURE_ROMAN_BINARY_SEARCH_END
`,
);

w(
  "roman-leetcode-sliding-window.md",
  `# Sliding Window Field Notes
FIXTURE_ROMAN_SLIDING_WINDOW_TITLE

Roman uses this note when he wants to remember whether a window should expand,
shrink, or reset.

## Pattern

1. Move the right pointer.
2. Add the new item into window state.
3. Shrink while the invariant is broken.
4. Record the answer only after the invariant is valid.

## Python example

\`\`\`py
def length_of_longest_substring(text: str) -> int:
    seen: dict[str, int] = {}
    left = 0
    best = 0

    for right, char in enumerate(text):
        if char in seen and seen[char] >= left:
            left = seen[char] + 1

        seen[char] = right
        best = max(best, right - left + 1)

    return best
\`\`\`

## Debug questions

- What is the invariant?
- Which side of the window moves?
- Does the answer update before or after shrinking?
- What happens when the input is empty?

Inline reminder: \`left\` never moves backward. FIXTURE_ROMAN_SLIDING_WINDOW_INLINE

End. FIXTURE_ROMAN_SLIDING_WINDOW_END
`,
);

w(
  "roman-debugging-javascript.md",
  `# JavaScript Debugging Notes
FIXTURE_ROMAN_JS_DEBUG_TITLE

These are small reminders for production debugging. They are not a tutorial.
They are notes Roman wants to reread on a phone.

## Event loop checkpoint

\`\`\`js
console.log("A");

queueMicrotask(() => {
  console.log("B");
});

setTimeout(() => {
  console.log("C");
}, 0);

Promise.resolve().then(() => {
  console.log("D");
});

console.log("E");
\`\`\`

Expected order:

\`\`\`text
A
E
B
D
C
\`\`\`

## Fetch failure shape

\`\`\`js
async function loadJson(url) {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(\`HTTP \${response.status}\`);
  }

  return response.json();
}
\`\`\`

## Notes

- Network failure rejects the promise.
- HTTP 500 does not reject by itself.
- \`response.ok\` is the part I always forget.

End. FIXTURE_ROMAN_JS_DEBUG_END
`,
);

w(
  "roman-system-design-rate-limit.md",
  `# Rate Limiter Notes
FIXTURE_ROMAN_RATE_LIMIT_TITLE

This note is for train reading. It must work on mobile.

## Token bucket idea

A bucket has capacity. Tokens refill over time. A request consumes one token.
If no token is available, reject or delay the request.

## Pseudocode

\`\`\`txt
state:
  capacity = 100
  tokens = 100
  refill_rate = 10 tokens per second
  last_refill = now

on_request(user_id):
  elapsed = now - last_refill
  tokens = min(capacity, tokens + elapsed * refill_rate)
  last_refill = now

  if tokens >= 1:
    tokens = tokens - 1
    allow request
  else:
    reject request
\`\`\`

## Trade-offs

| Approach       | Good for        | Risk            |
| -------------- | --------------- | --------------- |
| Fixed window   | simple counters | boundary bursts |
| Sliding window | smoother limits | more storage    |
| Token bucket   | burst tolerant  | clock bugs      |
| Leaky bucket   | steady output   | queue pressure  |

## Link reminders

- RFC 6585 status 429: https://www.rfc-editor.org/rfc/rfc6585
- Redis sorted sets are useful, but do not make the reader fetch anything.

End. FIXTURE_ROMAN_RATE_LIMIT_END
`,
);

w(
  "roman-mixed-quotes-and-code.md",
  `# Quotes, Jokes, And Small Code
FIXTURE_ROMAN_MIXED_NOTES_TITLE

> "Programs must be written for people to read."
> Then, only incidentally, for machines to execute. FIXTURE_ROMAN_MIXED_QUOTE

Roman writes small jokes in the same file as serious notes.

## Small shell reminder

\`\`\`sh
git log --oneline --decorate --graph -12
git diff --stat main...HEAD
\`\`\`

## Tiny JSON shape

\`\`\`json
{
  "reader": "e-ink",
  "mode": "local",
  "storesBookContent": false
}
\`\`\`

## Reminder

- Do not turn the reader into a note database.
- Do not store my snippets.
- Do not break my code blocks on mobile.

End. FIXTURE_ROMAN_MIXED_NOTES_END
`,
);

console.log("done");
