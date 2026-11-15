"""Record the mandatory questionnaire for the static website, not a new effect."""

import hashlib
import json
import re
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "evidence" / "005"
source = ROOT / ".specs" / "suggestions001-02-answer-questions-after-each-feature-implementation.md"
questions = re.findall(r"\*\*Y-(\d{3})\.\*\* (.+)", source.read_text(encoding="utf-8"))
assert len(questions) == 187
assert json.loads((OUT / "native" / "result.json").read_text())["status"] == "passed"
assert json.loads((OUT / "website" / "result.json").read_text())["status"] == "passed"
assert json.loads((OUT / "package-result.json").read_text())["status"] == "passed"

sections = [
    (1, 7, "All 187 answers are explicit here. Implementation note distinguishes website delivery, native observations, historical component evidence and unapproved extension release gates."),
    (8, 18, "Read the supplied specifications, three READMEs/manifests/catalogs/verification records and relevant source; checked Google and Microsoft installation documentation. See docs/landing-005-implementation.md."),
    (19, 30, "The website has no scripts, remote runtime assets, forms or privileged APIs. Only project-controlled packaged extension code ran on synthetic content in a task-owned profile. No third-party bookmarklet executed and no manifest permission changed."),
    (31, 37, "image-provenance.json records original PNG paths/hashes and exact lossless crops. Tool SVGs are unchanged project-owned artwork from the v003 catalog; the footer credits that provenance. All original attribution/source records are retained."),
    (38, 47, "Inspected the actual native PNGs and responsive article captures. The three-figure composition uses real tool artwork, not a simulated dial. Refined distracting crops and retained readable inventory labels. Captioned evidence demonstrates local impact and cleanup."),
    (48, 57, "index.html, assets/landing, downloads and feature-local tests/docs are independent of the untouched extension folders. Only the explicitly requested Toys index entry and matching RSS item are shared edits."),
    (58, 69, "Static semantic HTML and inline CSS use native links/details rather than an application framework. TypeScript checks pass strictly, files use an existing formatter, and verification scripts own and close their loopback servers/browser contexts."),
    (70, 81, "No effect lifecycle was added. For editorial evidence only, native/result.json verifies repeated activations, End effect, Put away and refresh; image-provenance.json confirms pixel-identical full-page cleanup."),
    (82, 91, "The landing page does not inject into or target another page. Native evidence uses only the provided synthetic discussion. The original extension's target safety, geometry and platform limitations remain explicitly unapproved, not silently inherited as passes."),
    (92, 102, "package-result.json measures final HTML/assets against the 2 MB target. The page has no JavaScript or animation loops; secondary screenshots use native lazy loading. No extension frame-time or heap-performance claim is made."),
    (103, 110, "There is no website telemetry or diagnostic service. Evidence contains project-controlled synthetic text and local screenshot paths, not real browsing data; public copy has no private Windows/profile paths. Browser request checks found no external page requests."),
    (111, 122, "website/result.json covers three viewports, actual 200% browser zoom, native keyboard/disclosure/download behavior, reduced motion, print and no JavaScript. The opener explains the tool and installation; captions show authentic behavior without needing bookmarklet history."),
    (123, 137, "The native and website runners assert actual UI behavior and archive hashes. Reports and screenshots are preserved. An actual dial defect remains an explicit observation with a keyboard recovery, not a disabled assertion or a changed extension."),
    (138, 146, "package-result.json verifies all 680 historical inputs unchanged, all local links and preview targets, and 156 matching RSS/index items. Unrelated dirty SSML files were not changed. Root README and implementation note make the handoff self-contained."),
    (147, 154, "The implementation note explains static-page conventions, actual popup CDP targeting, Bun-to-Node test transport, original artwork, release-label mismatch, architecture boundaries and reproduction. The article is deliberately a versioned snapshot, not a runtime registry."),
    (155, 164, "Final editorial review challenged screenshot authenticity, unassigned shortcuts, existing dial behavior, missing historical evidence and manifest labels. The page discloses these; final crop refinement and link/archive checks address the website's concrete weaknesses."),
    (165, 170, "Remaining external gates are branded/platform compatibility and independent approval, not missing website controls. The owner requested reduced further testing. Existing v003 dial behavior requires a separately authorized extension revision; no original build was edited."),
    (171, 173, "Not Applicable answers refer to effect SDK, targeting, particle/audio lifecycle, research or runtime duties that this static website does not introduce. Adding an interactive simulator later would invalidate that scope; this assignment explicitly excludes one."),
    (174, 179, "Current file hashes, measured fold coordinates, actual browser screenshots, lossless image provenance and archive integrity are recorded. Final image/format-only refinement received narrow artifact/capture checks rather than repeating the broad suite, per the owner."),
    (180, 187, "Website implementation and author verification are complete; independent release approval is not claimed. The original extension remains review-pending. See the nine explicit K00 answers and genuine limits in the implementation note."),
]

