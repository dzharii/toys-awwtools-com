# A00 / Mobile browser decisions

The apps are static browser clients. They use Pointer Events for gesture handling, native HTML controls for alternatives, and no privileged device APIs. No location, camera, microphone, contacts, notifications, or sensor permission is requested.

## B00 / Gestures and scrolling

Paper swipes and comparison drags use `touch-action: pan-y`, leaving vertical page movement to the browser. The dial reserves its ring for angular manipulation and permits browser pinch zoom with `touch-action: pinch-zoom`. The rest of the page scrolls normally. Pointer capture keeps a gesture coherent when the finger leaves the original element; `pointercancel` ends the gesture without accidentally completing a swipe.

The dial unwraps angular changes, limits momentum, decays velocity with frame time, and snaps to six category detents. Its center does not start a drag. Previous/next buttons and keyboard arrows select the same categories. Folio swipes have directional thresholds and ignore interactive children. The comparison also has a native keyboard-operable range input. The atlas offers a native select in addition to spatial hotspots.

Sources: https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/touch-action , https://developer.mozilla.org/en-US/docs/Web/API/Pointer_events , https://developer.mozilla.org/en-US/docs/Web/API/Element/setPointerCapture .

## C00 / Motion and sound

CSS transitions and page effects honor `prefers-reduced-motion`. A local Less movement switch can request additional stillness; it cannot override an operating-system request for reduced motion. JavaScript gesture code checks the same preference before momentum or card-dismissal animation.

Sound is off by default. A low-volume, short Web Audio tone is created only after an explicit interaction and the optional sound preference. Audio failures are caught and never prevent navigation. The cues have a rate limit, a short envelope, and no repeating soundtrack.

Sources: https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/prefers-reduced-motion and https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Autoplay .

## D00 / Browser boundaries

The viewport allows normal user zoom. Bottom controls include safe-area insets. Dialog height uses dynamic viewport units and has its own scrolling area. Text-entry controls use 16px type to avoid unnecessary phone focus zoom. Visual main flows provide alternative access to the full catalogue in a normally flowing panel.

External query launches use same-tab navigation, avoiding asynchronous popup blockers. Other external links are ordinary anchors with `noopener noreferrer`. Native OS and browser settings are described, not written. Device compatibility labels refer to the method's scope and are not evidence of a test on that device.

Local storage is isolated per design, guarded by exception handling, and limited to entry IDs and preferences. `file:` storage behavior differs by browser, so a local static HTTP server is recommended. Clipboard writes may require a secure context or user activation; the selectable destination field is the fallback.

Source: https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage .

## E00 / Deliberate limits

No service worker is registered. The bundle can load from local disk, but it does not promise offline installation, cache external results, or proxy external services. There are no custom fonts or code loaded from a CDN. Some newly documented features, including Firefox Android controls, remain subject to platform/version rollout.

The code targets modern browser capabilities. Real-device testing and an accessibility audit were outside the requested validation scope. Tiny ornamental type follows the visual references; the action sheet provides full instructions in normal reading sizes. No claim of certified accessibility is made.
