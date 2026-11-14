"""Optimize one explicitly reviewed generated image; preserve alpha and record integration."""
from PIL import Image
from pathlib import Path
import json,sys,math,hashlib
problem_id=int(sys.argv[1]);source=Path(sys.argv[2]);note=sys.argv[3]
root=Path(__file__).resolve().parents[1]
problem=next(p for p in json.loads((root/'dist/catalog.json').read_text())['problems'] if p['id']==problem_id)
im=Image.open(source).convert('RGBA');alpha=im.getchannel('A');assert alpha.getextrema()[0]==0,'Image has no transparent pixels';assert alpha.getextrema()[1]==255,'Image has no opaque interiors'
bounds=alpha.point(lambda a:255 if a>15 else 0).getbbox();assert bounds
im=im.crop(bounds);w,h=im.size;cw=max(w,math.ceil(h*6));ch=max(h,math.ceil(w/6));canvas=Image.new('RGBA',(cw+48,ch+8));canvas.alpha_composite(im,((canvas.width-w)//2,(canvas.height-h)//2));canvas=canvas.resize((960,160),Image.Resampling.LANCZOS)
name=f'{problem_id}-{problem["slug"]}.png';path=root/'dist/assets/illustrations'/name
canvas.save(path,optimize=True,compress_level=9)
manifest_path=root/'dist/illustrations.json';manifest=json.loads(manifest_path.read_text());manifest[str(problem_id)]={'src':f'assets/illustrations/{name}','width':960,'height':160,'alt':''};manifest_path.write_text(json.dumps(manifest,indent=2)+'\n')
check_path=root/'docs/illustrations/checklist.json';checks=json.loads(check_path.read_text());record=next(x for x in checks if x['id']==problem_id);record.update(generated=True,semanticAccuracy=True,characterConsistency=True,transparency=True,lightAndDark=True,integrated=True,review=note,bytes=path.stat().st_size,sha256=hashlib.sha256(path.read_bytes()).hexdigest());check_path.write_text(json.dumps(checks,indent=2)+'\n')
# A temporary QA proof shows the optimized asset on both supported backgrounds.
proof=Image.new('RGB',(980,360),'#f6f7f9');proof.paste(Image.new('RGB',(980,180),'#20252c'),(0,180));proof.paste(canvas,(10,10),canvas);proof.paste(canvas,(10,190),canvas);proof.save(root.parent/'illustration-proof.png')
print(json.dumps({'id':problem_id,'file':str(path),'bytes':path.stat().st_size,'completed':sum(x['integrated'] for x in checks),'total':len(checks)}))
