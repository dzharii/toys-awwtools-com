---

AC01 Clippy Script Specification - Reduced and User-Useful Version

---

This replaces the previous Clippy script specification. The previous version covered too many tiny events. Some of those events were technically valid but not helpful to the user. For this product, Clippy should not narrate the interface. Clippy should only speak when the message helps the user understand something they may reasonably miss.

Clippy should speak when one of these conditions is true.

The user is seeing the app for the first time and needs orientation.

The user is about to launch an external Windows URI and may see a browser prompt.

The user is not on Windows and needs to understand why launch links may not work.

The user selected or launched something that is deprecated, template-based, hardware-dependent, install-dependent, policy-dependent, or otherwise likely to fail.

The user searched and either found too many results, no results, or used a term where a better shortcut exists.

The user is exploring a category where the difference between app links, Settings links, Store templates, privacy pages, or security surfaces matters.

The user repeats an action that suggests confusion.

The user asks for help.

Everything else should be silent or handled through the status bar. Routine events such as closing a window, changing focus, selecting any ordinary icon, clearing search, arranging windows, opening a second window, or copying a second ordinary URI do not need Clippy speech.

---

AD01 Clippy Personality

---

Clippy should be technically wise, concise, and professionally friendly. It should not be cute for its own sake. It should not use greetings. It should not over-explain. It should not say "success" after launch actions, because the browser cannot confirm that Windows actually opened the target app.

Clippy should sound like this:

"Double-click a group to open it. Launch links ask Windows to open real apps, Settings pages, or system surfaces."

"Snipping Tool opens interactively. This launcher cannot silently save a screenshot to a file."

"This URI needs values before it can launch. Open Details to fill the placeholders."

Clippy should not sound like this:

"Hi there! It looks like you are trying to launch something."

"Great job! The app opened successfully."

"Oops! That probably did not work."

"This is obvious, but..."

The tone is calm, short, and useful. The user should never feel that Clippy is interrupting them to state the obvious.

---

AE01 Global Assistant Rules

---

Clippy must be event-driven. UI modules should emit semantic events such as `category.opened`, `search.noResults`, `item.templateSelected`, `launch.requested`, or `copy.failed`. The assistant controller decides whether to speak.

Clippy must not speak directly from random click handlers. That makes the behavior noisy and hard to control.

Clippy must obey these limits.

Normal automatic tips must have at least 20 seconds between them.

No more than five automatic tips should appear in five minutes.

The same automatic tip should appear at most once per session.

Hover-based tips should appear only after stable hover for at least 900 ms.

No automatic tips should appear while the user is typing.

No unrelated automatic tips should appear while a modal dialog is open.

After the user launches a URI, suppress noncritical tips for 10 seconds.

After the user opens Help, suppress automatic tips for 60 seconds.

If the user hides Clippy, show no assistant UI for the rest of the session.

If the user mutes tips, keep Clippy visible but silent unless the user asks for Help.

Clippy must never auto-launch a URI. It may offer action buttons such as "Open Help", "Open Capture", "Copy URI", or "Focus Search", but the user must click them.

---

AF01 Messages That Should Be Removed From the Previous Script

---

Remove routine window-management chatter. The user does not need a tip every time a window is focused, closed, minimized, or dragged. A single first-time explanation is enough.

Remove routine selection chatter. Selecting a normal launcher item should update the status bar, not trigger Clippy.

Remove "search cleared" messages. They add no value.

Remove repeated category summaries. Clippy may explain a category the first time it opens, but it should not repeat that explanation every time.

Remove low-value badge explanations unless the badge represents a real limitation. "Official" does not need a speech bubble. "Deprecated", "Template", "Install dependent", "Hardware dependent", and "Policy dependent" may need one.

Remove generic "this item can be launched or copied." That is already visible from the UI.

Remove generic "window positions are temporary." This is not important enough for Clippy.

Remove "icon fallback was used." That is an implementation detail. If an icon is missing, the launcher should silently use a fallback icon.

Remove "Search cleared", "Template editing closed", "Closed groups can be reopened", and similar confirmations. These are status-bar messages at most.

---

AG01 First-Run and Platform Script

---

Event: user opens the app on Windows for the first time.

Clippy says:

"Double-click a program group to open it. Launch links ask Windows to open real apps, Settings pages, or system surfaces."

Reason: this explains the whole application in one line.

Event: user opens the app on a non-Windows system.

Clippy says:

"This system does not appear to be Windows. You can browse and copy URI links, but launch buttons may not open Windows apps here."

