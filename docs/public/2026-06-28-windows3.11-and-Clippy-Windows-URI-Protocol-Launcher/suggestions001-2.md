---

V00 User-Visible Desktop Experience and Grouping Narrative

---

When the user opens the finished application, they should not feel that they have opened a conventional web dashboard. They should feel that the browser has become a small retro Windows environment. The first impression should be a desktop, not a list. The desktop should have a restrained Windows 3.11-inspired background, a narrow title/menu region, and a collection of large program-group icons arranged in a deliberate grid. The icons should not look like modern app tiles. They should look like old Program Manager groups: small, crisp, square-ish illustrations with text labels underneath.

The first screen should be calm and readable. The user should see a title such as "Program Manager - Windows URI Launcher" or "Windows URI Program Manager." The title must communicate both parts of the product: it is a launcher, and it is intentionally presented through the Program Manager metaphor. A first-time user should immediately understand that each desktop icon represents a group of launchable Windows links.

The desktop should not start with hundreds of small icons. That would be faithful to disorder, not faithful to a good experience. The user should initially see around ten to fourteen carefully chosen group icons. These group icons are the primary affordance. They are the equivalent of Program Manager groups, and they should open windows containing many related URI launchers.

The first row of the desktop should contain the highest-value groups: Windows Apps, Settings, Capture, Store, System and Security, and Network and Devices. These are the categories a user is most likely to understand without reading documentation. The second row should contain more specialized groups: Accessibility, Privacy, Personalization, Gaming and Xbox, Legacy and Optional, All Links, and Help. If the viewport is narrow, the desktop may wrap these groups, but it should preserve the ordering.

The user should be able to single-click a desktop icon and see a selection rectangle. The selection should feel like a classic selected icon label: a dotted focus rectangle or dark-blue selected label background is acceptable. Double-clicking should open the corresponding group window. Pressing Enter while an icon is selected should open it. On touch devices, where double-click is unnatural, a selected group should expose a small "Open" command or open on single tap after a short fallback rule. The coding agent should implement this tactically but preserve the desktop metaphor on desktop browsers.

The first-time experience should include Clippy, but Clippy should not dominate the screen. Clippy should appear near a lower corner or near the desktop edge, not in the center. Its first tip should explain the interaction model in one or two short sentences: "Double-click a program group to open it. These links ask Windows to open real apps and Settings pages." This tip should not repeat on every refresh if the user has already dismissed or muted the assistant in the current session.

The user should see a small status bar or footer strip that says something factual, such as "Ready - Double-click a group to open a launcher window." If the user is not on Windows, the status should be paired with a visible but nonblocking banner: "This browser does not look like Windows. Launch links may not open apps, but you can still browse and copy URIs." The application should remain functional as a reference, even when launching is unlikely to work.

The important design principle is that the user should discover gradually. The desktop groups are the first level. Each group window is the second level. Each item details dialog is the third level. Search is the fast path. Clippy is the guide. The user should never be forced to scroll through an enormous list unless they intentionally open "All Links."

---

W00 Program Group Windows as the Main Interaction Unit

---

When the user opens a group, the application should create a classic window. The window should have an active blue title bar, a small control box or close button, a menu row if useful, a content pane, and a status bar. It should have a raised outer border and a recessed content region. The title should identify the group, for example "Windows Apps", "Settings - Network and Devices", or "Store Links."

The group window should not render the links as modern cards. Inside a Windows 3.11-style window, a modern card grid will look like an unrelated web component. Instead, the window should use one of two retro views: icon view and details view.

Icon view should be the default for ordinary category windows. Each launcher item appears as a small retro icon with a label. A short description may appear in the status bar when the user hovers or focuses the item, rather than being printed under every icon. This keeps the UI compact and closer to the Windows 3.x mental model. For example, the Windows Apps group may show icons labeled Paint, Calculator, Camera, Photos, Clock, Edge, Phone Link, Widgets, Security, Weather, Outlook, Teams, To Do, and Clipchamp. When the user hovers Paint, the status bar can say "Open Microsoft Paint through ms-paint:." When the user hovers Calculator, it can say "Open Calculator through calculator: or ms-calculator:."

Details view should be available from the View menu or a toolbar button. Details view should behave like a compact list with columns: Name, URI, Status, and Description. This is the power-user reference mode. It is useful for long groups such as Settings and All Links. The user should be able to select a row and press Enter to launch, Ctrl+C to copy the URI, or Alt+Enter to open details.

