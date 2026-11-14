"""Render the dedicated social-card layout precisely from the same share-page content.

This is a deterministic JPEG render, not an AI-generated text image or a claimed
browser screenshot. Runtime HTML and this compact social layout share post data,
portraits, illustrations, colors and hierarchy; the social layout omits controls.
"""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
import json,hashlib
root=Path(__file__).resolve().parents[1]
regular='/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
bold='/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
def font(size,heavy=False):return ImageFont.truetype(bold if heavy else regular,size)
def wrap(text,f,width):
    lines=[];line=''
    for word in text.split():
        proposed=(line+' '+word).strip()
        if f.getlength(proposed)>width and line:lines.append(line);line=word
        else:line=proposed
    if line:lines.append(line)
    return lines
problems=json.loads((root/'dist/catalog.json').read_text())['problems']
posts={p['id']:p for p in json.loads((root/'docs/sharing/posts.json').read_text())}
art=json.loads((root/'dist/illustrations.json').read_text())
manifest=[]
for p in problems:
    post=posts[p['id']]
    im=Image.new('RGB',(1200,630),'#20252c');d=ImageDraw.Draw(im)
    d.rounded_rectangle((24,24,1175,605),radius=25,fill='#242a32',outline='#3b424d',width=2)
    avatar=Image.open(root/f'dist/assets/avatars/{p["id"]}.jpg').resize((76,76),Image.Resampling.LANCZOS)
    mask=Image.new('L',(76,76));ImageDraw.Draw(mask).ellipse((0,0,75,75),fill=255);im.paste(avatar,(60,52),mask)
    d.text((152,55),post['name'],font=font(28,True),fill='#edf0f4')
    d.text((152,94),'@'+post['handle'],font=font(22),fill='#aeb8c5')
    d.text((1030,62),'LEETER',font=font(18,True),fill='#f2ba58')
    d.text((60,153),f'LeetCode #{p["id"]}  /  {p["difficulty"]}',font=font(20),fill='#f2ba58')
    title_font=font(32,True);titles=wrap(p['title'],title_font,1080)
    assert len(titles)<=2,(p['id'],'title overflow')
    y=190
    for line in titles:d.text((60,y),line,font=title_font,fill='#edf0f4');y+=41
    body_top=y+16
    for size in range(32,25,-1):
        body_font=font(size);lines=wrap(post['text'],body_font,1080);leading=size+11
        if body_top+len(lines)*leading<=423:break
    assert body_top+len(lines)*leading<=423,(p['id'],'post overflow')
    y=body_top
    for line in lines:d.text((60,y),line,font=body_font,fill='#edf0f4');y+=leading
    illustration=Image.open(root/'dist'/art[str(p['id'])]['src']).convert('RGBA').resize((840,140),Image.Resampling.LANCZOS)
    im.paste(illustration,(180,426),illustration)
    d.line((60,568,1140,568),fill='#3b424d',width=1)
    d.text((60,580),f'Try #{p["id"]} on LeetCode',font=font(20),fill='#f2ba58')
    label='LeetPick / Original joke / Fictional profile';f=font(18)
    d.text((1140-f.getlength(label),582),label,font=f,fill='#aeb8c5')
    path=root/f'dist/assets/social/{p["id"]}-{p["slug"]}.jpg'
    im.save(path,quality=88,optimize=True,progressive=True,subsampling=0)
    manifest.append({'id':p['id'],'src':str(path.relative_to(root/'dist')),'width':1200,'height':630,'bytes':path.stat().st_size,'sha256':hashlib.sha256(path.read_bytes()).hexdigest(),'titleLines':len(titles),'postLines':len(lines),'postFont':size,'textBottom':y,'artTop':426})
(root/'docs/sharing/preview-manifest.json').write_text(json.dumps(manifest,indent=2)+'\n')
print(json.dumps({'previews':len(manifest),'total_bytes':sum(x['bytes'] for x in manifest),'min_post_font':min(x['postFont'] for x in manifest),'overflow':False}))
