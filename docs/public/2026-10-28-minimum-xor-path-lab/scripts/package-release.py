"""Create a compact, reproducible source ZIP without duplicate builds or QA media."""
from pathlib import Path
import json, sys, zipfile
root = Path(__file__).resolve().parent.parent
output = Path(sys.argv[1]).resolve() if len(sys.argv)>1 else root.parent/'minimum-xor-path-lab-final.zip'
files = [root/name for name in ['README.md','package.json','package-lock.json','build.mjs','dev.mjs','playwright.config.js','generate-assets.mjs','generate-lesson-assets.mjs']]
for directory in ['src','public','scripts']:
    files += [p for p in (root/directory).rglob('*') if p.is_file() and '__pycache__' not in p.parts]
files += [p for p in (root/'tests').glob('*.js')]
with zipfile.ZipFile(output,'w',compression=zipfile.ZIP_DEFLATED,compresslevel=9) as archive:
    for file in sorted(files):
        relative = file.relative_to(root)
        info=zipfile.ZipInfo('minimum-xor-path-lab/'+relative.as_posix(),date_time=(2026,10,28,0,0,0))
        info.compress_type=zipfile.ZIP_DEFLATED
        info.external_attr=0o100644<<16
        archive.writestr(info,file.read_bytes(),compresslevel=9)
    # Reproduction must not inherit the live Site's publishing identity.
    archive.writestr('minimum-xor-path-lab/.openai/hosting.json',json.dumps({'static':{'directory':'dist'}},indent=2)+'\n')
print(json.dumps({'file':str(output),'bytes':output.stat().st_size,'entries':len(files)+1,'duplicate_builds':False,'production_assets_only':True}))
