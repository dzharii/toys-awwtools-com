A00 Project intent

This project is a single-page interactive web scene, not a conventional app shell. The browser viewport is the stage. There is no page chrome, no card layout, no dashboard framing, no visible form field, and no scroll. The entire experience is a top-down view into a vessel that occupies the full available viewport. On large screens, the vessel reads as a deep circular well. On narrow portrait screens, it shifts into a tall bath or cistern form, because a perfect circle wastes too much vertical space and weakens the illusion.

The page exists to receive dropped or pasted links and let them enter the liquid world. A link is not shown as a plain list item. It becomes an object in the liquid, briefly floating near the surface, remaining clickable, then slowly sinking over time. The scene is atmospheric, slightly uncanny, and polished. It should feel crafted, not templated.

The coding agent must treat visual quality as a primary requirement, not a final pass. It will not be able to verify aesthetics by itself, so the specification must force explicit decisions about composition, motion, material response, color, depth, sound, and state transitions.

B00 Non-negotiable product character

The product should feel like an interactive artifact, not a productivity widget. The emotional reference is a quiet, magnetic, luminous reservoir. The liquid is not water in the realistic sense. It is a smooth, heavy, slightly supernatural substance with soft internal glow and depth tinting. It responds to proximity and disturbance as if magnetized or weakly electrostatic.

The visual language should avoid common generative defaults: no glassmorphism panels, no floating neumorphic buttons, no centered upload card, no dashed drop zone, no generic purple gradient background, no stock particle field, no fake AI hologram style. The scene itself is the interface.

C00 Core user story

A user opens the page and immediately sees the vessel occupying the entire viewport. The liquid is already alive with very subtle motion. Ambient hum is either silent until first gesture, or armed but muted until the browser allows audio playback after interaction. When the user moves the pointer over the vessel, the liquid lags slightly behind and forms delayed disturbances. When the user drags a URL over the page, the vessel should feel receptive. When the user drops or pastes a URL, the liquid reacts with a localized impact ripple and a soft sound event. A token representing the dropped content appears on the surface, drifts, remains clickable, and gradually sinks as time passes. If the page is reopened later, previously added items are restored from local persistence at the correct depth according to elapsed time.

D00 Viewport, layout, and composition

Desktop and tablet landscape composition should be dominated by a circular vessel that nearly inscribes the viewport. It should visually touch or almost touch the left, right, top, and bottom safe bounds without causing document scroll. The user should feel that the browser window is merely a crop into a larger object. There should be only a narrow outer margin, just enough to avoid accidental clipping artifacts and to preserve the outline of the rim.

The well boundary should be visually thicker than a simple stroke. It must read as structure: rim, inner wall, and depth throat. The user is looking from above, not from the side, so the shape is a top-down aperture with pseudo-3D shading. The vessel must feel deep.

Portrait mobile composition should switch from circular well to elongated bath or cistern. The shape should be vertically biased with rounded ends or an oval-rectangle silhouette. This is not optional. A strict circle on a phone portrait display will either shrink too much or create dead space. The mobile form should preserve the same material language and interaction semantics while adapting the geometry for the screen.

There must be no document scrolling. Use viewport-sized root layout, hidden overflow, and dynamic viewport sizing that handles mobile browser UI changes. The rendered scene should account for device pixel ratio so it stays sharp on high-density screens.

E00 Visual scene anatomy

The scene consists of five layers.

Layer 1 is the outer darkness or environmental field. It should be extremely restrained. Its purpose is to separate the vessel from the page edges and add atmosphere, not to become its own background design.

Layer 2 is the vessel rim. This is the most important static visual anchor. It should feel mineral and architectural, as if made of old fitted stone or carved material. It should not look like a cartoon ring, a clean vector donut, or a game UI border. The rim needs irregularity, subtle segmentation, and tonal variation.

Layer 3 is the inner wall or throat of the well. This is where pseudo-depth is established. The wall should darken as it moves inward toward the liquid boundary. It should suggest thickness, vertical descent, and occlusion. It may include subtle stone banding, micro-shadowing, and a soft inward vignette.

