---

A00 Favicon FX Developer Note

---

Favicon FX turns the smallest visible part of a web page into a temporary animation surface.

After the bookmarklet runs, the page favicon can spin, pulse, orbit, fade, glitch, change color, grow eyes, display a badge, or combine several of those behaviors at once. A compact control panel appears inside the page, but the actual animation is visible in the browser tab.

The useful part is not only the collection of effects. The bookmarklet contains a small favicon-rendering library with a public API. The panel is one client of that library. Code entered in DevTools, another bookmarklet, or a page script can use the same API to enable effects, change parameters, register new effects, create presets, pause rendering, inspect state, and restore the page's original favicon.

This makes Favicon FX useful in several different ways.

It is a visual toy that can make an otherwise static browser tab feel alive. It is also a compact Canvas experiment, an example of a plugin-oriented animation system, and a quick way to prototype favicon-based status indicators without modifying the application being viewed.

The bookmarklet is intentionally temporary. It does not permanently change the site, install an extension, write to storage, or send the favicon to another service. Reloading the page removes the runtime completely.

---

B00 What the User Experiences

---

The installation page contains a draggable bookmark link. The user drags that link to the browser's bookmarks bar.

When the bookmark is activated on a normal web page, Favicon FX performs four visible actions.

First, it finds the best favicon it can read.

Second, it creates a 64 by 64 pixel Canvas representation of that favicon.

Third, it replaces the browser's active favicon with a generated PNG that can be updated frame by frame.

Fourth, it opens the Favicon FX Lab panel in the upper-right corner of the page.

The initial Disco preset starts automatically. This is deliberate. The first run should demonstrate the result immediately rather than presenting an inactive control panel and requiring the user to guess which button to press.

The panel provides presets, individual effect switches, a random combination button, speed and intensity controls, pause and restore controls, and window controls for collapsing or closing the tool.

Running the bookmarklet again does not create a second engine or a second panel. It toggles the existing panel between visible and hidden states. The favicon animation continues while the panel is hidden.

Closing the panel is different from hiding it. Closing destroys the application, restores the original favicon links, removes the generated favicon, unregisters event listeners, and removes the public API from `window`.

---

C00 Why the Favicon Is an Interesting Surface

---

A favicon is visually small, but it occupies a persistent part of the browser interface. It remains visible while the user reads the page, switches between tabs, or leaves the page open beside other work.

That makes it useful for brief, low-detail visual expressions.

A pulse can make a tab feel active. A badge can suggest that something needs attention. A slow color cycle can distinguish a temporary environment. A shake can produce a deliberately excessive alarm effect. Googly eyes can turn a corporate logo into something unexpectedly playful.

The same size that makes the favicon interesting also creates strict design constraints. At typical tab sizes, fine detail disappears. Effects must be recognizable through silhouette, movement, contrast, and rhythm rather than through detailed illustration.

For that reason, Favicon FX renders internally at 64 by 64 pixels but favors large transformations and overlays. A two-pixel movement can be noticeable. A nine-pixel alert badge is already substantial. A thin border can become invisible after browser scaling.

Favicon FX should therefore be treated as an expressive visual surface, not as a place for dense information.

It can suggest state. It should not be the only place where important state is communicated.

---

D00 Package and Installation Model

---

The package keeps the readable implementation separate from the bookmark URL used by the browser.

The maintained source is located in:

```text
src/bookmarklet.js
```

That file contains ordinary formatted JavaScript. It is not minified or mangled. Functions, parameter names, effect definitions, and architectural boundaries remain visible.

The build script converts that source into an encoded `javascript:` URL and writes the generated result into the installer data and bookmarklet text files. The installation page uses the generated URL as the destination of the draggable bookmark link.

This distinction matters because a bookmark's address cannot contain a normal multiline JavaScript file in the same form in which developers maintain it. The browser needs a valid `javascript:` URL. The source remains readable, while the installed bookmark contains an encoded representation of that source.

The current bookmark URL is large because the entire engine, panel, styles, effects, and presets are self-contained. This avoids external hosting, but very long bookmark URLs are not equally reliable in every browser, bookmark manager, or bookmark synchronization service. Chromium-based browsers generally tolerate large bookmarklets, but truncation remains a portability risk.

A hosted loader could make the bookmark much smaller, but it would no longer be fully self-contained. The current package chooses self-containment over minimal bookmark size.

---

E00 Runtime Boundaries

---

The bookmarklet is wrapped in one immediately invoked function expression:

```js
(() => {
  "use strict";

  // Complete runtime.
})();
```

Inside that function, the implementation is divided into three practical layers.

The favicon engine owns image acquisition, Canvas rendering, effect registration, preset registration, animation scheduling, public state, favicon replacement, and restoration.

The panel owns buttons, sliders, dragging, collapsing, visibility, and user interaction. It calls public engine methods instead of modifying the renderer directly.

The bootstrap layer creates the engine and panel, exposes the engine as `window.FaviconFX`, prevents duplicate instances, starts the engine, and activates the initial preset.

The two global keys are:

```js
window.__FAVICON_FX_BOOKMARKLET__;
window.FaviconFX;
```

`window.__FAVICON_FX_BOOKMARKLET__` stores the complete application object and is used to detect an existing instance.

`window.FaviconFX` exposes the engine API for interactive use.

The panel is placed in an open Shadow DOM. This prevents ordinary page CSS from accidentally restyling the controls and prevents the panel's styles from leaking into the page.

