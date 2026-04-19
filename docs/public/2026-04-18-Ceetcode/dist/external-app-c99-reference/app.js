(() => {
  'use strict';

  const ALLOWED_TAGS = new Set(['p', 'strong', 'em', 'code', 'a', 'br']);
  const ALLOWED_HREF_PREFIXES = ['http://', 'https://', '#'];
  const usedIds = new Map();

  const EMBED_CONTRACT_NAMESPACE = 'awwtools.c99-reference.embed';
  const EMBED_SCHEMA_VERSION = 1;
  const EMBED_HASH_CONFIG_KEY = 'embedded-reference-config';
  const EMBED_HASH_ANCHOR_KEY = 'embedded-reference-anchor';

  const EMBED_MESSAGE_TYPES_INBOUND = [
    'INITIALIZE_REFERENCE_EMBEDDING_CONTEXT',
    'OPEN_REFERENCE_ENTRY',
    'EXECUTE_REFERENCE_SEARCH',
    'APPLY_HOST_THEME_TOKENS',
    'REQUEST_CURRENT_REFERENCE_STATE',
    'REQUEST_REFERENCE_HEIGHT_MEASUREMENT',
    'SET_REFERENCE_EMBEDDING_VISIBILITY_MODE',
    'REQUEST_REFERENCE_SNIPPET_BY_IDENTIFIER'
  ];

  const EMBED_MESSAGE_TYPES_OUTBOUND = [
    'REFERENCE_EMBED_READY',
    'REFERENCE_CURRENT_ENTRY_CHANGED',
    'REFERENCE_SEARCH_STATE_CHANGED',
    'REFERENCE_HEIGHT_MEASUREMENT_CHANGED',
    'REFERENCE_SNIPPET_INSERT_REQUESTED',
    'REFERENCE_SNIPPET_COPY_REQUESTED',
    'REFERENCE_CURRENT_STATE_RESPONSE',
    'REFERENCE_SNIPPET_RESOLVED',
    'REFERENCE_ERROR_EVENT'
  ];

  const SUPPORTED_THEME_TOKENS = new Set([
    '--embedded-reference-background-color',
    '--embedded-reference-panel-color',
    '--embedded-reference-surface-color',
    '--embedded-reference-text-color',
    '--embedded-reference-muted-text-color',
    '--embedded-reference-border-color',
    '--embedded-reference-accent-color',
    '--embedded-reference-link-color',
    '--embedded-reference-code-background-color',
    '--embedded-reference-code-text-color',
    '--embedded-reference-search-highlight-color',
    '--embedded-reference-font-family',
    '--embedded-reference-font-size',
    '--embedded-reference-line-height',
    '--embedded-reference-border-radius',
    '--embedded-reference-spacing-unit'
  ]);

  const HOST_THEME_PRESETS = {
    'ceetcode-light': {
      '--embedded-reference-background-color': '#f5f4ef',
      '--embedded-reference-panel-color': '#ffffff',
      '--embedded-reference-surface-color': '#f9f8f5',
      '--embedded-reference-text-color': '#1f2328',
      '--embedded-reference-muted-text-color': '#59636e',
      '--embedded-reference-border-color': '#d8d3c7',
      '--embedded-reference-accent-color': '#0d8b7b',
      '--embedded-reference-link-color': '#0d8b7b',
      '--embedded-reference-code-background-color': '#f0eee7',
      '--embedded-reference-code-text-color': '#1f2328',
      '--embedded-reference-search-highlight-color': '#fff3bf',
      '--embedded-reference-font-family': 'system-ui, -apple-system, "Segoe UI", "Helvetica Neue", Arial, sans-serif',
      '--embedded-reference-font-size': '16px',
      '--embedded-reference-line-height': '1.5',
      '--embedded-reference-border-radius': '10px',
      '--embedded-reference-spacing-unit': '1rem'
    }
  };

  const PRESENTATION_MODES = new Set(['panel', 'drawer', 'full-height-pane', 'mobile-full-view']);
  const SEARCH_MATCH_MODES = new Set(['best-effort', 'exact-title-first', 'entry-identifier-first']);
  const FOCUS_TARGETS = new Set(['search-input', 'current-entry', 'none']);
  const SNIPPET_ACTION_MODES = new Set(['insert-into-host-editor', 'copy-only', 'host-decides']);
  const REVEAL_BEHAVIORS = new Set(['focus-and-scroll', 'scroll-only', 'open-silently']);

  const navigationHashBehavior = {
    enabled: true,
    useEmbeddedAnchorParam: false
  };

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

  function toSlug(value) {
    return normalizeId(String(value || '').toLowerCase());
  }

  function normalizeLookupKey(value) {
    return toSlug(value || '');
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

  function renderContent(categories, embedController) {
    const container = document.getElementById('content');
    if (!container) return;
    container.innerHTML = '';

    for (const category of categories) {
      container.appendChild(renderCategory(category, embedController));
    }
  }

  function renderCategory(category, embedController) {
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
      section.appendChild(renderHeader(category, header, embedController));
    }

    return section;
  }

  function renderHeader(category, header, embedController) {
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
        section.appendChild(renderFunction(category, header, fn, embedController));
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

  function buildSignatureSnippetIdentifier(fn) {
    const base = (fn.id || fn.name || 'snippet').trim();
    return `${base}::signature`;
  }

  function buildSignatureSnippetPayload(category, header, fn) {
    return {
      snippetIdentifier: buildSignatureSnippetIdentifier(fn),
      snippetLanguage: 'c',
      snippetText: fn.signatureText,
      entryIdentifier: fn.id || `c99-${toSlug(header.name).replace(/-h$/, '')}-${toSlug(fn.name)}`,
      entryTitle: fn.name,
      categoryName: category.name,
      headerName: header.name
    };
  }

  function buildExampleSnippetPayload(category, header, fn, example, exampleIndex) {
    const fallbackId = `${fn.id || fn.name || 'entry'}::example-${exampleIndex + 1}`;
    return {
      snippetIdentifier: example.id || fallbackId,
      snippetLanguage: example.lang || 'c',
      snippetText: example.codeText,
      entryIdentifier: fn.id || `c99-${toSlug(header.name).replace(/-h$/, '')}-${toSlug(fn.name)}`,
      entryTitle: fn.name,
      categoryName: category.name,
      headerName: header.name
    };
  }

  function renderFunction(category, header, fn, embedController) {
    const card = document.createElement('article');
    card.className = 'function-card';
    card.id = fn.anchorId;

    const headerRow = document.createElement('div');
    headerRow.className = 'function-header';

    const title = document.createElement('h4');
    title.textContent = fn.name;
    headerRow.appendChild(title);

    if (fn.kind && fn.kind !== 'function') {
      const kind = document.createElement('span');
      kind.className = 'function-kind';
      kind.textContent = fn.kind.replace(/_/g, ' ');
      headerRow.appendChild(kind);
    }

    card.appendChild(headerRow);

    if (fn.signatureText) {
      const signatureSnippet = buildSignatureSnippetPayload(category, header, fn);
      const signature = renderCopyBlock('Signature', fn.signatureText, 'signature', 'c', signatureSnippet, embedController);
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
      const sectionTitle = document.createElement('h5');
      sectionTitle.textContent = 'Parameters';
      section.appendChild(sectionTitle);

      for (const param of fn.parameters) {
        section.appendChild(renderParameter(param));
      }
      card.appendChild(section);
    }

    if (fn.returns.length) {
      const section = document.createElement('section');
      section.className = 'section-block';
      const sectionTitle = document.createElement('h5');
      sectionTitle.textContent = 'Returns';
      section.appendChild(sectionTitle);
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
      const sectionTitle = document.createElement('h5');
      sectionTitle.textContent = 'Examples';
      section.appendChild(sectionTitle);
      fn.examples.forEach((example, exampleIndex) => {
        section.appendChild(renderExample(category, header, fn, example, exampleIndex, embedController));
      });
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
        const noteHeader = document.createElement('div');
        noteHeader.className = 'note-header';
        const severity = document.createElement('span');
        severity.className = 'note-severity';
        severity.textContent = constraint.severity || 'info';
        noteHeader.appendChild(severity);
        note.appendChild(noteHeader);
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

  function renderExample(category, header, fn, example, exampleIndex, embedController) {
    const block = document.createElement('div');
    block.className = 'example';

    if (example.title) {
      const title = document.createElement('div');
      title.className = 'example-title';
      title.textContent = example.title;
      block.appendChild(title);
    }

    if (example.codeText) {
      const snippetPayload = buildExampleSnippetPayload(category, header, fn, example, exampleIndex);
      block.appendChild(renderCopyBlock('Example', example.codeText, 'example', example.lang || 'c', snippetPayload, embedController));
    }

    return block;
  }

  async function handleSnippetUsage(snippetPayload, statusEl, embedController) {
    if (!statusEl) return;
    statusEl.textContent = '';
    statusEl.classList.remove('copy-success', 'copy-error');

    if (!snippetPayload || !snippetPayload.snippetText) {
      statusEl.textContent = 'Snippet unavailable';
      statusEl.classList.add('copy-error');
      window.setTimeout(() => {
        statusEl.textContent = '';
        statusEl.classList.remove('copy-error');
      }, 2000);
      return;
    }

    const accepted = embedController && embedController.requestSnippetAction(snippetPayload);
    if (accepted) {
      statusEl.textContent = 'Sent to host';
      statusEl.classList.add('copy-success');
      window.setTimeout(() => {
        statusEl.textContent = '';
        statusEl.classList.remove('copy-success');
      }, 2000);
      return;
    }

    await copyToClipboard(snippetPayload.snippetText, statusEl);
  }

  function renderCopyBlock(labelText, codeText, kind, lang, snippetPayload, embedController) {
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

    const useButton = document.createElement('button');
    useButton.type = 'button';
    useButton.className = 'snippet-button';
    useButton.textContent = 'Use';
    useButton.disabled = !snippetPayload || !snippetPayload.snippetText;

    const copyButton = document.createElement('button');
    copyButton.type = 'button';
    copyButton.className = 'copy-button';
    copyButton.textContent = 'Copy';

    const status = document.createElement('span');
    status.className = 'copy-status';

    useButton.addEventListener('click', () => {
      handleSnippetUsage(snippetPayload, status, embedController);
    });

    copyButton.addEventListener('click', () => {
      copyToClipboard(codeText, status);
    });

    actions.appendChild(useButton);
    actions.appendChild(copyButton);
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

  function searchEntries(entries, query, options = {}) {
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

    let ordered = results.map((result) => result.entry);

    if (options.matchMode === 'exact-title-first') {
      const normalizedQuery = normalizeText(trimmed);
      const exact = [];
      const rest = [];
      for (const entry of ordered) {
        if (normalizeText(entry.label) === normalizedQuery) {
          exact.push(entry);
        } else {
          rest.push(entry);
        }
      }
      ordered = exact.concat(rest);
    }

    if (options.matchMode === 'entry-identifier-first' && options.prioritizedAnchorId) {
      const first = ordered.findIndex((entry) => entry.anchorId === options.prioritizedAnchorId);
      if (first > 0) {
        const [picked] = ordered.splice(first, 1);
        ordered.unshift(picked);
      }
    }

    return ordered;
  }

  function setupSidebar(categories, entries, errors, options = {}) {
    const toc = document.getElementById('toc');
    const searchInput = document.getElementById('searchInput');
    const searchHint = document.getElementById('searchHint');
    const sidebar = document.getElementById('sidebar');
    const toggle = document.getElementById('sidebarToggle');
    const backdrop = document.getElementById('sidebarBackdrop');

    if (!toc || !searchInput) {
      return {
        renderFull: () => {},
        renderSearch: () => [],
        setSearchQuery: () => [],
        focusSearchInput: () => {},
        getSearchQuery: () => '',
        getVisibleResultCount: () => 0
      };
    }

    const onSearchStateChanged = typeof options.onSearchStateChanged === 'function'
      ? options.onSearchStateChanged
      : () => {};

    const entryByAnchorId = new Map(entries.map((entry) => [entry.anchorId, entry]));
    const maxVisibleSearchResults = 80;
    const compactSearchVisibleResultCount = 24;

    let visibleResultCount = 0;
    let lastSearchRenderSignature = '';

    const renderFull = (emitEvent = true) => {
      toc.innerHTML = '';
      toc.appendChild(renderToc(categories));
      if (errors.length) {
        toc.appendChild(renderSidebarErrors(errors));
      }
      visibleResultCount = 0;
      if (searchHint) {
        searchHint.textContent = 'Showing full table of contents.';
      }
      if (emitEvent) {
        onSearchStateChanged('', 0);
      }
    };

    const renderSearch = (query, settings = {}) => {
      const trimmed = query.trim();
      if (!trimmed) {
        renderFull(settings.emitEvent !== false);
        lastSearchRenderSignature = '';
        return [];
      }

      const allResults = searchEntries(entries, query, {
        matchMode: settings.matchMode || 'best-effort',
        prioritizedAnchorId: settings.prioritizedAnchorId || null
      });

      const shouldUseCompactRender = trimmed.length < 2 || allResults.length > 40;
      const visibleResultLimit = shouldUseCompactRender
        ? Math.min(compactSearchVisibleResultCount, maxVisibleSearchResults)
        : maxVisibleSearchResults;
      const limitedResults = allResults.slice(0, visibleResultLimit);
      const renderSignature = [
        trimmed.toLowerCase(),
        allResults.length,
        shouldUseCompactRender ? 'compact' : 'full',
        limitedResults.map((entry) => entry.anchorId).join('|')
      ].join('::');

      if (renderSignature !== lastSearchRenderSignature) {
        toc.innerHTML = '';
        toc.appendChild(renderSearchResults(limitedResults, {
          query: trimmed,
          totalResultCount: allResults.length,
          maxVisibleResultCount: visibleResultLimit,
          includeSignatures: !shouldUseCompactRender
        }));
        if (errors.length) {
          toc.appendChild(renderSidebarErrors(errors));
        }
        lastSearchRenderSignature = renderSignature;
      }

      visibleResultCount = allResults.length;
      if (searchHint) {
        searchHint.textContent = allResults.length
          ? allResults.length > visibleResultLimit
            ? `Found ${allResults.length} results for "${query}". Showing top ${visibleResultLimit}.`
            : `Found ${allResults.length} result${allResults.length === 1 ? '' : 's'} for "${query}".`
          : `No matches for "${query}".`;
      }

      if (settings.emitEvent !== false) {
        onSearchStateChanged(trimmed, allResults.length);
      }

      return allResults;
    };

    let debounceId = 0;
    searchInput.addEventListener('input', () => {
      window.clearTimeout(debounceId);
      debounceId = window.setTimeout(() => {
        const query = searchInput.value;
        if (query.trim()) {
          renderSearch(query, { emitEvent: true, matchMode: 'best-effort' });
        } else {
          renderFull(true);
        }
      }, 120);
    });

    searchInput.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        searchInput.value = '';
        renderFull(true);
        return;
      }
      if (event.key === 'Enter') {
        const query = searchInput.value;
        const results = searchEntries(entries, query, { matchMode: 'best-effort' });
        if (results.length) {
          navigateTo(results[0].anchorId, { closeSidebar: true, source: 'search-enter' });
        }
      }
    });

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

      toc.addEventListener('click', (event) => {
        const link = event.target.closest('a[data-target]');
        if (!link) return;
        event.preventDefault();
        const targetId = link.getAttribute('data-target');
        navigateTo(targetId, { closeSidebar: true, source: 'toc' });
      });
    } else {
      toc.addEventListener('click', (event) => {
        const link = event.target.closest('a[data-target]');
        if (!link) return;
        event.preventDefault();
        const targetId = link.getAttribute('data-target');
        navigateTo(targetId, { source: 'toc' });
      });
    }

    renderFull(false);

    return {
      renderFull,
      renderSearch,
      setSearchQuery(query, settings = {}) {
        searchInput.value = query || '';
        if ((query || '').trim()) {
          return renderSearch(query, {
            emitEvent: settings.emitEvent !== false,
            matchMode: settings.matchMode || 'best-effort',
            prioritizedAnchorId: settings.prioritizedAnchorId || null
          });
        }
        renderFull(settings.emitEvent !== false);
        return [];
      },
      focusSearchInput() {
        searchInput.focus({ preventScroll: true });
      },
      getSearchQuery() {
        return searchInput.value || '';
      },
      getVisibleResultCount() {
        return visibleResultCount;
      },
      getEntryByAnchor(anchorId) {
        return entryByAnchorId.get(anchorId) || null;
      }
    };
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

  function renderSearchResults(results, options = {}) {
    const query = (options.query || '').trim();
    const totalResultCount = Number(options.totalResultCount || results.length);
    const maxVisibleResultCount = Number(options.maxVisibleResultCount || results.length);
    const includeSignatures = options.includeSignatures !== false;
    const fragment = document.createDocumentFragment();
    const list = document.createElement('ul');
    list.className = 'search-results';

    if (query) {
      const summary = document.createElement('div');
      summary.className = 'search-query-summary';
      if (totalResultCount > maxVisibleResultCount) {
        summary.textContent = `Matching "${query}" (showing ${results.length} of ${totalResultCount})`;
      } else {
        summary.textContent = `Matching "${query}" (${totalResultCount})`;
      }
      fragment.appendChild(summary);
    }

    for (const entry of results) {
      const item = document.createElement('li');
      const link = createTocLink(entry.label, entry.anchorId, null);
      link.classList.add('search-result');

      const meta = document.createElement('span');
      meta.className = 'search-meta';
      const context = entry.context ? ` • ${entry.context}` : '';
      meta.textContent = `${labelForType(entry.type)}${context}`;
      link.appendChild(meta);

      if (includeSignatures && entry.signature) {
        const signature = document.createElement('span');
        signature.className = 'search-signature';
        signature.textContent = entry.signature;
        link.appendChild(signature);
      }

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

  function readHashParams(rawHash) {
    const hash = (rawHash || window.location.hash || '').replace(/^#/, '');
    return new URLSearchParams(hash);
  }

  function writeHashParams(params) {
    const next = params.toString();
    history.pushState(null, '', next ? `#${next}` : '#');
  }

  function updateNavigationHash(targetId) {
    if (!navigationHashBehavior.enabled) return;

    if (navigationHashBehavior.useEmbeddedAnchorParam) {
      const params = readHashParams(window.location.hash);
      if (params.has(EMBED_HASH_CONFIG_KEY)) {
        params.set(EMBED_HASH_ANCHOR_KEY, targetId);
        writeHashParams(params);
        return;
      }
    }

    history.pushState(null, '', `#${targetId}`);
  }

  let onNavigationEvent = () => {};

  function navigateTo(targetId, options = {}) {
    const element = document.getElementById(targetId);
    if (!element) return false;

    const revealBehavior = REVEAL_BEHAVIORS.has(options.revealBehavior)
      ? options.revealBehavior
      : 'focus-and-scroll';

    const smoothAllowed = revealBehavior !== 'open-silently';
    const behavior = options.scrollBehavior || (smoothAllowed ? 'smooth' : 'auto');

    element.scrollIntoView({ behavior, block: 'start' });

    if (options.updateHash !== false) {
      updateNavigationHash(targetId);
    }

    if (revealBehavior !== 'open-silently' && options.flash !== false) {
      flashTarget(element);
    }

    if (options.entrySectionIdentifier) {
      revealEntrySection(element, options.entrySectionIdentifier, revealBehavior);
    }

    if (options.closeSidebar) {
      const sidebar = document.getElementById('sidebar');
      const backdrop = document.getElementById('sidebarBackdrop');
      if (sidebar && backdrop) {
        sidebar.classList.remove('open');
        backdrop.classList.remove('visible');
        document.body.classList.remove('sidebar-open');
      }
    }

    onNavigationEvent(targetId, {
      source: options.source || 'local',
      entrySectionIdentifier: options.entrySectionIdentifier || null
    });

    return true;
  }

  function revealEntrySection(entryElement, sectionIdentifier, revealBehavior) {
    const normalizedSection = normalizeLookupKey(sectionIdentifier);
    if (!normalizedSection) return;

    const sectionTitles = Array.from(entryElement.querySelectorAll('.section-block > h5'));
    const match = sectionTitles.find((titleEl) => {
      const text = normalizeLookupKey(titleEl.textContent || '');
      return text === normalizedSection || text.startsWith(normalizedSection) || normalizedSection.startsWith(text);
    });

    if (!match) return;

    match.scrollIntoView({
      behavior: revealBehavior === 'open-silently' ? 'auto' : 'smooth',
      block: 'center'
    });
  }

  function flashTarget(element) {
    element.classList.remove('flash');
    void element.offsetWidth;
    element.classList.add('flash');
    window.setTimeout(() => {
      element.classList.remove('flash');
    }, 1500);
  }

  function handleInitialHash(shouldSkipAnchor) {
    const hash = window.location.hash.replace('#', '');
    if (!hash) return;

    const params = new URLSearchParams(hash);
    if (params.has(EMBED_HASH_ANCHOR_KEY)) {
      const targetId = params.get(EMBED_HASH_ANCHOR_KEY) || '';
      if (targetId) {
        const target = document.getElementById(targetId);
        if (target) {
          target.scrollIntoView({ behavior: 'auto', block: 'start' });
          flashTarget(target);
        }
      }
      return;
    }

    if (shouldSkipAnchor || hash.includes('=')) return;

    const target = document.getElementById(hash);
    if (target) {
      target.scrollIntoView({ behavior: 'auto', block: 'start' });
      flashTarget(target);
    }
  }

  function asBoolean(value, fallback = false) {
    if (typeof value === 'boolean') return value;
    return fallback;
  }

  function asNonEmptyString(value, fallback = '') {
    if (typeof value !== 'string') return fallback;
    const trimmed = value.trim();
    return trimmed || fallback;
  }

  function asEnum(value, allowedSet, fallback) {
    const normalized = asNonEmptyString(value, '');
    if (!normalized) return fallback;
    return allowedSet.has(normalized) ? normalized : fallback;
  }

  function parseEmbeddedReferenceConfigFromHash() {
    const params = readHashParams(window.location.hash);
    if (!params.has(EMBED_HASH_CONFIG_KEY)) {
      return {
        hasConfig: false,
        config: null,
        decodeError: null
      };
    }

    const encodedPayload = params.get(EMBED_HASH_CONFIG_KEY) || '';
    const decodeAttempts = [];

    decodeAttempts.push(encodedPayload);

    try {
      decodeAttempts.push(decodeURIComponent(encodedPayload));
    } catch (err) {
      // ignored: a raw non-percent-encoded payload is still valid.
    }

    try {
      const base64Candidate = encodedPayload.replace(/-/g, '+').replace(/_/g, '/');
      const padded = base64Candidate + '==='.slice((base64Candidate.length + 3) % 4);
      decodeAttempts.push(atob(padded));
    } catch (err) {
      // ignored: payload may not be base64url.
    }

    for (const attempt of decodeAttempts) {
      try {
        const parsed = JSON.parse(attempt);
        if (parsed && typeof parsed === 'object') {
          return {
            hasConfig: true,
            config: parsed,
            decodeError: null
          };
        }
      } catch (err) {
        // Continue trying alternatives.
      }
    }

    return {
      hasConfig: true,
      config: null,
      decodeError: 'Unable to decode embedded reference startup config.'
    };
  }

  function createReferenceIndexes(categories) {
    const entryByIdentifier = new Map();
    const entryByAnchorId = new Map();
    const snippetByIdentifier = new Map();

    function registerEntry(entry, candidates) {
      entryByAnchorId.set(entry.anchorId, entry);
      for (const candidate of candidates) {
        if (!candidate) continue;
        const raw = String(candidate).trim().toLowerCase();
        const normalized = normalizeLookupKey(candidate);
        if (raw && !entryByIdentifier.has(raw)) {
          entryByIdentifier.set(raw, entry);
        }
        if (normalized && !entryByIdentifier.has(normalized)) {
          entryByIdentifier.set(normalized, entry);
        }
      }
    }

    function registerSnippet(snippet, candidates) {
      for (const candidate of candidates) {
        if (!candidate) continue;
        const raw = String(candidate).trim().toLowerCase();
        const normalized = normalizeLookupKey(candidate);
        if (raw && !snippetByIdentifier.has(raw)) {
          snippetByIdentifier.set(raw, snippet);
        }
        if (normalized && !snippetByIdentifier.has(normalized)) {
          snippetByIdentifier.set(normalized, snippet);
        }
      }
    }

    for (const category of categories) {
      const categoryEntry = {
        anchorId: category.anchorId,
        entryIdentifier: category.id,
        entryTitle: category.name,
        entryType: 'category',
        entrySectionIdentifier: null
      };

      registerEntry(categoryEntry, [
        category.id,
        category.name,
        `c99-${toSlug(category.name)}`,
        `c99-${toSlug(category.id)}`
      ]);

      for (const header of category.headers) {
        const headerStem = toSlug(header.name).replace(/-h$/, '');

        const headerEntry = {
          anchorId: header.anchorId,
          entryIdentifier: header.id,
          entryTitle: header.name,
          entryType: 'header',
          entrySectionIdentifier: null
        };

        registerEntry(headerEntry, [
          header.id,
          header.name,
          headerStem,
          `c99-${headerStem}`,
          `${category.id}-${header.id}`
        ]);

        for (const fn of header.functions) {
          if (fn.kind === 'internal_note') continue;
          const functionStem = toSlug(fn.name);
          const c99StyleIdentifier = `c99-${headerStem}-${functionStem}`;
          const functionEntry = {
            anchorId: fn.anchorId,
            entryIdentifier: fn.id || c99StyleIdentifier,
            entryTitle: fn.name,
            entryType: 'function',
            entrySectionIdentifier: null
          };

          registerEntry(functionEntry, [
            fn.id,
            fn.name,
            functionStem,
            c99StyleIdentifier,
            `${header.id}-${fn.id}`,
            `${header.id}-${fn.name}`,
            `${category.id}-${header.id}-${fn.id}`
          ]);

          if (fn.signatureText) {
            const signatureSnippet = buildSignatureSnippetPayload(category, header, fn);
            registerSnippet(signatureSnippet, [
              signatureSnippet.snippetIdentifier,
              `${functionEntry.entryIdentifier}::signature`,
              `${c99StyleIdentifier}::signature`,
              `${fn.name}::signature`
            ]);
          }

          fn.examples.forEach((example, exampleIndex) => {
            if (!example.codeText) return;
            const exampleSnippet = buildExampleSnippetPayload(category, header, fn, example, exampleIndex);
            registerSnippet(exampleSnippet, [
              exampleSnippet.snippetIdentifier,
              `${functionEntry.entryIdentifier}::example-${exampleIndex + 1}`,
              `${c99StyleIdentifier}::example-${exampleIndex + 1}`,
              `${fn.name}::example-${exampleIndex + 1}`
            ]);
          });
        }
      }
    }

    return {
      entryByIdentifier,
      entryByAnchorId,
      snippetByIdentifier
    };
  }

  function createDefaultEmbedState() {
    return {
      schemaVersion: EMBED_SCHEMA_VERSION,
      isEmbeddedInsideHostApplication: false,
      embeddedPresentationMode: 'panel',
      hideStandaloneTopNavigation: false,
      hideStandaloneFooterArea: false,
      useCompactSpacing: false,
      hostThemeMode: 'standalone-default',
      hostThemeTokens: {},
      snippetActionMode: 'host-decides',
      enableOutboundHeightReporting: false,
      enableOutboundSelectionReporting: false,
      enableHashDrivenInternalNavigation: false,
      currentSearchQueryText: '',
      visibleSearchResultCount: 0,
      currentEntryIdentifier: null,
      currentEntryTitle: '',
      currentEntrySectionIdentifier: null,
      hostApplicationIdentifier: '',
      initialFocusTarget: 'none',
      startupConfigDetected: false,
      startupConfigMalformed: false
    };
  }

  function createEmbedController(options) {
    const state = createDefaultEmbedState();
    const indexes = options.indexes;
    const sidebarApi = options.sidebarApi;

    let hasParsedStartupConfig = false;
    let hostMessageOrigin = '';
    let readyEventEmitted = false;
    let lastReportedHeight = 0;
    let pendingHeightTimeout = 0;
    let resizeObserver = null;

    function emitEmbedMessage(messageType, payload, requestIdentifier) {
      if (window.parent === window) return;

      const envelope = {
        contractNamespace: EMBED_CONTRACT_NAMESPACE,
        schemaVersion: EMBED_SCHEMA_VERSION,
        messageType,
        payload: payload || {}
      };

      if (requestIdentifier) {
        envelope.requestIdentifier = requestIdentifier;
      }

      const fallbackOrigin = (window.location.origin && window.location.origin !== 'null')
        ? window.location.origin
        : '*';

      window.parent.postMessage(envelope, hostMessageOrigin || fallbackOrigin);
    }

    function emitErrorEvent(errorCode, errorMessage, relatedRequestIdentifier) {
      emitEmbedMessage('REFERENCE_ERROR_EVENT', {
        errorCode,
        errorMessage,
        relatedRequestIdentifier: relatedRequestIdentifier || null
      }, relatedRequestIdentifier || undefined);
    }

    function syncBodyClasses() {
      document.body.classList.toggle('embedded-mode', state.isEmbeddedInsideHostApplication);
      document.body.classList.toggle('hide-standalone-top-navigation', state.hideStandaloneTopNavigation);
      document.body.classList.toggle('hide-standalone-footer-area', state.hideStandaloneFooterArea);
      document.body.classList.toggle('use-compact-spacing', state.useCompactSpacing);

      for (const mode of PRESENTATION_MODES) {
        const className = `presentation-${mode}`;
        document.body.classList.toggle(className, state.embeddedPresentationMode === mode);
      }

      navigationHashBehavior.enabled = state.isEmbeddedInsideHostApplication
        ? !!state.enableHashDrivenInternalNavigation
        : true;
      navigationHashBehavior.useEmbeddedAnchorParam = state.isEmbeddedInsideHostApplication;
    }

    function applyHostThemeTokens(themeTokenMap) {
      if (!themeTokenMap || typeof themeTokenMap !== 'object') return;
      const root = document.documentElement;
      for (const [tokenName, tokenValue] of Object.entries(themeTokenMap)) {
        if (!tokenName.startsWith('--embedded-reference-')) continue;
        if (!SUPPORTED_THEME_TOKENS.has(tokenName)) continue;
        root.style.setProperty(tokenName, String(tokenValue));
        state.hostThemeTokens[tokenName] = String(tokenValue);
      }
    }

    function applyHostThemePresetIfNeeded(hostThemeState) {
      const mode = asEnum(hostThemeState.hostThemeMode, new Set(['standalone-default', 'inherit-from-host', 'named-host-preset']), state.hostThemeMode);
      state.hostThemeMode = mode;

      const presetName = asNonEmptyString(hostThemeState.hostColorTokenPresetName, '');
      if (mode === 'named-host-preset' && presetName && HOST_THEME_PRESETS[presetName]) {
        applyHostThemeTokens(HOST_THEME_PRESETS[presetName]);
      }
    }

    function applyEmbeddingModeSection(section) {
      if (!section || typeof section !== 'object') return;
      if (typeof section.isEmbeddedInsideHostApplication === 'boolean') {
        state.isEmbeddedInsideHostApplication = section.isEmbeddedInsideHostApplication;
      }

      state.embeddedPresentationMode = asEnum(
        section.embeddedPresentationMode,
        PRESENTATION_MODES,
        state.embeddedPresentationMode
      );
      state.hideStandaloneTopNavigation = asBoolean(section.hideStandaloneTopNavigation, state.hideStandaloneTopNavigation);
      state.hideStandaloneFooterArea = asBoolean(section.hideStandaloneFooterArea, state.hideStandaloneFooterArea);
      state.useCompactSpacing = asBoolean(section.useCompactSpacing, state.useCompactSpacing);
    }

    function applyInitialViewStateSection(section) {
      if (!section || typeof section !== 'object') return;
      state.initialFocusTarget = asEnum(section.initialFocusTarget, FOCUS_TARGETS, state.initialFocusTarget);
    }

    function applyHostThemeStateSection(section) {
      if (!section || typeof section !== 'object') return;
      applyHostThemePresetIfNeeded(section);
    }

    function applyIntegrationHintsSection(section) {
      if (!section || typeof section !== 'object') return;
      state.snippetActionMode = asEnum(section.snippetActionMode, SNIPPET_ACTION_MODES, state.snippetActionMode);
      state.enableOutboundHeightReporting = asBoolean(section.enableOutboundHeightReporting, state.enableOutboundHeightReporting);
      state.enableOutboundSelectionReporting = asBoolean(section.enableOutboundSelectionReporting, state.enableOutboundSelectionReporting);
      state.enableHashDrivenInternalNavigation = asBoolean(section.enableHashDrivenInternalNavigation, state.enableHashDrivenInternalNavigation);
    }

    function resolveEntryByIdentifier(entryIdentifier) {
      if (!entryIdentifier) return null;
      const raw = String(entryIdentifier).trim().toLowerCase();
      const normalized = normalizeLookupKey(entryIdentifier);
      return indexes.entryByIdentifier.get(raw) || indexes.entryByIdentifier.get(normalized) || null;
    }

    function resolveSnippetByIdentifier(snippetIdentifier) {
      if (!snippetIdentifier) return null;
      const raw = String(snippetIdentifier).trim().toLowerCase();
      const normalized = normalizeLookupKey(snippetIdentifier);
      return indexes.snippetByIdentifier.get(raw) || indexes.snippetByIdentifier.get(normalized) || null;
    }

    function emitCurrentEntryChanged(entry, sectionIdentifier) {
      if (!entry) return;
      state.currentEntryIdentifier = entry.entryIdentifier;
      state.currentEntryTitle = entry.entryTitle;
      state.currentEntrySectionIdentifier = sectionIdentifier || null;

      if (!state.isEmbeddedInsideHostApplication) return;

      emitEmbedMessage('REFERENCE_CURRENT_ENTRY_CHANGED', {
        entryIdentifier: entry.entryIdentifier,
        entryTitle: entry.entryTitle,
        entrySectionIdentifier: sectionIdentifier || null
      });
    }

    function emitSearchStateChanged(searchQueryText, visibleResultCount) {
      state.currentSearchQueryText = searchQueryText;
      state.visibleSearchResultCount = visibleResultCount;

      if (!state.isEmbeddedInsideHostApplication) return;

      emitEmbedMessage('REFERENCE_SEARCH_STATE_CHANGED', {
        searchQueryText,
        visibleResultCount
      });
    }

    function measurePreferredHeight() {
      const body = document.body;
      const documentHeight = document.documentElement ? document.documentElement.scrollHeight : 0;
      const bodyHeight = body ? body.scrollHeight : 0;
      return Math.max(documentHeight, bodyHeight);
    }

    function emitHeightMeasurementChanged(requestIdentifier, measurementMode) {
      const mode = asNonEmptyString(measurementMode, 'document-scroll-height');
      const preferredHeightInPixels = measurePreferredHeight();
      lastReportedHeight = preferredHeightInPixels;

      if (!state.isEmbeddedInsideHostApplication) return;

      emitEmbedMessage('REFERENCE_HEIGHT_MEASUREMENT_CHANGED', {
        preferredHeightInPixels,
        measurementMode: mode
      }, requestIdentifier);
    }

    function scheduleHeightMeasurementChanged(reason) {
      if (!state.isEmbeddedInsideHostApplication || !state.enableOutboundHeightReporting) return;

      window.clearTimeout(pendingHeightTimeout);
      pendingHeightTimeout = window.setTimeout(() => {
        const preferredHeightInPixels = measurePreferredHeight();
        const delta = Math.abs(preferredHeightInPixels - lastReportedHeight);
        if (delta < 6) return;
        emitEmbedMessage('REFERENCE_HEIGHT_MEASUREMENT_CHANGED', {
          preferredHeightInPixels,
          measurementMode: 'document-scroll-height',
          reason: asNonEmptyString(reason, 'content-change')
        });
        lastReportedHeight = preferredHeightInPixels;
      }, 140);
    }

    function emitCurrentReferenceStateResponse(requestIdentifier, includePayload) {
      const payload = {};
      const includeCurrentSearchState = includePayload ? asBoolean(includePayload.includeCurrentSearchState, true) : true;
      const includeCurrentEntryState = includePayload ? asBoolean(includePayload.includeCurrentEntryState, true) : true;
      const includeCurrentHeightMeasurement = includePayload ? asBoolean(includePayload.includeCurrentHeightMeasurement, true) : true;

      if (includeCurrentEntryState) {
        payload.currentEntryIdentifier = state.currentEntryIdentifier;
        payload.currentEntryTitle = state.currentEntryTitle;
        payload.currentEntrySectionIdentifier = state.currentEntrySectionIdentifier;
      }

      if (includeCurrentSearchState) {
        payload.currentSearchQueryText = state.currentSearchQueryText;
        payload.visibleSearchResultCount = state.visibleSearchResultCount;
      }

      if (includeCurrentHeightMeasurement) {
        payload.preferredHeightInPixels = measurePreferredHeight();
      }

      emitEmbedMessage('REFERENCE_CURRENT_STATE_RESPONSE', payload, requestIdentifier);
    }

    function openReferenceEntryByIdentifier(entryIdentifier, options) {
      const entry = resolveEntryByIdentifier(entryIdentifier);
      if (!entry) return false;

      const revealBehavior = asEnum(
        options && options.revealBehavior,
        REVEAL_BEHAVIORS,
        'focus-and-scroll'
      );

      const didNavigate = navigateTo(entry.anchorId, {
        closeSidebar: true,
        source: options && options.source ? options.source : 'embed',
        revealBehavior,
        entrySectionIdentifier: options && options.entrySectionIdentifier ? options.entrySectionIdentifier : null,
        updateHash: options && options.updateHash !== false
      });

      if (!didNavigate) {
        return false;
      }

      return true;
    }

    function executeReferenceSearch(query, matchMode, requestIdentifier) {
      const normalizedMatchMode = asEnum(matchMode, SEARCH_MATCH_MODES, 'best-effort');

      let prioritizedAnchorId = null;
      if (normalizedMatchMode === 'entry-identifier-first') {
        const entry = resolveEntryByIdentifier(query);
        if (entry) {
          prioritizedAnchorId = entry.anchorId;
        }
      }

      const shouldEmitViaSidebar = !requestIdentifier;

      const results = sidebarApi.setSearchQuery(query, {
        emitEvent: shouldEmitViaSidebar,
        matchMode: normalizedMatchMode,
        prioritizedAnchorId
      });

      if (normalizedMatchMode === 'entry-identifier-first' && prioritizedAnchorId) {
        navigateTo(prioritizedAnchorId, {
          closeSidebar: true,
          source: 'embed-search',
          revealBehavior: 'open-silently'
        });
      }

      if (requestIdentifier) {
        const visibleResultCount = Array.isArray(results) ? results.length : sidebarApi.getVisibleResultCount();
        state.currentSearchQueryText = query;
        state.visibleSearchResultCount = visibleResultCount;
        emitEmbedMessage('REFERENCE_SEARCH_STATE_CHANGED', {
          searchQueryText: query,
          visibleResultCount
        }, requestIdentifier);
      }

      scheduleHeightMeasurementChanged('search-change');
      return results;
    }

    function requestSnippetAction(snippet) {
      if (!snippet || !snippet.snippetText) return false;

      if (!state.isEmbeddedInsideHostApplication) {
        return false;
      }

      const insertionMode = state.snippetActionMode === 'insert-into-host-editor'
        ? 'insert-at-cursor'
        : state.snippetActionMode === 'copy-only'
          ? 'host-decides'
          : 'host-decides';

      if (state.snippetActionMode === 'copy-only') {
        emitEmbedMessage('REFERENCE_SNIPPET_COPY_REQUESTED', {
          snippetIdentifier: snippet.snippetIdentifier,
          snippetLanguage: snippet.snippetLanguage || 'c',
          snippetText: snippet.snippetText
        });
        return true;
      }

      emitEmbedMessage('REFERENCE_SNIPPET_INSERT_REQUESTED', {
        snippetIdentifier: snippet.snippetIdentifier,
        snippetLanguage: snippet.snippetLanguage || 'c',
        snippetText: snippet.snippetText,
        insertionMode
      });

      return true;
    }

    function emitEmbedReadyIfNeeded() {
      if (!state.isEmbeddedInsideHostApplication || readyEventEmitted) return;
      emitEmbedMessage('REFERENCE_EMBED_READY', {
        referenceApplicationIdentifier: 'c99-reference-ii-with-programming-idioms',
        supportedSchemaVersion: EMBED_SCHEMA_VERSION,
        supportedMessageTypes: EMBED_MESSAGE_TYPES_INBOUND.slice()
      });
      readyEventEmitted = true;
    }

    function setupHeightObservation() {
      if (resizeObserver) return;

      if (typeof ResizeObserver === 'function') {
        resizeObserver = new ResizeObserver(() => {
          scheduleHeightMeasurementChanged('resize-observer');
        });
        resizeObserver.observe(document.documentElement);
        if (document.body) {
          resizeObserver.observe(document.body);
        }
      } else {
        window.addEventListener('resize', () => {
          scheduleHeightMeasurementChanged('window-resize');
        });
      }
    }

    function applyStartupConfig(startupConfig) {
      if (!startupConfig || typeof startupConfig !== 'object') return;

      state.schemaVersion = Number(startupConfig.schemaVersion) || EMBED_SCHEMA_VERSION;

      applyEmbeddingModeSection(startupConfig.embeddingMode || {});
      applyInitialViewStateSection(startupConfig.initialViewState || {});
      applyHostThemeStateSection(startupConfig.hostThemeState || {});
      applyIntegrationHintsSection(startupConfig.integrationHints || {});

      syncBodyClasses();

      const initialEntryState = startupConfig.initialEntryState && typeof startupConfig.initialEntryState === 'object'
        ? startupConfig.initialEntryState
        : {};

      const initialSearchState = startupConfig.initialSearchState && typeof startupConfig.initialSearchState === 'object'
        ? startupConfig.initialSearchState
        : {};

      const initialEntryIdentifier = asNonEmptyString(initialEntryState.initialEntryIdentifier, '');
      const initialEntrySectionIdentifier = asNonEmptyString(initialEntryState.initialEntrySectionIdentifier, '');
      const preferDirectEntry = asBoolean(initialEntryState.preferDirectEntryOpenOverSearchResults, true);

      const initialSearchQueryText = asNonEmptyString(initialSearchState.initialSearchQueryText, '');
      const initialSearchMatchMode = asEnum(initialSearchState.initialSearchMatchMode, SEARCH_MATCH_MODES, 'best-effort');
      const autoRunInitialSearch = asBoolean(initialSearchState.autoRunInitialSearch, true);

      let openedEntry = false;
      if (initialEntryIdentifier && preferDirectEntry) {
        openedEntry = openReferenceEntryByIdentifier(initialEntryIdentifier, {
          revealBehavior: 'open-silently',
          source: 'startup-entry',
          entrySectionIdentifier: initialEntrySectionIdentifier || null,
          updateHash: state.enableHashDrivenInternalNavigation
        });
      }

      if (!openedEntry && initialSearchQueryText && autoRunInitialSearch) {
        executeReferenceSearch(initialSearchQueryText, initialSearchMatchMode);
      }

      if (!openedEntry && initialEntryIdentifier && !preferDirectEntry) {
        openedEntry = openReferenceEntryByIdentifier(initialEntryIdentifier, {
          revealBehavior: 'open-silently',
          source: 'startup-entry',
          entrySectionIdentifier: initialEntrySectionIdentifier || null,
          updateHash: state.enableHashDrivenInternalNavigation
        });
      }

      if (state.initialFocusTarget === 'search-input') {
        sidebarApi.focusSearchInput();
      }

      if (state.initialFocusTarget === 'current-entry' && state.currentEntryIdentifier) {
        const currentEntry = resolveEntryByIdentifier(state.currentEntryIdentifier);
        if (currentEntry) {
          const el = document.getElementById(currentEntry.anchorId);
          if (el) {
            el.setAttribute('tabindex', '-1');
            el.focus({ preventScroll: true });
          }
        }
      }

      if (state.enableOutboundHeightReporting) {
        scheduleHeightMeasurementChanged('startup');
      }
    }

    function initializeFromHash() {
      if (hasParsedStartupConfig) return;
      hasParsedStartupConfig = true;

      const parsed = parseEmbeddedReferenceConfigFromHash();
      if (!parsed.hasConfig) {
        syncBodyClasses();
        return;
      }

      state.startupConfigDetected = true;
      state.isEmbeddedInsideHostApplication = true;

      if (parsed.decodeError || !parsed.config) {
        state.startupConfigMalformed = true;
        syncBodyClasses();
        emitErrorEvent('MALFORMED_STARTUP_CONFIG', parsed.decodeError || 'Malformed startup configuration.');
        emitEmbedReadyIfNeeded();
        return;
      }

      applyStartupConfig(parsed.config);
      emitEmbedReadyIfNeeded();
    }

    function handleIncomingEmbedMessage(event) {
      const data = event.data;
      if (!data || typeof data !== 'object') return;
      if (data.contractNamespace !== EMBED_CONTRACT_NAMESPACE) return;

      if (event.origin && event.origin !== 'null') {
        hostMessageOrigin = event.origin;
      }

      const messageType = asNonEmptyString(data.messageType, '');
      const requestIdentifier = asNonEmptyString(data.requestIdentifier, '');
      const payload = data.payload && typeof data.payload === 'object' ? data.payload : {};

      if (!messageType) {
        emitErrorEvent('INVALID_MESSAGE_ENVELOPE', 'messageType is required for embed messages.', requestIdentifier || undefined);
        return;
      }

      if (!EMBED_MESSAGE_TYPES_INBOUND.includes(messageType)) {
        return;
      }

      if (!state.isEmbeddedInsideHostApplication) {
        state.isEmbeddedInsideHostApplication = true;
        syncBodyClasses();
      }

      switch (messageType) {
        case 'INITIALIZE_REFERENCE_EMBEDDING_CONTEXT': {
          state.hostApplicationIdentifier = asNonEmptyString(payload.hostApplicationIdentifier, state.hostApplicationIdentifier);
          state.embeddedPresentationMode = asEnum(payload.embeddedPresentationMode, PRESENTATION_MODES, state.embeddedPresentationMode);
          state.hostThemeMode = asEnum(payload.hostThemeMode, new Set(['standalone-default', 'inherit-from-host', 'named-host-preset']), state.hostThemeMode);
          state.snippetActionMode = asEnum(payload.snippetActionMode, SNIPPET_ACTION_MODES, state.snippetActionMode);
          state.hideStandaloneTopNavigation = asBoolean(payload.hideStandaloneTopNavigation, state.hideStandaloneTopNavigation);
          state.hideStandaloneFooterArea = asBoolean(payload.hideStandaloneFooterArea, state.hideStandaloneFooterArea);
          state.useCompactSpacing = asBoolean(payload.useCompactSpacing, state.useCompactSpacing);
          state.enableOutboundHeightReporting = asBoolean(payload.enableOutboundHeightReporting, state.enableOutboundHeightReporting);
          state.enableHashDrivenInternalNavigation = asBoolean(payload.enableHashDrivenInternalNavigation, state.enableHashDrivenInternalNavigation);

          syncBodyClasses();
          emitEmbedReadyIfNeeded();
          if (state.enableOutboundHeightReporting) {
            scheduleHeightMeasurementChanged('initialize-context');
          }
          break;
        }
        case 'OPEN_REFERENCE_ENTRY': {
          const entryIdentifier = asNonEmptyString(payload.entryIdentifier, '');
          if (!entryIdentifier) {
            emitErrorEvent('UNKNOWN_ENTRY_IDENTIFIER', 'entryIdentifier is required.', requestIdentifier || undefined);
            break;
          }

          const ok = openReferenceEntryByIdentifier(entryIdentifier, {
            revealBehavior: payload.revealBehavior,
            source: 'embed-open-entry',
            entrySectionIdentifier: payload.entrySectionIdentifier || null,
            updateHash: state.enableHashDrivenInternalNavigation
          });

          if (!ok) {
            emitErrorEvent('UNKNOWN_ENTRY_IDENTIFIER', 'The requested entry could not be found.', requestIdentifier || undefined);
          }
          break;
        }
        case 'EXECUTE_REFERENCE_SEARCH': {
          const searchQueryText = asNonEmptyString(payload.searchQueryText, '');
          const searchMatchMode = asEnum(payload.searchMatchMode, SEARCH_MATCH_MODES, 'best-effort');
          executeReferenceSearch(searchQueryText, searchMatchMode, requestIdentifier || undefined);
          break;
        }
        case 'APPLY_HOST_THEME_TOKENS': {
          if (!payload.themeTokenMap || typeof payload.themeTokenMap !== 'object') {
            emitErrorEvent('INVALID_THEME_TOKEN_MAP', 'themeTokenMap must be an object.', requestIdentifier || undefined);
            break;
          }
          applyHostThemeTokens(payload.themeTokenMap);
          scheduleHeightMeasurementChanged('theme-change');
          break;
        }
        case 'REQUEST_CURRENT_REFERENCE_STATE': {
          emitCurrentReferenceStateResponse(requestIdentifier || undefined, payload);
          break;
        }
        case 'REQUEST_REFERENCE_HEIGHT_MEASUREMENT': {
          emitHeightMeasurementChanged(requestIdentifier || undefined, payload.measurementMode);
          break;
        }
        case 'SET_REFERENCE_EMBEDDING_VISIBILITY_MODE': {
          state.embeddedPresentationMode = asEnum(payload.embeddedPresentationMode, PRESENTATION_MODES, state.embeddedPresentationMode);
          state.hideStandaloneTopNavigation = asBoolean(payload.hideStandaloneTopNavigation, state.hideStandaloneTopNavigation);
          state.hideStandaloneFooterArea = asBoolean(payload.hideStandaloneFooterArea, state.hideStandaloneFooterArea);
          state.useCompactSpacing = asBoolean(payload.useCompactSpacing, state.useCompactSpacing);
          syncBodyClasses();
          scheduleHeightMeasurementChanged('visibility-change');
          break;
        }
        case 'REQUEST_REFERENCE_SNIPPET_BY_IDENTIFIER': {
          const snippetIdentifier = asNonEmptyString(payload.snippetIdentifier, '');
          if (!snippetIdentifier) {
            emitErrorEvent('UNKNOWN_SNIPPET_IDENTIFIER', 'snippetIdentifier is required.', requestIdentifier || undefined);
            break;
          }
          const snippet = resolveSnippetByIdentifier(snippetIdentifier);
          if (!snippet) {
            emitErrorEvent('UNKNOWN_SNIPPET_IDENTIFIER', 'The requested snippet could not be found.', requestIdentifier || undefined);
            break;
          }
          emitEmbedMessage('REFERENCE_SNIPPET_RESOLVED', {
            snippetIdentifier: snippet.snippetIdentifier,
            snippetLanguage: snippet.snippetLanguage || 'c',
            snippetText: snippet.snippetText
          }, requestIdentifier || undefined);
          break;
        }
        default:
          break;
      }
    }

    function onNavigationByAnchor(anchorId, details) {
      const entry = indexes.entryByAnchorId.get(anchorId);
      if (!entry) return;
      emitCurrentEntryChanged(entry, details && details.entrySectionIdentifier ? details.entrySectionIdentifier : null);
      scheduleHeightMeasurementChanged('navigation');
    }

    function onSearchStateChanged(searchQueryText, visibleResultCount) {
      emitSearchStateChanged(searchQueryText, visibleResultCount);
      scheduleHeightMeasurementChanged('search');
    }

    function onRendered() {
      setupHeightObservation();
      if (state.enableOutboundHeightReporting) {
        scheduleHeightMeasurementChanged('render');
      }
      emitEmbedReadyIfNeeded();
    }

    function isEmbeddedActive() {
      return state.isEmbeddedInsideHostApplication;
    }

    return {
      initializeFromHash,
      handleIncomingEmbedMessage,
      onNavigationByAnchor,
      onSearchStateChanged,
      onRendered,
      requestSnippetAction,
      isEmbeddedActive,
      emitEmbedReadyIfNeeded,
      getState() {
        return Object.assign({}, state);
      }
    };
  }

  document.addEventListener('DOMContentLoaded', () => {
    const { categories, errors } = parseXmlBlocks();
    const indexes = createReferenceIndexes(categories);
    const searchEntriesIndex = buildSearchIndex(categories);

    let embedControllerRef = null;

    const sidebarApi = setupSidebar(categories, searchEntriesIndex, errors, {
      onSearchStateChanged: (query, count) => {
        if (embedControllerRef) {
          embedControllerRef.onSearchStateChanged(query, count);
        }
      }
    });

    const embedController = createEmbedController({
      indexes,
      sidebarApi
    });
    embedControllerRef = embedController;

    renderErrors(errors);
    renderContent(categories, embedController);

    onNavigationEvent = (anchorId, details) => {
      embedController.onNavigationByAnchor(anchorId, details || {});
    };

    embedController.initializeFromHash();
    const stateAfterStartup = embedController.getState();
    handleInitialHash(stateAfterStartup.startupConfigDetected);
    embedController.onSearchStateChanged(sidebarApi.getSearchQuery(), sidebarApi.getVisibleResultCount());

    window.addEventListener('message', (event) => {
      embedController.handleIncomingEmbedMessage(event);
    });

    window.addEventListener('hashchange', () => {
      const currentState = embedController.getState();
      handleInitialHash(currentState.startupConfigDetected);
    });

    embedController.onRendered();

    if (window.microlight && typeof window.microlight.reset === 'function') {
      window.microlight.reset();
    }
  });
})();
