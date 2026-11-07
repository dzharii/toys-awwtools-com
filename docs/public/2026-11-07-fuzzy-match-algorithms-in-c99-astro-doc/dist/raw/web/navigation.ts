/** Shared header/sidebar state. CSS reads the root attributes before layout.
 * Preferences survive page loads; failed storage writes affect only persistence.
 */
export function initializeNavigation() {
  const root = document.documentElement;
  const size = document.getElementById('reader-size') as HTMLSelectElement | null;
  const toggle = document.getElementById('navigation-toggle');
  const grip = document.getElementById('navigation-resize');
  if (!size || !toggle || !grip || size.dataset.bound) return;
  size.dataset.bound = 'true';
  size.value = root.dataset.readingSize || 'standard';

  function save() {
    try {
      localStorage.setItem('c99-reader', JSON.stringify({
        size: root.dataset.readingSize || 'standard',
        collapsed: root.dataset.navigationCollapsed === 'true',
        width: Number(root.dataset.navigationWidth || 272),
      }));
    } catch { /* The current page still works when storage is disabled. */ }
  }
  function updateToggle() {
    const collapsed = root.dataset.navigationCollapsed === 'true';
    toggle!.textContent = collapsed ? 'Show' : 'Hide';
    toggle!.setAttribute('aria-label', collapsed ? 'Show navigation' : 'Hide navigation');
    toggle!.setAttribute('aria-expanded', String(!collapsed));
  }
  function widthLimit() {
    return Math.max(200, Math.min(420, Math.floor(window.innerWidth * 0.42)));
  }
  function setWidth(requested: number) {
    const width = Math.max(200, Math.min(widthLimit(), requested));
    root.dataset.navigationWidth = String(width);
    root.style.setProperty('--reader-sidebar-width', `${width}px`);
    grip!.setAttribute('aria-valuenow', String(width));
    grip!.setAttribute('aria-valuemax', String(widthLimit()));
  }
  size.addEventListener('change', () => { root.dataset.readingSize = size.value; save(); });
  toggle.addEventListener('click', () => {
    root.dataset.navigationCollapsed = String(root.dataset.navigationCollapsed !== 'true');
    updateToggle();
    save();
  });

  // Pointer capture keeps the drag active if the pointer leaves the narrow edge.
  grip.addEventListener('pointerdown', (event) => {
    if (event.button !== 0) return;
    grip.setPointerCapture(event.pointerId);
    root.dataset.resizingNavigation = 'true';
    event.preventDefault();
  });
  grip.addEventListener('pointermove', (event) => {
    if (grip.hasPointerCapture(event.pointerId)) setWidth(event.clientX);
  });
  function finishDrag(event: PointerEvent) {
    if (grip!.hasPointerCapture(event.pointerId)) grip!.releasePointerCapture(event.pointerId);
    delete root.dataset.resizingNavigation;
    save();
  }
  grip.addEventListener('pointerup', finishDrag);
  grip.addEventListener('pointercancel', finishDrag);
  grip.addEventListener('keydown', (event) => {
    const step = event.shiftKey ? 40 : 16;
    const width = Number(root.dataset.navigationWidth || 272);
    if (event.key === 'ArrowLeft') setWidth(width - step);
    else if (event.key === 'ArrowRight') setWidth(width + step);
    else if (event.key === 'Home') setWidth(272);
    else return;
    event.preventDefault();
    save();
  });
  function fitDesktopWidth() {
    if (window.matchMedia('(min-width: 50rem)').matches) setWidth(Number(root.dataset.navigationWidth || 272));
  }
  window.addEventListener('resize', fitDesktopWidth);
  fitDesktopWidth();
  updateToggle();
}
