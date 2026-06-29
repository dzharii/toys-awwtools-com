---

A00 Icon Redesign Design Note

---

This note defines the icon redesign pass for the Windows 3.11 URI Launcher. The goal is to replace the current repeated placeholder icons with a complete, explicit, item-level SVG icon system.

The current application already proves the desktop metaphor. The problem is semantic clarity. Too many launchers collapse into the same icon family, so the user has to read the label to know what will open. That weakens both usability and the retro illusion.

The redesign goal is simple: every launcher should have an icon that is recognizable at 32x32, consistent with the Windows 3.11 look, and distinct from nearby launchers in the same window.

---

B00 What Is Working and What Is Not

---

The current desktop-level group icons are directionally good. They already communicate broad groups better than the inner launcher icons do. The stronger ones are the desktop icons for Windows Apps, Store, System and Security, Capture, All URI Links, Help Topics, and the better object-based item icons such as Calculator, Clock, Camera, Paint, Weather, Photos, and Shield.

The weak areas are the repeated generic families.

The solid blue square icon is too generic and is being used for too many unrelated app launchers.

The gear icon is overused across both Settings and system-management links. It destroys differentiation.

The scissors icon is reused across every Snipping Tool and capture experience, so the user cannot distinguish rectangle snip from recording or from a callback-based capture flow.

The lock icon is reused across almost every privacy page. That makes the whole Privacy group visually flat.

The accessibility stick-figure icon is reused for every accessibility link. It needs sub-meanings.

The envelope icon is reused for Messaging, Mail, Calendar, Teams, To Do, and Click to Do. Those are different experiences and should not look identical.

The network icon is reused for Wi-Fi, VPN, printers, touchpad, USB, typing, AutoPlay, and mobile devices. Those need separate metaphors.

The paint-palette icon is reused across all Personalization entries. That group needs more nuance.

The gamepad icon is reused across Game Bar, Xbox App, Xbox Network, captures, and Solitaire. Those need separation.

The legacy document icon is reused across multiple unrelated optional or historical experiences. That category should still feel differentiated even if it is framed as optional or older.

---

C00 Non-Negotiable Icon Rules

---

All icons must stay inside the same retro visual language.

Every icon must be an inline SVG.

Every icon must be designed for 32x32 first. A 16x16 simplification pass can be done later.

Every icon must use crisp, hard-edged geometry. No blur, no gradients, no soft shadows, no anti-aliased painting style.

Every icon must use a 16-color-style palette. It does not have to be literally 16 colors, but it must feel like it belongs to that era.

Every icon must use the same light direction, same black outline logic, and same frame logic.

The visual identity should feel like a Windows 3.x icon set, not like Fluent icons or emoji.

Every icon must communicate a noun first. If needed, it may communicate an action through a small overlay or modifier.

Text inside icons should be avoided except for extremely tiny symbolic marks such as a clock hand, play triangle, plus sign, or check.

The icon should still be understandable if the user sees it for a moment without reading the label.

Do not rely on the status badge color as the primary meaning of the icon.

---

D00 Core Visual Grammar

---

Use a shared 32x32 frame system.

The outer silhouette should usually sit inside a 26x28 framed tile, matching the current retro feel.

The object should occupy the center 18x18 to 22x22 area.

The border and object edges should stay crisp and slightly heavy.

Use a small set of reusable primitives. This is critical because there are too many launchers to draw each one from scratch without a system.

Required primitives:

window frame

document sheet

folder

gear

magnifier

arrow

link badge

home

pencil

brush

play triangle

camera lens

globe

cloud

shield

padlock

key

bell

printer

phone handset

monitor

keyboard

mouse

touch finger

head-and-shoulders user

clock

sun

moon

speaker

microphone

music note

film strip

map pin

road arrow

gamepad

palette

font glyph

network node

Wi-Fi arcs

Bluetooth rune

USB trident

battery

plug

eye

caption box

crosshair

scissors

record dot

chat bubble

calendar page

check mark

warning triangle

Use overlays to create variants without making the icons repetitive.

Allowed overlay patterns:

small gear overlay for settings or advanced options

small magnifier overlay for search or lookup

small pencil overlay for compose or edit

small eye overlay for viewer or inspect

