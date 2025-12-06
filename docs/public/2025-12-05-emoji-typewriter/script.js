// Emoji Typewriter Lab
// Combines the typewriter experience with emoji search and Unicode control helpers

// ==========================================
// Audio setup
// ==========================================
let audioContext = null;
let currentProfile = 'classic';
let volumeLevel = 'medium';

const volumeMultipliers = {
  low: 0.3,
  medium: 0.7,
  high: 1.0
};

function initAudioContext() {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }
  return audioContext;
}

function playKeySound(profile = currentProfile) {
  const ctx = initAudioContext();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const now = ctx.currentTime;

  let freq = 180;
  let duration = 0.05;
  let gainValue = 0.15;
  let oscType = 'square';

  switch (profile) {
    case 'classic':
      freq = 180;
      gainValue = 0.15;
      oscType = 'square';
      duration = 0.05;
      break;
    case 'soft':
      freq = 140;
      gainValue = 0.05;
      oscType = 'sine';
      duration = 0.08;
      break;
    case 'clacky':
      freq = 300;
      gainValue = 0.12;
      oscType = 'square';
      duration = 0.04;
      break;
    case 'thud':
      freq = 90;
      gainValue = 0.25;
      oscType = 'sawtooth';
      duration = 0.08;
      break;
    case 'beep':
      freq = 600;
      gainValue = 0.08;
      oscType = 'sine';
      duration = 0.06;
      break;
    case 'random':
      freq = 100 + Math.random() * 600;
      gainValue = 0.08 + Math.random() * 0.1;
      oscType = ['sine', 'square', 'triangle'][Math.floor(Math.random() * 3)];
      duration = 0.04 + Math.random() * 0.04;
      break;
    case 'boom':
      freq = 55;
      gainValue = 0.3;
      oscType = 'sine';
      duration = 0.15;
      break;
    case 'vintage':
      freq = 220;
      gainValue = 0.18;
      oscType = 'triangle';
      duration = 0.07;
      break;
    case 'bubbly':
      freq = 800;
      gainValue = 0.1;
      oscType = 'sine';
      duration = 0.03;
      break;
    case 'metallic':
      freq = 1200;
      gainValue = 0.12;
      oscType = 'triangle';
      duration = 0.04;
      break;
    case 'woody':
      freq = 150;
      gainValue = 0.2;
      oscType = 'triangle';
      duration = 0.06;
      break;
    case 'laser':
      freq = 1800;
      gainValue = 0.15;
      oscType = 'sawtooth';
      duration = 0.08;
      osc.frequency.setValueAtTime(freq, now);
      osc.frequency.exponentialRampToValueAtTime(800, now + duration);
      break;
    case 'thunder':
      freq = 40;
      gainValue = 0.35;
      oscType = 'sawtooth';
      duration = 0.2;
      break;
    case 'cricket':
      freq = 3000;
      gainValue = 0.08;
      oscType = 'square';
      duration = 0.02;
      break;
    case 'submarine':
      freq = 500;
      gainValue = 0.2;
      oscType = 'sine';
      duration = 0.3;
      break;
    case 'glitch':
      freq = 50 + Math.random() * 3000;
      gainValue = 0.18;
      oscType = ['square', 'sawtooth'][Math.floor(Math.random() * 2)];
      duration = 0.02 + Math.random() * 0.03;
      break;
    case 'annoying-beep':
      freq = 4000;
      gainValue = 0.4;
      oscType = 'square';
      duration = 0.15;
      break;
    case 'annoying-buzz':
      freq = 8000;
      gainValue = 0.35;
      oscType = 'sawtooth';
      duration = 0.1;
      break;
    case 'annoying-siren':
      freq = 800;
      gainValue = 0.45;
      oscType = 'square';
      duration = 0.2;
      osc.frequency.setValueAtTime(freq, now);
      osc.frequency.linearRampToValueAtTime(1200, now + duration);
      break;
    case 'whisper':
      freq = 2000 + Math.random() * 1000;
      gainValue = 0.03;
      oscType = 'triangle';
      duration = 0.1;
      break;
    case 'orchestra':
      freq = 220;
      gainValue = 0.25;
      oscType = 'triangle';
      duration = 0.12;
      break;
    default:
      break;
  }

  osc.type = oscType;
  if (!osc.frequency.value) {
    osc.frequency.setValueAtTime(freq, now);
  }

  const finalGain = gainValue * volumeMultipliers[volumeLevel];
  gain.gain.setValueAtTime(finalGain, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + duration);
}

function playDing() {
  const ctx = initAudioContext();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const now = ctx.currentTime;

  osc.type = 'sine';
  osc.frequency.setValueAtTime(880, now);
  osc.frequency.exponentialRampToValueAtTime(660, now + 0.3);

  const finalGain = 0.2 * volumeMultipliers[volumeLevel];
  gain.gain.setValueAtTime(finalGain, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.3);
}

// ==========================================
// DOM references & state
// ==========================================
const paper = document.getElementById('paper');
const lineNumbers = document.getElementById('line-numbers');
const soundSelect = document.getElementById('sound-select');
const volumeButtons = Array.from(document.querySelectorAll('.volume-btn'));
const searchInput = document.getElementById('emoji-search');
const helpName = document.getElementById('help-name');
const helpCode = document.getElementById('help-code');
const helpDescription = document.getElementById('help-description');
const helpExample = document.getElementById('help-example');
const statusBadge = document.getElementById('status-badge');
const unicodeGrid = document.getElementById('unicode-grid');
const formattingButtonsContainer = document.getElementById('formatting-buttons');