na = set()
for start, end in [
    (8, 11), (13, 16), (21, 25), (32, 35), (40, 41), (46, 47),
    (49, 51), (53, 53), (56, 57), (60, 63), (66, 66), (70, 96),
    (98, 98), (100, 100), (102, 105), (109, 109), (111, 115),
    (118, 119), (124, 125), (129, 130), (132, 132), (141, 141),
    (143, 143), (153, 153), (159, 160), (167, 167), (187, 187),
]:
    na.update(range(start, end + 1))
na.update({18, 27, 43})
overrides = {
    54: ("No", "No project-wide runtime abstraction or SDK change was introduced. Only the requested index/RSS listing is shared. This is a negative answer to an inverse question, not a defect."),
    134: ("No", "Only installed Chrome for Testing 149.0.7827.55 on Windows was exercised. Branded Chrome/Edge and OS behavior remain an external extension release gate; the page explicitly distinguishes this from intended scope."),
    135: ("No", "The broad suites passed before the final crop/format-only refinement. Per the owner's request to reduce testing, they were not repeated; final captures, crop dimensions, source/ZIP integrity and type/format checks cover the remaining edits. No new application behavior was added."),
    151: ("No", "No shared state, global registration or runtime catalog-size assumption was introduced. Eighteen tools is an intentional editorial snapshot of release 0.0.3, labeled as such."),
    161: ("No", "No unnecessary interactive state or effect algorithm was added; native disclosures remove the need for JavaScript. The genuine extension defect is disclosed rather than oversimplified away. This inverse answer is not an open defect."),
    162: ("No", "No Yes answer is based on expectation alone. Browser, source and archive evidence are identified; unsupported compatibility/listening claims remain explicitly unverified."),
    180: ("No", "Author review covered the new static page, project-owned assets, original-file preservation and actual packaged behavior. It is not the independent security/licensing/production approval required for a full extension release; that broader approval remains pending."),
    181: ("No", "No independent reviewer approved this increment. This record is explicitly an author self-review; the extension's production review-pending state is preserved. Further independent approval is not claimed."),
    185: ("No", "No additional website implementation or local testing is needed for this delivery after artifact/capture checks. External release review and a future authorized fix for the preserved extension defect are separate work."),
}
answers = []
for identifier, question in questions:
    number = int(identifier)
    answer = "Not Applicable" if number in na else "Yes"
    evidence = next(text for start, end, text in sections if start <= number <= end)
    if answer == "Not Applicable":
        evidence = "Not a new or modified effect: this increment is a static editorial website. " + evidence
    if number in overrides:
        answer, evidence = overrides[number]
    answers.append({"id": f"Y-{identifier}", "question": question, "answer": answer, "evidence": evidence})

files = [ROOT / "index.html", ROOT / "readme.md", ROOT / "docs" / "landing-005-implementation.md"]
files.extend(path for path in (ROOT / "assets" / "landing").rglob("*") if path.is_file())
record = {
    "featureId": "005",
    "revision": "00",
    "specification": ".specs/suggestions005-00-change-request-editorial-landing-page.md",
    "scope": "Static landing page and download packaging; no extension behavior changes",
    "coverage": len(answers),
    "answers": dict(Counter(item["answer"] for item in answers)),
    "implementationComplete": True,
    "authorVerificationComplete": True,
    "independentApproval": False,
    "productionExtensionAccepted": False,
    "reviewer": "Implementation author self-review; no independent approval claimed",
    "finalDecision": "Website delivered and author-verified. Original extension release gates remain pending.",
    "openExternalGates": ["Branded/browser-OS compatibility", "Independent release review", "Existing v003 post-drag All tools click defect"],
    "userScopeAdjustment": "Owner requested reduced testing after the main browser checks; no expanded matrix or repeated native suite.",
    "reviewedFileSha256": {str(path.relative_to(ROOT).as_posix()): hashlib.sha256(path.read_bytes()).hexdigest() for path in files},
    "questions": answers,
}
(OUT / "acceptance.json").write_text(json.dumps(record, indent=2) + "\n", encoding="utf-8")
print("Acceptance:", record["coverage"], "questions;", record["answers"])
