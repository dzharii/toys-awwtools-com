---
file: "web/components/ReaderSidebar.astro"
---

The sidebar wraps Starlight's navigation links with controls that belong to the navigation itself.

<!-- at: 1 -->
## Expose collapse and resize controls beside the links

Hide collapses the desktop navigation to a narrow rail with a Show button. The vertical separator is both a pointer-drag target and a keyboard control. Its ARIA value reports the current width. On small screens, Starlight's existing popover menu handles opening and closing; the desktop resize control is hidden.

