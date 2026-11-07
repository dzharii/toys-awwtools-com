---
file: "web/components/SourceView.astro"
---

The source component displays a requested contiguous range of an actual file. File articles place prose before those ranges.

<!-- at: 1 -->
## Render exact highlighted lines without duplicating them

The generator provides one highlighted record per source line. Start/end indices select a slice while preserving IDs such as `L64`. The download link points to the complete raw file. The generated HTML is trusted only because it was built from escaped local source, and the post-build checker reconstructs every displayed line to verify equality.