Layer 4 is the liquid body. This occupies the interior aperture and is clipped exactly to the vessel opening. The liquid must show height cues by color and light variation. Higher regions or peaks should appear brighter or shifted in hue. Lower troughs should appear denser, darker, or cooler. The result should look like a topographic glow, not like a flat gradient.

Layer 5 is the floating and sinking link matter. These are interactive objects resting on or within the liquid. They must integrate into the world, not look like DOM tags pasted on top.

F00 Material and color direction

Base palette should center on a saturated magenta-violet substance with depth range extending into crimson, plum, near-black purple, and occasional electric pink highlights. A second palette variant may be offered later, such as toxic green to emerald, but the initial implementation should pick one palette and execute it well. Do not mix too many accent colors in the first version.

The liquid should have perceived elevation through color mapping. Peaks can move slightly toward brighter pink or fuchsia. Mid-level areas remain velvety magenta. Valleys move toward dark wine or black-purple. This color shift is important because it lets a 2D render imply 3D surface displacement.

The liquid should not be transparent in a clean-water way. It should be translucent only in a dense, glowing sense. Think viscous luminous fluid rather than reflective pond.

The rim and wall should be mostly desaturated. Stone tones can sit in charcoal, umber-gray, cold beige-gray, or muted volcanic brown. Keep them subordinate to the liquid. The vessel structure frames the substance; it must not outcompete it.

G00 Motion language

Everything in the scene should move with restraint. The default idle motion must be almost subliminal. It should suggest internal life without turning the scene into a screensaver.

Pointer response is delayed, weighted, and smooth. The liquid should not track the cursor directly. Instead, the cursor acts as a moving disturbance source with falloff and lag. Rapid pointer changes create delayed wave propagation. Slow pointer movement creates gentle pull and drift.

Impact motion for dropped or pasted items must be localized and readable. The disturbance should include a small depression, ring ripple, and then damped oscillation. The object should not instantly snap to rest. It should feel like it entered a medium with mass.

Sinking motion must be extremely slow relative to interaction motion. The user should be able to drop an item and still perceive it as floating for a meaningful interval. Over time, it should descend enough that its opacity, scale, blur, or color treatment indicates increasing depth.

H00 Rendering approach

The correct implementation target is a canvas-based render pipeline with explicit clipping to the vessel aperture. DOM alone will be too brittle and too generic-looking. SVG may help for masks or rim assets, but the liquid itself should be rendered on canvas, ideally one full-scene canvas or one liquid canvas plus optional overlay canvas.

A 2D canvas implementation is acceptable for version 1 if it achieves strong visual quality. A lightweight height-field simulation is the preferred approach. The liquid can be modeled as a scalar field over a grid, where pointer influence, impact events, and idle noise perturb the field, and shading derives from local gradients and height values.

WebGL is acceptable if the implementer can do it well, but it is not mandatory. The specification should favor control and polish over technical prestige. A poor WebGL shader is worse than a refined 2D field renderer.

The agent should use requestAnimationFrame for the render loop and should scale the internal canvas size by devicePixelRatio for crisp output. Canvas clipping or masking should ensure the liquid never bleeds outside the vessel boundary. These browser primitives are standard and broadly available. ([MDN Web Docs][1])

I00 Recommended liquid simulation model

Use a 2D height field on a regular grid covering the liquid aperture bounds. Each cell stores height and velocity, or current and previous height for a damped wave solver. The simulation does not need physical accuracy. It needs convincing responsiveness and stable visual output.

For every frame, apply three influence classes.

First, idle influence. This is very low-amplitude procedural movement. Use one or two slow noise fields or broad sinusoidal drifts. Avoid visible repetitive tiling.

Second, pointer influence. Represent the pointer as a soft radial attractor or repulsor with delayed interpolation. The simulation should store a smoothed pointer position that chases the actual pointer. The field is disturbed based on the smoothed position, not the raw pointer.

Third, event impulses. Drop and paste actions inject a stronger localized impulse at a chosen impact position. The impulse should generate ring propagation and damp out over a few seconds.

