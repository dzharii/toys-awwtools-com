"""Verify actual static assets, JPEG dimensions and every relative page dependency."""
from pathlib import Path
from PIL import Image
from html.parser import HTMLParser
import json,hashlib
root=Path(__file__).resolve().parents[1]
problems=json.loads((root/'dist/catalog.json').read_text())['problems']
class Assets(HTMLParser):
    def __init__(self):super().__init__();self.paths=[]
    def handle_starttag(self,tag,attrs):
        a=dict(attrs)
        if tag in ('img','script') and a.get('src'):self.paths.append(a['src'])
        if tag=='link' and a.get('rel')=='stylesheet':self.paths.append(a['href'])
for p in problems:
    page=root/f'dist/share/{p["id"]}-{p["slug"]}/index.html';parser=Assets();parser.feed(page.read_text())
    for path in parser.paths:assert (page.parent/path).resolve().is_file(),(p['id'],path)
    for path,size in [(root/f'dist/assets/social/{p["id"]}-{p["slug"]}.jpg',(1200,630)),(root/f'dist/assets/avatars/{p["id"]}.jpg',(192,192))]:
        im=Image.open(path);assert im.format=='JPEG' and im.mode=='RGB' and im.size==size
assert len(list((root/'dist/share').glob('*/index.html')))==74
assert len(list((root/'dist/assets/social').glob('*.jpg')))==74
assert len(list((root/'dist/assets/avatars').glob('*.jpg')))==74
print('Validated74 static pages,74 JPEG previews,74 portraits and all relative page assets.')