The Shadow DOM is a styling boundary, not a security boundary. Because it is created with `mode: "open"`, page scripts can still locate the host and inspect `host.shadowRoot`.

The bookmarklet also runs in the page's JavaScript context. A page script can inspect, call, replace, or delete `window.FaviconFX`. The implementation does not attempt to isolate itself from a hostile page.

---

F00 How the Original Favicon Is Found

---

Favicon discovery begins with the page's existing icon declarations:

```js
document.querySelectorAll(
  'link[rel~="icon"], link[rel="apple-touch-icon"]'
);
```

Each candidate receives a simple numeric rank based on the beginning of its `sizes` attribute. Larger declared sizes are attempted first.

For example:

```html
<link rel="icon" sizes="16x16" href="/icon-16.png">
<link rel="icon" sizes="64x64" href="/icon-64.png">
```

The 64 by 64 candidate is attempted before the 16 by 16 candidate.

The conventional origin favicon is appended as the final candidate:

```text
/favicon.ico
```

Duplicate URLs are removed before loading begins.

The ranking logic is intentionally small. It does not fully interpret every possible icon declaration. A value such as `sizes="any"` receives no numeric preference. Multiple sizes in one attribute are not deeply analyzed. Manifest icons are not searched.

For each candidate, Favicon FX tries to load the image and draw it into a 64 by 64 source Canvas.

Same-origin images are loaded normally.

Cross-origin images are loaded with:

```js
image.crossOrigin = "anonymous";
```

The remote server must return suitable CORS headers. Otherwise, the browser may allow the image to appear visually while refusing to let JavaScript read or export the Canvas that contains it.

After drawing a candidate, the loader performs a one-pixel read:

```js
context.getImageData(0, 0, 1, 1);
```

This is not an image-quality test. It is a Canvas-origin test. If the Canvas has become tainted by a cross-origin image, the read throws an exception and the candidate is rejected.

The engine then tries the next candidate.

---

G00 The Generated Fallback Icon

---

Some sites expose favicons that the browser can display but JavaScript cannot safely place into an exportable Canvas. Other pages have no favicon declaration at all.

Favicon FX does not use a proxy or upload the image elsewhere to work around this. When all favicon candidates fail, it generates a local fallback icon.

The fallback is a rounded square with a diagonal three-color gradient. The center contains the first visible character of the hostname.

For example, a page on:

```text
developer.example.com
```

produces an icon containing:

```text
D
```

A leading `www.` is ignored.

The fallback is not an attempt to recreate the site's actual brand. Its purpose is to keep the effect engine usable. Motion, color, texture, overlays, presets, and custom effects continue to work even when the original favicon pixels are unavailable.

The engine records whether this fallback was used:

```js
FaviconFX.getState().sourceInfo;
```

A typical successful result is:

```js
{
  sourceUrl: "https://example.com/favicon.png",
  usedFallback: false
}
```

A fallback result is:

```js
{
  sourceUrl: null,
  usedFallback: true
}
```

---

H00 How Favicon Replacement Works

---

At startup, the engine records the page's existing `link[rel~="icon"]` elements and their original `rel` values.

It then creates one new link:

```html
<link rel="icon" type="image/png" data-favicon-fx="true">
```

The original favicon links are not deleted. Their `rel` attributes are temporarily changed to:

```text
icon-disabled-by-favicon-fx
```

This prevents them from competing with the generated favicon while retaining the original DOM nodes and their attributes.

For every rendered frame, the Canvas is serialized:

```js
frameCanvas.toDataURL("image/png");
```

The resulting data URL becomes the generated link's `href`.

When restoration occurs, the generated link is removed and the recorded `rel` values are placed back on the original links.

This restoration model preserves the icon declarations that existed when Favicon FX started. It does not continuously monitor favicon changes made later by the page.

If the application dynamically creates a new `rel="icon"` link after Favicon FX has started, that new link is not part of the original snapshot. It may compete with the generated icon, and it will not be modified during restoration.

---

I00 The Frame Model

---

Every visible favicon frame begins as a plain description object.

Conceptually, it contains:

```js
{
  time,
  delta,
  size,
  center,
  intensity,
  rotation,
  scaleX,
  scaleY,
  offsetX,
  offsetY,
  alpha,
  filters,
  processors,
  overlays
}
```

Effects do not normally draw immediately. They modify this description.

A motion effect may add to `rotation`.

A scale effect may multiply `scaleX` and `scaleY`.

A color effect may append a Canvas filter string.

A texture effect may append a processor function.

A decorative effect may append an overlay function.

After all enabled effects have contributed, the engine renders the frame in three stages.

The first stage draws the immutable source favicon with the accumulated transforms, opacity, and filters.

The second stage runs raster processors. These functions can read and replace the already composed image.

The third stage draws overlays on top.

The ordering is:

```text
source transform and filters
-> raster processors
-> overlays
-> PNG serialization
-> favicon link update
```

This ordering is the main reason effect combinations remain understandable.

A pulse changes the source before pixelation occurs.

A glitch processor distorts the transformed source.

An alert badge is drawn after the distortion, so the badge usually remains readable.

---

J00 Effect Composition Rules

---

Effects are evaluated in registration order, not in the order in which the user clicks their buttons.

The built-in order is:

```text
Spin
Wobble
Pulse
Orbit
Shake
Hue Cycle
Fade
Negative
Neon
Pixelate
Glitch
Mirror
Trail
Sparkles
Scanline
Halo
Alert Badge
Googly Eyes
```

Transform values are accumulated differently depending on their meaning.

