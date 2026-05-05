const SAFE_COLOR_PATTERN = /^#([0-9a-fA-F]{6})$/;

function sanitizeInlineStyle(styleText) {
  if (typeof styleText !== "string" || !styleText.trim()) return "";
  const declarations = styleText.split(";").map((item) => item.trim()).filter(Boolean);
  const safeDeclarations = [];

  for (const declaration of declarations) {
    const separator = declaration.indexOf(":");
    if (separator <= 0) continue;
    const property = declaration.slice(0, separator).trim().toLowerCase();
    const value = declaration.slice(separator + 1).trim();
    if (property === "--jti-highlight-bg" && SAFE_COLOR_PATTERN.test(value)) {
      safeDeclarations.push(`--jti-highlight-bg: ${value}`);
    }
  }

  return safeDeclarations.join("; ");
}

function removeForbiddenNodes(root) {
  root.querySelectorAll("script, style, input, select, textarea, button, menu").forEach((node) => node.remove());
}

function cleanupHeaderButtons(root) {
  for (const th of root.querySelectorAll("th")) {
    const button = th.querySelector("button");
    if (!button) continue;
    const text = button.textContent || "";
    th.replaceChildren(document.createTextNode(text.trim()));
  }
}

function sanitizeAttributes(root) {
  const nodes = [root, ...root.querySelectorAll("*")];
  for (const node of nodes) {
    for (const name of node.getAttributeNames()) {
      const lowerName = name.toLowerCase();
      if (lowerName === "id" || lowerName.startsWith("on") || lowerName.startsWith("data-")) {
        node.removeAttribute(name);
        continue;
      }
      if (lowerName === "style") {
        const safeStyle = sanitizeInlineStyle(node.getAttribute(name) || "");
        if (safeStyle) node.setAttribute("style", safeStyle);
        else node.removeAttribute("style");
      }
    }
  }
}

export function cloneAndSanitizeTableForHtmlExport(tableElement) {
  if (!tableElement || !(tableElement instanceof Element)) return null;
  const clone = tableElement.cloneNode(true);
  cleanupHeaderButtons(clone);
  removeForbiddenNodes(clone);
  sanitizeAttributes(clone);
  return clone;
}