const appStoreKey = 'b4fc7cc1-eb82-4bd9-acac-22c34004adf5';
const RECENT_KEY = 'recentEmojis';

let emojiPage = 0;
let searchQuery = '';
let recentEmojis = [];
let currentEmojiResults = [];
const defaultRecents = [
  '😀', '😍', '👍', '✨', '🔥', '🥳', '🤔', '🤯', '🎉', '😊', '🌈',
  '🤣', '🤗', '🥰', '🙌'
];

const emojiLookup = new Map();
if (typeof emojiData !== 'undefined' && Array.isArray(emojiData)) {
  emojiData.forEach(item => {
    if (!emojiLookup.has(item.emoji)) {
      emojiLookup.set(item.emoji, item);
    }
  });
}

// ==========================================
// Keyboard mapping (SVG)
// ==========================================
function buildKeycaps() {
  const rects = Array.from(document.querySelectorAll('#keyboard .key'));
  return rects.map((rect) => {
    const label = rect.nextElementSibling;
    const row = rect.parentElement ? rect.parentElement.id : '';
    return { rect, label, row };
  });
}

const keycaps = buildKeycaps();
const rows = {
  'row-1': keycaps.filter(k => k.row === 'row-1'),
  'row-2': keycaps.filter(k => k.row === 'row-2'),
  'row-3': keycaps.filter(k => k.row === 'row-3'),
  'row-4': keycaps.filter(k => k.row === 'row-4'),
  'row-5': keycaps.filter(k => k.row === 'row-5')
};

const recentSlots = rows['row-1'];
const paletteSlots = [...rows['row-2'], ...rows['row-3'], ...rows['row-4']];
const actionSlots = rows['row-5'];
const RECENT_LIMIT = recentSlots.length;

function setKeycap(cap, { label, role = 'inactive', value = '', helpId = '' }) {
  if (!cap || !cap.rect || !cap.label) return;
  cap.rect.dataset.role = role;
  cap.rect.dataset.value = value;
  cap.rect.dataset.helpId = helpId;
  cap.label.textContent = label || '';

  if (role === 'inactive') {
    cap.rect.classList.add('inactive');
  } else {
    cap.rect.classList.remove('inactive');
  }
}

function resetAllKeycaps() {
  keycaps.forEach(cap => setKeycap(cap, { label: '', role: 'inactive' }));
}

// ==========================================
// Line numbers & typing
// ==========================================
function updateLineNumbers() {
  const lines = paper.value.split('\n').length;
  let html = '';
  for (let i = 1; i <= lines; i += 1) {
    html += i + '<br>';
  }
  lineNumbers.innerHTML = html;
  lineNumbers.style.transform = `translateY(${-paper.scrollTop}px)`;
}

function insertAtCursor(text, { replaceSelection = true } = {}) {
  const start = paper.selectionStart;
  const end = paper.selectionEnd;
  const current = paper.value;
  if (!replaceSelection && start !== end) {
    paper.selectionStart = paper.selectionEnd = end;
  }
  const insertStart = replaceSelection ? start : paper.selectionStart;
  const insertEnd = replaceSelection ? end : paper.selectionStart;
  paper.value = current.substring(0, insertStart) + text + current.substring(insertEnd);
  const newPos = insertStart + text.length;
  paper.selectionStart = paper.selectionEnd = newPos;
  updateLineNumbers();
  updateFormattingButtonsState();
  paper.focus();
}

function handleEnter() {
  insertAtCursor('\n');
  playDing();
}

function handleTab() {
  insertAtCursor('    ');
  playKeySound();
}

function normalizeKey(key) {
  const keyMap = {
    ' ': ' ',
    'Shift': 'ShiftLeft',
    'Control': 'ControlLeft',
    'Alt': 'AltLeft',
    'Meta': 'MetaLeft'
  };
  return keyMap[key] || key.toUpperCase();
}

function highlightKey(key) {
  const normalized = normalizeKey(key);
  const keyElement = document.querySelector(`.key[data-key="${normalized}"]`);
  if (keyElement) keyElement.classList.add('active');
}

function unhighlightKey(key) {
  const normalized = normalizeKey(key);
  const keyElement = document.querySelector(`.key[data-key="${normalized}"]`);
  if (keyElement) keyElement.classList.remove('active');
}

// ==========================================
// Local storage helpers
// ==========================================
function loadFromLocalStorage(key) {
  try {
    const stored = localStorage.getItem(appStoreKey);
    if (!stored) return [];
    const parsed = JSON.parse(stored);
    return parsed[key] || [];
  } catch (err) {
    console.error('Error loading from localStorage:', err);
    return [];
  }
}

function saveToLocalStorage(key, data) {
  try {
    const stored = localStorage.getItem(appStoreKey);
    const parsed = stored ? JSON.parse(stored) : {};
    parsed[key] = data;
    localStorage.setItem(appStoreKey, JSON.stringify(parsed));
  } catch (err) {
    console.error('Error saving to localStorage:', err);
  }
}

// ==========================================
// Status badge
// ==========================================
let statusTimeout = null;
function showStatus(message) {
  if (!statusBadge) return;
  statusBadge.textContent = message;
  statusBadge.style.display = 'block';
  clearTimeout(statusTimeout);
  statusTimeout = setTimeout(() => {
    statusBadge.style.display = 'none';
  }, 2200);
}

// ==========================================
// Emoji helpers
// ==========================================
function getRandomEmojis(count) {
  if (!Array.isArray(emojiData)) return [];
  const shuffled = [...emojiData].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count).map(item => item.emoji);
}