Reason: this prevents a false bug report. The app is still useful as a reference.

Event: platform detection is uncertain.

Clippy says:

"Platform detection is inconclusive. Launch links are still available, but Windows-specific URIs may not open on this system."

Reason: this is more honest than blocking launch.

Event: the app is opened from a local file.

Do not show a Clippy bubble by default. Put this in Help or the status bar:

"Running from a local file is supported. External protocol links may still trigger a browser confirmation prompt."

Reason: local file mode is normal for this project. It is not a problem unless something breaks.

Event: Clippy assets fail to load.

There is no Clippy bubble because Clippy is unavailable. Show a small message in Help or status:

"Assistant assets did not load. The launcher still works; Help is available from the desktop."

Reason: the launcher must not depend on Clippy.

---

AH01 Desktop and Window Guidance

---

Event: the user has not opened anything after about 45 seconds.

Clippy says:

"Start with Capture for a visible demo, or open Settings if you want practical Windows shortcuts."

Reason: this helps the user choose a starting point. It is better than explaining the whole UI again.

Event: the user opens the first program group window.

Clippy says:

"Group windows collect related URI launchers. Select an item to see its URI and limitations in the status bar."

Reason: this teaches the main interaction model.

Event: the user opens many windows, for example more than five.

Clippy says:

"Use Arrange Windows to clean up the desktop without closing your groups."

Reason: this is useful only after the desktop becomes crowded.

Event: the app switches to compact/mobile layout.

Clippy says:

"Compact mode is active. Use Search to navigate quickly without arranging windows."

Reason: double-click and dragging may be weaker on small screens.

Event: a window is automatically moved back into view because it became unreachable.

Clippy says:

"A window was moved back into view."

Reason: this explains a visible change without overexplaining.

No Clippy message should appear for ordinary window focus changes, ordinary close actions, ordinary drag actions, or ordinary selection changes.

---

AI01 Category Opening Script

---

Each category should get at most one first-open tip per session. The goal is to explain why the group exists, not to describe every item.

Event: Windows Apps opens.

Clippy says:

"Windows Apps contains familiar app-level protocol links such as Paint, Calculator, Camera, Photos, Store, and Security."

Event: Settings opens.

Clippy says:

"Settings links are grouped by task area. Use Search if you know the setting name."

Event: Capture opens.

Clippy says:

"Capture links can open Snipping Tool, Camera, Photos, and related capture settings."

Event: Store opens.

Clippy says:

"Store links include concrete pages and templates. Templates need values such as a product ID or search query."

Event: System and Security opens.

Clippy says:

"System and Security links open real Windows management surfaces. This launcher requests navigation; changes happen only inside Windows."

Event: Network and Devices opens.

Clippy says:

"This group is useful for Bluetooth, Wi-Fi, printers, projection, USB, and mobile-device shortcuts."

Event: Accessibility opens.

Clippy says:

"Accessibility links open focused Settings pages for display, audio, keyboard, pointer, captions, Narrator, and related tools."

Event: Privacy opens.

Clippy says:

"Privacy links open permission pages. They do not change permissions until you make changes in Windows Settings."

Event: Personalization opens.

Clippy says:

"Personalization contains visual and input customization links such as Background, Colors, Themes, Fonts, Start, and Taskbar."

Event: Gaming and Xbox opens.

Clippy says:

"Gaming links depend on Game Bar, Xbox components, and Windows gaming settings. Some may be missing on lean installations."

Event: Legacy and Optional opens.

Clippy says:

"Legacy and Optional contains links that may be removed, deprecated, hardware-dependent, or app-installation-dependent."

Event: All Links opens.

Clippy says:

"All Links is the full reference view. Use Search or status filters when the list is too dense."

Event: Help opens.

Do not show a Clippy bubble by default. The Help window itself is the guidance.

---

AJ01 Search Script

---

Search is one of the best places for Clippy to help. The user is actively expressing intent, so Clippy can be precise.

Event: user focuses search for the first time.

Clippy says:

"Search matches names, URI text, descriptions, tags, categories, and status labels."

Event: search returns no results after the user pauses typing.

Clippy says:

"No matching URI found. Try a shorter term such as `camera`, `update`, `privacy`, `snip`, `wifi`, or `store`."

Event: search returns too many results, for example more than 80.

Clippy says:

"Many links match. Add another word or filter by Apps, Settings, Store, Legacy, or Official."

Event: user searches for Bluetooth, bt, wireless device, or pairing.

