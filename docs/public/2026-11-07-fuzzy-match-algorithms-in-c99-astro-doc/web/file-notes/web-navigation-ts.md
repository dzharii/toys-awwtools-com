---
file: "web/navigation.ts"
---

This script manages three global preferences: text size, desktop navigation visibility and sidebar width. It does not change article content.

<!-- at: 1 -->
## Update root state, then persist it locally

CSS reads root attributes and the width variable. The drag handler captures its pointer so resizing continues outside the thin edge. Width stays between 200 pixels and the smaller of 420 pixels or 42% of the viewport. Arrow keys resize by 16 pixels, Shift uses 40, and Home restores 272. Storage failures leave current-page controls working. Mobile CSS ignores desktop collapse so the menu remains available.

