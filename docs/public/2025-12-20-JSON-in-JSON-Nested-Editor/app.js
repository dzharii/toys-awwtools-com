'use strict';

const INDENT = 2;

const state = {
  tiles: [],
  activeId: null,
  nextId: 1,
  scrollToActive: false,
  focusActive: false,
};

function safeParseJson(text) {
  try {
    return { ok: true, value: JSON.parse(text) };
  } catch (error) {
    return { ok: false, error };
  }
}

function safeStringifyJson(value) {
  try {
    return { ok: true, value: JSON.stringify(value, null, INDENT) };
  } catch (error) {
    return { ok: false, error };
  }
}

function safeStringifyString(text) {
  try {
    return { ok: true, value: JSON.stringify(text) };
  } catch (error) {
    return { ok: false, error };
  }
}

function looksLikeJson(text) {
  const trimmed = text.trim();
  if (!trimmed) return false;
  const first = trimmed[0];
  if (first === '{' || first === '[' || first === '"' || first === '-' || (first >= '0' && first <= '9')) {
    return true;
  }
  return trimmed.startsWith('true') || trimmed.startsWith('false') || trimmed.startsWith('null');
}

function getLineCol(text, index) {
  const slice = text.slice(0, index);
  const lines = slice.split('\n');
  const line = lines.length;
  const col = lines[lines.length - 1].length + 1;
  return { line, col };
}

function clampLineCol(text, line, col) {
  const lines = text.split('\n');
  const maxLine = lines.length;
  const safeLine = Math.min(Math.max(line, 1), maxLine);
  const lineText = lines[safeLine - 1];
  const maxCol = lineText.length + 1;
  const safeCol = Math.min(Math.max(col, 1), maxCol);
  return { line: safeLine, col: safeCol };
}

function lineColToIndex(text, line, col) {
  const lines = text.split('\n');
  const safeLine = Math.min(Math.max(line, 1), lines.length);
  let index = 0;
  for (let i = 0; i < safeLine - 1; i += 1) {
    index += lines[i].length + 1;
  }
  const lineText = lines[safeLine - 1];
  const safeCol = Math.min(Math.max(col, 1), lineText.length + 1);
  index += safeCol - 1;
  return index;
}

function readString(text, start) {
  let i = start + 1;
  let escaped = false;
  while (i < text.length) {
    const ch = text[i];
    if (escaped) {
      escaped = false;
      i += 1;
      continue;
    }
    if (ch === '\\') {
      escaped = true;
      i += 1;
      continue;
    }
    if (ch === '"') {
      return i + 1;
    }
    i += 1;
  }
  return text.length;
}

const numberRe = /-?(0|[1-9]\d*)(\.\d+)?([eE][+-]?\d+)?/y;

function readLiteralOrNumber(text, start) {
  if (text.startsWith('true', start)) return start + 4;
  if (text.startsWith('false', start)) return start + 5;
  if (text.startsWith('null', start)) return start + 4;
  numberRe.lastIndex = start;
  const match = numberRe.exec(text);
  if (match) return numberRe.lastIndex;
  return start;
}

