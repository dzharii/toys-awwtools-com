(() => {
  'use strict';

  const ALLOWED_TAGS = new Set(['p', 'strong', 'em', 'code', 'a', 'br']);
  const ALLOWED_HREF_PREFIXES = ['http://', 'https://', '#'];
  const usedIds = new Map();
  const MOBILE_MEDIA_QUERY = '(max-width: 600px)';

  function isMobileViewport() {
    if (window.matchMedia) {
      return window.matchMedia(MOBILE_MEDIA_QUERY).matches;
    }
    return window.innerWidth <= 600;
  }

  function normalizeId(value) {
    const raw = (value || '').trim();
    if (!raw) return 'item';
    return raw
      .replace(/[^A-Za-z0-9]+/g, '-')
      .replace(/(^-+)|(-+$)/g, '')
      .replace(/[A-Z]/g, (match) => match.toLowerCase()) || 'item';
  }

  function ensureUniqueId(baseId) {
    const current = usedIds.get(baseId) || 0;
    if (current === 0) {
      usedIds.set(baseId, 1);
      return baseId;
    }
    const next = current + 1;
    usedIds.set(baseId, next);
    return `${baseId}-${next}`;
  }

  function buildAnchorId(prefix, sourceId, rawId) {
    const normalized = normalizeId(rawId || 'item');
    const base = `${prefix}:${sourceId}:${normalized}`;
    return ensureUniqueId(base);
  }

  function normalizeText(text) {
    return (text || '').replace(/[A-Z]/g, (match) => match.toLowerCase());
  }

  function tokenize(text) {
    return normalizeText(text)
      .split(/[^a-z0-9_]+/i)
      .filter(Boolean);
  }

  function sanitizeHtmlToFragment(html) {
    const fragment = document.createDocumentFragment();
    const wrapped = `<div>${html || ''}</div>`;
    const parsed = new DOMParser().parseFromString(wrapped, 'text/html');
    const container = parsed.body.firstElementChild;
    if (!container) return fragment;

    for (const child of Array.from(container.childNodes)) {
      fragment.appendChild(sanitizeNode(child));
    }
    return fragment;
  }

  function sanitizeNode(node) {
    if (node.nodeType === Node.TEXT_NODE) {
      return document.createTextNode(node.nodeValue || '');
    }

    if (node.nodeType !== Node.ELEMENT_NODE) {
      return document.createTextNode('');
    }

    const tag = node.tagName.toLowerCase();
    if (!ALLOWED_TAGS.has(tag)) {
      return document.createTextNode(node.outerHTML || node.textContent || '');
    }

    if (tag === 'br') {
      return document.createElement('br');
    }

    if (tag === 'a') {
      const href = (node.getAttribute('href') || '').trim();
      if (!isAllowedHref(href)) {
        const frag = document.createDocumentFragment();
        for (const child of Array.from(node.childNodes)) {
          frag.appendChild(sanitizeNode(child));
        }
        return frag;
      }
      const anchor = document.createElement('a');
      anchor.setAttribute('href', href);
      if (href.startsWith('http://') || href.startsWith('https://')) {
        anchor.setAttribute('rel', 'noreferrer');
        anchor.setAttribute('target', '_blank');
      }
      for (const child of Array.from(node.childNodes)) {
        anchor.appendChild(sanitizeNode(child));
      }
      return anchor;
    }

    const element = document.createElement(tag);
    for (const child of Array.from(node.childNodes)) {
      element.appendChild(sanitizeNode(child));
    }
    return element;
  }

  function isAllowedHref(href) {
    return ALLOWED_HREF_PREFIXES.some((prefix) => href.startsWith(prefix));
  }

  function appendSanitized(container, html) {
    if (!html) return;
    container.appendChild(sanitizeHtmlToFragment(html));
  }

  function getDirectChild(parent, tagName) {
    if (!parent) return null;
    for (const child of Array.from(parent.children)) {
      if (child.tagName === tagName) return child;
    }
    return null;
  }

  function getChildText(parent, tagName) {
    const el = getDirectChild(parent, tagName);
    if (!el) return '';
    return el.textContent || '';
  }

  function getChildHtml(parent, tagName) {
    const raw = getChildText(parent, tagName);
    return raw.trim();
  }

  function normalizeCode(text) {
    if (!text) return '';
    let value = text.replace(/\r\n/g, '\n');
    if (value.endsWith('\n')) {
      value = value.slice(0, -1);
    }
    return value;
  }

  function normalizeSignature(text) {
    if (!text) return '';
    let value = text.replace(/\r\n/g, '\n');
    if (value.endsWith('\n')) {
      value = value.slice(0, -1);
    }
    return value;
  }

  function parseNotes(notesEl) {
    if (!notesEl) return [];
    const notes = [];
    for (const noteEl of Array.from(notesEl.children)) {
      if (noteEl.tagName !== 'note') continue;
      notes.push({
        id: noteEl.getAttribute('id') || '',
        severity: noteEl.getAttribute('severity') || 'info',
        topic: noteEl.getAttribute('topic') || '',
        descriptionHtml: getChildHtml(noteEl, 'description')
      });
    }
    return notes;
  }

  function parseConstraints(constraintsEl) {
    if (!constraintsEl) return [];
    const constraints = [];
    for (const constraintEl of Array.from(constraintsEl.children)) {
      if (constraintEl.tagName !== 'constraint') continue;
      constraints.push({
        id: constraintEl.getAttribute('id') || '',
        severity: constraintEl.getAttribute('severity') || 'info',
        descriptionHtml: getChildHtml(constraintEl, 'description')
      });
    }
    return constraints;
  }

  function parseParameters(parametersEl) {
    if (!parametersEl) return [];
    const params = [];
    for (const paramEl of Array.from(parametersEl.children)) {
      if (paramEl.tagName !== 'param') continue;
      params.push({
        id: paramEl.getAttribute('id') || '',
        name: paramEl.getAttribute('name') || '',
        type: paramEl.getAttribute('type') || '',
        direction: paramEl.getAttribute('direction') || 'in',
        descriptionHtml: getChildHtml(paramEl, 'description'),
        constraints: parseConstraints(getDirectChild(paramEl, 'constraints'))
      });
    }
    return params;
  }

  function parseReturns(returnsEl) {
    if (!returnsEl) return [];
    const returns = [];
    for (const returnEl of Array.from(returnsEl.children)) {
      if (returnEl.tagName !== 'return') continue;
      returns.push({
        type: returnEl.getAttribute('type') || '',
        descriptionHtml: getChildHtml(returnEl, 'description')
      });
    }
    return returns;
  }

  function parseExamples(examplesEl) {
    if (!examplesEl) return [];
    const examples = [];
    for (const exampleEl of Array.from(examplesEl.children)) {
      if (exampleEl.tagName !== 'example') continue;
      examples.push({
        id: exampleEl.getAttribute('id') || '',
        title: getChildText(exampleEl, 'title').trim(),
        lang: exampleEl.getAttribute('lang') || '',
        codeText: normalizeCode(getChildText(exampleEl, 'code'))
      });
    }
    return examples;
  }

  function parseFunction(fnEl, sourceId) {
    const id = fnEl.getAttribute('id') || fnEl.getAttribute('name') || 'function';
    const name = fnEl.getAttribute('name') || 'Unnamed function';
    const kind = fnEl.getAttribute('kind') || 'function';
    return {
      id,
      name,
      kind,
      anchorId: buildAnchorId('fn', sourceId, id || name),
      signatureText: normalizeSignature(getChildText(fnEl, 'signature')),
      summaryHtml: getChildHtml(fnEl, 'summary'),
      parameters: parseParameters(getDirectChild(fnEl, 'parameters')),
      returns: parseReturns(getDirectChild(fnEl, 'returns')),
      notes: parseNotes(getDirectChild(fnEl, 'notes')),
      examples: parseExamples(getDirectChild(fnEl, 'examples'))
    };
  }

  function parseHeader(headerEl, sourceId) {
    const id = headerEl.getAttribute('id') || headerEl.getAttribute('name') || 'header';
    const name = headerEl.getAttribute('name') || 'Unnamed header';
    const header = {
      id,
      name,
      anchorId: buildAnchorId('hdr', sourceId, id || name),
      summaryHtml: getChildHtml(headerEl, 'summary'),
      notes: parseNotes(getDirectChild(headerEl, 'notes')),
      functions: []
    };

    for (const child of Array.from(headerEl.children)) {
      if (child.tagName !== 'function') continue;
      header.functions.push(parseFunction(child, sourceId));
    }

    return header;
  }

  function parseCategory(categoryEl, sourceId) {
    const id = categoryEl.getAttribute('id') || categoryEl.getAttribute('name') || 'category';
    const name = categoryEl.getAttribute('name') || 'Unnamed category';
    const keywordsEl = getDirectChild(categoryEl, 'keywords');
    const keywords = [];
    if (keywordsEl) {
      for (const kwEl of Array.from(keywordsEl.children)) {
        if (kwEl.tagName !== 'kw') continue;
        const value = (kwEl.textContent || '').trim();
        if (value) keywords.push(value);
      }
    }

    const category = {
      id,
      name,
      sourceId,
      anchorId: buildAnchorId('cat', sourceId, id || name),
      summaryHtml: getChildHtml(categoryEl, 'summary'),
      keywords,
      notes: parseNotes(getDirectChild(categoryEl, 'notes')),
      headers: []
    };

    for (const child of Array.from(categoryEl.children)) {
      if (child.tagName !== 'header') continue;
      category.headers.push(parseHeader(child, sourceId));
    }

    return category;
  }

  function parseXmlBlocks() {
    const blocks = Array.from(
      document.querySelectorAll('script[type="application/xml"][id^="library-xml-"]')
    );
    const categories = [];
    const errors = [];

    for (const block of blocks) {
      const sourceId = block.id;
      const rawText = (block.textContent || '').replace(/^\uFEFF/, '');
      const doc = new DOMParser().parseFromString(rawText, 'application/xml');
      const parseError = doc.getElementsByTagName('parsererror')[0];
      if (parseError) {
        const message = (parseError.textContent || '').trim().split('\n')[0];
        errors.push({ id: sourceId, message: message || 'XML parse error.' });
        continue;
      }
      const categoryEl = doc.getElementsByTagName('category')[0];
      if (!categoryEl) {
        errors.push({ id: sourceId, message: 'Missing category element.' });
        continue;
      }
      categories.push(parseCategory(categoryEl, sourceId));
    }

    return { categories, errors };
  }

  function renderErrors(errors) {
    const container = document.getElementById('errors');
    if (!container) return;
    container.innerHTML = '';
    if (!errors.length) {
      container.hidden = true;
      return;
    }

    container.hidden = false;
    const title = document.createElement('h2');
    title.textContent = 'XML parse errors';
    container.appendChild(title);

    const list = document.createElement('ul');
    for (const error of errors) {
      const item = document.createElement('li');
      item.textContent = `${error.id}: ${error.message} Check that the embedded XML is well-formed.`;
      list.appendChild(item);
    }
    container.appendChild(list);
  }

  function renderContent(categories) {
    const container = document.getElementById('content');
    if (!container) return;
    container.innerHTML = '';

    for (const category of categories) {
      container.appendChild(renderCategory(category));
    }
  }

  function renderCategory(category) {
    const section = document.createElement('section');
    section.className = 'category';
    section.id = category.anchorId;

    const title = document.createElement('h2');
    title.textContent = category.name;
    section.appendChild(title);

    if (category.summaryHtml) {
      const summary = document.createElement('div');
      summary.className = 'summary prose';
      appendSanitized(summary, category.summaryHtml);
      section.appendChild(summary);
    }

    if (category.keywords.length) {
      const keywords = document.createElement('div');
      keywords.className = 'keywords';
      const label = document.createElement('span');
      label.className = 'keywords-label';
      label.textContent = 'Keywords:';
      keywords.appendChild(label);
      for (const kw of category.keywords) {
        const tag = document.createElement('span');
        tag.className = 'keyword';
        tag.textContent = kw;
        keywords.appendChild(tag);
      }
      section.appendChild(keywords);
    }

    if (category.notes.length) {
      section.appendChild(renderNotesSection('Category notes', category.notes));
    }

    for (const header of category.headers) {
      section.appendChild(renderHeader(header));
    }

    return section;
  }

  function renderHeader(header) {
    const section = document.createElement('section');
    section.className = 'header';
    section.id = header.anchorId;

    const title = document.createElement('h3');
    title.textContent = header.name;
    section.appendChild(title);

    if (header.summaryHtml) {
      const summary = document.createElement('div');
      summary.className = 'summary prose';
      appendSanitized(summary, header.summaryHtml);
      section.appendChild(summary);
    }

    if (header.notes.length) {
      section.appendChild(renderNotesSection('Header notes', header.notes));
    }

    for (const fn of header.functions) {
      if (fn.kind === 'internal_note') {
        section.appendChild(renderInternalNote(fn));
      } else {
        section.appendChild(renderFunction(fn));
      }
    }

    return section;
  }

  function renderInternalNote(fn) {
    const block = document.createElement('div');
    block.className = 'internal-note';

    const label = document.createElement('div');
    label.className = 'internal-note-label';
    label.textContent = 'Header note';
    block.appendChild(label);

    if (fn.summaryHtml) {
      const body = document.createElement('div');
      body.className = 'prose';
      appendSanitized(body, fn.summaryHtml);
      block.appendChild(body);
    }

    return block;
  }

  function renderFunction(fn) {
    const card = document.createElement('article');
    card.className = 'function-card';
    card.id = fn.anchorId;

    const header = document.createElement('div');
    header.className = 'function-header';

    const title = document.createElement('h4');
    title.textContent = fn.name;
    header.appendChild(title);

    if (fn.kind && fn.kind !== 'function') {
      const kind = document.createElement('span');
      kind.className = 'function-kind';
      kind.textContent = fn.kind.replace(/_/g, ' ');
      header.appendChild(kind);
    }

    card.appendChild(header);

    if (fn.signatureText) {
      const signature = renderCopyBlock('Signature', fn.signatureText, 'signature');
      card.appendChild(signature);
    } else {
      const warning = document.createElement('div');
      warning.className = 'warning';
      warning.textContent = 'Signature missing in source.';
      card.appendChild(warning);
    }

    if (fn.summaryHtml) {
      const summary = document.createElement('div');
      summary.className = 'summary prose';
      appendSanitized(summary, fn.summaryHtml);
      card.appendChild(summary);
    }

    if (fn.parameters.length) {
      const section = document.createElement('section');
      section.className = 'section-block';
      const title = document.createElement('h5');
      title.textContent = 'Parameters';
      section.appendChild(title);

      for (const param of fn.parameters) {
        section.appendChild(renderParameter(param));
      }
      card.appendChild(section);
    }

    if (fn.returns.length) {
      const section = document.createElement('section');
      section.className = 'section-block';
      const title = document.createElement('h5');
      title.textContent = 'Returns';
      section.appendChild(title);
      for (const ret of fn.returns) {
        section.appendChild(renderReturn(ret));
      }
      card.appendChild(section);
    }

    if (fn.notes.length) {
      card.appendChild(renderNotesSection('Notes', fn.notes));
    }

    if (fn.examples.length) {
      const section = document.createElement('section');
      section.className = 'section-block';
      const title = document.createElement('h5');
      title.textContent = 'Examples';
      section.appendChild(title);
      for (const example of fn.examples) {
        section.appendChild(renderExample(example));
      }
      card.appendChild(section);
    }

    return card;
  }

  function renderParameter(param) {
    const block = document.createElement('div');
    block.className = 'param';

    const meta = document.createElement('div');
    meta.className = 'param-meta';

    const name = document.createElement('span');
    name.className = 'param-name';
    name.textContent = param.name || '(unnamed)';
    meta.appendChild(name);

    if (param.type) {
      const type = document.createElement('span');
      type.className = 'param-type';
      type.textContent = param.type;
      meta.appendChild(type);
    }

    const direction = document.createElement('span');
    direction.className = 'param-direction';
    direction.textContent = normalizeDirection(param.direction);
    meta.appendChild(direction);

    block.appendChild(meta);

    if (param.descriptionHtml) {
      const description = document.createElement('div');
      description.className = 'prose';
      appendSanitized(description, param.descriptionHtml);
      block.appendChild(description);
    }

    if (param.constraints.length) {
      const constraints = document.createElement('div');
      constraints.className = 'constraints';
      for (const constraint of param.constraints) {
        const note = document.createElement('div');
        note.className = `note severity-${constraint.severity || 'info'}`;
        const header = document.createElement('div');
        header.className = 'note-header';
        const severity = document.createElement('span');
        severity.className = 'note-severity';
        severity.textContent = constraint.severity || 'info';
        header.appendChild(severity);
        note.appendChild(header);
        const body = document.createElement('div');
        body.className = 'prose';
        appendSanitized(body, constraint.descriptionHtml);
        note.appendChild(body);
        constraints.appendChild(note);
      }
      block.appendChild(constraints);
    }

    return block;
  }

  function renderReturn(ret) {
    const block = document.createElement('div');
    block.className = 'return';

    if (ret.type) {
      const type = document.createElement('div');
      type.className = 'return-type';
      type.textContent = ret.type;
      block.appendChild(type);
    }

    if (ret.descriptionHtml) {
      const desc = document.createElement('div');
      desc.className = 'prose';
      appendSanitized(desc, ret.descriptionHtml);
      block.appendChild(desc);
    }

    return block;
  }

  function renderNotesSection(titleText, notes) {
    const section = document.createElement('section');
    section.className = 'section-block';

    const title = document.createElement('h5');
    title.textContent = titleText;
    section.appendChild(title);

    for (const note of notes) {
      const noteEl = document.createElement('div');
      noteEl.className = `note severity-${note.severity || 'info'}`;

      const header = document.createElement('div');
      header.className = 'note-header';

      const severity = document.createElement('span');
      severity.className = 'note-severity';
      severity.textContent = note.severity || 'info';
      header.appendChild(severity);

      if (note.topic) {
        const topic = document.createElement('span');
        topic.className = 'note-topic';
        topic.textContent = note.topic;
        header.appendChild(topic);
      }

      noteEl.appendChild(header);

      const body = document.createElement('div');
      body.className = 'prose';
      appendSanitized(body, note.descriptionHtml);
      noteEl.appendChild(body);

      section.appendChild(noteEl);
    }

    return section;
  }

  function renderExample(example) {
    const block = document.createElement('div');
    block.className = 'example';

    if (example.title) {
      const title = document.createElement('div');
      title.className = 'example-title';
      title.textContent = example.title;
      block.appendChild(title);
    }

    if (example.codeText) {
      block.appendChild(renderCopyBlock('Example', example.codeText, 'example', example.lang));
    }

    return block;
  }

  function renderCopyBlock(labelText, codeText, kind, lang) {
    const block = document.createElement('div');
    block.className = `copy-block copy-${kind}`;

    const header = document.createElement('div');
    header.className = 'copy-header';

    const label = document.createElement('span');
    label.className = 'copy-label';
    label.textContent = labelText;
    header.appendChild(label);

    if (lang) {
      const langEl = document.createElement('span');
      langEl.className = 'copy-lang';
      langEl.textContent = lang;
      header.appendChild(langEl);
    }

    const actions = document.createElement('div');
    actions.className = 'copy-actions';

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'copy-button';
    button.textContent = 'Copy';

    const status = document.createElement('span');
    status.className = 'copy-status';

    button.addEventListener('click', () => {
      copyToClipboard(codeText, status);
    });

    actions.appendChild(button);
    actions.appendChild(status);
    header.appendChild(actions);
    block.appendChild(header);

    const pre = document.createElement('pre');
    const code = document.createElement('code');
    code.classList.add('microlight');
    code.textContent = codeText;
    pre.appendChild(code);
    block.appendChild(pre);

    return block;
  }

  function normalizeDirection(direction) {
    const value = (direction || '').toLowerCase();
    if (value === 'out' || value === 'inout') return value;
    return 'in';
  }

  async function copyToClipboard(text, statusEl) {
    if (!statusEl) return;
    statusEl.textContent = '';
    statusEl.classList.remove('copy-success', 'copy-error');

    try {
      if (!navigator.clipboard || !navigator.clipboard.writeText) {
        throw new Error('Clipboard unavailable');
      }
      await navigator.clipboard.writeText(text);
      statusEl.textContent = 'Copied';
      statusEl.classList.add('copy-success');
    } catch (err) {
      statusEl.textContent = 'Copy failed';
      statusEl.classList.add('copy-error');
    }

    window.setTimeout(() => {
      statusEl.textContent = '';
      statusEl.classList.remove('copy-success', 'copy-error');
    }, 2000);
  }

  function buildSearchIndex(categories) {
    const entries = [];
    let order = 0;

    for (const category of categories) {
      const categoryFields = [
        category.name,
        category.keywords.join(' '),
        noteTokens(category.notes)
      ];
      entries.push(createEntry({
        type: 'category',
        label: category.name,
        context: '',
        anchorId: category.anchorId,
        order: order++,
        fields: categoryFields
      }));

      for (const header of category.headers) {
        const headerFields = [
          header.name,
          category.name,
          category.keywords.join(' '),
          noteTokens(header.notes)
        ];
        entries.push(createEntry({
          type: 'header',
          label: header.name,
          context: category.name,
          anchorId: header.anchorId,
          order: order++,
          fields: headerFields
        }));

        for (const fn of header.functions) {
          if (fn.kind === 'internal_note') continue;
          const functionFields = [
            fn.name,
            header.name,
            category.keywords.join(' '),
            signatureTokens(fn.signatureText),
            paramTokens(fn.parameters),
            noteTokens(fn.notes),
            category.name
          ];
          entries.push(createEntry({
            type: 'function',
            label: fn.name,
            context: header.name,
            anchorId: fn.anchorId,
            order: order++,
            fields: functionFields,
            signature: fn.signatureText
          }));
        }
      }
    }

    return entries;
  }

  function createEntry({ type, label, context, anchorId, order, fields, signature }) {
    const fieldTokens = fields.map((field) => tokenize(field));
    return {
      type,
      label,
      context,
      anchorId,
      order,
      fieldTokens,
      signature: signature || ''
    };
  }

  function signatureTokens(signature) {
    return signature || '';
  }

  function paramTokens(params) {
    return params.map((param) => param.name).join(' ');
  }

  function noteTokens(notes) {
    return notes
      .map((note) => `${note.topic || ''} ${note.severity || ''}`.trim())
      .join(' ');
  }

  function searchEntries(entries, query) {
    const trimmed = query.trim();
    if (!trimmed) return [];
    const terms = normalizeText(trimmed).split(/\s+/).filter(Boolean);

    const results = [];
    for (const entry of entries) {
      let bestRank = Infinity;
      let matchesAll = true;

      for (const term of terms) {
        let matched = false;
        for (let i = 0; i < entry.fieldTokens.length; i += 1) {
          const tokens = entry.fieldTokens[i];
          if (tokens.some((token) => token.includes(term))) {
            matched = true;
            if (i < bestRank) bestRank = i;
            break;
          }
        }
        if (!matched) {
          matchesAll = false;
          break;
        }
      }

      if (matchesAll) {
        results.push({ entry, rank: bestRank });
      }
    }

    results.sort((a, b) => {
      if (a.rank !== b.rank) return a.rank - b.rank;
      return a.entry.order - b.entry.order;
    });

    return results.map((result) => result.entry);
  }

  function setupSidebar(categories, entries, errors) {
    const toc = document.getElementById('toc');
    const searchInput = document.getElementById('searchInput');
    const searchHint = document.getElementById('searchHint');
    const sidebar = document.getElementById('sidebar');
    const toggle = document.getElementById('sidebarToggle');
    const backdrop = document.getElementById('sidebarBackdrop');

    if (!toc || !searchInput) return;

    const renderFull = () => {
      toc.innerHTML = '';
      toc.appendChild(renderToc(categories));
      if (errors.length) {
        toc.appendChild(renderSidebarErrors(errors));
      }
      if (searchHint) {
        searchHint.textContent = 'Showing full table of contents.';
      }
    };

    const renderSearch = (query) => {
      const results = searchEntries(entries, query);
      toc.innerHTML = '';
      toc.appendChild(renderSearchResults(results));
      if (errors.length) {
        toc.appendChild(renderSidebarErrors(errors));
      }
      if (searchHint) {
        searchHint.textContent = results.length
          ? `Found ${results.length} result${results.length === 1 ? '' : 's'} for "${query}".`
          : `No matches for "${query}".`;
      }
    };

    let debounceId = 0;
    searchInput.addEventListener('input', () => {
      window.clearTimeout(debounceId);
      debounceId = window.setTimeout(() => {
        const query = searchInput.value;
        if (query.trim()) {
          renderSearch(query);
        } else {
          renderFull();
        }
      }, 75);
    });

    searchInput.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        searchInput.value = '';
        renderFull();
        return;
      }
      if (event.key === 'Enter') {
        const query = searchInput.value;
        const results = searchEntries(entries, query);
        if (results.length) {
          navigateTo(results[0].anchorId, { closeSidebar: true });
        }
      }
    });

    const handleTocClick = (event, options = {}) => {
      const link = event.target.closest('a[data-target]');
      if (!link) return;
      const headerBlock = link.closest('.toc-header-block');
      if (isMobileViewport() && link.classList.contains('toc-header') && headerBlock) {
        if (!headerBlock.classList.contains('open')) {
          headerBlock.classList.add('open');
          event.preventDefault();
          return;
        }
      }
      event.preventDefault();
      const targetId = link.getAttribute('data-target');
      navigateTo(targetId, options);
    };

    if (toggle && sidebar && backdrop) {
      const openSidebar = () => {
        sidebar.classList.add('open');
        backdrop.classList.add('visible');
        document.body.classList.add('sidebar-open');
      };

      const closeSidebar = () => {
        sidebar.classList.remove('open');
        backdrop.classList.remove('visible');
        document.body.classList.remove('sidebar-open');
      };

      toggle.addEventListener('click', () => {
        if (sidebar.classList.contains('open')) {
          closeSidebar();
        } else {
          openSidebar();
        }
      });

      backdrop.addEventListener('click', closeSidebar);

      const maybeAddCloseButton = () => {
        if (!isMobileViewport()) return;
        const header = sidebar.querySelector('.sidebar-header');
        if (header && !header.querySelector('.sidebar-close')) {
          const closeButton = document.createElement('button');
          closeButton.type = 'button';
          closeButton.className = 'sidebar-close';
          closeButton.setAttribute('aria-label', 'Close table of contents');
          closeButton.textContent = 'Close';
          closeButton.addEventListener('click', closeSidebar);
          header.appendChild(closeButton);
        }
      };

      maybeAddCloseButton();
      if (window.matchMedia) {
        const media = window.matchMedia(MOBILE_MEDIA_QUERY);
        if (typeof media.addEventListener === 'function') {
          media.addEventListener('change', maybeAddCloseButton);
        } else if (typeof media.addListener === 'function') {
          media.addListener(maybeAddCloseButton);
        }
      }

      toc.addEventListener('click', (event) => {
        handleTocClick(event, { closeSidebar: true });
      });
    } else {
      toc.addEventListener('click', (event) => {
        handleTocClick(event);
      });
    }

    renderFull();
  }

  function renderToc(categories) {
    const fragment = document.createDocumentFragment();

    for (const category of categories) {
      const section = document.createElement('div');
      section.className = 'toc-section';

      const catLink = createTocLink(category.name, category.anchorId, 'Category');
      catLink.classList.add('toc-category');
      section.appendChild(catLink);

      for (const header of category.headers) {
        const headerBlock = document.createElement('div');
        headerBlock.className = 'toc-header-block';

        const headerLink = createTocLink(header.name, header.anchorId, 'Header');
        headerLink.classList.add('toc-header');
        headerBlock.appendChild(headerLink);

        const fnList = document.createElement('ul');
        fnList.className = 'toc-functions';

        for (const fn of header.functions) {
          if (fn.kind === 'internal_note') continue;
          const item = document.createElement('li');
          const link = createTocLink(fn.name, fn.anchorId, 'Function');
          if (fn.signatureText) {
            const sig = document.createElement('span');
            sig.className = 'toc-signature';
            sig.textContent = fn.signatureText;
            link.appendChild(sig);
          }
          item.appendChild(link);
          fnList.appendChild(item);
        }

        headerBlock.appendChild(fnList);
        section.appendChild(headerBlock);
      }

      fragment.appendChild(section);
    }

    return fragment;
  }

  function renderSearchResults(results) {
    const fragment = document.createDocumentFragment();
    const list = document.createElement('ul');
    list.className = 'search-results';

    for (const entry of results) {
      const item = document.createElement('li');
      const link = createTocLink(entry.label, entry.anchorId, null);
      link.classList.add('search-result');

      const meta = document.createElement('span');
      meta.className = 'search-meta';
      const context = entry.context ? ` • ${entry.context}` : '';
      meta.textContent = `${labelForType(entry.type)}${context}`;
      link.appendChild(meta);

      item.appendChild(link);
      list.appendChild(item);
    }

    if (!results.length) {
      const empty = document.createElement('div');
      empty.className = 'search-empty';
      empty.textContent = 'No matches. Try another term or use Ctrl+F in the main pane.';
      fragment.appendChild(empty);
    } else {
      fragment.appendChild(list);
    }

    return fragment;
  }

  function renderSidebarErrors(errors) {
    const section = document.createElement('div');
    section.className = 'toc-errors';

    const title = document.createElement('div');
    title.className = 'toc-errors-title';
    title.textContent = 'Errors';
    section.appendChild(title);

    const list = document.createElement('ul');
    for (const error of errors) {
      const item = document.createElement('li');
      item.textContent = `${error.id}: ${error.message}`;
      list.appendChild(item);
    }
    section.appendChild(list);

    return section;
  }

  function createTocLink(text, targetId, type) {
    const link = document.createElement('a');
    link.href = `#${targetId}`;
    link.setAttribute('data-target', targetId);
    link.className = 'toc-link';

    const label = document.createElement('span');
    label.className = 'toc-label';
    label.textContent = text;
    link.appendChild(label);

    if (type) {
      const badge = document.createElement('span');
      badge.className = 'toc-type';
      badge.textContent = labelForType(type);
      link.appendChild(badge);
    }

    return link;
  }

  function labelForType(type) {
    if (type === 'function') return 'Function';
    if (type === 'header') return 'Header';
    if (type === 'category') return 'Category';
    return type;
  }

  function navigateTo(targetId, options = {}) {
    const element = document.getElementById(targetId);
    if (!element) return;
    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    history.pushState(null, '', `#${targetId}`);
    flashTarget(element);

    if (options.closeSidebar) {
      const sidebar = document.getElementById('sidebar');
      const backdrop = document.getElementById('sidebarBackdrop');
      if (sidebar && backdrop) {
        sidebar.classList.remove('open');
        backdrop.classList.remove('visible');
        document.body.classList.remove('sidebar-open');
      }
    }
  }

  function enableMobileCollapsibles() {
    if (!isMobileViewport()) return;
    const sections = document.querySelectorAll('.function-card .section-block');
    for (const section of sections) {
      if (section.dataset.collapsibleBound) continue;
      section.classList.add('collapsible');
      const header = section.querySelector('h5');
      if (!header) continue;
      header.setAttribute('role', 'button');
      header.setAttribute('tabindex', '0');
      header.setAttribute('aria-expanded', 'false');

      const toggleSection = () => {
        if (!isMobileViewport()) return;
        const isOpen = section.classList.toggle('open');
        header.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      };

      header.addEventListener('click', toggleSection);
      header.addEventListener('keydown', (event) => {
        if (event.key !== 'Enter' && event.key !== ' ') return;
        event.preventDefault();
        toggleSection();
      });

      section.dataset.collapsibleBound = 'true';
    }
  }

  function flashTarget(element) {
    element.classList.remove('flash');
    void element.offsetWidth;
    element.classList.add('flash');
    window.setTimeout(() => {
      element.classList.remove('flash');
    }, 1500);
  }

  function handleInitialHash() {
    const hash = window.location.hash.replace('#', '');
    if (!hash) return;
    const target = document.getElementById(hash);
    if (target) {
      target.scrollIntoView({ behavior: 'auto', block: 'start' });
      flashTarget(target);
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    const { categories, errors } = parseXmlBlocks();
    renderErrors(errors);
    renderContent(categories);
    const searchEntriesIndex = buildSearchIndex(categories);
    setupSidebar(categories, searchEntriesIndex, errors);
    handleInitialHash();
    enableMobileCollapsibles();
    if (window.matchMedia) {
      const media = window.matchMedia(MOBILE_MEDIA_QUERY);
      const handleMobileChange = () => {
        if (!media.matches) return;
        enableMobileCollapsibles();
      };
      if (typeof media.addEventListener === 'function') {
        media.addEventListener('change', handleMobileChange);
      } else if (typeof media.addListener === 'function') {
        media.addListener(handleMobileChange);
      }
    }
    if (window.microlight && typeof window.microlight.reset === 'function') {
      window.microlight.reset();
    }
  });
})();
