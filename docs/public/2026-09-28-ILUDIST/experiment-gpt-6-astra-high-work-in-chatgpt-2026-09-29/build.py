"""Assemble ten dependency-free, independently deployable static applications."""
from pathlib import Path
import json
import shutil
import runpy
import html

ROOT=Path(__file__).resolve().parent
AUTHOR=ROOT/'authoring'
runpy.run_path(str(AUTHOR/'make_catalog.py'))

DESIGNS=[
 ('01-cabinet','The Cabinet','Lift a tool from a walnut and brass travelling case.','1000065894.png','cabinet'),
 ('02-compass','The Guided Compass','Move from a frustration to a practical path.','1000065895.png','landscape'),
 ('03-routes','The Route Map','Follow a line, choose a stop, open a useful destination.','1000065896.png','landscape'),
 ('04-instrument','The Instrument','Turn a weighted selector with momentum and detents.','1000065897.png',None),
 ('05-doors','The Vestibule','Open a door to turning off, avoiding, or replacing.','1000065898.png',None),
 ('06-editorial','The Editorial','Read and turn a quiet, architectural folio.','1000065899.png',None),
 ('07-reveal','The Reveal','Slide between illustrative noisy and quieter layouts.','1000065900.png',None),
 ('08-atlas','The Island Atlas','Navigate a spatial map of everyday tools.','1000065902.png','atlas'),
 ('09-pathways','The Pathways','Choose what should stop and follow the illuminated branch.','1000065901.png','landscape'),
 ('10-folio','The Field Notes','Swipe, lift, and save layered paper remedies.','1000065903.png',None),
]
favicon="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' rx='12' fill='%2311160f'/%3E%3Cpath d='M32 5 38 26 59 32 38 38 32 59 26 38 5 32 26 26Z' fill='%23cba56e'/%3E%3Ccircle cx='32' cy='32' r='7' fill='%2311160f'/%3E%3C/svg%3E"
for slug,title,desc,ref,asset in DESIGNS:
    folder=ROOT/'apps'/slug
    folder.mkdir(parents=True,exist_ok=True)
    for name in ['base.css','core.js','catalog.js']:
        shutil.copy2(AUTHOR/'base'/name,folder/name)
    shutil.copy2(AUTHOR/'designs'/(slug+'.js'),folder/'app.js')
    shutil.copy2(AUTHOR/'designs'/(slug+'.css'),folder/'theme.css')
    if asset:
        (folder/'assets').mkdir(exist_ok=True)
        shutil.copy2(AUTHOR/'assets'/(asset+'.png'),folder/'assets'/(asset+'.png'))
    (folder/'index.html').write_text(f'''<!doctype html>
<html lang="en"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="theme-color" content="{'#f0ece3' if slug=='06-editorial' else '#10150f'}">
<meta name="description" content="ILUD: practical ways to use everyday tools with less unwanted AI. {html.escape(desc,quote=True)}">
<title>ILUD / {title}</title><link rel="icon" href="{favicon}">
<link rel="stylesheet" href="base.css"><link rel="stylesheet" href="theme.css">
<script src="catalog.js" defer></script><script src="core.js" defer></script><script src="app.js" defer></script>
</head><body data-app="{slug}"><a class="skip-link" href="#app">Skip to the application</a><div id="app" tabindex="-1"></div>
<noscript><main style="padding:2rem;max-width:40rem;margin:auto"><h1>ILUD</h1><p>This interactive catalogue needs JavaScript. You can still open a useful destination directly:</p><p><a href="https://noai.duckduckgo.com/">DuckDuckGo No-AI search</a></p><p><a href="https://www.weather.gov/">National Weather Service</a></p><p><a href="https://www.gutenberg.org/">Project Gutenberg</a></p></main></noscript>
</body></html>\n''')
    (folder/'README.md').write_text(f'''# A00 / ILUD: {title}

{desc}

Open `index.html` in a modern desktop browser, or serve this entire folder with a static HTTP server. No installation, build step, API key, or network request is required to load the application. External destinations require a connection. Mobile file-preview apps may not execute JavaScript; serve over HTTP or HTTPS for phone use.

## B00 / Files and behavior

`app.js` and `theme.css` implement this design. `core.js` supplies catalogue search, source details, optional sound, bookmarks, local flags, and preferences. `catalog.js` contains the same 40 researched records as the other applications. Each folder is independent and can be copied or deployed by itself.

Reference: `{ref}`. The reference is in the archive's `references` directory. No screenshot is used as an interactive interface.

Saved records are isolated under the local-storage namespace `ilud.v1.{slug}`. Search queries are not persisted. There is no backend or telemetry.

## C00 / Research and validation limits

Sources reviewed September 29, 2026. No external fix was tested end to end. JavaScript syntax and packaging checks were performed; browser rendering, gestures, device accessibility, and external account settings were not validated. See the archive's `research` directory for provenance and maintenance guidance.
''')

cards=[]
for n,(slug,title,desc,ref,asset) in enumerate(DESIGNS,1):
    cards.append(f'''<article><a class="preview" href="apps/{slug}/index.html" aria-label="Open {title}"><img src="references/{ref}" alt="Supplied design reference for {title}" loading="lazy" width="864" height="1536"><span>REFERENCE {n:02d}</span></a><div class="card-body"><small>EXPERIMENT {n:02d}</small><h2>{title}</h2><p>{desc}</p><a class="launch" href="apps/{slug}/index.html">Open application <span aria-hidden="true">&gt;</span></a><a class="reference" href="references/{ref}">View supplied reference</a></div></article>''')