A group window should have a small command strip or menu. The commands should include Open, Copy URI, Details, Find in Group, View as Icons, View as Details, and Close. These commands can be menu items instead of big buttons. The product should avoid filling every item with repeated Open and Copy buttons in the default icon view. Repeated buttons are useful in a modern grid, but they make the retro desktop feel crowded. The details pane or right-click/context menu can provide those actions after selection.

Every group window should use the status bar as an active part of the interface. When nothing is selected, the status bar should summarize the group: "14 launchers - app protocols and Windows inbox apps." When an item is selected, it should show the URI and limitations: "ms-paint: - opens Paint if registered." When a deprecated item is selected, the status bar should warn: "Legacy link - may be missing on current Windows." When a template is selected, it should say: "Template link - edit placeholder values before launching."

The windows should feel alive but not heavy. Dragging should be smooth. Opening a group should position the new window slightly offset from existing windows. If the same group is already open, double-clicking the desktop icon should focus the existing window rather than creating duplicate copies, unless the agent intentionally implements multiple instances and handles them cleanly. The simpler and better behavior is to focus the existing group window.

---

X00 Concrete Desktop Grouping Examples

---

The Windows Apps group should be the friendly entry point. It contains user-facing app protocols that resemble Start menu applications. A user who opens this group should see a compact collection of familiar app-like icons rather than a technical list. The icons should include Paint, Calculator, Clock, Camera, Photos, Edge, Store, Weather, Phone Link, Widgets, Windows Backup, Windows Security, Outlook, Teams, To Do, Clipchamp, Media Player, Movies and TV, Microsoft News, Surface, Quick Assist, and Copilot where present in the dataset. The group should also include aliases where they matter, but aliases should not clutter the default icon view. For example, Calculator may have a details row listing both `calculator:` and `ms-calculator:`, while the icon view shows one Calculator icon unless the two handlers have materially different behavior.

The Settings group should behave differently because it is too large for one flat window. The desktop icon may open a "Settings Groups" window rather than directly rendering every `ms-settings:` link. This window should contain sub-icons such as Accounts, Apps, Devices, Accessibility, Network, Personalization, Privacy, System, Time and Language, and Update and Security. Double-clicking one of those sub-icons opens a second-level Settings window. This mirrors Program Manager nesting without showing hundreds of entries at once.

The Capture group should be curated as a high-interest demo group. When the user opens it, they should see Snipping Tool, Rectangle Snip, Window Snip, Freeform Snip, Delayed Snip, Screen Recording, Snipping Tool Discover, Screen Sketch, Photos Viewer, Photos Video Trim, Camera, Camera Picker, and graphics-capture privacy settings. This group is important because it has a clear "interesting trick" quality: users can click a retro icon in a web page and Windows opens a screenshot tool. The group should therefore have stronger explanatory microcopy. Its status bar can say: "Capture links may open Snipping Tool or request browser permission to open an external protocol."

The Store group should look like a small marketplace control panel. It should contain Store Home, Downloads and Updates, Library, Store Settings, Gaming, Entertainment, Productivity, Search, Publisher Search, Product Page, Review, Association by File Extension, Association by Protocol, and App Installer. Template items such as Product Page and Review should show a small template marker because they require a real Product ID. Store Search can be concrete if the example query is safe, such as PowerShell, but it should still allow editing. The user should be able to open a "Template Editor" dialog from these items.

The System and Security group should contain Windows Security, Defender quick scan, Defender full scan, protection history, Windows Update, update history, optional updates, activation, recovery, troubleshoot, developers, Find my device, device encryption, device enrollment, Cloud Experience Host, OOBE network, Search repair, and Windows Backup. This group should be treated more carefully than Apps. Clippy should warn on first use that some system links may open sensitive system pages and that the app only requests the launch; it does not run administrative commands.

The Network and Devices group should feel like a Control Panel corner of the desktop. It should include Bluetooth, connected devices, device discovery, projection, printers, USB, touchpad, mouse and touchpad, typing, pen, wheel, mobile devices, add phone, Wi-Fi, Ethernet, VPN, proxy, cellular, hotspot, airplane mode, data usage, DirectAccess, and proximity. The user scenario here is practical: "I want to jump directly to Bluetooth or printers." This group should have strong search aliases because users may search for "printer", "wifi", "cast", "phone", "touchpad", or "bluetooth."

