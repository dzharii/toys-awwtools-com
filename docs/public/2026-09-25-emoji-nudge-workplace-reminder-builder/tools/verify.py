"""Check packaged source, catalog references, fallback options, and asset dimensions."""
from pathlib import Path
import json,re,struct
root=Path(__file__).resolve().parents[1]
for p in root.rglob('*'):
    if p.suffix in ('.html','.css','.js','.md','.py'): p.read_bytes().decode('ascii')
s=(root/'catalog.js').read_text(); data=json.loads(s[s.index('{'):s.rindex('}')+1])
ids={k:{i['id'] for i in c['items']} for k,c in data['catalog'].items()}
assert 'none' not in ids['e']
assert len([p for p in data['presets'] if not p['hidden']])==18
assert len([p for p in data['presets'] if p['hidden']])==3
assert len({p['id'] for p in data['presets']})==len(data['presets'])
assert len({tuple(p['parts'].values()) for p in data['presets']})==len(data['presets'])
html=(root/'index.html').read_text()
for k,values in ids.items():
    fragment=re.search(r'<select id="'+k+r'"[^>]*>(.*?)</select>',html,re.S)[1]
    assert set(re.findall(r'value="([^"]+)"',fragment))==values
for p in data['presets']:
    assert set(p['parts'])==set(ids)
    for k,v in p['parts'].items(): assert v in ids[k]
for asset in re.findall(r'(?:src|href)="([^"#:]+)"',html):
    if not asset.startswith(('https:','./')): assert (root/asset).is_file(),asset
ico=(root/'favicon.ico').read_bytes()
assert struct.unpack('<HHH',ico[:6])==(0,1,7)
assert (root/'social-preview.jpg').stat().st_size>10000
print('PASS: ASCII source, catalog, 21 unique presets, fallback parity, runtime assets, seven favicon resolutions.')
