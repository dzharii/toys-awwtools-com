const iconPaths = {
  check: '<path d="m5 12 4 4L19 6" />',
  close: '<path d="M18 6 6 18" /><path d="m6 6 12 12" />',
  info: '<circle cx="12" cy="12" r="9" /><path d="M12 10v6" /><path d="M12 7h.01" />',
  warning: '<path d="M12 3 2.5 20h19L12 3Z" /><path d="M12 9v5" /><path d="M12 17h.01" />',
  "arrow-right": '<path d="M5 12h14" /><path d="m13 6 6 6-6 6" />'
};

export function renderIcon(name, label = "") {
  const path = iconPaths[name] ?? iconPaths.info;
  const ariaAttributes = label
    ? `role="img" aria-label="${label}"`
    : 'aria-hidden="true" focusable="false"';

  return `<svg class="my-icon__svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ${ariaAttributes}>${path}</svg>`;
}
