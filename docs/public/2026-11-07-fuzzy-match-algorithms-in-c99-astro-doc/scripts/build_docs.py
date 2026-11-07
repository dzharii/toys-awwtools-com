#!/usr/bin/env python3
"""[PM-Si6tV4] Build a complete offline source guide using Python's standard library.

The C comments are the explanation source. This script renders them; it does not
maintain a second copy of algorithm explanations. Tags link to their definitions.
"""
from __future__ import annotations

import csv
import hashlib
import html
import json
import re
import shutil
from pathlib import Path
from urllib.parse import quote

ROOT = Path(__file__).resolve().parents[1]
CONFIG = json.loads((ROOT / "docs/site.json").read_text())
OUTPUT = ROOT / CONFIG["output"]
TAG = re.compile(r"PM-[A-Za-z0-9]{6}")
C_TOKEN = re.compile(r'/\*[\s\S]*?\*/|//[^\n]*|"(?:\\.|[^"\\])*"|\'(?:\\.|[^\'\\])*\'|\b[A-Za-z_]\w*\b|\b(?:0[xX][\da-fA-F]+|\d+(?:\.\d*)?)(?:[eE][+-]?\d+)?[uUlLfF]*')
KEYWORDS = set("break case char const continue default do double else enum extern float for if int long return short signed sizeof static struct switch typedef union unsigned void volatile while".split())


def escape(text: str) -> str:
    return html.escape(text, quote=True)


def source_name(path: str) -> str:
    """Readable deterministic filenames, independent of any checkout location."""
    return "source-" + re.sub(r"[^a-zA-Z0-9]", "-", path) + ".html"


def source_paths() -> list[Path]:
    paths = set()
    for directory in CONFIG["source_roots"]:
        for pattern in CONFIG["source_patterns"]:
            paths.update(path for path in (ROOT / directory).rglob(pattern) if path.is_file())
    paths.update(ROOT / name for name in CONFIG["extra_sources"] if (ROOT / name).is_file())
    return sorted(paths)


def inline_markdown(text: str) -> str:
    text = escape(text)
    text = re.sub(r"`([^`]+)`", r"<code>\1</code>", text)
    text = re.sub(r"\*\*([^*]+)\*\*", r"<strong>\1</strong>", text)
    # Only document-supplied URLs become links; all text was escaped first.
    text = re.sub(r"\[([^\]]+)\]\((https?://[^)]+)\)", r'<a href="\2" rel="noreferrer">\1</a>', text)
    local_pages = {"docs/start-here.md": "walkthrough.html", "docs/algorithms.md": "reference-algorithms.html",
                   "docs/methodology.md": "reference-methodology.html", "docs/review.md": "review.html",
                   "docs/measured-results.md": "reference-measured-results.html", "AGENTS.md": source_name("AGENTS.md"), "docs/learning-resources.md": "reference-learning-resources.html",
                   "reports/regression.md": "evidence.html", "reports/evaluation.md": "evidence/evaluation.md"}
    for source, target in local_pages.items():
        text = re.sub(r"\[([^\]]+)\]\(" + re.escape(source) + r"\)",
                      lambda match: '<a href="' + target + '">' + match[1] + '</a>', text)
    # Offline source pages contain the exact C, while article sections live in Starlight.
    text = re.sub(r'\[([^\]]+)\]\(/code/([a-z0-9-]+)/(?:#[^)]+)?\)',
                  lambda match: '<a href="source-' + match[2] + '.html">' + match[1] + '</a>', text)
    return text


