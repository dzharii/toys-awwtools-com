# Cinematic 3D Clock

Implementation specification | Version 2.1

## A02. Motivation and product vision

We want to build a digital clock that people enjoy having on their screens. It should tell the time clearly, but the appeal comes from how it looks and behaves. Large dimensional numerals, carefully designed materials, subtle lighting and animated transitions should make the clock interesting enough to leave open throughout the day.

Picture-in-Picture (PiP) is a central part of the idea. Someone working in a code editor, reading documentation or browsing the web should be able to keep the clock visible without dedicating a browser tab or a section of their screen to it. They open the website, choose a theme and activate PiP. The clock moves into a compact floating window that the browser can keep above other applications.

The floating clock should retain the appearance and animation of the main clock as closely as the browser allows. The user should be able to enjoy the same design at a smaller size, with the time remaining accurate and easy to read.

We also want people to choose an appearance that suits their workspace. The application should provide four distinct themes, adjustable colors and control over animation intensity. These options should be easy to find without filling the screen with menus.

The product is a clock, with no additional pages or unrelated features. Most of the screen should belong to the time display, and every control should have a clear purpose.

A successful result is one that someone chooses to keep visible because they like looking at it.

## B02. Technology and implementation approach

Build the website using native HTML, CSS, JavaScript and browser APIs. Do not use React, Three.js, GSAP, UI frameworks, external animation libraries or other runtime dependencies.

Modern CSS can provide the perspective, depth, shadows, gradients and movement needed for this clock. We want to see how far these techniques can go without introducing a 3D rendering engine.

The preferred implementation is a single `index.html` file containing the markup, styles and JavaScript. This keeps the application easy to deploy and modify. Separate files are acceptable if they solve a specific organizational or technical problem, but avoid splitting the application into many modules simply to follow an architectural convention.

The website should run from a basic static server. It must not need a build step, package installation, backend or external service. Features that require a secure browser context should work when the site is served over HTTPS or localhost.

Keep production assets local. Avoid externally hosted fonts, stylesheets, icons, scripts and images. Use system fonts or CSS techniques where appropriate.

The main clock must use CSS-based 3D effects, not WebGL. Native Canvas is permitted for the video PiP fallback because video PiP requires a video source.

The implementation agent should choose straightforward browser APIs and code structures rather than follow a prescribed set of functions or abstractions.

## C02. Visual design and clock presentation

The first thing someone should notice when opening the page is the time. Large numerals should sit at the center of the viewport, surrounded by enough empty space to make their shape, materials and animation stand out.

The digits should appear to have physical depth. Layered text, CSS perspective, highlights, shadows and gradients can create the impression of extruded or reflective objects. The effect should be convincing at normal viewing sizes, without making the time difficult to read.

The background should support the clock's appearance rather than compete with it. Each theme can establish its own atmosphere through color and lighting, but the clock should remain the dominant element.

### C02.1 Visual themes

Provide four curated themes with different materials and lighting treatments.

Chrome

A dark metallic design with polished highlights, reflective-looking surfaces and pronounced depth. The digits should resemble solid metal objects, with lighting that helps reveal their shape.

Neon

Bright, luminous numerals against a dark background, with colored glow and subtle atmospheric effects. It should have a futuristic appearance without allowing the glow to obscure the digits.

Glass

Translucent-looking numerals with soft reflections, layered transparency and restrained highlights. The design should emphasize light passing through or reflecting from glass-like surfaces.

Minimal

A simpler, architectural treatment built around clean typography, proportion, shadows and subtle depth. It should retain the 3D character of the clock with fewer decorative effects.

These themes need different visual treatments, not just different accent colors. Chrome might use stronger extrusion and reflection, while Glass relies on transparency and softer lighting.

All four themes should use the same clock functionality, layout principles and customization controls.

### C02.2 Responsive composition

The composition must adapt to desktop, tablet and mobile screens.

