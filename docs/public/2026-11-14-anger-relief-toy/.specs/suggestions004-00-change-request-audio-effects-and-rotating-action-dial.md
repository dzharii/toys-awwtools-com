# **Change Request Specification: Stable Tool Controls, Interactive Audio, Expanded Effect Collection, and Rotating Action Dial**

Proposed filename: `suggestions004-00-change-request-audio-effects-and-rotating-action-dial.md` | Revision 00 | November 14, 2026 | Status: Proposed | Applies to Anger Relief Toy v003

This specification supplements the existing project requirements. It is organized into three parts: a narrative explaining the intended experience and motivation, explicit software requirements describing the implementation, and a final set of questions requiring the implementing agent to critically review and improve its work.

The specification is based on the supplied v003 implementation, the four interface screenshots, and additional research into Web Audio, sound-effect resources, historical bookmarklets, and browser interaction constraints.

# **Part I. Product Narrative and Motivation**

## **A00. Making the Extension Feel Like a Real Collection of Playful Tools**

The project has reached a stage where its basic functionality is no longer the primary challenge. We already have a browser extension that allows people to select visual effects, aim them at elements on a webpage, and watch those elements react in entertaining ways. Users can punch a message, explode text, shatter content, and interact with the page through a collection of virtual tools.

The next objective is to make this experience more refined, more immersive, and considerably more satisfying to use.

We want the extension to feel like a small interactive game that exists on top of ordinary webpages. When someone selects a tool, they should feel as though they have equipped something. When they activate it, they should receive convincing visual and auditory feedback. When they want a different tool, they should be able to select one quickly and enjoyably, without navigating through repetitive menus.

The proposed changes address three related problems: the lack of visual stability in the equipped-tool interface, the absence of sound from otherwise expressive animations, and the difficulty of navigating a collection that will continue to grow.

We also want to validate the architecture by introducing a substantial new batch of carefully researched effects, rather than assuming that a modular design is successful merely because it supports the original eight tools.

### **A00.1. A Tool That Does Not Jump Around**

Imagine Andrew reading a discussion on Hacker News. He has selected Text Bomb, and a compact inventory bar appears at the bottom of the screen.

The bar displays a bomb icon, the name of the selected tool, and two buttons: Switch and Put away.

Andrew clicks a comment to place a bomb.

The effect starts, but at the same moment, the inventory bar changes. A new button, End effect, appears between the existing controls. The bar becomes wider, some elements shift horizontally, and the text changes.

Nothing catastrophic happens, but the interface looks as though it is rearranging itself in response to every action.

This is precisely the kind of small irritation we want to eliminate.

The inventory bar is supposed to represent something stable: the tool that the user currently holds. Its position and dimensions should not change merely because an animation starts or finishes.

We want to reserve the space needed for all relevant controls from the beginning. Before the user activates Text Bomb, the middle End effect button can remain visible but disabled. Once an effect starts, the button becomes available without changing the layout.

When the effect finishes, the button becomes disabled again. The inventory itself remains in place.

We also want to remove the small instructional text currently displayed beneath the selected tool's name.

For example, the message "Click an element. Tab targets; Enter uses." adds visual clutter to a component whose main responsibility is simply to communicate what the user has equipped.

The user already has a pointer, a selected tool, and a highlighted target. The interaction should be sufficiently understandable without a permanent instruction occupying space.

We therefore want to simplify the inventory so that it displays the tool icon, tool name, and essential controls. Nothing more is needed during ordinary use.

The current implementation also introduces a special keyboard flow for selecting page elements through Tab and invoking effects through Enter. We want to remove that custom target-selection mechanism from the normal interaction model. Applying effects to page elements should be a deliberate mouse interaction. This does not mean removing normal keyboard accessibility from the extension's menus, settings, and buttons; those controls must remain accessible.

The result should be a compact toolbar that remains visually stable throughout the interaction.

### **A00.2. The Missing Sound of Breaking Things**

Now consider Alice, who has selected Punch.

She clicks a particularly irritating comment. The comment shakes, deforms, and briefly displays an exaggerated impact.

The animation works, but something feels missing.

There is no sound.

A visual punch without an impact sound can feel strangely weightless. A shattering glass effect without the sound of cracking and scattering fragments may look impressive, but it lacks much of the sensory feedback that makes destruction satisfying in games.

We want to introduce carefully designed sound effects that complement the visual behavior of every tool.

When Alice punches a comment, she should hear a short, satisfying impact. Not an excessively loud explosion, not an irritating electronic beep, but a convincing cartoon-like thump with a clear attack and a brief decay.

When she shatters an element, the sound should resemble glass or a brittle material cracking, followed by a restrained scattering of fragments.

When she activates Text Bomb, the visual explosion should be accompanied by a suitably playful detonation and a brief shower of small debris-like sounds.

Some effects need different treatment. Flashlight does not require a repeated sound every time the mouse moves. A soft activation click or subtle electronic switch sound may be sufficient. A continuous simulated environment might justify a quiet, carefully controlled ambience, but only when the sound genuinely improves the experience.

The important principle is that sounds must communicate the action.

We are not trying to make every tool noisy. We are trying to make every tool feel more convincing.

The audio should be pleasant enough that users can activate effects repeatedly without becoming annoyed. Because the extension will often be used while reading articles, working, or participating in meetings, users must also have immediate control over sound volume and muting.

We want to build the audio system entirely around the Web Audio API. This gives us precise control over timing, volume envelopes, pitch, sound layering, and cleanup.

It also allows us to combine original procedural sounds with appropriately licensed, locally packaged sound samples.

Our objective is to create a coherent audio identity for the extension, not simply attach arbitrary sound files to existing animations.

### **A00.3. From a Fixed Wheel to a Rotating Dial**

The next challenge becomes obvious as the collection grows.

The current action wheel presents eight tools arranged around a central All tools control. This works reasonably well for a small collection, but the project is designed to support dozens, and eventually more than a hundred, independently implemented effects.

We cannot keep adding smaller and smaller segments to the wheel. At some point, the icons become unreadable, the labels overlap, and the interface loses the simplicity that made it appealing.

We also do not want users to return to a conventional list every time they want to try a tool that is not among the first eight.

Our proposed solution is to transform the action wheel into a **rotating action dial**.

The dial preserves the recognizable circular appearance of the existing interface. Several tools remain visible around its circumference, with their icons and names clearly displayed.

However, the circle is no longer static.

The user can grab the dial and rotate it clockwise or counterclockwise. As it turns, the visible tools move around the circumference. Tools that reach the boundary of the visible section pass beneath a stationary mechanical-looking separator, temporarily disappearing from view. At the other side of the separator, additional tools emerge, as though they have been carried into view by a larger mechanism hidden behind the interface.

The dial behaves like a continuous circular carousel.

If Andrew rotates it clockwise, he gradually encounters new tools. If he changes direction, he can return to the tools he just passed. If he keeps rotating, he eventually comes back to the beginning of the collection.

There is no abrupt last page, no disabled final arrow, and no requirement to reopen the full catalog.

The circular motion itself becomes part of the experience.

### **A00.4. A Mechanical Separator That Gives the Dial Depth**

The provided reference illustration introduces a specific detail that we want to develop further: a stationary, elongated mechanical element extending over part of the dial.

This element resembles a polished metal or brass handle, lever, or retaining arm mounted above the circular surface.

Its purpose is more interesting than decoration.

We want the separator to make the dial appear as though it passes underneath a physical object.

Imagine a circular tray containing illustrated tool cards. A stationary metal guide is mounted across a small section of its upper-left edge. As the tray rotates, each tool card approaches the guide, disappears beneath it, and emerges on the opposite side.

This creates the impression that the rotating dial has depth and that some parts of it are physically concealed by a stationary component.

To make the illusion convincing, the separator must have coherent visual layering. Its upper surface should catch light, its edges should show subtle highlights, and its underside should cast a soft shadow onto the rotating dial.

The shadow needs to move naturally relative to the rotating content. The separator itself remains stationary while the tools rotate underneath it.

A slight darkening around the entry and exit points can strengthen the illusion that the elements are disappearing beneath a physical cover.

We do not want to simply place a long decorative rectangle over the wheel. The separator should communicate that it is part of the mechanism.

Its exact design should be explored through multiple concepts before implementation. It may resemble a nautical wheel component, a mechanical retention arm, a brass pointer, or a stylized instrument panel. The final result should be elegant, coherent, and easy to understand.

### **A00.5. The Sound of Turning a Dial**

The dial also gives us an opportunity to introduce sound into the navigation experience itself.

Think of rotating the combination dial on an old safe, turning a precision mechanical selector, or moving a ratcheting control through distinct positions.

As the dial rotates, it produces small, satisfying clicks.

Tick. Tick. Tick.

Each click corresponds to a tool passing a defined angular position.

The sound should not fire continuously on every pointer-movement event. It should represent the mechanical progression of the dial, creating an understandable relationship between physical movement and auditory feedback.

Slow rotation produces deliberate, individually recognizable ticks.

Faster rotation produces a quicker sequence, but the sounds remain controlled, without becoming excessively loud or turning into an irritating stream of noise.

The dial should feel responsive to the user's hand.

Subtle visual movement, properly timed sound, and believable mechanical layering can transform navigation from a purely functional activity into an enjoyable part of using the extension.

### **A00.6. Bringing Back the Middle-Mouse Shortcut**

There is another interaction that was discussed in the previous change request but was not integrated into the released extension.

The user should be able to invoke the action dial by holding the middle mouse button for a short period.

Imagine Andrew reading a discussion while already using the extension.

Instead of reaching for the toolbar or remembering a keyboard shortcut, he presses and holds the middle mouse button over a suitable noninteractive area of the page.

A small circular progress indicator appears near the pointer.

As Andrew continues holding the button, the indicator gradually fills.

If he releases the button early, the indicator disappears and nothing else happens.

If he continues holding until the progress completes, the rotating action dial opens.

He can then select a different tool.

**This interaction is a stationary middle-button hold. The user must not be required to draw circles with the mouse.**

The earlier circular-motion prototype explored a related idea, but the intended interaction is now simpler: press, hold, observe progress, and open the dial.

This needs to become an actual product capability, not merely a disconnected experimental file.

We must also acknowledge that middle clicking already has browser functions, including autoscrolling and opening links in new tabs. The gesture therefore needs careful implementation and user control. It must not silently interfere with normal browsing or introduce new browser permissions without justification.

The desired result is a convenient alternative invocation method that feels natural when enabled and can be disabled when the user prefers ordinary mouse behavior.

### **A00.7. Expanding the Collection as an Architectural Test**

Finally, we want to add substantially more effects.

The extension currently contains eight implemented tools. This is enough to demonstrate the concept, but not enough to prove that the architecture will remain manageable as the collection grows.

We want to research approximately 20 additional candidates and implement a carefully selected batch of roughly 10 to 20 new effects, subject to the quality and security requirements.

These additions should not be trivial variations of existing effects.

We want to discover unusual, memorable browser interactions: a spider that crawls across the page and tears links away, a wrecking ball that appears to demolish interface elements, a miniature spaceship that shoots webpage content, a rolling ball that collects words, or a visual effect that turns part of the page into drifting particles.

Each new effect should receive individual attention.

The agent should investigate its historical source, understand the behavior, determine an appropriate modern implementation, create a recognizable icon, design a fitting sound, validate its lifecycle, test it against realistic webpages, and preserve the appropriate attribution.

The architecture should make each of these additions relatively straightforward, but that does not mean the effects themselves should be implemented mechanically or without artistic judgment.

A collection of 20 polished effects is more valuable than 20 rushed features that share the same generic animation and sound.

This expansion also provides an important test for the redesigned dial. As more tools are introduced, the user should be able to browse them naturally through rotation. The dial's circular navigation must scale without becoming visually crowded or computationally expensive.

The overall aim is to make the extension feel more complete.