function tokenizeJsonStrings(text) {
  const tokens = [];
  const stack = [{ type: 'root', expecting: 'value' }];
  let i = 0;

  while (i < text.length) {
    const ctx = stack[stack.length - 1];
    const ch = text[i];

    if (ch === ' ' || ch === '\n' || ch === '\t' || ch === '\r') {
      i += 1;
      continue;
    }

    if (ctx.expecting === 'end') {
      i += 1;
      continue;
    }

    if (ctx.expecting === 'keyOrEnd') {
      if (ch === '}') {
        stack.pop();
        if (stack.length > 0) {
          const parent = stack[stack.length - 1];
          parent.expecting = parent.type === 'root' ? 'end' : 'commaOrEnd';
        }
        i += 1;
        continue;
      }
      if (ch === '"') {
        const start = i;
        const end = readString(text, i);
        tokens.push({ start, end, kind: 'key' });
        ctx.expecting = 'colon';
        i = end;
        continue;
      }
      i += 1;
      continue;
    }

    if (ctx.expecting === 'colon') {
      if (ch === ':') {
        ctx.expecting = 'value';
        i += 1;
        continue;
      }
      i += 1;
      continue;
    }

    if (ctx.expecting === 'value' || ctx.expecting === 'valueOrEnd') {
      if (ctx.expecting === 'valueOrEnd' && ch === ']') {
        stack.pop();
        if (stack.length > 0) {
          const parent = stack[stack.length - 1];
          parent.expecting = parent.type === 'root' ? 'end' : 'commaOrEnd';
        }
        i += 1;
        continue;
      }
      if (ch === '{') {
        stack.push({ type: 'object', expecting: 'keyOrEnd' });
        i += 1;
        continue;
      }
      if (ch === '[') {
        stack.push({ type: 'array', expecting: 'valueOrEnd' });
        i += 1;
        continue;
      }
      if (ch === '"') {
        const start = i;
        const end = readString(text, i);
        tokens.push({ start, end, kind: 'value' });
        ctx.expecting = 'commaOrEnd';
        i = end;
        continue;
      }
      const literalEnd = readLiteralOrNumber(text, i);
      if (literalEnd > i) {
        ctx.expecting = 'commaOrEnd';
        i = literalEnd;
        continue;
      }
      i += 1;
      continue;
    }

    if (ctx.expecting === 'commaOrEnd') {
      if (ch === ',') {
        ctx.expecting = ctx.type === 'object' ? 'keyOrEnd' : 'valueOrEnd';
        i += 1;
        continue;
      }
      if (ch === '}' && ctx.type === 'object') {
        stack.pop();
        if (stack.length > 0) {
          const parent = stack[stack.length - 1];
          parent.expecting = parent.type === 'root' ? 'end' : 'commaOrEnd';
        }
        i += 1;
        continue;
      }
      if (ch === ']' && ctx.type === 'array') {
        stack.pop();
        if (stack.length > 0) {
          const parent = stack[stack.length - 1];
          parent.expecting = parent.type === 'root' ? 'end' : 'commaOrEnd';
        }
        i += 1;
        continue;
      }
      i += 1;
    }
  }

  return tokens;
}

function findTokenAtCursor(tokens, cursorIndex) {
  for (const token of tokens) {
    if (cursorIndex > token.start && cursorIndex < token.end) {
      return token;
    }
  }
  return null;
}

function getTileById(id) {
  return state.tiles.find((tile) => tile.id === id);
}

function isDirty(tile) {
  return tile.content !== tile.lastCommitted;
}

function updateTileCursor(tile, selectionStart) {
  if (typeof selectionStart !== 'number') return;
  tile.cursor = getLineCol(tile.content, selectionStart);
  tile.pendingSelection = tile.cursor;
  tile.selectionIndex = selectionStart;
}

function getReasonText(tile, eligibility) {
  if (tile.errorMessage) {
    return tile.errorMessage;
  }
  if (tile.isActive) {
    return eligibility.eligible
      ? 'String value selected. Choose how to open the embedded editor.'
      : eligibility.reason;
  }
  return 'Disabled while a child tile is open.';
}

function refreshActiveEligibility(tileId, selectionStart) {
  const tile = getTileById(tileId);
  if (!tile || !tile.isActive) return;
  if (typeof selectionStart === 'number') {
    updateTileCursor(tile, selectionStart);
  }

  const tileEl = document.querySelector(`[data-tile-id="${tileId}"]`);
  if (!tileEl) return;
  const editButton = tileEl.querySelector('[data-role="edit-button"]');
  const reason = tileEl.querySelector('[data-role="tile-reason"]');
  const picker = tileEl.querySelector('[data-role="mode-picker"]');

  const cursorIndex = typeof tile.selectionIndex === 'number'
    ? tile.selectionIndex
    : lineColToIndex(tile.content, tile.cursor.line, tile.cursor.col);
  const eligibility = getEmbeddedEligibility(tile, cursorIndex);

  if (editButton) {
    editButton.disabled = !eligibility.eligible;
  }
  if (!eligibility.eligible) {
    tile.showModePicker = false;
    if (picker) picker.remove();
  }
  if (reason) {
    reason.textContent = getReasonText(tile, eligibility);
  }
}

function updateRootMode(tile, selectionStart) {
  const trimmed = tile.content.trim();
  if (!trimmed) {
    tile.mode = 'text';
    tile.valid = true;
    tile.errorMessage = '';
    return;
  }

  const parsed = safeParseJson(tile.content);
  if (parsed.ok) {
    tile.mode = 'json';
    tile.valid = true;
    tile.errorMessage = '';
    return;
  }

  if (tile.mode === 'json' || looksLikeJson(tile.content)) {
    tile.mode = 'json';
    tile.valid = false;
    tile.errorMessage = 'Invalid JSON';
    return;
  }

  tile.mode = 'text';
  tile.valid = true;
  tile.errorMessage = '';
}

function updateTileValidity(tile) {
  if (tile.mode === 'text') {
    tile.valid = true;
    tile.errorMessage = '';
    return;
  }

  const parsed = safeParseJson(tile.content);
  tile.valid = parsed.ok;
  tile.errorMessage = parsed.ok ? '' : 'Invalid JSON';
}

