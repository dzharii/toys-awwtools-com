function copyContextBookmarklet() {
  'use strict';

  const UI_ID = 'copy-context-bookmarklet-ui';
  const EDITOR_SELECTOR = '.ace_editor, .CodeMirror, .monaco-editor, .cm-editor';
  const SKIP_TAGS = new Set([
    'button', 'script', 'style', 'noscript', 'svg', 'canvas', 'iframe',
    'input', 'textarea', 'select', 'option', 'video', 'audio'
  ]);
  const DOUBLE_BREAK_TAGS = new Set([
    'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'pre', 'blockquote',
    'section', 'article', 'table'
  ]);
  const SINGLE_BREAK_TAGS = new Set([
    'div', 'li', 'ul', 'ol', 'dl', 'dt', 'dd', 'tr', 'main', 'header',
    'footer', 'aside', 'figure', 'figcaption', 'hr'
  ]);

  function getEditorSelection(root) {
    if (root.matches('.ace_editor')) {
      const editor = root.env?.editor;
      return typeof editor?.getSelectedText === 'function'
        ? editor.getSelectedText()
        : null;
    }

    if (root.matches('.CodeMirror')) {
      const editor = root.CodeMirror;
      return typeof editor?.getSelection === 'function'
        ? editor.getSelection()
        : null;
    }

    if (root.matches('.monaco-editor')) {
      const editorWindow = root.ownerDocument.defaultView;
      const editors = editorWindow.monaco?.editor?.getEditors?.() ?? [];
      const editor = editors.find((item) => item.getDomNode?.() === root);
      const selection = editor?.getSelection?.();
      const model = editor?.getModel?.();
      return selection && model?.getValueInRange
        ? model.getValueInRange(selection)
        : null;
    }

    // CodeMirror 6 normally exposes a native DOM selection.
    return null;
  }

  function hasEditorSelectionMarker(root) {
    if (root.matches('.ace_editor')) {
      return Boolean(root.querySelector('.ace_marker-layer .ace_selection'));
    }
    if (root.matches('.CodeMirror')) {
      return Boolean(root.querySelector('.CodeMirror-selected'));
    }
    if (root.matches('.monaco-editor')) {
      return Boolean(root.querySelector('.view-overlays .selected-text'));
    }
    return Boolean(root.querySelector('.cm-selectionBackground'));
  }

  function readHtmlRange(range) {
    let result = '';
    let pendingBreak = 0;
    let previousWasPreformatted = false;

    function breakBeforeNextText(lines) {
      if (result) pendingBreak = Math.max(pendingBreak, lines);
    }

    function appendText(value, preserveWhitespace = false) {
      if (!value) return;

      let text = value.replace(/\r\n?/g, '\n');
      if (!preserveWhitespace) {
        text = text.replace(/\u00a0/g, ' ').replace(/[\t\n\f\r ]+/g, ' ');
        if (pendingBreak && !text.trim()) return;
      }

      if (pendingBreak && result) {
        if (!previousWasPreformatted) result = result.replace(/ $/, '');
        const existing = result.match(/\n*$/)[0].length;
        result += '\n'.repeat(Math.max(0, pendingBreak - existing));
        pendingBreak = 0;
        if (!preserveWhitespace) text = text.replace(/^ /, '');
      } else if (!result && !preserveWhitespace) {
        text = text.replace(/^ /, '');
      } else if (!preserveWhitespace && result.endsWith(' ')) {
        text = text.replace(/^ /, '');
      }

      result += text;
      previousWasPreformatted = preserveWhitespace;
    }

    function visit(node) {
      if (!range.intersectsNode(node)) return;

      if (node.nodeType === Node.TEXT_NODE) {
        const start = node === range.startContainer ? range.startOffset : 0;
        const end = node === range.endContainer ? range.endOffset : node.textContent.length;
        const whitespace = node.parentElement
          ? node.ownerDocument.defaultView.getComputedStyle(node.parentElement).whiteSpace
          : 'normal';
        const text = node.textContent.slice(start, end);
        if (whitespace === 'pre-line') {
          text.split(/\r\n?|\n/).forEach((line, index) => {
            if (index) breakBeforeNextText(1);
            appendText(line);
          });
        } else {
          const preserve = /^(pre|pre-wrap|break-spaces)$/.test(whitespace);
          appendText(text, preserve);
        }
        return;
      }

      if (node.nodeType !== Node.ELEMENT_NODE && node.nodeType !== Node.DOCUMENT_FRAGMENT_NODE) {
        return;
      }

      const isElement = node.nodeType === Node.ELEMENT_NODE;
      const tag = isElement ? node.localName.toLowerCase() : '';
      if (isElement) {
        if (node.matches('.ace_editor, .CodeMirror, .monaco-editor')) {
          throw new Error('This selection crosses a virtual editor. Select its code separately.');
        }
        if (SKIP_TAGS.has(tag) || node.hidden || node.closest('[inert], [aria-hidden="true"]')) {
          return;
        }
        const style = node.ownerDocument.defaultView.getComputedStyle(node);
        if (style.display === 'none' || style.visibility === 'hidden' ||
            style.visibility === 'collapse' || style.opacity === '0') {
          return;
        }
        if (tag === 'br') {
          breakBeforeNextText(1);
          return;
        }
        if (tag === 'img') {
          if (node.alt) appendText(node.alt);
          return;
        }
        if (tag === 'td' || tag === 'th') {
          if (result && !result.endsWith('\n') && node.previousElementSibling) {
            appendText('\t', true);
          }
        }
        if (DOUBLE_BREAK_TAGS.has(tag)) breakBeforeNextText(2);
        else if (SINGLE_BREAK_TAGS.has(tag)) breakBeforeNextText(1);
      }

      for (const child of node.childNodes) visit(child);

      if (isElement) {
        if (DOUBLE_BREAK_TAGS.has(tag)) breakBeforeNextText(2);
        else if (SINGLE_BREAK_TAGS.has(tag)) breakBeforeNextText(1);
      }
    }

    visit(range.commonAncestorContainer);
    return result;
  }

  function getNativeSelection(selection = window.getSelection()) {
    if (!selection || selection.isCollapsed || !selection.rangeCount) return null;

    const parts = [];
    for (let i = 0; i < selection.rangeCount; i += 1) {
      const range = selection.getRangeAt(i);
      if (range.collapsed) continue;
      const text = readHtmlRange(range);
      if (!text) throw new Error('The selected content contains no copyable text.');
      parts.push(text);
    }

    return parts.length ? parts.join('\n') : null;
  }

  function captureSelection() {
    const active = document.activeElement;
    if (active?.tagName === 'IFRAME') {
      try {
        const frame = active.contentWindow;
        const focused = frame.document.activeElement;
        const frameEditor = focused?.closest?.(EDITOR_SELECTOR);
        if (frameEditor && !frameEditor.matches('.cm-editor')) {
          const text = getEditorSelection(frameEditor);
          if (text !== null && text !== '') return text;
          if (text === null && hasEditorSelectionMarker(frameEditor)) {
            throw new Error('This editor selection cannot be read reliably.');
          }
        }
        if (!frameEditor && focused?.matches?.('textarea, input')) {
          const start = focused.selectionStart;
          const end = focused.selectionEnd;
          if (typeof start === 'number' && end > start) {
            return focused.value.slice(start, end);
          }
        }
        const native = getNativeSelection(frame.getSelection());
        if (native !== null) return native;
        if (frameEditor && hasEditorSelectionMarker(frameEditor)) {
          throw new Error('This editor selection cannot be read reliably.');
        }
        return null;
      } catch (error) {
        throw new Error(error.message || 'Selections inside this frame are not accessible.');
      }
    }

    const activeEditor = active?.closest?.(EDITOR_SELECTOR);
    const editors = [...document.querySelectorAll(EDITOR_SELECTOR)];

    if (activeEditor && !activeEditor.matches('.cm-editor')) {
      const text = getEditorSelection(activeEditor);
      if (text !== null && text !== '') return text;
      if (text === null && hasEditorSelectionMarker(activeEditor)) {
        throw new Error('This editor selection cannot be read reliably.');
      }
    }

    if (!activeEditor && active && (active.matches('textarea') || active.matches('input'))) {
      const start = active.selectionStart;
      const end = active.selectionEnd;
      if (typeof start === 'number' && typeof end === 'number' && end > start) {
        return active.value.slice(start, end);
      }
    }

    const native = getNativeSelection();
    if (native !== null) return native;

    const candidates = [];
    let unreadableSelection = false;
    for (const root of editors) {
      if (root.matches('.cm-editor')) {
        unreadableSelection ||= hasEditorSelectionMarker(root);
        continue;
      }
      const text = getEditorSelection(root);
      if (text !== null && text !== '') candidates.push(text);
      else if (text === null && hasEditorSelectionMarker(root)) unreadableSelection = true;
    }

    if (unreadableSelection || candidates.length > 1) {
      throw new Error('The selection cannot be identified reliably.');
    }
    return candidates[0] ?? null;
  }

  function createPanel() {
    const existing = document.getElementById(UI_ID);
    if (existing?.dataset.copyContextUi === 'true') existing.remove();

    const host = document.createElement('div');
    host.id = UI_ID;
    host.dataset.copyContextUi = 'true';
    host.style.cssText = [
      'position:fixed!important', 'inset:auto 16px 16px auto!important',
      'z-index:2147483647!important', 'width:min(380px,calc(100vw - 32px))!important',
      'pointer-events:none!important'
    ].join(';');

    const shadow = host.attachShadow({ mode: 'closed' });
    const style = document.createElement('style');
    style.textContent = `
      *, *::before, *::after { box-sizing: border-box; }
      .panel { pointer-events: auto; font: 14px/1.45 system-ui, sans-serif;
        color: #17212e; background: #fff; border: 1px solid #cbd5e1;
        border-radius: 10px; box-shadow: 0 12px 35px #0f172a33;
        padding: 14px 16px; overflow-wrap: anywhere; }
      .heading { font-weight: 650; margin: 0 24px 4px 0; }
      .message { margin: 0; color: #475569; }
      .close { float: right; margin: -4px -6px 0 4px; padding: 4px 8px;
        font-size: 20px; border: 0; background: transparent; cursor: pointer; }
      textarea { display: block; width: 100%; height: 145px; margin: 12px 0;
        padding: 9px; resize: vertical; border: 1px solid #94a3b8;
        border-radius: 6px; color: #17212e; background: #f8fafc;
        font: 12px/1.4 ui-monospace, SFMono-Regular, Consolas, monospace; }
      .actions { display: flex; gap: 8px; margin-top: 12px; flex-wrap: wrap; }
      button.action { cursor: pointer; border: 1px solid #cbd5e1;
        border-radius: 6px; background: #f8fafc; color: #17212e;
        padding: 7px 10px; font: inherit; }
      button.action:focus-visible, .close:focus-visible, textarea:focus-visible {
        outline: 2px solid #2563eb; outline-offset: 2px; }
    `;
    shadow.append(style);

    const panel = document.createElement('div');
    panel.className = 'panel';
    panel.setAttribute('role', 'status');
    const close = document.createElement('button');
    close.className = 'close';
    close.type = 'button';
    close.setAttribute('aria-label', 'Close notification');
    close.textContent = '×';
    close.addEventListener('click', () => host.remove());
    panel.append(close);
    shadow.append(panel);
    (document.body || document.documentElement).append(host);

    return { host, panel };
  }

  function addMessage(panel, heading, message) {
    const title = document.createElement('p');
    title.className = 'heading';
    title.textContent = heading;
    const detail = document.createElement('p');
    detail.className = 'message';
    detail.textContent = message;
    panel.append(title, detail);
  }

  function showToast(message) {
    const { host, panel } = createPanel();
    addMessage(panel, 'Copied to clipboard', message);
    setTimeout(() => host.remove(), 2400);
  }

  function copyLegacy(text) {
    const field = document.createElement('textarea');
    field.value = text;
    field.readOnly = true;
    field.setAttribute('aria-hidden', 'true');
    field.style.cssText = 'position:fixed;left:-9999px;top:0;opacity:0';

    const priorFocus = document.activeElement;
    const selection = window.getSelection();
    const savedRanges = selection
      ? Array.from({ length: selection.rangeCount }, (_, i) => selection.getRangeAt(i).cloneRange())
      : [];

    (document.body || document.documentElement).append(field);
    let copied = false;
    try {
      field.focus({ preventScroll: true });
      field.select();
      copied = document.execCommand('copy');
    } catch {
      copied = false;
    } finally {
      field.remove();
      try { priorFocus?.focus?.({ preventScroll: true }); } catch { /* Ignore focus restoration errors. */ }
      if (selection && savedRanges.length) {
        try {
          selection.removeAllRanges();
          for (const range of savedRanges) selection.addRange(range);
        } catch { /* Some editors manage their own selection. */ }
      }
    }
    return copied;
  }

  async function copyText(text) {
    if (navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch { /* Try legacy copying below. */ }
    }
    return copyLegacy(text);
  }

  function showManualCopy(text) {
    const { panel } = createPanel();
    addMessage(panel, 'Clipboard access blocked', 'Select the text below and copy it manually.');

    const field = document.createElement('textarea');
    field.value = text;
    field.readOnly = true;
    field.setAttribute('aria-label', 'Text to copy');
    panel.append(field);

    const actions = document.createElement('div');
    actions.className = 'actions';
    const select = document.createElement('button');
    select.type = 'button';
    select.className = 'action';
    select.textContent = 'Select text';
    select.addEventListener('click', () => {
      field.focus();
      field.select();
    });
    actions.append(select);
    panel.append(actions);
    field.focus();
    field.select();
  }

  function showSelectionError(message, pageText) {
    const { panel } = createPanel();
    addMessage(panel, 'Could not copy selection', message);
    const actions = document.createElement('div');
    actions.className = 'actions';
    const copyPage = document.createElement('button');
    copyPage.className = 'action';
    copyPage.type = 'button';
    copyPage.textContent = 'Copy page link instead';
    copyPage.addEventListener('click', async () => {
      if (await copyText(pageText)) showToast('Page title and URL');
      else showManualCopy(pageText);
    });
    actions.append(copyPage);
    panel.append(actions);
  }

  // Capture synchronously, before clipboard permissions or UI can change focus.
  const pageText = `${document.title}\n${location.href}`;
  let excerpt;
  try {
    excerpt = captureSelection();
  } catch (error) {
    showSelectionError(error.message || 'The selection is not accessible.', pageText);
    return;
  }

  const text = excerpt === null ? pageText : `${pageText}\n\n${excerpt}`;
  void (async () => {
    if (await copyText(text)) {
      showToast(excerpt === null ? 'Page title and URL' : 'Page title, URL, and selection');
    } else {
      showManualCopy(text);
    }
  })();
}

