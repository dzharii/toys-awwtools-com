"""Prepare the ten self-contained static apps and their publishing assets."""

from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
import argparse
import math
import os
import shutil
import subprocess
import tempfile
import zipfile

ROOT = Path(__file__).resolve().parents[1]
REFERENCE = ROOT / ".spec-images"
APPS = [
    ("01-linework", "Linework", "Follow a different route.", "✦", (11, 17, 17), (216, 177, 122), 1),
    ("02-editorial", "The Quiet Edition", "A quieter internet, in print.", "I", (239, 232, 219), (100, 43, 40), 2),
    ("03-dial", "The Dial", "Turn toward what matters.", "◉", (21, 19, 16), (224, 175, 105), 3),
    ("04-folio", "The Folio", "A fix worth keeping.", "▤", (44, 29, 21), (232, 208, 170), 4),
    ("05-atlas", "The Atlas", "Find a different way through.", "◇", (13, 32, 35), (222, 173, 115), 5),
    ("06-workshop", "The Workshop", "Tools for a clearer internet.", "⌕", (44, 29, 19), (225, 177, 111), 6),
    ("07-doorways", "The Doorways", "Three ways through.", "⌂", (18, 16, 17), (225, 180, 121), 7),
    ("08-constellation", "The Constellation", "Start with what bothers you.", "✧", (14, 19, 28), (222, 181, 125), 8),
    ("09-comparison", "Before / After", "Less noise. More choice.", "↔", (17, 17, 17), (216, 169, 124), 9),
    ("10-wayfinder", "The Wayfinder", "Find your own route.", "✦", (20, 17, 17), (226, 170, 123), 10),
]
FONT = Path("C:/Windows/Fonts")


def font(size, bold=False):
    name = "georgiab.ttf" if bold else "georgia.ttf"
    return ImageFont.truetype(str(FONT / name) if (FONT / name).exists()
                              else ("DejaVuSerif-Bold.ttf" if bold else "DejaVuSerif.ttf"), size)


def sans(size):
    return ImageFont.truetype(str(FONT / "arial.ttf") if (FONT / "arial.ttf").exists()
                              else "DejaVuSans.ttf", size)


def make_social(app, title, tagline, glyph, background, accent, number):
    image = Image.new("RGB", (1200, 630), background)
    draw = ImageDraw.Draw(image)
    ink = (245, 231, 207) if number != 2 else (38, 24, 20)
    draw.rectangle((35, 35, 1165, 595), outline=accent, width=2)
    draw.text((85, 68), "ILUD", font=font(76), fill=accent)
    draw.text((92, 165), f"AN INTERNET YOU CAN CHOOSE   /   {number:02}", font=sans(19), fill=ink)
    if number == 1:
        draw.line([(740, 450), (815, 270), (935, 328), (1025, 170)], fill=accent, width=8)
        for x, y in [(740, 450), (815, 270), (935, 328), (1025, 170)]:
            draw.ellipse((x - 14, y - 14, x + 14, y + 14), outline=accent, width=5)
    elif number == 2:
        draw.pieslice((740, 90, 1190, 590), 180, 360, fill=accent)
        draw.pieslice((810, 178, 1120, 590), 180, 360, fill=(219, 195, 167))
    elif number == 3:
        for r in (195, 156, 80):
            draw.ellipse((960-r, 325-r, 960+r, 325+r), outline=accent, width=5)
        for i in range(12):
            a = math.tau*i/12
            x, y = 960+177*math.cos(a), 325+177*math.sin(a)
            draw.ellipse((x-4,y-4,x+4,y+4),fill=accent)
    elif number == 4:
        for i in range(3):
            draw.rounded_rectangle((755+i*16,130+i*23,1105+i*16,500+i*15),radius=19,fill=(154+i*22,113+i*23,81+i*21),outline=accent,width=3)
    elif number == 5:
        for x,y,r in ((810,200,76),(1020,205,63),(810,430,86),(1030,420,80)):
            draw.ellipse((x-r,y-r,x+r,y+r),fill=(61,86,67),outline=accent,width=4)
            draw.line((x,y,960,315),fill=accent,width=2)
    elif number == 6:
        draw.line((750,438,1120,438),fill=accent,width=24)
        for x, mark in ((795,"O"),(925,"X"),(1050,"V")):
            draw.text((x,235),mark,font=font(115),fill=accent)
    elif number == 7:
        for x in (745,880,1015):
            draw.rounded_rectangle((x,150,x+105,515),radius=53,outline=accent,width=4)
            draw.rectangle((x+8,209,x+96,507),fill=(39,30,23))
            draw.ellipse((x+80,350,x+89,359),fill=accent)
    elif number == 8:
        for x,y in ((770,205),(840,410),(960,275),(1060,435),(1090,185)):
            draw.line((960,320,x,y),fill=accent,width=2)
            draw.ellipse((x-10,y-10,x+10,y+10),fill=accent)
    elif number == 9:
        draw.rectangle((745,135,1100,510),fill=(55,53,53))
        draw.rectangle((925,135,1100,510),fill=(30,49,45))
        draw.line((925,135,925,510),fill=accent,width=6)
        draw.ellipse((900,300,950,350),fill=accent)
    else:
        for r in (165,120,75):
            draw.arc((770-r,325-r,770+r,325+r),20,320,fill=accent,width=4)
        draw.ellipse((750,305,790,345),fill=accent)
        draw.line((780,325,1090,325),fill=accent,width=3)
    draw.text((85, 305), title, font=font(60), fill=ink)
    draw.text((90, 392), tagline, font=font(28), fill=accent)
    draw.text((92, 538), "TEN INTERPRETATIONS  •  REAL ROUTES  •  NO ACCOUNTS", font=sans(16), fill=ink)
    image.save(app / "social.jpg", quality=88, optimize=True, subsampling=0)