small arrow overlay for route, direct open, or launch-to-target

small link badge for alias routes

small clock badge for history, schedule, delayed behavior, or time-based variants

small lock badge for permission/privacy variants

small warning triangle for legacy, deprecated, or mixed-reality/optional components

small plus badge for add or enroll actions

small home badge for home or root pages

This overlay system is important because it lets the agent make icons unique while keeping the set coherent.

---

E00 Engineering Implementation Rules

---

The coding agent should stop using broad shared `iconKey` values such as `app`, `gear`, `lock`, `network`, `paint2`, `game`, `mail`, and `legacy` for many unrelated items.

The new target is one icon key per launcher item, with a composition system under the hood.

The best approach is this:

In `links.js`, set `iconKey` to a specific semantic key for each item. The easiest convention is to make `iconKey` match the launcher `id`.

In `icons.js`, build a small icon composition library. Do not hard-code 353 unrelated SVG strings by hand if a compositional approach can generate them reliably.

Use reusable helper functions such as `tile()`, `doc()`, `windowGlyph()`, `badgeSE()`, `badgeNE()`, `overlayWarning()`, and `overlayLink()`.

For alias entries, use the primary icon plus a small link badge.

For route or direct variants, use the primary icon plus an arrow badge.

For viewer, search, picker, settings, or compose variants, use the primary subject plus the appropriate modifier.

Fallback to a generic icon should be rare. It should be treated as a bug, not as normal behavior.

Acceptance rule: no two sibling launchers in the same window should share an identical icon unless they are true aliases and the only difference is a route badge or alias badge.

---

F00 Delivery Plan for the Coding Agent

---

Phase 1 should cover desktop group icons, Settings subgroup icons, and the Windows Apps, Capture, Store, Accessibility, and Personalization windows. Those are most visible and will improve the demo fastest.

Phase 2 should cover System and Security, Network and Devices, Privacy and Permissions, and Gaming and Xbox.

Phase 3 should cover Legacy and Optional plus all remaining variant, alias, and route-specific icons.

Phase 4 should do visual QA. The agent should open every group window and look for remaining collisions, unclear metaphors, or icons that are too similar at real size.

---

G00 Desktop Group Icon Specifications

---

Windows Apps: keep the four-tile launcher metaphor, but clean the proportions and make the four tiles feel like a mini program group instead of random squares.

Settings Groups: replace the plain gear block with a control-panel window containing a centered gear and one small toggle. It should look like a control center, not just a single gear.

Capture and Screenshots: keep scissors, but add a dotted selection rectangle in the background so it clearly reads as screen capture, not office scissors.

Microsoft Store Links: keep the store bag, but make the bag cleaner and more symmetrical. It should read as a storefront, not a barn.

System and Security: keep the shield, but make the white check better centered and the shield shape slightly more official.

Network and Devices: replace the current two-block diagram with two small monitors connected by a cable or bus line.

Accessibility: replace the plain stick figure with a more balanced universal-access symbol. Keep it simple, but less crude.

Privacy and Permissions: keep the lock, but place it over a small document or settings sheet so it reads as permissions, not just security.

Personalization: keep the palette, but make the palette slightly more elegant and add a tiny brush or color swatch to distinguish it from Paint.

Gaming and Xbox: keep the gamepad, but make the controls more balanced and more readable.

Legacy and Optional: keep the warning-document concept, but make it look like an archival sheet with a warning triangle.

All URI Links: keep the list/index concept, but make it feel more like an index drawer or stacked list view.

Help Topics: keep the question mark, but place it on a help manual or help card rather than as a bare question mark.

---

H00 Settings Subgroup Icon Specifications

---

Accounts: user card with a small key.

Apps: small application window with two little tiles.

Devices: monitor and phone side by side.

Accessibility: universal-access symbol with a settings panel.

Network: monitor with Wi-Fi arcs.

Personalization: palette and brush.

Privacy: document with lock.

System: small monitor with gear.

Time and Language: clock plus small speech bubble or globe.

Update and Security: circular update arrows around a shield.

---

I00 Modifier Rules for Variants

---

Alias variant: same primary icon plus small linked-squares badge in lower-right.

Route variant: same primary icon plus small arrow badge in lower-right.

Compose variant: same primary icon plus pencil overlay.

