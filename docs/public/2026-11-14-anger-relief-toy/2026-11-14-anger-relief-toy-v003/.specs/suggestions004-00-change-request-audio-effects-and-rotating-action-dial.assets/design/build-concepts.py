from pathlib import Path
from math import sin,cos,pi
from base64 import b64encode
from html import escape
root=Path(__file__).resolve().parents[3]
out=Path(__file__).parent
cx,cy=460,348

def pt(r,a):
 a=a*pi/180
 return cx+r*sin(a),cy-r*cos(a)
def wedge(ri,ro,a,b):
 p=pt(ro,a);q=pt(ro,b);u=pt(ri,b);v=pt(ri,a)
 return f'M{p[0]:.3f} {p[1]:.3f} A{ro} {ro} 0 0 1 {q[0]:.3f} {q[1]:.3f} L{u[0]:.3f} {u[1]:.3f} A{ri} {ri} 0 0 0 {v[0]:.3f} {v[1]:.3f} Z'
def icon(slug,x,y,size):
 s=(root/'src/effects'/slug/'icon.svg').read_bytes()
 return f'<image x="{x}" y="{y}" width="{size}" height="{size}" href="data:image/svg+xml;base64,{b64encode(s).decode()}"/>'
def page():
 s='<rect width="920" height="720" fill="#f4f6f8"/><rect x="10" y="8" width="900" height="674" rx="18" fill="#fff" stroke="#d6dde3"/>'
 s+='<path d="M28 8H892Q910 8 910 26V52H10V26Q10 8 28 8" fill="#f2f4f7"/><circle cx="30" cy="30" r="5" fill="#fa7975"/><circle cx="48" cy="30" r="5" fill="#f2c266"/><circle cx="66" cy="30" r="5" fill="#80cc9a"/>'
 s+='<rect x="124" y="17" width="588" height="26" rx="13" fill="#fff" stroke="#e0e5ea"/><text x="148" y="35" font-size="13" fill="#637183">news.example.test/discussion/38412</text>'
 s+='<rect x="24" y="66" width="872" height="34" rx="3" fill="#ffdec4"/><rect x="34" y="72" width="23" height="23" rx="2" fill="#f47c2d"/><text x="40" y="90" font-size="19" fill="#fff">Y</text><text x="68" y="88" font-size="15" font-weight="700">Hacker News</text><text x="181" y="88" font-size="13" fill="#685448">new | past | comments | ask | show | jobs</text><text x="853" y="88" font-size="13">login</text>'
 s+='<text x="46" y="131" font-size="18" font-weight="600">The surprising longevity of simple software</text><text x="46" y="153" font-size="13" fill="#7e8791">376 points by jmiller | 182 comments</text>'
 comments=[(192,'talloc','I think this is mostly about minimizing scope. The things that survive a decade','are usually the ones that do a few things well.'),(286,'evanp','Agree. Every time I have seen a project grow without a clear stopping point,','it just accretes features until nobody understands how it works.'),(388,'kthom','There is also something to be said for leaving working systems alone.','Complexity so often becomes a maintenance cost.'),(493,'mayfly','Yep. Boring tech in a good way tends to stay boring in a good way.','A simple tool that is easy to understand has a very long life.'),(576,'rachel','A question worth asking: what can we remove?','Sometimes the best thing to build is the smallest useful version.')]
 for j,(y,n,a,b) in enumerate(comments):
  x=48+(j%3)*18
  s+=f'<path d="M{x-10} {y-10}v72" stroke="#e4e7e8"/><text x="{x}" y="{y}" font-size="13" fill="#828b96">{n}  6 hours ago [-]</text><text x="{x}" y="{y+24}" font-size="14" fill="#4d5661">{a}</text><text x="{x}" y="{y+45}" font-size="14" fill="#4d5661">{b}</text><text x="{x}" y="{y+65}" font-size="12" fill="#8a939c">reply</text>'
 return s