function searchEmojis(query) {
  const term = (query || '').trim().toLowerCase();
  if (!term) return getRandomEmojis(90);
  return emojiData
    .filter(item => item.label.includes(term))
    .map(item => item.emoji);
}

function updateRecents(emoji) {
  if (!emoji) return;
  const existingIndex = recentEmojis.indexOf(emoji);
  if (existingIndex !== -1) {
    recentEmojis.splice(existingIndex, 1);
  }
  recentEmojis.unshift(emoji);
  if (recentEmojis.length > RECENT_LIMIT) {
    recentEmojis.length = RECENT_LIMIT;
  }
  saveToLocalStorage(RECENT_KEY, recentEmojis);
}

function renderRecents() {
  recentSlots.forEach((cap, index) => {
    const emoji = recentEmojis[index] || defaultRecents[index] || defaultRecents[index % defaultRecents.length];
    if (emoji) {
      setKeycap(cap, { label: emoji, role: 'recent-emoji', value: emoji });
    } else {
      setKeycap(cap, { label: '·', role: 'inactive', value: '' });
    }
  });
}

function renderEmojiPalette() {
  const paletteCapacity = paletteSlots.length;
  currentEmojiResults = searchEmojis(searchQuery);
  const pageCount = Math.max(1, Math.ceil(currentEmojiResults.length / paletteCapacity));
  if (emojiPage >= pageCount) emojiPage = 0;

  const start = emojiPage * paletteCapacity;
  const pageItems = currentEmojiResults.slice(start, start + paletteCapacity);

  paletteSlots.forEach((cap, index) => {
    const emoji = pageItems[index];
    if (emoji) {
      setKeycap(cap, { label: emoji, role: 'emoji', value: emoji });
    } else {
      setKeycap(cap, { label: '', role: 'inactive', value: '' });
    }
  });

  const actionKey = actionSlots[0];
  if (!actionKey) return;
  if (currentEmojiResults.length > paletteCapacity) {
    setKeycap(actionKey, {
      label: `More ${emojiPage + 1}/${pageCount}`,
      role: 'page',
      value: 'next'
    });
  } else if (searchQuery.trim()) {
    setKeycap(actionKey, {
      label: 'Clear search',
      role: 'clear-search',
      value: 'clear'
    });
  } else {
    setKeycap(actionKey, {
      label: 'Shuffle set',
      role: 'shuffle',
      value: 'shuffle'
    });
  }
}