Rotations are added:

```js
frame.rotation += effectRotation;
```

Offsets are added:

```js
frame.offsetX += effectOffsetX;
frame.offsetY += effectOffsetY;
```

Scales are multiplied:

```js
frame.scaleX *= effectScale;
frame.scaleY *= effectScale;
```

Opacity is multiplied:

```js
frame.alpha *= effectAlpha;
```

Filters are appended to a Canvas filter string:

```js
frame.filters.push("hue-rotate(90deg)");
frame.filters.push("saturate(1.45)");
```

Processor and overlay callbacks are appended to arrays and executed in that same order.

This means combinations are compositional, but they are not mathematically commutative.

Pixelating and then glitching an image is not necessarily identical to glitching and then pixelating it. The implementation consistently chooses the registered order so that the result does not depend on click history.

---

K00 Animation Time and the Wave Function

---

The engine uses `requestAnimationFrame`, with an additional gate that limits completed favicon renders to approximately 30 frames per second.

The animation clock is expressed in seconds:

```js
frame.time =
  ((timestamp - startTimestamp) / 1000) * masterSpeed;
```

Most repeating effects use the shared wave function:

```js
wave(time, speed, phase) =
  (Math.sin(time * speed * 2 * Math.PI + phase) + 1) / 2;
```

The result moves smoothly between `0` and `1`.

At a speed of `1`, the wave completes approximately one cycle per second.

At a speed of `0.5`, it completes one cycle every two seconds.

A phase value allows several objects to use the same timing while reaching their peaks at different moments. Sparkles use this to avoid flashing in unison.

The frame also contains `delta`, the elapsed time since the previous completed render, capped at `0.1` seconds:

```js
frame.delta = Math.min(rawDelta, 0.1);
```

None of the current built-in effects depend on `delta`, but custom effects can use it for incremental simulations.

---

L00 Master Speed and Master Intensity

---

Master speed multiplies the animation clock.

```js
FaviconFX.setMasterSpeed(2);
```

This makes time-based effects run at approximately twice their normal rate.

The accepted range is clamped between `0.1` and `4`.

Master speed affects effects that derive their behavior from `frame.time`. It does not create motion in static effects. Neon, for example, uses fixed contrast, saturation, and brightness values, so changing master speed does not visibly change Neon by itself.

Master intensity is stored in:

```js
frame.intensity;
```

The accepted range is clamped between `0.1` and `2`.

In the current implementation, intensity is not automatically applied to every effect. An effect must explicitly use `frame.intensity`.

The built-in effects that currently respect master intensity are Wobble, Pulse, Orbit, and Shake.

Spin does not currently use master intensity. Color filters, texture processors, and overlays also generally ignore it.

This is an important distinction. The control is a shared parameter available to effects, not a final post-processing multiplier over the entire frame.

A future revision could define more uniform intensity semantics, but the present API leaves that decision to each effect.

---

M00 Motion Effects

---

`Spin` applies continuous rotation.

Its defaults are:

```js
{
  speed: 0.55,
  direction: 1
}
```

The rotation formula is:

```js
rotation =
  time * speed * direction * 2 * Math.PI;
```

A speed of `1` represents one full rotation per second. Negative speed or a negative direction reverses the rotation.

Example:

```js
FaviconFX.setEffect("spin", true, {
  speed: 0.2,
  direction: -1
});
```

This creates a slow counterclockwise rotation.

`Wobble` rotates back and forth rather than continuously.

Its defaults are:

```js
{
  speed: 1.8,
  degrees: 18
}
```

The angular displacement is approximately:

```text
sin(time * speed * 2 * PI)
* degrees
* masterIntensity
```

Wobble is useful when full rotation would make the icon difficult to recognize. It preserves an obvious upright orientation while giving the tab a restless or uncertain character.

`Pulse` scales the icon around its center.

Its defaults are:

```js
{
  speed: 1.2,
  amount: 0.24
}
```

The scale is:

```text
1
+ sin(time * speed * 2 * PI)
* amount
* masterIntensity
```

With the default amount, the source moves between roughly `0.76` and `1.24` scale at intensity `1`.

The Canvas itself remains 64 by 64 pixels. Scaling above `1` can crop the outer parts of the favicon because the image expands beyond that fixed surface.

`Orbit` moves the favicon around the Canvas center.

Its defaults are:

```js
{
  speed: 0.8,
  radius: 5
}
```

The position is calculated from a circular path:

```js
x = Math.cos(angle) * radius * intensity;
y = Math.sin(angle) * radius * intensity;
```

where:

```js
angle = time * speed * 2 * Math.PI;
```

The source does not orbit around the browser tab itself. It moves within the 64 by 64 favicon bitmap.

`Shake` uses two high-frequency sinusoidal movements with different constants.

Its defaults are:

```js
{
  speed: 19,
  amount: 2.5
}
```

The horizontal and vertical movements intentionally use different frequencies:

```js
x = Math.sin(time * speed * 7.13) * amount * intensity;
y = Math.cos(time * speed * 5.71) * amount * intensity;
```

Because the frequencies do not match, the result feels irregular without requiring a random number on every frame.

This makes Shake visually unstable while remaining deterministic for a given time.

---

N00 Color Effects

---

`Hue Cycle` continuously rotates colors around the hue wheel and increases saturation.

Its defaults are:

```js
{
  speed: 0.25,
  saturation: 1.45
}
```

The hue angle is:

```text
time * speed * 360 degrees
```

