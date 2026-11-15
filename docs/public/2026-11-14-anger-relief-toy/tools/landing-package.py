"""Package unchanged inputs and deterministic landing assets; no extension build."""

import hashlib
import json
import sys
import zipfile
import re
import xml.etree.ElementTree as ET
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit

ROOT = Path(__file__).resolve().parents[1]
EVIDENCE = ROOT / "evidence" / "005"
DOWNLOADS = ROOT / "downloads"
VERSION = ROOT / "2026-11-14-anger-relief-toy-v003"
ARCHIVE = DOWNLOADS / "anger-relief-toy-v003.zip"
SITE_ARCHIVE = DOWNLOADS / "anger-relief-toy-website.zip"


def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def write_zip(destination, entries):
    with zipfile.ZipFile(destination, "w", zipfile.ZIP_DEFLATED, compresslevel=9) as archive:
        for name, path in sorted(entries):
            info = zipfile.ZipInfo(name, date_time=(2026, 11, 14, 12, 0, 0))
            info.compress_type = zipfile.ZIP_DEFLATED
            info.external_attr = 0o644 << 16
            archive.writestr(info, path.read_bytes())
    with zipfile.ZipFile(destination) as archive:
        assert archive.testzip() is None


def input_hashes():
    paths = [ROOT / f"2026-11-14-anger-relief-toy-v00{i}" for i in range(1, 4)]
    paths += [ROOT / ".specs"]
    return {
        path.relative_to(ROOT).as_posix(): digest(path)
        for folder in paths
        for path in sorted(folder.rglob("*"))
        if path.is_file()
    }


def extension():
    DOWNLOADS.mkdir(exist_ok=True)
    EVIDENCE.mkdir(parents=True, exist_ok=True)
    baseline = EVIDENCE / "input-hashes.json"
    if not baseline.exists():
        baseline.write_text(json.dumps(input_hashes(), indent=2) + "\n", encoding="utf-8")
    else:
        assert json.loads(baseline.read_text()) == input_hashes(), "Historical inputs changed"
    dist = VERSION / "dist"
    entries = [(p.relative_to(dist).as_posix(), p) for p in dist.rglob("*") if p.is_file()]
    write_zip(ARCHIVE, entries)
    with zipfile.ZipFile(ARCHIVE) as archive:
        manifest = json.loads(archive.read("manifest.json"))
        assert manifest["version"] == "0.3.0"
        for name, path in entries:
            assert archive.read(name) == path.read_bytes()
    print(f"Extension ZIP: {len(entries)} byte-identical files, {ARCHIVE.stat().st_size} bytes")


def website():
    assert json.loads((EVIDENCE / "input-hashes.json").read_text()) == input_hashes()
    entries = []
    for path in ROOT.rglob("*"):
        if not path.is_file() or path == SITE_ARCHIVE:
            continue
        relative = path.relative_to(ROOT)
        if any(part in {"node_modules", ".temp", "__pycache__"} for part in relative.parts):
            continue
        entries.append((relative.as_posix(), path))
    write_zip(SITE_ARCHIVE, entries)
    with zipfile.ZipFile(SITE_ARCHIVE) as archive:
        for name, path in entries:
            assert archive.read(name) == path.read_bytes(), name
        for reference in local_references():
            assert reference in archive.namelist(), reference
        for name, expected in input_hashes().items():
            assert hashlib.sha256(archive.read(name)).hexdigest() == expected, name
    print(f"Website ZIP: {len(entries)} files, {SITE_ARCHIVE.stat().st_size} bytes")
    print("All website members byte-identical; published local links and original folders preserved")


class References(HTMLParser):
    def __init__(self):
        super().__init__()
        self.references = []
        self.ids = []
        self.h1 = 0
        self.scripts = 0

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        self.ids.extend([attrs["id"]] if "id" in attrs else [])
        self.h1 += tag == "h1"
        self.scripts += tag == "script"
        for key in ("href", "src", "srcset"):
            if key in attrs:
                self.references.append(attrs[key])


def local_references():
    parser = References()
    parser.feed((ROOT / "index.html").read_text(encoding="utf-8"))
    assert parser.h1 == 1 and parser.scripts == 0
    assert len(parser.ids) == len(set(parser.ids))
    local = set()
    for ref in parser.references:
        url = urlsplit(ref)
        if url.scheme:
            assert url.scheme in {"http", "https"}, ref
            continue
        if not url.path:
            assert url.fragment in parser.ids, ref
        else:
            path = unquote(url.path)
            assert (ROOT / path).is_file(), ref
            local.add(path)
    return sorted(local)


