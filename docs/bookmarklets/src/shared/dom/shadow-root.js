/**
 * Ensures a dedicated shadow host exists so bookmarklet UI can stay isolated from page styles.
 */
export function ensureShadowHost(options = {}) {
  const { id, tagName = "div", mode = "open", mount = document.documentElement } = options;

  if (!id) {
    throw new Error("ensureShadowHost requires an id");
  }

  let host = document.getElementById(id);
  const created = !host;

  if (!host) {
    host = document.createElement(tagName);
    host.id = id;
    mount.appendChild(host);
  }

  const root = host.shadowRoot || host.attachShadow({ mode });
  return { host, root, created };
}

/**
 * Removes the bookmarklet shadow host to fully tear down injected UI state.
 */
export function removeShadowHost(id) {
  const host = document.getElementById(id);
  if (host) {
    host.remove();
    return true;
  }

  return false;
}