The Accessibility group should be one of the most carefully organized Settings groups. It should include Narrator, Magnifier, captions, color filters, contrast themes, display accessibility, visual effects, keyboard, mouse, mouse pointer, text cursor, audio, speech recognition, eye control, hearing aids, and related adaptive display links. This group should avoid joke-like treatment. The retro style can be playful, but accessibility settings are real user needs. The UI should make these links easy to find and not bury them under novelty.

The Privacy group should be structured by permission surface. It should include Camera, Microphone, Location, Contacts, Calendar, Email, Messaging, Phone Calls, Documents, Downloads Folder, Pictures, Videos, Music Library, File System Access, App Diagnostics, Automatic File Downloads, Notifications, Radios, Motion, Eye Tracker, Voice Activation, Speech, Speech Typing, Activity History, Feedback and Diagnostics, and Graphics Capture privacy links. This group should use consistent shield or lock-style icons. The window status bar should explain that these links open Settings privacy pages rather than changing permissions directly.

The Personalization group should feel visually appropriate for a retro desktop demo. It should include Background, Colors, Themes, Fonts, Lock Screen, Start, Start folders, Taskbar, Text Input, Touch Keyboard, Dynamic Lighting, Copilot hardware key customization, Glance where present, and navigation bar where present. This group should be a good place to demonstrate icon view because the items are visually intuitive.

The Gaming and Xbox group should contain Game Bar, Gaming Overlay, Game Bar services, Xbox app, Xbox profile, Xbox friend finder, Xbox network, Xbox settings, Xbox captures, Solitaire, and the gaming Settings pages such as Game Bar, Captures, Game Mode, TruePlay where present, and quiet moments for games. This group should be marked as install-dependent because Xbox-related handlers vary by machine.

The Legacy and Optional group should collect items that may not exist on modern Windows or may depend on optional apps. This includes People, Windows Maps, drive-to and walk-to maps, Mixed Reality, 3D Viewer, 3D Builder, older music/video surfaces, legacy Mail/Calendar routes, Surface app, Holographic first run, old Screen Sketch edit flow, and other deprecated or app-removed surfaces. The purpose of this group is honesty. Rather than hiding these links, the app should frame them as historical, optional, or machine-dependent. This is also thematically appropriate: a retro desktop can contain a "Museum" or "Legacy" folder.

The All Links group is the power-user index. It should not be the default entry point, but it must exist. It should open a large window in details view by default. This window should have search, column sorting, status filtering, and fast copy. It is the answer for users who know what they want and do not need the guided desktop.

The Help group should be a first-class part of the desktop, not a footnote. It should open a help window with topics such as "What is a URI protocol?", "Why does my browser ask for permission?", "Why did nothing open?", "How to copy a URI into Win+R", "Why some links are marked legacy", "How templates work", and "How to search." This Help window should be written in plain text and styled like old Windows Help.

---

Y00 Usage Scenarios as the User Experiences Them

---

Scenario 1: the user opens the application for the first time on Windows. The user sees the retro desktop, group icons, a menu bar, and Clippy in the corner. The desktop does not ask for setup. It does not immediately launch anything. Clippy says something like: "Double-click a group to open it. When you click a launcher, your browser may ask before handing the link to Windows." The user double-clicks "Capture." A window opens with Snipping Tool-related icons. The user double-clicks "Window Snip." The browser shows an external-protocol prompt. The user accepts it, and Windows opens the snipping experience. The app status bar changes to "Launch requested: ms-screenclip:?clippingMode=Window." The app does not claim that the screenshot was taken, because it cannot know that.

Scenario 2: the user wants to find Bluetooth settings. They may not know whether Bluetooth is under Apps, Settings, Devices, or Network. The user presses `/` and types "bluetooth." A Find window opens or receives focus. The results show Bluetooth under Network and Devices, maybe also connected devices and device discovery. The first result is selected. The user presses Enter. Windows opens `ms-settings:bluetooth`. Clippy may offer one contextual tip after a delay: "You can also open the Network and Devices group to browse printers, USB, projection, and mobile-device links." The tip should not interrupt the launch.

Scenario 3: the user explores the app like a demo. They open Windows Apps, then Store, then Personalization. The windows overlap. Active windows use a blue title bar. Inactive windows use gray title bars. The taskbar/window list shows the open groups. The user drags the Store window to the right and opens a Store Search item. Because Store Search uses an example query, the details dialog offers "Open Example", "Edit Query", and "Copy Template." The user clicks Edit Query, types "Windows Terminal", and launches the generated Store search URI. The template editing flow demonstrates that this is more than a static list.