function getEmbeddedEligibility(tile, cursorIndex) {
  if (!tile.isActive) {
    return { eligible: false, reason: 'Active tile only.' };
  }
  if (tile.mode !== 'json') {
    return { eligible: false, reason: 'Switch to JSON content to edit embedded strings.' };
  }
  if (!tile.valid) {
    return { eligible: false, reason: 'Fix JSON validity to unlock embedded editing.' };
  }
  const tokens = tokenizeJsonStrings(tile.content);
  const token = findTokenAtCursor(tokens, cursorIndex || 0);
  if (!token) {
    return { eligible: false, reason: 'Place the cursor inside a string value.' };
  }
  if (token.kind === 'key') {
    return { eligible: false, reason: 'Property names cannot be edited as embedded content.' };
  }
  const valueTokens = tokens.filter((item) => item.kind === 'value');
  const valueIndex = valueTokens.indexOf(token);
  if (valueIndex === -1) {
    return { eligible: false, reason: 'Place the cursor inside a string value.' };
  }
  return { eligible: true, reason: 'String value selected.', token, valueIndex };
}

function createTile({ parentId, mode, content, derivedFrom }) {
  const parsed = mode === 'json' ? safeParseJson(content) : { ok: true };
  return {
    id: (state.nextId += 1),
    parentId: parentId || null,
    mode,
    content,
    lastCommitted: content,
    valid: mode === 'json' ? parsed.ok : true,
    cursor: { line: 1, col: 1 },
    pendingSelection: { line: 1, col: 1 },
    selectionIndex: 0,
    errorMessage: parsed.ok ? '' : 'Invalid JSON',
    derivedFrom: derivedFrom || null,
    showModePicker: false,
  };
}

function createRootTile() {
  const root = {
    id: 1,
    parentId: null,
    mode: 'text',
    content: '',
    lastCommitted: '',
    valid: true,
    cursor: { line: 1, col: 1 },
    pendingSelection: { line: 1, col: 1 },
    selectionIndex: 0,
    errorMessage: '',
    derivedFrom: null,
    showModePicker: false,
  };
  state.tiles = [root];
  state.activeId = root.id;
}

function setActiveToLast() {
  const lastTile = state.tiles[state.tiles.length - 1];
  if (lastTile) {
    state.activeId = lastTile.id;
  }
  state.tiles.forEach((tile) => {
    tile.isActive = tile.id === state.activeId;
  });
}

function openDerivedTile(parentId, mode) {
  const parent = getTileById(parentId);
  if (!parent) return;

  const parentTextarea = document.querySelector(`[data-tile-id="${parentId}"] textarea`);
  const cursorIndex = parentTextarea ? parentTextarea.selectionStart : 0;
  const eligibility = getEmbeddedEligibility(parent, cursorIndex);
  if (!eligibility.eligible) return;

  const { token, valueIndex } = eligibility;
  const rawString = parent.content.slice(token.start, token.end);
  let decoded = '';
  let decodeError = '';

  try {
    decoded = JSON.parse(rawString);
  } catch (error) {
    decodeError = 'Unable to decode the selected string.';
  }

  let initialContent = decoded;
  let valid = true;
  if (mode === 'json') {
    const parsed = safeParseJson(decoded);
    if (parsed.ok) {
      const formatted = safeStringifyJson(parsed.value);
      if (formatted.ok) {
        initialContent = formatted.value;
      }
    } else {
      valid = false;
    }
  }

  const derivedFrom = {
    parentId,
    valueIndex,
  };

  const child = createTile({ parentId, mode, content: initialContent, derivedFrom });
  child.valid = valid && !decodeError;
  child.errorMessage = decodeError || (child.valid ? '' : 'Invalid JSON');

  state.tiles.push(child);
  setActiveToLast();
  state.scrollToActive = true;
  state.focusActive = true;
}

function updateParentStringRange(parent, child) {
  if (!child.derivedFrom) return null;
  const tokens = tokenizeJsonStrings(parent.content);
  const valueTokens = tokens.filter((item) => item.kind === 'value');
  const token = valueTokens[child.derivedFrom.valueIndex];
  return token || null;
}

