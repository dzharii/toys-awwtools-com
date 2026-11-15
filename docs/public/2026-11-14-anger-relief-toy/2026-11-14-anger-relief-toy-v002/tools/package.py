from pathlib import Path
from zipfile import ZipFile,ZIP_DEFLATED
root=Path(__file__).resolve().parent.parent
with ZipFile(root/'anger-relief-toy-extension.zip','w',ZIP_DEFLATED) as archive:
 for p in sorted((root/'dist').rglob('*')):
  if p.is_file(): archive.write(p,p.relative_to(root/'dist'))
print('Created anger-relief-toy-extension.zip')
