/**
 * URL normalization for deterministic page identity.
 *
 * Rules (see design note K00):
 *  - Keep protocol, lowercased hostname, non-default port, pathname.
 *  - Drop hash by default.
 *  - Drop known tracking params (utm_*, fbclid, gclid, msclkid, etc.).
 *  - Keep remaining meaningful query params, sorted for stability.
 *  - Omit empty query.
 */

const TRACKING_PARAM_EXACT = new Set([
  "fbclid",
  "gclid",
  "msclkid",
  "dclid",
  "gbraid",
  "wbraid",
  "yclid",
  "mc_eid",
  "mc_cid",
  "igshid",
  "ref",
  "ref_src",
  "ref_url",
  "spm",
  "scm",
  "_hsenc",
  "_hsmi",
  "vero_id",
  "oly_enc_id",
  "oly_anon_id",
]);

const TRACKING_PARAM_PREFIX = ["utm_", "pk_", "piwik_", "matomo_", "hsa_"];

function isTrackingParam(name) {
  const lower = name.toLowerCase();
  if (TRACKING_PARAM_EXACT.has(lower)) return true;
  for (const prefix of TRACKING_PARAM_PREFIX) {
    if (lower.indexOf(prefix) === 0) return true;
  }
  return false;
}

const DEFAULT_PORTS = { "http:": "80", "https:": "443" };

export function normalizeUrl(href) {
  let url;
  try {
    url = new URL(href);
  } catch (_e) {
    // Non-URL context (rare). Fall back to a trimmed string.
    return String(href || "").split("#")[0];
  }

  const protocol = url.protocol;
  const hostname = url.hostname.toLowerCase();

  let portPart = "";
  if (url.port && DEFAULT_PORTS[protocol] !== url.port) {
    portPart = ":" + url.port;
  }

  // Collapse repeated slashes in the pathname (safe), keep a single leading slash.
  let pathname = url.pathname.replace(/\/{2,}/g, "/");
  if (pathname === "") pathname = "/";

  // Filter and sort query parameters.
  const kept = [];
  url.searchParams.forEach((value, key) => {
    if (!isTrackingParam(key)) kept.push([key, value]);
  });
  kept.sort((a, b) => (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : a[1] < b[1] ? -1 : 1));

  let query = "";
  if (kept.length) {
    const parts = kept.map(([k, v]) => (v === "" ? encodeURIComponent(k) : encodeURIComponent(k) + "=" + encodeURIComponent(v)));
    query = "?" + parts.join("&");
  }

  return protocol + "//" + hostname + portPart + pathname + query;
}