def build(kind,title):
 defs=f'''<defs>
 <linearGradient id="glass" x1="0" y1="0" x2=".65" y2="1"><stop stop-color="#fff" stop-opacity=".98"/><stop offset=".55" stop-color="#f4f9fc" stop-opacity=".93"/><stop offset="1" stop-color="#eaf0f5" stop-opacity=".95"/></linearGradient>
 <linearGradient id="metal" x1="0" y1="0" x2=".9" y2="1"><stop stop-color="#fff"/><stop offset=".23" stop-color="#f3f6f9"/><stop offset=".52" stop-color="#dce4eb"/><stop offset=".72" stop-color="#f9fbfd"/><stop offset="1" stop-color="#aebdc9"/></linearGradient>
 <linearGradient id="brass" x1="0" y1="0" x2=".8" y2="1"><stop stop-color="#fff8df"/><stop offset=".45" stop-color="#e5d29d"/><stop offset=".72" stop-color="#faf1d3"/><stop offset="1" stop-color="#bdac7b"/></linearGradient>
 <linearGradient id="ceramic" x1="0" y1="0" x2=".8" y2="1"><stop stop-color="#fff"/><stop offset=".65" stop-color="#f7fbfc"/><stop offset="1" stop-color="#c4d9df"/></linearGradient>
 <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%"><feDropShadow dx="0" dy="9" stdDeviation="12" flood-color="#354c63" flood-opacity=".14"/></filter>
 <filter id="armshadow" x="-50%" y="-50%" width="200%" height="200%"><feDropShadow dx="3" dy="6" stdDeviation="4" flood-color="#33475b" flood-opacity=".25"/></filter>
 <mask id="moving-mask"><rect width="920" height="720" fill="white"/><path d="{wedge(84,230,291,339)}" fill="black"/></mask>
 </defs>'''
 s=f'<svg xmlns="http://www.w3.org/2000/svg" width="920" height="720" viewBox="0 0 920 720"><title>{escape(title)}: static design prototype</title><desc>920 by 720 synthetic discussion context. A 420 pixel glass action dial, nine positions of which one is concealed beneath a stationary upper-left separator. This is not a browser verification screenshot.</desc>{defs}<g font-family="Arial, Helvetica, sans-serif" fill="#263545">'
 s+=page()
 s+=f'<circle cx="{cx}" cy="{cy}" r="210" fill="url(#glass)" stroke="#c9d6e0" stroke-width="1.2" filter="url(#shadow)"/><circle cx="{cx}" cy="{cy}" r="205" fill="none" stroke="#fff" stroke-width="2"/>'
 s+=f'<g mask="url(#moving-mask)"><path d="{wedge(88,204,335,375)}" fill="#d1f2f5" fill-opacity=".75"/>'
 # Nine fixed-size visual positions. NW position is completely hidden by the mask.
 slots=[('wrecking-ball',['Wrecking','Ball']),('punch-element',['Punch']),('shatter-element',['Shatter']),('gravity-collapse',['Gravity']),('text-bomb',['Text Bomb']),('flashlight',['Flashlight']),('screen-crack',['Screen','Crack']),('rubber-band',['Rubber']),('vortex',['Vortex'])]
 # Existing Shatter module name differs across source versions.
 if not (root/'src/effects/shatter-element/icon.svg').exists(): slots[2]=('glass-shatter',['Shatter'])
 for i,(slug,label) in enumerate(slots):
  a=315+i*40
  u=pt(90,a-20);v=pt(204,a-20)
  s+=f'<path d="M{u[0]} {u[1]}L{v[0]} {v[1]}" stroke="#d4dfe7" stroke-width="1"/>'
  x,y=pt(149,a)
  s+=icon(slug,x-23,y-37,46)
  for j,line in enumerate(label):s+=f'<text x="{x}" y="{y+27+j*16}" text-anchor="middle" font-size="14" font-weight="600">{escape(line)}</text>'
 s+='</g>'
 # Stationary separator material and mounting vary. All occlude the same full wedge.
 path=wedge(86,222,291,339)
 if kind=='a':
  s+=f'<g filter="url(#armshadow)"><path d="{path}" fill="url(#metal)" stroke="#a8b7c5" stroke-width="1.2"/><path d="M280 168Q270 155 282 146L300 134Q309 130 317 141L365 212L341 238Z" fill="url(#metal)" stroke="#adbdc9"/><path d="M295 167L356 226" stroke="#fff" stroke-width="2" opacity=".9"/></g>'
  for x,y in [(296,155),(381,268)]:s+=f'<circle cx="{x}" cy="{y}" r="7" fill="#f2f6fa" stroke="#a7b7c6"/><path d="M{x-3} {y}h6" stroke="#8698a8"/>'
 elif kind=='b':
  s+=f'<g filter="url(#armshadow)"><path d="{path}" fill="url(#brass)" stroke="#b5a477" stroke-width="1.2"/><path d="{wedge(105,205,295,335)}" fill="none" stroke="#fff9e6" stroke-width="1.5"/><path d="M283 175L267 155Q261 145 270 141L286 136Q294 134 300 144L317 168" fill="url(#brass)" stroke="#beaf89"/></g>'
  for r,a in [(200,299),(200,331),(101,315)]:
   x,y=pt(r,a);s+=f'<circle cx="{x}" cy="{y}" r="4.5" fill="#faf4df" stroke="#a89666"/>'
  for a in range(301,331,5):
   x,y=pt(180,a);q,w=pt(188,a);s+=f'<path d="M{x} {y}L{q} {w}" stroke="#ad9a66" stroke-width="1.3"/>'
 else:
  s+=f'<g filter="url(#armshadow)"><path d="{path}" fill="url(#ceramic)" stroke="#a9c3cd" stroke-width="1.2"/><path d="{wedge(91,101,291,339)}" fill="#a5dce0" stroke="#8ac8d0"/><path d="M277 178L267 164Q259 153 270 144L283 137Q294 133 301 145L318 168" fill="url(#ceramic)" stroke="#aac5ce"/></g>'
  for a in [300,307,314,321,328]:
   x,y=pt(175,a);q,w=pt(191,a);s+=f'<path d="M{x} {y}L{q} {w}" stroke="#d3e2e8" stroke-width="3" stroke-linecap="round"/>'
  x,y=pt(210,315);s+=f'<circle cx="{x}" cy="{y}" r="8" fill="#fff" stroke="#aac3cd"/><circle cx="{x}" cy="{y}" r="3" fill="#9dced6"/>'
 s+=f'<circle cx="{cx}" cy="{cy}" r="86" fill="url(#glass)" stroke="#d2dfe7" stroke-width="1.5"/><circle cx="{cx}" cy="{cy}" r="81" fill="none" stroke="#fff"/><text x="{cx}" y="{cy+6}" text-anchor="middle" font-size="19" font-weight="600">All tools</text>'
 s+='<rect x="668" y="132" width="138" height="32" rx="16" fill="#fffffff0" stroke="#d5dfe6"/><text x="737" y="153" text-anchor="middle" font-size="14" fill="#536574">Alt+Shift+A</text><circle cx="650" cy="148" r="17" fill="#fffffff0" stroke="#d5dfe6"/><path d="m644 142 12 12m0-12-12 12" stroke="#4b6070" stroke-width="1.8" stroke-linecap="round"/>'
 # Stable three-control inventory, without a permanent instruction/status line.
 s+='<rect x="204" y="614" width="512" height="58" rx="23" fill="url(#glass)" stroke="#c5d5e1" filter="url(#shadow)"/>'
 s+=icon('punch-element',219,624,36)
 s+='<text x="268" y="650" font-size="16" font-weight="600">Punch</text>'
 for x,w,label,disabled in [(369,94,'Switch',False),(471,109,'End effect',True),(588,111,'Put away',False)]:
  s+=f'<rect x="{x}" y="625" width="{w}" height="36" rx="10" fill="{("#f1f4f6" if disabled else "#fff")}" stroke="#d7e1e8"/><text x="{x+w/2}" y="648" text-anchor="middle" font-size="14" fill="{("#a0acb7" if disabled else "#354d60")}">{label}</text>'
 s+='<path d="m754 450 2 23 6-7 6 8 5-3-6-8 9-2Z" fill="#fff" stroke="#253a4c" stroke-width="1.5"/>'
 s+='<circle cx="797" cy="495" r="23" fill="url(#glass)" stroke="#d0dce5"/>'+icon('punch-element',781,479,32)
 s+=f'<text x="20" y="705" font-size="13" fill="#607183">{escape(title)}. Static prototype, not browser evidence.</text></g></svg>'
 return s

for kind,title in [('a','A - Light metallic arm'),('b','B - Instrument retaining hood'),('c','C - Sculpted mechanical cover')]:
 (out/f'concept-{kind}.svg').write_text(build(kind,title))