Scenario 4: the user is on macOS or Linux. The app still opens as a retro desktop, but a banner says that Windows protocol launching is unlikely to work. The desktop remains interactive. Open buttons become "Open Anyway" or show a warning icon. Copy remains primary. The user can browse All Links, copy `ms-settings:display`, and understand that the link is useful on a Windows machine. Clippy's first tip changes: "This looks like a non-Windows system. You can still browse and copy URI commands, but launch links may not open apps here."

Scenario 5: the user opens Legacy and Optional. The window intentionally looks like a folder of old artifacts. Items are marked with warning badges such as Legacy, Deprecated, Install dependent, or Hardware dependent. The user selects Windows Maps. The status bar explains that Maps availability depends on Windows version and app support. The details dialog explains that this link may not work on current Windows. This prevents a broken demo from looking like an application bug.

Scenario 6: the user wants to inspect rather than launch. They open All Links. The window defaults to details view with rows and columns. The user sorts by Status and filters to Official. They copy several `ms-settings:` links. They never need to trigger an external protocol launch. In this mode, the app acts as a compact technical reference, but it still feels like it lives inside a retro shell.

Scenario 7: the user interacts with Clippy. Clippy should not be random decoration. If the user opens Settings and then hovers several privacy entries, Clippy should eventually say: "Privacy links only open Settings pages. They do not change permissions by themselves." If the user copies a URI, Clippy can say: "Copied. You can paste this into Win+R on Windows." If the user dismisses Clippy, it should stay dismissed for the session. If the user mutes tips, Clippy should remain visible but quiet, and manual Help should still work.

Scenario 8: the user gets no search results. They search "screenshot" and the app should still find Snipping Tool because the data model includes tags such as screenshot, snip, capture, screenclip, recording, rectangle, and window. If they search "wifi" without the hyphen, the app should find Wi-Fi because tags normalize punctuation. If they search "defender", they should find Windows Security and Defender deep links. This is a data design requirement, not merely a UI requirement.

Scenario 9: the user opens a template link such as a Photos viewer file path or Store Product ID. The app must not launch a placeholder URI as if it were useful. Instead, it should open a small retro dialog. The dialog should show fields such as "File path" or "Product ID", a generated URI preview, and buttons for Open, Copy, Cancel. If the user leaves placeholders unchanged, the Open button should stay disabled or warn clearly. This makes template support reliable and understandable.

Scenario 10: the user treats the application as a toy and opens many windows. The app should remain stable. Windows should not disappear behind unreachable regions. There should be a command to arrange icons, cascade windows, close all windows, and restore the default layout. These commands are both practical and appropriate to the Windows 3.11 theme.

---

Z00 Reference Layout and Group Contents

---

The desktop should begin with this group layout, ordered left to right and top to bottom on wide screens.

| Desktop icon        | Window title            | Default view | User meaning                                                                             |
| ------------------- | ----------------------- | ------------ | ---------------------------------------------------------------------------------------- |
| Windows Apps        | Windows Apps            | Icon view    | Familiar app launchers and app-level URI schemes.                                        |
| Settings            | Settings Groups         | Icon view    | Entry point into `ms-settings:` areas.                                                   |
| Capture             | Capture and Screenshots | Icon view    | Snipping Tool, Screen Sketch, Camera, Photos, and capture privacy.                       |
| Store               | Microsoft Store Links   | Icon view    | Store home, search, products, library, updates, and App Installer.                       |
| System and Security | System and Security     | Details view | Update, Defender, recovery, security, backup, enrollment, and system flows.              |
| Network and Devices | Network and Devices     | Icon view    | Wi-Fi, Bluetooth, printers, projection, USB, mobile, and input devices.                  |
| Accessibility       | Accessibility           | Icon view    | Narrator, magnifier, captions, pointer, keyboard, hearing, and visual settings.          |
| Privacy             | Privacy and Permissions | Details view | Camera, microphone, location, library permissions, diagnostics, and capture permissions. |
| Personalization     | Personalization         | Icon view    | Background, colors, taskbar, Start, themes, fonts, and lighting.                         |
| Gaming and Xbox     | Gaming and Xbox         | Icon view    | Game Bar, Xbox, captures, overlays, and gaming Settings.                                 |
| Legacy and Optional | Legacy and Optional     | Details view | Deprecated, removed, hardware-gated, region-gated, or install-dependent links.           |
| All Links           | All URI Links           | Details view | Complete searchable reference.                                                           |
| Help                | Help Topics             | Topic view   | Guidance, external protocol explanation, browser prompts, and troubleshooting.           |