Search variant: same primary icon plus magnifier overlay.

Settings variant: same subject plus small gear overlay.

Viewer variant: same subject plus eye overlay.

Picker variant: same subject plus dotted rectangle or cursor overlay.

History variant: same subject plus clock or small page overlay.

Advanced variant: same subject plus gear overlay.

Home or root variant: same subject plus tiny house overlay.

Deprecated or legacy variant: normal icon with tiny amber warning triangle overlay, not a completely different generic warning icon.

---

J00 Windows Apps Icon Task List

---

Settings Home: control-panel window with a small home badge and gear.

Microsoft Edge: refine current globe-browser icon; use a browser-window edge frame plus globe.

Edge to URL: Edge icon plus arrow badge pointing outward to a small page.

App Installer: open package box with downward arrow into tray.

Photos: landscape photo tile with sun and hills; refine current version.

Photos Viewer: Photos icon plus eye badge.

Photos Video Trim: photo or film frame plus scissors or trim mark.

Messaging: chat bubble with small envelope fold or two-message stack.

Messaging Compose: Messaging icon plus pencil overlay.

People: contact card with person silhouette.

People Settings: People icon plus gear badge.

People Search: People icon plus magnifier badge.

People Contact View: People icon plus eye badge.

Weather: sun behind cloud; refine current version.

Weather Forecast: weather cloud/sun plus small calendar strip.

Bing Weather: weather icon plus tiny magnifier or globe cue, since it is weather-as-service.

Calculator: refine current calculator.

Calculator Alias: calculator plus link badge.

Clock: refine current clock.

Camera: refine current camera.

Camera Picker: camera plus dotted selection frame.

Camera Multi Picker: camera plus two overlapping selection frames.

Paint: refine current brush/pencil icon.

Media Player / Groove: play triangle inside a media window with small note.

Microsoft Music: music note or equalizer bars.

Movies and TV: film frame plus play triangle.

Microsoft Video: video strip plus play triangle, more general than Movies and TV.

Mail: envelope.

Calendar: calendar page with one highlighted square.

New Outlook: envelope plus small window pane or inbox tray.

Phone Link: smartphone with small connector line to a desktop monitor.

Phone Link Route: Phone Link icon plus arrow badge.

Widgets: four small panels in a dashboard frame.

Widget Board: Widgets icon plus board/panel frame.

Windows Backup: storage box or disk with circular arrow.

Available Networks: Wi-Fi fan above small list or tray.

Action Center: notification panel with bell or stacked alerts.

Feedback Hub: speech bubble with smile/check or note sheet.

Get Help: help lifebuoy or manual with question mark.

Get Started / Tips: lightbulb or small help card with star.

Clipchamp: clapperboard or video edit ribbon.

Teams: chat bubble with two users.

Teams Alias: Teams icon plus link badge.

Microsoft To Do: checklist page with check mark.

Microsoft To Do Alias: To Do icon plus link badge.

Surface App: tablet/laptop hybrid device.

Surface App Alias: Surface icon plus link badge.

Quick Assist: two connected screens with small arrow.

Microsoft News: newspaper page or bulletin sheet.

Cast / Device Discovery: monitor with wireless cast waves.

Project Display: monitor projecting to a second screen.

Default Location: map pin.

Add Printer: printer plus plus badge.

Print Jobs: printer plus queued paper stack.

Input App: keyboard key cluster or text cursor.

Pen Workspace: stylus pen over small workspace panel.

Virtual Touchpad: touchpad rectangle with finger cue.

Task Switcher: two overlapping windows.

OOBE Network: setup monitor with globe or cable plug.

Cloud Experience Host: cloud over setup window.

Cloud Experience Host Full: cloud over full-screen window.

Device Enrollment: device plus key or plus badge.

Phone Link settings/deep link entry: Phone Link icon plus gear overlay.

Add phone: phone plus plus badge.

Add phone direct: phone plus plus badge and arrow overlay.

Device usage: monitor or device silhouette plus tiny bar chart.

---

K00 Microsoft Store Icon Task List

---

Microsoft Store: refine current bag icon.

Store Home: store bag plus home badge.

Store Downloads and Updates: store bag plus downward arrow and update arrows.