function commitTile(tileId) {
  const tile = getTileById(tileId);
  if (!tile || !tile.isActive) return;

  const textarea = document.querySelector(`[data-tile-id="${tileId}"] textarea`);
  if (textarea) {
    updateTileCursor(tile, textarea.selectionStart);
  }

  if (!tile.parentId) {
    if (tile.mode === 'json') {
      const parsed = safeParseJson(tile.content);
      if (!parsed.ok) {
        tile.valid = false;
        tile.errorMessage = 'Invalid JSON';
        return;
      }
      const formatted = safeStringifyJson(parsed.value);
      if (!formatted.ok) {
        tile.errorMessage = 'Failed to format JSON.';
        tile.valid = false;
        return;
      }
      tile.content = formatted.value;
      tile.valid = true;
      tile.cursor = clampLineCol(tile.content, tile.cursor.line, tile.cursor.col);
      tile.pendingSelection = tile.cursor;
    }
    tile.lastCommitted = tile.content;
    tile.errorMessage = '';
    state.focusActive = true;
    return;
  }

  let contentToCommit = tile.content;
  if (tile.mode === 'json') {
    const parsed = safeParseJson(tile.content);
    if (!parsed.ok) {
      tile.valid = false;
      tile.errorMessage = 'Invalid JSON';
      return;
    }
    const formatted = safeStringifyJson(parsed.value);
    if (!formatted.ok) {
      tile.errorMessage = 'Failed to format JSON.';
      tile.valid = false;
      return;
    }
    tile.content = formatted.value;
    tile.valid = true;
    tile.cursor = clampLineCol(tile.content, tile.cursor.line, tile.cursor.col);
    tile.pendingSelection = tile.cursor;
    contentToCommit = tile.content;
  }

  const encoded = safeStringifyString(contentToCommit);
  if (!encoded.ok) {
    tile.errorMessage = 'Failed to encode content.';
    return;
  }

  const parent = getTileById(tile.parentId);
  if (!parent) return;

  const token = updateParentStringRange(parent, tile);
  if (!token) {
    parent.errorMessage = 'Could not locate the original string value.';
    return;
  }

  parent.content = parent.content.slice(0, token.start) + encoded.value + parent.content.slice(token.end);

  if (parent.mode === 'json') {
    const parsedParent = safeParseJson(parent.content);
    if (parsedParent.ok) {
      const formattedParent = safeStringifyJson(parsedParent.value);
      if (formattedParent.ok) {
        parent.content = formattedParent.value;
        parent.valid = true;
        parent.cursor = clampLineCol(parent.content, parent.cursor.line, parent.cursor.col);
        parent.errorMessage = '';
        parent.pendingSelection = parent.cursor;
      } else {
        parent.valid = false;
        parent.errorMessage = 'Failed to format parent JSON.';
      }
    } else {
      parent.valid = false;
      parent.errorMessage = 'Parent JSON became invalid.';
    }
  }

  tile.lastCommitted = tile.content;
  tile.errorMessage = '';

  const updatedToken = updateParentStringRange(parent, tile);
  if (updatedToken) {
    tile.derivedFrom.range = updatedToken;
  }

  state.focusActive = true;
}

function closeTile(tileId) {
  const tile = getTileById(tileId);
  if (!tile || !tile.parentId || !tile.isActive) return;

  if (isDirty(tile)) {
    const discard = window.confirm('Discard uncommitted changes?');
    if (!discard) return;
  }

  state.tiles = state.tiles.filter((item) => item.id !== tileId);
  setActiveToLast();
  state.scrollToActive = true;
  state.focusActive = true;
}

function handleInput(tileId, value, selectionStart) {
  const tile = getTileById(tileId);
  if (!tile) return;
  tile.content = value;
  updateTileCursor(tile, selectionStart);

  if (!tile.parentId) {
    updateRootMode(tile, selectionStart || 0);
  } else {
    updateTileValidity(tile);
  }

  render();
}

function handleSelection(tileId, selectionStart) {
  const tile = getTileById(tileId);
  if (!tile) return;
  refreshActiveEligibility(tileId, selectionStart);
}

