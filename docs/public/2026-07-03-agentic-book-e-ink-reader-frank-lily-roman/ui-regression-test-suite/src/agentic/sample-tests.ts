/**
 * agent:sample — preview a seeded selection without running anything.
 *
 *   bun run src/agentic/sample-tests.ts --count=25
 *   bun run src/agentic/sample-tests.ts --count=25 --seed=184927
 *   bun run src/agentic/sample-tests.ts --count=10 --category=settings
 */
import { parseArgs } from "./cli-args.js";
import { loadRegistry, sampleTests, randomSeed } from "./sample-lib.js";

function main(): void {
  const args = parseArgs(process.argv.slice(2));
  const registry = loadRegistry();
  const seed = args.get("seed") !== undefined ? args.num("seed", randomSeed()) : randomSeed();
  const result = sampleTests(registry, {
    count: args.num("count", 25),
    seed,
    category: args.get("category"),
    tag: args.get("tag"),
    excludeTag: args.get("exclude-tag"),
    noBalance: args.bool("no-balance"),
  });

  console.log(`[agent:sample] seed=${result.seed} mode=${result.selectionMode} selected=${result.countSelected}/${result.countRequested}`);
  for (const e of result.selected) {
    console.log(`  ${e.id.padEnd(12)} ${e.category.padEnd(14)} ${e.title}`);
  }
  console.log(`\nReproduce with: --seed=${result.seed}`);
}

main();
