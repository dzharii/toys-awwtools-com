import { readFileSync } from "node:fs";
import { join } from "node:path";
import { SUITE_ROOT, type RegistryEntry } from "./registry-lib.js";

/**
 * Seeded sampling for Agentic Analysis Mode.
 *
 * A deterministic PRNG (mulberry32) makes a selection fully reproducible from
 * its seed. Selection is category-balanced by default: it first guarantees one
 * test from as many categories as possible, then fills the remaining slots
 * randomly from the whole pool, then shuffles the final list. Sampling is
 * without replacement.
 */
export function loadRegistry(): RegistryEntry[] {
  const path = join(SUITE_ROOT, "src/agentic/test-registry.json");
  return JSON.parse(readFileSync(path, "utf8")) as RegistryEntry[];
}

/** mulberry32: small, fast, deterministic PRNG seeded by a 32-bit integer. */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function randomSeed(): number {
  return Math.floor(Math.random() * 0xffffffff) >>> 0;
}

function shuffleInPlace<T>(arr: T[], rand: () => number): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export interface SampleOptions {
  count: number;
  seed: number;
  /** Restrict to one category (folder name), e.g. "settings". */
  category?: string;
  /** Only include tests whose tags include this tag. */
  tag?: string;
  /** Exclude tests whose tags include this tag. */
  excludeTag?: string;
  /** Disable category balancing (pure random). */
  noBalance?: boolean;
}

export interface SampleResult {
  seed: number;
  countRequested: number;
  countSelected: number;
  selectionMode: string;
  selected: RegistryEntry[];
}

export function sampleTests(registry: RegistryEntry[], options: SampleOptions): SampleResult {
  let pool = registry.slice();
  if (options.category) pool = pool.filter((e) => e.category === options.category);
  if (options.tag) pool = pool.filter((e) => e.tags.includes(options.tag!));
  if (options.excludeTag) pool = pool.filter((e) => !e.tags.includes(options.excludeTag!));

  const rand = mulberry32(options.seed);
  const target = Math.min(options.count, pool.length);
  const selectionMode = options.noBalance ? "seeded-random" : "category-balanced-random";

  const selected: RegistryEntry[] = [];
  const used = new Set<string>();

  if (!options.noBalance) {
    // Round 1: one test from as many categories as possible (categories shuffled).
    const byCat = new Map<string, RegistryEntry[]>();
    for (const e of pool) {
      if (!byCat.has(e.category)) byCat.set(e.category, []);
      byCat.get(e.category)!.push(e);
    }
    const cats = shuffleInPlace([...byCat.keys()], rand);
    for (const cat of cats) {
      if (selected.length >= target) break;
      const items = shuffleInPlace(byCat.get(cat)!.slice(), rand);
      const pick = items[0];
      if (pick && !used.has(pick.id)) {
        selected.push(pick);
        used.add(pick.id);
      }
    }
  }

  // Fill remaining slots randomly from the whole (filtered) pool, without replacement.
  const remaining = shuffleInPlace(pool.filter((e) => !used.has(e.id)), rand);
  for (const e of remaining) {
    if (selected.length >= target) break;
    selected.push(e);
    used.add(e.id);
  }

  // Final shuffle of the selected list.
  shuffleInPlace(selected, rand);

  return {
    seed: options.seed,
    countRequested: options.count,
    countSelected: selected.length,
    selectionMode,
    selected,
  };
}
