from pathlib import Path
import json,sys,re,html
root=Path(__file__).resolve().parents[1];pid=int(sys.argv[1]);p=next(x for x in json.loads((root/'dist/catalog.json').read_text())['problems'] if x['id']==pid)
s=(root.parent/'research-cache'/f'{pid}.md').read_text();s=s.split('## Description',1)[-1].split('## Solutions',1)[0];s=html.unescape(re.sub('<[^>]+>',' ',s));s=re.sub(r'\s+',' ',s)
print(json.dumps(p));print(s[:4400])
