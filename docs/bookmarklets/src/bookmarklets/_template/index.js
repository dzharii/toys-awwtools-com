import { ensureShadowHost, removeShadowHost } from "../../shared/dom/shadow-root.js";
import { upsertStyle } from "../../shared/dom/style-text.js";

const HOST_ID = "bookmarklet-template-host";

(function runBookmarkletTemplate() {
  if (removeShadowHost(HOST_ID)) {
    return;
  }

  const { root } = ensureShadowHost({ id: HOST_ID });

  upsertStyle(
    root,
    "template-style",
    `
      *, *::before, *::after { box-sizing: border-box; }
      .panel {
        position: fixed;
        top: 16px;
        right: 16px;
        z-index: 2147483647;
        font: 13px/1.4 -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        color: #111;
        background: #fff;
        border: 1px solid #d4d4d4;
        border-radius: 10px;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.18);
        padding: 12px;
        width: 280px;
      }
      .title {
        font-weight: 600;
        margin-bottom: 6px;
      }
      .meta {
        color: #555;
      }
    `,
  );

  const panel = document.createElement("div");
  panel.className = "panel";

  const title = document.createElement("div");
  title.className = "title";
  title.textContent = "Bookmarklet Template";

  const meta = document.createElement("div");
  meta.className = "meta";
  meta.textContent = "Run once to show, run again to close.";

  panel.append(title, meta);
  root.appendChild(panel);
})();
