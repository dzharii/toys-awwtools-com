/**
 * Minimal, dependency-free all-pairs (pairwise) combination generator.
 *
 * Given named factors each with a list of values, it returns a set of test
 * cases such that every pair of values from every pair of factors appears in at
 * least one case. This keeps interaction coverage high while the case count
 * stays far below the full cartesian product. The algorithm is a simple greedy
 * covering heuristic — deterministic given stable input order.
 */
export type FactorValues = Record<string, readonly string[]>;
export type PairwiseCase<F extends FactorValues> = { [K in keyof F]: F[K][number] };

function allPairs(factors: string[]): [string, string][] {
  const pairs: [string, string][] = [];
  for (let i = 0; i < factors.length; i++) {
    for (let j = i + 1; j < factors.length; j++) pairs.push([factors[i], factors[j]]);
  }
  return pairs;
}

function pairKey(fa: string, va: string, fb: string, vb: string): string {
  return `${fa}=${va}|${fb}=${vb}`;
}

export function generatePairwise<F extends FactorValues>(factors: F): PairwiseCase<F>[] {
  const names = Object.keys(factors);
  if (names.length === 0) return [];

  // Build the set of value-pairs that must be covered.
  const remaining = new Set<string>();
  for (const [fa, fb] of allPairs(names)) {
    for (const va of factors[fa]) {
      for (const vb of factors[fb]) remaining.add(pairKey(fa, va, fb, vb));
    }
  }

  const cases: PairwiseCase<F>[] = [];

  const pairsCoveredBy = (candidate: Record<string, string>): string[] => {
    const covered: string[] = [];
    for (const [fa, fb] of allPairs(names)) {
      const k = pairKey(fa, candidate[fa], fb, candidate[fb]);
      if (remaining.has(k)) covered.push(k);
    }
    return covered;
  };

  while (remaining.size > 0) {
    // Seed a case from an uncovered pair, then greedily fill the other factors
    // by choosing the value that newly covers the most pairs.
    const seed = remaining.values().next().value as string;
    const [left, right] = seed.split("|");
    const [fa, va] = left.split("=");
    const [fb, vb] = right.split("=");

    const candidate: Record<string, string> = {};
    candidate[fa] = va;
    candidate[fb] = vb;

    for (const name of names) {
      if (name in candidate) continue;
      let best = factors[name][0];
      let bestScore = -1;
      for (const value of factors[name]) {
        const trial = { ...candidate, [name]: value };
        const score = pairsCoveredBy(trial).length;
        if (score > bestScore) {
          bestScore = score;
          best = value;
        }
      }
      candidate[name] = best;
    }

    for (const k of pairsCoveredBy(candidate)) remaining.delete(k);
    cases.push(candidate as PairwiseCase<F>);
  }

  return cases;
}

/** Build a short, stable, human-readable label from a case. */
export function caseLabel<F extends FactorValues>(c: PairwiseCase<F>): string {
  return Object.entries(c)
    .map(([, v]) => v)
    .join(" · ");
}