The Windows Apps group should contain app-level launchers such as Edge, Store, Paint, Calculator, Clock, Camera, Photos, Weather, Phone Link, Widgets, Windows Backup, Windows Security, Outlook, Mail or Calendar aliases where present, Teams, To Do, Clipchamp, Media Player, Movies and TV, News, Quick Assist, Surface, and Copilot. If several handlers represent the same app, the icon view should group them under one app icon and expose alternates in details. For example, Calculator may expose `calculator:` and `ms-calculator:` as alternate URIs. Media may expose `mswindowsmusic:` and `microsoftmusic:` as related routes.

The Settings group should not directly contain every Settings URI. It should contain subgroups. Accounts should include work or school, email accounts, sign-in options, Windows Hello face, Windows Hello fingerprint, dynamic lock, other users, assigned access, backup, sync, and family. Apps should include installed apps, app advanced options, default apps, apps for websites, optional features, offline maps, startup apps, and video playback. Devices should include Bluetooth, connected devices, camera, mouse, touchpad, pen, printers, typing, USB, wheel, and mobile devices. Accessibility should include audio, captions, color filters, contrast, display, eye control, hearing aids, keyboard, magnifier, mouse, pointer, Narrator, speech recognition, text cursor, and visual effects.

The Network subgroup should include network status, advanced network settings, Wi-Fi, known networks, Ethernet, VPN, proxy, cellular, hotspot, airplane mode, data usage, DirectAccess, proximity, and Wi-Fi provisioning. Personalization should include background, colors, themes, fonts, lock screen, Start, Start folders, taskbar, text input, touch keyboard, dynamic lighting, Copilot hardware key, Glance, and navigation bar. Privacy should include account info, activity history, app diagnostics, automatic file downloads, background apps where present, calendar, call history, camera, contacts, documents, downloads, email, eye tracker, feedback, file system, graphics capture, location, messaging, microphone, motion, music library, notifications, other devices, phone calls, pictures, radios, speech, tasks, videos, and voice activation.

The System subgroup should include About, Display, Advanced Display, Graphics, Sound, Sound Devices, Volume Mixer, Notifications, Clipboard, Power and Sleep, Battery, Battery Usage, Storage, Storage Sense, Disks and Volumes, Multitasking, Night Light, Projecting to this PC, Remote Desktop, Shared Experiences or Cross-Device, Presence Sensing, Device Encryption, Energy Recommendations, and Default Save Locations. Time and Language should include Date and Time, Language and Region, Region Formatting, Keyboard, Advanced Keyboard, Speech, Japanese IME, Korean IME, Pinyin, Wubi, Bopomofo, Cangjie, Quick IME, and related IME-specific pages. Update and Security should include Windows Update, update action, active hours, advanced options, optional updates, restart options, update history, activation, recovery, troubleshoot, Windows Security, Windows Insider, delivery optimization, find my device, developers, and security-key enrollment.

The Capture group should be more narrative than purely categorical. Its first row should show the most demonstrable actions: Snipping Tool, Rectangle Snip, Window Snip, Freeform Snip, Delayed Snip, Screen Recording. The second row should show integration and adjacent surfaces: Modern Image Capture, Modern Video Capture, Discover Capabilities, Screen Sketch Edit, Photos Viewer, Photos Video Trim, Camera, Camera Picker, Camera Multi-Picker. The third row should show related Settings and privacy links: Camera Privacy, Microphone Privacy, Programmatic Graphics Capture, Borderless Graphics Capture, Pictures Library, Videos Library. This grouping helps the user see that "capture" is a family of launch surfaces rather than one app.

The Store group should separate concrete actions from templates. Concrete actions include Store Home, Downloads and Updates, Library, Store Settings, Gaming, Entertainment, Productivity, Line of Business where available, and Search with an editable query. Template actions include Product Details, Review, Publisher Search, Browse Category, Association by File Extension, Association by Protocol, and App Installer source. Template actions must open an editor dialog before launch unless populated with a safe demonstration value.

