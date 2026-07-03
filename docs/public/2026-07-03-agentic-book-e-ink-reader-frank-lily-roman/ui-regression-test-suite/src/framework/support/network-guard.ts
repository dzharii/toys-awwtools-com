import type { UiDiagnostics } from "../diagnostics/diagnostics.js";

/**
 * Network guard: asserts the app makes no runtime requests beyond the local
 * static server origin. The app ships connect-src 'self' (so it can read its
 * own local feed.xml) and an offline-only promise, so any request to another
 * origin is a failure. Requests to the suite's own 127.0.0.1 static server
 * (HTML, CSS, JS, fonts, images, fixtures, feed.xml) are expected and allowed.
 */
export interface NetworkGuard {
  assertNoUnexpectedRequests(): void;
  unexpectedRequests(): string[];
}

export function createNetworkGuard(diagnostics: UiDiagnostics, allowedBaseUrl: string): NetworkGuard {
  function unexpected(): string[] {
    return diagnostics
      .requests()
      .filter((r) => {
        if (r.url.startsWith(allowedBaseUrl)) return false;
        // data: URIs are inline (allowed by CSP img-src 'self' data:).
        if (r.url.startsWith("data:")) return false;
        // about:blank and blob: are local, non-network.
        if (r.url.startsWith("about:") || r.url.startsWith("blob:")) return false;
        return true;
      })
      .map((r) => `${r.method} ${r.resourceType} ${r.url}`);
  }

  return {
    unexpectedRequests: unexpected,
    assertNoUnexpectedRequests(): void {
      const bad = unexpected();
      if (bad.length > 0) {
        throw new Error(`Unexpected runtime network request(s):\n  ${bad.join("\n  ")}`);
      }
    },
  };
}
