"""Evidence-linked CR004 review records. Does not grant native/independent release approval."""
from pathlib import Path
from zipfile import ZipFile
import json,re,hashlib
root=Path(__file__).resolve().parent.parent
out=root/'evidence/004';out.mkdir(parents=True,exist_ok=True)
spec=root/'.specs/suggestions004-00-change-request-audio-effects-and-rotating-action-dial.md'
questions={int(m.group(1)):m.group(2).strip() for m in re.finditer(r'\*\*L-(\d{3})\.\*\*\s*(.*?)(?=\n\n|\Z)',spec.read_text(),re.S)}
assert list(questions)==list(range(1,89))
answers={}
def a(n,status,text):answers[n]=(status,text)
a(1,'Partial','Fixed CSS dimensions and unchanged button nodes are component-tested. Actual browser rectangle measurements are authored but blocked by Chromium socket restrictions.')
a(2,'Yes','Switch, End effect and Put away remain in the same grid tracks. Native disabled semantics replace conditional visibility; runtime regression tests cover idle, execution, completion and reuse.')
a(3,'Yes','Permanent status and Use tool controls were removed. Errors use a separate toast; toolbar content is icon, name and exactly three controls.')
a(4,'Yes','Global Tab/Enter page targeting and capture focus were removed. Runtime tests assert native Tab, Enter, Space and keyboard-generated clicks are not intercepted.')
a(5,'Yes','End effect clears invocation resources while retaining equipment; Put away removes equipment and its UI. Non-element tools restart by reselecting; integration tests cover both operations.')
a(6,'Partial','Fixed responsive tracks and accessible ellipsis handle long names. Native small-viewport and browser-zoom geometry still require the blocked browser suite.')
a(7,'Yes','All eight original and ten new effects have validated, distinct local audio.json profiles. Material-specific impacts, fracture, fuse detonation, twang, switch and motion cues use the shared service.')
a(8,'Partial','Three construction alternatives each for Punch, Shatter, Text Bomb and ticks are documented, and sound-source terms were researched. Listening comparison remains unavailable.')
a(9,'Unverified','Designed low-body impact, brittle partials and layered detonation are implemented. No real output or listening evidence establishes satisfying timbre.')
a(10,'No','Repeated playback controls and tests are supplied, but this environment cannot establish subjective repeated-use comfort. No listening pass is claimed.')
a(11,'Yes','Flashlight, Snowfall and Matrix Rain use short activation cues rather than loops; master volume starts at20%, fragment levels are restrained and tick events are capped at12.5Hz.')
a(12,'Partial','Punch impact uses the keyframe offset, bomb audio fires with detonation, wrecking contact is scheduled at480ms, and Gravity sounds actual collisions. Native audiovisual latency remains unmeasured.')
a(13,'Yes','Audio tests establish one lazy context, one cached noise buffer, fresh sources, at most eight voices, bounded envelopes and scope cancellation. No sample decode or per-effect engine exists.')
a(14,'Yes','Persistent mute, volume and separate effect/dial toggles are connected to the content service. Master gain affects current playback; mute cancels future/current sources. Integration and audio-node tests pass.')
a(15,'Yes','Owned sources stop on End effect/replacement/Put away, including scheduled-before-start and suspended sources. Recovery/disposal tests detect retained voices and scopes.')
a(16,'Partial','Trusted own-UI or deliberate page-pointer interactions unlock/resume the lazy context. Unavailable audio leaves visuals functional. Real content-script autoplay policy still needs native verification.')
a(17,'Yes','All shipped profiles are original synthesis with no external sound samples or runtime libraries. External source terms and the decision not to redistribute samples are documented.')
a(18,'Partial','Profiles share conservative envelopes, controlled transients and a tactile palette. Audible coherence needs listening review; it is not inferred from parameter similarity.')
a(19,'Yes','research/004-candidates.json records20 candidates, source leads, behavior, distinctiveness, feasibility and ten selected/ten deferred decisions.')
a(20,'Partial','Related collections and modern browser techniques were compared. Complete historical forks, exact source revisions and unavailable DevBubba pages remain research gaps.')
a(21,'Partial','Each selected effect has a distinct playful interaction plan and observable behavior tests. Entertainment value has not been independently observed in native motion.')
a(22,'Yes','Dust surface tiles differ from word explosion and glass shards; multi-card dance differs from localized Rubber; depth, paint and environmental fields add different interactions. Redundant Jiggle/Funky Focus/Reflective Fracture remain deferred.')
a(23,'Yes','Every new folder contains plan.md, metadata, original icon/audio, attribution, lifecycle code and contract tests. Plans predate the modules in this workstream.')
a(24,'Partial','Known authors, URLs and concept relationships are retained; unavailable sources and unknown revisions/licenses are explicit. No original code/assets are copied, but full upstream audit is not claimed.')
a(25,'Yes','No original third-party script was downloaded or executed. Only trusted project code ran in tests; research remained documentation-based.')
a(26,'Yes','Ten new independently loadable modules integrate through generated metadata and common SDK. Core runtime, inventory, dial and audio contain no effect-ID execution switch.')
a(27,'Yes','Resources, bounded snapshots, geometry, common invocation ownership and shared audio remove repeated infrastructure. Feature-specific choreography stays local. Glitch strips were cropped to reduce buffer duplication.')
a(28,'No','Per-effect code and behavior were reviewed, but native rendered animation was not available. All effects remain review-pending and the release build enforces that gate.')
a(29,'Partial','atan2 angular dragging tracks clockwise/counterclockwise gestures in DOM tests. Perceived smoothness and physical feel remain native acceptance work.')
a(30,'Yes','Modular indexing wraps the entire registry in both directions without a final page. Tests traverse18,50 and100 entries through multiple complete turns.')
a(31,'Yes','Pure-model and packaged-runtime tests verify full registry coverage, reverse equivalence, bounded normalization and correct tool identity after multi-turn dragging.')
a(32,'Partial','Fine-step tests establish that each identity change happens while both old/new slot states are covered. Visible mask continuity and raster artifacts still require native motion inspection.')
a(33,'Partial','Direct transforms and140ms settlement replace free inertia. Reduced motion settles immediately. The chosen model prioritizes precision; actual frame responsiveness is unmeasured.')
a(34,'Yes','A6px threshold separates click and drag; release-generated pointer clicks are suppressed. Keyboard activation remains usable after dragging. Regression tests pass.')
a(35,'Partial','Counter-rotation keeps labels upright and two-line bounds prevent overflow; full accessible names remain. Native readability/clipping at zoom requires browser review.')
a(36,'Yes','At most nine physical buttons render for18,50 or100 tools. Metadata browsing loads no implementation module; runtime tests assert an empty loaded-module list after traversal.')
a(37,'Yes','Arrow keys browse the logical catalog and focus its visible selection. Enter activates native buttons; Tab/focus trapping supports center and dialog controls.')
a(38,'Partial','Every tool can be discovered without a separate list; catalog search remains direct. A genuine usability/enjoyment improvement needs user observation.')
a(39,'Partial','The selected static concept uses a mounted retaining hood, arm and fasteners. Functional SVG mirrors that direction, but native visual depth is not verified.')
a(40,'Partial','Three rendered SVG/PNG prototypes were inspected for material, highlights and cover size. Actual browser composition/shadows remain unverified.')
a(41,'Yes','The stationary cover/mask are outside the rotor. Both use the same NW48-degree footprint; source and DOM tests verify moving content and fixed layers.')
a(42,'Partial','Both directions and very small angular steps are tested for concealed identity changes. No final browser recording proves the perceived transition.')
a(43,'Yes','A48-degree region covers one slot plus safety margin, leaving about eight choices visible. A narrow line could not fully conceal an upright icon/label replacement.')
a(44,'Yes','Light metal, brass instrument and stylized mechanical prototypes were compared. Light metal preserves the requested lightweight glass direction; rationale is retained.')
a(45,'Partial','SVG viewBox geometry and percentage masks scale with the dial. Browser zoom, pixel alignment and small-viewport appearance remain unverified.')
a(46,'Partial','A short noise/triangle detent cue plays at rotation boundaries. Its pleasantness has not been established by listening.')
a(47,'Yes','Ticks are emitted only when the rounded angular detent changes, never on stationary pointer events or initial opening. Audio tests enforce throttle behavior.')
a(48,'Partial','An80ms minimum interval coalesces rapid rotation to12.5 ticks/second. Slow versus fast perceived comfort still needs listening.')
a(49,'Partial','Mechanical, metallic and soft interface alternatives are documented. The restrained construction is selected provisionally; no repeated-rotation listening pass is claimed.')
a(50,'Partial','Tick layers are16/25ms at low gain with separate navigation mute. Further comfort adjustment should follow real listening rather than an unsupported claim.')
a(51,'Yes','Ticks have finite envelopes and stop after boundaries cease; menu disposal cancels its owner. No continuous dial oscillator or interaction loop remains.')
a(52,'Yes','MiddleHold is imported and configured by the production Runtime. Catalog preferences enable the real listener/progress/dial path; packaged-runtime tests exercise it.')
a(53,'Yes','An elapsed-time circular ring appears at pointer+38px during a stationary1800ms middle hold. No modifier or circular movement is required.')
a(54,'Yes','Tests cancel at beginning, middle and near completion, plus movement, held-button loss, blur, hidden document and pointer cancellation; rings/frames are removed.')
a(55,'Yes','Reaching1800ms removes progress and invokes the same dial directly. Production integration tests verify the complete setting-to-dial path before release.')
a(56,'No','Protected link/control events and primary-only targeting are tested in the emulator, but actual Chrome/Edge native autoscroll/paste/new-tab behavior could not run.')
a(57,'Yes','The default-off setting is connected to production preferences, explains its native-action tradeoff and immediately disables interception when turned off.')
a(58,'Partial','1800ms lies within the requested range; movement tolerance and early cancellation distinguish ordinary presses. Real-user timing preference has not been measured.')
a(59,'Yes','Listeners exist only after explicit activeTab injection. Manifest still grants only activeTab, scripting and storage; no persistent hosts are requested.')
a(60,'Yes','Exact native launch failure and unverified OS/browser behavior are documented. Actual assigned keyboard shortcut remains available as the alternative; no platform compatibility claim is invented.')
a(61,'Yes','Separate reviewers examined core/audio/dial/hold code. Findings corrected keyboard-after-drag, pending audio resurrection, suspended cleanup, BFCache disposal, stopped-effect restart, mute startup ordering and middle-link interception.')
a(62,'Yes','Audio playback, dial math, shared navigation profile, icons, focus, placement and resource ownership are centralized. Local effect choreography avoids unnecessary generic engines.')
a(63,'Yes','Strict TypeScript, Bun, generated registry, SDK lifecycle, isolated effects and no runtime dependencies are preserved. New metadata and interaction conventions are documented.')
a(64,'Yes','Removed old circle prototype/tool/test and its script, fixed-wheel rendering, Use tool, permanent HUD status, conditional control insertion and global Tab/Enter targeting.')
a(65,'Yes','One generated descriptor carries IDs, names, icon and audio metadata. Selection reads current logical identity, and build/tests reject duplicates and malformed profiles.')
a(66,'Yes','Native WAAPI, Canvas, SVG, Web Audio and project-owned TypeScript implement all runtime behavior. No runtime dependency was added.')
a(67,'Yes','Adding a validated feature folder/profile/icon makes it available to catalog/dial and lazy injection without edits to their central implementations.')
a(68,'Partial','Current scopes/lifetimes support varied duration, icons, long names and optional ongoing audio. Novel gameplay input beyond the existing SDK would still need an explicit design change.')
a(69,'Partial','The actual packaged-extension Playwright suite was attempted with installed tooling. Chromium failed before a page launched; no native assertions passed.')
a(70,'No','Native before/during/after screenshots and measured inventory geometry are absent. Emulator checks establish owned-style restoration and stable control nodes, not pixels.')
a(71,'Partial','Model/DOM tests exercise multi-turn reversal, real angular drag paths, cancellation, pointer ownership and closing during movement. Native viewport-edge motion remains unverified.')
a(72,'Yes','Each click resolves the current slot model ID. Tests traverse/recycle positions then select and assert the equipped identity, including keyboard selection after dragging.')
a(73,'Yes','Audio-node and packaged-runtime tests cover bounds, scheduled/current sources, mute/volume, stop/replacement, suspension, disposal and failed-graph recovery.')
a(74,'Partial','Component tests cover hidden tabs, route changes, BFCache, resize, target loss and unsupported inputs. Native refresh, permission-loss and tab-suspension matrices remain open.')
a(75,'Partial','Tests block primary host-control actions while preserving intended native middle links and keyboard clicks. No host events or persistent writes are synthesized. Earlier host-window handlers and native default routing remain outside proved coverage.')
a(76,'Yes','Native default-action, autoplay, zoom/focus, branded browser and OS differences remain acceptance gates. Source/component findings were corrected; release certification is withheld.')
a(77,'Yes','Final strict types, build, complete component suite and fresh blocked Playwright attempt were rerun after corrections; source hashes bind evidence to the final implementation.')
a(78,'Unverified','Fewer interruptions, stable controls and complete dial discovery are demonstrated technically. Enjoyment has not been observed in an actual first-use session.')
a(79,'Partial','Stable controls, original sound profiles and continuous discovery are implemented. Actual perceived stability, satisfaction and polish require native review.')
a(80,'Yes','Remaining uncertainty is native visual/motion quality, real sound comfort and cross-platform default actions. These are documented gates, not disconnected or placeholder controls.')
a(81,'Yes','Layered synthesis was compared with samples, angular recycling with paged menus, and controlled snap with momentum. Original synthesis avoids redistribution ambiguity; no unsupported quality superiority is claimed.')
a(82,'Yes','Useful shared work was done now: audio ownership, navigation profile reuse, DialModel, lifecycle fixes, primary-only input and cropped glitch buffers. Further abstractions lack demonstrated value.')
a(83,'Yes','Original colored icons and three separator treatments were inspected. No external audio samples require replacement. Any timbre/asset changes after native listening/visual review remain evidence-driven.')
a(84,'Partial','The shipped registry has18 tools, not20; tests additionally cover50/100 entries and repeated bounded use. Native prolonged responsiveness and pleasantness are not measured.')
a(85,'Yes','Three weakest areas are unverified native composition/motion, unlistened audio comfort, and OS/browser gesture/default-action compatibility. Test and audition tooling is ready, but process restrictions prevent honest completion here.')
a(86,'Partial','Replicate modular ownership, bounded slots, typed profiles and safety tests. Do not replicate missing native/listening/provenance evidence as a release standard.')
a(87,'Partial','Equipment, selection, audio and effects now share one continuous interaction model. The complete-toy perception still needs native/user review.')
a(88,'Partial','Search, recognizable icons, actual shortcut guidance, drag instructions and an opt-in hold setting expose the intended path. A first-time native usability session is unperformed, so immediate discoverability cannot be certified.')
assert set(answers)==set(questions)
records=[dict(id=f'L-{i:03d}',question=questions[i],answer=answers[i][0],evidence=answers[i][1]) for i in range(1,89)]
review=dict(changeRequest='004-00',applicationVersion='0.3.0',reviewDate='2026-11-14',finallyAccepted=False,decision='Functional development implementation delivered; native/audio/provenance acceptance pending',implementedEffects=18,newEffects=10,questions=records)
(out/'review.json').write_text(json.dumps(review,indent=2)+'\n')
(out/'answers.md').write_text('# Change request004 review answers\n\nThese answers distinguish implementation/component checks from native browser and listening evidence.\n\n| Question | Answer and evidence |\n| --- | --- |\n'+'\n'.join(f"| {r['id']} | **{r['answer']}**. {r['evidence']} |" for r in records)+'\n')
# Historical immutable input check and previous acceptance preservation.
archive=root.parent/'upload/2026-11-14-anger-relief-toy-v003(1).zip'
immutable={}
with ZipFile(archive) as z:
 prefix=next(n[:-len('AGENTS.md')] for n in z.namelist() if n.endswith('/AGENTS.md'))
 for info in z.infolist():
  if info.is_dir() or not info.filename.startswith(prefix):continue
  rel=info.filename[len(prefix):]
  if rel=='AGENTS.md' or rel.startswith('.specs/'):
   assert (root/rel).read_bytes()==z.read(info.filename),rel
   immutable[rel]=hashlib.sha256(z.read(info.filename)).hexdigest()
  if re.fullmatch(r'src/effects/[^/]+/acceptance.json',rel):
   history=out/'history'/rel;history.parent.mkdir(parents=True,exist_ok=True);history.write_bytes(z.read(info.filename))
  if rel=='evidence/003/browser-result.json':
   (root/rel).write_bytes(z.read(info.filename))
