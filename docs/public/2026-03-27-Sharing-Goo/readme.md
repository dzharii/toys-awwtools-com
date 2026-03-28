# Sharing Goo

Fullscreen browser scene for dropping or pasting URLs into a luminous reservoir. Each accepted link lands on the surface as a small in-world token, drifts for a while, and then sinks over real elapsed time with local persistence.

Highlights:

- Canvas-rendered vessel scene that shifts from a circular well on larger screens to a tall cistern on portrait mobile.
- Height-field liquid with delayed pointer response, localized impact ripples, and depth-tinted magenta shading.
- Drag-and-drop plus paste support for `http` and `https` URLs, with tokens that stay clickable while visible.
- localStorage persistence keyed by creation time so sink depth continues progressing between visits.
- Low-volume Web Audio hum and soft impact sounds that unlock on first interaction, plus a mute toggle.

Notes:

- Stored items remain local to the browser profile on the current device.
- Reduced-motion preferences lower the amount of idle drift and interaction motion.