At the default speed, one complete hue cycle takes approximately four seconds.

The effect appends two filters:

```js
frame.filters.push(`hue-rotate(${angle}deg)`);
frame.filters.push(`saturate(${params.saturation})`);
```

It works best on colorful icons. A black, white, or low-saturation favicon may show little hue movement because there is not much chromatic information to rotate.

`Fade` oscillates the source opacity.

Its defaults are:

```js
{
  speed: 0.8,
  minimum: 0.16
}
```

Its opacity is interpolated between `minimum` and `1`:

```js
alpha = lerp(minimum, 1, wave(time, speed));
```

The engine clamps final alpha to at least `0.02`, so an effect combination cannot make the favicon fully transparent through the normal source-rendering path.

Overlays are drawn afterward and are not affected by the source alpha. A nearly invisible favicon can therefore still show a fully visible badge, halo, or pair of eyes.

`Negative` animates the Canvas `invert()` filter.

Its default is:

```js
{
  speed: 1.1
}
```

The invert amount moves between `0` and `1`.

At `0`, the colors are unchanged.

At `1`, the colors are fully inverted.

Intermediate values produce a gradual movement through partially inverted colors rather than a binary flashing effect.

`Neon` is a static color treatment.

Its defaults are:

```js
{
  contrast: 1.55,
  saturation: 2.4
}
```

It appends:

```text
contrast(1.55)
saturate(2.4)
brightness(1.12)
```

Neon does not animate by itself. It becomes more expressive when combined with Hue Cycle, Pulse, Halo, or Glitch.

Because filters are applied sequentially, changing the order in which filters are registered could change the output. In the built-in engine, Hue Cycle and Negative are applied before Neon.

---

O00 Texture Effects

---

`Pixelate` temporarily downsamples the composed image and scales it back up with image smoothing disabled.

Its defaults are:

```js
{
  pixels: 9,
  speed: 0.6
}
```

The intermediate resolution changes over time:

```js
animated =
  Math.round(pixels + wave(time, speed) * 7);
```

The value is never allowed below `3`.

With the default parameters, the favicon is repeatedly reduced to approximately 9 through 16 pixels per side and then expanded back to 64 by 64 pixels.

The enlarged pixels create the blocky appearance.

`Glitch` copies thin horizontal slices and redraws them with animated horizontal offsets.

Its defaults are:

```js
{
  slices: 7,
  amount: 8,
  speed: 11
}
```

Each slice receives a deterministic vertical location, height, and horizontal displacement.

The effect does not erase the original frame before shifting slices. It paints displaced strips over the existing image. This preserves the main icon while producing tearing and duplication.

Larger `amount` values create wider displacement. Larger `slices` values create denser tearing. Larger `speed` values make the pattern change more rapidly.

`Mirror` copies part of the frame, flips it horizontally, and blends it over the opposite side.

Its default is:

```js
{
  speed: 0.5
}
```

The dividing line moves between approximately 32 percent and 68 percent of the favicon width.

The mirrored copy uses an alpha of `0.72`, so the result is a blend rather than a hard replacement.

The effect can be subtle on symmetrical logos and much more visible on text, letters, arrows, or asymmetric symbols.

`Trail` maintains a separate Canvas containing previous frames.

Its default is:

```js
{
  persistence: 0.82
}
```

On each frame, the trail surface is darkened by:

```js
1 - persistence;
```

The current frame is then added using the `lighter` composite mode.

A high persistence value causes older bright pixels to remain visible for longer. A lower persistence value clears the history more quickly.

Trail is especially noticeable with Orbit, Shake, Spin, Pulse, Halo, or Sparkles. On a completely static favicon, there is little movement to reveal.

The trail buffer is cleared by `clearEffects()`. It is not cleared merely by pausing or restoring the favicon.

---

P00 Overlay Effects

---

`Sparkles` draws small white crosses around the favicon.

Its defaults are:

```js
{
  count: 7,
  speed: 1.5
}
```

Each sparkle uses a different angle, radius, phase, opacity, and size. The angular spacing uses approximately `2.399` radians, which spreads a small number of points around the center without placing them in obvious rows.

The horizontal and vertical bars are drawn separately:

```js
context.fillRect(...);
context.fillRect(...);
```

A small shadow blur gives them a brighter appearance at favicon scale.

`Scanline` draws a narrow vertical gradient band that moves downward through the icon.

Its defaults are:

```js
{
  speed: 0.8,
  width: 9
}
```

The band begins above the Canvas and travels beyond its bottom edge before repeating.

The gradient is transparent at both ends and brightest in the center. This avoids a hard rectangular edge and produces something closer to a moving reflection or display scan.

`Halo` draws a colored ring near the outer edge of the favicon.

Its default is:

```js
{
  speed: 0.65
}
```

The hue changes over time:

```text
(time * speed * 180) modulo 360
```

Its opacity also oscillates.

The ring radius is approximately 44 percent of the Canvas size, so it sits near the favicon boundary while leaving a small margin.

`Alert Badge` draws a red circle in the upper-right area of the generated icon.

Its defaults are:

```js
{
  text: "!",
  speed: 1.3
}
```

The badge radius pulses between approximately 9 and 11 pixels.

Only the first two characters of `text` are drawn:

```js
String(params.text).slice(0, 2);
```

Examples:

```js
FaviconFX.setEffect("badge", true, {
  text: "7"
});
```

```js
FaviconFX.setEffect("badge", true, {
  text: "99"
});
```

Longer strings are intentionally truncated because they would not remain legible.

