// RetroOS UI v001 editable vendored framework source.
// This file may be changed inside this repository, but changes should remain
// generic, reusable, and suitable to merge back into the standalone RetroOS UI
// framework. Do not add this browser extension's feature-specific business
// logic here. Put project-specific integration in an adapter or bridge layer
// outside src/vendor/retroos-ui-v001/.

const BASE_ATTRS = `viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="square" stroke-linejoin="miter"`;

export const ICONS = {
  logo: `<rect x="3" y="3" width="18" height="18" fill="currentColor" stroke="none"/><path d="M7 16V8h3l2 8 2-8h3v8" stroke="#f6f8fb"/><path d="M7 12h3M14 12h3" stroke="#f6f8fb"/>`,
  window: `<rect x="4" y="5" width="16" height="14"/><path d="M4 9h16M7 7h1M10 7h1"/>`,
  minimize: `<path d="M7 17h10"/>`,
  maximize: `<rect x="7" y="7" width="10" height="10"/><path d="M10 4h10v10"/>`,
  close: `<path d="M6 6l12 12M18 6L6 18"/>`,
  menu: `<path d="M5 7h14M5 12h14M5 17h14"/>`,
  panel: `<rect x="5" y="5" width="14" height="14"/><path d="M8 8h8M8 12h8M8 16h5"/>`,
  back: `<path d="M14 6l-6 6 6 6M9 12h10"/>`,
  forward: `<path d="M10 6l6 6-6 6M5 12h10"/>`,
  refresh: `<path d="M18 8a7 7 0 1 0 1 6M18 4v4h-4"/>`,
  search: `<circle cx="10" cy="10" r="5"/><path d="M14 14l6 6"/>`,
  lock: `<rect x="6" y="10" width="12" height="10"/><path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v3"/>`,
  url: `<rect x="4" y="6" width="16" height="12"/><path d="M7 10h10M7 14h7"/>`,
  link: `<path d="M10 8l2-2a4 4 0 0 1 6 6l-2 2M14 16l-2 2a4 4 0 0 1-6-6l2-2M9 15l6-6"/>`,
  external: `<rect x="5" y="7" width="12" height="12"/><path d="M12 5h7v7M19 5l-8 8"/>`,
  copyUrl: `<rect x="8" y="5" width="10" height="14"/><path d="M6 8H4v11h10v-2"/>`,
  star: `<path d="M12 4l2.4 5 5.6.8-4 3.9.9 5.5-4.9-2.6-4.9 2.6.9-5.5-4-3.9 5.6-.8z"/>`,
  fullscreen: `<path d="M5 10V5h5M14 5h5v5M19 14v5h-5M10 19H5v-5"/>`,
  more: `<circle cx="6" cy="12" r="1" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1" fill="currentColor" stroke="none"/><circle cx="18" cy="12" r="1" fill="currentColor" stroke="none"/>`,
  capture: `<path d="M5 10V5h5M14 5h5v5M19 14v5h-5M10 19H5v-5M9 12h6"/>`,
  console: `<rect x="4" y="6" width="16" height="12"/><path d="M7 10l3 2-3 2M12 15h5"/>`,
  eye: `<path d="M3 12s3-5 9-5 9 5 9 5-3 5-9 5-9-5-9-5z"/><circle cx="12" cy="12" r="2"/>`,
  upload: `<path d="M12 17V5M8 9l4-4 4 4M5 19h14"/>`,
  dialog: `<rect x="5" y="6" width="14" height="12"/><path d="M5 10h14M8 8h1"/>`,
  gear: `<circle cx="12" cy="12" r="3"/><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1"/>`,
  sliders: `<path d="M5 7h14M5 12h14M5 17h14"/><rect x="8" y="5" width="3" height="4"/><rect x="14" y="10" width="3" height="4"/><rect x="6" y="15" width="3" height="4"/>`,
  copy: `<rect x="8" y="5" width="10" height="14"/><path d="M6 8H4v11h10"/>`,
  paste: `<path d="M9 5h6l1 3H8z"/><rect x="6" y="8" width="12" height="12"/>`,
  cut: `<circle cx="7" cy="7" r="2"/><circle cx="7" cy="17" r="2"/><path d="M9 8l9 9M9 16l9-9"/>`,
  edit: `<path d="M5 17l1 3 3-1 9-9-4-4zM13 7l4 4"/>`,
  trash: `<path d="M5 7h14M9 7V5h6v2M7 7l1 13h8l1-13M10 10v7M14 10v7"/>`,
  markdown: `<rect x="4" y="6" width="16" height="12"/><path d="M7 15V9l3 4 3-4v6M16 9v6M14 13l2 2 2-2"/>`,
  folder: `<path d="M3 8h7l2 2h9v9H3z"/>`,
  document: `<path d="M7 3h7l4 4v14H7zM14 3v5h4"/>`,
  article: `<path d="M7 4h10v16H7zM10 8h4M10 12h4M10 16h4"/>`,
  text: `<path d="M5 6h14M12 6v12M9 18h6"/>`,
  image: `<rect x="5" y="6" width="14" height="12"/><path d="M7 16l4-5 3 3 2-2 3 4"/><circle cx="9" cy="9" r="1" fill="currentColor" stroke="none"/>`,
  list: `<path d="M9 7h10M9 12h10M9 17h10"/><path d="M5 7h1M5 12h1M5 17h1"/>`,
  table: `<rect x="4" y="5" width="16" height="14"/><path d="M4 10h16M4 15h16M10 5v14M15 5v14"/>`,
  metrics: `<path d="M5 19V9M12 19V5M19 19v-7M3 19h18"/>`,
  code: `<path d="M8 8l-4 4 4 4M16 8l4 4-4 4M14 5l-4 14"/>`,
  note: `<path d="M6 4h12v14l-4 3H6zM14 18v3M9 8h6M9 12h6"/>`,
  info: `<circle cx="12" cy="12" r="9"/><path d="M12 10v7M12 7h.01"/>`,
  success: `<circle cx="12" cy="12" r="9"/><path d="M7 12l3 3 7-7"/>`,
  warning: `<path d="M12 4l9 16H3zM12 9v5M12 17h.01"/>`,
  error: `<circle cx="12" cy="12" r="9"/><path d="M8 8l8 8M16 8l-8 8"/>`,
  neutral: `<circle cx="12" cy="12" r="9"/><path d="M8 12h8"/>`,
  selected: `<rect x="5" y="5" width="14" height="14"/><path d="M8 12l3 3 5-6"/>`,
  unselected: `<rect x="5" y="5" width="14" height="14"/>`,
  radioSelected: `<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3" fill="currentColor" stroke="none"/>`,
  radio: `<circle cx="12" cy="12" r="8"/>`,
  progress: `<rect x="5" y="9" width="14" height="6"/><path d="M6 12h8"/>`,
  progressIndeterminate: `<rect x="5" y="9" width="14" height="6"/><path d="M7 14l4-4M12 14l4-4"/>`,
  sync: `<path d="M18 8a7 7 0 0 0-12-1M6 4v4h4M6 16a7 7 0 0 0 12 1M18 20v-4h-4"/>`,
  clock: `<circle cx="12" cy="12" r="9"/><path d="M12 7v6l4 2"/>`,
  draft: `<path d="M6 4h12v16H6zM9 8h6M9 12h4"/><path d="M16 16l3 3"/>`,
  shield: `<path d="M12 3l7 3v5c0 5-3 8-7 10-4-2-7-5-7-10V6z"/><path d="M9 12l2 2 4-5"/>`,
  blocked: `<circle cx="12" cy="12" r="9"/><path d="M6 18L18 6"/>`,
  frameBlocked: `<path d="M5 10V5h5M14 5h5v5M19 14v5h-5M10 19H5v-5" stroke-dasharray="4 3"/>`,
  accessBlocked: `<rect x="6" y="10" width="12" height="10"/><path d="M8 10V7a4 4 0 0 1 8 0v3M9 15h6"/>`,
  browserBlocked: `<rect x="4" y="6" width="16" height="12"/><path d="M4 10h16M8 14l8 0M9 17l6-6"/>`,
  noResults: `<circle cx="10" cy="10" r="5"/><path d="M14 14l5 5M5 19h14" stroke-dasharray="3 3"/>`,
  noCaptures: `<path d="M5 10V5h5M14 5h5v5M19 14v5h-5M10 19H5v-5" stroke-dasharray="4 3"/>`,
  noSelection: `<rect x="5" y="5" width="14" height="14" stroke-dasharray="4 3"/>`,
  retry: `<path d="M18 8a7 7 0 1 0 1 6M18 4v4h-4"/>`,
  permissions: `<path d="M9 19a5 5 0 0 1 6-8M12 4a4 4 0 1 1 0 8M16 16h5M18.5 13.5v5"/>`,
  grid: `<rect x="5" y="5" width="5" height="5"/><rect x="14" y="5" width="5" height="5"/><rect x="5" y="14" width="5" height="5"/><rect x="14" y="14" width="5" height="5"/>`,
  filter: `<path d="M4 6h16l-6 7v5l-4 2v-7z"/>`,
  sort: `<path d="M8 5v14M5 8l3-3 3 3M16 19V5M13 16l3 3 3-3"/>`,
  columns: `<rect x="4" y="5" width="16" height="14"/><path d="M10 5v14M16 5v14"/>`,
  pane: `<rect x="4" y="5" width="16" height="14"/><path d="M12 5v14"/>`
};

export const ICON_NAMES = Object.freeze(Object.keys(ICONS));

export function iconSvg(name, { label = "", className = "ui-icon" } = {}) {
  const body = ICONS[name] || ICONS.panel;
  const accessibility = label ? `role="img" aria-label="${escapeHtml(label)}"` : `aria-hidden="true"`;
  return `<svg class="${className}" ${BASE_ATTRS} ${accessibility}>${body}</svg>`;
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
    "'": "&#39;"
  })[char]);
}