Clippy says:

"For Bluetooth, the direct Settings URI is `ms-settings:bluetooth`."

Event: user searches for screenshot, snip, screenclip, capture, recording, or clipping.

Clippy says:

"Snipping Tool links are in Capture. Try Window Snip or Rectangle Snip for the most visible demo."

Event: user searches for camera permission, microphone permission, privacy camera, or privacy mic.

Clippy says:

"Privacy results open permission pages. They do not change access by themselves."

Event: user searches for update, optional update, update history, restart options, or Windows Update.

Clippy says:

"Windows Update links open Settings pages. Update actions still run inside Windows Settings."

Event: user searches for Defender, scan, Windows Security, virus, or protection history.

Clippy says:

"Defender links may open Windows Security or specific scan surfaces. Availability depends on Windows Security registration."

Event: user searches for Store, product, review, publisher, app installer, or downloads.

Clippy says:

"Store templates need values such as a product ID, publisher name, or query before they are useful."

Event: user searches for Wi-Fi without punctuation, wifi, network, proxy, VPN, Ethernet, or hotspot.

Clippy says:

"Network links are grouped under Network and Devices. Try `wifi`, `vpn`, `proxy`, `ethernet`, or `hotspot`."

Event: user searches for pinyin, wubi, IME, keyboard language, Japanese, Korean, region, or speech.

Clippy says:

"Language and IME links are under Time and Language. Some appear only when the related input method is installed."

Event: user searches for sound, microphone, speaker, volume, output, input, or audio.

Clippy says:

"Sound links include both device settings and privacy permissions. Use `sound` for devices and `microphone privacy` for permissions."

Event: user searches for display, monitor, graphics, night light, HDR, or resolution.

Clippy says:

"Display links are under System. Graphics and Night Light have separate Settings pages."

Do not show a tip for every query. Trigger intent tips only after the query stabilizes and only once per intent per session.

---

AK01 Item Selection and Details Script

---

Most item selections should not trigger Clippy. The status bar should handle ordinary explanations. Clippy should speak only when the selected item has a meaningful caveat.

Event: user selects a template URI.

Clippy says:

"This URI needs values before it can launch. Open Details to fill the placeholders."

Event: user opens Details for a template URI.

Clippy says:

"Replace placeholder values before launching. Copy Template is safe if you only want the URI format."

Event: user selects a deprecated URI.

Clippy says:

"This link may be unavailable on current Windows builds."

Event: user selects a legacy URI.

Clippy says:

"Legacy links are kept for reference and may work only on older or specially configured systems."

Event: user selects an install-dependent URI.

Clippy says:

"This link depends on the target app being installed and registered."

Event: user selects a hardware-dependent URI.

Clippy says:

"This link depends on hardware support. If the device is missing, Windows may ignore it or open a related page."

Event: user selects a policy-dependent URI.

Clippy says:

"This link may be blocked or redirected by Windows policy."

Event: user selects a region-dependent URI.

Clippy says:

"This link may vary by region, Store availability, or local Windows configuration."

Event: user selects a modern `ms-screenclip://capture/...` callback URI.

Clippy says:

"This protocol is intended for packaged app integration. A normal web page cannot receive the callback token."

Event: user selects a Snipping Tool URI and the item is about screenshot automation.

Clippy says:

"Snipping Tool opens interactively. This launcher cannot silently save a screenshot to a file."

Event: user selects a system/security/privacy item for the first time.

Clippy says:

"This opens a Windows management surface. Changes happen only inside Windows after it opens."

Do not show Clippy when the selected item is concrete, common, and self-explanatory, such as Paint, Calculator, Settings Home, or Store Home.

---

AL01 Launch Script

---

Launch events are high-value because this is where browser behavior can confuse the user.

Event: user clicks Open for the first time.

Clippy says before or alongside the launch request:

"The browser may ask before opening an external app. Approve the prompt if you want Windows to handle this URI."

Event: a launch is requested.

Prefer status bar text, not a Clippy bubble:

"Launch requested: `{uri}`."

Reason: routine launch confirmation should not consume a Clippy tip. It should still be visible.

Event: user clicks Open on a non-Windows system.

Clippy says:

"This does not appear to be Windows. The URI may not open an app here, but you can copy it for use on Windows."

Event: user clicks Open when platform detection is uncertain.

Clippy says:

"Launch requested. If nothing opens, copy the URI and test it on Windows."

Event: user tries to launch a template that still contains placeholders.

Clippy says:

