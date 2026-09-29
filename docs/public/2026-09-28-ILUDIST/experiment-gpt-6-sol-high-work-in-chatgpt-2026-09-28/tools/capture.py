from pathlib import Path
import json,sys,fitz
from PIL import Image
from io import BytesIO
import weasyprint
ROOT=Path(__file__).resolve().parents[1]
for path in [ROOT/x for x in ['cabinet','sanctuary','switchyard','dial','portals','editorial','contrast','constellation','archipelago','folio']]:
    data=json.loads((path/'data.json').read_text())
    picks=[f for f in data if f['category']=='Search'][:2]
    cards=''.join(f'<article class="result-card"><div class="meta"><span>{f["type"]} · {f["category"]}</span></div><h3>{f["intent"]}</h3><p>{f["title"]}</p><button>See the steps</button><span class="service">{f["service"]} · checked {f["verified"]}</span></article>' for f in picks)
    html=(path/'index.html').read_text().replace('<div id="results" class="results"></div>',f'<div id="results" class="results">{cards}</div>')
    extra=''
    if path.name=='cabinet':extra='.brand .overline{display:none}'
    if path.name=='sanctuary':extra='.questions{display:flex}.questions button{width:32%;min-height:140px}.chapel-cats{display:flex}.chapel-cat{min-width:95px}'
    if path.name=='dial':extra='.dial-wrap{height:350px;width:350px}.dial-wheel{height:350px;width:350px}.dial-sector{display:none}.dial-hub{inset:28%;height:44%;width:44%}.dial-help{margin-top:1rem}'
    if path.name=='archipelago':extra='.islands{height:570px}.island{width:140px;height:125px}.island-0{left:25px;top:30px}.island-1{left:230px;top:35px}.island-2{left:145px;top:190px}.island-3{left:20px;top:290px}.island-4{left:260px;top:300px}.island-5{left:80px;top:430px}.island-6{left:245px;top:440px}.island-7{left:160px;top:350px;width:100px;height:100px}'
    if path.name=='folio':extra='.binder-tabs{position:static;display:flex;margin-top:3rem}.binder-tab{writing-mode:horizontal-tb;min-width:45px;min-height:40px}.paper-stack{margin-right:0}.paper-front{min-height:580px}'
    html=html.replace('</head>',f'<style>@page{{size:430px 860px;margin:0}}.splash{{display:none!important}}{extra}</style></head>')
    try:
        pdf=weasyprint.HTML(string=html,base_url=path.as_uri()+'/').write_pdf()
        doc=fitz.open(stream=pdf,filetype='pdf')
        pix=doc[0].get_pixmap(matrix=fitz.Matrix(1.5,1.5),alpha=False)
        im=Image.open(BytesIO(pix.tobytes('png'))).convert('RGB')
        im.save(path/'screenshot.jpg',quality=86,optimize=True)
        print(path.name,len(doc),im.size)
    except Exception as e:print(path.name,'ERROR',str(e)[:150]);raise
