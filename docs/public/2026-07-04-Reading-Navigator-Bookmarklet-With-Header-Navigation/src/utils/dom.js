/**
 * DOM helpers. Keep DOM-reading and DOM-building utilities here so callers can
 * stay small and consistent. Nothing here writes page-derived text via
 * innerHTML.
 */

import { CONFIG } from "../config.js";

/** Create an element with optional props and children. Internal use only. */
export function el(tag, props, children) {
  const node = document.createElement(tag);
  if (props) {
    for (const key in props) {
      if (!Object.prototype.hasOwnProperty.call(props, key)) continue;
      const value = props[key];
      if (value == null) continue;
      if (key === "class" || key === "className") {
        node.className = value;
      } else if (key === "text") {
        // Always safe: assigns as text, never parsed as HTML.
        node.textContent = value;
      } else if (key === "dataset" && typeof value === "object") {
        for (const dk in value) node.dataset[dk] = value[dk];
      } else if (key === "style" && typeof value === "object") {
        for (const sk in value) node.style[sk] = value[sk];
      } else if (key.slice(0, 2) === "on" && typeof value === "function") {
        node.addEventListener(key.slice(2).toLowerCase(), value);
      } else if (key in node && key !== "list") {
        try {
          node[key] = value;
        } catch (_e) {
          node.setAttribute(key, value);
        }
      } else {
        node.setAttribute(key, value);
      }
    }
  }
  if (children != null) {
    appendChildren(node, children);
  }
  return node;
}

export function appendChildren(node, children) {
  const list = Array.isArray(children) ? children : [children];
  for (const child of list) {
    if (child == null || child === false) continue;
    if (typeof child === "string" || typeof child === "number") {
      node.appendChild(document.createTextNode(String(child)));
    } else {
      node.appendChild(child);
    }
  }
}

/** Remove all children of a node. */
export function clearChildren(node) {
  while (node.firstChild) node.removeChild(node.firstChild);
}

/** Normalize visible text: collapse whitespace and trim. */
export function normalizeText(raw) {
  return String(raw || "").replace(/\s+/g, " ").trim();
}

/** Current vertical scroll offset of the document. */
export function getScrollTop() {
  return window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
}

/** Total scrollable document height. */
export function getDocumentHeight() {
  const b = document.body;
  const e = document.documentElement;
  return Math.max(
    b ? b.scrollHeight : 0,
    b ? b.offsetHeight : 0,
    e ? e.clientHeight : 0,
    e ? e.scrollHeight : 0,
    e ? e.offsetHeight : 0
  );
}

export function getViewportHeight() {
  return window.innerHeight || document.documentElement.clientHeight || 0;
}

/**
 * Is the element rendered and non-trivially sized? Rejects display:none,
 * visibility:hidden, zero-area elements, and off-screen collapsed nodes.
 */
export function isElementVisible(element) {
  if (!element || element.nodeType !== 1) return false;
  const style = window.getComputedStyle(element);
  if (!style) return false;
  if (style.display === "none" || style.visibility === "hidden" || style.visibility === "collapse") {
    return false;
  }
  if (parseFloat(style.opacity) === 0) return false;
  const rect = element.getBoundingClientRect();
  if (rect.width <= 1 && rect.height <= 1) return false;
  return true;
}

/** Whether the element is inside the bookmarklet host (should be ignored). */
export function isInsideAppHost(element) {
  if (!element) return false;
  let node = element;
  while (node) {
    if (node.id === CONFIG.hostId) return true;
    if (node.nodeType === 1 && node.hasAttribute && node.hasAttribute(CONFIG.hostDataAttr)) {
      return true;
    }
    node = node.parentNode || (node.host ? node.host : null);
  }
  return false;
}

/**
 * Compute a compact, reasonably stable CSS-like DOM path from a root to a
 * descendant element using nth-of-type. Used only as a restore fallback.
 */
export function computeDomPath(element, root) {
  if (!element || element.nodeType !== 1) return "";
  const parts = [];
  let node = element;
  const stopAt = root || document.body;
  while (node && node.nodeType === 1 && node !== stopAt) {
    const tag = node.tagName.toLowerCase();
    let index = 1;
    let sibling = node.previousElementSibling;
    while (sibling) {
      if (sibling.tagName === node.tagName) index++;
      sibling = sibling.previousElementSibling;
    }
    parts.unshift(tag + ":nth-of-type(" + index + ")");
    node = node.parentElement;
    if (parts.length > 30) break; // safety
  }
  return parts.join(">");
}

/** Resolve a DOM path (relative to root) back to an element, or null. */
export function resolveDomPath(domPath, root) {
  if (!domPath) return null;
  const scope = root || document.body;
  try {
    return scope.querySelector(":scope>" + domPath.split(">").join(">"));
  } catch (_e) {
    // Fallback manual walk if :scope combinator is unsupported for the shape.
    return manualResolveDomPath(domPath, scope);
  }
}

function manualResolveDomPath(domPath, scope) {
  const segments = domPath.split(">");
  let current = scope;
  for (const seg of segments) {
    const match = /^([a-z0-9-]+):nth-of-type\((\d+)\)$/i.exec(seg);
    if (!match || !current) return null;
    const tag = match[1].toUpperCase();
    const nth = parseInt(match[2], 10);
    let count = 0;
    let found = null;
    for (const child of current.children) {
      if (child.tagName === tag) {
        count++;
        if (count === nth) {
          found = child;
          break;
        }
      }
    }
    if (!found) return null;
    current = found;
  }
  return current;
}

export function prefersReducedMotion() {
  try {
    return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  } catch (_e) {
    return false;
  }
}

/** Absolute top coordinate (document space) of an element's rect. */
export function absoluteTop(element, scrollTop) {
  const rect = element.getBoundingClientRect();
  return rect.top + (typeof scrollTop === "number" ? scrollTop : getScrollTop());
}
