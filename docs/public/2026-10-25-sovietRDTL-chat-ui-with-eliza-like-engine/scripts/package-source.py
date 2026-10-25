"""Reproducible portable source export. No reference images, history, reports or credentials."""
from __future__ import annotations
import argparse
import hashlib
import json
from pathlib import Path, PurePosixPath
import re
import zipfile

ROOT = Path(__file__).resolve().parent.parent
CORE_FILES = [
    'README.md', 'LICENSE', 'agents.md', 'AGENTS.md', 'package.json', 'package-lock.json',
    'index.html', 'styles.css', 'favicon.svg', 'playwright.config.js',
    'docs/catalog.md', 'docs/cr-001-assets.json',
    'scripts/catalog.mjs', 'scripts/json-schema.mjs', 'scripts/address-policy.mjs',
    'scripts/lexicon.mjs', 'scripts/release.mjs', 'scripts/production-gate.mjs',
    'scripts/explore.mjs', 'scripts/package-source.py',
    'research/reviews/final-acceptance.json', 'research/reviews/hint-review.json',
    'research/reviews/cr-002-catalog-review.json',
    '.specs/PROJECT.md', '.specs/DATA.md', '.specs/BEHAVIOR.md', '.specs/BUILD.md',
    '.specs/register-style.md', '.specs/PACKAGE-README.md'
]


def contents() -> dict[str, bytes]:
    paths = set(CORE_FILES)
    for directory in ['src', 'data', 'tests']:
        paths.update(p.relative_to(ROOT).as_posix() for p in (ROOT/directory).rglob('*') if p.is_file())
    registry = (ROOT/'src/config/backgrounds.js').read_text()
    assets = set(re.findall(r'["\']\./(assets/backgrounds/[^"\']+\.webp)["\']', registry))
    if len(assets) != 40:
        raise ValueError(f'Expected 40 approved current background variants, found {len(assets)}')
    paths.update(assets)
    result = {}
    for name in sorted(paths):
        relative = PurePosixPath(name)
        if relative.is_absolute() or '..' in relative.parts:
            raise ValueError('Unsafe archive member')
        file = ROOT/name
        if not file.is_file() or not file.resolve().is_relative_to(ROOT):
            raise ValueError(f'Missing or external source: {name}')
        if file.suffix in {'.tmp', '.rollback', '.zip', '.tar', '.gz'}:
            raise ValueError(f'Unexpected generated file: {name}')
        result[name] = file.read_bytes()
    # Compact navigation is self-contained in a fresh export.
    result['.specs/README.md'] = result['.specs/PACKAGE-README.md']
    result['.gitignore'] = b'node_modules/\ndist/\n.openai/\ntest-results/\nplaywright-report/\n*.zip\n*.tar.gz\n'
    # Keep current resource checksums; discard metadata referring only to excluded original PNG files.
    manifest = json.loads(result['docs/cr-001-assets.json'])
    fields = ['id', 'variant', 'path', 'width', 'height', 'bytes', 'sha256']
    result['docs/cr-001-assets.json'] = (json.dumps([{k:r[k] for k in fields} for r in manifest], ensure_ascii=False, indent=2)+'\n').encode()
    review=json.loads(result['research/reviews/hint-review.json'])
    for row in review:row.pop('before',None)
    result['research/reviews/hint-review.json']=(json.dumps(review,ensure_ascii=False,indent=2)+'\n').encode()
    return result


def make_archive(destination: Path) -> dict:
    files = contents()
    version = json.loads(files['package.json'])['version']
    source_bytes = sum(map(len,files.values()))
    archive_manifest = {
        'project':'sovet-rdtl','version':version,'format':'portable-source',
        'build':'npm run validate && npm run release && npm test',
        'runtimeBackgroundVariants':40,
        'excludes':['node_modules','dist','.git','.openai','credentials','reference images','original images','screenshots','legacy exports','run reports'],
        'files':[{'path':name,'bytes':len(data),'sha256':hashlib.sha256(data).hexdigest()} for name,data in sorted(files.items())]
    }
    files['ARCHIVE.json'] = (json.dumps(archive_manifest,ensure_ascii=False,indent=2)+'\n').encode()
    destination.parent.mkdir(parents=True,exist_ok=True)
    with zipfile.ZipFile(destination,'w',compression=zipfile.ZIP_DEFLATED,compresslevel=9) as archive:
        for name,data in sorted(files.items()):
            info=zipfile.ZipInfo('sovet-rdtl/'+name, date_time=(2026,10,24,0,0,0))
            info.compress_type=zipfile.ZIP_STORED if name.endswith('.webp') else zipfile.ZIP_DEFLATED
            info.external_attr=0o100644 << 16
            archive.writestr(info,data,compresslevel=9)
    with zipfile.ZipFile(destination) as archive:
        if archive.testzip() is not None:
            raise ValueError('ZIP checksum failure')
        names=archive.namelist()
        for name in names:
            if PurePosixPath(name).is_absolute() or '..' in PurePosixPath(name).parts:
                raise ValueError('Unsafe path')
            if any(part in name.split('/') for part in ['node_modules','dist','.git','.openai','references','screenshots','release-assets']):
                raise ValueError('Excluded content in archive')
        for row in archive_manifest['files']:
            data=archive.read('sovet-rdtl/'+row['path'])
            if hashlib.sha256(data).hexdigest()!=row['sha256']:
                raise ValueError('Manifest mismatch: '+row['path'])
    size=destination.stat().st_size
    if size > 10*1024*1024:
        raise ValueError(f'Archive exceeds 10 MiB: {size}')
    return {'archive':str(destination),'version':version,'files':len(files),'sourceBytes':source_bytes,'zipBytes':size,'sha256':hashlib.sha256(destination.read_bytes()).hexdigest()}


if __name__ == '__main__':
    parser=argparse.ArgumentParser()
    parser.add_argument('--output',type=Path)
    args=parser.parse_args()
    version=json.loads((ROOT/'package.json').read_text())['version']
    output=(args.output or ROOT/f'sovet-rdtl-{version}-source.zip').resolve()
    print(json.dumps(make_archive(output),ensure_ascii=False))