// ==========================================
// Unicode control metadata
// ==========================================
const unicodeControls = [
  {
    id: 'lrm',
    label: 'LRM',
    insert: '\u200E',
    kind: 'insert',
    name: 'Left-to-Right Mark',
    code: 'U+200E',
    description: 'Invisible hint that nudges surrounding text into left-to-right order. Best used before/after mixed-script segments.',
    example: 'Use between mixed scripts: abc\u200Eעברית'
  },
  {
    id: 'rlm',
    label: 'RLM',
    insert: '\u200F',
    kind: 'insert',
    name: 'Right-to-Left Mark',
    code: 'U+200F',
    description: 'Invisible hint that nudges surrounding text into right-to-left order.',
    example: 'Use between mixed scripts: abc\u200Fעברית'
  },
  {
    id: 'lri',
    label: 'LRI/PDI',
    insert: '\u2066',
    closing: '\u2069',
    kind: 'wrap',
    name: 'Left-to-Right Isolate',
    code: 'U+2066 ... U+2069',
    description: 'Starts a left-to-right isolated run. Select text and click to wrap it; otherwise inserts an isolate starter so you can type then close with PDI.',
    example: 'Select text → wrap with LRI ... PDI to keep it LTR in RTL context.'
  },
  {
    id: 'rli',
    label: 'RLI/PDI',
    insert: '\u2067',
    closing: '\u2069',
    kind: 'wrap',
    name: 'Right-to-Left Isolate',
    code: 'U+2067 ... U+2069',
    description: 'Starts a right-to-left isolated run. Select text first to wrap; otherwise inserts a starter so you can type then close later.',
    example: '\u2067عربي\u2069 inside Latin text'
  },
  {
    id: 'fsi',
    label: 'FSI/PDI',
    insert: '\u2068',
    closing: '\u2069',
    kind: 'wrap',
    name: 'First Strong Isolate',
    code: 'U+2068 ... U+2069',
    description: 'Direction decided by the first strong character. Wrapping a selection keeps it isolated from surrounding text.',
    example: '\u2068123 عربى\u2069 chooses RTL because of the strong letter'
  },
  {
    id: 'pdi',
    label: 'PDI',
    insert: '\u2069',
    kind: 'insert',
    name: 'Pop Directional Isolate',
    code: 'U+2069',
    description: 'Closes an isolate. Insert after an LRI/RLI/FSI run. Does not replace your selection.',
    example: '...then finish with PDI to exit the isolated run.'
  },
  {
    id: 'vs15',
    label: 'VS15',
    insert: '\uFE0E',
    kind: 'suffix',
    name: 'Variation Selector 15',
    code: 'U+FE0E',
    description: 'Requests text presentation for emoji-capable characters. Select a symbol then click to append, or click after typing.',
    example: '❤\uFE0E asks for text style'
  },
  {
    id: 'vs16',
    label: 'VS16',
    insert: '\uFE0F',
    kind: 'suffix',
    name: 'Variation Selector 16',
    code: 'U+FE0F',
    description: 'Requests emoji presentation. Works after supported symbols.',
    example: '❤\uFE0F asks for emoji style'
  },
  {
    id: 'zwj',
    label: 'ZWJ',
    insert: '\u200D',
    kind: 'insert',
    name: 'Zero Width Joiner',
    code: 'U+200D',
    description: 'Joins emoji to build a single glyph when the platform supports the sequence. Insert between emoji; does not replace selection.',
    example: 'Example: 👩\u200D💻 becomes a technologist emoji'
  },
  {
    id: 'zwnj',
    label: 'ZWNJ',
    insert: '\u200C',
    kind: 'insert',
    name: 'Zero Width Non-Joiner',
    code: 'U+200C',
    description: 'Prevents joining/ligatures. Insert between letters or emoji. Keeps current selection intact.',
    example: 'Insert between joining letters to stop the join.'
  },
  {
    id: 'tone',
    label: 'Tone',
    insert: '\u{1F3FD}',
    kind: 'suffix',
    name: 'Skin Tone Modifier',
    code: 'U+1F3FD',
    description: 'Apply after people/hand emoji. Select the base emoji then click to append the tone. Without a selection, it inserts as-is.',
    example: 'Select 👍 then click Tone to get 👍🏽'
  },
  {
    id: 'nbsp',
    label: 'NBSP',
    insert: '\u00A0',
    kind: 'insert',
    name: 'No-Break Space',
    code: 'U+00A0',
    description: 'Space that prevents line breaks. Does not replace selection.',
    example: 'Keeps words together: hello\u00A0world'
  },
  {
    id: 'nnbsp',
    label: 'NNBSP',
    insert: '\u202F',
    kind: 'insert',
    name: 'Narrow No-Break Space',
    code: 'U+202F',
    description: 'Narrower non-breaking space. Good for units.',
    example: '10\u202Fkg'
  },
  {
    id: 'ls',
    label: 'LS',
    insert: '\u2028',
    kind: 'insert',
    name: 'Line Separator',
    code: 'U+2028',
    description: 'Unicode line break character. Keeps selection untouched.',
    example: 'Acts like a line break: first\u2028second'
  },
  {
    id: 'ps',
    label: 'PS',
    insert: '\u2029',
    kind: 'insert',
    name: 'Paragraph Separator',
    code: 'U+2029',
    description: 'Paragraph break control character.',
    example: 'Separates paragraphs in some layouts.'
  },
  {
    id: 'shy',
    label: 'SHY',
    insert: '\u00AD',
    kind: 'insert',
    name: 'Soft Hyphen',
    code: 'U+00AD',
    description: 'Optional hyphen that appears only when a line breaks.',
    example: 'hyphen\u00ADation shows a hyphen at breaks'
  },
  {
    id: 'zwsp',
    label: 'ZWSP',
    insert: '\u200B',
    kind: 'insert',
    name: 'Zero Width Space',
    code: 'U+200B',
    description: 'Invisible break opportunity without a visible space. Does not replace selection.',
    example: 'Place between words to allow wrapping without a space.'
  },
  {
    id: 'keycap',
    label: 'Keycap',
    insert: '\u20E3',
    kind: 'suffix',
    name: 'Keycap Combining Mark',
    code: 'Digit/*/# + U+20E3',
    description: 'Select a digit, #, or * then click to append the enclosing keycap mark. Without a selection it inserts the mark by itself.',
    example: 'Select "1" then click Keycap to get 1️⃣'
  },
  {
    id: 'flag',
    label: 'RI Pair',
    insert: '\u{1F1FA}\u{1F1F8}',
    kind: 'insert',
    name: 'Regional Indicator Pair',
    code: 'U+1F1FA U+1F1F8',
    description: 'Regional indicators combine in pairs to form flags. Select two letters (A-Z) and type their indicators for a flag; click inserts 🇺🇸 as an example.',
    example: '🇺🇸 is U+1F1FA U+1F1F8. Pair any two indicators.'
  }
];

// ==========================================
// Unicode formatting pane
// ==========================================
const baseUpper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const baseLower = 'abcdefghijklmnopqrstuvwxyz';
const baseDigits = '0123456789';
const wordPattern = /[\p{L}\p{N}]+/gu;

function isLetter(char) {
  return /\p{L}/u.test(char);
}

function isUpper(char) {
  return isLetter(char) && char === char.toUpperCase() && char !== char.toLowerCase();
}

function isLower(char) {
  return isLetter(char) && char === char.toLowerCase() && char !== char.toUpperCase();
}

function isDigit(char) {
  return /\p{N}/u.test(char);
}

function splitWords(line) {
  wordPattern.lastIndex = 0;
  const words = [];
  let match;
  while ((match = wordPattern.exec(line)) !== null) {
    words.push(match[0]);
  }
  return words;
}

function transformLines(text, transformer) {
  const lines = text.split('\n');
  return lines.map(transformer).join('\n');
}

function capitalizeWord(word) {
  if (!word) return '';
  const [first, ...rest] = Array.from(word);
  return first.toUpperCase() + rest.join('').toLowerCase();
}

function toNormalText(text) {
  return transformLines(text, (line) => {
    if (!line) return line;
    let working = line.replace(/[_-]+/g, ' ');
    let result = '';
    for (let i = 0; i < working.length; i += 1) {
      const current = working[i];
      const next = working[i + 1];
      const nextNext = working[i + 2];
      result += current;
      if (!next) continue;
      const boundary =
        (isLower(current) && isUpper(next)) ||
        (isUpper(current) && isUpper(next) && nextNext && isLower(nextNext)) ||
        (isDigit(current) && isLetter(next));
      if (boundary) {
        result += ' ';
      }
    }
    result = result.replace(/\s+/g, ' ').trim();
    if (!result) return result;
    const words = result.split(' ');
    const normalized = words.map(word => {
      if (/^\p{L}+$/u.test(word) && word === word.toUpperCase()) {
        return word;
      }
      return word.toLowerCase();
    }).join(' ');
    // If nothing changed, keep the original line to avoid unwanted splits.
    return normalized || line;
  });
}