(ROOT/'index.html').write_text(f'''<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>ILUD / Ten instruments for a quieter internet</title><meta name="description" content="Ten independent, interactive ILUD applications, with 40 source-backed fixes."><link rel="icon" href="{favicon}"><style>
*{{box-sizing:border-box}}body{{margin:0;background:#10150f;color:#e9dfca;font:16px/1.55 Georgia,serif}}a{{color:inherit}}header,main,footer{{max-width:1280px;margin:auto;padding:32px}}header{{padding-top:60px;border-bottom:1px solid #7e70433b;display:flex;align-items:end;justify-content:space-between;gap:30px}}.wordmark{{font-size:clamp(4rem,13vw,8rem);letter-spacing:-.05em;line-height:.8;color:#c8a778}}header small{{font:11px Arial,sans-serif;letter-spacing:.3em;display:block;margin-top:18px}}header h1{{font-size:clamp(1.5rem,4vw,2.5rem);font-weight:400;line-height:1.1;max-width:19ch;margin:0}}.intro{{display:flex;justify-content:space-between;gap:25px;align-items:center;margin-bottom:32px}}.intro p{{max-width:54ch;color:#b7b49f;margin:0}}.intro span{{font:12px/1.7 Arial,sans-serif;color:#d0b27c;white-space:nowrap}}.grid{{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:28px}}article{{background:#1a2017;border:1px solid #76683d66;border-radius:12px;overflow:hidden}}.preview{{display:block;height:330px;position:relative;background:#070b06;overflow:hidden}}.preview img{{width:100%;height:100%;object-fit:cover;object-position:top;transition:transform .5s}}.preview:hover img{{transform:scale(1.025)}}.preview>span{{position:absolute;bottom:12px;left:12px;background:#0c110beb;border:1px solid #b89c65;padding:5px 9px;font:10px Arial,sans-serif;letter-spacing:.12em;color:#e2c58d}}.card-body{{padding:22px}}.card-body>small{{font:10px Arial,sans-serif;letter-spacing:.16em;color:#ad9667}}h2{{font-size:1.6rem;font-weight:400;margin:8px 0}}.card-body p{{font:14px/1.55 Arial,sans-serif;color:#b7b9a5;min-height:44px}}.launch{{display:flex;justify-content:space-between;align-items:center;border:1px solid #ab8d52;background:#c4a470;color:#1c2314;text-decoration:none;padding:12px 15px;border-radius:5px;font:14px Arial,sans-serif;min-height:46px}}.launch:hover{{background:#e1c491}}.reference{{font:11px Arial,sans-serif;text-underline-offset:4px;color:#b6ad94;display:inline-block;padding:14px 0 0}}footer{{border-top:1px solid #7e70433b;padding-top:25px;padding-bottom:50px;color:#a3a891;font:12px/1.7 Arial,sans-serif}}footer p{{max-width:85ch}}footer a{{margin-right:20px}}a:focus-visible{{outline:3px solid #ffe1a2;outline-offset:4px}}@media(max-width:950px){{.grid{{grid-template-columns:repeat(2,minmax(0,1fr))}}.preview{{height:370px}}}}@media(max-width:600px){{header,main,footer{{padding:25px 18px}}header{{padding-top:45px;align-items:start;flex-direction:column}}.intro{{align-items:start;flex-direction:column}}.grid{{grid-template-columns:1fr}}.preview{{height:440px}}.card-body p{{min-height:0}}}}@media(prefers-reduced-motion:reduce){{*{{transition:none!important}}}}
</style></head><body><header><div><div class="wordmark">ILUD</div><small>THE TEN INTERPRETATIONS</small></div><h1>Everyday tools.<br>A little more control.</h1></header><main><div class="intro"><p>Choose an instrument. Each application carries the same carefully stocked catalogue, interpreted through a different interaction.</p><span>10 INDEPENDENT APPS<br>40 PRACTICAL ENTRIES<br>NO BUILD STEP</span></div><div class="grid">{''.join(cards)}</div></main><footer><p>The images above are the supplied design references, not screenshots of the implemented applications. Open each application to experience its interface. Sources reviewed September 29, 2026. External fixes and browser rendering were not tested end to end.</p><a href="README.md">Read me</a><a href="research/RESEARCH.md">Research and limitations</a><a href="research/catalog.json">Catalogue data</a></footer></body></html>\n''')
data=json.loads((AUTHOR/'catalog.json').read_text())
shutil.copy2(AUTHOR/'catalog.json',ROOT/'research'/'catalog.json')
mapping=[dict(directory=s,title=t,description=d,reference=r,artwork=a) for s,t,d,r,a in DESIGNS]
(ROOT/'design-map.json').write_text(json.dumps(mapping,indent=2)+'\n')
source_report=['# A00 / Source register','', 'Research date: September 29, 2026. Each link is a primary publisher, project, or maintainer source. The research used page retrieval and indexed primary-source extracts. This is documentary support, not a hands-on test.', '', '| Key | Source | Evidence | URL |','| --- | --- | --- | --- |']
for k,s in data['sources'].items():source_report.append(f"| {k} | {s['title']} | {s['evidence']} | {s['url']} |")
source_report+=['','## B00 / Catalogue-to-source mapping','','| Entry | Approach | Device scope | Source keys |','| --- | --- | --- | --- |']
for e in data['entries']:source_report.append(f"| {e['title']} | {e['route']} / {e['status']} | {', '.join(e['platforms'])} | {', '.join(e['sources'])} |")
(ROOT/'research'/'SOURCES.md').write_text('\n'.join(source_report)+'\n')
print('Assembled 10 standalone applications and gallery.')