Shading should derive from the field, not from a static CSS gradient. Compute approximate normals from neighboring cell heights. Use those normals to derive brightness and hue shift. Add a subtle emissive bloom impression by drawing soft highlight passes, not by applying cheap global blur everywhere.

J00 Vessel geometry and masking

The vessel opening should be defined as an explicit path. On desktop it is circular or very slightly oval. On portrait mobile it becomes a tall rounded cistern. This path is the source of truth for clipping the liquid, positioning impacts, and constraining floating items.

The rim should not be drawn as a single vector stroke. It should be constructed from layered bands: outer edge, top rim face, inner lip, and shadowed throat. Slight noise modulation or hand-authored texture can break perfection. The user should read “stone ring around depth”, not “circle border.”

A practical implementation is to pre-render or procedurally render the static vessel layers into an offscreen bitmap and composite that over or around the animated liquid each frame. That reduces per-frame cost and keeps the static structure consistent.

K00 Link ingestion behavior

The page accepts incoming links through drag-and-drop, paste, and explicit keyboard paste shortcuts. For drag-and-drop, inspect DataTransfer for text/uri-list first, then text/plain as fallback, because dragged hyperlinks commonly provide both. The browser exposes these formats through the drag data store. ([MDN Web Docs][2])

For paste, listen to the paste event and read ClipboardEvent.clipboardData. This is widely supported. The handler should extract text/plain and parse candidate URLs from it. ([MDN Web Docs][3])

Support these input paths.

Dragging a hyperlink from another tab or page into the vessel.

Pasting a raw URL with Ctrl+V or Cmd+V when the page is focused.

Using the browser or OS paste command so the paste event fires.

A context-menu paste flow can only be relied on indirectly through the browser's paste event or an explicit paste control, because arbitrary clipboard reads outside user gesture are constrained by browser security. The modern Clipboard API exists, but asynchronous clipboard reads are permission- and gesture-sensitive, so the product should not depend on background clipboard polling. ([MDN Web Docs][4])

The ingest parser should normalize the URL, reject obviously invalid strings, and create a compact display token. The first version can use hostname plus a shortened path or title placeholder. It should not block the scene waiting on metadata fetch. Metadata enrichment can be a later enhancement.

L00 Link object behavior

A dropped or pasted link becomes an in-world token.

The token should spawn near the impact point, not at a fixed center point. It should appear to touch the liquid, bob, drift slightly, and remain clickable. It must look like an object in the world. Good options are a small etched plaque, a dark pill-like slate with engraved text, or a thin metal shard carrying the hostname. Avoid default browser-chip aesthetics.

Its state model has at least four phases.

Freshly entered. Strongest buoyancy, highest readability, strongest specular separation.

Floating. Still near surface, gentle drift, clearly clickable.

Submerging. Lower contrast, slightly reduced size or increased blur, still retrievable by click if visible.

Deep. Mostly lost to the liquid, no longer primary UI, but persisted in state and optionally recoverable through future secondary UI.

The initial implementation should retain clickability while the token remains visible. Clicking opens the link in a new tab. The hover or focus treatment should be subtle, probably a brighter edge or shallow upward bob, not a standard underline or button state.

M00 Persistence and time

Persist every accepted item in localStorage with at least these fields: unique id, original URL, normalized display label, creation timestamp, initial impact position in normalized vessel coordinates, and any optional style seed. localStorage is sufficient for version 1. ([MDN Web Docs][5])

Depth should be derived from elapsed real time, not from how long the tab stayed open. This is important. On page load, compute each item's current sink progress from its creation timestamp. That way, reopening the page later shows a consistent sense of passage.

The sink curve should be nonlinear. A good shape is long slow float near the surface, then gradually stronger descent. That preserves the poetic effect. A linear fade-to-bottom will feel mechanical.

The specification should explicitly define at least one tuning target. For example, an item might remain mostly surface-visible for the first 30 to 90 minutes, become noticeably submerged over several hours, and be effectively lost after a day. The exact numbers are adjustable, but the curve must favor slow early sinking.

N00 Audio behavior

Use the Web Audio API, not pre-baked background music. The scene should produce low-volume generative hum plus event-based liquid impacts after the first user gesture unlocks audio. The Web Audio API is the correct browser primitive for synthesized sound. ([MDN Web Docs][4])

