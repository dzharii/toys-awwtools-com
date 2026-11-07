#!/usr/bin/env python3
"""[PM-Rg4eN8] Compare readability edits with preserved pre-review evidence.

Scores, labels, decisions and policies must stay identical. Runtime is measured
again and reported separately because small refactors change machine-code cost.
"""
import csv
import hashlib
import json
import re
import subprocess
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def rows(path):
    with path.open(newline='') as file:
        return list(csv.DictReader(line for line in file if not line.startswith('#')))


def main():
    before = rows(ROOT / 'tests/baseline/results.csv')
    after = rows(ROOT / 'reports/results.csv')
    assert len(before) == len(after) == 4940, 'Incomplete per-case evidence'
    before_by_key = {(row['algorithm'], row['test_id']): row for row in before}
    after_by_key = {(row['algorithm'], row['test_id']): row for row in after}
    assert before_by_key.keys() == after_by_key.keys(), 'Changed algorithm/case identities'
    score_fields = ('top_score', 'second_score', 'expected_score')
    decision_fields = ('status', 'top', 'second', 'failure', 'dangerous', 'classification')
    changed_scores = sum(left[field] != after_by_key[key][field]
                         for key, left in before_by_key.items() for field in score_fields)
    changed_decisions = sum(any(left[field] != after_by_key[key][field] for field in decision_fields)
                            for key, left in before_by_key.items())
    assert before_by_key == after_by_key, 'Behavioral regression: inspect per-case row differences'
    for name in ('summary.csv', 'calibration_grid.csv'):
        assert (ROOT/'tests/baseline'/name).read_bytes() == (ROOT/'reports'/name).read_bytes(), name+' changed'
    # Regeneration runs in an isolated directory, never over the preserved manifests.
    with tempfile.TemporaryDirectory(prefix='property-match-regeneration-') as temporary:
        destination=Path(temporary)
        (destination/'tests').mkdir()
        subprocess.run([str(ROOT/'property_match_bench'),'--generate','--seed','42'],cwd=destination,check=True,capture_output=True)
        for name in ('calibration_cases.csv','evaluation_cases.csv'):
            assert (destination/'tests'/name).read_bytes()==(ROOT/'tests'/name).read_bytes(),name+' regeneration changed'
    summary=rows(ROOT/'reports/summary.csv')
    metrics=[]
    for result in summary:
        method=result['algorithm']
        selected=[row for row in after if row['algorithm']==method]
        unsafe=sum(int(row['dangerous']) for row in selected)
        assert unsafe==int(result['wrong_target'])+int(result['unknown_accept'])+int(result['ambiguous_accept'])
        assert len(selected)==380
        expected_cost=100*unsafe+int(result['rejected'])
        assert float(result['weighted_cost'])==expected_cost
        metrics.append({'algorithm':method,'exact':int(result['exact']),'fuzzy':int(result['fuzzy']),
                        'dangerous':unsafe,'rejected':int(result['rejected'])})
    assertion_count = int(re.search(r'(\d+) assertions; 0 failures', (ROOT/'reports/correctness.log').read_text())[1])
    for log in ('correctness.log','sanitizer.log','sanitizer_full.log','execution.log'):
        text=(ROOT/'reports'/log).read_text()
        assert f'{assertion_count} assertions; 0 failures' in text, log+' missing complete successful tests'
        assert 'ERROR: AddressSanitizer' not in text and 'runtime error:' not in text
    runtime=rows(ROOT/'reports/runtime.csv')
    assert len(runtime)==104
    assert all(int(row['queries'])==84 for row in runtime), 'Expected seven repetitions x twelve queries'
    assert len(rows(ROOT/'reports/calibration_grid.csv'))==4537
    report={'case_rows':len(after),'changed_decisions':changed_decisions,'changed_scores':changed_scores,
            'policies_identical':True,'calibration_grid_identical':True,'manifests_reproduce':True,
            'assertions':assertion_count,'assertion_failures':0,'asan_ubsan':'passed','leak_check':'unavailable on execution host',
            'metrics':metrics,
            'evidence_sha256':{name:hashlib.sha256((ROOT/'reports'/name).read_bytes()).hexdigest()
                               for name in ('results.csv','summary.csv','calibration_grid.csv')}}
    (ROOT/'reports/regression.json').write_text(json.dumps(report,indent=2)+'\n')
    lines=['# Verification of the source changes', '',
           'Parser, algorithm, resolution and configuration-binding checks passed. The source explanations preserve matching behavior, selected policies and frozen datasets.', '',
           'AddressSanitizer and UndefinedBehaviorSanitizer checks passed for the unit suite and complete experiment. Leak checking is unavailable on this execution host.', '',
           'Timing varies between runs. [Measured algorithm tradeoffs](docs/measured-results.md) explains the recovery, risks and lookup costs. The raw comparison evidence remains in `reports/regression.json`.']
    (ROOT/'reports/regression.md').write_text('\n'.join(lines)+'\n')
    print(f"PASS: {len(after):,} case rows; zero changed decisions/scores; policies, grid and regenerated manifests identical.")


if __name__=='__main__':
    main()