The badge is decorative. Favicon update throttling, browser caching, and background-tab behavior make it unsuitable as the only notification channel.

`Googly Eyes` draws two white eyes and moving dark pupils.

Its default is:

```js
{
  speed: 1.4
}
```

The pupils move together using horizontal and vertical sine waves with slightly different frequencies. This prevents the gaze from tracing a perfectly repetitive circle.

The eyes are overlays, so they stay upright even when the source icon is spinning or wobbling underneath them.

This separation is part of the joke: the logo moves, but the eyes behave like a face attached to the final frame.

---

Q00 Presets

---

A preset is a named collection of enabled effects and parameter overrides.

Playing a preset first clears all active effects and restores every effect's parameters to its registered defaults. The selected preset is then applied from a clean state.

`Disco` combines Spin, Hue Cycle, Pulse, Sparkles, and Halo.

It is the broadest introductory preset because it demonstrates transform, color, and overlay stages at the same time.

`Glitch Party` combines Glitch, a faster Hue Cycle, a restrained Shake, and Scanline.

The favicon remains broadly recognizable, but the visual surface behaves like a damaged display.

`Haunted` combines a slow Wobble, deep Fade, slow Negative cycle, and Trail.

The effect is deliberately unstable and dim. The trail preserves fading fragments while the color inversion moves slowly through the image.

`Cosmic` combines Orbit, slow reverse Spin, slow Hue Cycle, Halo, and additional Sparkles.

The source drifts around the center while the overlays create a small orbital scene.

`Alarm` combines strong Shake, fast Pulse, Alert Badge, and Neon.

This is the most attention-seeking built-in preset. It is visually suitable for a demonstration, but it should not be treated as a dependable alert mechanism.

`Retro` combines Pixelate, Scanline, reduced Neon saturation, and a small Wobble.

The result resembles a tiny low-resolution display rather than a modern static favicon.

A preset can be activated programmatically:

```js
FaviconFX.playPreset("cosmic");
```

After a preset is selected, every effect remains independently controllable:

```js
FaviconFX.playPreset("cosmic");
FaviconFX.setEffect("eyes", true);
FaviconFX.setEffect("sparkles", false);
```

---

R00 Random Combinations

---

The Surprise control calls:

```js
FaviconFX.surprise();
```

This clears the current composition and enables between two and five randomly selected effects.

The method returns the selected effect names:

```js
const selected = FaviconFX.surprise();

console.log(selected);
// Example: ["orbit", "negative", "eyes"]
```

The randomization is intended for discovery rather than reproducibility.

The current implementation uses a random array sort before selecting the first items. This is adequate for a playful feature, but it is not a statistically rigorous shuffle.

A caller that needs repeatable combinations should choose effect names directly or implement a seeded selection function outside the engine.

---

S00 Public API

---

The active engine is available as:

```js
window.FaviconFX;
```

Most mutating methods return the API object, allowing calls to be chained.

For example:

```js
FaviconFX
  .clearEffects()
  .setEffect("spin", true, { speed: 0.3 })
  .setEffect("hue", true, { speed: 0.15 })
  .setEffect("halo", true);
```

`registerEffect(name, definition)` adds or replaces an effect definition.

```js
FaviconFX.registerEffect("example", {
  label: "Example",
  category: "Custom",
  defaults: {
    speed: 1
  },
  apply(frame, params) {
    // Modify frame here.
  }
});
```

Effect names are Map keys. The current implementation does not reject duplicates. Registering another effect with an existing name replaces the previous definition and resets that effect's enabled state and parameters.

`registerPreset(name, definition)` adds or replaces a preset.

```js
FaviconFX.registerPreset("quiet", {
  label: "Quiet",
  effects: {
    pulse: {
      speed: 0.4,
      amount: 0.08
    },
    fade: {
      speed: 0.25,
      minimum: 0.7
    }
  }
});
```

`setEffect(name, enabled, params)` enables or disables an effect and merges parameter values into its current parameters.

```js
FaviconFX.setEffect("spin", true, {
  speed: 0.8
});
```

The `enabled` argument defaults to `true`.

Disabling an effect does not reset its parameters:

```js
FaviconFX.setEffect("spin", false);
FaviconFX.setEffect("spin", true);
```

The second call reuses the previously configured speed and direction.

`toggleEffect(name)` reverses the enabled state.

```js
FaviconFX.toggleEffect("eyes");
```

`setEffectParams(name, params)` updates parameters without enabling or disabling the effect.

```js
FaviconFX.setEffectParams("badge", {
  text: "12",
  speed: 0.5
});
```

Parameters are shallowly merged. They are not validated against a schema, and unknown properties are retained.

`clearEffects()` disables every effect, resets all effect parameters to registered defaults, and clears the trail Canvas.

```js
FaviconFX.clearEffects();
```

`playPreset(name)` clears the active composition and applies the named preset.

```js
FaviconFX.playPreset("retro");
```

`surprise()` clears the composition, activates a random set of effects, and returns their names.

`start()` loads the source favicon when needed, disables the original icon links, attaches the generated favicon, and starts animation.

Because source acquisition is asynchronous on the first invocation, `start()` returns a promise:

```js
await FaviconFX.start();
```

`stop(options)` stops animation.

Its default behavior restores the original favicon:

```js
FaviconFX.stop();
```

That is equivalent to:

```js
FaviconFX.stop({
  restore: true
});
```

To pause on the most recently rendered frame without restoring the original favicon:

```js
FaviconFX.stop({
  restore: false
});
```