A large monitor provides room for wider spacing and more pronounced depth. On a phone, the numerals and controls should be arranged to preserve readability within a narrow viewport.

Adjust typography, spacing, perspective and effect intensity where necessary. Avoid horizontal scrolling or clipping the clock.

Both portrait and landscape orientations should work. The agent can adjust the composition for different screen sizes rather than preserve identical proportions everywhere.

## D02. Time display and clock behavior

The clock should show the user's local time clearly, without requiring any setup.

Display hours and minutes, with optional seconds. Support 12-hour and 24-hour formats, including AM/PM when the 12-hour format is selected.

Use the device clock as the source of time. No external time service is needed.

The normal timekeeping mechanism should use a continuously advancing timer. Since browsers can delay or suspend timers in background tabs, the application must also check against the system clock when the page resumes or significant drift is detected.

For example, if someone leaves the page in the background for an hour, the displayed time must be correct when they return. The clock should correct itself rather than continue counting from the last timer callback.

Changing the time format or hiding seconds should update the display immediately. Neither action should restart the clock or reset other settings.

The main page and PiP window must display the same logical time. They should not run independent clocks that gradually disagree.

## E02. Animation and interaction

Animation is one of the main reasons to build this clock. Digit changes should be interesting to watch, while the rest of the movement stays restrained enough for the clock to remain open during work.

### E02.1 Initial appearance

When the page loads, introduce the clock with a short animation.

The digits could move forward from a deeper position, gain illumination or settle into place through coordinated movement and opacity changes. The agent should choose an approach that fits the visual design.

Aim for approximately 1 to 1.5 seconds. The introduction should give the clock a recognizable entrance without delaying normal use.

When reduced motion is requested, show the clock immediately or use a much simpler transition.

### E02.2 Digit transitions

Digits should animate when their values change instead of being replaced instantly.

Use combinations of rotation, perspective, scale, blur, opacity and lighting to suggest that one digit transforms into another. The transition does not need actual geometric morphing.

For example, when `12:59` becomes `13:00`, animate the changing positions together. The unchanged positions should remain stable.

Transitions should usually last around 400-700 milliseconds. They must finish cleanly, without leaving duplicate digits, unfinished animations or incorrect values on screen.

The agent can experiment with the exact movement. The important requirements are readability, coordinated timing and a consistent visual style.

### E02.3 Ambient effects

Some themes may benefit from continuous background movement. Chrome could have slowly shifting highlights, Neon could use subtle changes in glow, and Glass could have gentle movement in its reflections.

These effects should remain secondary to the time display. Avoid constant dramatic movement that makes the clock distracting during ordinary use.

Ambient effects should be adjustable independently from the clock's basic operation.

### E02.4 Interactive 3D perspective

The clock should respond to pointer movement through subtle perspective changes.

As the user moves the mouse, the numerals can tilt slightly or shift their highlights to suggest that they occupy physical space. The movement should be smooth, limited and easy to read.

Touch devices can use a simpler response to touch movement.

Do not add unrestricted rotation, dragging or zooming. The interaction is intended to make the existing composition feel dimensional, not turn it into a freely movable 3D object.

### E02.5 Motion preferences

Provide Low, Medium and High motion settings.

These should adjust ambient animation, parallax strength and the emphasis of transitions. They must not alter the rate at which time advances.

Use Medium as the default.

## F02. Customization and settings

A user should be able to change the clock's appearance in a few interactions and then leave the settings alone.

Provide the following options:

| Setting          | Available options            |
| ---------------- | ---------------------------- |
| Theme            | Chrome, Neon, Glass, Minimal |
| Accent color     | User-selectable color        |
| Motion intensity | Low, Medium, High            |
| Seconds          | Show or hide                 |
| Time format      | 12-hour or 24-hour           |

Start with Chrome, Medium motion, visible seconds and 24-hour time. The default accent color can come from the theme.

