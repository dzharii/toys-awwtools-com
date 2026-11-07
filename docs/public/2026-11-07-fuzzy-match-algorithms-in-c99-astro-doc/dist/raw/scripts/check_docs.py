#!/usr/bin/env python3
"""[PM-Dc9kU1] Validate generated source coverage, anchors, links and offline assets."""
import hashlib
import json
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit

ROOT=Path(__file__).resolve().parents[1]
SITE=ROOT/'offline'


class Page(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.ids=set()
        self.links=[]
        self.scripts=[]
        self.line_text=[]
        self.in_line=0
        self.current_line=''
    def handle_starttag(self, tag, attrs):
        attrs=dict(attrs)
        if 'id' in attrs:
            assert attrs['id'] not in self.ids, 'Duplicate id '+attrs['id']
            self.ids.add(attrs['id'])
        for attribute in ('href','src'):
            if attrs.get(attribute): self.links.append(attrs[attribute])
        if tag=='script' and attrs.get('src'):self.scripts.append(attrs['src'])
        if self.in_line:self.in_line+=1
        elif tag=='span' and attrs.get('class')=='line-text':self.in_line=1;self.current_line=''
    def handle_endtag(self, tag):
        if self.in_line:
            self.in_line-=1
            if not self.in_line:self.line_text.append(self.current_line)
    def handle_data(self, text):
        if self.in_line:self.current_line+=text


def main():
    manifest=json.loads((SITE/'manifest.json').read_text())
    pages={}
    for file in SITE.glob('*.html'):
        page=Page();page.feed(file.read_text());pages[file.resolve()]=page
        assert 'main' in page.ids,file
        assert 'assets/search-index.js' in page.scripts,file
        assert 'assets/site.js' in page.scripts,file
    link_count=0
    for file,page in pages.items():
        for link in page.links:
            parsed=urlsplit(link)
            if parsed.scheme or parsed.netloc:continue
            destination=(file.parent/unquote(parsed.path)).resolve() if parsed.path else file
            assert destination.is_relative_to(SITE.resolve()),'Link escapes site: '+link
            assert destination.is_file(),(file.name,link)
            if parsed.fragment and destination in pages:
                assert unquote(parsed.fragment) in pages[destination].ids,(file.name,link)
            link_count+=1
    for name,record in manifest['sources'].items():
        text=(ROOT/name).read_text()
        assert hashlib.sha256(text.encode()).hexdigest()==record['sha256'],name
        assert (SITE/'raw'/name).read_text()==text,name
        page=pages[(SITE/record['page']).resolve()]
        assert page.line_text==text.splitlines(),name+' source was altered by rendering'
        assert all(f'L{index}' in page.ids for index in range(1,record['lines']+1)),name
    for tag,record in manifest['tags'].items():
        assert tag in (ROOT/record['file']).read_text().splitlines()[record['line']-1],tag
    text=(SITE/'assets/search-index.js').read_text()
    assert text.startswith('window.DOC_SEARCH=')
    entries=json.loads(text[len('window.DOC_SEARCH='):].rstrip(';\n'))
    for query in ('PM-Lv2pR6','edit_distance','src/resolver.c'):
        assert any(query.lower() in (entry['name']+' '+entry['detail']).lower() for entry in entries),query
    report=f"PASS: {len(pages)} HTML pages, {len(manifest['sources'])} exact source copies, {len(manifest['tags'])} tag definitions and {link_count} local links checked.\n"
    (ROOT/'reports/docs-check.log').write_text(report)
    print(report,end='')


if __name__=='__main__':
    main()
