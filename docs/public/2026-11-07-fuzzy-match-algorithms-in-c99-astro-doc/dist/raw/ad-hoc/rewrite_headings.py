#!/usr/bin/env python3
"""Inventory and replace vague documentation headings with their technical subject.

This is an explicit editorial migration, not a benchmark operation. It changes
report labels and documentation, never scoring formulas or test-case labels.
"""
import csv
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
REPLACEMENTS = {
    'Read one path first': 'Configuration parsing and resolution sequence',
    'Rebuild the documentation': 'Build the documentation website and offline reference',
    'What changed': 'Source comment and readability changes',
    'Main changes': 'Refactoring changes by module',
    'Scope checked': 'Reviewed source, tests and documentation',
    'Evidence': 'Before-and-after verification results',
    'Reading order': 'Source files in processing order',
    'Algorithm implementation notes': 'Similarity formulas and implementation limits',
    'Shared contract': 'Scoring inputs, score range and memory allocation',
    'ALG01: Levenshtein': 'ALG01: Levenshtein insertion, deletion and substitution',
    'ALG02: Optimal String Alignment': 'ALG02: OSA distance with adjacent swaps',
    'ALG03: Unrestricted Damerau-Levenshtein': 'ALG03: Unrestricted Damerau-Levenshtein distance',
    'ALG04: Weighted Levenshtein': 'ALG04: Weighted edit costs for letters and digits',
    'ALG05: Jaro': 'ALG05: Jaro character matches and transpositions',
    'ALG06: Jaro-Winkler': 'ALG06: Jaro-Winkler prefix adjustment',
    'ALG08: Trigram Jaccard': 'ALG08: Trigram set overlap with Jaccard',
    'ALG09: Bigram Sorensen-Dice': 'ALG09: Bigram set overlap with Dice',
    'ALG10: Trigram cosine': 'ALG10: Trigram frequency cosine',
    'ALG11: Ratcliff-Obershelp': 'ALG11: Ratcliff-Obershelp matching blocks',
    'ALG12: Ordered token hybrid': 'ALG12: Ordered token and character alignment',
    'Exact-normalized baseline': 'Exact matching after ASCII normalization',
    'Primary and authoritative references': 'Algorithm papers and reference definitions',
    'Experiment and reproducibility': 'Calibration, held-out evaluation and timing methods',
    'Reference behavior': 'Parser, normalizer and binder behavior',
    'Dataset design': 'Dataset counts and label definitions',
    'Policy calibration and freeze': 'Threshold and margin calibration before evaluation',
    'Metrics and ranking': 'Outcome counts, error costs and ranking rules',
    'Timing': 'Timed operations and latency statistics',
    'Correctness and sanitizers': 'Correctness assertions and sanitizer coverage',
    'Build and run': 'Build, test and run the C99 benchmark',
    'Commands': 'Command-line options and dataset generation',
    'Source organization': 'C99 modules and configuration binding',
    'Dataset': 'Calibration and held-out test datasets',
    'Output files': 'Generated reports and CSV files',
    'Readability regression check': 'Before-and-after C99 matching results',
    'Fuzzy Configuration Property Matching Benchmark': 'C99 fuzzy configuration property matching benchmark',
    '1. Executive summary': '1. Matching results and selected policies',
    '2. Execution environment': '2. Compiler, platform and benchmark settings',
    '3. Algorithm overview': '3. Similarity algorithms and workspace bounds',
    '4. Test methodology': '4. Normalization, labels and calibration rules',
    '5. Accuracy comparison': '5. Held-out resolution counts and error rates',
    'Category breakdown': 'Resolution counts by test category',
    '6. Runtime performance': '6. Resolution and scoring timings by registry size',
    '7. Collision and ambiguity analysis': '7. Near-collision and ambiguous-key results',
    'Pairwise target confusion table': 'Incorrect-target property pairs',
    '8. Error analysis': '8. Inputs that failed expected resolution',
    'Successful recovery examples': 'Inputs correctly resolved by fuzzy matching',
    'Required unit-confusion probe': 'Milliseconds typo with a competing seconds property',
    '9. Confidence threshold analysis': '9. Calibrated thresholds and sensitivity checks',
    '10. Algorithm ranking': '10. Safety-first algorithm ranking',
    '11. Final recommendation': '11. Recommended matching policy and deployment limits',
    '12. Limitations and future improvements': '12. Dataset, timing and inference limits',
    'Reproduction and evidence': 'Commands and generated result files',
}


def main():
    audit = []
    paths = [ROOT/'README.md', *sorted((ROOT/'docs').glob('*.md')), *sorted((ROOT/'reports').glob('*.md'))]
    for path in paths:
        lines = path.read_text().splitlines()
        fenced = False
        for index, line in enumerate(lines):
            if line.startswith('```'): fenced = not fenced
            match = re.match(r'^(#{1,6})\s+(.+)$', line)
            if fenced or not match: continue
            old = match[2]
            new = REPLACEMENTS.get(old, old)
            audit.append([str(path.relative_to(ROOT)), index+1, old, new,
                          'Names the component, operation or measured result.' if old != new else 'Already names a technical subject or exact algorithm.'])
            lines[index] = match[1]+' '+new
        path.write_text('\n'.join(lines)+'\n')
    # Keep headings correct on later runtime report generation.
    report = ROOT/'src/report.c'
    source = report.read_text()
    for old,new in sorted(REPLACEMENTS.items(),key=lambda item:len(item[0]),reverse=True):
        for level in ('# ', '## ', '### '):
            source = source.replace(level+old+'\\n',level+new+'\\n')
    report.write_text(source)
    # Preserve the optional offline generator, with the same editorial corrections.
    offline = ROOT/'scripts/build_docs.py'
    source = offline.read_text()
    phrases={
        'Understand one<br>decision at a time.':'C99 configuration<br>key matching',
        '<p class="kicker">Small steps. Real source.</p>':'',
        'See the data move':'Parsing and resolution sequence',
        'Open one algorithm':'Similarity algorithm implementations',
        'Check the evidence':'Correctness and regression results',
        'Two ways to navigate':'Function and reference-tag search',
        'Follow one key.':'Parsing and resolution sequence',
        'Keep two views of the name':'Normalize characters and preserve word boundaries',
        'Being first is not enough':'Check the best score and runner-up margin',
        'Validate before applying':'Validate types and duplicates before binding',
        'One idea per algorithm.':'Fuzzy matching algorithms',
        'Find the same idea anywhere.':'Searchable source reference tags',
        'Verify the changes.':'Before-and-after C99 matching results',
    }
    for old,new in phrases.items():
        occurrences=source.count(old)
        if occurrences:
            audit.append(['scripts/build_docs.py',0,old,new,'Replaces generic copy with the actual documentation subject.'])
            source=source.replace(old,new)
    source=source.replace('A misspelled key should find the right setting.<br>A similar key should not silently pick the wrong one.',
                          'The resolver compares configuration keys with a property registry.<br>It accepts exact matches and checks fuzzy scores before binding values.')
    offline.write_text(source)
    verifier=ROOT/'scripts/verify_regression.py'
    verifier.write_text(verifier.read_text().replace('# Readability regression check','# Before-and-after C99 matching results'))
    with (ROOT/'reports/heading-review.csv').open('w',newline='') as file:
        writer=csv.writer(file);writer.writerow(['file','line','previous_heading','revised_heading','reason']);writer.writerows(audit)
    print(f'Reviewed {len(audit)} existing headings and heading-like labels.')


if __name__=='__main__':main()