Settings should appear in a compact panel that does not permanently occupy part of the screen. Changes should take effect immediately, without a page reload.

A user might switch to the Minimal theme for a quieter workspace, hide seconds and reduce motion. Another might prefer Neon with a custom accent color and stronger animation. Both should be possible without navigating through a large configuration interface.

### F02.1 Remembering preferences

Use native `localStorage` to remember settings.

If someone selects Glass and hides seconds, the clock should use those preferences when they reopen the website.

Missing or invalid stored values should fall back to defaults. A storage failure must not prevent the clock from working.

No accounts, databases or cloud synchronization are required.

### F02.2 Settings in Picture-in-Picture

The main clock and PiP should share one configuration.

Changing a theme in the main window should update the floating clock immediately. If Document PiP provides a theme or time-format control, changing it there should update the main page and stored preferences.

Video PiP cannot display arbitrary HTML controls, so its settings can remain accessible through the main page.

## G02. Picture-in-Picture experience

Picture-in-Picture makes the clock useful while the user is doing something else.

Someone should be able to open the website, choose an appearance and detach the clock into a floating window. They can then switch to their editor, browser or another application while keeping the time visible.

The floating window should look like a compact version of the same clock. Its typography, colors and animations should carry over as far as the selected browser API permits.

### G02.1 Opening Picture-in-Picture

Provide a visible, understandable PiP action in the main interface.

When activated, the application should request a native browser Picture-in-Picture window.

The preferred initial size is approximately 480 × 270 pixels, with a landscape composition. Actual size and placement depend on the browser, so the clock must adapt to the space it receives.

The main website should remain open and usable.

### G02.2 Document Picture-in-Picture

Use Document Picture-in-Picture when the browser supports it.

This allows the application to display HTML and CSS inside the floating window, making it possible to preserve the main clock's typography, depth effects, themes and transitions.

Adapt the layout to the smaller window. The time should remain easy to read without needing the same spacing used on the main page.

Where supported, include compact controls for changing the theme and time format.

The floating document should use the application's existing time and settings state. It must not create a separate timekeeping engine.

### G02.3 Video Picture-in-Picture fallback

When Document PiP is unavailable, attempt native video PiP.

Create an animated Canvas representation of the clock, capture it as a video stream and use that stream for the browser's video PiP functionality.

The Canvas renderer should reproduce the selected theme's main characteristics, including typography, color, dimensional shading and animated digit changes.

We do not need exact pixel parity between CSS and Canvas. Some reflections, lighting effects or depth treatments may need simpler Canvas equivalents.

The fallback should still resemble the selected clock theme and remain animated. A static screenshot or plain unstyled time display would not meet the requirement.

Use the same timekeeping and settings state as the main application.

### G02.4 PiP lifecycle

Only one PiP session should be active at a time.

While PiP is open, keep the main clock visible but reduce unnecessary animation work.

When PiP closes, restore normal animation behavior and release temporary resources, including unused media tracks, Canvas rendering loops and event listeners.

Opening and closing the floating clock repeatedly should not leave the application in an inconsistent state.

We do not require PiP to survive the closure of its originating tab. Follow the browser's native lifecycle.

### G02.5 Unsupported browsers and failures

Detect support for each PiP API rather than relying on browser names.

Prefer Document PiP, then use video PiP where available. Both mechanisms can be limited by browser permissions, secure-context requirements and user-activation rules.

If neither approach works, explain briefly that PiP is unavailable in the current browser or context. The main clock must continue working.

If an opening attempt fails and the browser requires a new user gesture, provide a retry action rather than repeatedly attempting to open PiP automatically.

Do not substitute a standard popup or an HTML overlay for native PiP. Neither provides the same system-level floating-window behavior.

## H02. Main interface and usability

The clock should occupy the user's attention when they want to look at it. Controls should stay out of the way when they are not needed.

On desktop, a small toolbar can appear when the pointer moves or the user interacts with the page. It should fade away when idle, leaving the clock as the main visual element.

