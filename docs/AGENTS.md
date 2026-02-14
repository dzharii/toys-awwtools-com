# AGENTS.md

Guide for maintaining `docs/index.html` in this static GitHub Pages repo.

## Purpose
- Keep `index.html` manually editable.
- Keep project listing clear, descriptive, and link-safe.
- Keep previews working (README + project iframe).

## Repository structure
- `index.html`: main project directory page.
- `style.css`: shared styles for the page and preview panel.
- `public/<project-folder>/`: individual project folders.
- `public/readme.md`: top-level note for `public/`.
- `unlisted/`: content not in main public index.

## `index.html` structure
- Sections are organized as:
  - `Toys`
  - `Games`
  - `Docs`
  - `Browser Extensions`
  - `Experiments`
- Each item is a `li.project-item` inside `ul.project-list`.
- Current preview logic is inline JS in `index.html`.

## Project item format
Use this exact shape for normal web projects (has `index.html`):

```html
<li class="project-item" data-project="2026-02-14-example" data-index-href="/public/2026-02-14-example/">
    <a class="project-link" href="/public/2026-02-14-example/">2026-02-14-example</a>
    <p class="item-desc">One-line human-readable summary of what this project does.</p>
    <p class="item-links"><a class="readme-link" href="/public/2026-02-14-example/readme.md">readme.md</a></p>
</li>
```

Use this shape when project has no `index.html`:
- Omit `data-index-href`.
- Point `project-link` to README (or another safe landing file).

```html
<li class="project-item" data-project="2026-02-14-source-only-example">
    <a class="project-link" href="/public/2026-02-14-source-only-example/readme.md">2026-02-14-source-only-example</a>
    <p class="item-desc">One-line summary.</p>
    <p class="item-links"><a class="readme-link" href="/public/2026-02-14-source-only-example/readme.md">readme.md</a></p>
</li>
```

## Preview behavior (current)
- Preview toggle: `#show-previews`.
- Session storage key: `toys_show_previews`.
- Hover target: `.project-item`.
- Delay constant: `projectPreviewDelayMs` (currently `2000`).
- After delay, both previews load together:
  - README iframe (`#readme-preview-frame`) from `.readme-link`.
  - Project iframe (`#project-preview-frame`) from `data-index-href`.
- If no `data-index-href`, only README preview is loaded and project preview shows unavailable status.

## How to add a new item when requested
1. Create project folder under `public/` using date-prefixed naming:
   - `public/YYYY-MM-DD-project-name/`
2. Ensure project files exist:
   - Always create README (`readme.md` preferred, `README.md` acceptable).
   - Create `index.html` if project is previewable as a web page.
3. Choose target section in `index.html`.
4. Add one `li.project-item` using one of the templates above.
5. Add a concise description sentence in `item-desc`.
6. Keep existing order unless explicitly asked to reorder.
7. Do not remove existing extra links (`bookmarklet.js`, `readme.html`, etc.) where relevant.

## Content rules for descriptions and README
- Description in index: one sentence, high-level, non-marketing.
- README: short overview + a few highlights.
- Do not call projects incomplete/experimental unless user asks.

## Validation checklist after edits
Run these checks from `docs/`:

```bash
# all local href targets must exist
node - <<'NODE'
const fs=require('fs');
const html=fs.readFileSync('index.html','utf8');
const hrefs=[...html.matchAll(/href="([^"]+)"/g)].map(m=>m[1]).filter(h=>h.startsWith('/'));
const missing=[];
for(const h of hrefs){
  const p='.'+h;
  if(h.endsWith('/')){ if(!fs.existsSync(p)||!fs.statSync(p).isDirectory()) missing.push(h); }
  else if(!fs.existsSync(p)) missing.push(h);
}
console.log('missing', missing.length);
if(missing.length) console.log(missing.join('\n'));
NODE
```

```bash
# data-index-href entries must point to folders with index.html
node - <<'NODE'
const fs=require('fs');
const html=fs.readFileSync('index.html','utf8');
const targets=[...html.matchAll(/data-index-href="([^"]+)"/g)].map(m=>m[1]);
const bad=targets.filter(h=>!fs.existsSync('.'+h+'index.html'));
console.log('bad data-index-href', bad.length);
if(bad.length) console.log(bad.join('\n'));
NODE
```

## Editing notes
- Keep ASCII text unless a file already uses special characters.
- Prefer minimal, local changes over reformatting the whole file.
- Preserve manual readability of `index.html`.