function render() {
  setActiveToLast();
  const container = document.getElementById('tiles');
  const scrollLeft = container.scrollLeft;
  container.innerHTML = '';

  state.tiles.forEach((tile, index) => {
    const tileEl = document.createElement('div');
    tileEl.className = 'tile';
    if (tile.isActive) tileEl.classList.add('tile--active');
    if (!tile.isActive) tileEl.classList.add('tile--disabled');
    tileEl.dataset.tileId = tile.id;

    const header = document.createElement('div');
    header.className = 'tile-header';

    const topline = document.createElement('div');
    topline.className = 'tile-topline';

    const title = document.createElement('div');
    title.className = 'tile-title';

    const label = document.createElement('span');
    label.className = 'tile-label';
    label.textContent = tile.parentId ? `Tile ${index + 1}` : 'Root';

    const dirty = isDirty(tile);
    if (dirty) {
      const dirtyDot = document.createElement('span');
      dirtyDot.className = 'dirty-dot';
      title.appendChild(dirtyDot);
    }

    const modeBadge = document.createElement('span');
    modeBadge.className = `badge ${tile.mode === 'json' ? 'badge--json' : 'badge--text'}`;
    modeBadge.textContent = tile.mode === 'json' ? 'JSON' : 'TEXT';

    const validBadge = document.createElement('span');
    validBadge.className = `badge ${tile.valid ? 'badge--valid' : 'badge--invalid'}`;
    validBadge.textContent = tile.valid ? 'Valid' : 'Invalid';

    title.appendChild(label);
    title.appendChild(modeBadge);
    title.appendChild(validBadge);

    topline.appendChild(title);

    const actions = document.createElement('div');
    actions.className = 'tile-actions';

    const editButton = document.createElement('button');
    editButton.textContent = 'Edit embedded';
    editButton.dataset.role = 'edit-button';

    const cursorIndex = typeof tile.selectionIndex === 'number'
      ? tile.selectionIndex
      : lineColToIndex(tile.content, tile.cursor.line, tile.cursor.col);
    const eligibility = getEmbeddedEligibility(tile, cursorIndex);
    if (!eligibility.eligible) {
      tile.showModePicker = false;
    }
    editButton.disabled = !eligibility.eligible;
    editButton.addEventListener('click', () => {
      tile.showModePicker = !tile.showModePicker;
      render();
    });

    if (tile.showModePicker && eligibility.eligible) {
      const picker = document.createElement('div');
      picker.className = 'mode-picker';
      picker.dataset.role = 'mode-picker';
      const textButton = document.createElement('button');
      textButton.className = 'ghost';
      textButton.textContent = 'Edit as text';
      textButton.addEventListener('click', () => {
        tile.showModePicker = false;
        openDerivedTile(tile.id, 'text');
        render();
      });
      const jsonButton = document.createElement('button');
      jsonButton.className = 'ghost';
      jsonButton.textContent = 'Edit as JSON';
      jsonButton.addEventListener('click', () => {
        tile.showModePicker = false;
        openDerivedTile(tile.id, 'json');
        render();
      });
      picker.appendChild(textButton);
      picker.appendChild(jsonButton);
      actions.appendChild(picker);
    }

    actions.appendChild(editButton);

    const commitButton = document.createElement('button');
    commitButton.textContent = 'Commit';
    commitButton.className = 'primary';
    commitButton.disabled = !tile.isActive || (tile.mode === 'json' && !tile.valid);
    commitButton.addEventListener('click', () => {
      commitTile(tile.id);
      render();
    });
    actions.appendChild(commitButton);

    if (tile.parentId) {
      const closeButton = document.createElement('button');
      closeButton.textContent = 'Close';
      closeButton.disabled = !tile.isActive;
      closeButton.addEventListener('click', () => {
        closeTile(tile.id);
        render();
      });
      actions.appendChild(closeButton);
    }

    topline.appendChild(actions);
    header.appendChild(topline);

    const reason = document.createElement('div');
    reason.className = 'tile-reason';
    reason.dataset.role = 'tile-reason';
    reason.textContent = getReasonText(tile, eligibility);
    header.appendChild(reason);

    const textarea = document.createElement('textarea');
    textarea.value = tile.content;
    textarea.disabled = !tile.isActive;
    textarea.addEventListener('input', (event) => {
      handleInput(tile.id, event.target.value, event.target.selectionStart);
    });
    textarea.addEventListener('click', (event) => {
      handleSelection(tile.id, event.target.selectionStart);
    });
    textarea.addEventListener('keyup', (event) => {
      handleSelection(tile.id, event.target.selectionStart);
    });

    tileEl.appendChild(header);
    tileEl.appendChild(textarea);

    container.appendChild(tileEl);

    if (tile.isActive && tile.pendingSelection) {
      const indexToSet = lineColToIndex(tile.content, tile.pendingSelection.line, tile.pendingSelection.col);
      textarea.focus();
      textarea.setSelectionRange(indexToSet, indexToSet);
    }
  });

  container.scrollLeft = scrollLeft;

  if (state.scrollToActive) {
    const activeTile = container.querySelector('.tile--active');
    if (activeTile) {
      activeTile.scrollIntoView({ behavior: 'smooth', inline: 'nearest', block: 'nearest' });
    }
    state.scrollToActive = false;
  }

  state.focusActive = false;
}

function start() {
  createRootTile();
  render();
}

window.addEventListener('DOMContentLoaded', start);