def make_icon(app, glyph, background, accent, number):
    fill = f"#{background[0]:02x}{background[1]:02x}{background[2]:02x}"
    stroke = f"#{accent[0]:02x}{accent[1]:02x}{accent[2]:02x}"
    icon = f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
<rect x="2" y="2" width="60" height="60" rx="{20 if number in (3, 8, 10) else 8}" fill="{fill}" stroke="{stroke}" stroke-width="2"/>
<circle cx="32" cy="32" r="{23 if number in (3, 5, 8, 10) else 0}" fill="none" stroke="{stroke}" stroke-width="1"/>
<text x="32" y="43" text-anchor="middle" font-size="33" font-family="Georgia,serif" fill="{stroke}">{glyph}</text></svg>"""
    (app / "icon.svg").write_text(icon, encoding="utf-8")


def screenshots():
    browser = next((p for p in [
        Path("C:/Program Files/Google/Chrome/Application/chrome.exe"),
        Path("C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe"),
    ] if p.exists()), None)
    if not browser:
        raise RuntimeError("Chrome or Edge is required to capture actual application screenshots")
    with tempfile.TemporaryDirectory() as tmp:
        for slug, *_ in APPS:
            app = ROOT / slug
            raw = Path(tmp) / (slug + ".png")
            profile = Path(tmp) / ("profile-" + slug)
            result = subprocess.run([
                str(browser), "--headless=new", "--disable-gpu", "--no-first-run",
                "--hide-scrollbars", "--force-device-scale-factor=1",
                "--window-size=430,900", "--virtual-time-budget=1800",
                f"--user-data-dir={profile}", f"--screenshot={raw}",
                (app / "index.html").as_uri(),
            ], capture_output=True, timeout=35)
            if result.returncode != 0 or not raw.exists():
                raise RuntimeError(f"Screenshot failed for {slug}: {result.stderr.decode(errors='replace')[-600:]}")
            with Image.open(raw) as image:
                image.convert("RGB").save(app / "screenshot.jpg", quality=84, optimize=True)
            print(f"Captured {slug}")


def archive():
    target = ROOT / "Ilude.zip"
    with zipfile.ZipFile(target, "w", zipfile.ZIP_DEFLATED, compresslevel=6) as output:
        for parent, dirs, files in os.walk(ROOT):
            dirs[:] = [name for name in dirs if name not in (".git", "node_modules", "__pycache__")
                       and not name.startswith("experiment-")]
            for name in files:
                file = Path(parent) / name
                if file != target:
                    output.write(file, Path("2026-09-28") / "Ilude" / file.relative_to(ROOT))
    print(f"Packaged {target.name} ({target.stat().st_size // 1024} KiB)")


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--screenshots", action="store_true", help="capture every finished app with Chrome/Edge")
    parser.add_argument("--zip", action="store_true", help="package the complete project after assets are prepared")
    args = parser.parse_args()
    originals = sorted(REFERENCE.glob("*.png"))
    for slug, title, tagline, glyph, background, accent, number in APPS:
        app = ROOT / slug
        for shared in ("catalog.js", "core.js", "base.css"):
            shutil.copy2(ROOT / "shared" / shared, app / shared)
        reference = next(path for path in originals if path.name.endswith(f"-{number}.png"))
        shutil.copy2(reference, app / "reference.png")
        make_social(app, title, tagline, glyph, background, accent, number)
        make_icon(app, glyph, background, accent, number)
    make_social(ROOT, "Ten ways to a quieter web", "One purpose. Ten ways through.", "✦",
                (18, 20, 18), (220, 179, 124), 0)
    make_icon(ROOT, "✦", (18, 20, 18), (220, 179, 124), 0)
    if args.screenshots:
        screenshots()
    if args.zip:
        archive()


if __name__ == "__main__":
    main()
