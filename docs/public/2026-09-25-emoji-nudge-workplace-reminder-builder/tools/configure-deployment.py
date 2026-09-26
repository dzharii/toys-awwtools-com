"""Set canonical and social URLs: python3 tools/configure-deployment.py https://your.host/path/"""
from pathlib import Path
from urllib.parse import urlparse
import sys,re
if len(sys.argv)!=2: raise SystemExit('Supply the final public HTTPS URL.')
url=sys.argv[1].rstrip('/')+'/'
parsed=urlparse(url)
if parsed.scheme!='https' or not parsed.netloc or parsed.query or parsed.fragment or any(c in url for c in '<>"\' '):
    raise SystemExit('Use an absolute HTTPS URL without query, fragment, spaces, or quotes.')
p=Path(__file__).resolve().parents[1]/'index.html'
s=p.read_text()
s=re.sub(r'(<link rel="canonical" href=")[^"]+',lambda m:m[1]+url,s)
s=re.sub(r'(<meta property="og:url" content=")[^"]+',lambda m:m[1]+url,s)
s=re.sub(r'(<meta (?:property="og:image"|name="twitter:image") content=")[^"]+',lambda m:m[1]+url+'social-preview.jpg',s)
p.write_text(s,encoding='ascii')
print('Deployment URLs updated to '+url)
