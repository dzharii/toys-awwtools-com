export const MOBILE_QUERY = '(max-width: 960px), (pointer: coarse) and (max-width: 1180px)';
export function selectPresentation(override, mobileMatches) {
  return override === 'desktop' || override === 'mobile' ? override : mobileMatches ? 'mobile' : 'desktop';
}
const clamp = (value, fallback, min, max) => Math.min(max, Math.max(min, Number(value) || fallback));
export function normalizeViewPreferences(saved = {}, legacy = {}) {
  const desktop = saved.desktop || {}, mobile = saved.mobile || {};
  return {
    desktop: {
      layout: ['standard', 'reading', 'debugging'].includes(desktop.layout ?? legacy.layout) ? desktop.layout ?? legacy.layout : 'standard',
      split: clamp(desktop.split ?? legacy.split, 60, 35, 75),
      height: clamp(desktop.height ?? legacy.height, 65, 25, 80),
      zoom: clamp(desktop.zoom ?? legacy.zoom, 1, .6, 2),
      mode: (desktop.mode ?? legacy.mode) === 'edit' ? 'edit' : 'explore'
    },
    mobile: {
      tab: ['explore', 'inspect', 'learn', 'debug'].includes(mobile.tab) ? mobile.tab : 'explore',
      zoom: clamp(mobile.zoom, 1, .8, 1.8),
      mode: mobile.mode === 'edit' ? 'edit' : 'explore',
      density: mobile.density === 'comfortable' ? 'comfortable' : 'compact'
    }
  };
}