def markdown(text: str) -> str:
    """Render the small Markdown subset used by our docs, including GFM tables."""
    rendered, paragraph, code = [], [], []
    in_code = False
    lines = text.splitlines()
    index = 0

    def flush_paragraph() -> None:
        if paragraph:
            rendered.append("<p>" + inline_markdown(" ".join(paragraph)) + "</p>")
            paragraph.clear()

    while index < len(lines):
        line = lines[index]
        if line.startswith("```"):
            flush_paragraph()
            if in_code:
                rendered.append("<pre><code>" + escape("\n".join(code)) + "</code></pre>")
                code.clear()
            in_code = not in_code
        elif in_code:
            code.append(line)
        elif line.startswith("|"):
            flush_paragraph()
            rows = []
            while index < len(lines) and lines[index].startswith("|"):
                cells = [cell.strip() for cell in lines[index].strip().strip("|").split("|")]
                if not all(re.fullmatch(r"[:\- ]+", cell) for cell in cells):
                    rows.append(cells)
                index += 1
            table = '<div class="table-scroll"><table>'
            for row_index, row in enumerate(rows):
                cell_tag = "th" if row_index == 0 else "td"
                table += "<tr>" + "".join(f"<{cell_tag}>{inline_markdown(cell)}</{cell_tag}>" for cell in row) + "</tr>"
            rendered.append(table + "</table></div>")
            continue
        elif line.startswith("#"):
            flush_paragraph()
            heading = re.match(r"^(#{1,6})\s+(.*)", line)
            if heading:
                depth = len(heading[1])
                rendered.append(f"<h{depth}>{inline_markdown(heading[2])}</h{depth}>")
        elif not line.strip():
            flush_paragraph()
        else:
            paragraph.append(line)
        index += 1
    flush_paragraph()
    return "\n".join(rendered)


def page(title: str, content: str, source_links: list[tuple[str, str]], section: str = "Guide") -> str:
    tree = "".join(f'<a href="{url}">{escape(name)}</a>' for name, url in source_links)
    return f'''<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>{escape(title)} | Fuzzy Keys</title><link rel="stylesheet" href="assets/site.css">
<script src="assets/site.js" defer></script></head><body>
<a class="skip" href="#main">Skip to content</a>
<aside class="sidebar"><a class="brand" href="index.html"><span class="brand-mark">fk</span> Fuzzy Keys</a>
<p class="sidebar-subtitle">C99 / source guide</p>
<label for="search">Find an idea or symbol</label><input id="search" type="search" placeholder="A tag, function or file" autocomplete="off">
<div id="search-results" role="status" aria-live="polite"></div>
<nav aria-label="Documentation"><a href="index.html">Project overview</a><a href="walkthrough.html">Configuration processing</a>
<a href="algorithms.html">Matching algorithms</a><a href="tags.html">Reference tags</a><a href="evidence.html">Verification results</a>
<a href="review.html">Source readability changes</a><details open><summary>Source files</summary>{tree}</details>
<details><summary>Detailed reference</summary><a href="reference-algorithms.html">Scoring formulas</a><a href="reference-methodology.html">Experiment design</a><a href="reference-readme.html">Build &amp; run</a><a href="reference-learning-resources.html">Algorithm explanations and references</a><a href="reference-measured-results.html">Measured recovery and risks</a></details></nav>
<p class="offline-note">Local assets only.<br>Works from the ZIP, offline.</p></aside>
<main id="main"><header class="page-header"><p class="eyebrow">{escape(section)}</p></header>{content}
<footer>Generated from the included source. Tags survive line-number changes.</footer></main></body></html>'''


def collect_tags(sources: dict[str, str]) -> dict[str, dict]:
    """Definition lines start with a tag inside a comment. Other occurrences link back."""
    definitions = {}
    for name, text in sources.items():
        if not name.endswith((".c", ".h", ".py", ".css", ".js")):
            continue
        in_comment = False
        for number, line in enumerate(text.splitlines(), 1):
            stripped = line.strip()
            if stripped.startswith(('/*', '"""', '#')):
                in_comment = True
            clean = re.sub(r'^(?:/\*\*?|\*|"""|#)\s*', '', stripped)
            clean = clean.removeprefix("@file").strip()
            if in_comment and clean.startswith("[PM-"):
                match = TAG.search(clean)
                if match:
                    tag = match.group()
                    if tag in definitions:
                        raise ValueError(f"Duplicate tag definition: {tag}")
                    definitions[tag] = {"file": name, "line": number,
                                        "url": source_name(name) + f"#L{number}",
                                        "text": clean[match.end():].lstrip("] ").rstrip(" */")}
            if '*/' in line:
                in_comment = False
    # Makefile/Doxyfile comments are deliberate tag definitions too.
    for name in ("Makefile", "Doxyfile"):
        for number, line in enumerate(sources.get(name, "").splitlines(), 1):
            match = re.match(r"# \[(PM-[A-Za-z0-9]{6})\]\s*(.*)", line)
            if match:
                definitions[match[1]] = {"file": name, "line": number,
                                        "url": source_name(name) + f"#L{number}", "text": match[2]}
    return definitions


