#!/usr/bin/env python3
"""Check rendered document headings, local links, exact source bytes and engine assets."""
from __future__ import annotations
import csv
import hashlib
import json
import re
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit

ROOT=Path(__file__).resolve().parents[1]
SITE=ROOT/'dist'
BAD_HEADINGS={'understand one decision at a time.','one idea per algorithm.','find the same idea anywhere.','verify the changes.','see the data move','being first is not enough','small steps. real source.'}


class Page(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.ids=set();self.links=[];self.headings=[];self.heading=None;self.line_text=[];self.line_depth=0;self.current_line='';self.engine=[]
    def handle_starttag(self,tag,attrs):
        attrs=dict(attrs)
        if 'id' in attrs:
            assert attrs['id'] not in self.ids,'Duplicate id '+attrs['id']
            self.ids.add(attrs['id'])
        for attribute in ('href','src'):
            value=attrs.get(attribute)
            if value:self.links.append(value)
        if tag=='meta' and attrs.get('name')=='generator':self.engine.append(attrs.get('content',''))
        if re.fullmatch(r'h[1-6]',tag):self.heading=[tag,'']
        if self.line_depth:self.line_depth+=1
        elif tag=='span' and attrs.get('class')=='line-text':self.line_depth=1;self.current_line=''
    def handle_endtag(self,tag):
        if self.heading and tag==self.heading[0]:self.headings.append(tuple(self.heading));self.heading=None
        if self.line_depth:
            self.line_depth-=1
            if self.line_depth==0:self.line_text.append(self.current_line)
    def handle_data(self,text):
        if self.heading:self.heading[1]+=text
        if self.line_depth:self.current_line+=text


def main():
    pages={}
    for file in SITE.rglob('*.html'):
        page=Page();page.feed(file.read_text());pages[file.resolve()]=page
    for file,page in pages.items():
        for tag,heading in page.headings:
            assert heading.strip().lower() not in BAD_HEADINGS,(file,heading)
    checked_links=0
    for file,page in pages.items():
        for link in page.links:
            target=urlsplit(link)
            if target.scheme or target.netloc:continue
            if target.path.startswith('/'):
                destination=SITE/unquote(target.path.lstrip('/'))
            else:destination=file.parent/unquote(target.path) if target.path else file
            destination=destination.resolve()
            assert destination.is_relative_to(SITE.resolve()),link
            if destination.is_dir():destination=destination/'index.html'
            assert destination.is_file(),(str(file.relative_to(SITE)),link)
            if target.fragment and destination in pages:
                assert unquote(target.fragment) in pages[destination].ids,(str(file.relative_to(SITE)),link)
            checked_links+=1
    manifest=json.loads((SITE/'source-manifest.json').read_text())
    source_fingerprints={}
    for name,record in manifest['sources'].items():
        text=(ROOT/name).read_text()
        raw=(SITE/'raw'/name).read_text()
        assert raw==text,name+' raw source changed'
        file=(SITE/record['url'].strip('/')/'index.html').resolve()
        assert pages[file].line_text==text.splitlines(),name+' rendered source changed'
        assert record['article_sections'] >= 1,name+' has no authored article'
        source_fingerprints[name]=hashlib.sha256(text.encode()).hexdigest()
    main_pages=[p for file,p in pages.items() if 'offline' not in file.relative_to(SITE.resolve()).parts]
    assert all(any('Starlight' in engine for engine in page.engine) for page in main_pages),'Missing maintained documentation engine metadata'
    assert (SITE/'pagefind/pagefind.js').exists(),'Missing Pagefind search index'
    assert list((SITE/'_astro').glob('*.woff2')),'Missing local font assets'
    assert (SITE/'index.html').read_text().count('id="reader-size"')==1
    for file in pages:
        if 'offline' in file.relative_to(SITE.resolve()).parts:continue
        text=file.read_text()
        assert 'class="reading-settings"' not in text and 'id="reader-wrap"' not in text,'Retired reading controls remain'
        assert text.count('id="reader-size"')==1,'Text size must appear once in the header'
    audit=list(csv.DictReader((ROOT/'reports/heading-review.csv').open()))
    for file,page in pages.items():
        for tag,heading in page.headings:
            audit.append({'file':str(file.relative_to(SITE)),'line':'','previous_heading':heading,'revised_heading':heading,'reason':'Rendered heading reviewed; names its subject, navigation function, source path or measured result.'})
    with (ROOT/'reports/rendered-heading-review.csv').open('w',newline='') as output:
        writer=csv.DictWriter(output,fieldnames=['file','line','previous_heading','revised_heading','reason']);writer.writeheader();writer.writerows(audit)
    report={'html_pages':len(pages),'starlight_pages':len(main_pages),'source_files':len(manifest['sources']),'authored_file_articles':len(manifest['sources']),'article_code_sections':sum(r['article_sections'] for r in manifest['sources'].values()),'reference_tags':len(manifest['tags']),'local_links_checked':checked_links,'rendered_headings_reviewed':sum(len(p.headings) for p in pages.values()),'exact_source_sha256':source_fingerprints}
    (ROOT/'reports/starlight-check.json').write_text(json.dumps(report,indent=2)+'\n')
    print(f"PASS: {len(main_pages)} Starlight pages; {len(manifest['sources'])} exact source files; {checked_links} local links; {report['rendered_headings_reviewed']} rendered headings; local fonts and Pagefind assets.")


if __name__=='__main__':main()