Store Library: store bag plus stacked books or shelf bars.

Store Settings: store bag plus gear badge.

Store Gaming: store bag plus gamepad badge.

Store Entertainment: store bag plus play triangle or film badge.

Store Productivity: store bag plus checklist or briefcase badge.

Store Line of Business: store bag plus office building or briefcase badge.

Store Search: store bag plus magnifier badge.

Store Browse Category: store bag plus folder/category tabs.

Store Publisher Search: store bag plus company building or nameplate badge.

Store Association by Tag: store bag plus tag shape.

Store Association by File Extension: store bag plus document corner badge labeled by shape, not text.

Store Association by Protocol: store bag plus link/chain badge.

Store Product Page: store bag plus single product box.

Store Product Page by PFN: product page icon plus warning triangle and link badge.

Store Product Page by AppId: product page icon plus warning triangle and small ID card cue.

Store Review: store bag plus star and pencil.

---

L00 Capture and Screenshots Icon Task List

---

Snipping Tool: scissors over dotted rectangle.

Snipping Tool Rectangle: scissors over solid rectangle frame.

Snipping Tool Window: scissors over small window frame.

Snipping Tool Freeform: scissors over lasso path.

Snipping Tool Delayed Rectangle: rectangle snip icon plus clock badge.

Snipping Tool Recording: recording frame plus red record dot.

Modern Image Capture Rectangle: capture rectangle icon plus app callback arrow overlay.

Modern Image Capture Window: capture-window icon plus app callback arrow overlay.

Modern Image Capture Freeform: freeform capture icon plus app callback arrow overlay.

Modern Video Capture: record frame with callback arrow overlay.

Snipping Tool Discovery: scissors plus magnifier or sparkle badge.

Screen Sketch: pen over captured image sheet.

Screen Sketch Edit: Screen Sketch icon plus pencil emphasis or edit overlay.

---

M00 System and Security Icon Task List

---

Windows Security: shield.

Defender Quick Scan: shield plus magnifier.

Defender Full Scan: shield plus full circular scan ring.

Defender History: shield plus clock or document stack.

Search: magnifier over taskbar/search bar.

Search MS: magnifier over small Windows logo or Microsoft pane.

Windows Search: magnifier over window frame.

Search Repair: magnifier plus wrench.

Parental Controls: family/users icon plus shield.

Control center: control panel window with sliders.

Search root/system settings entry: magnifier plus gear.

Search more details: magnifier plus document page.

Search permissions: magnifier plus lock.

Volume mixer: three vertical sliders with speaker.

Sound: speaker icon.

Sound devices: speaker plus small device chip or output jack.

Default microphone properties: microphone plus small gear.

Default output properties: speaker plus gear.

Audio endpoint properties: audio jack or speaker node plus gear.

Audio interface properties: audio interface box with knobs.

Activation: key or license card.

Delivery Optimization: circular arrows around a package.

Delivery Optimization activity: update arrows plus bar chart.

Delivery Optimization advanced: update arrows plus gear.

Find my device: device plus location pin.

For developers: hammer/wrench or code window.

Recovery: rescue lifebuoy or circular restore arrow.

Security key enrollment: hardware key plus shield.

Troubleshoot: wrench with warning triangle.

Windows Security settings: shield plus gear.

Windows Insider Program: flight ring or star/rocket over window.

Windows Insider opt-in: Insider icon plus check mark.

Windows Update: circular update arrows.

Windows Update action: update arrows plus small lightning/check.

Windows Update active hours: update arrows plus clock.

Windows Update advanced options: update arrows plus gear.

Windows Update optional updates: update arrows plus plus badge.

Windows Update restart options: update arrows plus power symbol.

Windows Update seeker on demand: update arrows plus magnifier.

Windows Update history: update arrows plus document/clock.

---

N00 Gaming and Xbox Icon Task List

---

Xbox Game Bar: gamepad over horizontal overlay bar.

Gaming Overlay: floating overlay window plus gamepad.

Game Bar Services: gamepad plus gear.

Xbox App: gamepad plus app window.

Xbox App Alias: Xbox App icon plus link badge.

Xbox Profile: gamepad plus user silhouette.

Xbox Friend Finder: gamepad plus magnifier and two users.

Xbox Network: gamepad plus network nodes.