The inventory becomes stable. The visual effects acquire expressive sound. The action wheel becomes a rotating, mechanically inspired dial. Tool invocation becomes more convenient. The catalog grows with genuinely interesting new interactions.

Most importantly, the user gains more opportunities to have fun with the web without becoming frustrated by the extension itself.

# **Part II. Software Requirements Specification**

## **B00. Scope, Authority, and Implementation Objectives**

### **B00.1. Specification authority**

This change request introduces four coordinated workstreams: inventory stability and simplification, a shared Web Audio sound system, expansion of the effects catalog, and replacement of the static action wheel with a rotating action dial.

The previously implemented specifications remain immutable. This change request shall be treated as a new specification, numbered `004`, at revision `00`.

The implementing agent SHALL read `AGENTS.md`, the initial main specification, the previous interaction-redesign specification, the mandatory post-feature acceptance questionnaire, and all applicable project documentation.

The agent shall preserve requirements that are not explicitly changed here.

Where the existing implementation conflicts with this specification, the new requirement takes precedence for the affected behavior.

### **B00.2. Evidence from version 003**

Inspection of the supplied source confirms the following current implementation characteristics.

The extension contains eight effects: Flashlight, Shatter, Gravity, Punch, Rubber, Screen Crack, Text Bomb, and Vortex.

The equipped-tool interface currently creates Switch, End effect, Put away, and Use tool controls. Their visibility changes depending on effect state, which contributes to the layout changes visible in the supplied screenshots.

The inventory also displays a status message whose contents change during targeting and execution.

The current target interaction supports custom Tab-based target cycling and Enter-based effect activation.

The effect SDK currently declares audio capability as disabled for the implemented effects. There is no established shared Web Audio runtime providing the requested sound design.

The source also contains an experimental circular mouse gesture implementation. However, this prototype is not integrated into production. It currently requires Shift plus the middle mouse button and deliberate circular movement.

**That prototype does not satisfy the new requirement for stationary middle-button hold activation.**

The existing action wheel is a fixed annular interface containing eight tool choices. It does not yet provide continuous circular browsing through a larger effect catalog.

These findings establish the technical starting point. They do not imply that the entire existing architecture needs to be replaced.

### **B00.3. Desired outcomes**

The inventory shall maintain stable dimensions and control placement during tool execution.

All existing and newly implemented effects shall receive an intentional sound design, using only the Web Audio API for playback and processing.

The project shall research at least 20 additional effect candidates and target the integration of 10–20 approved new effects, without reducing quality to meet a numerical target.

The action wheel shall become a rotating dial capable of browsing the complete available collection in either direction.

A stationary mechanical separator shall visually conceal and reveal tools as the dial rotates.

The middle-mouse hold gesture shall be implemented as an actual user-facing invocation method where supported, rather than left as an unintegrated experiment.

All changes shall preserve the modular effect architecture, extension security requirements, source attribution, and temporary nature of visual effects.

## **C00. Stable Equipped-Tool Interface**

### **C00.1. Fixed inventory dimensions**

The equipped-tool toolbar SHALL preserve a stable outer width and height throughout an ordinary tool session.

Starting, stopping, completing, or restarting an individual effect shall not resize the toolbar.

A change in effect state shall not cause its controls to jump horizontally or vertically.

The width shall accommodate the tool icon, tool name, and all three primary controls in their intended positions.

The implementation should use a stable layout with reserved control space rather than dynamically inserting and removing buttons.

The agent shall select dimensions that accommodate the existing tool names and reasonable future tool names.

For unusually long names, the layout may use truncation with an accessible full name instead of expanding unexpectedly.

The toolbar must remain responsive on smaller viewports.

### **C00.2. Exactly three primary controls**

The normal equipped-tool toolbar SHALL present three primary controls in this order:

**Switch | End effect | Put away**

These controls shall occupy consistent positions.

Switch opens the tool-selection interface.

End effect terminates the currently running visual-effect instance while preserving the equipped tool.

Put away terminates the current tool session, cleans up its resources, and removes the equipped state.

The label End effect may be shortened if necessary for the final visual design, provided the meaning remains unambiguous and its accessible name is preserved.

### **C00.3. Disabled middle control**

Before an effect is running, End effect shall be present but disabled.

It shall appear visually disabled while retaining its normal width.

When an effect starts, End effect becomes enabled without changing its position or the toolbar dimensions.

When the effect ends, the button returns to its disabled state.

The transition may use a subtle color or opacity change, but it must not cause layout movement.

The disabled state shall also be represented through the correct native or accessibility semantics.

A disabled button shall not trigger any action.

### **C00.4. Remove the visible status description**

Remove the permanent instructional text from the equipped-tool toolbar.

In particular, remove guidance such as "Click an element. Tab targets; Enter uses."

The normal toolbar shall display only the selected tool's icon, its name, and the three primary controls.

Runtime failures, unsupported targets, or other exceptional conditions may be communicated through temporary feedback when necessary.

However, these messages should not cause the toolbar to expand or shift.

A separate transient notification or appropriately designed non-displacing status treatment may be used.

### **C00.5. Remove custom keyboard targeting**

The custom Tab and Enter mechanism for selecting and invoking effects on arbitrary webpage elements SHALL be removed.

Specifically, the runtime shall no longer intercept Tab to cycle through webpage targets or Enter to activate the currently highlighted arbitrary page element.

Effect targeting shall be based on ordinary pointer interaction.

This change does not remove keyboard accessibility from the extension interface. The action dial, catalog, settings, inventory buttons, and other native controls shall continue to support appropriate keyboard navigation.

Normal Tab and Enter behavior on the underlying webpage must not be hijacked by the extension.

Where an accessible alternative to pointer-only targeting is necessary, the agent may propose a separate explicit target-selection control, but shall not restore the removed global keyboard interception.

### **C00.6. Preserve repeatable tools**

The inventory redesign must not compromise the persistent equipped-tool architecture introduced by the previous change request.

Punch and Text Bomb shall remain equipped after their individual animations complete.

The toolbar must not disappear merely because an animation finishes.

Continuous effects such as Flashlight shall remain active until deliberately terminated.

The End effect control and Put away control must retain their distinct meanings.

### **C00.7. Non-element effect activation**

Some tools act on the entire document or viewport rather than on a clicked element.

The implementation shall define how these tools can be activated or restarted while preserving the three-control toolbar.

The recommended behavior is to start document-level and viewport-level effects when they are equipped, and allow a deliberately stopped effect to be restarted by reselecting the tool through the action dial or another clearly documented interaction.

The runtime shall not introduce an additional button that causes the toolbar to resize.

The agent may refine this interaction if a more intuitive solution exists, provided the three-control layout remains stable.

### **C00.8. Required visual verification**

The agent shall capture screenshots of the same equipped tool before activation, during execution, and after completion.

The toolbar's outer bounding rectangle shall remain unchanged between these states under the same viewport conditions.

Control positions shall remain unchanged.

The visual difference should be limited to enabled or disabled control states and any intentionally designed, layout-independent feedback.

## **D00. Shared Web Audio System**

### **D00.1. Audio is a project-wide capability**

Audio shall become a standard capability of the extension rather than an independent implementation detail of each tool.

Every existing effect and every newly approved effect shall have an intentional audio profile.

An audio profile may contain a one-shot activation sound, an impact sound, a continuous ambience, movement-related sounds, a completion sound, or a combination of these.

Not every tool requires continuous audio.

However, every tool shall have an explicitly reviewed audio design, including the decision about when sound should and should not play.

### **D00.2. Web Audio API is the exclusive playback mechanism**

All runtime sound playback, processing, and synthesis SHALL use the browser's native Web Audio API.

Approved mechanisms include `AudioContext`, `AudioBuffer`, `AudioBufferSourceNode`, `OscillatorNode`, `GainNode`, `BiquadFilterNode`, `DynamicsCompressorNode`, `StereoPannerNode`, and other appropriate native Web Audio interfaces.

The implementation shall not introduce a third-party runtime audio engine.

Direct playback through HTML `<audio>` elements, external media players, Web MIDI output, remote audio services, or extension-specific text-to-speech APIs is outside the intended audio architecture.

Locally packaged audio samples may be decoded into `AudioBuffer` objects and played through Web Audio. This satisfies the Web Audio requirement.

MDN documents both sample-based playback and procedural synthesis through the API.&#x20;