`destroy()` stops the engine, restores the favicon, clears listeners, and removes `window.FaviconFX`.

Calling the engine's `destroy()` directly does not remove the visible panel host or the application key. The panel's close button calls the higher-level application cleanup that destroys both parts. Programmatic consumers that need complete cleanup should use:

```js
window.__FAVICON_FX_BOOKMARKLET__.destroy();
```

`getState()` returns a serializable snapshot.

`on(eventName, listener)` subscribes to an engine event and returns an unsubscribe function.

`setMasterSpeed(value)` sets the global time multiplier.

`setMasterIntensity(value)` sets the shared intensity value available to effects.

---

T00 State Inspection

---

A state snapshot has the following general shape:

```js
const state = FaviconFX.getState();

console.log(state);
```

```js
{
  running: true,
  size: 64,
  fps: 30,
  masterSpeed: 1,
  masterIntensity: 1,
  sourceInfo: {
    sourceUrl: "https://example.com/favicon.ico",
    usedFallback: false
  },
  effects: [
    {
      name: "spin",
      label: "Spin",
      category: "Motion",
      enabled: true,
      params: {
        speed: 0.45,
        direction: 1
      }
    }
  ],
  presets: [
    {
      name: "disco",
      label: "Disco"
    }
  ]
}
```

The returned objects are copies suitable for inspection and serialization. Modifying the returned state does not directly modify the engine.

This does not work:

```js
const state = FaviconFX.getState();

state.masterSpeed = 4;
state.effects[0].enabled = false;
```

The correct approach is:

```js
FaviconFX.setMasterSpeed(4);
FaviconFX.setEffect(state.effects[0].name, false);
```

---

U00 Events

---

The engine exposes a small event bus.

A subscription looks like:

```js
const unsubscribe = FaviconFX.on(
  "statechange",
  (state) => {
    console.log(state);
  }
);
```

The returned function removes that listener:

```js
unsubscribe();
```

The current events are `statechange`, `preset`, `frame`, `start`, and `stop`.

`statechange` is emitted when an effect, effect parameter, master speed, or master intensity changes.

`preset` is emitted after a preset has been applied.

```js
FaviconFX.on("preset", ({ name, label }) => {
  console.log(`Preset selected: ${label} (${name})`);
});
```

`frame` is emitted after each completed Canvas frame.

```js
FaviconFX.on("frame", (frame) => {
  console.log(frame.time);
});
```

A frame listener can run up to approximately 30 times per second. Expensive work inside this listener will compete with rendering and page responsiveness.

`start` is emitted after source acquisition and animation startup.

`stop` is emitted after animation has stopped and any requested restoration has occurred.

Effect and preset registration do not currently emit `statechange`. Newly registered items appear immediately in `getState()`, but the built-in panel may not redraw until another state-changing action occurs.

---

V00 Writing a Custom Transform Effect

---

A custom effect receives the mutable frame description and its current parameter object.

This example adds a gentle horizontal breathing motion:

```js
FaviconFX.registerEffect("drift", {
  label: "Drift",
  category: "Custom",
  defaults: {
    speed: 0.35,
    distance: 4
  },
  apply(frame, params) {
    frame.offsetX +=
      Math.sin(frame.time * params.speed * Math.PI * 2)
      * params.distance
      * frame.intensity;
  }
});
```

It can then be enabled normally:

```js
FaviconFX.setEffect("drift", true, {
  distance: 7
});
```

A custom transform effect should normally modify frame properties rather than drawing directly.

Useful transform properties are:

```text
rotation
scaleX
scaleY
offsetX
offsetY
alpha
filters
```

For predictable composition, a custom effect should add to rotations and offsets, multiply scales and alpha, and append filters.

Replacing a value outright is allowed, but it can erase contributions from effects registered earlier.

For example:

```js
frame.rotation = 0;
```

This would cancel all rotation accumulated before that effect.

---

W00 Writing a Custom Overlay Effect

---

An overlay is useful when the visual should be drawn after the favicon and after all texture processors.

This example draws a small progress ring:

```js
FaviconFX.registerEffect("progress-ring", {
  label: "Progress Ring",
  category: "Custom",
  defaults: {
    progress: 0.72,
    width: 4
  },
  apply(frame, params) {
    frame.overlays.push((context, currentFrame) => {
      const progress = Math.max(
        0,
        Math.min(1, Number(params.progress) || 0)
      );

      context.save();
      context.strokeStyle = "white";
      context.lineWidth = params.width;
      context.lineCap = "round";
      context.globalAlpha = 0.9;

      context.beginPath();
      context.arc(
        currentFrame.center,
        currentFrame.center,
        currentFrame.size * 0.42,
        -Math.PI / 2,
        -Math.PI / 2 + Math.PI * 2 * progress
      );
      context.stroke();
      context.restore();
    });
  }
});
```

Usage:

```js
FaviconFX.setEffect("progress-ring", true, {
  progress: 0.35
});
```

Update it later:

```js
FaviconFX.setEffectParams("progress-ring", {
  progress: 0.8
});
```

The engine does not automatically provide application progress. The caller is responsible for obtaining or calculating that value.

---

X00 Writing a Custom Processor

---

A processor modifies the completed source raster before overlays are drawn.

This example adds a simple posterization effect:

```js
FaviconFX.registerEffect("posterize", {
  label: "Posterize",
  category: "Custom",
  defaults: {
    levels: 4
  },
  apply(frame, params) {
    frame.processors.push((context, currentFrame) => {
      const image = context.getImageData(
        0,
        0,
        currentFrame.size,
        currentFrame.size
      );

      const levels = Math.max(
        2,
        Math.round(params.levels)
      );

      const step = 255 / (levels - 1);

      for (
        let index = 0;
        index < image.data.length;
        index += 4
      ) {
        image.data[index] =
          Math.round(image.data[index] / step) * step;

        image.data[index + 1] =
          Math.round(image.data[index + 1] / step) * step;

        image.data[index + 2] =
          Math.round(image.data[index + 2] / step) * step;
      }

      context.putImageData(image, 0, 0);
    });
  }
});
```

This is practical at 64 by 64 pixels, but per-pixel effects still run on every rendered frame.

A processor should avoid unnecessary Canvas allocation, DOM access, network access, or asynchronous operations inside the frame loop.

When an effect needs external data, that data should be acquired outside `apply()` and stored in parameters or a closure before rendering begins.

---

Y00 Custom Presets

---

A custom preset is a declarative map of effect names to parameter overrides.

```js
FaviconFX.registerPreset("tiny-creature", {
  label: "Tiny Creature",
  effects: {
    eyes: {
      speed: 2
    },
    wobble: {
      speed: 0.7,
      degrees: 8
    },
    pulse: {
      speed: 0.5,
      amount: 0.08
    }
  }
});
```

Activate it with:

```js
FaviconFX.playPreset("tiny-creature");
```

A value of `true` means that the effect should be enabled with its current default parameters:

```js
effects: {
  halo: true,
  sparkles: true
}
```

An object enables the effect and merges the provided parameters:

```js
effects: {
  halo: {
    speed: 0.2
  }
}
```

Preset application is not additive. It begins with `clearEffects()`.

To add a group of effects without removing the current composition, call `setEffect()` for each effect instead of registering a preset.

---

Z00 Panel Behavior

---

The panel is fixed to the upper-right corner and starts at a width of 320 pixels.

Its maximum height is constrained to the viewport. The content area scrolls when the complete list of controls does not fit.

The header supports pointer-based dragging. Movement is clamped so that the panel cannot be dragged fully outside the visible viewport.

The collapse button hides only the panel content. The header remains available so the panel can be expanded again.

The close button destroys the complete application.

Effect buttons represent enabled state. Active effects receive a distinct gradient appearance.

Preset buttons replace the current combination.

Random Combo clears the current combination and chooses a new one.

Reset Effects disables everything and restores registered effect defaults. It does not restore the original page favicon. The result is a static generated copy of the source favicon until another effect is enabled or the original favicon is restored.

Pause calls:

```js
engine.stop({
  restore: false
});
```

The most recently generated favicon remains visible.

Resume calls `engine.start()`.

The current implementation resets the animation clock when resumed. Effects restart from time zero rather than continuing from the exact previous phase. The source Canvas and effect settings are preserved.

Restore Favicon calls:

```js
engine.stop({
  restore: true
});
```

The panel remains open, the engine remains available, and Resume can reactivate the generated favicon without reloading the source image.

---

AA00 Lifecycle Details

---

The first call to `start()` loads the source favicon asynchronously.

Later calls reuse the cached source Canvas.

The source image is therefore a snapshot. If the website changes its favicon after Favicon FX has loaded it, restarting the engine continues to animate the original captured image.

`start()` does nothing when the engine is already running.

`stop()` can be called repeatedly.

`destroy()` is intended to be final. After destruction, the engine cannot be restarted.

There is a small asynchronous edge case in the current implementation. The destroyed state is checked before favicon loading begins, but it is not checked again immediately after the awaited image load.

If the application is destroyed while its first favicon is still loading, the pending startup can theoretically continue after loading completes. A future revision should re-check `destroyed` after `await createSourceCanvas(size)`.

The intended pattern is:

```js
if (!sourceCanvas) {
  const source = await createSourceCanvas(size);

  if (destroyed) {
    return api;
  }

  sourceCanvas = source.canvas;
}
```

---

AB00 Error Behavior

---

Methods that require an effect or preset name throw when the name is unknown.

For example:

```js
FaviconFX.setEffect("does-not-exist", true);
```

This throws an error similar to:

```text
Unknown favicon effect: does-not-exist
```

The same applies to `toggleEffect()`, `setEffectParams()`, and `playPreset()`.

`registerEffect()` does not currently validate the complete definition.

A missing `apply` function does not fail during registration. It fails later when the effect is enabled and the renderer attempts to call it.

Custom extensions should therefore provide at least:

```js
{
  label: "Readable Label",
  category: "Custom",
  defaults: {},
  apply(frame, params) {
    // Effect behavior.
  }
}
```

Errors thrown inside an effect's `apply`, processor, overlay, or frame listener are not isolated per plugin. They can interrupt the current render callback.

Custom effect code should handle uncertain inputs and keep its per-frame path small.

---

AC00 Performance Model

---

The renderer works on a 64 by 64 Canvas and limits completed frames to approximately 30 frames per second.

This keeps the raw pixel area small:

```text
64 * 64 = 4,096 pixels
```

At 30 frames per second, a full-frame pixel processor examines approximately:

```text
4,096 * 30 = 122,880 pixels per second
```

That is modest for a modern desktop browser, although PNG encoding and repeated favicon assignment add overhead beyond pixel processing.

The expensive step is not only drawing. Every completed frame calls:

```js
frameCanvas.toDataURL("image/png");
```

PNG serialization happens synchronously.