function toSnakeCase(text) {
  return transformLines(text, (line) => {
    const words = splitWords(line);
    if (!words.length) return line;
    return words.map(w => w.toLowerCase()).join('_');
  });
}

function toKebabCase(text) {
  return transformLines(text, (line) => {
    const words = splitWords(line);
    if (!words.length) return line;
    return words.map(w => w.toLowerCase()).join('-');
  });
}

function toCamelCase(text) {
  return transformLines(text, (line) => {
    const words = splitWords(line);
    if (!words.length) return line;
    const lowered = words.map(w => w.toLowerCase());
    return lowered.map((word, idx) => (idx === 0 ? word : capitalizeWord(word))).join('');
  });
}

function toPascalCase(text) {
  return transformLines(text, (line) => {
    const words = splitWords(line);
    if (!words.length) return line;
    return words.map(w => capitalizeWord(w.toLowerCase())).join('');
  });
}

function toTitleCase(text) {
  const normalized = toNormalText(text);
  return normalized.split('\n').map(line => {
    if (!line) return line;
    const words = line.split(/\s+/);
    if (!words.length) return line;
    return words.map(word => capitalizeWord(word)).join(' ');
  }).join('\n');
}

function createAlphabetMap(styledUpper, styledLower, styledDigits = '') {
  const map = {};
  const upperChars = Array.from(styledUpper);
  const lowerChars = Array.from(styledLower);
  const digitChars = Array.from(styledDigits);
  baseUpper.split('').forEach((char, index) => {
    if (upperChars[index]) map[char] = upperChars[index];
  });
  baseLower.split('').forEach((char, index) => {
    if (lowerChars[index]) map[char] = lowerChars[index];
  });
  baseDigits.split('').forEach((char, index) => {
    if (digitChars[index]) map[char] = digitChars[index];
  });
  return map;
}

function createSmallCapsMap() {
  const lookup = {
    a: 'ᴀ',
    b: 'ʙ',
    c: 'ᴄ',
    d: 'ᴅ',
    e: 'ᴇ',
    f: 'ꜰ',
    g: 'ɢ',
    h: 'ʜ',
    i: 'ɪ',
    j: 'ᴊ',
    k: 'ᴋ',
    l: 'ʟ',
    m: 'ᴍ',
    n: 'ɴ',
    o: 'ᴏ',
    p: 'ᴘ',
    q: 'ꝗ',
    r: 'ʀ',
    s: 'ꜱ',
    t: 'ᴛ',
    u: 'ᴜ',
    v: 'ᴠ',
    w: 'ᴡ',
    x: 'ˣ',
    y: 'ʏ',
    z: 'ᴢ'
  };
  const map = {};
  baseLower.split('').forEach((char, index) => {
    const styled = lookup[char] || char.toUpperCase();
    map[char] = styled;
    map[baseUpper[index]] = styled;
  });
  return map;
}