def source_html(name: str, text: str, tags: dict[str, dict], functions: dict[str, str]) -> str:
    """Render exact source text. HTML spans/links add color without changing copied code."""
    fragments, end = [], 0
    for match in C_TOKEN.finditer(text):
        fragments.append(escape(text[end:match.start()]))
        token = match.group()
        css = ""
        if token.startswith(("/*", "//")): css = "comment"
        elif token.startswith(('"', "'")): css = "string"
        elif token in KEYWORDS: css = "keyword"
        elif token[0].isdigit(): css = "number"
        if css == "comment":
            rendered = ""
            position = 0
            for tag_match in TAG.finditer(token):
                rendered += escape(token[position:tag_match.start()])
                tag = tag_match.group()
                destination = tags.get(tag)
                rendered += f'<a class="tag" href="{destination["url"]}">{tag}</a>' if destination else escape(tag)
                position = tag_match.end()
            rendered += escape(token[position:])
        elif token in functions and name.endswith((".c", ".h")):
            rendered = f'<a class="symbol" href="{functions[token]}">{escape(token)}</a>'
        else:
            rendered = escape(token)
        # Close spans on each line so line anchors never produce invalid nested HTML.
        if css:
            rendered = "\n".join(f'<span class="{css}">{part}</span>' for part in rendered.split("\n"))
        fragments.append(rendered)
        end = match.end()
    fragments.append(escape(text[end:]))
    lines = ''.join(f'<span class="code-line" id="L{number}"><a class="line-number" href="#L{number}" aria-label="Line {number}">{number}</a><span class="line-text">{line}</span></span>'
                    for number, line in enumerate(''.join(fragments).splitlines(), 1))
    return f'<h1>{escape(name)}</h1><p class="lead">Read the comments beside the code. Click a tag or function to follow it.</p><div class="source-toolbar"><a href="raw/{quote(name)}" download>Download source</a><button type="button" id="toggle-focus" aria-pressed="false">Emphasize comments</button></div><pre class="source"><code>{lines}</code></pre>'