Xbox Settings: gamepad plus gear.

Xbox Captures: gamepad plus record dot or photo frame.

Solitaire Collection: playing card pair.

Game Bar: overlay bar plus gamepad, slightly simpler than Xbox Game Bar if both remain.

Captures / Game DVR: record dot inside game frame.

Game Mode: speed/gauge plus gamepad.

Quiet moments during full-screen game: gamepad plus bell with mute slash.

TruePlay: shield or check plus gamepad.

---

O00 Settings Launcher Icon Task List

---

Access work or school: ID card or briefcase with small key.

Email and app accounts: envelope plus user card.

Family and other users: two user silhouettes.

Provisioning: document or device with gear.

Workplace provisioning: briefcase plus gear.

Repair token: key token or badge plus wrench.

Kiosk / Assigned access: monitor with lock.

Sign-in options: user card plus key/asterisk.

Dynamic Lock: lock plus phone or user.

Sync settings: two circular arrows around small gear.

Backup / Sync: storage box plus circular arrows.

Windows Anywhere: device or globe plus window badge.

Windows Hello face enrollment: face silhouette inside frame.

Windows Hello fingerprint enrollment: fingerprint inside frame.

Your info: user card.

Installed apps: small app grid.

App advanced options: app grid plus gear.

App advanced options by PFN: app grid plus gear and tiny link/document cue.

Apps for websites: app window plus globe.

Default apps: app grid plus check mark.

Default apps for registered machine app: app grid plus check mark and monitor badge.

Default apps for registered user app: app grid plus check mark and user badge.

Default apps by AUMID: app grid plus ID card/link badge.

Default browser settings: browser window plus check/gear.

Optional features: puzzle piece or module blocks.

Offline maps: folded map with down arrow.

Download maps: folded map with downward arrow.

Startup apps: app grid plus power/start arrow.

Video playback: film frame plus play triangle.

Family Group: two users inside group frame.

About this PC: monitor with info symbol.

Advanced display: monitor plus sliders.

Battery saver: battery with leaf or power-saving crescent.

Battery saver settings: battery plus gear.

Battery usage details: battery plus bar chart.

Clipboard: clipboard sheet.

Default save locations: storage box plus folder/path arrow.

Display: monitor.

Screen rotation: monitor with curved rotation arrow.

Presentation quiet moments: monitor/presentation frame plus bell mute.

Scheduled quiet moments: bell mute plus clock.

Device encryption: device or disk with lock.

Energy recommendations: battery or plug plus star/check.

Focus assist: moon or bell mute icon.

Graphics settings: monitor plus GPU chip or palette.

Default graphics settings: monitor plus gear and chip.

Multitasking: two overlapping windows.

Snap update settings: snapped windows plus gear.

Night light: monitor with moon and star.

Projecting to this PC: arrow from external display to monitor.

Shared experiences: two connected devices.

Tablet mode: tablet silhouette.

Notifications: bell or panel alerts.

Remote Desktop: two monitors with arrow.

Phone settings: phone plus gear.

Power and sleep: power symbol plus crescent moon.

Presence sensing: sensor waves toward person silhouette.

Storage: hard drive or storage box.

Storage Sense policies: storage icon plus gear.

Storage recommendations: storage icon plus star/check.

Disks and volumes: stacked disks.

Date and time: calendar plus clock.

Japanese IME: keyboard plus Japanese kana mark.

Region formatting: globe plus ruler/grid.

Language / keyboard: globe plus keyboard.

Advanced keyboard: keyboard plus gear.

Language and region: globe and small map pin.

Bopomofo IME: keyboard plus phonetic symbol cue.

Cangjie IME: keyboard plus character block cue.

Wubi user-defined phrases: keyboard plus note/document.

Quick IME: keyboard plus lightning bolt.

Korean IME: keyboard plus Hangul cue.

Microsoft Pinyin IME: keyboard plus Latin/phonetic cue.

Pinyin domain lexicon: keyboard plus book.

Pinyin key configuration: keyboard plus gear.

Pinyin user-defined phrases: keyboard plus note sheet.

Speech: microphone or speech bubble.

Microsoft Wubi IME: keyboard plus Wubi cue.

---

P00 Network and Devices Icon Task List