(out/'immutable-inputs.json').write_text(json.dumps(dict(allSuppliedSpecificationsAndAssetsUnchanged=True,sha256=immutable),indent=2)+'\n')
# Answer every Y question explicitly. Final native acceptance is never inferred from compilation.
ytext=(root/'.specs/suggestions001-02-answer-questions-after-each-feature-implementation.md').read_text()
yq={int(m.group(1)):m.group(2).strip() for m in re.finditer(r'\*\*Y-(\d{3})\.\*\*\s*(.*?)(?=\n\n|\Z)',ytext,re.S)}
assert len(yq)==187
ya={}
def ys(ids,answer,evidence):
 for i in ids:ya[i]=(answer,evidence)
def rg(a,b):return range(a,b+1)
ys(rg(1,7),'Yes','All187 questions are recorded explicitly with source/test evidence, native limitations and open gates. Meaningful code findings were corrected and retested. No release approval is inferred.')
ys(rg(8,11),'No','research/004-candidates.json and the feature plan/attribution document behavior-source leads and alternatives. Exact upstream source, forks, revisions and complete audits remain incomplete; no third-party expression was incorporated.')
ys([12,13,17,18],'Yes','Native Canvas, WAAPI, SVG/CSS and Web Audio alternatives were considered in plan.md and interaction-004.md. Source review refined timing, bounded allocations, gesture defaults and cropped visual buffers. This does not prove rendered quality.')
ys([14,16],'No','Distinctiveness and intended motion are documented, but native visual/entertainment comparison cannot run. Feature status remains review-pending.')
ys([15],'Yes','Ten selected interactions differ in target, scope or choreography; redundant candidates were deferred. Each plan explains distinctiveness; tests verify its individual behavior and allocations.')
ys([19,20,26,28,30],'Yes','Only reviewed project-owned implementation code and original assets are included. No original third-party script was downloaded/executed. ActiveTab isolated top-frame injection and fixed metadata IDs remain; no host permission expansion or runtime network code is added.')
ys(rg(21,24),'Not Applicable','No original-source dynamic execution was attempted. An approved isolated disposable environment is mandatory before any future execution; Happy DOM/ordinary Playwright are not that research sandbox.')
ys([25,32,37],'No','Complete original executable/dependency/revision/licensing audits are unavailable. Known URLs/authors/licenses and unknowns are explicit, and no original source/assets are copied. Native release remains gated pending deeper provenance/rights review.')
ys([27],'Not Applicable','No third-party runtime dependency was introduced. Native APIs and project-owned code implement visual/audio behavior; development dependencies remain pinned separately.')
ys([29,87,126,127,131,133,134],'No','Native host default actions, exact packaged browser behavior, visuals and branded Chrome/Edge compatibility are not established. Component tests use actual bundled project code; Playwright startup is blocked before pages launch.')
ys([31,33,34,35,36],'Yes','Feature-local attribution comments/attribution.md and generated central credits preserve known sources and explicit unknowns. Icons, sound profiles and implementation are independently authored; no copied audio/art/code licenses are assumed.')
ys([38,39,40,41,43,44,46,47],'No','Native motion, fidelity, geometry, perceived polish, content interaction and entertainment were not observed. Static prototypes, source inspection and emulator assertions cannot establish those claims. See evidence/004/browser-result.json.')
ys([42,45],'Yes','Each plan includes deliberate visual details and one common equipment/menu/invocation model. Shared icon/profile metadata drives all surfaces, with original colors and lightweight glass. Perceived quality remains a native gate.')
ys(rg(48,57),'Yes','Each independent folder owns entry, metadata, audio profile, icon, attribution, plan/tests and acceptance. SDK dependencies are injected; generated registry discovery replaces manual IDs. Core has no feature-ID execution switch. Shared audio metadata is the requested cross-cutting interface, not a feature exception.')
ys(rg(58,68),'Yes','Review extracted common audio ownership, DialModel and navigation profiles while keeping choreography local. Obsolete fixed-wheel/keyboard/circle-prototype/HUD code was removed. Strict types, native APIs, bounded resources, shared cleanup and documented interactions preserve maintainability.')
ys([69],'No','Final types/build/component checks pass after refactoring, but native visual regression inspection is blocked. No source-only result substitutes for pixels or motion.')
ys(rg(70,78),'Yes','Per-effect behavior tests and packaged-runtime tests cover repeated start, stop/dispose, cancellation, target removal, restoration, replacement and failure. Resource scopes/epochs/AbortSignal prevent late work; invocation completion retains equipment and leaves no owned execution work.')
ys([79,85],'No','Geometry/lifecycle cases are component-tested, but native refresh, CSS motion, browser zoom, high-DPI and real dynamic-page compatibility remain open.')
ys([80,81,82,83,84,86,88,89,90],'Yes','Invalid targets/options are bounded/validated before use. Protected form/editable/embedded content is excluded, snapshots draw local background/text only, and cleanup owns only temporary styles. Continuous modes are explicitly user-controlled; Put away/navigation end equipment, failures end safely.')
ys([91,92,94,96,98,101,102],'No','Real-browser frame, heap, CPU and worst-case rendering budgets are not measured. Bounds and source-level estimates limit risk but do not establish hardware performance acceptance.')
ys([93,95,97,99,100],'Yes','Idle equipment is event-driven with no recurring render loop or DOM scan. Active particles/canvases/voices/slots have explicit bounds; modules stay lazy. Build sizes are measured. Completed execution releases resources; only fixed authorized lifecycle/hold listeners remain intentionally.')
ys(rg(103,110),'Yes','Diagnostics are centralized,100-record bounded, versioned and sanitized. Tests exclude page contents, URLs, selectors and raw exception text. No telemetry/network is added; optional storage/report failure cannot block cleanup.')
ys(rg(111,115),'Yes','Generated metadata connects every tool to search, categories, favorites/recent, complete dial and shared icons. Equipment is persistent, End effect and Put away differ, and Escape dismisses the topmost menu. Loading/failure feedback uses non-displacing controls/toasts.')
ys([116],'Yes','Extension menus/buttons, dial arrows/focus and catalog drag handle remain keyboard-accessible. CR004 explicitly removes global webpage Tab/Enter target interception; arbitrary element targeting is deliberate pointer input.')
ys([117,118,119],'Yes','Reduced-motion options are honored and intense work is bounded; stop/Put away stays available. Existing shared strength/restore controls are retained. Continuous modes avoid generic timeouts and use explicit termination.')
ys([120],'Yes','Original per-tool icons/descriptions and synthetic browser fixtures provide discoverability. No extra preview control was added; the supplied audition surface is development-only and does not replace actual animation review.')
ys([121,122],'No','Shadow isolation and responsive source are implemented, but actual conflicting CSS/viewport composition and intuitive entertainment have not been verified in native browser motion.')
ys([123,124,125,129],'Yes','Feature-local behavior tests verify scope, bounds, allocations, draw/animation output, reduced motion, cancellation and restoration. Shared tests cover malformed options, detached targets, failures and repeated packaged-runtime use.')
ys([128,130,132],'No','Seeded randomness and virtual-time resource tests improve determinism, but native visual baselines, refresh/interruption and heap/leak profiling are incomplete. Authored browser tests remain blocked.')
ys([135,136,137],'Yes','Final meaningful component suite, strict types/build and native launch attempt are rerun. Removed tests covered a behavior explicitly superseded by CR004; replacements assert native keys, middle links, fixed controls and full dial identity instead of hiding regressions.')
ys([138],'Not Applicable','The supplied archive is an unversioned shared workspace, not a git checkout. Delegation used explicitly disjoint owned paths and shared-interface coordination; no fictional branch/worktree is claimed.')
ys(rg(139,153),'Yes','Feature ownership, generated registry, compatible optional audio SDK and full-suite checks support independent integration. Plans, provenance, review/acceptance records and interaction docs describe changed shared responsibilities, IDs, lifetimes and extension paths without undocumented private coupling.')
ys([154,155,156,157],'No','Native perceived value, visual fidelity, hardware overhead and platform assumptions remain the weakest evidence. Release approval is withheld; exact socket blocker and required listening/browser review are documented.')
ys([158,159,160,161,162,163],'Yes','Alternatives and failure cases were critically reviewed. Findings fixed target middle-click swallowing, audio cancellation, startup mute, BFCache and stopped-mode restoration, pointer ownership and keyboard-after-drag. Component evidence supports bounded architecture, not unmeasured visual/performance claims.')
ys([164],'No','Do not approve a production merge yet. Native visual/audio/default-action compatibility, historical provenance and full independent acceptance remain open; build:release rejects review-pending entries.')
ys(rg(165,170),'Yes','Open issues are explicitly classified in review.json/verification.md: source rights/revision completeness, native visual/layout/gesture/audio and hardware evidence. Smallest actions are run the authored native suite/audition on a capable machine and complete independent provenance review. Code-testable deficiencies were corrected now.')
ys(rg(171,173),'Yes','Not Applicable is limited to absent third-party runtime dependencies, original-source dynamic execution and unavailable git branch context. Any later source reuse/runtime engine or dynamic research makes those controls mandatory.')
ys(rg(174,177),'Yes','Source snapshot, immutable-input hashes, actual build sizes, individual tests, code-review findings and precise failed native launch establish evidence. Native/subjective claims are marked No rather than supported by confidence or static mockups.')
ys([178,180,181,182,184,187],'No','Final native visual/audio/performance and complete provenance/independent approval are not established. Independent code review found and corrected issues, but is not a complete final acceptance. Replicate modular ownership, not incomplete release evidence. Development implementation is delivered, production certification remains pending.')
ys([179,183,185,186],'Yes','Worthwhile corrective/refactoring work was completed and retested. Full records/source/tests/research are packaged. Remaining evidence gates and rejected production acceptance are justified explicitly, with executable follow-up browser/audition tooling rather than placeholder product controls.')
assert set(ya)==set(yq),(set(yq)-set(ya))
features=[]
for directory in sorted((root/'src/effects').iterdir()):
 if not directory.is_dir():continue
 meta=json.loads((directory/'effect.json').read_text())
 local=dict(ya)
 if meta['source']['relationship']=='original':
  for i in [8,9,10,11,25,32,37]:local[i]=('Not Applicable','This feature is an original supplied project concept rather than an adaptation of an external executable. Original project specification and new local implementation are retained; no upstream source version or license is invented.')
 rows=[dict(id=f'Y-{i:03d}',question=yq[i],answer=local[i][0],evidence=local[i][1]) for i in range(1,188)]
 digest=hashlib.sha256((directory/'index.ts').read_bytes()).hexdigest()
 record=dict(featureId=meta['id'],version=meta['version'],implementationSha256=digest,changeRequest='004-00',reviewDate='2026-11-14',coverage=187,answers={v:sum(x['answer']==v for x in rows) for v in ['Yes','No','Not Applicable']},productionAccepted=False,mandatoryRequirementsSatisfied=False,reviewer='Feature author plus separate source/component reviewers; complete independent native/rights acceptance unavailable',finalDecision='Implemented for development review; final production acceptance pending',questions=rows)
 (directory/'acceptance.json').write_text(json.dumps(record,indent=2)+'\n');features.append(meta['id'])
