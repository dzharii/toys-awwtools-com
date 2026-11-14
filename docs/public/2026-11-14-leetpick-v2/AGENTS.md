# LeetPick

LeetPick is a buildless practice picker. Read docs/SPECIFICATION.md before changing behavior. Specification section letters are permanent; increment only edited sections' two-digit revisions.

The browser app is in dist/. core.js owns validated progress, filtering and random selection; progress-state.js owns the v2 local/backup envelope, legacy migration and manual/imported union; app.js owns presentation and transactional local storage. completion-control.js owns the delayed one-way action; celebration.js owns decorative wave/confetti and optional gesture-started audio. Preserve manual completion across same-account imports, never offer Unsolve, and retain account-switch confirmation. catalog.json contains spoiler-free reviewed entries only. bookmarklet.js is the readable LeetCode exporter; scripts/generate-bookmarklet.mjs generates dist/bookmarklet.txt and its browser module for the fixed Site origin.

dist/illustrations.json maps every catalog ID to its unique transparent PNG in dist/assets/illustrations/. Keep artwork free of solution algorithms. references/ contains four original user-supplied character sheets. docs/illustrations/checklist.json and prompts/ record production and review. Generate, review, optimize and integrate one problem at a time. Use scripts/finish-illustration.py after inspecting the generated image; inspect its light/dark proof before continuing. Do not mark placeholders complete.

dist/illustration-preview.js owns the desktop-only shared hover cloud. Keep its width/input media query aligned with styles.css and the row-layout breakpoint. It must stay non-interactive, hide on row replacement/scroll/Escape, and reject stale image decodes. Include this module in the offline builder when changing it.

docs/sharing/posts.json owns the handcrafted Leeter posts and fictional identities. scripts/build-share-pages.mjs emits a static dist/share/{id}-{slug}/index.html per problem; render-social-previews.py renders the matching JPEGs. share.css/share.js own the standalone dark view and copy/native sharing. Keep metadata in static HTML, use unique avatars, credit borrowed jokes, and never add fake real-world identities or engagement. Run python scripts/validate-sharing.py and the Node tests when changing sharing. Preserve legacy clearpick.progress.v1 and clearpick.theme keys and the existing origin during the LeetPick rebrand.

Regenerate offline.html with node scripts/build-offline.mjs whenever application code, catalog, styles or illustration mappings change. This entry point must work from an extracted folder without a server; image paths remain relative to dist/. It never changes the hosted bookmarklet destination.

Research evidence belongs in docs/research.json and docs/research-notes.md. Never publish solution reasoning in the practice UI. Admit only officially Medium or Hard problems with independently justified discovery and implementation scores <=2. Prefer a small defensible catalog to speculative additions. Record unresolved verification and coverage limits honestly.

Run node --test tests/*.test.mjs, node scripts/validate-catalog.mjs and python scripts/validate-illustrations.py after relevant changes. Check desktop/mobile portrait in light/dark themes for visible changes. Mock tests do not replace a signed-in LeetCode test. Keep credentials, full network captures, account snapshots and imported progress out of Git. Do not add a backend, tracking, account integration without a requirement change.

.openai/hosting.json holds the existing Site identity. Preserve it. Use the Site publication workflow and publish the exact tested commit. Never create a replacement Site for an update.
