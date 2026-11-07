---
file: "web/styles/reader.css"
---

This stylesheet adjusts Starlight's layout and typography. It keeps prose line length bounded while allowing source blocks to fill the main column.

<!-- at: 1 -->
## Allocate space to source and wrap every line

Source pages remove the centered maximum-width container and use small responsive gutters. Flex rows give line numbers a fixed width and let source text wrap into the remaining space. Desktop collapse changes the sidebar width, not the article margin. Mobile rules hide the desktop controls and contain wide tables in their own scrolling region. Focus outlines and reduced-motion rules apply to the custom controls.

