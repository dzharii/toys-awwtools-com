A00 v01 Purpose and tone
This is a small static web project (not a single file) that uses SVG, CSS, and vanilla JavaScript to show a cartoon side-profile character with a visibly hollow head. The joke is that the character has no brain until you type something, and then your text becomes the "brain" by flowing into the head cavity and filling it. The tone is playful, childish, and slightly absurd, but visually polished: smooth motion, soft shapes, and friendly colors.

B00 v01 Project structure and delivery constraints
The project is built as plain static files: HTML, CSS, and JavaScript. There is no bundler, no build step, no dependencies, and no ECMAScript modules. JavaScript is split into multiple files for clarity, and all scripts are loaded via classic script tags in HTML. CSS can also be split across multiple files and linked via classic link tags.

The project targets modern browsers and may use modern web APIs and SVG features. The code organization is modular by convention: each JS file owns a slice of behavior, but everything runs in the classic global environment. The integration pattern is "load order plus a single global namespace" so files can collaborate without modules.

C00 v01 Concept snapshot
You see a profile-view cartoon head, sliced so the inside is visible like a clean cross-section. The skull rim is drawn, the cavity is empty by default, and you can clearly read "nothing in there". Beneath or beside the character is a text input that invites you to type something (a URL, a reminder, a phrase). As you type, the cavity transitions from empty to filled with animated text that conforms to the cavity shape, shrinking or growing so the text always tries to occupy the full space.

D00 v01 Layout and UI style
The page is minimal and centered, like a playful toy rather than an app.

The hero area is the character SVG, large and clean, with generous whitespace around it. The editor area is a single text box with a whimsical label, such as "Put a thought in my head" or "Load brain cells". Typography is rounded and friendly. Buttons are optional; the interaction can be live as you type, but a single toggle like "wiggle mode" can add charm if you want it.

UI styling matches the cartoon: rounded corners, soft shadows, thick outlines, subtle gradients, and slightly imperfect strokes (a hand-drawn feel, but still crisp). The empty cavity should look like a stage waiting for content.

E00 v01 Character design requirements
The character is shown from the side (profile). It reads instantly as a head and face, with a simple nose, mouth line, and a single visible eye.

The skull cross-section is the core gag: the top/back of the head is sliced open so the inside is visible. The rim of the skull is outlined, and the interior cavity is a clean shape that can act as a mask for the text. The cavity has enough area to make the text fill effect satisfying.

The empty-brain state is obvious even before typing. The cavity can show a faint inner texture (subtle shading or pale gradient) to imply depth. Optionally, a tiny cobweb or a small echo-line can reinforce the emptiness, but it should fade from attention once text appears.

F00 v01 Animation language for the character
The character feels alive through micro-movements that never become distracting.

Eye movement: the single visible eye performs periodic micro-saccades. The pupil drifts slightly, pauses, then snaps a few pixels to another point. A slow blink every few seconds adds warmth. The motion always respects profile view.

Breathing or bob: the head and neck subtly rise and fall or sway by a few pixels, with gentle easing.

Cavity idle: when empty, the cavity may show barely visible dust motes or a soft shimmer. When filled, this idle effect reduces so the text motion is the focus.

G00 v01 Text-as-brain behavior
The text is the brain replacement. It never appears as plain lines sitting inside the head. It must feel like it is being poured, wrapped, and packed into the cavity.

Masking: the cavity shape is a hard boundary. Text never spills outside the skull. The rim stays on top so the text reads as internal.

Filling strategy: the text follows curving paths that trace the cavity, like a coiling ribbon. The default is a continuous string that snakes back and forth with smooth turns. Short text becomes large and bold, long text becomes finer but still tries to fill the entire area.

Scaling rule: text size adapts to length to maximize occupancy. One character becomes huge and centered, occupying most of the cavity. As characters are added, the system reduces size and increases coils so the cavity stays visually dense.

Contour respect: pathing feels guided by the cavity silhouette. The text curves near the rim, turns near the back of the head, and avoids sharp corners.

Legibility balance: for moderate length, the text remains readable. For extreme length, it becomes a dense "brain noise" texture, still recognizably made of the input characters.

