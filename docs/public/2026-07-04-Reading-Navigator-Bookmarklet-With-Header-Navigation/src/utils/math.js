/**
 * Math helpers used across geometry, tracking, and UI.
 */

export function clamp(value, min, max) {
  if (value < min) return min;
  if (value > max) return max;
  return value;
}

/** Linear intersection length between two [a,b] ranges (>= 0). */
export function intersectionLength(aStart, aEnd, bStart, bEnd) {
  const start = Math.max(aStart, bStart);
  const end = Math.min(aEnd, bEnd);
  return Math.max(0, end - start);
}

/**
 * Ratio of segment [segTop, segBottom] that lies inside window [winTop,
 * winBottom], relative to the segment's own height. Returns 0..1.
 */
export function intersectionRatio(segTop, segBottom, winTop, winBottom) {
  const height = segBottom - segTop;
  if (height <= 0) return 0;
  const overlap = intersectionLength(segTop, segBottom, winTop, winBottom);
  return clamp(overlap / height, 0, 1);
}

/** Binary search: index of the last element whose `top` is <= target. */
export function lastIndexAtOrBelow(sortedItems, target) {
  let lo = 0;
  let hi = sortedItems.length - 1;
  let result = -1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (sortedItems[mid].top <= target) {
      result = mid;
      lo = mid + 1;
    } else {
      hi = mid - 1;
    }
  }
  return result;
}

export function roundTo(value, decimals) {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}

export function safeRatio(numerator, denominator) {
  if (!denominator) return 0;
  return numerator / denominator;
}
