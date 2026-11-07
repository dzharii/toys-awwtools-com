/* [PM-Se3hW8] Search local generated data, never a remote API.
   textContent keeps arbitrary code/search phrases from becoming executable HTML. */
(() => {
  const search = document.getElementById('search');
  const results = document.getElementById('search-results');
  const entries = window.DOC_SEARCH || [];
  search.addEventListener('input', () => {
    const phrase = search.value.trim().toLowerCase();
    results.replaceChildren();
    if (!phrase) return;
    const matches = entries.filter(entry => `${entry.name} ${entry.detail}`.toLowerCase().includes(phrase));
    for (const entry of matches.slice(0, 16)) {
      const link = document.createElement('a');
      link.href = entry.url;
      link.textContent = entry.name;
      const detail = document.createElement('small');
      detail.textContent = `${entry.kind}: ${entry.detail}`;
      link.append(detail);
      results.append(link);
    }
    if (!matches.length) {
      const empty = document.createElement('p');
      empty.textContent = 'No match. Try a file, function or PM- tag.';
      results.append(empty);
    }
  });
  for (const link of document.querySelectorAll('nav > a')) {
    if (link.getAttribute('href') === location.pathname.split('/').pop()) link.setAttribute('aria-current', 'page');
  }
  const focus = document.getElementById('toggle-focus');
  if (focus) focus.addEventListener('click', () => {
    const enabled = document.body.classList.toggle('comments-focus');
    focus.setAttribute('aria-pressed', String(enabled));
    focus.textContent = enabled ? 'Normal contrast' : 'Emphasize comments';
  });
})();
