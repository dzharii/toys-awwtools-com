#!/usr/bin/env python3
"""Feed a completed run back into source comments and file articles.

Only measured data produces numbers. Matching code, labels and policies are never
changed here. Rerun after a benchmark; documentation preparation also refreshes it.
"""
from __future__ import annotations
import csv
import hashlib
import json
import re
from datetime import datetime
from pathlib import Path
from zoneinfo import ZoneInfo

ROOT = Path(__file__).resolve().parents[1]
NAMES = ['Exact normalized only', 'Levenshtein', 'Restricted adjacent swaps',
         'Full Damerau-Levenshtein', 'Weighted Levenshtein', 'Jaro', 'Jaro-Winkler',
         'Longest common subsequence', 'Trigram Jaccard', 'Bigram Dice',
         'Trigram cosine', 'Ratcliff-Obershelp', 'Ordered token hybrid']
# Tags identify the existing explanation; generated comments follow its closing delimiter.
LOCATIONS = {
    'ALG01': ('edit.c', 'PM-Lv2pR6'), 'ALG02': ('edit.c', 'PM-Os3bF9'),
    'ALG03': ('edit.c', 'PM-Dl8xA4'), 'ALG04': ('edit.c', 'PM-We5tJ1'),
    'ALG05': ('jaro.c', 'PM-Ja6rC3'), 'ALG06': ('algorithms.c', 'PM-Wi4zS6'),
    'ALG07': ('lcs.c', 'PM-Lc7sB5'), 'ALG08': ('grams.c', 'PM-Jc8aK4'),
    'ALG09': ('grams.c', 'PM-Di2gP9'), 'ALG10': ('grams.c', 'PM-Cs5uE8'),
    'ALG11': ('ratcliff.c', 'PM-Ro1hM7'), 'ALG12': ('hybrid.c', 'PM-Hy9dL2'),
}
# Pick illustrative cases by stable IDs; their outcomes and scores are read below.
EXAMPLES = {
    'ALG01': ['E0246', 'E0258'], 'ALG02': ['E0131', 'E0258'],
    'ALG03': ['E0131', 'E0258'], 'ALG04': ['E0255', 'E0258'],
    'ALG05': ['E0246', 'E0218'], 'ALG06': ['E0218', 'E0246'],
    'ALG07': ['E0246', 'E0296'], 'ALG08': ['E0246', 'E0229'],
    'ALG09': ['E0246', 'E0229'], 'ALG10': ['E0246', 'E0229'],
    'ALG11': ['E0246', 'E0296'], 'ALG12': ['E0329', 'E0206'],
}


def rows(name):
    with (ROOT/'reports'/name).open(newline='') as file:
        return list(csv.DictReader(file))


def write_changed(path, text):
    text = text.rstrip() + '\n'
    if not path.exists() or path.read_text() != text:
        path.write_text(text)


def unsafe(row):
    return sum(int(row[key]) for key in ('wrong_target', 'unknown_accept', 'ambiguous_accept'))


def latency(value):
    micros = float(value)
    amount, unit = (micros / 1000, 'milliseconds') if micros >= 1000 else (micros, 'microseconds')
    if amount >= 100:
        number = f'{round(amount, -1):.0f}'
    elif amount >= 10:
        number = f'{amount:.0f}'
    else:
        number = f'{amount:.1f}'.rstrip('0').rstrip('.')
    return number + ' ' + unit


def replace_region(text, opening, closing, body):
    pattern = re.escape(opening) + r'.*?' + re.escape(closing)
    assert len(re.findall(pattern, text, re.S)) <= 1, opening
    region = opening + '\n' + body.rstrip() + '\n' + closing
    if opening in text:
        return re.sub(pattern, lambda _: region, text, flags=re.S)
    return text.rstrip() + '\n\n' + region + '\n'