"This template still has placeholder values. Fill them in before launching."

Event: user launches the same URI repeatedly, for example three times within one minute.

Clippy says:

"If nothing opened, Windows may not have a handler for this URI. Copy it and test it from Win+R."

Event: user launches a deprecated URI.

Clippy says:

"Launch requested. If nothing opens, this deprecated link may not exist on this Windows build."

Event: user launches an install-dependent URI.

Clippy says:

"Launch requested. If the app is not installed or registered, Windows may do nothing."

Event: user launches a hardware-dependent URI.

Clippy says:

"Launch requested. Windows may require matching hardware for this page or app to appear."

Event: user launches a Snipping Tool URI for the first time.

Clippy says:

"Snipping Tool opens interactively. This launcher cannot silently save a screenshot to a file."

Event: user launches a Store URI for the first time.

Clippy says:

"Store links may depend on region, account state, and Store app registration."

Event: user launches a Settings URI for the first time.

Clippy says:

"Settings links open specific Windows Settings pages when those pages exist on this build."

Never use these launch messages:

"Opened successfully."

"Done."

"Success."

"Windows opened the app."

The launcher does not know that. The only safe statement is that launch was requested.

---

AM01 Copy Script

---

Copy is usually simple. Clippy should speak only for the first copy, template copy, or failure.

Event: user copies the first URI.

Clippy says:

"Copied. You can paste this into Win+R, a browser address bar, or a script that opens URI links on Windows."

Event: user copies a template URI.

Clippy says:

"Template copied. Replace placeholder values before using it as a launcher."

Event: clipboard copy fails.

Clippy says:

"Clipboard access is unavailable. Select the URI text and copy it manually."

Event: user copies several URIs in one session.

Clippy says:

"For bulk reference, use All Links with filters and Details view."

Do not show Clippy for every copy. Use a small status message such as "Copied" for ordinary copies.

---

AN01 Template Script

---

Template links need special handling because they can look clickable but are not ready.

Event: user opens the template editor for the first time.

Clippy says:

"Template links need real values. Fill the fields and review the generated URI before launching."

Event: user leaves a placeholder unchanged.

Clippy says:

"A placeholder is still present. Replace it before launching this URI."

Event: template requires a local file path, such as a Photos viewer URI.

Clippy says:

"Use a full Windows file path. Browser security may still require confirmation before opening the external protocol."

Event: template requires a Microsoft Store Product ID.

Clippy says:

"Use a real Microsoft Store product ID for this template."

Event: template requires coordinates.

Clippy says:

"Use decimal latitude and longitude values."

Event: template requires a redirect URI for modern Snipping Tool capture.

Clippy says:

"This protocol is intended for packaged app integration. A normal web page cannot receive the callback token."

Event: all template fields are valid.

Prefer status bar text, not a Clippy bubble:

"The generated URI is ready to copy or launch."

---

AO01 Category-Specific Family Messages

---

These messages should appear only on first meaningful encounter with that URI family, usually on first launch, first details open, or first caveat-triggering selection.

For `ms-settings:`:

"Settings URIs open specific Windows Settings pages. Availability can vary by Windows version and hardware."

For `ms-windows-store:`:

"Store URIs can open Store pages, searches, library, updates, and product flows."

For legacy `ms-screenclip:`:

"Legacy screenclip links open interactive capture UI. They do not provide silent screenshot automation."

For modern `ms-screenclip://capture`:

"Modern capture links are designed for packaged app integration and callback handling."

For `ms-photos:`:

"Photos links can open the app or specific viewer/edit flows when valid file access is available."

For `microsoft-edge:`:

"This link asks Windows to open Microsoft Edge, even if another browser is the default."

For `windowsdefender:`:

"Windows Security links open security surfaces. Scan-specific links may vary by system registration."

For `ms-clicktodo:`:

"Click to Do requires supported Windows features and may be limited to compatible Copilot+ PCs."

For `ms-recall:`:

"Recall availability depends on device support, Windows version, and user settings."

For `microsoft.windows.camera:`:

"Camera links require the Camera app and device permissions."

For `ms-cxh:`:

"Cloud Experience Host links are system setup surfaces and may be redirected or blocked."

For `ms-device-enrollment:`:

"Device enrollment links are mainly useful on managed or work/school devices."

For Xbox and Game Bar links:

"Gaming links depend on Xbox or Game Bar components being installed and enabled."

For People:

"People is legacy on current Windows builds. This link may not resolve."

For Maps:

