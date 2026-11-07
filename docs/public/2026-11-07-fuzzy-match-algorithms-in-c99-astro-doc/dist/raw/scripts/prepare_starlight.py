#!/usr/bin/env python3
"""Generate Starlight content and exact annotated-source views from the C99 project.

Astro/Starlight renders the website. The older Python renderer is retained only
for a standalone offline copy. Both source views use the same actual file bytes.
"""
from __future__ import annotations
import importlib.util
import json
import re
import shutil
import subprocess
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
CONTENT=ROOT/'src/content/docs'
PUBLIC=ROOT/'public'
GENERATED=ROOT/'web/generated'


def file_articles():
    """Each article owns its prose; literal anchors bind sections to actual source."""
    articles = {}
    for path in (ROOT/'web/file-notes').glob('*.md'):
        _, frontmatter, body = path.read_text().split('---', 2)
        name = json.loads(re.search(r'^file: (.+)$', frontmatter, re.M)[1])
        if name in articles:
            raise ValueError('Duplicate file article: '+name)
        articles[name] = body.strip()
    return articles


def weave_article(name, text, article):
    """Cover source lines exactly once; fail if an edited anchor no longer exists."""
    sections = re.split(r'<!-- at: (.*?) -->', article)
    if len(sections) < 3:
        raise ValueError('Missing source sections: '+name)
    lines = text.splitlines()
    blocks = []
    for index in range(1, len(sections), 2):
        anchor, prose = sections[index:index+2]
        matches = [number for number, line in enumerate(lines, 1) if anchor in line] if anchor != '1' else [1]
        if len(matches) != 1:
            raise ValueError(f'{name}: source anchor must match once: {anchor}')
        start = matches[0]
        if blocks and start <= blocks[-1][0]:
            raise ValueError(name+': source sections are out of order')
        blocks.append((start, prose.strip()))
    if blocks[0][0] != 1:
        raise ValueError(name+': article must start at source line 1')
    result = ["import SourceView from '../../../../web/components/SourceView.astro';", document_links(sections[0].strip())]
    for index, (start, prose) in enumerate(blocks):
        end = blocks[index+1][0]-1 if index+1 < len(blocks) else len(lines)
        result += [document_links(prose), '<SourceView file='+json.dumps(name)+f' start={{{start}}} end={{{end}}} />']
    return '\n\n'.join(result), len(blocks)


def write_page(slug, title, body, mdx=False, extra=''):
    path=CONTENT/(slug+('.mdx' if mdx else '.md'))
    path.parent.mkdir(parents=True,exist_ok=True)
    path.write_text('---\ntitle: '+json.dumps(title)+'\n'+extra+'---\n\n'+body+'\n')


def document_links(text):
    text = re.sub(r'<!-- measured(?::|-)[^>]*-->\n?', '', text)
    mapping={'AGENTS.md':'/code/agents-md/', 'docs/start-here.md':'/configuration-sequence/','docs/algorithms.md':'/reference/algorithm-formulas/',
             'docs/methodology.md':'/reference/benchmark-methods/','docs/review.md':'/source-review/',
             'reports/regression.md':'/verification-results/','reports/evaluation.md':'/reference/benchmark-results/',
             'docs/reader-site.md':'/site-configuration/',
             'docs/standard-library-review.md':'/standard-library-review/',
             'docs/learning-resources.md':'/reference/learning-resources/',
             'docs/measured-results.md':'/reference/measured-results/'}
    for old,new in mapping.items():text=text.replace(']('+old+')',']('+new+')')
    text=re.sub(r'\]\(reports/([^)]*)\)', r'](/evidence/\1)', text)
    return text


def document_body(path):
    return document_links(re.sub(r'^# [^\n]+\n', '', path.read_text(), count=1))