framework=[dict(id=f'Y-{i:03d}',question=yq[i],answer=ya[i][0],evidence=ya[i][1]) for i in range(1,188)]
(out/'acceptance-y.json').write_text(json.dumps(dict(featureId='004-shared-interaction-audio-dial-hold',coverage=187,productionAccepted=False,questions=framework),indent=2)+'\n')
(root/'docs/acceptance-index.md').write_text('# Acceptance records, increment004\n\nImplementation and component checks are complete; native visual, listening, platform and provenance gates remain open. No final production acceptance is assigned. Historical003 records are preserved.\n\n[All88 change-request answers](../evidence/004/answers.md) and [structured review](../evidence/004/review.json). [Shared framework Y187 review](../evidence/004/acceptance-y.json). Each of the18 src/effects folders contains acceptance.json with all187 questions, explicit answers and evidence. Ten new folders also contain implementation plans, original audio/icon assets, attribution and individual behavior tests.\n')
print(json.dumps(dict(reviewQuestions=len(records),featureRecords=len(features),questionsPerFeature=187,immutableFiles=len(immutable))))
for feature,files in {
 'inventory-controls':['src/runtime/content.ts','src/ui/style.css','tests/runtime.test.ts'],
 'shared-web-audio':['src/audio/service.ts','src/sdk/audio-types.ts','tests/audio.test.ts','tools/audition/main.ts'],
 'rotating-action-dial':['src/ui/wheel.ts','src/ui/dial-model.ts','src/ui/dial-audio.ts','tests/dial.test.ts'],
 'middle-mouse-hold':['src/runtime/middle-hold.ts','src/runtime/content.ts','tests/middle-hold.test.ts','tests/runtime.test.ts']
}.items():
 local=dict(ya)
 for i in [8,9,10,11,15,25,32,37,48,49,52,111,112,141,153]:
  local[i]=('Not Applicable','This is a shared framework/UI/service component explicitly requested by CR004, not an independently registered historical bookmarklet effect. Its original source is the preserved user change request, its code/assets are project-owned, and its integration uses the documented Runtime/UI/service interfaces rather than EffectModule metadata. Related browser API and source research is recorded separately.')
 rows=[dict(id=f'Y-{i:03d}',question=yq[i],answer=local[i][0],evidence=local[i][1]) for i in range(1,188)]
 (out/f'acceptance-{feature}.json').write_text(json.dumps(dict(featureId=feature,version='0.3.0',coverage=187,implementationFiles=files,productionAccepted=False,mandatoryRequirementsSatisfied=False,questions=rows),indent=2)+'\n')
