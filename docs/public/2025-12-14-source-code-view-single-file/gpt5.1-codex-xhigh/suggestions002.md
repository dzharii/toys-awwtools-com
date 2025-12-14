# Fixes and suggestions iteration 2
Date: 2025-12-14

![image-20251214104547273](suggestions002.assets/image-20251214104547273.png)

This document defines two changes for the current loaded-project view: (1) make the project tree a true full-height, fixed sidebar while pinned, and (2) replace custom scroll navigation with native in-page anchor navigation based on stable file ids.

B00 Current issues observed (rev 00)

Issue 1: The project tree does not reliably occupy the full available sidebar height. The tree scroll area is constrained and does not feel like a persistent, full-height explorer.

Issue 2: Clicking a file in the tree does not consistently navigate to the correct file section in the code view. The current approach appears to rely on custom scroll logic that is brittle.

C00 Change 1: pinned sidebar must be full-height and sticky (rev 00)

Goal: When the sidebar is pinned, it must remain visible while the user scrolls the code, and the tree area must expand to fill all remaining vertical space in the sidebar.

Requirements
 C01 Pinned behavior. When pinned, the sidebar must be fixed or sticky relative to the viewport so it does not scroll out of view while reading code.

C02 Height model. The visible sidebar must occupy the full viewport height minus the top UI bars. Use a single computed height source of truth so the tree never overflows outside the viewport.

C03 Internal layout. Inside the pinned sidebar, only the tree list region scrolls. The sidebar header area (Navigator title, pin button) must remain visible.

C04 Tree region sizing. The tree list region must take all remaining space not used by the sidebar header. This must work across window resizes.

C05 Unpinned behavior. Unpin must behave as defined in Iteration 1: collapse to an edge handle, expand on hover as an overlay, and auto-collapse on pointer leave. Unpinned overlay must also fit the viewport height and have its own scroll for the tree.

C06 No double scroll traps. Avoid nested scrolling where both the main code pane and the page scroll compete. The pinned sidebar must remain stable regardless of the chosen scroll model in the main content.

Acceptance checks
 C10 With a loaded project, scrolling the code does not move the pinned sidebar. The tree remains visible.
 C11 Resizing the window updates sidebar height immediately. The tree region continues to fill remaining space and remains scrollable.

D00 Change 2: tree navigation must use native anchors (rev 00)

Goal: Replace custom "navigate to file" logic with standard in-page anchors using href="#id" and matching id attributes in the rendered code sections.

Requirements
 D01 Tree item elements. Render each file item as an anchor element with href="#<fileId>". Do not use span or div for clickable navigation.

D02 Target ids. Each rendered file section must expose a matching anchor target. The simplest form is to set id="<fileId>" on the file section container or its header. A separate empty anchor tag is acceptable but not required if the section header carries the id.

D03 Stable id generation. fileId must be deterministic and unique per file path. It must be safe for use in HTML id attributes. Use a clear, reversible mapping such as a prefix plus a sanitized path encoding. Do not rely on raw file names alone because duplicates can exist across directories.

D04 Hash update behavior. Clicking a tree item must update the URL hash and allow browser back and forward to move between visited file anchors.

D05 Correct scroll container. Anchor navigation must scroll to the correct location. If the code view currently uses an inner scroll container, change the layout so the document scroll is the primary scroll, or ensure anchors still scroll the visible content reliably. The expected behavior is that standard href="#id" produces the correct scroll without custom scroll computations.

D06 Visual focus. After navigation, the target file header must be visibly reachable and not hidden under sticky top bars. Use scroll-margin-top on file headers (or equivalent) so the header lands below the top UI.

D07 Active tree highlighting. When the current hash changes, highlight the corresponding file in the tree. Prefer aria-current="location" on the active anchor.

D08 Interaction parity. Left click navigates. Middle click and modifier click should behave like standard anchors where practical. If opening a new tab does not make sense for a single-file app, it must still not break the current page.

Acceptance checks
 D20 Clicking a file in the tree navigates to the correct file header every time.
 D21 The URL hash updates to the target file id.
 D22 Browser back and forward returns to previously visited file anchors.
 D23 The file header is not hidden under the top bars after navigation.

E00 Implementation notes and constraints (rev 00)

E01 File id format. Use a constant prefix like "file-" plus a safe encoding of the relative path. The encoding must avoid spaces and special characters that can create invalid ids. Ensure uniqueness even when two paths differ only by characters that would be collapsed by sanitization.

E02 Rendering contract. The element carrying the id must be present as soon as the file is rendered. If files render incrementally, tree links for files not yet rendered must either be disabled until the target exists or still be clickable but show a clear message "File not rendered yet" and retry once it appears. Prefer disabling until present to keep behavior strict.

E03 No search. Do not add or reintroduce any search-related UI or behavior while implementing these changes.

F00 Deliverables (rev 00)

F01 Sidebar behavior updated to full-height sticky pinned mode with a single scrollable tree region.

F02 Tree items switched to anchors with href hashes and code sections updated to expose matching ids, with correct offset handling under sticky UI.