const formattingStyles = [
  {
    id: 'bold',
    name: 'Bold',
    kind: 'alphabet',
    group: 'unicode',
    map: createAlphabetMap(
      '𝐀𝐁𝐂𝐃𝐄𝐅𝐆𝐇𝐈𝐉𝐊𝐋𝐌𝐍𝐎𝐏𝐐𝐑𝐒𝐓𝐔𝐕𝐖𝐗𝐘𝐙',
      '𝐚𝐛𝐜𝐝𝐞𝐟𝐠𝐡𝐢𝐣𝐤𝐥𝐦𝐧𝐨𝐩𝐪𝐫𝐬𝐭𝐮𝐯𝐰𝐱𝐲𝐳',
      '𝟎𝟏𝟐𝟑𝟒𝟓𝟔𝟕𝟖𝟗'
    )
  },
  {
    id: 'italic',
    name: 'Italic',
    kind: 'alphabet',
    group: 'unicode',
    map: createAlphabetMap(
      '𝐴𝐵𝐶𝐷𝐸𝐹𝐺𝐻𝐼𝐽𝐾𝐿𝑀𝑁𝑂𝑃𝑄𝑅𝑆𝑇𝑈𝑉𝑊𝑋𝑌𝑍',
      '𝑎𝑏𝑐𝑑𝑒𝑓𝑔ℎ𝑖𝑗𝑘𝑙𝑚𝑛𝑜𝑝𝑞𝑟𝑠𝑡𝑢𝑣𝑤𝑥𝑦𝑧'
    )
  },
  {
    id: 'bold-italic',
    name: 'Bold Italic',
    kind: 'alphabet',
    group: 'unicode',
    map: createAlphabetMap(
      '𝑨𝑩𝑪𝑫𝑬𝑭𝑮𝑯𝑰𝑱𝑲𝑳𝑴𝑵𝑶𝑷𝑸𝑹𝑺𝑻𝑼𝑽𝑾𝑿𝒀𝒁',
      '𝒂𝒃𝒄𝒅𝒆𝒇𝒈𝒉𝒊𝒋𝒌𝒍𝒎𝒏𝒐𝒑𝒒𝒓𝒔𝒕𝒖𝒗𝒘𝒙𝒚𝒛'
    )
  },
  {
    id: 'bold-sans',
    name: 'Bold Sans',
    kind: 'alphabet',
    group: 'unicode',
    map: createAlphabetMap(
      '𝗔𝗕𝗖𝗗𝗘𝗙𝗚𝗛𝗜𝗝𝗞𝗟𝗠𝗡𝗢𝗣𝗤𝗥𝗦𝗧𝗨𝗩𝗪𝗫𝗬𝗭',
      '𝗮𝗯𝗰𝗱𝗲𝗳𝗴𝗵𝗶𝗷𝗸𝗹𝗺𝗻𝗼𝗽𝗾𝗿𝘀𝘁𝘂𝘃𝘄𝘅𝘆𝘇',
      '𝟬𝟭𝟮𝟯𝟰𝟱𝟲𝟳𝟴𝟵'
    )
  },
  {
    id: 'monospace',
    name: 'Monospace',
    kind: 'alphabet',
    group: 'unicode',
    map: createAlphabetMap(
      '𝙰𝙱𝙲𝙳𝙴𝙵𝙶𝙷𝙸𝙹𝙺𝙻𝙼𝙽𝙾𝙿𝚀𝚁𝚂𝚃𝚄𝚅𝚆𝚇𝚈𝚉',
      '𝚊𝚋𝚌𝚍𝚎𝚏𝚐𝚑𝚒𝚓𝚔𝚕𝚖𝚗𝚘𝚙𝚚𝚛𝚜𝚝𝚞𝚟𝚠𝚡𝚢𝚣',
      '𝟶𝟷𝟸𝟹𝟺𝟻𝟼𝟽𝟾𝟿'
    )
  },
  {
    id: 'double-struck',
    name: 'Double Struck',
    kind: 'alphabet',
    group: 'unicode',
    map: createAlphabetMap(
      '𝔸𝔹ℂ𝔻𝔼𝔽𝔾ℍ𝕀𝕁𝕂𝕃𝕄ℕ𝕆ℙℚℝ𝕊𝕋𝕌𝕍𝕎𝕏𝕐ℤ',
      '𝕒𝕓𝕔𝕕𝕖𝕗𝕘𝕙𝕚𝕛𝕜𝕝𝕞𝕟𝕠𝕡𝕢𝕣𝕤𝕥𝕦𝕧𝕨𝕩𝕪𝕫',
      '𝟘𝟙𝟚𝟛𝟜𝟝𝟞𝟟𝟠𝟡'
    )
  },
  {
    id: 'script',
    name: 'Script',
    kind: 'alphabet',
    group: 'unicode',
    map: createAlphabetMap(
      '𝒜ℬ𝒞𝒟ℰℱ𝒢ℋℐ𝒥𝒦ℒℳ𝒩𝒪𝒫𝒬ℛ𝒮𝒯𝒰𝒱𝒲𝒳𝒴𝒵',
      '𝒶𝒷𝒸𝒹ℯ𝒻𝓰𝒽𝒾𝒿𝓀𝓁𝓂𝓃𝑜𝓅𝓆𝓇𝓈𝓉𝓊𝓋𝓌𝓍𝓎𝓏'
    )
  },
  {
    id: 'small-caps',
    name: 'Small Caps',
    kind: 'alphabet',
    group: 'unicode',
    map: createSmallCapsMap()
  },
  {
    id: 'underline',
    name: 'Underline',
    kind: 'combining',
    group: 'unicode',
    combining: '\u0332'
  },
  {
    id: 'strikethrough',
    name: 'Strikethrough',
    kind: 'combining',
    group: 'unicode',
    combining: '\u0336'
  },
  {
    id: 'plain',
    name: 'Plain',
    kind: 'plain',
    group: 'unicode'
  },
  {
    id: 'normal-text',
    name: 'normal text',
    label: 'normal text',
    group: 'case',
    tooltip: 'WhereAreMySocks → where are my socks (selection only)',
    handler: (text) => toNormalText(text)
  },
  {
    id: 'snake-case',
    name: 'snake_case',
    label: 'snake_case',
    group: 'case',
    tooltip: 'Where are my socks → where_are_my_socks',
    handler: (text) => toSnakeCase(text)
  },
  {
    id: 'kebab-case',
    name: 'kebab-case',
    label: 'kebab-case',
    group: 'case',
    tooltip: 'Where are my socks → where-are-my-socks',
    handler: (text) => toKebabCase(text)
  },
  {
    id: 'camel-case',
    name: 'camelCase',
    label: 'camelCase',
    group: 'case',
    tooltip: 'where are my socks → whereAreMySocks',
    handler: (text) => toCamelCase(text)
  },
  {
    id: 'pascal-case',
    name: 'PascalCase',
    label: 'PascalCase',
    group: 'case',
    tooltip: 'hello pascal → HelloPascal',
    handler: (text) => toPascalCase(text)
  },
  {
    id: 'title-case',
    name: 'Title Case',
    label: 'Title Case',
    group: 'case',
    tooltip: 'where_are_my_socks → Where Are My Socks',
    handler: (text) => toTitleCase(text)
  },
  {
    id: 'upper-case',
    name: 'UPPERCASE',
    label: 'UPPERCASE',
    group: 'case',
    tooltip: 'snake_case → SNAKE_CASE',
    handler: (text) => text.toUpperCase()
  },
  {
    id: 'lower-case',
    name: 'lowercase',
    label: 'lowercase',
    group: 'case',
    tooltip: 'HelloWorld → helloworld',
    handler: (text) => text.toLowerCase()
  }
];

