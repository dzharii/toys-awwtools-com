function normalizePayload(payload = {}) {
  return {
    text: String(payload.text ?? ""),
    html: payload.html == null ? "" : String(payload.html),
    imageBlob: payload.imageBlob ?? null
  };
}

export async function copyToClipboard(payload = {}, environment = globalThis) {
  const normalized = normalizePayload(payload);
  if (!normalized.text && !normalized.html && !normalized.imageBlob) {
    return { ok: false, status: "empty", reason: "No clipboard payload was provided.", fallbackText: "" };
  }

  const nav = environment.navigator;
  const clipboard = nav?.clipboard;
  const fallbackText = normalized.text || normalized.html;

  if (!clipboard) {
    return { ok: false, status: "fallback", reason: "Clipboard API is unavailable.", fallbackText };
  }

  try {
    if (normalized.html && typeof clipboard.write === "function" && typeof environment.ClipboardItem === "function") {
      const item = new environment.ClipboardItem({
        "text/html": new Blob([normalized.html], { type: "text/html" }),
        "text/plain": new Blob([normalized.text || normalized.html], { type: "text/plain" })
      });
      await clipboard.write([item]);
      return { ok: true, status: "success", method: "write" };
    }

    if (normalized.imageBlob && typeof clipboard.write === "function" && typeof environment.ClipboardItem === "function") {
      const item = new environment.ClipboardItem({ [normalized.imageBlob.type || "image/png"]: normalized.imageBlob });
      await clipboard.write([item]);
      return { ok: true, status: "success", method: "write" };
    }

    if (typeof clipboard.writeText === "function" && fallbackText) {
      await clipboard.writeText(fallbackText);
      return { ok: true, status: "success", method: "writeText" };
    }

    return { ok: false, status: "fallback", reason: "Clipboard API cannot write this payload.", fallbackText };
  } catch (error) {
    return {
      ok: false,
      status: "failed",
      reason: error?.message || "Clipboard write failed.",
      error,
      fallbackText
    };
  }
}
