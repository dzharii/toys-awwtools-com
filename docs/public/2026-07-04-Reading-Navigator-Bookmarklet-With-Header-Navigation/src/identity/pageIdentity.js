/**
 * Page identity. Builds a deterministic identity object used as the storage
 * key and to detect content mismatches on restore.
 */

import { CONFIG } from "../config.js";
import { normalizeUrl } from "./urlNormalize.js";
import { wallNow } from "../utils/time.js";

export function computePageIdentity() {
  const originalUrl = window.location.href;
  const normalizedUrl = normalizeUrl(originalUrl);
  const key = CONFIG.storagePrefix + normalizedUrl;

  return {
    version: CONFIG.identityKeyVersion,
    key,
    normalizedUrl,
    originalUrl,
    origin: window.location.origin,
    pathname: window.location.pathname,
    title: document.title || "",
    createdAt: wallNow(),
    contentFingerprint: null,
    headingFingerprint: null,
  };
}

/** True when a route/URL change means we must recompute identity. */
export function hasIdentityChanged(identity) {
  if (!identity) return true;
  return normalizeUrl(window.location.href) !== identity.normalizedUrl;
}