The result is then assigned to the dynamic favicon link. Browsers may perform additional decoding, caching, and tab-interface work.

Multiple processors increase the amount of Canvas copying. Trail maintains an additional persistent Canvas. Pixelate uses scratch and reduced-resolution canvases. Glitch and Mirror copy the frame before modifying it.

The design favors clarity and composability over maximum throughput.

Custom effects should not assume that a small Canvas makes all work free. DOM queries, layout reads, large allocations, logging every frame, and synchronous storage operations can still make the page noticeably less responsive.

---

AD00 Browser Behavior and Restrictions

---

Favicon behavior is controlled partly by the page and partly by the browser chrome.

The engine can request 30 visual updates per second, but the browser is free to display fewer.

Background tabs may receive reduced animation scheduling.

Some browsers cache favicon URLs aggressively.

Some browsers update the tab icon only after a delay.

Some environments may display the favicon at 16 by 16 pixels even though the generated PNG is 64 by 64.

A strict Content Security Policy may block `javascript:` bookmarklets, data URLs, or related operations.

Bookmarklets generally cannot run on privileged browser pages such as settings pages, extension stores, new-tab internals, or other protected URLs.

Some websites may immediately rewrite their favicon links, interfering with the generated link.

A page may remove the panel host or replace `window.FaviconFX`.

These are platform constraints rather than failures that the effect API can completely hide.

---

AE00 Privacy and Network Activity

---

The bookmarklet contains no telemetry, analytics, cookies, storage writes, remote script loading, or external application service.

It attempts to load only favicon URLs already declared by the page and the conventional `/favicon.ico` path on the current origin.

A cross-origin favicon request may still contact the server that hosts that favicon. This is normal image loading initiated from the current page context.

The bookmarklet does not send the favicon to a proxy.

It does not send page content, browsing history, effect selections, or API activity to the package author.

Because the code runs inside the current page, the page itself may observe DOM changes, favicon changes, global variables, Canvas activity, and panel insertion.

The privacy boundary is therefore "no added external service," not "invisible to the current website."

---

AF00 What Favicon FX Should Not Be Used For

---

Favicon FX should not be used as the only indicator of a critical state.

A user can hide the tab, disable animation, close the bookmarklet, use a browser that throttles favicon updates, or view the page in an environment that does not display favicons normally.

A badge is not a dependable unread-message counter.

A shake is not a dependable production alarm.

A progress ring is not a substitute for accessible progress text inside the page.

Rapid animation may also be uncomfortable or distracting for some users. The Pause and Restore controls are therefore part of the core behavior, not optional extras.

The tool is best suited to demonstrations, experiments, local visual customization, prototyping, and playful temporary feedback.

---

AG00 Product Direction and Additional Effects

---

The existing engine already supports many additional effects without architectural changes.

A pendulum effect could use sinusoidal rotation with a slight vertical offset. Unlike Wobble, the rotation center could be moved toward the top of the icon to create the impression that the favicon is hanging from a point.

A bounce effect could move vertically using the absolute value of a sine wave:

```text
y = -abs(sin(time * speed * PI)) * height
```

A squash component could reduce vertical scale and increase horizontal scale at the moment of impact.

A chromatic split processor could draw red, green, and blue channel copies with small independent offsets. It would combine particularly well with Glitch and Shake.

A mosaic effect could divide the favicon into tiles and rotate or offset each tile independently.

A kaleidoscope effect could copy triangular or quadrant regions with mirrored transforms.

An edge-glow effect could calculate luminance differences between neighboring pixels, preserve strong boundaries, and draw them with additive blending.

A dissolve effect could use deterministic noise to remove or reveal pixels over time.

A liquid effect could redraw horizontal rows with sine-based displacement:

```text
shiftY =
  sin(row * frequency + time * speed)
  * amplitude
```

A comet effect could place a bright point on a circular path and leave a fading tail.

An equalizer overlay could draw several bars with independent phases. It would not represent real audio unless the caller supplied audio data, but it could provide a compact rhythmic animation.

A clock overlay could draw hour and minute hands from the current local time. This would make the favicon informative, although legibility would vary by browser scaling.

A countdown ring could accept a deadline and calculate remaining progress outside the render function.

A state badge could support semantic labels such as `OK`, `DEV`, `CI`, or `!`, while keeping the existing two-character limit.

A corner-peel effect could reveal an alternate color or icon beneath the main source.

A blink effect could periodically close the Googly Eyes by reducing their vertical radius.

A mood system could combine eye direction, eyelid shape, wobble, and color treatment into expressions such as sleepy, suspicious, excited, or alarmed.

The strongest additions are those that remain recognizable at very small sizes and compose cleanly with the existing transform, processor, and overlay stages.

---

AH00 The Central Design Principle

---

Favicon FX treats the original favicon as immutable source material.

Effects describe changes to a frame.

The engine decides when and in what order those changes are rendered.

The panel calls the engine rather than owning rendering behavior.

Restoration operates on the original favicon links rather than trying to reconstruct them later.

That separation keeps the bookmarklet understandable despite being packaged as one self-contained function.

It also leaves a useful path for extension. A developer can add an effect without rewriting favicon acquisition. A new panel could control the same engine. An external script can inspect state without reaching into private Canvas objects. A preset can combine existing effects without creating another rendering path.

The result is deliberately small in scope: one page, one favicon source, one generated favicon link, one frame pipeline, and one temporary runtime.

Within that scope, it provides enough structure to support both casual experimentation and serious technical exploration.