Ambient sound should be continuous but understated. Think low drone, soft beating partials, filtered noise bed, or faint resonant cavity tone. It should feel like the vessel itself emits a quiet presence. It must never dominate the experience.

The ambient layer should react slightly to liquid energy. More wave activity can modestly open a filter, raise amplitude a little, or introduce faint modulation. Keep the mapping subtle.

Impact audio on drop or paste should be soft and material-specific. Not a cartoon splash. Better references are muted plunk, damp resonant pulse, or thick liquid thud with a short shimmer.

The initial audio graph can be simple: one or two oscillators, filtered noise, slow LFO modulation, master gain kept conservative, and a one-shot envelope plus filtered burst for impacts. There should be a visible mute toggle only if needed. Silent-by-default until interaction is acceptable to satisfy autoplay restrictions.

O00 Interaction details

Pointer movement over the vessel should create attraction and wave response. Pointer leaving the vessel should let the field settle naturally rather than instantly resetting.

Drag-over state should be handled carefully. When a draggable payload enters the page, the vessel should show receptivity through a mild internal brightening or slow inward pull at the likely drop zone. Do not draw a dotted upload outline. The user should feel the liquid inviting the drop.

On drop, choose the impact position from the pointer coordinates projected into normalized vessel space and clamped to the interior shape. If the user drops outside the interior but within the page, either ignore it or redirect it to the nearest valid interior point. The latter is usually better for forgiveness.

On touch devices, pointer simulation should map to touchmove with the same lag model. A long press is not required. Paste support on mobile is likely more important than drag-and-drop because cross-app URL dragging is less consistent. The experience should still feel complete without desktop drag gestures.

P00 Accessibility and fallback behavior

The product is primarily visual, but it still needs basic accessibility discipline. The page should have a clear title, keyboard-focusable interaction surface, and a non-visual fallback path for adding links. Because relying only on drag-and-drop and ambient canvas motion excludes some users, include an invisible or minimally visible input pathway that can receive pasted text when focused.

There should be a reduced-motion mode. In that mode, the liquid remains visually rich but lowers wave amplitude, ripple speed, and idle drift.

There should be an audio-off default if autoplay restrictions prevent start. After first interaction, audio can begin at low gain. There must be a reliable mute state.

Canvas-heavy visuals should not block the page from remaining usable on weaker devices. If performance falls below target, reduce simulation resolution, not design ambition.

Q00 Performance targets

The scene should aim for stable interactive frame pacing on modern laptop and phone hardware. The first optimization lever is simulation grid resolution. The second is prerendering static vessel layers. The third is limiting expensive blur passes.

Do not render more liquid detail than the eye can perceive. A moderate simulation grid with high-quality shading is preferable to a huge grid with weak art direction.

The coding agent should expose a small tuning config so quality can be adjusted without rewriting core logic. This config should include grid density, damping, pointer influence radius, impulse strength, idle amplitude, sink timings, and audio gain.

R00 Explicit design constraints for the coding agent

The agent must not produce a generic upload page wrapped around a canvas.

The agent must not place instructional text in the center of the scene by default.

The agent must not use a visible HTML list as the primary representation of dropped links.

The agent must not use a conventional card, modal, or form as the main interface.

The agent must not use bright UI buttons or badges that visually compete with the vessel.

The agent must not render the liquid as a static CSS gradient with only scale transforms.

The agent must not make the wave response instantaneous and frictionless. Lag and damping are part of the identity.

The agent must not make the audio loud, melodic, or game-like.

S00 Suggested technical architecture

Use a client-rendered single-page app, but keep the dependency footprint light. React is acceptable if the team already uses it, but the core rendering and simulation should live in plain TypeScript modules rather than in component state. Canvas animation logic should not be trapped inside frequent React re-renders.

A practical structure is this.

Scene controller manages sizing, DPR scaling, animation loop, and mode switching between circular well and portrait bath.

Vessel geometry module defines the clipping path, normalized coordinate transforms, and hit tests.

Liquid simulation module owns the height field, impulses, damping, pointer lag state, and shading data.

