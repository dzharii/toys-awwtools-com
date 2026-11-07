---
file: "scripts/check_docs.py"
---

This checker validates the standalone offline reference. It complements the Starlight checker; it does not replace the published-site checks.

<!-- at: 1 -->
## Verify offline links and source copies

The script reads the offline manifest, extracts source lines and checks local files and fragments. It compares rendered text and downloaded files with their original bytes. Stable reference tags must resolve to definitions. Run it after the offline build when changing the shared renderer.