def main() -> None:
    paths = source_paths()
    sources = {path.relative_to(ROOT).as_posix(): path.read_text() for path in paths}
    tags = collect_tags(sources)
    functions, entries = {}, []
    for name, text in sources.items():
        if name.endswith((".c", ".h")):
            for match in re.finditer(r"(?m)^(?:static\s+)?[A-Za-z_][\w\s*]*?\b(\w+)\([^;{}]*\)\s*\{", text):
                line = text.count('\n', 0, match.start()) + 1
                url = source_name(name) + f"#L{line}"
                functions.setdefault(match[1], url)
                entries.append({"name": match[1], "kind": "function", "detail": name, "url": url})
    for tag, record in tags.items():
        entries.append({"name": tag, "kind": "note", "detail": record["text"] or record["file"], "url": record["url"]})
    for name in sources:
        entries.append({"name": name, "kind": "file", "detail": "Complete annotated source", "url": source_name(name)})
    if OUTPUT.exists(): shutil.rmtree(OUTPUT)
    (OUTPUT / "assets").mkdir(parents=True)
    for asset in ("site.css", "site.js"):
        shutil.copyfile(ROOT / "docs/site" / asset, OUTPUT / "assets" / asset)
    source_links = [(name, source_name(name)) for name in sources]
    def write(name: str, title: str, body: str, section: str = "Guide") -> None:
        (OUTPUT / name).write_text(page(title, body, source_links, section))
    for name, text in sources.items():
        raw = OUTPUT / "raw" / name
        raw.parent.mkdir(parents=True, exist_ok=True)
        raw.write_text(text)
        write(source_name(name), name, source_html(name, text, tags, functions), "Source / " + name)
    def note(tag: str, label: str) -> str:
        return f'<a class="note-link" href="{tags[tag]["url"]}">{escape(label)} <span>{tag}</span></a>'
    write("index.html", "Project overview", '''<h1>C99 configuration<br>key matching</h1><p class="lead">The resolver compares configuration keys with a property registry.<br>It accepts exact matches and checks fuzzy scores before binding values.</p>
<div class="hero-code"><span class="muted">input</span><code>database connection strng</code><span class="muted">resolved name</span><code>DatabaseConnectionString</code></div>
<a class="primary" href="walkthrough.html">Follow this key through the code <span aria-hidden="true">→</span></a>
<div class="cards"><article><span class="step">01</span><h2>Parsing and resolution sequence</h2><p>Raw text, normalized name, candidate scores, final decision.</p><a href="walkthrough.html">Read the path</a></article><article><span class="step">02</span><h2>Similarity algorithm implementations</h2><p>A short example sits beside the implementation.</p><a href="algorithms.html">Matching algorithms</a></article><article><span class="step">03</span><h2>Correctness and regression results</h2><p>Tests and before/after results show what stayed the same.</p><a href="evidence.html">See the checks</a></article></div>
<section class="compact-section"><h2>Function and reference-tag search</h2><p>Search a function name above. Or follow a tag such as <code>PM-Lv2pR6</code> in the site or your editor. These are local references, not video links.</p></section>''')
    write("walkthrough.html", "Configuration processing", '<h1>Parsing and resolution sequence</h1><p class="lead">Each step changes one representation. The value travels separately.</p>' +
          '<div class="walk"><section><span class="step">1 / Parse</span><h2>Separate name and value</h2><pre>database connection strng = Server=localhost;</pre><p>Split at the first equals sign. Keep later equals signs in the value.</p>' + note("PM-Pa7kQ2", "Open the parser") + '</section>' +
          '<section><span class="step">2 / Prepare</span><h2>Normalize characters and preserve word boundaries</h2><pre>text:   databaseconnectionstrng\ntokens: database | connection | strng</pre><p>Joined text helps character algorithms. Tokens preserve words for the hybrid.</p>' + note("PM-No4mT8", "Open normalization") + '</section>' +
          '<section><span class="step">3 / Compare</span><h2>One missing letter costs one edit</h2><pre>strng → string\ninsert i: distance = 1</pre><p>The full normalized name has 24 target characters. Levenshtein similarity is 1 − 1/24 = 0.9583.</p>' + note("PM-Lv2pR6", "Open the edit recurrence") + '</section>' +
          '<section><span class="step">4 / Decide</span><h2>Check the best score and runner-up margin</h2><p>Check the score, the gap to the runner-up, and any edit cap. Reject a tie.</p>' + note("PM-Re6vN1", "Open the acceptance policy") + '</section>' +
          '<section><span class="step">5 / Bind</span><h2>Validate types and duplicates before binding</h2><p>Check types, duplicate canonical names and missing required values. Commit only a fully valid batch.</p>' + note("PM-Bi7nA3", "Open transactional binding") + '</section></div>')
    algorithm_cards = [
        ("01", "Levenshtein", "Insert, delete or replace a letter. Keep the cheapest route.", "PM-Lv2pR6"),
        ("02", "Optimal String Alignment", "Also swap two adjacent letters. A swapped region cannot be edited again by this recurrence.", "PM-Os3bF9"),
        ("03", "Full Damerau-Levenshtein", "Remember older matching positions so a swap can combine with later edits.", "PM-Dl8xA4"),
        ("04", "Weighted Levenshtein", "Same movement, different costs. Nearby keys cost less; digit changes cost more.", "PM-We5tJ1"),
        ("05", "Jaro", "Count nearby equal letters, then check their order.", "PM-Ja6rC3"),
        ("06", "Jaro-Winkler", "Start with Jaro. Add a small bonus for a shared beginning.", "PM-Wi4zS6"),
        ("07", "Longest common subsequence", "Keep equal letters in order, allowing gaps.", "PM-Lc7sB5"),
        ("08", "Trigram Jaccard", "Compare sets of three-letter windows: shared divided by union.", "PM-Jc8aK4"),
        ("09", "Bigram Dice", "Compare two-letter sets: twice shared divided by both set sizes.", "PM-Di2gP9"),
        ("10", "Trigram cosine", "Count repeated windows; compare the directions of the count vectors.", "PM-Cs5uE8"),
        ("11", "Ratcliff-Obershelp", "Keep the longest shared block, then repeat on the leftover sides.", "PM-Ro1hM7"),
        ("12", "Ordered token hybrid", "Mix whole-name spelling with ordered word alignment.", "PM-Hy9dL2")]
    cards = ''.join(f'<article class="algorithm-card"><span class="step">ALG{identifier}</span><h2>{name}</h2><p>{description}</p>{note(tag,"Read the implementation")}</article>' for identifier,name,description,tag in algorithm_cards)
    write("algorithms.html", "Algorithms", '<h1>Fuzzy matching algorithms</h1><p class="lead">Choose one. The example, movement and limitation sit beside its code.</p><div class="algorithm-grid">'+cards+'</div>')
    tag_rows = ''.join(f'<tr><td><a class="tag" href="{record["url"]}">{tag}</a></td><td>{escape(record["text"])}</td><td>{escape(record["file"])}</td></tr>' for tag,record in sorted(tags.items()))
    write("tags.html", "Reference tags", '<h1>Searchable source reference tags</h1><p class="lead">Search a tag in Emacs, ripgrep, or this site. It identifies a local explanation.</p><pre>rg \'PM-Lv2pR6\' src tests docs scripts ad-hoc</pre><div class="table-scroll"><table><tr><th>Tag</th><th>Idea</th><th>Definition</th></tr>'+tag_rows+'</table></div>')
    for source, target, title in [("docs/measured-results.md","reference-measured-results.html","Measured algorithm tradeoffs"),("docs/learning-resources.md","reference-learning-resources.html","Algorithm explanations and C reference materials"),("docs/algorithms.md","reference-algorithms.html","Scoring reference"),("docs/methodology.md","reference-methodology.html","Methodology"),("README.md","reference-readme.html","Build and run"),("docs/review.md","review.html","Source readability changes")]:
        write(target,title,markdown((ROOT/source).read_text()),"Reference")
    evidence_links = []
    for name in CONFIG["evidence"]:
        path=ROOT/name
        if path.is_file():
            destination=OUTPUT/"evidence"/path.name
            destination.parent.mkdir(exist_ok=True)
            shutil.copyfile(path,destination)
            evidence_links.append(f'<a class="note-link" href="evidence/{path.name}">{escape(path.name)}<span>Download evidence</span></a>')
    evidence_body = '<h1>Before-and-after C99 matching results</h1><p class="lead">Readability edits are checked against the preserved benchmark results.</p>'
    evidence_body += '<p>AddressSanitizer and UndefinedBehaviorSanitizer checks passed. Leak checking is unavailable on this execution host. Timing varies between runs; behavioral comparisons exclude timing.</p>'+''.join(evidence_links)
    if (ROOT/"reports/regression.md").is_file():evidence_body += markdown((ROOT/"reports/regression.md").read_text())
    write("evidence.html","Correctness and regression results",evidence_body)
    (OUTPUT/"assets/search-index.js").write_text("window.DOC_SEARCH="+json.dumps(entries,ensure_ascii=False).replace('</','<\\/')+";\n")
    # A script tag rather than fetch keeps search working under file:// in the ZIP.
    for path in OUTPUT.glob("*.html"):
        path.write_text(path.read_text().replace('<script src="assets/site.js"', '<script src="assets/search-index.js" defer></script><script src="assets/site.js"'))
    manifest={"sources":{name:{"page":source_name(name),"sha256":hashlib.sha256(text.encode()).hexdigest(),"lines":len(text.splitlines())} for name,text in sources.items()},"tags":tags,"functions":functions}
    (OUTPUT/"manifest.json").write_text(json.dumps(manifest,indent=2)+"\n")
    print(f"Built {len(sources)} complete source pages, {len(tags)} reference tags and {len(functions)} function links in {OUTPUT}")


if __name__ == "__main__":
    main()
