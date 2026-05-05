import { PERFORMANCE_LIMITS } from "../app/constants.js";

export function formatTiming(value) {
  if (!Number.isFinite(value)) return "—";
  if (value < 1000) return `${Math.round(value * 10) / 10}ms`;
  return `${Math.round((value / 1000) * 100) / 100}s`;
}

export function buildPerformanceWarnings({ charCount = 0, rowCount = 0, columnCount = 0, renderLimited = false, reason = null }) {
  const warnings = [];
  if (charCount >= PERFORMANCE_LIMITS.veryLargeCharCount) warnings.push("Input text is very large for a browser-only workflow.");
  else if (charCount >= PERFORMANCE_LIMITS.largeCharCount) warnings.push("Input text is large and may process slowly.");

  if (rowCount >= PERFORMANCE_LIMITS.veryLargeRowCount) warnings.push("Very large row count detected. Rendering is intentionally limited.");
  else if (rowCount >= PERFORMANCE_LIMITS.largeRowCount) warnings.push("Large row count detected.");

  if (columnCount >= PERFORMANCE_LIMITS.veryLargeColumnCount) warnings.push("Very wide schema detected. Use column search/visibility controls.");
  else if (columnCount >= PERFORMANCE_LIMITS.largeColumnCount) warnings.push("Wide schema detected.");

  if (renderLimited) {
    warnings.push(reason === "cellLimit" ? "Render limited by cell count." : "Render limited by row cap.");
  }

  return [...new Set(warnings)];
}

