/* EchoPing v1 - app.js
   Security-first, hash-only single-page app. No modules/bundlers. */

(() => {
  'use strict';

  /*** Constants & Defaults ***/
  const DEFAULTS = Object.freeze({
    v: 1,
    n: '',
    t: '',
    i: [],
    y: '',
    s: '',            // ISO timestamp
    c: 'light',       // 'light' | 'dark'
    w: 1024,          // max width px
    f: 24             // base font px
  });

  const HASH_LIMIT = 2000;
  const YT_ID_RE = /^[A-Za-z0-9_-]{11}$/;
  const HTTPS_RE = /https:\/\/[^\s<>"'`]+/g; // conservative matcher

  /*** State ***/
  let currentPost = null;   // last decoded/validated post in View mode
  let draft = cloneDefaults(); // compose draft

  /*** DOM Helpers ***/
  const $ = (sel) => document.querySelector(sel);

  const el = (tag, props = {}, children = []) => {
    const node = document.createElement(tag);
    for (const [k, v] of Object.entries(props)) {
      if (k === 'class') node.className = v;
      else if (k === 'dataset') Object.assign(node.dataset, v);
      else if (k in node) node[k] = v;
      else node.setAttribute(k, v);
    }
    for (const child of children) {
      if (child == null) continue;
      node.append(child instanceof Node ? child : document.createTextNode(String(child)));
    }
    return node;
  };

  const setTheme = (theme) => {
    const t = theme === 'dark' ? 'dark' : 'light';
    document.body.setAttribute('data-theme', t);
  };

  const setLayoutVars = (w, f) => {
    document.documentElement.style.setProperty('--content-max-width', `${clampInt(w || DEFAULTS.w, 320, 4096)}px`);
    document.documentElement.style.setProperty('--base-font-px', `${clampInt(f || DEFAULTS.f, 12, 48)}`);
  };

  const clampInt = (num, min, max) => {
    num = Number(num);
    if (!Number.isFinite(num)) return min;
    return Math.max(min, Math.min(max, Math.round(num)));
  };

  /*** Error/Toast ***/
  const errBox = $('#err');
  const toastBox = $('#toast');

  const clearErrors = () => {
    errBox.innerHTML = '';
  };

  const addError = (msg) => {
    const item = el('div', { class: 'item', role: 'note' }, [msg]);
    errBox.append(item);
  };

  const addWarn = (msg) => {
    const item = el('div', { class: 'item warn', role: 'note' }, [msg]);
    errBox.append(item);
  };

  const showToast = (msg, timeout = 1800) => {
    toastBox.textContent = msg;
    toastBox.hidden = false;
    window.clearTimeout(showToast._t);
    showToast._t = window.setTimeout(() => { toastBox.hidden = true; }, timeout);
  };

  /*** Base64URL (UTF-8 safe) ***/
  const base64UrlEncodeObj = (obj) => {
    const json = JSON.stringify(obj);
    const bytes = new TextEncoder().encode(json);
    let bin = '';
    for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
    let b64 = btoa(bin);
    // URL safe
    b64 = b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
    return b64;
  };

  const base64UrlDecodeToObj = (b64url) => {
    try {
      const b64 = b64url.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(b64url.length / 4) * 4, '=');
      const bin = atob(b64);
      const bytes = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
      const json = new TextDecoder().decode(bytes);
      return [JSON.parse(json), null];
    } catch (e) {
      return [null, e];
    }
  };

  /*** Hash Parsing ***/
  const parseHash = () => {
    const h = window.location.hash || '';
    if (h.startsWith('#p=')) return { mode: 'view', payload: h.slice(3) };
    if (h.startsWith('#e=')) return { mode: 'edit', payload: h.slice(3) };
    if (h === '#new' || h === '' || h === '#') return { mode: 'new' };
    // anything else: treat as invalid -> compose with error
    return { mode: 'invalid' };
  };

  const encodePostToHash = (post, mode = 'p') => {
    const enc = base64UrlEncodeObj(post);
    return `#${mode}=${enc}`;
  };

  /*** Validation / Normalization ***/
  const validateAndNormalize = (raw) => {
    const errors = [];
    const post = {
      v: 1,
      n: '',
      t: '',
      i: [],
      y: '',
      s: '',
      c: 'light',
      w: DEFAULTS.w,
      f: DEFAULTS.f
    };

    if (typeof raw !== 'object' || raw == null) {
      errors.push('Invalid post data');
      return [post, errors];
    }

    // Version
    post.v = Number.isInteger(raw.v) ? raw.v : 1;

    // Name
    if (typeof raw.n === 'string') post.n = raw.n;

    // Text (required)
    if (typeof raw.t === 'string') {
      post.t = raw.t;
    } else {
      errors.push('Text content is required');
    }

    // Images
    if (Array.isArray(raw.i)) {
      post.i = raw.i.filter(u => typeof u === 'string');
    }

    // YouTube
    if (typeof raw.y === 'string') {
      post.y = raw.y;
    }

    // Timestamp
    if (typeof raw.s === 'string') post.s = raw.s;

    // Theme
    if (raw.c === 'dark' || raw.c === 'light') {
      post.c = raw.c;
    }

    // Width & Font
    const w = Number(raw.w);
    const f = Number(raw.f);
    post.w = Number.isFinite(w) ? clampInt(w, 320, 4096) : DEFAULTS.w;
    post.f = Number.isFinite(f) ? clampInt(f, 12, 48) : DEFAULTS.f;

    return [post, errors];
  };

  /*** Linkify https-only ***/
  const linkifyHttps = (text, container) => {
    container.textContent = ''; // clear
    let lastIndex = 0;
    let match;
    HTTPS_RE.lastIndex = 0;
    while ((match = HTTPS_RE.exec(text)) !== null) {
      const start = match.index;
      const urlRaw = match[0];

      // Append text before match
      if (start > lastIndex) {
        container.append(document.createTextNode(text.slice(lastIndex, start)));
      }

      // Strip trailing punctuation commonly adjacent to URLs
      let url = urlRaw;
      const trailing = /[),.;:!?]+$/.exec(url);
      if (trailing) {
        url = url.slice(0, trailing.index);
        // Put the trailing punctuation back as text after the link later
        HTTPS_RE.lastIndex -= trailing[0].length;
      }

      // Create anchor
      const a = el('a', {
        href: url,
        rel: 'noopener noreferrer',
        target: '_blank'
      }, [url]);
      container.append(a);

      lastIndex = match.index + match[0].length;
    }
    // Remaining text
    if (lastIndex < text.length) {
      container.append(document.createTextNode(text.slice(lastIndex)));
    }
  };

  /*** YouTube helpers ***/
  const extractYouTubeId = (url) => {
    if (typeof url !== 'string' || url.trim() === '') return '';
    try {
      const u = new URL(url);
      const host = u.hostname.replace(/^www\./, '');
      if (host === 'youtu.be') {
        return u.pathname.slice(1);
      }
      if (host === 'youtube.com' || host === 'm.youtube.com') {
        if (u.pathname === '/watch') {
          return u.searchParams.get('v') || '';
        }
        // Short path like /embed/ID or /shorts/ID
        const parts = u.pathname.split('/').filter(Boolean);
        if (parts[0] === 'embed' || parts[0] === 'shorts') {
          return parts[1] || '';
        }
      }
      return '';
    } catch {
      return '';
    }
  };

  const buildYouTubeEmbed = (id) => {
    if (!YT_ID_RE.test(id)) return null;
    const src = `https://www.youtube-nocookie.com/embed/${id}`;
    return el('iframe', {
      src,
      allow: 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share',
      allowFullscreen: true,
      referrerpolicy: 'no-referrer'
    });
  };

  /*** Relative time ***/
  const formatRelativeTime = (iso) => {
    if (!iso) return '';
    const then = new Date(iso);
    if (isNaN(then.getTime())) return '';
    const now = new Date();
    const diffMs = now.getTime() - then.getTime();
    const abs = Math.abs(diffMs);
    const minutes = Math.round(abs / 60000);
    const hours = Math.round(abs / 3600000);
    const days = Math.round(abs / 86400000);

    let str;
    if (abs < 45000) str = 'just now';
    else if (minutes < 60) str = `${minutes}m ago`;
    else if (hours < 24) str = `${hours}h ago`;
    else str = `${days}d ago`;

    return str;
  };

  /*** Rendering ***/
  const renderView = (post, target = 'view') => {
    // Theme + layout vars
    setTheme(post.c);
    setLayoutVars(post.w, post.f);

    const nameEl = target === 'view' ? $('#vh-name') : $('#pv-name');
    const timeEl = target === 'view' ? $('#vh-time') : $('#pv-time');
    const textEl = target === 'view' ? $('#vh-text') : $('#pv-text');
    const mediaEl = target === 'view' ? $('#vh-media') : $('#pv-media');

    // Header
    nameEl.textContent = post.n || '';
    if (post.s) {
      const rel = formatRelativeTime(post.s);
      timeEl.textContent = rel || '';
      timeEl.setAttribute('datetime', post.s);
      timeEl.setAttribute('title', post.s);
      timeEl.hidden = !rel;
    } else {
      timeEl.textContent = '';
      timeEl.removeAttribute('datetime');
      timeEl.removeAttribute('title');
      timeEl.hidden = true;
    }

    // Text
    linkifyHttps(post.t || '', textEl);

    // Media
    mediaEl.textContent = '';
    let blocked = 0;

    // Images (https only)
    const httpsImgs = (post.i || []).filter(u => {
      try {
        const uu = new URL(u);
        if (uu.protocol !== 'https:') { blocked++; return false; }
        return true;
      } catch {
        blocked++;
        return false;
      }
    });

    if (httpsImgs.length === 1) {
      mediaEl.append(makeImg(httpsImgs[0]));
    } else if (httpsImgs.length > 1) {
      const grid = el('div', { class: 'grid' });
      for (const u of httpsImgs) grid.append(makeImg(u));
      mediaEl.append(grid);
    }

    // YouTube
    if (post.y && YT_ID_RE.test(post.y)) {
      const iframe = buildYouTubeEmbed(post.y);
      if (iframe) mediaEl.append(iframe);
    }

    // Blocked count warning (render-time error area)
    if (blocked > 0) {
      addWarn(`${blocked} image${blocked > 1 ? 's' : ''} blocked for insecure URL`);
    }
  };

  const makeImg = (url) => {
    return el('img', {
      class: 'image',
      src: url,
      loading: 'lazy',
      decoding: 'async',
      referrerPolicy: 'no-referrer',
      alt: ''
    });
  };

  /*** Compose Form Logic ***/
  const form = $('#composeForm');
  const fields = {
    n: $('#n'),
    t: $('#t'),
    imgUrl: $('#imgUrl'),
    imgList: $('#imgList'),
    ytUrl: $('#ytUrl'),
    ytIdPreview: $('#ytIdPreview'),
    tsMode: () => form.querySelector('input[name="tsMode"]:checked')?.value,
    tsCustom: $('#tsCustom'),
    themeLight: () => form.querySelector('input[name="theme"][value="light"]'),
    themeDark: () => form.querySelector('input[name="theme"][value="dark"]'),
    w: $('#w'),
    f: $('#f'),
  };

  const refreshPreview = () => {
    const [norm] = validateAndNormalize(draft);
    renderView(norm, 'preview');
  };

  const syncFormFromDraft = () => {
    fields.n.value = draft.n;
    fields.t.value = draft.t;
    fields.w.value = draft.w;
    fields.f.value = draft.f;
    if (draft.c === 'dark') fields.themeDark().checked = true; else fields.themeLight().checked = true;
    // Timestamp radio
    if (draft.s) {
      fields.tsCustom.disabled = false;
      fields.tsCustom.value = draft.s;
      form.querySelector('input[name="tsMode"][value="custom"]').checked = true;
    } else {
      fields.tsCustom.disabled = true;
      fields.tsCustom.value = '';
      form.querySelector('input[name="tsMode"][value="now"]').checked = true;
    }
    // YouTube
    fields.ytUrl.value = draft.y ? `https://youtu.be/${draft.y}` : '';
    fields.ytIdPreview.textContent = draft.y || '—';

    // Images list
    renderImgList();
    // Apply theme/vars for preview
    setTheme(draft.c);
    setLayoutVars(draft.w, draft.f);
    refreshPreview();
  };

  const renderImgList = () => {
    fields.imgList.textContent = '';
    (draft.i || []).forEach((u, idx) => {
      const li = el('li', {}, [
        el('span', { class: 'url mono' }, [u]),
        el('div', { class: 'row' }, [
          el('button', { class: 'btn', type: 'button', ariaLabel: 'Move up' }, ['↑']),
          el('button', { class: 'btn', type: 'button', ariaLabel: 'Move down' }, ['↓']),
          el('button', { class: 'btn danger', type: 'button', ariaLabel: 'Remove image' }, ['Remove'])
        ])
      ]);
      const [btnUp, btnDown, btnDel] = li.querySelectorAll('button');
      btnUp.addEventListener('click', () => {
        if (idx > 0) {
          const temp = draft.i[idx - 1];
          draft.i[idx - 1] = draft.i[idx];
          draft.i[idx] = temp;
          renderImgList();
          refreshPreview();
        }
      });
      btnDown.addEventListener('click', () => {
        if (idx < draft.i.length - 1) {
          const temp = draft.i[idx + 1];
          draft.i[idx + 1] = draft.i[idx];
          draft.i[idx] = temp;
          renderImgList();
          refreshPreview();
        }
      });
      btnDel.addEventListener('click', () => {
        draft.i.splice(idx, 1);
        renderImgList();
        refreshPreview();
      });
      fields.imgList.append(li);
    });
  };

  /*** Router ***/
  const route = () => {
    clearErrors();
    const { mode, payload } = parseHash();

    // Long fragment warning
    if (window.location.hash.length > HASH_LIMIT) {
      addWarn('URL is long; remove media to shorten');
    }

    if (mode === 'view') {
      const [obj, decodeErr] = base64UrlDecodeToObj(payload);
      if (decodeErr) {
        addError('Invalid post data');
        showComposeNew();
        return;
      }
      const [post, valErrors] = validateAndNormalize(obj);
      if (valErrors.length > 0 && !post.t) {
        addError('Invalid post data');
        showComposeNew();
        return;
      }
      currentPost = post;
      showView(post);
      return;
    }

    if (mode === 'edit') {
      const [obj, decodeErr] = base64UrlDecodeToObj(payload);
      if (decodeErr) {
        addError('Invalid post data');
        showComposeNew();
        return;
      }
      const [post] = validateAndNormalize(obj);
      draft = { ...post }; // prefill
      showCompose(true);
      return;
    }

    if (mode === 'new' || mode === 'invalid') {
      if (mode === 'invalid') addError('Invalid post data');
      showComposeNew();
      return;
    }
  };

  const showView = (post) => {
    $('#view').hidden = false;
    $('#compose').hidden = true;
    renderView(post, 'view');
  };

  const showCompose = (prefilled = false) => {
    $('#view').hidden = true;
    $('#compose').hidden = false;
    if (!prefilled) draft = cloneDefaults();
    syncFormFromDraft();
  };

  const showComposeNew = () => {
    draft = cloneDefaults();
    showCompose(false);
  };

  const cloneDefaults = () => ({ ...DEFAULTS, i: [] });

  /*** Actions (shared) ***/
  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      showToast('Copied');
    } catch {
      // As a non-blocking fallback, select and copy via textarea
      const ta = el('textarea', { style: 'position:fixed;left:-1000px;top:-1000px;' }, [window.location.href]);
      document.body.append(ta);
      ta.select();
      try { document.execCommand('copy'); showToast('Copied'); }
      catch { addError('Could not copy link'); }
      ta.remove();
    }
  };

  const toggleThemePersist = () => {
    // Prefer toggling the active model (currentPost in view or draft in compose)
    if (!$('#view').hidden && currentPost) {
      currentPost.c = currentPost.c === 'dark' ? 'light' : 'dark';
      // Persist into hash so copied link keeps theme
      window.location.hash = encodePostToHash(currentPost, 'p');
      return;
    }
    // Compose mode
    draft.c = draft.c === 'dark' ? 'light' : 'dark';
    setTheme(draft.c);
    refreshPreview();
    // Update radio buttons
    if (draft.c === 'dark') fields.themeDark().checked = true; else fields.themeLight().checked = true;
  };

  /*** Wire up global buttons in header ***/
  $('#copyLinkTop').addEventListener('click', copyLink);
  $('#themeToggleTop').addEventListener('click', toggleThemePersist);

  /*** View mode buttons ***/
  $('#copyLinkView').addEventListener('click', copyLink);
  $('#editBtn').addEventListener('click', () => {
    if (!currentPost) return;
    const h = encodePostToHash(currentPost, 'e');
    window.location.hash = h;
  });
  $('#themeToggleView').addEventListener('click', toggleThemePersist);

  /*** Compose form events ***/
  fields.n.addEventListener('input', () => { draft.n = fields.n.value; refreshPreview(); });
  fields.t.addEventListener('input', () => { draft.t = fields.t.value; refreshPreview(); });
  fields.w.addEventListener('input', () => {
    draft.w = clampInt(fields.w.value, 320, 4096);
    setLayoutVars(draft.w, draft.f);
    refreshPreview();
  });
  fields.f.addEventListener('input', () => {
    draft.f = clampInt(fields.f.value, 12, 48);
    setLayoutVars(draft.w, draft.f);
    refreshPreview();
  });

  // Theme radio
  form.querySelectorAll('input[name="theme"]').forEach(r =>
    r.addEventListener('change', () => {
      draft.c = form.querySelector('input[name="theme"]:checked').value;
      setTheme(draft.c);
      refreshPreview();
    })
  );

  // Timestamp handling
  form.querySelectorAll('input[name="tsMode"]').forEach(r =>
    r.addEventListener('change', () => {
      const mode = fields.tsMode();
      if (mode === 'custom') {
        fields.tsCustom.disabled = false;
        // Don't alter draft.s here; wait for user input
      } else {
        fields.tsCustom.disabled = true;
        draft.s = new Date().toISOString();
        refreshPreview();
      }
    })
  );

  fields.tsCustom.addEventListener('input', () => {
    const val = fields.tsCustom.value.trim();
    if (val === '') { draft.s = ''; refreshPreview(); return; }
    const d = new Date(val);
    if (isNaN(d.getTime())) {
      addWarn('Custom timestamp is not a valid ISO date');
      return;
    }
    clearErrors();
    draft.s = d.toISOString();
    refreshPreview();
  });

  // Image Add
  $('#addImgBtn').addEventListener('click', () => {
    const u = fields.imgUrl.value.trim();
    if (!u) return;
    try {
      const url = new URL(u);
      if (url.protocol !== 'https:') {
        addError('Only https image URLs are allowed');
        return;
      }
      draft.i.push(url.toString());
      fields.imgUrl.value = '';
      renderImgList();
      refreshPreview();
      clearErrors();
    } catch {
      addError('Invalid image URL');
    }
  });

  // YouTube parsing
  fields.ytUrl.addEventListener('input', () => {
    const id = extractYouTubeId(fields.ytUrl.value.trim());
    draft.y = YT_ID_RE.test(id) ? id : '';
    fields.ytIdPreview.textContent = draft.y || '—';
    refreshPreview();
  });

  // Buttons: Generate / Load / Clear
  $('#generateBtn').addEventListener('click', () => {
    // Build final post JSON
    const post = {
      v: 1,
      n: (draft.n || '').trim(),
      t: (draft.t || ''),
      i: Array.isArray(draft.i) ? draft.i.slice() : [],
      y: draft.y || '',
      s: draft.s || new Date().toISOString(), // stamp on generate if absent
      c: draft.c === 'dark' ? 'dark' : 'light',
      w: clampInt(draft.w, 320, 4096),
      f: clampInt(draft.f, 12, 48)
    };
    const hash = encodePostToHash(post, 'p');
    window.location.hash = hash;
    showToast('Copy Link');
    if (hash.length > HASH_LIMIT) addWarn('URL is long; remove media to shorten');
  });

  $('#loadBtn').addEventListener('click', () => {
    clearErrors();
    const h = window.location.hash;
    if (!h.startsWith('#e=')) {
      addError('No edit payload in URL');
      return;
    }
    const payload = h.slice(3);
    const [obj, err] = base64UrlDecodeToObj(payload);
    if (err) {
      addError('Invalid post data');
      return;
    }
    const [post] = validateAndNormalize(obj);
    draft = { ...post };
    syncFormFromDraft();
  });

  $('#clearBtn').addEventListener('click', () => {
    clearErrors();
    draft = cloneDefaults();
    syncFormFromDraft();
  });

  /*** Hashchange & Load ***/
  window.addEventListener('hashchange', route);
  window.addEventListener('load', () => {
    // Initial theme/layout from defaults before rendering anything
    setTheme(DEFAULTS.c);
    setLayoutVars(DEFAULTS.w, DEFAULTS.f);
    route();
  });

})();

