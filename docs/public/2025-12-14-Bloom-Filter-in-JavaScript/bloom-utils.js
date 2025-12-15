export const MAX_BITS = 100_000_000; // ~12.5 MB, to avoid huge allocations.
export const MAX_K = 256;

export function computeSuggestedParams(n, targetP) {
  const safeN = Math.max(1, Number.isFinite(n) ? n : 1);
  const safeP = clampProbability(targetP);
  const ln2 = Math.LN2;
  const m = Math.ceil((-safeN * Math.log(safeP)) / (ln2 * ln2));
  const k = Math.max(1, Math.ceil((m / safeN) * ln2));
  return { m, k };
}

export function computeErrorRate(m, k, n) {
  if (!Number.isFinite(m) || !Number.isFinite(k) || m <= 0 || k <= 0) return NaN;
  const safeN = Math.max(0, Number.isFinite(n) ? n : 0);
  if (safeN === 0) return 0;
  const exponent = -k * safeN / m;
  const probability = Math.pow(1 - Math.exp(exponent), k);
  return clampProbability(probability);
}

export function formatBits(bits) {
  if (!Number.isFinite(bits)) return "n/a";
  const bytes = bits / 8;
  const kib = bytes / 1024;
  const mib = kib / 1024;
  const parts = [
    `${Number(bits).toLocaleString()} bits`,
    `${bytes.toFixed(2)} bytes`,
    `${Math.ceil(bits / 32)} × 32-bit buckets`,
  ];
  if (kib >= 1) parts.push(`${kib.toFixed(2)} KiB`);
  if (mib >= 1) parts.push(`${mib.toFixed(2)} MiB`);
  return parts.join(" · ");
}

export function formatProbability(p) {
  if (!Number.isFinite(p)) return "n/a";
  if (p === 0) return "0";
  if (p < 0.0001) return p.toExponential(2);
  return p < 1 ? p.toFixed(6) : p.toLocaleString();
}

export function parseLines(text, options = {}) {
  const { dedupe = true } = options;
  const seen = dedupe ? new Set() : null;
  const values = [];
  let skippedEmpty = 0;
  let skippedDuplicates = 0;
  text.split(/\r?\n/).forEach((raw) => {
    const value = raw.trim();
    if (!value) {
      skippedEmpty += 1;
      return;
    }
    if (dedupe && seen.has(value)) {
      skippedDuplicates += 1;
      return;
    }
    if (dedupe) seen.add(value);
    values.push(value);
  });
  return { values, skippedEmpty, skippedDuplicates };
}

function clampProbability(p) {
  if (!Number.isFinite(p)) return 0.0001;
  return Math.min(0.999999999, Math.max(1e-12, p));
}