const reverseFormatLookup = {};
formattingStyles.forEach(style => {
  if (!style.map) return;
  Object.entries(style.map).forEach(([baseChar, styledChar]) => {
    if (!reverseFormatLookup[styledChar]) {
      reverseFormatLookup[styledChar] = baseChar;
    }
  });
});

function formatWithMap(text, map) {
  let result = '';
  for (const char of text) {
    result += map[char] || char;
  }
  return result;
}

function applyCombiningMarks(text, combiningChar) {
  let result = '';
  for (const char of text) {
    if (char === '\n' || char === '\r') {
      result += char;
      continue;
    }
    if (/\s/.test(char)) {
      result += char;
      continue;
    }
    result += char + combiningChar;
  }
  return result;
}

function stripCombiningMarks(text) {
  return text.replace(/[\u0332\u0336]/g, '');
}

function formatToPlain(text) {
  const cleaned = stripCombiningMarks(text);
  let result = '';
  for (const char of cleaned) {
    result += reverseFormatLookup[char] || char;
  }
  return result;
}

function transformSelection(transformer) {
  const start = paper.selectionStart;
  const end = paper.selectionEnd;
  if (start === end) {
    showStatus('Select text on the paper to format.');
    updateFormattingButtonsState();
    paper.focus();
    return;
  }
  const before = paper.value.substring(0, start);
  const target = paper.value.substring(start, end);
  const after = paper.value.substring(end);
  const replacement = transformer(target);
  paper.value = before + replacement + after;
  paper.selectionStart = start;
  paper.selectionEnd = start + replacement.length;
  updateLineNumbers();
  updateFormattingButtonsState();
  paper.focus();
  playKeySound();
}

function applyFormatting(styleId) {
  const style = formattingStyles.find(item => item.id === styleId);
  if (!style) return;

  let transformer = null;
  if (style.handler) {
    transformer = style.handler;
  } else if (style.kind === 'alphabet') {
    transformer = (text) => formatWithMap(text, style.map);
  } else if (style.kind === 'combining') {
    transformer = (text) => applyCombiningMarks(text, style.combining);
  } else if (style.kind === 'plain') {
    transformer = (text) => formatToPlain(text);
  }

  if (!transformer) return;
  transformSelection(transformer);
}

function formattingLabel(style) {
  const sample = style.label || style.preview || style.name;
  if (style.kind === 'alphabet') return formatWithMap(sample, style.map);
  if (style.kind === 'combining') return applyCombiningMarks(sample, style.combining);
  if (style.kind === 'plain') return sample;
  return sample;
}

function renderFormattingPane() {
  if (!formattingButtonsContainer) return;
  formattingButtonsContainer.innerHTML = '';
  const groups = [
    { id: 'unicode', title: 'Unicode styles' },
    { id: 'case', title: 'Case helpers' }
  ];

  groups.forEach(group => {
    const styles = formattingStyles.filter(style => style.group === group.id);
    if (!styles.length) return;
    const header = document.createElement('div');
    header.className = 'formatting-group-title';
    header.textContent = group.title;
    formattingButtonsContainer.appendChild(header);

    styles.forEach(style => {
      const btn = document.createElement('button');
      btn.className = 'formatting-btn';
      btn.type = 'button';
      btn.dataset.styleId = style.id;
      btn.setAttribute('aria-label', `${style.name} formatting`);
      if (style.tooltip) {
        btn.title = `${style.tooltip} (select text first)`;
      } else {
        btn.title = 'Works on selected text';
      }
      const label = formattingLabel(style);
      btn.innerHTML = `<div class="formatting-label">${label}</div><small>${style.name}</small>`;
      btn.addEventListener('click', () => applyFormatting(style.id));
      formattingButtonsContainer.appendChild(btn);
    });
  });
  updateFormattingButtonsState();
}

function updateFormattingButtonsState() {
  if (!formattingButtonsContainer) return;
  const disabled = paper.selectionStart === paper.selectionEnd;
  const buttons = Array.from(formattingButtonsContainer.querySelectorAll('.formatting-btn'));
  buttons.forEach(btn => {
    btn.classList.toggle('disabled', disabled);
    btn.setAttribute('aria-disabled', disabled ? 'true' : 'false');
  });
}

function resetHelpPane() {
  helpName.textContent = 'Select a control to see details';
  helpCode.textContent = 'U+—';
  helpDescription.textContent = 'Unicode controls insert invisible helpers. Select text first when you want wrapping or suffix behavior.';
  helpExample.textContent = 'Hover a control to preview, then click to insert. Wrapping controls will wrap selected text.';
}

function showControlHelp(controlId) {
  const control = unicodeControls.find(item => item.id === controlId);
  if (!control) return;
  helpName.textContent = control.name;
  helpCode.textContent = control.code;
  helpDescription.textContent = control.description;
  helpExample.textContent = control.example;
}

function showEmojiHelp(emoji) {
  const entry = emojiLookup.get(emoji);
  if (!entry) return;
  helpName.textContent = entry.label;
  helpCode.textContent = `U+${entry.hexcode}`;
  helpDescription.textContent = 'Click to insert emoji at the cursor. Search filters the lower rows; recents stay pinned on top.';
  helpExample.textContent = `${emoji}  tags: ${entry.tags ? entry.tags.join(', ') : 'emoji'}`;
}