---

AutoPlay: disc or media tile with play arrow.

Bluetooth: Bluetooth rune with device outline.

Connected devices: two linked devices.

Camera settings: camera plus gear.

Camera settings by cameraId: camera plus gear and small ID badge.

Mouse and touchpad: mouse beside touchpad.

Pen and Windows Ink: stylus pen with squiggle.

Printers and scanners: printer with page.

Touch: hand/finger touching screen.

Touchpad: touchpad rectangle.

Touchpad alias: touchpad plus link badge.

Hardware keyboard text suggestions: keyboard plus text bubble.

Typing: keyboard with key highlight.

USB: USB trident.

Wheel / Surface Dial: dial knob.

Mobile devices: phone and small tablet.

Network status: monitor plus network signal bars.

Network root alias: network status plus link badge.

Advanced network settings: network nodes plus gear.

Airplane mode: airplane.

Proximity / NFC: contactless signal waves.

Cellular and SIM: phone with signal bars or SIM card.

Dial-up: phone handset plus line.

DirectAccess: network node plus arrow through gateway.

Ethernet: cable plug.

Manage known networks: Wi-Fi arcs plus list page.

Mobile hotspot: phone plus Wi-Fi broadcast.

Proxy: globe/network plus intermediary arrows.

VPN: globe or network plus key/lock tunnel.

Wi-Fi: Wi-Fi arcs.

Wi-Fi provisioning: Wi-Fi arcs plus gear.

Data usage: network bars plus bar chart.

---

Q00 Accessibility Icon Task List

---

Audio: speaker with sound waves.

Captions: subtitle box with text lines.

Color filters: overlapping color lenses or filter discs.

Adaptive color link: display with color-correction chip.

Blue light link: moon over display.

Display: monitor with large text.

Eye control: eye with pointer ray.

Hearing devices: ear or hearing-aid device.

High contrast: half black/half white square.

Keyboard: keyboard.

Magnifier: magnifying glass over page.

Mouse: mouse.

Mouse pointer and touch: cursor plus finger tap.

Narrator: speech bubble with page or speaker.

Narrator auto-start: Narrator icon plus power/start arrow.

Speech recognition: microphone plus waveform.

Text cursor: I-beam cursor on page.

Visual effects: sparkle/stars over display.

---

R00 Personalization Icon Task List

---

Background: picture frame or wallpaper image.

Start folders: folder with Start/menu badge.

Colors: color swatches.

Colors alias: Colors icon plus link badge.

Copilot key customization: keyboard key with sparkle or assistant star.

Dynamic Lighting: light bulb or LED strip with glow rays.

Fonts: stylized "A" and lowercase "a".

Glance: eye over small panel.

Lock screen: monitor or page with padlock.

Navigation bar: bar with arrows or UI navigation strip.

Personalization root: palette plus small home badge.

Start: Start/menu panel or window with selection.

Taskbar: long horizontal bar with small button blocks.

Text input: keyboard plus text cursor.

Touch keyboard: on-screen keyboard.

Themes: paint palette plus brush or layered wallpapers.

---

S00 Privacy and Permissions Icon Task List

---

Accessory apps: accessory/plug or device module plus lock.

Account info: user card plus lock.

Activity history: clock or document timeline plus lock.

Advertising ID: tag or ID badge plus lock.

App diagnostics: app window plus stethoscope/wrench plus lock.

Automatic file downloads: document with down arrow plus lock.

Background apps: app window behind another window plus lock.

Background spatial perception: sensor grid or room cube plus lock.

Calendar: calendar page plus lock.

Call history: phone handset plus clock.

Camera: camera plus lock.

Contacts: address book/person card plus lock.

Documents: document page plus lock.

Downloads folder: folder with down arrow plus lock.

Email: envelope plus lock.

Eye tracker: eye plus lock.

Feedback and diagnostics: note sheet or feedback bubble plus stethoscope/wrench plus lock.

File system: folder tree or drive plus lock.

General privacy: simple lock over document.

General privacy alias: general privacy icon plus link badge.

Programmatic graphics capture: monitor plus capture frame plus lock.

Borderless graphics capture: borderless window plus capture frame plus lock.

Inking and typing personalization: pen and keyboard plus lock.

