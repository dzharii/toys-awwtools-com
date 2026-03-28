# Sharing Goo Single Shot And Codex

Fullscreen browser scene for dropping or pasting URLs into a luminous stone reservoir. Each accepted link lands near the surface as a small in-world plaque, drifts for a while, and then slowly sinks based on real elapsed time.

Highlights:

- Canvas-rendered vessel scene with a circular well on larger screens and a tall cistern form on portrait mobile.
- Height-field liquid with delayed pointer response, drag-over receptivity, localized impact ripples, and depth-tinted magenta shading.
- Drag-and-drop plus paste support for `http` and `https` URLs, with clickable tokens that remain interactive while still visible.
- localStorage persistence keyed by creation time so sink depth continues progressing between visits.
- Low-volume Web Audio hum and soft impact audio that unlock after trusted interaction, with a reliable mute toggle.
- Reduced-motion support and a hidden accessible list of stored links for non-visual navigation.

Notes:

- Stored links stay local to the current browser profile and device.
- Clicking empty space focuses the hidden paste target so a normal paste command can add a URL.