// ==========================================
// Unicode controls rendering and behavior
// ==========================================
function applyControl(control) {
  if (!control) return;
  const selectionText = paper.value.substring(paper.selectionStart, paper.selectionEnd);

  if (control.kind === 'wrap') {
    if (selectionText.length > 0) {
      const wrapped = `${control.insert}${selectionText}${control.closing || ''}`;
      insertAtCursor(wrapped);
    } else {
      insertAtCursor(control.insert + (control.closing ? control.closing : ''));
    }
    playKeySound();
    return;
  }

  if (control.kind === 'suffix') {
    if (selectionText.length > 0) {
      insertAtCursor(selectionText + control.insert);
    } else {
      insertAtCursor(control.insert);
    }
    playKeySound();
    return;
  }

  // insert kind: do not replace selection, just insert after it
  const hadSelection = selectionText.length > 0;
  insertAtCursor(control.insert, { replaceSelection: !hadSelection });
  if (hadSelection) {
    showStatus('Inserted control without replacing your selection (invisible mark).');
  }
  playKeySound();
}

function renderUnicodeGrid() {
  if (!unicodeGrid) return;
  unicodeGrid.innerHTML = '';
  unicodeControls.forEach(control => {
    const btn = document.createElement('button');
    btn.className = 'control-chip';
    btn.type = 'button';
    btn.setAttribute('data-control-id', control.id);
    btn.innerHTML = `<strong>${control.label}</strong><small>${control.name}</small>`;
    btn.addEventListener('mouseenter', () => showControlHelp(control.id));
    btn.addEventListener('focus', () => showControlHelp(control.id));
    btn.addEventListener('click', () => {
      applyControl(control);
      showControlHelp(control.id);
    });
    unicodeGrid.appendChild(btn);
  });
}

// ==========================================
// Mode rendering (emoji keyboard only)
// ==========================================
function renderPalette() {
  resetAllKeycaps();
  renderRecents();
  renderEmojiPalette();
}

// ==========================================
// Key interactions
// ==========================================
function handleKeycapPress(cap) {
  const role = cap.rect.dataset.role;
  const value = cap.rect.dataset.value;
  if (!role || role === 'inactive') return;

  cap.rect.classList.add('active');
  initAudioContext();

  if (role === 'emoji' || role === 'recent-emoji') {
    insertAtCursor(value);
    playKeySound();
    updateRecents(value);
    renderRecents();
  } else if (role === 'page') {
    emojiPage += 1;
    const capacity = Math.max(1, Math.ceil(currentEmojiResults.length / paletteSlots.length));
    if (emojiPage >= capacity) emojiPage = 0;
    renderEmojiPalette();
  } else if (role === 'shuffle') {
    emojiPage = 0;
    renderEmojiPalette();
  } else if (role === 'clear-search') {
    searchQuery = '';
    searchInput.value = '';
    emojiPage = 0;
    renderEmojiPalette();
  }

  paper.focus();
}

function handleKeycapHover(cap) {
  const role = cap.rect.dataset.role;
  if ((role === 'emoji' || role === 'recent-emoji') && cap.rect.dataset.value) {
    showEmojiHelp(cap.rect.dataset.value);
  }
}

keycaps.forEach(cap => {
  cap.rect.addEventListener('mousedown', () => handleKeycapPress(cap));
  cap.rect.addEventListener('mouseup', () => cap.rect.classList.remove('active'));
  cap.rect.addEventListener('mouseleave', () => cap.rect.classList.remove('active'));
  cap.rect.addEventListener('mouseenter', () => handleKeycapHover(cap));
  cap.rect.addEventListener('contextmenu', e => e.preventDefault());
});

// ==========================================
// Paper + keyboard event wiring
// ==========================================
document.addEventListener('keydown', (e) => {
  initAudioContext();
  const key = e.key;
  highlightKey(key);

  if (key === 'Enter') {
    e.preventDefault();
    handleEnter();
  } else if (key === 'Tab') {
    e.preventDefault();
    handleTab();
  } else if (key === 'Backspace') {
    playKeySound();
  } else if (key.length === 1) {
    playKeySound();
  }
});

document.addEventListener('keyup', (e) => {
  unhighlightKey(e.key);
});

paper.addEventListener('input', updateLineNumbers);
paper.addEventListener('scroll', updateLineNumbers);
paper.addEventListener('select', updateFormattingButtonsState);
paper.addEventListener('keyup', () => updateFormattingButtonsState());
paper.addEventListener('mouseup', () => setTimeout(updateFormattingButtonsState, 0));

// ==========================================
// Controls
// ==========================================
soundSelect.addEventListener('change', (e) => {
  currentProfile = e.target.value;
  initAudioContext();
  playKeySound(currentProfile);
});

volumeButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    volumeLevel = btn.dataset.volume;
    volumeButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    initAudioContext();
    playKeySound();
  });
});

let searchTimeout = null;
if (searchInput) {
  searchInput.addEventListener('input', (e) => {
    const value = e.target.value;
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      searchQuery = value;
      emojiPage = 0;
      renderEmojiPalette();
    }, 200);
  });
}

// ==========================================
// Init
// ==========================================
window.addEventListener('load', () => {
  recentEmojis = loadFromLocalStorage(RECENT_KEY) || [];
  paper.focus();
  updateLineNumbers();
  renderPalette();
  renderUnicodeGrid();
  renderFormattingPane();
});

// Touch support
if ('ontouchstart' in window) {
  keycaps.forEach(cap => {
    cap.rect.addEventListener('touchstart', (e) => {
      e.preventDefault();
      handleKeycapPress(cap);
    });
    cap.rect.addEventListener('touchend', (e) => {
      e.preventDefault();
      cap.rect.classList.remove('active');
    });
  });
}

console.log('✨ Emoji Typewriter ready');