The Legacy and Optional group should be intentionally labeled, not hidden. It should include People, Maps, drive-to, walk-to, Mixed Reality, Holographic first run, 3D Viewer, 3D Builder, legacy Mail and Calendar routes, old Screen Sketch edit flow, Surface-specific links, Xbox-specific links where the Xbox app may be missing, and older media routes. The group should teach the user that URI protocols are partly historical and machine-dependent.

The All Links group should be implemented as a table-like reference window. It should not use large icons by default because its purpose is high-density search and inspection. It should include columns for Name, URI, Group, Status, and Type. It should allow selecting a row and using Open, Copy, Details, and Jump to Group. This window is the escape hatch for expert users and should remain fast even with hundreds of items.

The Help group should be written as part of the product, not as a generic README pasted into a dialog. It should explain that links such as `ms-settings:display` are Windows URI protocols, that browsers normally ask permission before opening external apps, that some protocols exist only when apps are installed, and that non-Windows systems can still use the page as a reference. It should include a small section called "Try these first" with safe examples: Display Settings, Bluetooth, Paint, Calculator, Store Home, Snipping Tool, Windows Update, and Camera Privacy.

---

AA00 Required Technical Behavior Behind the Narrative

---

The visual grouping must be backed by a real grouping model. Do not hard-code the same item into multiple HTML windows. Define groups and subgroups as data, then render windows from that data. If an item should appear in multiple places, give it a primary group and one or more aliases or related groups. The UI may show related items without duplicating the underlying item.

The desktop group model should contain stable group IDs, display names, descriptions, icon keys, default view mode, sort order, and optional subgroup definitions. The item model should contain stable item IDs, URI strings, launchability, template fields, status badges, tags, and notes. The code should be able to answer: which items belong to this desktop icon, which group should open for this search result, which icon should render for this item, and which warning should appear before launch.

The agent should implement the first version with a small number of reliable group behaviors rather than many inconsistent special cases. A group opens a window. A window renders items. An item can be selected. A selected item can be opened, copied, or inspected. A template item can be edited. A search result can focus or launch an item. Clippy can observe these state changes. This simple core should drive all groups.

The UI must preserve the user's mental map. If the user opens Network and Devices, searches for Bluetooth, opens details, and closes details, they should return to the Network and Devices window in the same approximate state. If the user opens All Links and filters to Deprecated, that filter should remain while the window is open. If the user closes and reopens the group, resetting state is acceptable unless session persistence is easy and reliable.

The implementation should avoid making Clippy responsible for navigation. Clippy is a guide, not the control system. Every Clippy suggestion must correspond to a visible command the user could find without Clippy. If Clippy suggests "Try Capture", the Capture desktop icon and menu item must exist. If Clippy suggests "Search for Bluetooth", the search command must exist. This prevents the assistant from becoming an inaccessible hidden navigation layer.

---

AB00 Acceptance Criteria for This Experience Layer

---

The experience layer is accepted when a reviewer can perform this walkthrough without reading the code.

The reviewer opens the app and immediately sees a Windows 3.11-inspired desktop with group icons rather than a modern list. The reviewer can identify at least Windows Apps, Settings, Capture, Store, System and Security, Network and Devices, Accessibility, Privacy, Personalization, Legacy and Optional, All Links, and Help. The reviewer can single-click and double-click icons, open group windows, drag windows, close windows, and see active/inactive window states.

The reviewer opens Windows Apps and sees familiar app launchers, not every technical URI variant dumped into one list. The reviewer opens Settings and sees subgroups instead of hundreds of entries. The reviewer opens Capture and understands why Snipping Tool, Photos, Camera, and graphics-capture privacy are together. The reviewer opens Store and can distinguish direct Store pages from Product ID templates. The reviewer opens Legacy and Optional and sees honest warnings about machine-dependent links.

The reviewer searches for "bluetooth", "snip", "camera privacy", "update", "paint", "defender", "store search", and "pinyin" and receives relevant results. The reviewer can open a result, copy a result, inspect details, and jump to the containing group. The reviewer can use the app without Clippy, but Clippy provides useful contextual help when enabled.

The reviewer sees clear messaging on non-Windows platforms. The reviewer never sees a false success message after launching a URI. The reviewer never sees a template URI treated as a fully concrete launcher unless the placeholders have been filled. The reviewer never has to scroll through hundreds of entries on the first screen.

The finished experience should be dense, discoverable, and intentionally retro. It should feel like a technical reference disguised as a small Windows 3.11 desktop, not a spreadsheet disguised as nostalgia.