Location: map pin plus lock.

Messaging: chat bubble plus lock.

Microphone: microphone plus lock.

Motion: motion lines or gyroscope cue plus lock.

Music Library: music note plus lock.

Notifications: bell plus lock.

Other devices: linked devices plus lock.

Phone calls: phone handset plus lock.

Pictures: photo frame plus lock.

Radios: antenna/signal waves plus lock.

Speech: microphone or speech bubble plus lock.

Tasks: checklist page plus lock.

Videos: film frame plus lock.

Voice activation: microphone plus power/wave cue and lock.

---

T00 Legacy and Optional Icon Task List

---

Click to Do: checklist or task card with cursor click badge.

Recall: timeline card with memory/photo strip and warning triangle.

Maps: folded map with location pin.

Maps Center Coordinates: map plus crosshair.

Maps Drive To: map plus car arrow.

Maps Walk To: map plus walking figure arrow.

Copilot: assistant sparkle or chat/star panel.

Mixed Reality First Run: headset plus star or setup badge.

Mixed Reality Camera: headset plus camera lens.

Mixed Reality Capture: headset plus record dot or capture frame.

3D Viewer: cube inside viewing frame.

3D Builder: cube plus pencil or tool.

Extras: toolbox or utility drawer.

Audio and speech: speaker plus microphone.

Environment privacy: room cube or sensor field plus lock.

Headset display: headset plus monitor/display.

Mixed Reality management: headset plus gear.

Startup and desktop: desktop window plus power/start arrow.

---

U00 Additional Cleanup Rules

---

The agent should also revise the icons that are currently only "okay" so the whole set feels like one family. That means Edge, Paint, Calculator, Camera, Photos, Weather, Mail, Shield, and Store should be retained conceptually but redrawn to the same pixel grammar, line weight, palette, and frame treatment as the new icons.

Desktop icons and in-window icons should use the same family language, but desktop icons may be slightly more emblematic and simpler.

Do not use exact modern brand logos. Use recognizable metaphors instead. For example, Edge should be a browser-globe metaphor, not the official Edge swirl. Outlook should be inbox-envelope, not the official Outlook logo. Xbox App can use a gamepad metaphor rather than a trademarked logo.

Do not overload the icons with status indicators. Status such as Official, Legacy, Template, or Deprecated should stay mostly in badges and details. Use warning overlays only where the launcher meaning itself depends on age or risk.

---

V00 Acceptance Criteria for the Icon Pass

---

The icon pass is complete only when these conditions are true.

There is no remaining broad fallback icon used for unrelated app launchers.

There is no single repeated gear icon across most Settings pages.

There is no single repeated lock icon across most Privacy pages.

There is no single repeated stick-figure icon across most Accessibility pages.

There is no single repeated network icon across Wi-Fi, Bluetooth, printers, USB, touchpad, and mobile devices.

There is no single repeated scissors icon across all capture experiences.

The user can visually distinguish at least the first 12 icons in any open window without reading every label.

Alias, search, compose, viewer, route, picker, and advanced-option variants have meaningful visual differences.

All icons remain readable at actual runtime size inside the current launcher windows.

No icon visually breaks the Windows 3.11 aesthetic.

No unresolved `iconKey` silently falls back to the generic default during normal browsing.

---

W00 Recommended Coding Tasks

---

Task 1: refactor `icons.js` into a primitive-and-composition icon library.

Task 2: replace group-level repeated keys in `links.js` with item-level semantic keys.

Task 3: implement all desktop group icons and Settings subgroup icons.

Task 4: implement Windows Apps item icons.

Task 5: implement Capture and Store item icons.

Task 6: implement Network, Accessibility, and Personalization item icons.

Task 7: implement System and Security, Privacy, Gaming, and Legacy item icons.

Task 8: run an icon QA pass by opening every group window and checking for collisions.

Task 9: add a development assertion that logs any unresolved `iconKey`.

Task 10: remove or retire the old generic families once all mapped icons exist.

---

X00 Final Direction

---

The right implementation strategy is not "draw 353 disconnected icons." The right strategy is "build one coherent retro icon language, then map every launcher to a unique semantic composition."

That gives the user what is missing right now: clarity, individuality, and a more convincing Windows 3.11 experience.