On touch devices, the controls must remain discoverable without hover.

The main actions are opening PiP and accessing settings. The exact toolbar placement and appearance can be decided during implementation.

The settings panel should be easy to open and dismiss. It should not force the user to leave the clock view.

### H02.1 Basic accessibility

Use semantic controls, readable contrast, visible keyboard focus and appropriate labels. The user should be able to open settings and PiP using a keyboard.

Respect `prefers-reduced-motion` by removing or simplifying decorative animation without affecting time accuracy.

If the visual design uses several overlapping copies of a numeral to simulate depth, prevent those decorative copies from being announced separately by screen readers.

Keep accessibility work focused on these practical requirements. A larger accessibility subsystem or frequent spoken time announcements are outside scope.

## I02. Application structure and state

The implementation should remain small, even if the clock has several visual and browser-specific features.

Prefer one HTML file, with JavaScript organized into clear functions or logical sections. Separate files are acceptable when they make the code substantially easier to maintain.

The application has a few distinct responsibilities:

| Responsibility         | What it handles                                   |
| ---------------------- | ------------------------------------------------- |
| Clock engine           | Time advancement, formatting and drift correction |
| Clock renderer         | CSS-based numerals, depth and transitions         |
| Theme system           | Colors, materials and visual effects              |
| Interaction controller | Pointer effects and interface controls            |
| Settings manager       | Preferences and persistence                       |
| PiP controller         | Opening, closing and synchronizing PiP            |
| Canvas renderer        | Animated video PiP output                         |

These are conceptual responsibilities, not mandatory classes or files.

The clock engine should determine the time. Renderers should display it. The settings manager should maintain preferences, and the PiP controller should manage browser-specific behavior.

Both the DOM and Canvas renderers should consume the same clock state rather than calculate time independently.

Use a simple shared state object or similarly lightweight mechanism. There is no need for an elaborate event bus, framework-style store or dependency-injection system.

A failure in PiP, a decorative effect or stored preferences should not stop the main clock. Handle such failures close to the relevant feature and retain a working time display.

## J02. Performance and resource efficiency

Target smooth animation at approximately 60 FPS on capable desktop hardware. The actual frame rate will vary by device and browser, so maintaining a responsive clock matters more than meeting a fixed number.

Favor animation techniques that avoid unnecessary layout work. When performance is limited, reduce ambient movement, blur and glow before removing digit transitions or essential depth effects.

Avoid doing expensive visual work twice when PiP is active. Release temporary rendering and media resources after PiP closes.

The website should remain lightweight and self-contained. It should not require network requests after its local assets have loaded.

Dedicated offline caching, a Service Worker and an installable PWA are not required.

The agent can select the browser scheduling and rendering techniques that best satisfy these requirements without following a prescribed implementation.

## K02. Validation and expected quality

Validation should concentrate on the behavior someone will actually see and use.

Check that the clock displays the correct local time, switches between 12-hour and 24-hour formats, shows or hides seconds and recovers after the browser suspends its timers.

Review each theme visually. They should have distinct appearances, and digit changes should animate cleanly without leaving incorrect or overlapping values.

Verify that settings persist after reloading, the interface works at different viewport sizes, and mouse or touch interaction does not interfere with reading the time.

Test Document PiP and video PiP in browsers that support them. Confirm that each displays the correct time, responds to applicable setting changes and closes without leaving broken application state.

Check that the clock remains usable when PiP is unsupported.

Basic keyboard interaction and reduced-motion behavior should also work.

Automated tests are optional. The implementation agent can add them if they help verify timekeeping or state changes, but no testing framework or dedicated test structure is required.

Manually review the website in current Chrome, Edge, Firefox and Safari where available. Record browser-specific PiP limitations rather than treating missing native APIs as application bugs.

## L02. Implementation milestones

The agent should develop the website in stages so that the clock remains usable while the more elaborate features are added.