Renderer module composites static vessel layers, liquid, highlights, and link tokens.

Input module handles pointer, touch, drag-and-drop, and paste events.

Persistence module serializes and restores items from localStorage.

Audio module manages Web Audio context, ambient hum, impact events, mute state, and gesture unlock.

This separation matters because the coding agent tends to entangle rendering, state, and DOM event code unless told not to.

T00 Acceptance criteria

A finished version should satisfy these checks.

When the page opens on desktop, the viewport is fully occupied by a well-like vessel with no scroll and no generic UI shell.

The vessel reads as a physical boundary with rim and depth, not a flat circular mask.

The liquid shows continuous subtle life even when idle.

Pointer movement causes delayed, weighted, magnetic-looking liquid response.

Dragging a link over the scene gives a mild receptive visual signal.

Dropping or pasting a valid URL creates a localized visual impact and a soft audio impact after audio is unlocked.

The created token appears near the impact point, floats, remains clickable, and then sinks slowly over time.

Reloading the page restores prior items and their approximate sink depth based on elapsed time.

On portrait mobile, the geometry adapts into a bath or cistern form rather than shrinking the same circular composition.

The implementation uses browser drag-and-drop and paste event handling rather than hacky polling, which aligns with the platform APIs available in modern browsers. ([MDN Web Docs][1])

U00 Implementation notes Codex should be given directly

Tell the coding agent to optimize for visual distinctiveness and polish, not CRUD completeness.

Tell it to build the vessel and liquid as the interface itself.

Tell it to keep all central tuning values in a single config object.

Tell it to use normalized coordinates inside the vessel so resizing and responsive mode switches do not break object placement.

Tell it to model the liquid as a height field with damping and to derive shading from height plus local gradient.

Tell it to pre-render static vessel layers when possible.

Tell it to store dropped items with timestamps and derive sink depth from elapsed real time.

Tell it to unlock audio on first trusted user interaction and otherwise remain silent.

Tell it not to add explanatory placeholder text unless it is subtle, transient, and secondary.

V00 First-version scope boundary

Version 1 should not attempt full link preview scraping, remote metadata fetching, account sync, multi-user features, or server persistence. It should prove the core idea: a visually strong vessel scene, tactile liquid, atmospheric sound, and persistent time-based sinking of dropped links.

That restraint is important. The unique value is the feeling of the scene, not a backlog of standard app features.

W00 Concise build brief

Build a fullscreen browser scene that looks like a deep stone well on desktop and a bath-like cistern on portrait mobile. Inside it, render a luminous viscous magenta liquid on canvas, clipped exactly to the vessel opening. The liquid must feel heavy, magnetic, and alive, with delayed mouse or touch response, impact ripples, and height-based shading that implies depth. Users can drag in or paste URLs. Each accepted URL becomes a small in-world clickable token that lands on the liquid, briefly floats, and then slowly sinks over real elapsed time, with state persisted in localStorage. Add a low-volume generative hum and soft impact sounds using Web Audio after first interaction. Avoid all generic upload UI patterns. The scene itself is the interface.

X00 What I would tighten further in a next pass

The next useful step is to turn this into an engineering spec with parameter values, data schemas, state machines, rendering pseudocode, and a concrete file tree so Codex has even less room to improvise.

[1]: https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API?utm_source=chatgpt.com "HTML Drag and Drop API - MDN Web Docs"
[2]: https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API/Drag_data_store?utm_source=chatgpt.com "Working with the drag data store - Web APIs | MDN"
[3]: https://developer.mozilla.org/en-US/docs/Web/API/Element/paste_event?utm_source=chatgpt.com "Element: paste event - Web APIs | MDN"
[4]: https://developer.mozilla.org/en-US/docs/Web/API/Clipboard_API?utm_source=chatgpt.com "Clipboard API - MDN Web Docs"
[5]: https://developer.mozilla.org/en-US/docs/Web/API/DataTransfer?utm_source=chatgpt.com "DataTransfer - Web APIs - MDN Web Docs"


Once the task is completed, go ahead and edit ../../index.html and add entry for this project there. Make sure we have good highlevel readme file.
