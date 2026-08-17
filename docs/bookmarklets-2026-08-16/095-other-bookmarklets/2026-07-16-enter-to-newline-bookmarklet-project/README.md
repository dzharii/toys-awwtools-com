---

A00 Project

---

Enter to Newline is a self-contained browser bookmarklet. While active, plain Enter inserts a newline in supported text editors. Ctrl+Enter on Windows and Linux or Cmd+Enter on Apple platforms sends through the nearest reliable form or send control.

The control panel is isolated in Shadow DOM, can be dragged, reports actions and failures, and deactivates completely when closed.

---

B00 Installation

---

Open `installer/enter-to-newline-bookmarklet.html` in a browser. Drag the Enter to Newline link to the bookmarks bar.

A manual installation can be created by copying the full content of `dist/enter-to-newline-bookmarklet-readable.txt` into a bookmark URL field. The percent-encoded variant is included as an alternative.

Some browsers remove the `javascript:` prefix when text is pasted into the address bar. Installation should be performed through a bookmark editor or by dragging the installer link.

---

C00 Operation

---

Run the bookmarklet once to activate the mode. The panel describes the current shortcuts.

Press Enter in a supported textarea or rich-text editor to insert a newline. Press Ctrl+Enter or Cmd+Enter to invoke a reliable send action.

Close the panel, press Deactivate, or run the bookmarklet again to remove the mode and restore the page's original keyboard behavior.

---

D00 Package Contents

---

| Path | Purpose |
| --- | --- |
| `source/enter-to-newline-bookmarklet.js` | Readable, unminified source function |
| `dist/enter-to-newline-bookmarklet-readable.txt` | Readable `javascript:` bookmarklet URL |
| `dist/enter-to-newline-bookmarklet.txt` | Percent-encoded bookmarklet URL for alternative import workflows |
| `installer/enter-to-newline-bookmarklet.html` | Self-contained drag-and-copy installer |
| `tests/browser-test.html` | Browser behavior harness |
| `tests/static-validation.mjs` | Package consistency checks |
| `reference/original-input.txt` | Supplied prototype and requirements |
| `specification.md` | Developer design note and requirements |
| `validation.md` | Human-readable validation summary |
| `tests/validation-results.json` | Machine-readable browser test results |
| `VERSION` | Release version |
| `SHA256SUMS.txt` | File integrity manifest |

---

E00 Validation

---

Run `node --check source/enter-to-newline-bookmarklet.js` for syntax validation.

Run `node tests/static-validation.mjs` for package consistency validation.

Open `tests/browser-test.html` directly or run it through headless Chromium. The page writes a JSON result to the document and displays a pass or fail summary.

---

F00 Constraints

---

The bookmarklet performs no network requests and does not read message text. It depends on browser DOM editing behavior and on page forms or send controls. Custom editors may reject synthetic input events or expose no reliable submission action.