### L02.1 Foundation

Create the static application and working digital clock.

Implement local time display, 12-hour and 24-hour formats, optional seconds and recovery from delayed timers.

The result should already function as a basic clock without dependencies.

### L02.2 Visual design

Develop the CSS-based dimensional typography, central composition and four visual themes.

This stage should establish the appearance of the product. Review materials, lighting, depth and spacing before spending time on advanced animation.

### L02.3 Animation and interaction

Add the opening animation, digit transitions, ambient effects and pointer-responsive perspective.

Implement motion intensity and reduced-motion behavior.

Refine the timing and appearance so the effects work together rather than compete with one another.

### L02.4 Settings and interface

Add the compact controls, settings panel and `localStorage` persistence.

Adapt the layout to desktop and mobile screens. The clock should remain prominent when the controls are hidden or the settings panel is closed.

### L02.5 Picture-in-Picture

Implement Document PiP first, using the HTML/CSS clock.

Then add the Canvas-based video PiP fallback.

Both approaches should use the main application's time and settings. Verify that opening, changing settings and closing PiP behave correctly.

### L02.6 Final refinement

Review the complete application in available browsers and at different screen sizes.

Fix visual inconsistencies, timing issues, PiP failures and unnecessary resource usage.

Spend the final pass improving the clock's appearance and behavior, not expanding its scope.

The agent can proceed through these milestones without requesting approval after each stage unless a requirement conflict prevents a reasonable implementation.

## M02. Features outside scope

This is a visual clock, not a collection of time-management tools.

Do not add alarms, countdown timers, stopwatches, multiple timezone clocks, accounts, cloud synchronization or sound effects.

We also do not need a backend, database, analytics, external integrations, an installable PWA or dedicated offline caching.

Avoid additional pages, marketing content and navigation unrelated to the clock.

These boundaries leave more room to refine the typography, animation and PiP experience that people will use.

## N02. Expected final experience

A user opens the website and sees a large digital clock centered on the screen. The numerals appear through a short entrance animation, with lighting and depth that match the selected theme.

As the time advances, changing digits animate into their new values. Moving the pointer slightly changes the perspective, making the numerals appear to occupy space.

The user opens settings and switches from Chrome to Glass. The materials and lighting change immediately. They choose a different accent color, hide seconds and lower the motion intensity. The clock remembers those preferences.

Later, while working in another application, the user activates Picture-in-Picture. A compact animated clock appears in a floating window. It shows the same time and selected theme, with the closest visual treatment supported by the browser.

The user continues working while keeping the clock visible. If they change a setting in the main page, the floating clock updates. When they close PiP, the main clock returns to its normal animation behavior.

When they revisit the website, their preferences are restored.

The finished application should make these interactions feel straightforward. Users should not need to understand why one browser uses Document PiP and another uses a Canvas video stream.

The goal is a clock that looks good enough to keep on screen, reads clearly and works reliably in a floating window.

## O02. Instructions to the implementation agent

Build the complete application described in this specification.

The main priorities are the CSS-based 3D clock, four visual themes, animated digit transitions, user customization and native Picture-in-Picture support.

Use only HTML, CSS, vanilla JavaScript and browser APIs. Prefer a self-contained `index.html` file. Do not introduce external dependencies, frameworks, rendering engines or build tools.

Use CSS for the main clock's dimensional presentation. Use Canvas for the video PiP fallback where required.

You can decide the exact typography, lighting effects, animation choreography, layout details and internal code organization. Those decisions should support the product described here, especially the appearance of the clock and the experience of keeping it visible during other work.

Keep the code understandable and avoid abstractions that add complexity without solving a specific problem.

Do not add features outside the agreed scope. Automated testing is optional, but verify the essential behavior in a browser.

Complete the implementation milestones and deliver a working static website. The result must include the finished clock, customization controls and both native PiP strategies where supported, rather than stopping at a visual prototype.