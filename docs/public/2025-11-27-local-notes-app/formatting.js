const allowedTags = new Set(["p", "strong", "em", "code", "pre", "a", "span", "br", "div"]);
const allowedAttrs = {
  a: ["href", "target", "rel"],
  span: ["data-inline-code"]
};

function sanitizeNode(node, doc) {
  if (node.nodeType === Node.TEXT_NODE) {
    return doc.createTextNode(node.textContent);
  }
  if (node.nodeType !== Node.ELEMENT_NODE) {
    return null;
  }
  const tag = node.tagName.toLowerCase();
  if (!allowedTags.has(tag)) {
    const fragment = doc.createDocumentFragment();
    for (const child of Array.from(node.childNodes)) {
      const clean = sanitizeNode(child, doc);
      if (clean) fragment.appendChild(clean);
    }
    return fragment;
  }

  const cleanEl = doc.createElement(tag);
  const attrs = allowedAttrs[tag] || [];
  for (const name of attrs) {
    if (node.hasAttribute(name)) {
      let value = node.getAttribute(name);
      if (tag === "a" && name === "href") {
        try {
          const url = new URL(value, "http://localhost");
          value = url.href;
        } catch {
          continue;
        }
      }
      cleanEl.setAttribute(name, value);
    }
  }
  if (tag === "a") {
    cleanEl.setAttribute("target", "_blank");
    cleanEl.setAttribute("rel", "noopener noreferrer");
  }

  for (const child of Array.from(node.childNodes)) {
    const clean = sanitizeNode(child, doc);
    if (clean) cleanEl.appendChild(clean);
  }
  return cleanEl;
}

export function sanitizeHtml(html) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(`<div>${html}</div>`, "text/html");
  const wrapper = doc.body.firstChild;
  const cleanDoc = document.implementation.createHTMLDocument("");
  const fragment = cleanDoc.createDocumentFragment();
  for (const child of Array.from(wrapper.childNodes)) {
    const clean = sanitizeNode(child, cleanDoc);
    if (clean) fragment.appendChild(clean);
  }
  const tmp = document.createElement("div");
  tmp.appendChild(fragment);
  return tmp.innerHTML;
}

function textFromNode(node) {
  if (node.nodeType === Node.TEXT_NODE) {
    return node.textContent;
  }
  if (node.nodeType !== Node.ELEMENT_NODE) {
    return "";
  }
  const tag = node.tagName.toLowerCase();
  const parts = [];
  for (const child of Array.from(node.childNodes)) {
    parts.push(textFromNode(child));
  }
  const inner = parts.join("");
  switch (tag) {
    case "strong":
      return `**${inner}**`;
    case "em":
      return `*${inner}*`;
    case "code":
      return `\`${inner}\``;
    case "pre":
      return "```\n" + inner + "\n```";
    case "a": {
      const href = node.getAttribute("href") || "";
      return `${inner} (${href})`;
    }
    case "div":
    case "p":
      return inner + "\n";
    case "br":
      return "\n";
    default:
      return inner;
  }
}

export function extractContentTextFromHtml(html) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(`<div>${html}</div>`, "text/html");
  const wrapper = doc.body.firstChild;
  let result = "";
  for (const child of Array.from(wrapper.childNodes)) {
    result += textFromNode(child);
  }
  return result.trim();
}

export function execFormatCommand(command) {
  document.execCommand(command, false);
}

export function toggleCode(composer) {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return;
  const range = selection.getRangeAt(0);
  if (range.collapsed) {
    const code = document.createElement("code");
    code.textContent = "\u200b";
    range.insertNode(code);
    selection.removeAllRanges();
    const newRange = document.createRange();
    newRange.selectNodeContents(code);
    selection.addRange(newRange);
  } else {
    const code = document.createElement("code");
    code.appendChild(range.extractContents());
    range.insertNode(code);
  }
}

export function toggleCodeBlock(composer) {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return;
  const range = selection.getRangeAt(0);
  const pre = document.createElement("pre");
  pre.appendChild(range.extractContents());
  range.insertNode(pre);
  selection.removeAllRanges();
  const newRange = document.createRange();
  newRange.selectNodeContents(pre);
  selection.addRange(newRange);
}

export function applyLink(composer, url) {
  if (!url) return;
  document.execCommand("createLink", false, url);
}

export function sanitizeComposerHtml(composerEl) {
  return sanitizeHtml(composerEl.innerHTML);
}

export function getContentText(composerEl) {
  const html = sanitizeComposerHtml(composerEl);
  return extractContentTextFromHtml(html);
}
