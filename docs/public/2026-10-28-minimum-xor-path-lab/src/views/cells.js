const palette = ['#187d72', '#9454c3', '#ca6a20', '#2677c1', '#c14372', '#73912d', '#625bc4', '#b4523c'];
export const routeColor = id => palette[id] || `hsl(${(id * 137.508 + 160) % 360} 64% 42%)`;
export function mixRouteColors(ids) {
  if (!ids.length) return 'transparent';
  return ids.slice(1).reduce((mix, id, index) => `color-mix(in oklab, ${mix} ${((index + 1) / (index + 2) * 100).toFixed(3)}%, ${routeColor(id)})`, routeColor(ids[0]));
}
export function cellMarkup({ index, row, col, value, size, left, top, current, visited, finish, preview, routeTrace, representative, debug, routeIds = [], optimalCell = false }) {
  const classes = ['cell', current && 'current', visited && 'visited', finish && 'finish', preview && 'next', (preview || routeTrace) && 'has-preview', routeTrace && 'has-route-trace', representative && 'representative', debug && 'debug-cell', optimalCell && 'optimal-union', routeIds.length && 'optimal-cell'].filter(Boolean).join(' ');
  const hint = preview ? `, next move: running XOR ${preview.xor}, binary ${preview.binary}` : '';
  const membership = routeIds.length ? `, optimal ${routeIds.length === 1 ? 'route' : 'routes'} ${routeIds.map(id => id + 1).join(', ')}` : optimalCell ? ', belongs to an optimal route' : '';
  const shown = routeTrace || preview;
  const operation = routeTrace ? `Route step ${routeTrace.step}: ${routeTrace.previous} XOR ${value} = ${routeTrace.xor}${routeTrace.final ? ', final XOR' : ', running XOR'}, binary ${routeTrace.binary}` : '';
  const content = shown ? `<span class="cell-value">${value}</span><span class="move-preview" aria-hidden="true"><span class="preview-caption">${routeTrace ? `#${routeTrace.step} ${routeTrace.final ? 'final' : 'running'} XOR` : 'next XOR'}</span><code class="preview-binary">${shown.binary}</code><sub class="preview-decimal">${shown.xor}<span> decimal</span></sub></span>` : `<span class="cell-value">${value}</span>${size >= 56 ? (index === 0 ? '<small>START</small>' : finish ? '<small>END</small>' : '') : ''}`;
  return `<button class="${classes}" data-cell="${index}" data-preview-xor="${preview ? preview.xor : ''}" data-route-xor="${routeTrace ? routeTrace.xor : ''}" data-route-step="${routeTrace ? routeTrace.step : ''}" data-optimal-routes="${routeIds.map(id => id + 1).join(',')}" ${operation ? `title="${operation}"` : ''} aria-label="Cell ${row}, ${col}: ${value}${current ? ', current' : ''}${index === 0 ? ', start' : ''}${finish ? ', destination' : ''}${hint}${membership}${operation ? ', '+operation : ''}" style="left:${left}px;top:${top}px;width:${size - 6}px;height:${size - 6}px;font-size:${Math.min(23, size * .24)}px;${routeIds.length ? `--route-mix:${mixRouteColors(routeIds)};` : ''}" ${current ? 'aria-current="step"' : ''}>${content}</button>`;
}
export function formatRouteCount(count) {
  const value = String(count);
  return value.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}
