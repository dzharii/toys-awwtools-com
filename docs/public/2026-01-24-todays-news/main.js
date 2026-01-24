/* NewspaperKit - DOM-based Newspaper Builder
 * - No innerHTML
 * - Fluent API with validation + logging
 * - Errors rendered at top of newspaper
 * - Vanilla JS, no dependencies
 */
(() => {
  'use strict';

  /** @typedef {'debug'|'info'|'warn'|'error'} LogLevel */

  /** Safe-ish URL allowlist for media. */
  const ALLOWED_URL_PROTOCOLS = new Set(['https:', 'http:']); // allow http for local demos; CSP may block mixed content anyway.

  const isNonEmptyString = (v) => typeof v === 'string' && v.trim().length > 0;

  function safeString(v) {
    if (v === null || v === undefined) return '';
    return String(v);
  }

  function nowIso() {
    try { return new Date().toISOString(); }
    catch { return 'unknown-time'; }
  }

  /** Minimal structured logger: buffers messages + optionally mirrors to console. */
  class Logger {
    constructor({ enabled = true, consoleMirror = true } = {}) {
      this.enabled = Boolean(enabled);
      this.consoleMirror = Boolean(consoleMirror);
      /** @type {{time:string, level:LogLevel, msg:string, data?:unknown}[]} */
      this.entries = [];
    }

    /** @param {LogLevel} level */
    log(level, msg, data) {
      if (!this.enabled) return;
      /** @type {LogLevel} */
      const lvl = (level === 'debug' || level === 'info' || level === 'warn' || level === 'error') ? level : 'info';
      const entry = { time: nowIso(), level: lvl, msg: safeString(msg) };
      if (data !== undefined) entry.data = data;
      this.entries.push(entry);

      if (this.consoleMirror && typeof console !== 'undefined') {
        const tag = `[NewspaperKit ${lvl.toUpperCase()}]`;
        if (lvl === 'error' && console.error) console.error(tag, msg, data ?? '');
        else if (lvl === 'warn' && console.warn) console.warn(tag, msg, data ?? '');
        else if (lvl === 'debug' && console.debug) console.debug(tag, msg, data ?? '');
        else if (console.log) console.log(tag, msg, data ?? '');
      }
    }

    debug(msg, data) { this.log('debug', msg, data); }
    info(msg, data) { this.log('info', msg, data); }
    warn(msg, data) { this.log('warn', msg, data); }
    error(msg, data) { this.log('error', msg, data); }

    toPrettyText() {
      return this.entries.map(e => {
        const base = `${e.time} ${e.level.toUpperCase()} ${e.msg}`;
        if (e.data === undefined) return base;
        try {
          const json = JSON.stringify(e.data, null, 2);
          return `${base}\n${json}`;
        } catch {
          return `${base}\n[data unserializable]`;
        }
      }).join('\n\n');
    }
  }

  /** DOM creation helper (no innerHTML). */
  function el(tag, opts = {}) {
    const node = document.createElement(tag);
    const {
      className,
      classes,
      text,
      attrs,
      dataset,
      children,
      role,
      aria,
    } = opts;

    if (isNonEmptyString(className)) node.className = className.trim();
    if (Array.isArray(classes)) {
      for (const c of classes) if (isNonEmptyString(c)) node.classList.add(c.trim());
    }
    if (text !== undefined) node.textContent = safeString(text);

    if (role) node.setAttribute('role', safeString(role));

    if (aria && typeof aria === 'object') {
      for (const [k, v] of Object.entries(aria)) {
        if (!isNonEmptyString(k)) continue;
        node.setAttribute(`aria-${k}`, safeString(v));
      }
    }

    if (dataset && typeof dataset === 'object') {
      for (const [k, v] of Object.entries(dataset)) {
        if (!isNonEmptyString(k)) continue;
        node.dataset[k] = safeString(v);
      }
    }

    if (attrs && typeof attrs === 'object') {
      for (const [k, v] of Object.entries(attrs)) {
        if (!isNonEmptyString(k)) continue;
        // avoid setting dangerous event handler attributes
        if (/^on/i.test(k)) continue;
        node.setAttribute(k, safeString(v));
      }
    }

    if (Array.isArray(children)) {
      for (const child of children) {
        if (!child) continue;
        if (typeof child === 'string') node.appendChild(document.createTextNode(child));
        else node.appendChild(child);
      }
    }

    return node;
  }

  function resolveMount(mount) {
    if (mount instanceof Element) return mount;
    if (typeof mount === 'string') {
      const found = document.querySelector(mount);
      return found instanceof Element ? found : null;
    }
    return null;
  }

  /** Validate and normalize URL for <img src>. */
  function validateImageUrl(url) {
    if (!isNonEmptyString(url)) return { ok: false, reason: 'Image src is empty.' };
    let parsed;
    try {
      parsed = new URL(url, window.location.href);
    } catch {
      return { ok: false, reason: `Invalid URL: "${url}".` };
    }
    if (!ALLOWED_URL_PROTOCOLS.has(parsed.protocol)) {
      return { ok: false, reason: `Unsupported URL protocol "${parsed.protocol}". Use https/http.` };
    }
    return { ok: true, url: parsed.toString() };
  }

  /** Collects user-facing validation errors. */
  class ValidationErrorBag {
    constructor() {
      /** @type {string[]} */
      this.errors = [];
    }
    add(msg) {
      if (isNonEmptyString(msg)) this.errors.push(msg.trim());
    }
    get ok() { return this.errors.length === 0; }
  }

  /** Column builder (fluent). */
  class ColumnBuilder {
    constructor(logger) {
      this.logger = logger;
      /** @type {{type:'headline', level:number, text:string} | null} */
      this.headlinePrimary = null;
      /** @type {{type:'headline', level:number, text:string} | null} */
      this.headlineSecondary = null;
      /** @type {{type:'headline', level:number, text:string} | null} */
      this.byline = null;
      /** @type {{type:'paragraph', text:string}[]} */
      this.paragraphList = [];
      /** @type {{type:'citation', text:string}[]} */
      this.citations = [];
      /** @type {{type:'figure', src:string, alt:string, caption:string}[]} */
      this.figures = [];
    }

    /**
     * headline({ level: 1..6, text })
     * Uses existing CSS classes mapping:
     * hl1..hl6, hl3+hl4 is common combo, etc.
     */
    headline({ level, text } = {}) {
      const lvl = Number(level);
      const t = safeString(text).trim();
      if (!Number.isFinite(lvl) || lvl < 1 || lvl > 10) {
        this.logger.warn('headline() called with invalid level; expected 1..10', { level });
        return this;
      }
      if (!isNonEmptyString(t)) {
        this.logger.warn('headline() called with empty text', { level });
        return this;
      }

      // Store first as primary, second as secondary, extras become paragraphs (to avoid silent loss)
      const entry = { type: 'headline', level: lvl, text: t };
      if (!this.headlinePrimary) this.headlinePrimary = entry;
      else if (!this.headlineSecondary) this.headlineSecondary = entry;
      else {
        this.logger.warn('More than two headlines provided; converting additional headline to paragraph.', entry);
        this.paragraphList.push({ type: 'paragraph', text: t });
      }
      return this;
    }

    /**
     * Adds a byline as hl4 (consistent with sample).
     * Usage: .byline("by SOMEONE")
     */
    byline(text) {
      const t = safeString(text).trim();
      if (!isNonEmptyString(t)) {
        this.logger.warn('byline() called with empty text');
        return this;
      }
      this.byline = { type: 'headline', level: 4, text: t };
      return this;
    }

    p(text) {
      const t = safeString(text).trim();
      if (!isNonEmptyString(t)) {
        this.logger.warn('p() called with empty text');
        return this;
      }
      this.paragraphList.push({ type: 'paragraph', text: t });
      return this;
    }

    paragraphs(list) {
      if (!Array.isArray(list)) {
        this.logger.warn('paragraphs() expects an array of strings', { listType: typeof list });
        return this;
      }
      for (const item of list) this.p(item);
      return this;
    }

    citation(text) {
      const t = safeString(text).trim();
      if (!isNonEmptyString(t)) {
        this.logger.warn('citation() called with empty text');
        return this;
      }
      this.citations.push({ type: 'citation', text: t });
      return this;
    }

    /**
     * figure({src, alt, caption})
     * alt is required for accessibility; if empty, builder will still render but validation will flag it.
     */
    figure({ src, alt, caption } = {}) {
      const s = safeString(src).trim();
      const a = safeString(alt).trim();
      const c = safeString(caption).trim();
      this.figures.push({ type: 'figure', src: s, alt: a, caption: c });
      return this;
    }

    /** Internal: validate column content. */
    validate(bag, colIndex) {
      const prefix = `Column ${colIndex + 1}:`;
      if (!this.headlinePrimary) {
        bag.add(`${prefix} missing a primary headline. Call .headline({level, text}).`);
      }

      for (let i = 0; i < this.figures.length; i++) {
        const f = this.figures[i];
        const urlRes = validateImageUrl(f.src);
        if (!urlRes.ok) bag.add(`${prefix} Figure ${i + 1} src invalid. ${urlRes.reason}`);
        if (!isNonEmptyString(f.alt)) bag.add(`${prefix} Figure ${i + 1} alt text is required for accessibility.`);
      }

      const hasText = (this.paragraphList.length + this.citations.length) > 0;
      const hasMedia = this.figures.length > 0;
      if (!hasText && !hasMedia) {
        bag.add(`${prefix} has no body content. Add .p(), .paragraphs(), .citation(), or .figure().`);
      }
    }

    /** Internal: render DOM for the column. */
    render() {
      const column = el('div', { className: 'collumn' });

      const headWrap = el('div', { className: 'head' });
      if (this.headlinePrimary) {
        headWrap.appendChild(el('span', {
          className: `headline hl${this.headlinePrimary.level}`,
          text: this.headlinePrimary.text
        }));
      }
      if (this.byline) {
        // In sample, byline is wrapped in <p><span ...></span></p>
        const pNode = el('p');
        pNode.appendChild(el('span', { className: `headline hl${this.byline.level}`, text: this.byline.text }));
        headWrap.appendChild(pNode);
      }
      if (this.headlineSecondary) {
        headWrap.appendChild(el('span', {
          className: `headline hl${this.headlineSecondary.level}`,
          text: this.headlineSecondary.text
        }));
      }

      // Only append headWrap if it has children
      if (headWrap.childNodes.length) column.appendChild(headWrap);

      // paragraphs
      for (const para of this.paragraphList) {
        column.appendChild(el('p', { text: para.text }));
      }

      // figures interleaved? For simplicity, append figures after paragraphs unless user wants ordering.
      // If you want ordering, add an advanced "block()" API later. Keeping v1 simple & predictable.
      for (const fig of this.figures) {
        const figEl = el('figure', { className: 'figure' });
        const urlRes = validateImageUrl(fig.src);
        const src = urlRes.ok ? urlRes.url : ''; // render empty if invalid; errors show in banner.
        const img = el('img', {
          className: 'media',
          attrs: { src, alt: safeString(fig.alt) }
        });
        const cap = el('figcaption', { className: 'figcaption', text: fig.caption });
        figEl.appendChild(img);
        figEl.appendChild(cap);
        column.appendChild(figEl);
      }

      for (const cit of this.citations) {
        column.appendChild(el('span', { className: 'citation', text: cit.text }));
      }

      return column;
    }
  }

  /** Newspaper builder (fluent). */
  class NewspaperBuilder {
    constructor({ mount, debug = false } = {}) {
      this.mount = mount;
      this.debug = Boolean(debug);
      this.logger = new Logger({ enabled: true, consoleMirror: true });

      // Masthead defaults
      this.titleText = '';
      this.subheadText = '';
      this.weatherTitle = '';
      this.weatherDetails = '';

      /** @type {ColumnBuilder[]} */
      this.columns = [];
    }

    masthead({ title, subhead } = {}) {
      if (title !== undefined) this.titleText = safeString(title).trim();
      if (subhead !== undefined) this.subheadText = safeString(subhead).trim();
      return this;
    }

    weather({ title, details } = {}) {
      if (title !== undefined) this.weatherTitle = safeString(title).trim();
      if (details !== undefined) this.weatherDetails = safeString(details).trim();
      return this;
    }

    addColumn(cb) {
      const col = new ColumnBuilder(this.logger);
      try {
        if (typeof cb === 'function') cb(col);
        else this.logger.warn('addColumn(cb) called without a function callback.');
      } catch (err) {
        this.logger.error('Error while building a column via callback.', { error: String(err) });
      }
      this.columns.push(col);
      return this;
    }

    /** Clears mount point content safely. */
    clearMount(mountEl) {
      // Remove all children
      while (mountEl.firstChild) mountEl.removeChild(mountEl.firstChild);
    }

    validateAll() {
      const bag = new ValidationErrorBag();

      if (!isNonEmptyString(this.titleText)) {
        bag.add('Masthead title is required. Use .masthead({ title: "..." }).');
      }
      if (!isNonEmptyString(this.subheadText)) {
        bag.add('Subhead is required. Use .masthead({ subhead: "..." }).');
      }
      if (!Array.isArray(this.columns) || this.columns.length === 0) {
        bag.add('At least one column is required. Use .addColumn(cb).');
      }
      if (this.columns.length > 8) {
        bag.add(`Too many columns (${this.columns.length}). Consider 1–8 for readability.`);
      }

      for (let i = 0; i < this.columns.length; i++) {
        this.columns[i].validate(bag, i);
      }

      return bag;
    }

    renderErrorBanner(errors) {
      const banner = el('section', { className: 'error-banner', role: 'alert', aria: { live: 'polite' } });
      banner.appendChild(el('h2', { className: 'error-title', text: 'Newspaper Builder Errors' }));
      banner.appendChild(el('div', { text: 'Fix the issues below. The page still rendered what it could.' }));

      const ul = el('ul');
      for (const e of errors) ul.appendChild(el('li', { text: e }));
      banner.appendChild(ul);

      const details = el('details');
      const summary = el('summary', { text: 'Show debug log' });
      const pre = el('pre', { text: this.logger.toPrettyText() || 'No logs.' });
      details.appendChild(summary);
      details.appendChild(pre);
      banner.appendChild(details);

      return banner;
    }

    renderNewspaper() {
      const root = el('div', { className: 'newspaper-root' });

      // Head section
      const head = el('div', { className: 'head' });
      const headerWrap = el('div', { className: 'headerobjectswrapper' });

      // Weather box (optional)
      if (isNonEmptyString(this.weatherTitle) || isNonEmptyString(this.weatherDetails)) {
        const wf = el('div', { className: 'weatherforcastbox' });
        if (isNonEmptyString(this.weatherTitle)) {
          wf.appendChild(el('span', { className: 'wf-title', text: this.weatherTitle }));
        }
        if (isNonEmptyString(this.weatherDetails)) {
          wf.appendChild(el('span', { text: this.weatherDetails }));
        }
        headerWrap.appendChild(wf);
      }

      // Main header (title)
      headerWrap.appendChild(el('header', { text: this.titleText }));

      head.appendChild(headerWrap);

      // Subhead
      head.appendChild(el('div', { className: 'subhead', text: this.subheadText }));
      root.appendChild(head);

      // Content + columns
      const content = el('div', { className: 'content' });
      const columnsWrap = el('div', { className: 'collumns' });

      for (const col of this.columns) columnsWrap.appendChild(col.render());

      content.appendChild(columnsWrap);
      root.appendChild(content);

      return root;
    }

    render() {
      const mountEl = resolveMount(this.mount);
      if (!mountEl) {
        this.logger.error('Mount element not found. Provide mount: "#app" or an Element.');
        // As last resort, do nothing visible; cannot mount banner.
        return;
      }

      this.clearMount(mountEl);

      const validation = this.validateAll();
      const hasErrors = !validation.ok;

      // Render errors (if any) above newspaper
      if (hasErrors) {
        this.logger.warn('Validation failed; rendering error banner.', { errorCount: validation.errors.length });
        mountEl.appendChild(this.renderErrorBanner(validation.errors));
      } else {
        this.logger.info('Validation passed.');
      }

      // Always attempt to render newspaper (best-effort)
      try {
        const paper = this.renderNewspaper();
        mountEl.appendChild(paper);
        this.logger.info('Newspaper rendered successfully.');
      } catch (err) {
        this.logger.error('Fatal error while rendering the newspaper.', { error: String(err) });
        // If rendering fails, show a final banner
        const fatal = this.renderErrorBanner([
          'Fatal error while rendering the newspaper. See debug log below.'
        ]);
        mountEl.appendChild(fatal);
      }

      return this;
    }
  }

  // Public API
  const NewspaperKit = Object.freeze({
    /**
     * Create a builder.
     * @param {{mount: string|Element, debug?: boolean}} options
     */
    create(options) {
      const builder = new NewspaperBuilder(options || {});
      builder.logger.info('NewspaperKit builder created.', { debug: Boolean(options && options.debug) });
      return builder;
    }
  });

  // Expose globally (no modules needed)
  Object.defineProperty(window, 'NewspaperKit', {
    value: NewspaperKit,
    writable: false,
    configurable: false,
    enumerable: true
  });
})();


