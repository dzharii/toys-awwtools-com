"""Check the complete illustration delivery contract, including real PNG alpha."""
from pathlib import Path
from PIL import Image
import hashlib,json
root=Path(__file__).resolve().parents[1]
problems=json.loads((root/'dist/catalog.json').read_text())['problems']
assets=json.loads((root/'dist/illustrations.json').read_text())
checks=json.loads((root/'docs/illustrations/checklist.json').read_text())
assert len(problems)==len(assets)==len(checks)==74
assert set(assets)=={str(p['id']) for p in problems}
assert len({c['id'] for c in checks})==74
hashes=set();total=0
for p in problems:
    a=assets[str(p['id'])];c=next(c for c in checks if c['id']==p['id'])
    assert a['src']==f"assets/illustrations/{p['id']}-{p['slug']}.png"
    assert (a['width'],a['height'],a['alt'])==(960,160,'')
    path=root/'dist'/a['src'];data=path.read_bytes();sha=hashlib.sha256(data).hexdigest()
    assert sha not in hashes, f"Repeated asset for {p['id']}"
    hashes.add(sha);assert sha==c['sha256'];assert len(data)==c['bytes'];total+=len(data)
    im=Image.open(path);assert im.format=='PNG' and im.mode=='RGBA' and im.size==(960,160)
    alpha=im.getchannel('A');assert alpha.getextrema()==(0,255)
    assert alpha.getpixel((0,0))==alpha.getpixel((959,159))==0
    assert all(c[k] for k in ('generated','semanticAccuracy','characterConsistency','transparency','lightAndDark','integrated'))
    assert c.get('review') and not c.get('blocker')
assert len(list((root/'dist/assets/illustrations').glob('*.png')))==74
assert len(list((root/'references').glob('*.png')))==4
print(json.dumps({'problems':74,'unique_assets':74,'dimensions':'960x160','alpha':'verified','bytes':total,'max_bytes':max(c['bytes'] for c in checks),'blockers':0}))
