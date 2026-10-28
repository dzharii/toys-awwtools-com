import './desktop-view.js';
import './mobile-view.js';
import { selectPresentation } from './selection.js';

const tags = { desktop: 'xor-desktop-view', mobile: 'xor-mobile-view' };
export function mountPresentation(root, { override, mobileMatches, dependencies }) {
  const kind = selectPresentation(override, mobileMatches);
  const view = document.createElement(tags[kind]);
  root.replaceChildren(view);
  document.documentElement.dataset.presentation = kind;
  view.mount(dependencies);
  return { kind, view };
}