H00 v01 Text transition animations
Typing feels like fluid insertion into the head, not instant layout.

On first input: when the user types the first non-space character, the cavity transitions from empty to active. The text inflates from the center with soft easing, like a thought materializing.

While typing: each keystroke triggers a brief reflow ripple. The text shifts and settles with a springy, damped motion.

When deleting: the text retracts smoothly. If the user deletes to empty, the last characters shrink away and the cavity returns to its empty idle state.

Optional flourish: a faint ribbon or dotted trail can drift from the input toward the cavity during edits, suggesting thought transfer, but it stays subtle.

I00 v01 User stories
A user opens the page and immediately sees a cartoon profile head with a visible hollow cavity. The character idles, eye moving slightly, blinking sometimes. The cavity looks empty in a funny, obvious way.

The user types a short phrase. The text inflates into the cavity and arranges into a large curved band, then begins coiling as more letters appear. The cavity looks filled even with short input because the text scales up.

The user pastes a URL. The text shrinks and wraps, snaking along smooth curves until it fills most of the cavity.

The user pastes a very long paragraph. The text becomes smaller and densely packed, turning into a tight coil texture. The cavity remains visually filled, and the character still looks alive.

The user deletes everything. The text drains away, the cavity becomes empty again, and the character returns to its hollow idle vibe.

J00 v01 UX rules and interaction
The cavity updates live as the user types. No submit is required.

The text box supports normal editing, selection, paste, and multiline input. Internally, the "brain string" treats content as one continuous sequence. Line breaks act as soft separators, not as a rigid paragraph layout.

A small decorative meter can reinforce the gag: a "Brain occupancy" gauge that rises as the cavity becomes denser. It remains playful and nontechnical.

An empty state hint near the input invites action and disappears after typing begins.

K00 v01 Visual consistency rules
The aesthetic is cohesive: thick outline strokes, soft fills, simple shapes, limited palette. The skull rim and cavity remain readable at a glance.

The text inside the cavity matches the cartoon style: rounded font, slightly bold, high contrast against the cavity background, with a subtle stroke or shadow so it stays readable while moving.

L00 v01 Implementation approach overview
SVG is used for the character and the cavity mask. The head, skull rim, and facial features are stable shapes with small animated transforms for idle motion and blink. The "brain text" is rendered as SVG text-on-path, where paths are generated to snake within the cavity bounds.

The project uses multiple JS files loaded in a strict order. Each file owns a clear area of responsibility, and the whole project shares a single global namespace object to avoid global clutter. Initialization happens after DOMContentLoaded in a dedicated bootstrap file.

The layout engine treats the cavity as a container and generates one or more smooth curves that sweep the area. As text length changes, it adjusts font size and coil density, then animates the transition between previous and next layouts so it feels fluid.

If perfect packing is too heavy, the system approximates by using a small set of predesigned snake paths for different density levels and switches between them with smoothing. The key is that it always looks like the text is conforming to the cavity and trying to fill it, not simply wrapped like paragraph text.

M00 v01 File and responsibility map
index.html hosts the SVG, the input UI, and the classic script and link tags in explicit load order.

css or styles files hold theme, layout, and animation keyframes. For example, base.css for layout and palette, character.css for SVG styling, and ui.css for the editor area.

js files are split by concern and loaded in dependency order. A typical split is a namespace and utilities file first, then SVG setup, then character animation, then text layout, then UI wiring, then bootstrap.

All JS files attach to a single global object (for example window.BrainJoke) and expose only what the next files need. Private details remain inside file scopes via IIFEs, with a minimal shared surface.

N00 v01 Acceptance criteria
On load, the character is visibly hollow, in profile, with idle motion and periodic eye movement.

Typing into the text box causes the text to appear inside the head cavity, masked to the cavity shape.

Text scales with length so short input looks large and long input looks dense, while the cavity stays visually filled.

Edits reflow smoothly with soft easing; no harsh jumps.

The project is delivered as static files with multiple JS and CSS files, no bundlers, no dependencies, no ECMAScript modules, and classic inclusion via script and link tags.