"Maps links depend on Windows Maps availability and may not work on current systems."

For 3D Viewer or 3D Builder:

"This link works only when the optional app is installed and registered."

---

AP01 Unexpectedly Helpful Behaviors

---

These are the most valuable Clippy moments. They should happen only after the user behavior suggests the advice is relevant.

Situation: user opens Camera and then Camera Privacy, or searches both "camera" and "privacy".

Clippy says:

"Camera app and Camera privacy are separate. One opens the app; the other opens permission settings."

Situation: user searches for screenshot automation, save file, auto-save, silent capture, or fixed region.

Clippy says:

"Snipping Tool URI links open interactive capture. Use a dedicated screenshot API or tool for silent save-to-file automation."

Situation: user repeatedly launches a URI and returns to the page without visible effect.

Clippy says:

"If nothing opened, Windows may not have a handler for this URI. Copy it and test it from Win+R."

Situation: user copies the same URI more than once.

Clippy says:

"You can create a Windows shortcut with this URI as the target."

Situation: user repeatedly searches items from the same category.

Clippy says:

"Most of these results are in one group. Open the group to browse nearby links."

Situation: user spends time in All Links and copies several entries.

Clippy says:

"Details view is better for bulk reference. It keeps URI, status, and category visible together."

Situation: user is on non-Windows and copies multiple URIs.

Clippy says:

"Copy mode is useful for documenting Windows launch commands on another system."

Situation: user opens several Legacy items.

Clippy says:

"Legacy items are grouped for testing and reference. Treat them as machine-dependent."

Situation: user opens security and Defender links.

Clippy says:

"This launcher opens Windows security surfaces. It does not run privileged commands outside Windows UI."

Situation: user opens Accessibility repeatedly.

Clippy says:

"Accessibility links are grouped by display, input, audio, and assistance tools."

Situation: user edits Store product or review templates and leaves the placeholder unchanged.

Clippy says:

"Store product and review links need a real Product ID."

Situation: user selects many `ms-settings:` links.

Clippy says:

"`ms-settings:` is the largest URI family here. Settings Groups is easier to browse than All Links."

Situation: user has many open windows or the app recovers an offscreen window.

Clippy says:

"Use Arrange Windows to restore a clean desktop layout."

These tips should feel like the assistant noticed a pattern. They must not appear randomly at startup.

---

AQ01 Manual Help Script

---

Manual Help can be more direct because the user asked for it. These messages may be longer than automatic tips, but they should still be concise.

Event: user clicks Clippy Help.

Clippy says:

"This launcher organizes Windows URI links into retro program groups. Open a group, select an item, then launch or copy its URI."

Event: user asks about launching.

Clippy says:

"Launch uses URI links such as `ms-settings:display`. Your browser may ask before Windows opens the target app."

Event: user asks about copying.

Clippy says:

"Copy saves the URI text. You can paste it into Win+R, a shortcut target, documentation, or another launcher."

Event: user asks about templates.

Clippy says:

"Templates contain placeholders. Use the editor to replace them with real values before launching."

Event: user asks why nothing opened.

Clippy says:

"Possible causes: cancelled browser prompt, missing app, unsupported Windows build, blocked policy, or unregistered URI handler."

Event: user asks how to find something.

Clippy says:

"Use Search for task words such as `bluetooth`, `camera privacy`, `update`, `snip`, `store`, or `defender`."

Event: user asks about badges.

Clippy says:

"Badges explain whether a link is legacy, deprecated, template-based, or dependent on app, hardware, region, or policy."

Event: user asks about non-Windows behavior.

Clippy says:

"This system can browse and copy links. Windows-specific launching usually requires Windows."

---

AR01 Assistant Controls

---

When the user hides Clippy, show this final message before hiding or in a status line:

"Assistant hidden for this session."

When the user mutes tips:

"Automatic tips muted. Manual Help remains available."

When the user unmutes tips:

"Automatic tips enabled."

When the user opens agent selection and multiple agents exist:

"Choose an assistant. Guidance behavior stays the same."

When only Clippy is available:

"Only Clippy is available in this build."

When the user closes the current bubble:

No message. Close silently.

The assistant controls should never feel like another source of noise.

---

AS01 Implementation Requirements

---

Implement a central assistant controller.

The controller must receive semantic events from the desktop, windows, search, launcher, copy handler, template editor, category renderer, and help system.

The controller must track session state: seen tips, last tip time, tip counts, muted state, hidden state, active category, recent searches, recent launches, recent copies, open window count, and platform state.

