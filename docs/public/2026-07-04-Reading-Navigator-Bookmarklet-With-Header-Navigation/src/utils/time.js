/**
 * Time helpers. Distinguish monotonic runtime clock from wall-clock.
 *
 *  - now()      : monotonic (performance.now) for elapsed durations.
 *  - wallNow()  : Date.now for persisted timestamps.
 */

export function now() {
  if (typeof performance !== "undefined" && typeof performance.now === "function") {
    return performance.now();
  }
  return Date.now();
}

export function wallNow() {
  return Date.now();
}

/** Human-friendly relative time such as "3 minutes ago". */
export function formatRelativeTime(wallMs, referenceMs) {
  const ref = typeof referenceMs === "number" ? referenceMs : Date.now();
  const deltaSec = Math.round((ref - wallMs) / 1000);
  if (!isFinite(deltaSec)) return "unknown";
  if (deltaSec < 5) return "just now";
  if (deltaSec < 60) return deltaSec + " seconds ago";
  const minutes = Math.round(deltaSec / 60);
  if (minutes < 60) return minutes + (minutes === 1 ? " minute ago" : " minutes ago");
  const hours = Math.round(minutes / 60);
  if (hours < 24) return hours + (hours === 1 ? " hour ago" : " hours ago");
  const days = Math.round(hours / 24);
  if (days < 30) return days + (days === 1 ? " day ago" : " days ago");
  const months = Math.round(days / 30);
  if (months < 12) return months + (months === 1 ? " month ago" : " months ago");
  const years = Math.round(months / 12);
  return years + (years === 1 ? " year ago" : " years ago");
}

/** Absolute local time label, e.g. "2026-07-04 13:05". */
export function formatAbsoluteTime(wallMs) {
  try {
    const d = new Date(wallMs);
    const pad = (n) => String(n).padStart(2, "0");
    return (
      d.getFullYear() +
      "-" +
      pad(d.getMonth() + 1) +
      "-" +
      pad(d.getDate()) +
      " " +
      pad(d.getHours()) +
      ":" +
      pad(d.getMinutes())
    );
  } catch (_e) {
    return "unknown";
  }
}
