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



  // Hoisted function declaration fixes TDZ when used before definition.

  function cloneDefaults() {

    return { ...DEFAULTS, i: [] };

  }



  const HASH_LIMIT = 2000;

  const YT_ID_RE = /^[A-Za-z0-9_-]{11}$/;

  const HTTPS_RE = /https:\/\/[^\s<>"'`]+/g; // conservative matcher



  /*** State ***/

  let currentPost = null;        // last decoded/validated post in View mode

  let draft = cloneDefaults();   // compose draft



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



  /*** Base64URL (UTF-8 safe) with TextZip compression ***/

  const base64UrlEncodeObj = (obj) => {

    const json = JSON.stringify(obj);

    const bytes = new TextEncoder().encode(json);

    let bin = '';

    for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);

    const b64 = btoa(bin);



    // Compress using TextZip

    const compressed = TextZip.compress(b64);



    // Make URL-safe: replace + with -, / with _, trim =

    const urlSafe = compressed.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');

    return urlSafe;

  };



  const base64UrlDecodeToObj = (b64url) => {

    try {

      // Restore from URL-safe format

      const restored = b64url.replace(/-/g, '+').replace(/_/g, '/');



      // Decompress using TextZip

      const b64 = TextZip.decompress(restored);



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



    post.v = Number.isInteger(raw.v) ? raw.v : 1;

    if (typeof raw.n === 'string') post.n = raw.n;

    if (typeof raw.t === 'string') {

      post.t = raw.t;

    } else {

      errors.push('Text content is required');

    }

    if (Array.isArray(raw.i)) {

      post.i = raw.i.filter(u => typeof u === 'string');

    }

    if (typeof raw.y === 'string') post.y = raw.y;

    if (typeof raw.s === 'string') post.s = raw.s;

    if (raw.c === 'dark' || raw.c === 'light') post.c = raw.c;



    const w = Number(raw.w);

    const f = Number(raw.f);

    post.w = Number.isFinite(w) ? clampInt(w, 320, 4096) : DEFAULTS.w;

    post.f = Number.isFinite(f) ? clampInt(f, 12, 48) : DEFAULTS.f;



    return [post, errors];

  };



  /*** Linkify https-only with punctuation handling ***/

  const linkifyHttps = (text, container) => {

    container.textContent = '';

    let last = 0;

    const matches = text.matchAll(HTTPS_RE);

    for (const m of matches) {

      const start = m.index;

      const raw = m[0];



      // Preceding text

      if (start > last) {

        container.append(document.createTextNode(text.slice(last, start)));

      }



      // Trim trailing punctuation only

      const trimmed = raw.replace(/[),.;:!?]+$/g, '');

      const trailing = raw.slice(trimmed.length);



      const a = el('a', {

        href: trimmed,

        rel: 'noopener noreferrer',

        target: '_blank'

      }, [trimmed]);

      container.append(a);



      if (trailing) container.append(document.createTextNode(trailing));



      last = start + raw.length;

    }

    if (last < text.length) {

      container.append(document.createTextNode(text.slice(last)));

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

    const iframe = el('iframe', {

      src,

      allow: 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share',

      allowFullscreen: true,

      'allowfullscreen': '',

      referrerpolicy: 'no-referrer'

    });

    return iframe;

  };



  /*** Relative time (past & future) ***/

  const formatRelativeTime = (iso) => {

    if (!iso) return '';

    const then = new Date(iso);

    if (isNaN(then.getTime())) return '';

    const now = new Date();

    const diffMs = then.getTime() - now.getTime();

    const abs = Math.abs(diffMs);

    const minutes = Math.round(abs / 60000);

    const hours = Math.round(abs / 3600000);

    const days = Math.round(abs / 86400000);



    const inFuture = diffMs > 0;

    let str;

    if (abs < 45000) str = 'just now';

    else if (minutes < 60) str = inFuture ? `in ${minutes}m` : `${minutes}m ago`;

    else if (hours < 24) str = inFuture ? `in ${hours}h` : `${hours}h ago`;

    else str = inFuture ? `in ${days}d` : `${days}d ago`;



    return str;

  };



  /*** Rendering ***/

  const renderView = (post, target = 'view') => {

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



    if (post.y && YT_ID_RE.test(post.y)) {

      const iframe = buildYouTubeEmbed(post.y);

      if (iframe) mediaEl.append(iframe);

    }



    if (blocked > 0 && target === 'view') {

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



    if (draft.s) {

      fields.tsCustom.disabled = false;

      fields.tsCustom.value = draft.s;

      form.querySelector('input[name="tsMode"][value="custom"]').checked = true;

    } else {

      fields.tsCustom.disabled = true;

      fields.tsCustom.value = '';

      form.querySelector('input[name="tsMode"][value="now"]').checked = true;

    }



    fields.ytUrl.value = draft.y ? `https://youtu.be/${draft.y}` : '';

    fields.ytIdPreview.textContent = draft.y || '—';



    renderImgList();

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

          el('button', { class: 'btn', type: 'button', 'aria-label': 'Move up' }, ['↑']),

          el('button', { class: 'btn', type: 'button', 'aria-label': 'Move down' }, ['↓']),

          el('button', { class: 'btn danger', type: 'button', 'aria-label': 'Remove image' }, ['Remove'])

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

      draft = { ...post };

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



  /*** Actions (shared) ***/

  const copyLink = async () => {

    try {

      await navigator.clipboard.writeText(window.location.href);

      showToast('Copied');

    } catch {

      const ta = el('textarea', { style: 'position:fixed;left:-1000px;top:-1000px;' }, [window.location.href]);

      document.body.append(ta);

      ta.select();

      try { document.execCommand('copy'); showToast('Copied'); }

      catch { addError('Could not copy link'); }

      ta.remove();

    }

  };



  const toggleThemePersist = () => {

    if (!$('#view').hidden && currentPost) {

      currentPost.c = currentPost.c === 'dark' ? 'light' : 'dark';

      window.location.hash = encodePostToHash(currentPost, 'p');

      return;

    }

    draft.c = draft.c === 'dark' ? 'light' : 'dark';

    setTheme(draft.c);

    refreshPreview();

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

  const formEl = $('#composeForm'); // already queried as form, keep alias for clarity



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



  formEl.querySelectorAll('input[name="theme"]').forEach(r =>

    r.addEventListener('change', () => {

      draft.c = formEl.querySelector('input[name="theme"]:checked').value;

      setTheme(draft.c);

      refreshPreview();

    })

  );



  formEl.querySelectorAll('input[name="tsMode"]').forEach(r =>

    r.addEventListener('change', () => {

      const mode = fields.tsMode();

      if (mode === 'custom') {

        fields.tsCustom.disabled = false;

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

    draft.s = d.toISOString();

    refreshPreview();

  });



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

    } catch {

      addError('Invalid image URL');

    }

  });



  fields.ytUrl.addEventListener('input', () => {

    const id = extractYouTubeId(fields.ytUrl.value.trim());

    draft.y = YT_ID_RE.test(id) ? id : '';

    fields.ytIdPreview.textContent = draft.y || '—';

    refreshPreview();

  });



  $('#generateBtn').addEventListener('click', () => {

    const post = {

      v: 1,

      n: (draft.n || '').trim(),

      t: (draft.t || ''),

      i: Array.isArray(draft.i) ? draft.i.slice() : [],

      y: draft.y || '',

      s: draft.s || new Date().toISOString(),

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

    setTheme(DEFAULTS.c);

    setLayoutVars(DEFAULTS.w, DEFAULTS.f);

    route();

  });



})();