The controller must choose messages based on priority and usefulness. Critical messages may bypass normal cooldowns, but they still should not repeat endlessly.

The controller must support action buttons inside Clippy bubbles, but those actions must be internal application actions only. Examples: Open Help, Focus Search, Open Capture, Open All Links, Copy URI, Edit Template, Arrange Windows. No Clippy action should directly launch an external URI.

The controller must degrade gracefully. If Clippy animation assets fail, show assistant guidance through Help or a static assistant panel. Do not break the launcher.

Recommended event payload shape:

```js
{
  name: "launch.requested",
  source: "launcher",
  itemId: "settings-display",
  categoryId: "settings-system",
  uri: "ms-settings:display",
  status: ["Official"],
  platform: "windows",
  timestamp: Date.now(),
  context: {}
}
```

Recommended tip shape:

```js
{
  id: "launch-first-browser-prompt",
  event: "launch.beforeFirst",
  priority: "high",
  message: "The browser may ask before opening an external app. Approve the prompt if you want Windows to handle this URI.",
  actions: [],
  cooldownMs: 300000,
  maxPerSession: 1
}
```

The exact object model can differ, but these concepts must exist.

---

AT01 Final Acceptance Criteria

---

CLIP-001: Clippy appears when assistant assets load.

CLIP-002: If Clippy assets fail, the launcher still works.

CLIP-003: Hide, Mute Tips, Help, and optional Change Agent controls exist.

CLIP-004: First-run text changes for Windows, non-Windows, and unknown platform states.

CLIP-005: Clippy explains browser external-protocol prompts before or during the first launch.

CLIP-006: Clippy never claims an external URI opened successfully.

CLIP-007: Routine launch confirmation uses "Launch requested" wording.

CLIP-008: Template links with placeholders cannot be launched as if they were concrete links.

CLIP-009: Clippy explains template, deprecated, legacy, hardware-dependent, install-dependent, policy-dependent, and region-dependent states only when useful.

CLIP-010: Category guidance exists for Apps, Settings, Capture, Store, System and Security, Network and Devices, Accessibility, Privacy, Personalization, Gaming and Xbox, Legacy and Optional, All Links, and Help.

CLIP-011: Search guidance exists for no results, too many results, and high-value intents such as Bluetooth, screenshot, privacy, update, Defender, Store, Wi-Fi, sound, display, and IME/language.

CLIP-012: Copy guidance exists for first copy, template copy, repeated copy, and clipboard failure.

CLIP-013: Repeated launch attempts trigger a helpful troubleshooting tip.

CLIP-014: Unexpectedly helpful tips are based on observed user behavior, not random startup chatter.

CLIP-015: Automatic tips obey cooldown and repetition limits.

CLIP-016: Clippy does not speak while the user is typing, while a modal dialog is active, or immediately after a launch unless the message is critical.

CLIP-017: Manual Help remains available when automatic tips are muted.

CLIP-018: Hiding Clippy persists for the session.

CLIP-019: Clippy action buttons never auto-launch external URI protocols.

CLIP-020: The final script is reviewed for noisy, duplicate, obvious, or unreachable messages.

---

AU01 Final Clippy Script Summary

---

The assistant should mainly say these things.

On first use:

"Double-click a program group to open it. Launch links ask Windows to open real apps, Settings pages, or system surfaces."

On first launch:

"The browser may ask before opening an external app. Approve the prompt if you want Windows to handle this URI."

On launch request:

"Launch requested: `{uri}`."

On non-Windows:

"This system does not appear to be Windows. You can browse and copy URI links, but launch buttons may not open Windows apps here."

On copy:

"Copied. You can paste this into Win+R, a browser address bar, or a script that opens URI links on Windows."

On template:

"This URI needs values before it can launch. Open Details to fill the placeholders."

On failed-looking launch:

"If nothing opened, Windows may not have a handler for this URI. Copy it and test it from Win+R."

On Snipping Tool automation confusion:

"Snipping Tool URI links open interactive capture. Use a dedicated screenshot API or tool for silent save-to-file automation."

On privacy pages:

"Privacy links open permission pages. They do not change permissions until you make changes in Windows Settings."

On legacy links:

"Legacy and Optional contains links that may be removed, deprecated, hardware-dependent, or app-installation-dependent."

On search failure:

"No matching URI found. Try a shorter term such as `camera`, `update`, `privacy`, `snip`, `wifi`, or `store`."

This is the core. Additional messages should be added only when they clearly help the user make the next decision.
