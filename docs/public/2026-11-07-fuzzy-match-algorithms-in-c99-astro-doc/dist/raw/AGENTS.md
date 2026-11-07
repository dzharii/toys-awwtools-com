# C99 project and documentation guidance

## Explain the stored value before the loop

For each algorithm, state its input, the meaning of one cell or counter, and the returned value. Explain the difference between a similarity score and permission to bind a configuration value. Keep normalization, scoring, acceptance policy and value validation separate.

## Name the three costs and show one calculation

Use descriptive local names for cumulative edit costs instead of nested expressions. Explain unfamiliar pointer selection, shifted indices, overlapping copies and buffer limits where they occur. Ordinary assignments and loop increments need no narration.

Place one small worked example next to the relevant source block in `web/file-notes/`. Use the same example in a brief source comment when it helps someone reading only C. Show actual operands and the result. Tables should explain one calculation, not reproduce a large matrix.

## Expand unfamiliar names

Prefer plain names in explanations. Define an unavoidable abbreviation where it first appears. Optimal String Alignment is the restricted adjacent-letter-swap method: its recurrence cannot edit a swapped substring again. Full Damerau-Levenshtein permits that further editing. Longest common subsequence means shared letters in order, with gaps allowed. Preserve existing public identifiers and CSV method labels.

## Keep comments useful

Follow the restraint in the [Linux kernel commenting guidance](https://docs.kernel.org/process/coding-style.html#commenting): explain purpose, assumptions and reasons without paraphrasing obvious syntax. This is a learning project, so also explain a non-obvious calculation or storage trick once, at its implementation. Use descriptive headings and concrete examples. Remove comments that add no information.

## Link the explanation to its source

Give each algorithm article a relevant reference and say which concept it explains. Prefer author-maintained course notes, papers, official library documentation and standards. The [reference guide](docs/learning-resources.md) maps those materials to this implementation. Mark local choices, such as weights and tie rules, as project decisions. Do not copy long passages or imply that a reference prescribes those choices.

## Preserve reproducible results

Commenting changes must not retune thresholds, edit frozen manifests or replace `tests/baseline/`. Retain expression order when naming floating-point calculations. Keep `src/banned.h` byte-identical to its pinned upstream copy and include project headers after system headers.

Run `make`, `make test`, `make sanitize`, the full benchmark and `python3 scripts/verify_regression.py`. If adding a worked calculation, check its literal answer in `tests/test_suite.c`. Rebuild with `npm run build`, run `npm run check:docs`, then `make docs-offline`. Keep Astro telemetry disabled as configured. A documentation-only change should preserve all held-out decisions and scores; timing may vary.

## Keep source and articles synchronized

Every file in `docs/site.json` needs a matching `web/file-notes/` article. Literal `<!-- at: ... -->` markers must occur once and in source order. The generator includes every line exactly once. Keep stable `PM-...` reference tags when moving comments. Put one-time migration utilities in `ad-hoc/`; reusable build utilities belong in `scripts/`.

## Use numbers that explain behavior

Keep edit distances, operation costs, recovery rates, unsafe assignments and lookup time when they support a concrete comparison. Give a denominator for recovery and name the input behind an error. Prefer a short finding to an inventory of assertions, functions, source lines or generated pages. Keep audit counters in machine-readable evidence and logs.

`make feedback` regenerates marked source and article observations from the completed report. Preserve the existing worked calculations. Findings describe an algorithm together with its frozen policy and dataset; timings use separate synthetic probes. Never imply that zero observed errors proves safety. Update the comparative interpretation if the dataset changes.