def verify():
    baseline = json.loads((EVIDENCE / "input-hashes.json").read_text())
    assert baseline == input_hashes(), "Historical inputs changed"
    references = local_references()
    with zipfile.ZipFile(ARCHIVE) as archive:
        assert archive.testzip() is None
        manifest = json.loads(archive.read("manifest.json"))
        assert manifest["version"] == "0.3.0"
        assert set(manifest["permissions"]) == {"activeTab", "scripting", "storage"}
        required = [manifest["background"]["service_worker"], manifest["action"]["default_popup"]]
        required.extend(manifest["icons"].values())
        assert all(name in archive.namelist() for name in required)
        for name in archive.namelist():
            assert archive.read(name) == (VERSION / "dist" / name).read_bytes()
        count = len(archive.namelist())
        assert len([name for name in archive.namelist() if name.startswith("effects/")]) == 18
    docs = ROOT.parents[1]
    index = (docs / "index.html").read_text(encoding="utf-8")
    missing = [
        href for href in re.findall(r'href="([^"]+)"', index)
        if href.startswith("/") and not (docs / href.lstrip("/")).exists()
    ]
    previews = [
        href for href in re.findall(r'data-index-href="([^"]+)"', index)
        if not (docs / href.lstrip("/") / "index.html").is_file()
    ]
    items = ET.parse(docs / "rss.xml").findall("./channel/item")
    assert not missing and not previews
    assert len(items) == len(re.findall(r'<li class="project-item"', index))
    item = next(item for item in items if item.findtext("title") == "Anger Relief Toy")
    assert item.findtext("category") == "Toys"
    assert item.findtext("pubDate") == "Sat, 14 Nov 2026 12:00:00 GMT"
    assert item.findtext("description") in index
    result = {
        "status": "passed",
        "extensionFiles": count,
        "extensionBytes": ARCHIVE.stat().st_size,
        "extensionSha256": digest(ARCHIVE),
        "manifestAtZipRoot": True,
        "manifestVersion": manifest["version"],
        "enabledEffectBundles": 18,
        "historicalInputsUnchanged": len(baseline),
        "localReferences": references,
        "oneHeadingNoScriptsUniqueIds": True,
        "projectIndexMissingLinks": missing,
        "projectIndexBadPreviewTargets": previews,
        "rssItemsAndProjects": len(items),
        "pageAndPublishedImagesBytes": (ROOT / "index.html").stat().st_size + sum(
            path.stat().st_size for path in (ROOT / "assets" / "landing").rglob("*") if path.is_file()
        ),
    }
    (EVIDENCE / "package-result.json").write_text(json.dumps(result, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({key: value for key, value in result.items() if key != "localReferences"}))


def images():
    from PIL import Image, ImageChops

    native = EVIDENCE / "native"
    target = ROOT / "assets" / "landing"
    (target / "icons").mkdir(parents=True, exist_ok=True)
    crops = {
        "dial": ("dial-inventory", (230, 140, 690, 582)),
        "inventory": ("dial-inventory", (478, 638, 772, 690)),
        "punch-before": ("before", (20, 160, 390, 310)),
        "punch-during": ("punch-during", (20, 160, 390, 310)),
        "punch-after": ("after", (20, 160, 390, 310)),
        "catalog": ("catalog", (120, 100, 810, 350)),
        "catalog-narrow": ("catalog", (120, 100, 480, 350)),
    }
    records = []
    for name, (source, crop) in crops.items():
        original = native / f"{source}.png"
        output = target / f"{name}.webp"
        with Image.open(original) as image:
            image.crop(crop).save(output, "WEBP", lossless=True, method=6)
        records.append({
            "asset": output.relative_to(ROOT).as_posix(),
            "original": original.relative_to(ROOT).as_posix(),
            "originalSha256": digest(original),
            "crop": crop,
            "encoding": "Pillow lossless WebP; no resizing, annotations or pixel synthesis",
            "bytes": output.stat().st_size,
        })
    before = Image.open(native / "before.png").convert("RGB")
    after = Image.open(native / "after.png").convert("RGB")
    diff = ImageChops.difference(before, after)
    assert diff.getbbox() is None, "Cleanup screenshot differs from original page"
    text = (VERSION / "src" / "generated" / "catalog.ts").read_text(encoding="utf-8")
    catalog = json.loads(text[text.index("= [") + 2:].strip().removesuffix(";"))
    for entry in catalog:
        assert entry["enabled"]
        svg = entry["iconSvg"]
        assert "<script" not in svg and "href=" not in svg
        (target / "icons" / f"{entry['id']}.svg").write_text(svg, encoding="utf-8")
    (EVIDENCE / "image-provenance.json").write_text(
        json.dumps({"images": records, "cleanupPixelIdentical": True, "icons": "Unchanged iconSvg from v003 generated catalog"}, indent=2) + "\n",
        encoding="utf-8",
    )
    print(f"Published images: {sum(item['bytes'] for item in records)} bytes; baseline and cleanup pixel-identical")


if __name__ == "__main__":
    {"extension": extension, "website": website, "images": images, "verify": verify}[sys.argv[1]]()