[image](https://www.google.com/s2/favicons?domain=https://developer.mozilla.org\&sz=32)

MDN+2



### **D00.3. Samples and synthesis**

The agent shall consider two complementary approaches.

**Sample-based audio** uses short, appropriately licensed recordings or rendered sound effects. These are particularly useful for convincing material-specific effects such as breaking glass, mechanical impacts, footsteps, and falling debris.

**Procedural audio** synthesizes sound through oscillators, generated noise, filters, amplitude envelopes, and other Web Audio processing nodes. This is appropriate for short interface clicks, fictional electronic sounds, impacts, and lightweight interactive effects.

The final sound palette may combine both approaches.

For example, a Punch sound may combine a short low-frequency thump with a filtered noise transient.

A glass-breaking sound may combine a short recorded fracture with a quieter synthesized high-frequency scattering tail.

The agent shall select whichever approach produces the better result for each tool.

There is no requirement to synthesize sounds that are better represented by licensed samples.

### **D00.4. Central audio runtime**

The content runtime shall own a shared audio service responsible for creating and managing the audio context, loading or generating sounds, controlling volume, scheduling playback, and cleaning up active audio nodes.

Individual effects shall not each create an unrelated audio engine.

The shared service shall expose a stable interface through which an effect may request a named audio event.

An effect should describe the audio event to play and any relevant parameters rather than manage global audio resources directly.

Relevant parameters may include effect strength, normalized intensity, playback variation, optional position, and cancellation scope.

The system shall distinguish between audio associated with a particular effect invocation, audio associated with an equipped tool, and audio associated with the global extension interface.

This distinction is particularly important for the rotating dial, whose navigation sounds must not be terminated merely because a visual effect ends.

### **D00.5. Audio context lifecycle**

The audio context should be initialized lazily.

The extension shall not create an active audio context merely because a webpage has loaded.

Audio playback must follow the browser's user-activation restrictions.

The implementation shall initialize or resume audio from an appropriate user interaction and handle suspended or unavailable audio contexts gracefully.

MDN explicitly documents the need to create or resume Web Audio contexts in response to user gestures to satisfy browser autoplay policies.&#x20;

[image](https://www.google.com/s2/favicons?domain=https://developer.mozilla.org\&sz=32)

MDN



The agent shall verify these semantics in the actual extension content-script environment.

If audio is unavailable, the visual effect shall remain functional.

### **D00.6. Playback scheduling**

Audio events shall be synchronized with meaningful moments in visual animations.

The sound of a punch should coincide with the visual impact, not necessarily with the initial pointer click if the animation includes a wind-up.

A bomb should produce its detonation sound when the explosion occurs.

A shattering effect should produce its initial fracture sound when cracks appear, followed by appropriately timed fragment sounds if needed.

The implementation shall avoid relying on unrelated JavaScript timers when Web Audio scheduling provides more reliable timing.

`AudioContext.currentTime` and scheduled audio parameters should be used where appropriate.

### **D00.7. Shared audio buffers**

Decoded audio buffers may be cached for repeated playback.

Because an `AudioBufferSourceNode` is a one-shot playback source, repeated sounds shall create fresh source nodes that reuse the cached buffer.

This is the documented native usage pattern.&#x20;

[image](https://www.google.com/s2/favicons?domain=https://developer.mozilla.org\&sz=32)

MDN



Caching shall be bounded.

The audio service shall avoid decoding the same sample on every punch or every dial tick.

### **D00.8. Audio cancellation and cleanup**

Every active audio source shall have a defined owner and termination policy.

When an effect is stopped, its associated looping or ongoing sounds shall stop.

Short one-shot sounds may be allowed to finish naturally when that behavior is appropriate, but they must remain subject to global mute and master-volume controls.

Long-running sounds shall fade out appropriately to prevent abrupt audible clicks.

Putting away a tool shall not leave an unattended ambient loop running.

Closing the action dial shall stop any dial-specific continuous interaction sounds.

The runtime must not accumulate unreferenced audio contexts, active oscillators, or unmanaged processing nodes.

### **D00.9. No additional runtime dependencies**

The audio system shall use project-owned TypeScript and native browser APIs.

External tools may be used during development to audition, synthesize, or export sound assets.

Such tools must not become runtime dependencies of the shipped extension.

Any required sound files shall be processed and packaged locally.

No remote sound downloads shall occur when a user activates an effect.

### **D00.10. SDK integration**

The current SDK's audio capability declarations must be updated to reflect actual support.

The agent shall introduce a typed shared audio service and compatible effect metadata.

This work must preserve the existing modular architecture.

An effect shall not need to import the implementation of another effect to reuse an audio primitive.

The system shall support independent addition, removal, and replacement of audio profiles.

## **E00. Professional Sound Design, Source Research, and Audio Quality**

### **E00.1. Sound-design objective**

The objective is not simply to make the extension audible.

The objective is to make each interaction sound appropriate, satisfying, intentional, and pleasant.

The extension should resemble a polished game or interactive toy rather than a collection of unrelated system notification sounds.

Audio must complement the visual experience without dominating it.

A user should be able to punch several comments, rotate the dial repeatedly, or experiment with multiple tools without becoming irritated by the audio itself.

### **E00.2. Sound character**

The recommended overall audio direction is playful, tactile, and slightly exaggerated.

Impact sounds should have a convincing attack and controlled decay.

Glass and brittle-material sounds should communicate fracture without excessive harshness.

Mechanical interface sounds should be precise, short, and satisfying.

Electronic sounds may be used for fictional or magical tools, but generic beeps should not replace more appropriate sound design.

Ambient sounds should be subtle and should not distract from browsing.

### **E00.3. Mandatory sound-source research**

The following sources were identified as concrete starting points for the audio workstream.

These are research resources, not automatically approved assets. The agent must select and audition individual sounds and verify their terms before including them.

| Resource                                                                                    | Relevant material                                                   | Recommended use                                            |
| ------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- | ---------------------------------------------------------- |
| [Kenney Impact Sounds](https://kenney.nl/assets/impact-sounds?utm_source=chatgpt.com)       | 130 impact and foley sounds, CC0                                    | Punches, collisions, falling objects                       |
| [Kenney Interface Sounds](https://kenney.nl/assets/interface-sounds?utm_source=chatgpt.com) | 100 interface sounds, CC0                                           | Dial ticks, switching, selecting tools                     |
| [Kenney UI Audio](https://kenney.nl/assets/ui-audio?utm_source=chatgpt.com)                 | 50 UI sounds, CC0                                                   | Short confirmation and activation cues                     |
| [Kenney Sci-Fi Sounds](https://kenney.nl/assets/sci-fi-sounds?utm_source=chatgpt.com)       | 70 sounds, CC0                                                      | Lasers, electronic tools, fictional effects                |
| [ChipTone](https://sfbgames.itch.io/chiptone?utm_source=chatgpt.com)                        | Browser-based sound-effect generator; generated sounds licensed CC0 | Custom procedural game-like sound assets                   |
| [ZzFX](https://github.com/KilledByAPixel/ZzFX?utm_source=chatgpt.com)                       | Tiny parameterized JavaScript synthesizer, MIT licensed             | Technical reference for project-owned procedural synthesis |
| [Freesound](https://freesound.org/?utm_source=chatgpt.com)                                  | User-contributed recordings with per-file licenses                  | Glass, metal, debris, environmental sounds                 |
| [Sonniss Game Audio GDC](https://sonniss.com/gameaudiogdc/?utm_source=chatgpt.com)          | Professional sound libraries under a specific EULA                  | High-quality material sounds and layered effects           |

Kenney identifies the referenced collections as CC0. ChipTone states that sounds created with its tool are available under CC0. ZzFX is an MIT-licensed synthesis project, making it useful for researching lightweight sound generation.&#x20;

[image](https://www.google.com/s2/favicons?domain=https://kenney.nl\&sz=32)

Kenney+5



Freesound supports several licenses, including CC0, CC BY, and CC BY-NC, so its assets must be checked individually.&#x20;

[image](https://www.google.com/s2/favicons?domain=https://freesound.org\&sz=32)

Frequently Asked Questions



Sonniss permits use under its own license, with restrictions including limitations on standalone redistribution and AI training. Its current license must be reviewed before incorporating any recordings.&#x20;

[image](https://www.google.com/s2/favicons?domain=https://sonniss.com\&sz=32)

Sonniss



### **E00.4. Selection process for individual sounds**

The agent SHALL research multiple sound candidates for each effect.

As a target, investigate at least three plausible sound designs or sample candidates for important interactions, especially Punch, Shatter, Text Bomb, and the dial's mechanical tick.

The agent should not select the first available sound merely because it resembles the desired action.

Each candidate should be evaluated for timbre, attack, decay, frequency balance, loudness, duration, looping suitability, and compatibility with the project's overall audio identity.

The agent shall audition sounds in the context of their corresponding animations.

A sound that is impressive by itself may be inappropriate when heard repeatedly during ordinary browsing.

### **E00.5. Sound construction**

Where a single sample is insufficient, the agent may construct a layered sound.

For example, a Punch sound could contain a low-frequency body impact and a short high-frequency transient.

A shatter effect could contain a primary crack, a short cluster of smaller fragment sounds, and a quickly fading high-frequency tail.

A heavy collision might use a brief low-frequency component and a filtered debris sound.

Layers should be intentional and controlled.

More layers do not automatically produce better audio.

### **E00.6. Loudness and comfort**

The audio system shall provide a global volume control and immediate mute functionality.

The initial master-volume setting should be deliberately conservative.

Individual sounds shall be normalized relative to one another so that switching from a quiet tool to a louder one does not produce an unexpectedly large jump in perceived loudness.

The implementation should use gain envelopes and appropriate dynamic processing to prevent excessive peaks and audible clipping.

A shared `DynamicsCompressorNode` may be used as part of this protection, although compression alone does not replace proper sound normalization and conservative headroom.&#x20;

[image](https://www.google.com/s2/favicons?domain=https://developer.mozilla.org\&sz=32)

MDN



### **E00.7. Pleasantness and non-annoyance**

Every sound shall be evaluated for repeated-use comfort.

A sound is unacceptable if it becomes irritating after ordinary repeated interaction, even when it is technically accurate.

The agent shall evaluate whether the sound is too loud, too sharp, too long, too repetitive, or inconsistent with the visual behavior.

Particular attention must be paid to high-frequency sounds, glass fragments, electronic effects, and repeated mechanical ticks.

The absence of audio should always remain available through the global mute control.

### **E00.8. Sound variation**

Some repetitive effects may benefit from controlled variation.

For example, repeated punches might use slightly different pitch, intensity, or sample selection to avoid sounding identical.

However, variation must remain subtle enough to preserve the identity of the effect.

Randomization shall use bounded parameters.

The agent shall not introduce extreme pitch changes or unexpected loudness variation.

### **E00.9. Continuous sound policy**

Continuous effects may use ambient sound only when the ambience adds meaningful value.

Flashlight should normally use a short activation or switching sound, not an audible loop that follows every pointer movement.

A wind effect may justify a quiet continuous airflow.

A moving mechanical object may justify intermittent creaks or movement sounds.

Any continuous ambience shall have smooth fade-in and fade-out behavior, controlled volume, and a clear lifetime.

### **E00.10. Sound-design plan for existing effects**

| Existing effect | Recommended audio design                                              | Trigger and lifetime                      |
| --------------- | --------------------------------------------------------------------- | ----------------------------------------- |
| Punch           | Short cartoon impact with low-frequency body and restrained transient | Once per impact                           |
| Shatter         | Brittle crack followed by a brief cascade of small fragments          | At fracture and during initial scattering |
| Gravity         | Soft detachment cue followed by bounded object-collision sounds       | On activation and meaningful collisions   |
| Rubber          | Elastic stretch, squeak, or spring-like twang                         | On stretch and release                    |
| Screen Crack    | Sharp but controlled brittle crack                                    | On impact or each new fracture            |
| Text Bomb       | Playful bomb placement, delayed pop, and short text-debris scatter    | Placement and detonation                  |
| Vortex          | Quiet rising swirl or synthesized motion sound                        | While active, with smooth fade-out        |
| Flashlight      | Subtle physical or electronic switch click                            | On activation and deactivation            |

These descriptions establish the intended sound character.

The agent shall investigate and refine each profile rather than treat the table as a ready-made asset mapping.

### **E00.11. Rotating dial audio**

The rotating dial shall have its own sound profile.

Its primary sound shall resemble a refined mechanical detent, ratchet, or safe-dial tick.

The sound must be short, precise, and pleasant.

It shall be triggered when the dial crosses a meaningful angular selection boundary, not for every pointer movement.

The click must be synchronized with the dial's visible movement.

Slow rotation should produce separate, deliberate clicks.

Fast rotation should produce a controlled sequence, subject to a minimum interval or appropriate event coalescing so that the audio does not become a continuous harsh buzz.

A starting limit of approximately 12–18 distinct tick events per second is suggested, subject to listening tests.

The sound may vary subtly in pitch or intensity to avoid mechanical monotony.

A separate, slightly more substantial click may confirm that the dial has settled on a position or that a tool has been selected.

The tick sound shall not play when the user is not actually rotating the dial.

### **E00.12. Audio defaults and settings**

Sound shall be enabled after an appropriate user-initiated interaction, subject to browser playback policies.

The user shall have a persistent mute setting and a global volume setting.

The implementation should also allow navigation sounds to be disabled separately from effect sounds if this can be done without introducing unnecessary interface complexity.

Audio shall not play merely because the extension has been installed, a page has loaded, or the background service worker has started.

### **E00.13. Audio performance**

Audio must not introduce significant latency into the visual effects.

Frequently used sounds should be generated or decoded before they are needed where practical.

The implementation shall avoid creating a new `AudioContext` for every sound.

Short samples should be cached and reused appropriately.

Concurrent playback shall be bounded.

As an initial engineering target, the runtime may limit ordinary overlapping effect sounds to approximately eight active voices, with more restrictive limits for repeating navigation sounds.

These limits shall be refined through testing rather than treated as universal constants.

### **E00.14. Audio acceptance**

A sound is ready for integration only when its origin and licensing have been reviewed, its playback is correctly synchronized, its loudness is acceptable, its behavior is pleasant under repetition, its resource lifecycle is correct, and it works without introducing external runtime dependencies.

The agent SHALL preserve the sound-source record and applicable attribution.

## **F00. Research and Selection of 20 Additional Effects**

### **F00.1. Research objective**

The project shall expand beyond its initial eight effects by researching a collection of approximately 20 additional visual interactions.

The agent shall prioritize unusual, humorous, visually expressive, and genuinely entertaining behavior.

The purpose of this work is twofold.

First, users should receive a meaningfully larger collection of tools.

Second, the additional implementations should test whether the existing architecture can support continued expansion without accumulating special-case logic, unnecessary dependencies, or inconsistent user interactions.

**The objective is to identify at least 20 credible candidates and implement 10–20 qualified new effects, not to manufacture 20 superficial variations merely to meet a target.**

Every candidate shall pass the research, security, licensing, visual-quality, and architectural review requirements established in the initial specification.

### **F00.2. Research findings and source collections**

The following source collections and historical projects were identified as useful starting points.

| Source                                                                                                                                                     | Relevant discovery opportunity                                            |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| [Katamari Hack](https://github.com/remarkablemark/katamari-hack?utm_source=chatgpt.com)                                                                    | Historical DOM collection game                                            |
| [Web Crawler](https://github.com/fredfokan/web-crawler?utm_source=chatgpt.com)                                                                             | Animated spider that interacts with links                                 |
| [Web Pranks](https://github.com/steveja42/webpranks?utm_source=chatgpt.com)                                                                                | Wrecking ball, falling content, confetti, and arcade games                |
| [Burn the Web](https://github.com/JamesPBurke/burnit?utm_source=chatgpt.com)                                                                               | Canvas fire and page-dissolution effects                                  |
| [Disintegrate](https://github.com/ZachSaucier/Disintegrate?utm_source=chatgpt.com)                                                                         | DOM-to-particle visual transformations                                    |
| [Asteroids Bookmarklet](https://github.com/producthunt/asteroids?utm_source=chatgpt.com)                                                                   | Shooting and destroying page elements                                     |
| [DevBubba's Bookmarklets](https://devbubba.github.io/Bookmarklets/?utm_source=chatgpt.com)                                                                 | Image flight, glitches, cursor effects, snow, and unusual transformations |
| [Sick Set of Bookmarklets](https://github.com/python-bear/Sick-Set-Of-Bookmarklets?utm_source=chatgpt.com)                                                 | Historical and collected visual effects                                   |
| [Bookmarklet Collection](https://github.com/criminalpear/Bookmarklets?utm_source=chatgpt.com)                                                              | Matrix rain, playful overlays, and miniature games                        |
| [Cornify](https://www.cornify.com/extras?utm_source=chatgpt.com)                                                                                           | Historical playful rainbow and unicorn overlays                           |
| [Mozilla: The Bookmarklet That Shook the Web](https://hacks.mozilla.org/2014/02/html5-css3-and-the-bookmarklet-that-shook-the-web/?utm_source=chatgpt.com) | Technical background on the Harlem Shake webpage effect                   |

These sources document relevant effect concepts. Some provide directly accessible source code, while others are collections requiring further inspection. They have not all undergone a complete security or licensing audit for this change request.&#x20;

[image](https://www.google.com/s2/favicons?domain=https://github.com\&sz=32)

GitHub+6



### **F00.3. Initial candidate shortlist**

The following 20 candidates are recommended for detailed evaluation.

They are research leads, not automatically approved production features.

| ID  | Proposed effect        | Source                              | Distinctive interaction                                        |
| --- | ---------------------- | ----------------------------------- | -------------------------------------------------------------- |
| E01 | Katamari Collector     | Katamari Hack                       | Roll a ball across the page and collect visible content        |
| E02 | Web Spider             | Web Crawler                         | Animated spider crawls across content and tears away links     |
| E03 | Wrecking Ball          | Web Pranks                          | Swing a heavy ball into page elements                          |
| E04 | Burn the Page          | Burn the Web                        | Visually burn or char selected content                         |
| E05 | Asteroids Shooter      | Asteroids Bookmarklet               | Pilot a spacecraft and shoot webpage elements                  |
| E06 | Disintegrate           | Disintegrate                        | Turn elements into drifting particles or dust                  |
| E07 | Page Dance             | Harlem Shake bookmarklet            | Make webpage elements dance in an absurd coordinated animation |
| E08 | Celebration Cannon     | Web Pranks                          | Release balloons, confetti, and celebratory particles          |
| E09 | Space Invaders         | Web Pranks                          | Play a miniature arcade invasion using page content            |
| E10 | Flying Images          | DevBubba's Bookmarklets             | Make webpage images fly around the viewport                    |
| E11 | Three-Dimensional Page | DevBubba's Bookmarklets             | Transform flat content into a layered 3D illusion              |
| E12 | Television Glitch      | DevBubba's Bookmarklets             | Produce deliberate screen-static and glitch effects            |
| E13 | Mouse Sword            | DevBubba's Bookmarklets             | Turn the pointer into an animated fictional sword              |
| E14 | Color Splash           | DevBubba's Bookmarklets             | Apply playful bursts or drops of color to page regions         |
| E15 | Snowfall               | DevBubba's Bookmarklets             | Make snow fall across webpage content                          |
| E16 | Matrix Rain            | CriminalPear / DevBubba collections | Introduce falling digital-character rain                       |
| E17 | Page Jiggle            | Sick Set of Bookmarklets            | Make visible elements shake or wobble in an exaggerated manner |
| E18 | Reflective Fracture    | Sick Set of Bookmarklets            | Create a shard-like reflective distortion of the page          |
| E19 | Funky Focus            | Sick Set of Bookmarklets            | Make targeted or focused elements wiggle                       |
| E20 | Unicorn Invasion       | Cornify                             | Introduce whimsical illustrated creatures and rainbow effects  |

The first group prioritizes physical manipulation, destruction, autonomous behavior, and game-like interactions. The second group adds variety through visual transformations, playful environmental effects, and deliberate absurdity.

Some candidates are less closely aligned with the project's central destruction theme. They should receive lower priority unless their visual quality or originality justifies inclusion.

### **F00.4. Research status and qualification**

The shortlist is a starting point for implementation planning, not a claim that all 20 effects are equally valuable.

The agent SHALL investigate each candidate independently and determine whether it is sufficiently distinct from existing features.

For example, Disintegrate must provide something materially different from Text Bomb. Its intended distinction is that it transforms a complete selected visual surface into particles rather than scattering individual words.

Reflective Fracture must differ meaningfully from the existing Shatter tool.

Page Jiggle must offer a distinct interaction model compared with Rubber.

Asteroids Shooter and Space Invaders must be compared to determine whether both justify independent modules.

Likewise, Snowfall, Matrix Rain, and Unicorn Invasion must demonstrate enough visual and entertainment value to merit inclusion in a collection primarily focused on interacting with webpage content.

If any candidate fails the selection criteria, it shall be rejected or deferred and replaced through further research.

The agent shall not reduce the acceptance threshold simply to implement the exact names listed here.

### **F00.5. Research coverage beyond the shortlist**

The agent SHALL continue investigating related sources and historical implementations.

The listed collections may contain additional relevant effects, such as image manipulation, cursor trails, unusual physics, distortions, miniature games, and environmental simulations.

The agent should examine author references, historical discussions, repository forks, and comparable implementations.

The objective is to identify the strongest available concepts, not merely the easiest implementations.

### **F00.6. Source security**

No original third-party bookmarklet shall be executed on the development workstation.

Original source must first undergo static analysis.

If dynamic analysis is necessary, it shall occur only in the approved disposable, isolated research environment.

The agent shall not run unknown bookmarklets in a normal Playwright browser merely because browser automation is available.

The final extension shall contain reviewed, project-controlled implementations and approved locally packaged assets.

These requirements apply without exception to all 20 candidates.

## **G00. Individual Implementation Planning for Every New Effect**

### **G00.1. One independently considered implementation at a time**

Adding a large batch of effects SHALL NOT become a single undifferentiated code-generation exercise.

Each effect must receive an individual implementation plan.

The agent shall explicitly consider its target interaction, animation mechanics, visual assets, icon, sound profile, source attribution, performance costs, cleanup behavior, compatibility, and tests before implementation.

The following plans provide the initial design direction for the 20 shortlisted candidates.

### **G00.2. E01: Katamari Collector**

The effect should introduce a rolling ball that moves across the visible page and appears to collect words, images, or other eligible content.

Collected elements should become attached to the ball's visual representation, creating the illusion that the ball grows as it moves.

The implementation should use temporary visual representations wherever practical, avoiding destructive manipulation of the original page.

The ball requires a distinctive illustrated icon, such as a colorful sphere collecting small objects.

Audio should include light rolling sounds and subtle collection ticks, with the sound intensity reflecting the amount of collected material without becoming repetitive.

The main engineering challenges are collision detection, bounded object counts, visual layering, and performance on complex webpages.

The historical project documents CSS transforms, Canvas rendering, and a spatial grid for identifying nearby elements. These techniques may inform a new project-controlled implementation.&#x20;

[image](https://www.google.com/s2/favicons?domain=https://github.com\&sz=32)

GitHub



### **G00.3. E02: Web Spider**

The effect should introduce a small animated spider that walks across the page, interacting with links and selected visible elements.

The spider should appear to grab or pull on webpage content, creating short visual distortions or detachable representations of those elements.

Its movement should feel organic rather than like a static image following the cursor.

The icon should represent a recognizable stylized spider.

Audio may include very quiet footsteps, occasional silk-like plucks, or subtle interaction sounds. A continuous buzzing or clicking loop would likely become irritating and should be avoided.

The main engineering concerns are autonomous navigation, target selection, animation synchronization, and keeping the underlying page usable.

The referenced project provides a documented example of inverse-kinematics leg animation and link interactions.&#x20;

[image](https://www.google.com/s2/favicons?domain=https://github.com\&sz=32)

GitHub



### **G00.4. E03: Wrecking Ball**

The user should be able to swing a virtual wrecking ball into selected webpage elements.

The visual effect should communicate weight and momentum, with a convincing pendulum-like movement and an impact response.

The implementation may use a simplified physics simulation or a carefully designed deterministic animation.

The icon should clearly represent a heavy ball suspended from a chain.

Audio should contain a brief mechanical movement sound followed by a substantial but controlled impact.

The agent shall ensure that multiple impacts do not create unbounded debris or permanent page mutations.

This concept is documented in the Web Pranks project.&#x20;

[image](https://www.google.com/s2/favicons?domain=https://github.com\&sz=32)

GitHub



### **G00.5. E04: Burn the Page**

The effect should create the illusion that a selected element or region is burning.

Flames, embers, smoke, darkening, and progressive dissolution may be used to communicate the effect.

The user should be able to identify what is being affected and stop the simulation.

The icon should represent a stylized flame or burning surface.

Audio may include a short ignition cue, restrained crackling, and a fade-out as the effect ends.

Continuous crackling must be sufficiently quiet and varied to avoid becoming irritating.

The Burn the Web project provides a relevant Canvas-based fire and dissolution reference.&#x20;

[image](https://www.google.com/s2/favicons?domain=https://github.com\&sz=32)

JamesPBurke/burnit · GitHub



### **G00.6. E05: Asteroids Shooter**

The effect should introduce a miniature spacecraft that the user can steer around the page.

The user should be able to fire harmless projectiles at eligible webpage elements.

Successful hits should produce recognizable visual destruction, fragmentation, or temporary disappearance.

The icon should represent a compact spacecraft or arcade-style rocket.

Audio should include short electronic firing sounds, impact effects, and restrained movement feedback.

The agent shall prevent gameplay controls from accidentally activating unrelated webpage functionality.

The historical Asteroids bookmarklet provides the central gameplay reference.&#x20;

[image](https://www.google.com/s2/favicons?domain=https://github.com\&sz=32)

GitHub



### **G00.7. E06: Disintegrate**

The effect should transform a selected element into a cloud of small visual particles that drift, scatter, or dissolve.

Unlike Text Bomb, it should operate on the appearance of the selected element as a surface rather than merely on individual words.

The implementation should consider how to represent images, text, and styled containers without capturing sensitive or inaccessible content.

The icon might depict a square dissolving into small particles.

Audio should use a short granular break-up or dust-like scattering sound.

Particle counts, animation duration, and memory allocation must be bounded.

The Disintegrate project documents a related Canvas-particle approach, including limitations associated with DOM rasterization.&#x20;

[image](https://www.google.com/s2/favicons?domain=https://github.com\&sz=32)

GitHub



### **G00.8. E07: Page Dance**

The effect should make selected or visible page elements perform an exaggerated coordinated dance.

Elements may rotate, bounce, wobble, and move in deliberately absurd patterns.

The icon should communicate dancing or rhythmic movement without depending on a specific copyrighted character.

Audio should use an original short rhythmic cue or project-created sequence.

The implementation must not copy or embed commercially released music associated with the historical meme without appropriate rights.

The historical Harlem Shake bookmarklet provides inspiration for transforming arbitrary webpage elements into participants in a coordinated animation.&#x20;

[image](https://www.google.com/s2/favicons?domain=https://hacks.mozilla.org\&sz=32)

the Web developer blog



### **G00.9. E08: Celebration Cannon**

The user should be able to trigger an explosion of colorful celebratory particles, ribbons, confetti, or balloons.

The interaction should be visually cheerful and immediately recognizable.

The icon may depict a party popper or small confetti cannon.

Audio should include a soft celebratory pop followed by a light scattering effect.

The agent should prevent the effect from becoming an uncontrolled particle generator.

The Web Pranks collection includes a Happy Birthday effect that provides a relevant behavioral reference.&#x20;

[image](https://www.google.com/s2/favicons?domain=https://github.com\&sz=32)

GitHub



### **G00.10. E09: Space Invaders**

The effect should temporarily turn part of the webpage into an arcade-inspired invasion environment.

The player may control a small vehicle or defensive object while animated enemies appear over the page.

The interface should remain visually separate from the website's persistent state.

The icon should represent an original stylized arcade invader.

Audio may include brief electronic firing and collision sounds.

The agent shall compare this concept against Asteroids Shooter before approving both.

If their interaction and user experience are not sufficiently distinct, one should be deferred.

The Web Pranks project documents a related BTC Invaders effect.&#x20;

[image](https://www.google.com/s2/favicons?domain=https://github.com\&sz=32)

GitHub



### **G00.11. E10: Flying Images**

Images on the page should appear to detach and move across the viewport.

The motion may involve floating, drifting, bouncing, or controlled flight.

The icon should represent a picture frame with wings or another recognizable visual metaphor.

Audio should emphasize occasional movement or collision events rather than continuously producing sound for every moving image.

The main engineering risks are image cloning, layout restoration, cross-origin resource handling, and excessive allocations on image-heavy pages.

DevBubba's collection documents Image Fly as a relevant starting point.&#x20;

[image](https://www.google.com/s2/favicons?domain=https://devbubba.github.io\&sz=32)

DevBubba



### **G00.12. E11: Three-Dimensional Page**

The effect should make flat webpage elements appear to occupy different depths.

The user may be able to adjust perspective or interact with a layered representation of the page.

The icon could represent stacked planes or a perspective cube.

Audio should use a subtle activation cue and restrained movement sounds, rather than a continuous electronic hum.

The implementation should prefer CSS perspective and transforms when they can provide the intended effect efficiently.

The result must remain reversible and should not interfere with ordinary website navigation after termination.

DevBubba's 3D Webpage effect provides a relevant behavioral reference.&#x20;

[image](https://www.google.com/s2/favicons?domain=https://devbubba.github.io\&sz=32)

DevBubba



### **G00.13. E12: Television Glitch**

The effect should temporarily make the page appear to experience a television or digital-display malfunction.

Possible visual elements include localized distortion, chromatic displacement, static, scanlines, and brief image fragmentation.

The icon should represent a small display with a recognizable interference pattern.

Audio should include a short, restrained electronic glitch or burst of filtered static.

Loud, harsh, continuous static is prohibited.

The agent shall also consider accessibility and avoid high-frequency flashes or uncontrolled strobing.

DevBubba's Glitch effect provides a source reference.&#x20;

[image](https://www.google.com/s2/favicons?domain=https://devbubba.github.io\&sz=32)

DevBubba



### **G00.14. E13: Mouse Sword**

The pointer should become associated with a stylized fictional sword or blade.

The user may perform deliberate swipe gestures that create harmless visual cuts, trails, or temporary splits in selected elements.

The icon should represent a recognizable illustrated sword.

Audio should include a short movement whoosh and a distinct impact sound when the effect interacts with a target.

The implementation must distinguish intentional sword gestures from ordinary pointer movement.

It shall not intercept unrelated webpage clicks unnecessarily.

DevBubba's Mouse Sword provides the initial research lead.&#x20;

[image](https://www.google.com/s2/favicons?domain=https://devbubba.github.io\&sz=32)

DevBubba



### **G00.15. E14: Color Splash**

The user should be able to apply bursts, drops, or splashes of color to visible page regions.

The result should feel playful and expressive rather than like an ordinary color-picker utility.

The icon may resemble a paint droplet or splashing paint container.

Audio should include a soft pop, splat, or liquid-like impact that corresponds to the visual action.

The agent should consider multiple color effects and whether color changes remain visible until explicitly cleared.

The underlying website content and state must remain unaffected.

DevBubba's Color Drop is a relevant starting point.&#x20;

[image](https://www.google.com/s2/favicons?domain=https://devbubba.github.io\&sz=32)

DevBubba



### **G00.16. E15: Snowfall**

The effect should introduce animated snow that falls across the page.

Snowflakes may drift in response to simulated wind and accumulate visually only within controlled temporary rendering layers.

The icon should depict a recognizable snowflake.

Audio may include a gentle activation cue. Continuous ambience is optional and should be included only if it improves the experience without distracting from browsing.

The implementation should be lightweight enough for extended use.

DevBubba's Let It Snow provides a documented concept reference.&#x20;

[image](https://www.google.com/s2/favicons?domain=https://devbubba.github.io\&sz=32)

DevBubba



### **G00.17. E16: Matrix Rain**

The effect should introduce vertically falling streams of fictional digital characters.

The effect may appear over the existing webpage or temporarily transform the visible viewport into a stylized digital environment.

The icon should depict falling character columns.

Audio might use a short electronic activation sound, with any ambient texture kept extremely subtle.

The implementation must avoid excessive Canvas rendering work and unintended flashing.

Both CriminalPear's and DevBubba's collections document Matrix-style visual effects.&#x20;

[image](https://www.google.com/s2/favicons?domain=https://github.com\&sz=32)

GitHub+1



### **G00.18. E17: Page Jiggle**

The effect should make visible page elements shake, wobble, or move unpredictably in a controlled pattern.

The animation should communicate exaggerated instability without creating a confusing permanent layout change.

The icon might depict a wobbling rectangle.

Audio may include a short mechanical rattle or elastic movement sound.

The agent must compare the effect against Rubber and other existing deformation tools.

The distinction should involve its scope, animation character, and interaction model.

The Sick Set of Bookmarklets collection documents a Jiggle effect.&#x20;

[image](https://www.google.com/s2/favicons?domain=https://github.com\&sz=32)

GitHub



### **G00.19. E18: Reflective Fracture**

The effect should create a temporary visual illusion in which portions of the page become reflective shards or angled fragments.

Unlike ordinary Shatter, this effect should emphasize reflection, refracted geometry, and altered perspective rather than physical destruction alone.

The icon should communicate a reflective crystalline surface.

Audio may include a short crystalline shimmer combined with restrained brittle movement sounds.

The implementation shall be reviewed for overlap with the existing Shatter and Screen Crack tools.

The Refralect effect in Sick Set of Bookmarklets provides a research reference.&#x20;

[image](https://www.google.com/s2/favicons?domain=https://github.com\&sz=32)

GitHub



### **G00.20. E19: Funky Focus**

The user should be able to make a selected element wobble or respond with an exaggerated localized motion.

The experience should differ from a general full-page shake by emphasizing a specific target.

The icon might represent a tilted or bouncing object.

Audio should provide a short, playful wobble or spring sound.

The animation should remain sufficiently distinctive to justify a separate tool rather than becoming a configuration option of Rubber.

The Sick Set of Bookmarklets collection documents Funky Focus as an effect that makes a focused object wiggle.&#x20;

[image](https://www.google.com/s2/favicons?domain=https://github.com\&sz=32)

GitHub



### **G00.21. E20: Unicorn Invasion**

The effect should introduce original whimsical illustrated creatures, rainbow trails, or other deliberately absurd elements across the page.

The user may be able to summon additional creatures or direct their placement.

The icon should depict an original cartoon creature or rainbow.

Audio might include a short magical chime, whimsical pop, or similarly playful effect.

The implementation must not automatically copy Cornify's copyrighted artwork or remotely hosted assets.

The final visual assets should be independently created or appropriately licensed.

Cornify provides the historical concept reference.&#x20;

[image](https://www.google.com/s2/favicons?domain=https://www.cornify.com\&sz=32)

Cornify



### **G00.22. Per-effect implementation procedure**

Every approved candidate shall follow the same integration procedure.

The agent shall first establish provenance, intended behavior, and licensing.

It shall then write an effect-specific implementation plan explaining how the visual behavior will be reconstructed using approved browser APIs and project-controlled code.

Next, it shall create or select the effect's visual identity, including its icon and any necessary illustration assets.

It shall design and audition the effect's audio profile.

The effect shall then be implemented through the existing SDK and registry mechanism.

After implementation, the agent shall test targeting, animation, repeated use, termination, resource cleanup, sound synchronization, performance, and visual quality.

Finally, the feature shall receive the required attribution and independent review before integration.

**The agent shall complete this review independently for every effect. Approval of one effect does not constitute approval of another.**

### **G00.23. Batch integration strategy**

The agent should integrate new effects in small, independently reviewable groups.

The first group should prioritize the strongest and most distinctive physical interactions.

Katamari Collector, Web Spider, Wrecking Ball, Burn the Page, and Disintegrate are promising initial candidates, subject to their technical and legal evaluations.

Additional categories may then be introduced to test whether the architecture accommodates different kinds of interactions.

The rotating dial shall be tested with a larger registry during development, even before every new effect is complete.

Unimplemented candidates must not appear as functional tools in production builds.

### **G00.24. Definition of successful expansion**

The expansion is successful when new effects can be researched, implemented, registered, loaded, activated, tested, and removed without requiring unrelated changes to the core extension.

If integrating the new batch reveals repeated special-case code or unstable interfaces, the agent shall investigate and refactor the shared architecture before continuing at scale.

The final integrated count shall be reported honestly.

A smaller group of thoroughly reviewed, polished effects is preferable to a larger group that compromises the project's quality standards.

## **H00. Rotating Action Dial: Navigation and Interaction Requirements**

### **H00.1. Replace the fixed wheel with a continuous dial**

The existing action wheel SHALL be redesigned as a continuously navigable rotating dial.

The new interface shall preserve the circular selection metaphor while enabling users to browse a catalog substantially larger than the number of tools visible at one time.

Users shall be able to rotate the dial clockwise and counterclockwise.

The dial shall reveal additional tools as it rotates.

After the final tool in the collection, rotation shall continue naturally to the beginning.

The user shall not encounter a terminal position requiring a separate reset or page-navigation action.

### **H00.2. Visible tool capacity**

The dial should display approximately eight tool positions at a time.

This number may be refined based on the final geometry, icon dimensions, and readability.

The number of simultaneously visible tools shall remain bounded as the collection grows.

Adding more effects shall not require reducing all icon and label sizes to accommodate the entire collection within one rotation.

The dial should use the complete effect registry as its source of available tools.

Disabled, experimental, or unapproved effects shall not appear as selectable production tools.

### **H00.3. Initial appearance**

When the dial opens, it should retain the overall visual identity established by the previous redesign.

It shall have a circular body, recognizable sectors or tool positions, clear icons, readable names, and a central All tools action.

The dial must not appear as a generic rectangular list wrapped into a circle.

The revised design should communicate that its circumference can be physically rotated.

Possible visual cues include a subtle rim, radial construction, small mechanical notches, and the stationary separator described in I00.

### **H00.4. Pointer-based rotation**

The user shall be able to press and drag an appropriate part of the rotating dial.

Dragging clockwise shall cause clockwise rotation.

Dragging counterclockwise shall cause counterclockwise rotation.

The interface shall calculate angular movement relative to the dial's center.

The rotation must respond smoothly to pointer movement.

The agent shall avoid implementations that simply interpret horizontal dragging as a fixed number of next or previous actions without preserving the circular interaction.

The rotation should feel connected to the user's gesture.

### **H00.5. Distinguish dragging from clicking**

The interface must distinguish between selecting a tool and beginning a drag.

A normal click or pointer release without meaningful movement should activate the selected tool.

A deliberate drag should rotate the dial.

The agent shall establish a small movement threshold to distinguish these interactions.

The threshold must be sufficient to prevent accidental rotation during normal clicking.

Conversely, rotating the dial must not accidentally select a tool when the user releases the pointer.

### **H00.6. Continuous rotation**

The dial's logical rotation shall not be limited to one full revolution.

The user may rotate through any number of complete turns in either direction.

The interface shall maintain the correct logical catalog position throughout this interaction.

The implementation must avoid numerical overflow or unstable calculations after repeated rotation.

A normalized angular offset and modular indexing strategy are recommended.

### **H00.7. Tool indexing**

Tool positions shall be derived from an ordered registry rather than hard-coded individually.

If the registry contains 28 tools and the dial displays eight at a time, rotating the dial shall progressively reveal the remaining tools.

After all 28 tools have been encountered, subsequent rotation shall reveal the first tools again.

Reverse rotation shall reveal the same sequence in the opposite order.

The order must remain deterministic during one interaction session.

Changes to favorites or recent-tool metadata shall not unexpectedly reorder the dial while the user is actively dragging it.

### **H00.8. Continuous catalog illusion**

A significant design challenge is that a conventional circular wheel with eight sectors cannot physically display 28 independently positioned items at once.

The agent shall solve this by separating the logical catalog from the visible rotating positions.

As a tool passes beneath the stationary separator, its visible representation may be recycled or replaced with the next logical catalog entry while concealed.

The user should perceive one continuous rotating collection rather than a sequence of visibly re-rendered pages.

The replacement must occur only while the affected position is sufficiently occluded.

A user must never see an icon suddenly change into an unrelated icon in the middle of an unobstructed visible sector.

### **H00.9. Tool selection**

The user shall be able to select any currently visible tool.

Selecting a tool shall equip it through the existing runtime mechanism.

The selected tool's icon and metadata shall correspond to the correct catalog entry, regardless of how many times the dial has rotated.

Selecting an item must not accidentally choose the tool that previously occupied that visual position.

The selection mechanism shall be derived from the logical catalog identity rather than an unstable DOM position.

### **H00.10. Selected tool feedback**

When a tool is selected or hovered, its corresponding visual position shall provide clear feedback.

This may include highlighting the segment, slightly emphasizing the icon, changing its background, or displaying its name more prominently.

The currently equipped tool should remain identifiable when it is visible in the dial.

If the equipped tool is outside the visible portion of the catalog, the center or another unobtrusive location may continue to identify the current equipment.

The agent should avoid duplicating the entire inventory bar inside the wheel.

### **H00.11. Snapping and detents**

The rotating dial should settle into recognizable positions.

A mechanical detent model is recommended.

For example, each visible tool position may correspond to an angular interval. When the user stops dragging, the dial can smoothly settle to the nearest stable position.

This behavior should resemble the satisfying alignment of a physical selector.

The settling animation must be short and controlled.

Excessive inertia, long spinning animations, or unpredictable stopping positions are not desirable.

### **H00.12. Optional momentum**

A restrained amount of momentum may improve the physical feel of the dial.

However, it shall not cause the dial to spin uncontrollably after release.

The agent shall compare an immediate snap-to-position model against a model with limited angular momentum.

The selected behavior must prioritize accurate selection and comfortable navigation.

If momentum makes the interface harder to control, it should be removed.

### **H00.13. Keyboard navigation**

Although custom Tab and Enter targeting of webpage elements is being removed, the action dial itself must remain keyboard-accessible.

Users should be able to focus tool choices, navigate through them using appropriate controls, and activate a selected tool.

Arrow keys may rotate or advance the selection through the ordered catalog.

The behavior must remain predictable when the number of available tools exceeds the visible capacity.

The dial's keyboard interaction must not require physically dragging the pointer.

### **H00.14. Scroll-wheel interaction**

The agent may investigate whether scrolling over the dial is a useful additional way to rotate it.

If implemented, this behavior shall apply only while the pointer is over the active dial surface.

It shall not interfere with ordinary webpage scrolling outside the dial.

Wheel input must not cause simultaneous page scrolling and dial rotation.

This interaction is secondary to pointer dragging and keyboard navigation.

### **H00.15. All tools control**

The central All tools action shall remain available.

It should open the existing searchable catalog.

The catalog continues to serve an important purpose: direct access to specific tools, text search, category filtering, favorites, and browsing by name.

The rotating dial and the full catalog are complementary interfaces.

The dial provides playful, sequential discovery.

The catalog provides efficient searching and direct selection.

### **H00.16. Large catalog behavior**

The dial shall remain efficient as the catalog grows to 100 or more effects.

It must not create a complete interactive DOM tree for every catalog entry when only a small subset is visible.

The rendering implementation should use a bounded number of visual slots, backed by the logical registry.

Metadata should be inexpensive to load.

Effect implementation modules shall remain lazy-loaded and must not be activated or downloaded into the content runtime merely because their icons pass through the dial.

### **H00.17. Performance and cleanup**

Rotation should use browser rendering techniques appropriate for smooth animation.

CSS transforms, composited layers, and carefully managed transitions are preferred where practical.

Rotation must not trigger repeated expensive whole-page layout measurements.

Closing the dial shall terminate its drag handlers, timers, animation frames, and audio events.

Opening and closing the dial repeatedly must not accumulate resources.

## **I00. Mechanical Separator, Occlusion, Shadows, and Visual Depth**

### **I00.1. Design objective**

The reference illustration shows a long, narrow, metallic object placed over the upper-left region of the action wheel.

This feature shall be developed into a deliberate stationary mechanical separator that makes the rotating dial appear to move beneath a fixed physical component.

The separator is a central part of the new visual design.

It is not merely a decorative line or an arbitrary overlay.

### **I00.2. Geometric placement**

The separator should occupy a small, clearly defined section of the dial near its upper-left region.

The reference suggests a long, slightly diagonal handle extending inward from outside the circular rim.

Its position may be refined to accommodate the final dial geometry.

The separator should be visually connected to the dial's stationary frame.

It should appear mounted above the rotating surface rather than floating independently over the webpage.

Its dimensions must be sufficient to establish the occlusion effect without covering an excessive number of tools.

### **I00.3. Physical appearance**

The separator may use a polished metal, brushed brass, painted mechanical, or similarly coherent material treatment.

A suggested appearance includes a slightly rounded upper surface, darker side edges, a narrow highlight following the upper-facing contour, and a subtle gradient suggesting curved material.

The shape should have thickness.

It should not resemble a flat CSS rectangle.

A small mounting point, fastening detail, or base may help establish that the component is physically attached to the stationary structure.

Decorative detail should remain restrained.

### **I00.4. Depth hierarchy**

The visual stacking order shall establish a believable relationship between the webpage, dial, moving items, separator, and controls.

The rotating surface and its items belong beneath the separator.

The separator itself belongs above the rotating surface.

Its shadow should fall onto the surface beneath it.

The user should perceive the separator as a physical obstruction through which the rotating collection passes.

This depth relationship must remain correct during rotation.

### **I00.5. Occlusion behavior**

As a tool approaches the separator, its icon, label, and associated visual representation shall gradually become concealed by the separator's occlusion region.

The content must not simply fade out arbitrarily in the middle of the visible dial.

The disappearance should correspond to crossing an actual visual boundary.

When the logical catalog position advances, the next tool should emerge on the opposite side of the occlusion region.

The process shall work in both rotation directions.

Clockwise and counterclockwise movement must produce consistent entry and exit behavior.

### **I00.6. Masking**

The implementation may use clipping, masking, or carefully structured rendering layers to achieve the concealment.

The mask shall align with the visible separator geometry.

The concealed region must be large enough to hide any necessary catalog-entry replacement.

An item shall never be replaced while a visible portion of its icon or label remains exposed in a manner that produces an obvious discontinuity.

The agent shall test the mask during both slow and rapid rotation.

### **I00.7. Shadows**

Shadows are essential to the intended illusion.

The separator should cast a soft, directional shadow onto the rotating dial.

The shadow should be strongest near the separator's contact or overlap region and soften with distance.

The shadow must not become detached from the separator during rotation.

Because the separator is stationary, its primary shadow should remain stationary relative to the dial's frame while the contents move beneath it.

The agent shall avoid excessive darkening or dramatic shadows that make labels difficult to read.

### **I00.8. Highlights and material continuity**

The separator's highlights should remain consistent with the apparent lighting of the rest of the dial.

If the dial uses soft upper-left illumination, the separator should not appear lit from an unrelated direction.

Rim highlights, surface gradients, and small material reflections should form a coherent composition.

The objective is believable visual depth, not photorealism.

### **I00.9. Transition under the separator**

When an item moves beneath the separator, it may become slightly darker as it enters the occluded region.

A very subtle shadow interaction can improve the impression of depth.

However, the item should not arbitrarily shrink, blur, or fade unless those treatments are consistent with the selected design.

The agent shall explore the illusion using mockups or functional prototypes before finalizing the implementation.

### **I00.10. Stationary and moving components**

The separator shall remain stationary while the dial rotates.

Its geometry and position should not rotate with the tools.

The dial's central All tools action may also remain stationary if that produces the clearest interaction.

Tool icons and names should remain readable as the dial rotates.

The recommended approach is to move tool positions around the circumference while maintaining upright icon and label orientation, rather than rotating every label upside down.

### **I00.11. Consistency across viewport sizes**

The separator must remain correctly aligned when the dial changes size.

Its attachment point, shadow, mask, and visible geometry should scale coherently.

The agent shall not rely on fixed pixel coordinates that happen to work for one screenshot but fail at another viewport size.

### **I00.12. Avoiding accidental interaction obstruction**

The separator may cover part of the dial visually, but it must not create large invisible hit areas that prevent users from selecting nearby visible tools.

Any area concealed by the separator should be treated consistently for hit testing.

The agent shall verify that visible controls remain clickable and that dragging does not become unpredictable near the separator.

### **I00.13. Visual exploration**

Before selecting the final separator design, the agent shall investigate multiple treatments.

At minimum, compare a restrained metallic arm, a nautical or instrument-inspired retaining piece, and a more stylized mechanical cover.

Text-to-image generation or purpose-built visual prototypes may be used during development.

The final specification and implementation record must describe the selected geometry, layering, masking, and shadow behavior in words, so future agents can reproduce and maintain the design.

### **I00.14. Final visual standard**

The resulting dial should not look as though a decorative handle was simply pasted over a static menu.

It should look as though the wheel contains a moving circular mechanism, with tools passing beneath a stationary component and emerging naturally as the user rotates the dial.

The separator must contribute to the interaction, not merely to decoration.

## **J00. Middle-Mouse Hold Gesture: Required Implementation**

### **J00.1. Correct the previously omitted functionality**

The previous change request described an alternative way to invoke the action wheel through mouse interaction.

The supplied v003 implementation contains an experimental gesture prototype, but it is not connected to the production interface.

This work remains incomplete.

**The agent SHALL implement an actual user-accessible middle-mouse hold mechanism for opening the rotating action dial.**

A standalone prototype, unused utility, or documented future intention does not satisfy this requirement.

### **J00.2. Clarified gesture definition**

The intended behavior is a stationary hold.

The user presses the middle mouse button and continues holding it.

A small circular progress indicator appears near the pointer.

The indicator gradually fills while the button remains pressed.

If the user releases the button before completion, the indicator disappears and the dial does not open.

If the user continues holding until the progress completes, the action dial opens.

The user shall not need to move the pointer in a circle.

The user shall not need to hold Shift.

The previous Shift-plus-middle circular-motion prototype may be retained for reference or removed if no longer useful, but it shall not be mistaken for the required interaction.

### **J00.3. Progress duration**

The initial activation duration should be approximately 1.5–2 seconds.

The agent may refine this through actual interaction testing.

The duration must be long enough to distinguish deliberate activation from an ordinary middle click.

It must not be so long that the shortcut becomes inconvenient.

The user may be offered a small range of activation-delay settings if this is justified by usability testing.

### **J00.4. Progress indicator**

The progress indicator shall be circular and visibly animated.

It should appear offset from the pointer rather than directly underneath it.

A ring, illuminated arc, or similar design may be used.

The indicator must communicate progress toward opening the dial.

It should begin only when a qualifying gesture is detected and disappear immediately after cancellation or successful activation.

The progress animation should be synchronized with elapsed time.

It must not continue progressing after the button has been released.

### **J00.5. Activation behavior**

When the hold threshold is reached, the dial shall open.

The extension shall not require the user to release and press the middle button again.

The implementation must handle the transition from gesture recognition to dial interaction without leaving the progress indicator active.

The newly opened dial should appear in a predictable location, preferably near the pointer when sufficient viewport space is available.

The user must be able to select a tool immediately after the dial opens.

### **J00.6. Cancellation**

The gesture shall cancel when the middle mouse button is released before completion.

It shall also cancel when the page loses focus, the pointer interaction is canceled, the document navigates, the extension is put away, or the current browser context becomes invalid.

Cancellation shall remove all gesture-specific visual resources and timers.

Repeated unsuccessful holds must not accumulate listeners or rendering nodes.

### **J00.7. Native middle-click behavior**

This requirement introduces a genuine browser interaction conflict.

Browsers use the middle button for actions such as opening links in new tabs, autoscrolling, and platform-dependent paste behavior.

MDN documents that preventing some middle-button default actions may require handling `pointerdown`, `mousedown`, or `auxclick`, depending on the browser behavior.&#x20;

[image](https://www.google.com/s2/favicons?domain=https://developer.mozilla.org\&sz=32)

MDN



The agent SHALL investigate this behavior before implementing production interception.

The implementation must not silently disable ordinary middle-click navigation across every website.

### **J00.8. Explicit opt-in and configuration**

Because middle-button hold may conflict with native browsing behavior, the gesture shall have an explicit user-facing enable or disable setting.

It should initially be disabled until the user enables it.

The setting shall explain that the gesture may replace the ordinary middle-button action on eligible page areas while enabled.

The agent shall make the setting easy to discover.

Once enabled, the feature must operate as specified. Merely exposing a setting connected to the old experimental prototype is insufficient.

### **J00.9. Interaction boundaries**

The gesture shall avoid interfering with middle-clicking links, interactive controls, editable fields, and other protected elements wherever possible.

The recommended initial activation area is an eligible noninteractive portion of the webpage.

The agent must explicitly document how the gesture behaves when initiated over a link, button, text field, or other interactive element.

The extension shall not cancel unrelated browser actions unless the user has enabled the gesture and the interaction falls within its documented scope.

### **J00.10. Browser permissions**

The gesture must respect the extension's existing permission model.

With temporary `activeTab` access, content-script listeners cannot receive arbitrary pointer events on pages where the extension has not been activated or injected.

The implementation shall acknowledge this limitation and integrate the gesture within an authorized page session.

The Chrome extension documentation confirms that `activeTab` access is granted following explicit extension invocation, including toolbar actions and keyboard commands.&#x20;

[image](https://www.google.com/s2/favicons?domain=https://developer.chrome.com\&sz=32)

Chrome for Developers



The agent shall not introduce unrestricted access to all websites solely to make the mouse gesture globally available.

A future broad-permission mode would require separate review.

### **J00.11. Browser testing**

The agent shall test the gesture in actual supported browser environments.

Tests must include successful holds, early release, ordinary middle clicks, middle-clicking links, dragging, unexpected focus loss, repeated activation, and browser-native scrolling behavior.

Windows and other supported desktop environments may handle the middle mouse button differently.

Where behavior differs, the implementation must be documented and tested accordingly.

### **J00.12. Completion requirement**

This feature is no longer merely an optional research experiment.

The agent is expected to implement and integrate it within the authorized extension context.

If a specific browser or platform prevents reliable operation, that limitation must be demonstrated through testing and documented precisely.

The agent shall not report the gesture as implemented when it remains disconnected from production code.

The existing keyboard shortcut shall remain available as a reliable alternative.

## **K00. Cross-Cutting Implementation, Verification, and Release Requirements**

### **K00.1. Preserve existing architecture**

The change request shall be implemented through the established modular architecture.

The agent shall not replace the existing effect runtime, registry, or extension packaging system without a demonstrated technical need.

Shared functionality such as audio playback, inventory state, dial navigation, and resource management should be centralized appropriately.

Individual effects shall remain independently maintainable.

### **K00.2. TypeScript and Bun**

All application code shall use modern, strict TypeScript.

Bun shall remain the package manager and bundler.

The extension shall not acquire external runtime dependencies merely to implement audio or dial animation.

Native browser APIs and project-owned code are preferred.

Third-party research projects shall not be copied into the production runtime without the required reviews and licensing authorization.

### **K00.3. Integration order**

The recommended implementation sequence is to stabilize the inventory, introduce the shared audio service, integrate initial audio profiles, implement the rotating dial and separator, connect the middle-mouse gesture, and then expand the catalog through individually reviewed effects.

The agent may organize parallel development where independent workstreams can proceed safely.

However, shared interfaces should be established before large-scale effect integration.

The final implementation shall not contain disconnected components whose integration is deferred to a later change request.

### **K00.4. Unit and integration testing**

The updated runtime shall have tests covering stable inventory layout, effect state transitions, audio lifecycle, dial indexing, rotation, catalog wrapping, tool selection, gesture recognition, and cleanup.

The agent shall test rapid and repeated operations.

Examples include rotating the dial through several complete revolutions, switching tools while audio is playing, repeatedly starting and stopping effects, and canceling middle-button holds at different progress values.

### **K00.5. Playwright verification**

When the current machine supports the required browser environment, Playwright testing is mandatory.

Prefer already installed Playwright dependencies and existing compatible browser binaries.

The agent shall load the packaged extension into a supported browser test environment and exercise the actual interactions.

Synthetic discussion pages and other representative web content shall be used.

Original untrusted bookmarklets remain prohibited from ordinary local execution.

### **K00.6. Screenshot analysis**

The agent shall capture screenshots before activation, while the inventory is idle, during an active effect, while the rotating dial is open, during dial rotation, and after cleanup.

The screenshots shall be examined for unwanted layout movement, incorrect item positions, unreadable labels, broken shadows, overlay conflicts, clipping, and unintended changes to the underlying webpage.

The fixed-width inventory requirement should be verified through measured bounding rectangles as well as visual comparison.

### **K00.7. Audio verification**

Audio requires additional verification beyond screenshots.

The agent shall test audio-event timing, repeated playback, volume control, muting, cancellation, and node cleanup.

Where possible, the agent should use an `OfflineAudioContext` to render deterministic test sounds and inspect waveform properties.

Actual listening remains necessary to evaluate pleasantness, timbre, and whether sounds become annoying under repeated use.

If the environment does not support listening tests, the agent shall record the limitation and avoid claiming that subjective audio quality has been fully verified.

The project should retain the ability to audition each sound independently during development.

### **K00.8. Sound repetition testing**

Each important sound should be evaluated under realistic repeated use.

Punch should be tested across a sequence of repeated impacts.

Shatter should be tested on several targets.

The dial should be rotated through multiple complete revolutions while its mechanical ticks are enabled.

Continuous sounds should be evaluated after prolonged activation.

If an effect becomes irritating, the agent shall investigate reducing its volume, duration, repetition frequency, or high-frequency content, or replacing the sound altogether.

### **K00.9. Visual quality of the dial**

The final dial shall be compared against the existing wheel and the intended mechanical-separator design.

The agent shall inspect whether tool icons move continuously, whether new items emerge naturally from the occluded region, whether the separator appears physically mounted, and whether shadows and depth cues remain coherent during motion.

A static screenshot alone is insufficient to verify the concealment-and-reveal interaction.

The agent shall also inspect animation sequences or recordings.

### **K00.10. Test the complete expanded collection**

Every newly integrated effect shall be tested independently.

The expanded catalog must also receive combined testing.

The agent shall verify that icons remain consistent, metadata remains correct, the dial cycles through all approved tools, no duplicated IDs exist, audio resources are managed properly, and the extension remains responsive with the larger collection.

### **K00.11. Performance expectations**

The audio service shall impose negligible overhead when silent and inactive.

The action dial shall not load effect implementation modules merely to display their metadata.

Only a bounded number of dial positions should require rendering at one time.

Continuous effects shall preserve the established resource-management requirements.

The expanded catalog shall not cause unnecessary whole-document processing during ordinary browsing.

### **K00.12. Required implementation records**

The agent shall provide an implementation summary identifying the completed inventory changes, audio architecture, individual effect audio profiles, selected sound sources, newly approved effects, dial behavior, gesture behavior, testing performed, and unresolved limitations.

The final report shall distinguish implemented functionality from researched or deferred functionality.

### **K00.13. Release completion**

This change request is complete only when the inventory is stable, the shared audio system is functional, all existing effects have intentional audio profiles, the dial rotates through the available catalog, the separator produces the intended concealment effect, and the middle-button hold interaction is integrated and validated within its supported operating conditions.

The newly approved effect batch shall be integrated according to the established quality gates.

The implementation must remain coherent, buildable, reversible, and maintainable.

# **Part III. Mandatory Questions After Implementation**

## **L00. Questions for the Agent to Answer, Investigate, and Act Upon**

After completing the implementation, the agent SHALL answer the following questions.

The purpose of these questions is to challenge the finished work from the perspectives of user experience, visual design, audio quality, technical correctness, maintainability, and architectural extensibility.

Every applicable answer should be supported by evidence.

When a question identifies a meaningful deficiency, the agent is expected to investigate and correct it rather than merely acknowledge the issue.

**The agent is explicitly authorized to make additional code changes, perform refactoring, revise animations, replace sounds, and improve the interface when doing so materially improves the result.**

### **L00.1. Inventory Stability and Usability**

**L-001.** Does the equipped-tool toolbar maintain exactly the same width and height before, during, and after ordinary effect execution? Have we verified this through browser measurements rather than relying only on visual inspection?

**L-002.** Are Switch, End effect, and Put away always displayed in stable positions? Does End effect remain present but disabled when no effect is running?

**L-003.** Have we removed the unnecessary status description from the toolbar? Is the resulting interface clearer, or has removing the description revealed another usability problem that should be addressed differently?

**L-004.** Have we removed the custom Tab and Enter page-targeting mechanism from the runtime? Have we confirmed that normal keyboard behavior on the webpage is no longer intercepted by that mechanism?

**L-005.** Does the toolbar still provide everything a user needs during normal interaction? Can users distinguish between ending an effect and putting away the equipped tool?

**L-006.** Have we tested unusually long tool names, different viewport dimensions, browser zoom, and changing effect states? Are there any circumstances in which the toolbar unexpectedly shifts, clips, or expands?

### **L00.2. Sound Design and User Comfort**

**L-007.** Have we implemented audio for every existing effect? Does each sound correspond meaningfully to the visual action rather than using the same generic effect everywhere?

**L-008.** Have we researched multiple sound candidates or construction techniques for the important effects? Are the selected sounds genuinely the best reasonable options, or did we choose the first available samples?

**L-009.** Does Punch sound like a satisfying impact? Does Shatter communicate brittle fracture? Does Text Bomb have an appropriate detonation? Do the other sounds convey their respective actions convincingly?

**L-010.** Have we listened to the sounds repeatedly? Do they remain pleasant after several consecutive activations, or do their frequency balance, volume, duration, or repetition become irritating?

**L-011.** Have we considered whether some sounds should be shorter, quieter, more subtle, or less frequent? Could silence or a restrained activation cue be more appropriate than continuous playback for certain tools?

**L-012.** Are sound events synchronized with the actual moments of visual impact or transformation? Have we measured or observed audio timing rather than assuming that triggering audio at the beginning of an animation is sufficient?

**L-013.** Does the shared audio system avoid unnecessary `AudioContext` creation, repeated sample decoding, uncontrolled audio nodes, and excessive simultaneous playback?

**L-014.** Can users mute sounds and adjust the master volume easily? Do those controls affect already playing continuous audio as well as subsequently triggered sounds?

**L-015.** Have we verified that sounds stop appropriately when effects are terminated or tools are put away? Could a suspended or failed effect leave audio playing indefinitely?

**L-016.** Have we respected browser user-activation and autoplay restrictions? If the audio context is suspended, does the extension recover correctly after an appropriate user interaction?

**L-017.** Have we verified every external sample's license and attribution requirements? Are all sound assets packaged locally without introducing external runtime dependencies?

**L-018.** Have we considered whether the overall audio palette sounds coherent? Does the extension feel like one deliberately designed interactive product rather than twenty unrelated sound libraries?

### **L00.3. Research and Effect Expansion**

**L-019.** Did we research at least 20 additional candidate effects and document their original sources, intended behavior, distinctiveness, and implementation feasibility?

**L-020.** Did we investigate alternatives to the initial shortlist? Could better or more original effects be available in historical bookmarklet collections, related repositories, or modern creative coding projects?

**L-021.** Have we verified that every selected effect genuinely supports the project's purpose of surprising, humorous, playful, or emotionally expressive interaction with webpages?

**L-022.** Are any new effects substantially redundant with existing ones? Could they instead become configuration options or variations of a shared feature?

**L-023.** Did each new effect receive an individual implementation plan, including its animation design, iconography, audio profile, dependencies, lifecycle, and tests?

**L-024.** Have we preserved source attribution and licensing information for every externally inspired effect? Were any source details assumed rather than verified?

**L-025.** Have all original third-party scripts remained outside ordinary development execution? Were the project's security isolation requirements followed for every candidate?

**L-026.** Did the new effects demonstrate that the architecture is genuinely extensible? Or did their integration require growing amounts of feature-specific logic in shared runtime components?

**L-027.** Are there reusable animation, particle, geometry, audio, or interaction utilities that several new effects could share? Would extracting those utilities improve maintainability without introducing excessive abstraction?

**L-028.** Have we reviewed the visual quality of every new effect independently? Are there any effects that should be improved or removed because they do not meet the project's standards?

### **L00.4. Rotating Dial Interaction**

**L-029.** Can the user rotate the dial naturally in both directions? Does the movement feel directly connected to the pointer gesture?

**L-030.** Can the dial cycle through the complete collection without reaching a hard end? Does it return to the first effect naturally after passing the last?

**L-031.** Have we tested the dial with more effects than can be displayed simultaneously? Does the logical indexing remain correct throughout multiple complete revolutions?

**L-032.** Do tools appear and disappear naturally through the occluded region? Can the user see any abrupt icon replacements, re-rendering artifacts, or changes occurring in fully visible sectors?

**L-033.** Is the rotating mechanism smooth and responsive? Have we considered whether additional easing, snapping, or restrained inertia would improve the physical feeling?

**L-034.** Does the dial distinguish normal clicking from dragging? Can users confidently select an effect without accidentally rotating the dial?

**L-035.** Are labels and icons readable throughout rotation? Does any element become unexpectedly inverted, clipped, or misaligned?

**L-036.** Does the dial remain usable with 50 or 100 registered effects? Are we rendering only the visible positions and necessary neighboring content, or are we unnecessarily creating a large number of hidden interactive elements?

**L-037.** Can keyboard users navigate the dial without dragging? Are focus behavior, selection state, and tool activation predictable?

**L-038.** Does the redesigned dial genuinely improve the experience of discovering additional effects? Or has the mechanical metaphor made navigation slower or more complicated than necessary?

### **L00.5. Separator, Shadows, and Mechanical Appearance**

**L-039.** Does the separator look physically connected to the dial rather than like an unrelated decorative object placed above it?

**L-040.** Have we carefully reviewed its shape, thickness, material treatment, highlights, shadows, and position? Does it convincingly communicate visual depth?

**L-041.** Does the separator remain stationary while the dial rotates beneath it? Are its shadow and occlusion mask correctly aligned during movement?

**L-042.** Do tools pass beneath the separator convincingly in both directions? Have we examined slow rotation specifically to detect visual inconsistencies that might be hidden during fast movement?

**L-043.** Does the separator cover more of the dial than necessary? Could a smaller or differently shaped component preserve the intended illusion while improving readability?

**L-044.** Have we compared multiple visual concepts or prototypes? Is the selected design genuinely better than simpler alternatives?

**L-045.** Does the final result remain visually coherent across different viewport sizes and browser zoom settings? Are the masking and shadow coordinates responsive rather than dependent on one screenshot's dimensions?

### **L00.6. Mechanical Audio Feedback**

**L-046.** Does the dial produce a pleasant mechanical tick when crossing meaningful selection positions?

**L-047.** Is the tick synchronized with the visual detent rather than firing arbitrarily during pointer movement?

**L-048.** Does slow rotation produce distinct, satisfying sounds? Does fast rotation remain controlled without becoming an excessively dense series of clicks?

**L-049.** Have we compared different tick sounds, including mechanical, metallic, and softer interface variations? Is the selected sound pleasant after multiple complete rotations?

**L-050.** Would reducing the tick's loudness, duration, or frequency improve comfort? Does the sound become distracting during ordinary tool browsing?

**L-051.** Does the sound stop immediately when rotation ends? Can closing the dial leave any audio source active unintentionally?

### **L00.7. Middle-Mouse Invocation**

**L-052.** Have we implemented the actual stationary middle-button hold interaction in the production extension, rather than leaving it in an experimental prototype?

**L-053.** Does holding the middle mouse button display a circular progress indicator without requiring the user to move the pointer or press Shift?

**L-054.** Does releasing the button before completion cancel the gesture reliably? Have we tested cancellation near the beginning, middle, and end of the progress duration?

**L-055.** Does completing the hold open the action dial directly? Is the transition smooth, and does the progress indicator disappear correctly?

**L-056.** Have we tested the gesture against native middle-click behavior in supported browsers? Does it avoid unexpectedly opening links, enabling autoscroll, or interfering with protected controls?

**L-057.** Is the feature clearly configurable? Can the user disable it and recover ordinary browser behavior?

**L-058.** Have we considered whether the activation delay feels appropriate? Is it long enough to avoid accidental activation but short enough to remain convenient?

**L-059.** Does the gesture work only in authorized extension contexts? Have we avoided introducing broad browser permissions without justification?

**L-060.** If some browser or operating-system behavior remains unsupported, have we documented the exact limitation and provided a reliable alternative rather than claiming the gesture is fully implemented?

### **L00.8. Architecture, Refactoring, and Maintainability**

**L-061.** Have we reviewed the implementation for duplicated audio handling, rotation calculations, pointer listeners, lifecycle state, and UI rendering logic?

**L-062.** Could shared functionality be extracted into simpler reusable modules? Would the extraction reduce overall complexity, or would it introduce unnecessary interfaces and dependencies?

**L-063.** Have we respected the existing project conventions and interfaces? If new conventions were introduced, are they justified and documented?

**L-064.** Has the implementation removed obsolete code from the fixed-wheel model, unused experimental gesture logic, unnecessary inventory status rendering, and deprecated keyboard-targeting behavior?

**L-065.** Are tool identities and metadata consistent between the effect registry, rotating dial, searchable catalog, inventory, and audio profiles?

**L-066.** Have we considered whether any new runtime dependency could be eliminated through native browser functionality or project-owned code?

**L-067.** Could another agent add an independently researched effect without modifying the central dial, audio controller, or inventory implementation?

**L-068.** Have we considered what happens when a new effect has unusual interaction requirements, no continuous audio, a long name, a special icon, or a different animation duration? Does the shared architecture support these cases naturally?

### **L00.9. Testing and Boundary Conditions**

**L-069.** Have we tested the complete implementation in the packaged extension through Playwright wherever the current environment permits?

**L-070.** Have we inspected screenshots before, during, and after effect execution? Does the inventory remain stable, and does the webpage return to its expected state after cleanup?

**L-071.** Have we tested repeated rotation, rapid direction changes, dragging near viewport boundaries, pointer cancellation, and closing the dial during movement?

**L-072.** Have we verified that the occlusion mechanism does not produce wrong tool selections when visual positions are recycled?

**L-073.** Have we tested the audio system with overlapping effects, repeated clicks, mute changes, rapid tool switching, and unexpected termination?

**L-074.** Have we tested browser tab suspension, page navigation, refresh, resize, and unsupported pages? Are resources consistently released?

**L-075.** Have we verified that the new interactions do not accidentally activate underlying website controls or modify persistent website data?

**L-076.** Are there browser-specific or accessibility issues that remain unresolved? Have we investigated whether they require corrective work before release?

**L-077.** Have all tests been rerun against the final implementation after refactoring and visual adjustments?

### **L00.10. Final Critical Review**

**L-078.** Is the extension genuinely more enjoyable to use than the previous version, or have we merely added more functionality and visual complexity?

**L-079.** Does the inventory now feel stable and unobtrusive? Does the new audio make effects more satisfying? Does the rotating dial make browsing the collection more engaging?

**L-080.** Are there any aspects of the implementation that feel unfinished, awkward, repetitive, noisy, visually inconsistent, or unnecessarily complicated?

**L-081.** Did we make any implementation decisions simply because they were easy? Would a more carefully researched or technically refined approach produce a meaningfully better result?

**L-082.** Are there opportunities for refactoring that we should address now, before more effects depend on the new architecture?

**L-083.** Have we considered whether any generated visual assets or selected audio samples should be replaced with more appropriate alternatives?

**L-084.** If a user rotates the dial through 20 tools, repeatedly activates effects, and keeps the extension open for an extended session, does the experience remain responsive, coherent, and pleasant?

**L-085.** What are the three weakest aspects of the final result? Can they be corrected through reasonable additional work? If so, why should that corrective work be deferred?

**L-086.** Would we want future agents to replicate the code quality, audio design, visual interaction, and architectural decisions established by this implementation?

**L-087.** Does the final extension now feel more like a complete interactive toy and less like a collection of unrelated JavaScript demonstrations?

### **L00.11. Required corrective action**

After answering the questions, the agent SHALL review all negative, uncertain, or insufficiently evidenced answers.

For each finding, the agent shall determine whether the problem requires further research, additional testing, refactoring, redesign, or implementation changes.

Mandatory deficiencies must be corrected before the corresponding feature can be accepted.

Where an improvement is discretionary, the agent shall evaluate whether it offers a meaningful benefit relative to its complexity and maintenance cost.

**The agent is encouraged to continue improving the implementation when the review reveals a reasonable opportunity to deliver materially better quality.**

A feature shall not be considered complete simply because the code compiles, a test passes, or the interface looks acceptable in one screenshot.

The result must be functionally correct, visually refined, comfortable to use, architecturally coherent, and supported by meaningful verification.

### **L00.12. Final acceptance question**

**L-088.** If we handed this version of the extension to someone who had never seen the project before, could that person immediately discover how to equip tools, use them repeatedly, enjoy their audio and visual feedback, rotate through a large collection, and invoke the dial conveniently, without needing an explanation of how the extension was implemented?

If the answer is No, the agent shall identify the remaining obstacles, determine which improvements are justified, implement the necessary corrections, and repeat the relevant verification.

End of change request `suggestions004-00-change-request-audio-effects-and-rotating-action-dial.md` | Sections A00–L00 | Revision 00 | The specification consists of product narrative, implementation requirements, and 88 post-implementation review questions.