def describe_case(row):
    key, target, top = row['input'], row['target'], row['top']
    score, runner = float(row['top_score']), float(row['second_score'])
    accepted = row['status'] in ('exact', 'fuzzy')
    if row['dangerous'] == '1':
        expected = 'unknown' if row['expected'] == '1' else 'ambiguous'
        return (f'Unsafe acceptance: `{key}` was labeled {expected}, but the resolver '
                f'accepted `{top}` with score {score:.3f}. Similar spelling did not establish the intended setting.')
    if accepted:
        return f'Recovered typo: `{key}` resolved to `{target}`.'
    if row['status'] == 'ambiguous' and target:
        gap = score - runner
        return (f'Rejected typo: `{key}` was intended for `{target}`. That target ranked '
                f'first at {score:.3f}, but the runner-up scored {runner:.3f}. The '
                f'{gap:.3f} lead was below the required {float(row["margin"]):.2f}, so the resolver declined to guess.')
    if row['status'] == 'ambiguous':
        return f'Safe ambiguity: `{key}` was labeled ambiguous and the resolver returned ambiguity.'
    if target:
        return f'Rejected typo: `{key}` was intended for `{target}`; the score did not pass the policy.'
    return f'Safe rejection: `{key}` was not assigned to a property.'


def main():
    summary = {r['algorithm']: r for r in rows('summary.csv')}
    cases = {(r['algorithm'], r['test_id']): r for r in rows('results.csv')}
    runtime = {(r['algorithm'], r['registry_size'], r['mode']): r for r in rows('runtime.csv')}
    report_path = ROOT/'reports/evaluation.md'
    report = report_path.read_text()
    stamp = re.search(r'\| Execution \(UTC\) \| ([^|]+) \|', report)[1].strip()
    when = datetime.fromisoformat(stamp.replace('Z', '+00:00')).astimezone(ZoneInfo('America/Los_Angeles'))
    label = when.strftime('%Y-%m-%d %H:%M %Z')
    base = summary['ALG01']
    base_time = float(runtime['ALG01', '10', 'end_to_end']['median_us'])
    def same_decisions(left, right):
        for (algorithm, case_id), result in cases.items():
            if algorithm != left:
                continue
            other = cases[right, case_id]
            if any(result[key] != other[key] for key in ('status', 'dangerous', 'failure')):
                return False
            if result['status'] in ('exact', 'fuzzy') and result['top'] != other['top']:
                return False
        return True

    # Refuse mixed or incomplete evidence instead of writing plausible-looking prose.
    assert len(summary) == 13 and len(cases) == sum(int(r['total']) for r in summary.values())
    for method, row in summary.items():
        selected = [r for (algorithm, _), r in cases.items() if algorithm == method]
        assert len(selected) == int(row['total'])
        assert sum(int(r['dangerous']) for r in selected) == unsafe(row)
        assert sum(r['classification'] == 'correct resolution' and r['status'] == 'fuzzy' for r in selected) == int(row['fuzzy'])
        assert sum(r['classification'] == 'unnecessary rejection' for r in selected) == int(row['rejected'])
        for result in selected:
            assert result['threshold'] == row['threshold'] and result['margin'] == row['margin']
        assert all((method, str(size), 'end_to_end') in runtime for size in (10, 50, 100, 1000))
    # The comparative interpretations below describe this frozen dataset. Fail rather than silently carry
    # those interpretations forward if its outcomes later change.
    assert all(cases[m, 'E0296']['dangerous'] == '1' for m in ('ALG07', 'ALG11'))
    assert all(cases[m, 'E0229']['dangerous'] == '1' for m in ('ALG08', 'ALG09', 'ALG10'))
    assert all(summary[m]['fuzzy'] == base['fuzzy'] and unsafe(summary[m]) == unsafe(base) for m in ('ALG02', 'ALG03', 'ALG04'))
    assert all(same_decisions('ALG01', other) for other in ('ALG02', 'ALG03', 'ALG04'))

    overview = [
        '# Measured algorithm tradeoffs', '',
        f'Run recorded {label}. The figures below come from the completed evaluation, with each method using its own calibrated acceptance policy.', '',
        'Recovery means accepting a misspelled name as its intended property. Unsafe acceptance means assigning a wrong target, accepting an unknown name, or choosing a target for an ambiguous name. Formatting-only matches are excluded from typo recovery.', '',
        '| Method | Typos recovered | Unsafe acceptances | Lookup with 10 properties | Lookup with 1000 properties |',
        '|---|---:|---:|---:|---:|',
    ]
    snippets = {}
    for index in range(1, 13):
        method = f'ALG{index:02d}'
        row = summary[method]
        short = runtime[method, '10', 'end_to_end']['median_us']
        large = runtime[method, '1000', 'end_to_end']['median_us']
        recovered, possible, rejected = (int(row[k]) for k in ('fuzzy', 'fuzzy_inputs', 'rejected'))
        delta = recovered - int(base['fuzzy'])
        recovery_comparison = 'the same number of typos' if not delta else f'{abs(delta)} {"more" if delta > 0 else "fewer"} typos'
        factor = float(short) / base_time
        speed = 'about the same lookup time' if 0.9 <= factor <= 1.1 else f'about {factor:.1f} times the lookup time' if factor > 1 else f'about {1/factor:.1f} times faster lookups'
        conclusion = (f'It recovered {recovered} of {possible} typos. '
                      + ('No unsafe acceptance was observed.' if not unsafe(row) else f'It made {unsafe(row)} unsafe acceptances.'))
        comparison = (f'Compared with Levenshtein, this policy recovered {recovery_comparison}, '
                      f'and used {speed}.')
        if method == 'ALG01':
            comparison = ('The restricted-swap, full Damerau-Levenshtein and weighted methods '
                          'made the same acceptance decisions in this run.')
        if method in ('ALG02', 'ALG03', 'ALG04') and delta == 0 and unsafe(row) == unsafe(base):
            comparison = f'It accepted the same inputs as Levenshtein, with {speed}. The extra scoring rules added no recovery benefit here.'
        if method == 'ALG10':
            comparison += f' Counting repeated trigrams produced {unsafe(row)} unsafe acceptances; trigram Jaccard produced {unsafe(summary["ALG08"])}.'
        if method == 'ALG11':
            comparison += f' Its recovery and unsafe-acceptance totals matched longest common subsequence ({summary["ALG07"]["fuzzy"]} and {unsafe(summary["ALG07"])}).'
        if method == 'ALG12':
            comparison += ' Keeping word boundaries did not make this policy safe for automatic binding.' if unsafe(row) else ''
        timing = (f'A median name lookup took about {latency(short)} with 10 properties and {latency(large)} with 1000. '
                  'These are separate synthetic typo probes on this host, not timings of the examples below.')
        example_rows = [cases[method, identifier] for identifier in EXAMPLES[method]]
        snippet = (f'### {NAMES[index]} results from this run\n\n'
                   f'Run recorded {label}. {conclusion}\n\n{comparison}\n\n{timing}\n\n'
                   + '\n\n'.join(describe_case(r) for r in example_rows)
                   + '\n\n' 
                   '[Compare methods](docs/measured-results.md). [Inspect the recorded outcomes](reports/results.csv).')
        snippets[method] = snippet
        article = ROOT/'web/file-notes'/('src-algorithms-' + LOCATIONS[method][0].replace('.', '-') + '.md')
        opening, closing = f'<!-- measured:{method}:start -->', f'<!-- measured:{method}:end -->'
        text = article.read_text()
        assert opening in text, f'Missing article insertion point: {method}'
        write_changed(article, replace_region(text, opening, closing, snippet))
        source = ROOT/'src/algorithms'/LOCATIONS[method][0]
        text = source.read_text()
        text = re.sub(r'(?m)^[ \t]*/\* measured:' + method + r':start.*?measured:' + method + r':end \*/\n', '', text, flags=re.S)
        definition = re.search(r'(?m)^[ \t]*(?:/\*\*?\s*(?:@file\s*)?|\*\s*)\[' +
                               re.escape(LOCATIONS[method][1]) + r'\]', text)
        assert definition, method + ' explanation tag is missing'
        tag_position = text.index('[' + LOCATIONS[method][1] + ']', definition.start())
        comment_start = text.rfind('/*', 0, tag_position)
        comment_end = text.index('*/', tag_position) + 2
        indent = re.match(r'[ \t]*', text[text.rfind('\n', 0, comment_start) + 1:comment_start])[0]
        example = next((r for r in example_rows if r['dangerous'] == '1'), example_rows[0])
        if example['dangerous'] == '1':
            source_outcome = f'accepted {example["top"]}, but input was labeled unknown.' if example['expected'] == '1' else f'accepted {example["top"]}, but input was labeled ambiguous.'
        elif example['status'] in ('exact', 'fuzzy'):
            source_outcome = f'correctly resolved to {example["target"]}.'
        else:
            source_outcome = f'returned {example["status"]}; intended {example["target"]}.'
        concise = [f'/* measured:{method}:start - {when.strftime("%Y-%m-%d")} recorded run.',
                   f' * Recovered {recovered}/{possible} typos; unsafe accepts {unsafe(row)}.',
                   f' * Median lookup, 10 properties: about {latency(short)} on this host.',
                   ' * ' + ('Same accepted results as the other edit variants in this run.' if index <= 4 else
                            f'Levenshtein recovered {base["fuzzy"]}/{base["fuzzy_inputs"]} with {unsafe(base)} unsafe accepts.'),
                   f' * Input: {example["input"]}',
                   ' * Outcome: ' + source_outcome,
                   ' * Policy limits and comparisons: docs/measured-results.md.',
                   f' * measured:{method}:end */']
        text = text[:comment_end] + '\n' + '\n'.join(indent + line for line in concise) + text[comment_end:]
        write_changed(source, text)
        overview.append(f'| {NAMES[index]} | {recovered}/{possible} | {unsafe(row)} | {latency(short)} | {latency(large)} |')
    overview += ['', '## What changes the choice of algorithm', '',
                 'The edit-distance policies accepted the same intended typos in this run. More elaborate edit rules therefore added no measured recovery benefit here. The `ca -> ac -> abc` worked example still distinguishes what the two swap distances can represent; it is not evidence of better configuration resolution.', '',
                 'A fast score can accept the wrong meaning. Longest common subsequence and Ratcliff-Obershelp accepted `default request timeout nanoseconds` as `DefaultRequestTimeoutSeconds`, even though nanoseconds is not a registered unit. The gram methods accepted reordered names that the dataset deliberately labels unknown. Their spelling overlap did not establish a safe property assignment.', '',
                 '## Timing and policy limits', '',
                 'Lookup times are medians from the separate end-to-end benchmark and include preparation, exact lookup, scoring when needed and the acceptance decision. The larger registries are synthetic. These measurements compare implementations on this host, not safety in a real schema with a thousand properties. A microsecond is one millionth of a second; the table switches to milliseconds for larger values.', '',
                 'Thresholds were selected on separate calibration data and then frozen. Results compare each method together with its calibrated policy. Zero observed unsafe acceptances does not guarantee that a new typo or schema is safe.', '',
                 '## Recorded examples beside each implementation', '']
    overview += ['| Method | Implementation article |', '|---|---|']
    for index in range(1, 13):
        method = f'ALG{index:02d}'
        filename = LOCATIONS[method][0]
        slug = 'src-algorithms-' + filename.replace('.', '-')
        heading = NAMES[index].lower().replace(' ', '-') + '-results-from-this-run'
        overview.append(f'| {NAMES[index]} | [Real inputs and decisions](/code/{slug}/#{heading}) |')
    text = '\n'.join(overview) + '\n'
    write_changed(ROOT/'docs/measured-results.md', text)
    # Raw Markdown remains usable in the ZIP; the site generator maps these links.
    observation = '\n'.join(overview[:overview.index('## Recorded examples beside each implementation')])
    observation = observation.replace('# Measured algorithm tradeoffs', '## 13. Algorithm behavior linked to the source', 1)
    write_changed(report_path, replace_region(report, '<!-- measured-summary:start -->', '<!-- measured-summary:end -->', observation))
    provenance = {'execution_utc': stamp, 'display_timezone': 'America/Los_Angeles',
                  'inputs_sha256': {name: hashlib.sha256((ROOT/'reports'/name).read_bytes()).hexdigest()
                                   for name in ('summary.csv', 'results.csv', 'runtime.csv')},
                  'examples': EXAMPLES}
    write_changed(ROOT/'reports/source-feedback.json', json.dumps(provenance, indent=2) + '\n')
    print('Updated source comments and articles from the recorded run.')


if __name__ == '__main__':
    main()