def main():
    subprocess.run(['python3', str(ROOT/'scripts/annotate_results.py')], check=True)
    # Remove obsolete output pages from the previous publishing engine.
    if (ROOT/'dist').exists(): shutil.rmtree(ROOT/'dist')
    # Content file names can change during migration; discard stale Astro collection paths.
    if (ROOT/'.astro').exists(): shutil.rmtree(ROOT/'.astro')
    if (ROOT/'.generated/astro-cache').exists(): shutil.rmtree(ROOT/'.generated/astro-cache')
    if CONTENT.exists():shutil.rmtree(CONTENT)
    CONTENT.mkdir(parents=True)
    GENERATED.mkdir(parents=True,exist_ok=True)
    PUBLIC.mkdir(exist_ok=True)
    spec=importlib.util.spec_from_file_location('offline_source_renderer',ROOT/'scripts/build_docs.py')
    renderer=importlib.util.module_from_spec(spec);spec.loader.exec_module(renderer)
    renderer.OUTPUT=PUBLIC/'offline'
    renderer.main()
    # Keep Pagefind focused on Starlight pages, rather than indexing the duplicate offline copy.
    for path in (PUBLIC/'offline').glob('*.html'):
        path.write_text(path.read_text().replace('<body>','<body data-pagefind-ignore="all">'))
    sources={p.relative_to(ROOT).as_posix():p.read_text() for p in renderer.source_paths()}
    articles = file_articles()
    if sources.keys() != articles.keys():
        raise ValueError(f'File article coverage differs: missing={sources.keys()-articles.keys()}, obsolete={articles.keys()-sources.keys()}')
    tags=renderer.collect_tags(sources)
    def code_url(name):return '/code/'+renderer.source_name(name).removeprefix('source-').removesuffix('.html').lower()+'/'
    functions={};file_functions={}
    for name,text in sources.items():
        file_functions[name]=[]
        if name.endswith(('.c','.h')):
            for match in re.finditer(r'(?m)^(?:static\s+)?[A-Za-z_][\w\s*]*?\b(\w+)\([^;{}]*\)\s*\{',text):
                line=text.count('\n',0,match.start())+1
                functions.setdefault(match[1],code_url(name)+f'#L{line}')
                file_functions[name].append({'name':match[1],'line':line})
    for record in tags.values():record['url']=code_url(record['file'])+f'#L{record["line"]}'
    index={}
    file_rows=[]
    article_sections={}
    for old in ('raw', 'evidence'):
        if (PUBLIC/old).exists():shutil.rmtree(PUBLIC/old)
    for name,text in sources.items():
        rendered=renderer.source_html(name,text,tags,functions)
        source=rendered[rendered.index('<pre class="source">'):]
        # The common renderer's source strings may have file-relative links; normalize all known pages.
        for destination in sources:
            source=source.replace('href="'+renderer.source_name(destination),'href="'+code_url(destination))
        code=source[source.index('<code>')+6:source.rindex('</code>')]
        html_lines=[part for part in re.split(r'(?=<span class="code-line" id=)', code) if part]
        index[name]={'htmlLines':html_lines,'lines':len(text.splitlines()),'functions':file_functions[name]}
        raw=PUBLIC/'raw'/name;raw.parent.mkdir(parents=True,exist_ok=True);raw.write_text(text)
        slug=code_url(name).strip('/')
        body, article_sections[name] = weave_article(name, text, articles[name])
        write_page(slug,name,body,mdx=True,extra='tableOfContents: false\n')
        file_rows.append(f'| [{name}]({code_url(name)}) |')
    (GENERATED/'source-index.json').write_text(json.dumps(index,ensure_ascii=False)+'\n')
    source_manifest={'sources':{name:{'url':code_url(name),'lines':len(text.splitlines()),'article_sections':article_sections[name]} for name,text in sources.items()},'tags':tags}
    (PUBLIC/'source-manifest.json').write_text(json.dumps(source_manifest,indent=2)+'\n')
    for path in (ROOT/'web/pages').glob('*.mdx'):shutil.copyfile(path,CONTENT/path.name)
    write_page('source-files','C99 source files and documentation build scripts',
               'Each file article explains its inputs, main operations and limits beside the exact source blocks. Scoring functions are in `src/algorithms/`. The header is `src/pm.h`; completed editorial migrations are in `ad-hoc/`.\n\n## Source file articles\n\n| File |\n|---|\n'+'\n'.join(file_rows))
    tag_rows=[f'| [{tag}]({record["url"]}) | {record["text"].replace("|","/")} | `{record["file"]}` |' for tag,record in sorted(tags.items())]
    write_page('reference-tags','Searchable source reference tags',
               'Tags identify explanations across files. They remain useful when line numbers change. Search a tag in the site search or your editor.\n\n```sh\nrg \'PM-Lv2pR6\' src tests docs scripts ad-hoc\n```\n\n## Tag definitions and source locations\n\n| Tag | Explanation | Source |\n|---|---|---|\n'+'\n'.join(tag_rows))
    reference=[('docs/algorithms.md','reference/algorithm-formulas','Similarity formulas and implementation limits'),
               ('docs/learning-resources.md','reference/learning-resources','Algorithm explanations and C reference materials'),
               ('docs/measured-results.md','reference/measured-results','Measured recovery, unsafe matches and lookup time'),
               ('docs/methodology.md','reference/benchmark-methods','Calibration, held-out evaluation and timing methods'),
               ('docs/review.md','source-review','Source comment and readability changes'),
               ('README.md','build-commands','Build commands, test commands and project files'),
               ('reports/evaluation.md','reference/benchmark-results','C99 fuzzy configuration property matching benchmark'),
               ('docs/reader-site.md','site-configuration','Starlight layout, file articles and global controls'),
               ('docs/standard-library-review.md','standard-library-review','Standard-library replacements and banned-function checks')]
    for name,slug,title in reference:
        if (ROOT/name).exists():write_page(slug,title,document_body(ROOT/name))
    write_page('verification-results','Correctness tests and before-and-after matching results',
               document_body(ROOT/'reports/regression.md')+'\n\n## Result files for independent checks\n\nThe generated CSVs contain every case classification and the selected policies.\n\n[Per-case results](/evidence/results.csv), [summary counts](/evidence/summary.csv), [runtime samples](/evidence/runtime.csv), [calibration grid](/evidence/calibration_grid.csv), [heading review](/evidence/heading-review.csv).')
    definitions=[('ALG01','Levenshtein','Insertion, deletion and substitution','PM-Lv2pR6'),
                 ('ALG02','Optimal String Alignment','Adjacent swaps in a restricted edit recurrence','PM-Os3bF9'),
                 ('ALG03','Unrestricted Damerau-Levenshtein','Adjacent swaps combined with repeated edits','PM-Dl8xA4'),
                 ('ALG04','Weighted Levenshtein','Typing-dependent letter and digit costs','PM-We5tJ1'),
                 ('ALG05','Jaro','Nearby matching characters and order disagreements','PM-Ja6rC3'),
                 ('ALG06','Jaro-Winkler','Jaro plus a shared-prefix adjustment','PM-Wi4zS6'),
                 ('ALG07','Longest common subsequence','Ordered character matches with gaps','PM-Lc7sB5'),
                 ('ALG08','Trigram Jaccard','Shared three-character sets divided by union','PM-Jc8aK4'),
                 ('ALG09','Bigram Dice','Two-character set overlap','PM-Di2gP9'),
                 ('ALG10','Trigram cosine','Three-character frequency-vector similarity','PM-Cs5uE8'),
                 ('ALG11','Ratcliff-Obershelp','Recursive longest common contiguous blocks','PM-Ro1hM7'),
                 ('ALG12','Ordered token hybrid','Character distance and ordered word alignment','PM-Hy9dL2')]
    rows=[f'| {identifier} | [{name}]({tags[tag]["url"]}) | {description} |' for identifier,name,description,tag in definitions]
    write_page('matching-algorithms','Fuzzy matching algorithms and their scoring inputs',
               'All methods use the same normalization and exact-match stage. Their scores need separate calibrated thresholds.\n\n## Algorithm definitions and implementations\n\n| ID | Algorithm | What the score measures |\n|---|---|---|\n'+'\n'.join(rows)+
               '\n\n## Exact matching before fuzzy scoring\n\nThe exact-normalized baseline accepts formatting variants without typo recovery. A unique exact match bypasses fuzzy thresholds in every algorithm.\n\n## Comparison criteria for automatic binding\n\nThe benchmark ranks dangerous assignments before typo recovery and timing. An unknown key accepted as a valid property is a failure even when it has a high similarity score. See the [measured benchmark results](/reference/benchmark-results/).')
    evidence=PUBLIC/'evidence';evidence.mkdir(exist_ok=True)
    for name in ['evaluation.md','results.csv','summary.csv','runtime.csv','calibration_grid.csv','regression.md','regression.json','source-feedback.json','heading-review.csv','rendered-heading-review.csv','starlight-check.json','banned-initial-build.log','banned-call-review.csv','banned-check.log','layout-check.json','layout-check.md']:
        if (ROOT/'reports'/name).exists():shutil.copyfile(ROOT/'reports'/name,evidence/name)
    print(f'Prepared Starlight pages for {len(sources)} source files and {len(tags)} source reference tags.')


if __name__=='__main__':main()
