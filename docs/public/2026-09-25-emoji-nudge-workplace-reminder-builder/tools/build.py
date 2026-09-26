"""Regenerate native HTML option markup from the central ASCII catalog."""
import json,re
from pathlib import Path
root=Path(__file__).resolve().parents[1]
s=(root/'catalog.js').read_text()
data=json.loads(s[s.index('{'):s.rindex('}')+1])
def emoji(points): return ''.join('&#x%X;'%p for p in points)
html=(root/'index.html').read_text()
for key,cat in data['catalog'].items():
    options=''.join('<option value="'+i['id']+'"'+(' selected' if i['id']==data['presets'][0]['parts'][key] else '')+'>'+emoji(i['points'])+' '+i['label']+'</option>' for i in cat['items'])
    html=re.sub(r'(<select id="'+key+r'"[^>]*>).*?(</select>)',lambda m:m[1]+options+m[2],html,flags=re.S)
options='<option value="custom" disabled>Custom</option>'
for group in dict.fromkeys(p['group'] for p in data['presets'] if not p['hidden']):
    options+='<optgroup label="'+group+'">'
    for p in data['presets']:
        if p['group']==group:
            face=next(i for i in data['catalog']['e']['items'] if i['id']==p['parts']['e'])
            options+='<option value="'+p['id']+'"'+(' selected' if p['id']=='classic' else '')+'>'+emoji(face['points'])+' '+p['label']+'</option>'
    options+='</optgroup>'
html=re.sub(r'(<select id="preset"[^>]*>).*?(</select>)',lambda m:m[1]+options+m[2],html,flags=re.S)
(root/'index.html').write_text(html,encoding='ascii')
print('Native catalog options regenerated.')
