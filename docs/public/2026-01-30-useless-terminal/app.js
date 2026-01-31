const output = document.getElementById('output');
const viewport = document.getElementById('viewport');
const inputLine = document.getElementById('inputLine');
const promptEl = document.getElementById('prompt');
const input = document.getElementById('cmdInput');
const measure = document.getElementById('inputMeasure');
const cursor = document.getElementById('cursor');
const shellSelect = document.getElementById('shellSelect');
const newOutput = document.getElementById('newOutput');
const terminal = document.getElementById('terminal');

const MAX_LINES = 400;
const sessionStart = Date.now();

const state = {
  shell: 'powershell',
  history: [],
  historyIndex: -1,
  busy: false
};

const PROMPT_HTML = {
  powershell:
    '<span class="prompt__accent">PS</span> <span class="prompt__path">C:\\Users\\operator</span><span class="prompt__glyph">&gt;</span>&nbsp;',
  bash:
    '<span class="prompt__accent">operator@localhost</span>:<span class="prompt__path">~</span><span class="prompt__glyph">$</span>&nbsp;'
};

const BANNERS = {
  powershell: [
    'Initializing terminal subsystem... OK',
    'Negotiating session parameters... OK',
    'Loading profile: operator (read-only)',
    'GLOBAL POWERSHELL INTERFACE',
    'Connected. Type "help" for guidance.'
  ],
  bash: [
    'Initializing terminal subsystem... OK',
    'Negotiating session parameters... OK',
    'Loading profile: operator (read-only)',
    'GLOBAL SHELL CONSOLE',
    'Connected. Type "help" for guidance.'
  ]
};

const ERROR_TEMPLATES = [
  {
    id: 'E01_PS_UNRECOGNIZED_CMDLET',
    shell: 'powershell',
    weight: 8,
    hints: ['default'],
    lines: [
      "{{cmd}} : The term '{{cmd}}' is not recognized as the name of a cmdlet, function, script file, or operable program.",
      'At line:1 char:1',
      '+ {{input}}',
      '+ ~~~~',
      'FullyQualifiedErrorId : CommandNotFoundException'
    ]
  },
  {
    id: 'E02_BASH_CMD_NOT_FOUND',
    shell: 'bash',
    weight: 8,
    hints: ['default'],
    lines: ['bash: {{cmd}}: command not found']
  },
  {
    id: 'E03_PS_INVALID_PARAMETER',
    shell: 'powershell',
    weight: 7,
    hints: ['flags'],
    lines: [
      "{{cmd}} : A parameter cannot be found that matches parameter name '{{flag}}'.",
      'At line:1 char:1',
      '+ {{input}}',
      '+ ~~~~',
      'FullyQualifiedErrorId : NamedParameterNotFound'
    ]
  },
  {
    id: 'E04_BASH_INVALID_OPTION',
    shell: 'bash',
    weight: 7,
    hints: ['flags'],
    lines: [
      "{{cmd}}: invalid option -- '{{flagShort}}'",
      "Try '{{cmd}} --help' for more information."
    ]
  },
  {
    id: 'E05_PS_PIPELINE_BINDING',
    shell: 'powershell',
    weight: 6,
    hints: ['pipe'],
    lines: [
      "{{cmd}} : Cannot bind pipeline input to parameter '{{param}}' because it is null or empty.",
      'CategoryInfo : InvalidData: (:) [], ParameterBindingValidationException',
      'FullyQualifiedErrorId : ParameterArgumentValidationErrorNullNotAllowed'
    ]
  },
  {
    id: 'E06_BASH_PIPE_BROKEN',
    shell: 'bash',
    weight: 6,
    hints: ['pipe'],
    lines: ['{{cmd}}: write error: Broken pipe', 'hint: your pipeline achieved enlightenment and left early']
  },
  {
    id: 'E07_PS_ACCESS_DENIED',
    shell: 'powershell',
    weight: 6,
    hints: ['path'],
    lines: [
      "Access to the path '{{path}}' is denied.",
      'At line:1 char:1',
      '+ {{input}}',
      '+ ~~~~',
      'FullyQualifiedErrorId : UnauthorizedAccessException'
    ]
  },
  {
    id: 'E08_BASH_NO_SUCH_FILE',
    shell: 'bash',
    weight: 6,
    hints: ['path'],
    lines: ['{{cmd}}: {{path}}: No such file or directory']
  },
  {
    id: 'E09_PS_FORMAT_EXCEPTION',
    shell: 'powershell',
    weight: 5,
    hints: ['numbers'],
    lines: [
      "Input string '{{number}}' was not in a correct format.",
      'CategoryInfo : InvalidOperation: (:) [], FormatException',
      'FullyQualifiedErrorId : FormatException'
    ]
  },
  {
    id: 'E10_BASH_NUMERIC_RANGE',
    shell: 'bash',
    weight: 5,
    hints: ['numbers'],
    lines: ['{{cmd}}: value "{{number}}" out of range', 'exit status 2']
  },
  {
    id: 'E11_PS_MODULE_NOT_LOADED',
    shell: 'powershell',
    weight: 5,
    hints: ['default'],
    lines: [
      "Import-Module : The specified module '{{cmd}}' was not loaded because no valid module file was found in any module directory.",
      'FullyQualifiedErrorId : Modules_ModuleNotFound'
    ]
  },
  {
    id: 'E12_BASH_PERMISSION_DENIED',
    shell: 'bash',
    weight: 5,
    hints: ['path'],
    lines: ['bash: {{path}}: Permission denied']
  },
  {
    id: 'E13_PS_DNS_RESOLUTION',
    shell: 'powershell',
    weight: 4,
    hints: ['network'],
    lines: [
      "{{cmd}} : NameResolutionFailure: The remote name could not be resolved: '{{host}}'",
      'FullyQualifiedErrorId : WebCmdletWebResponseException'
    ]
  },
  {
    id: 'E14_BASH_COULD_NOT_RESOLVE_HOST',
    shell: 'bash',
    weight: 4,
    hints: ['network'],
    lines: ['{{cmd}}: (6) Could not resolve host: {{host}}']
  },
  {
    id: 'E15_PS_SYNTAX_UNEXPECTED_TOKEN',
    shell: 'powershell',
    weight: 4,
    hints: ['redirect'],
    lines: [
      "ParserError: Unexpected token '{{token}}' in expression or statement.",
      'At line:1 char:{{charPos}}',
      '+ {{input}}',
      '+ ~~~~'
    ]
  },
  {
    id: 'E16_BASH_AMBIGUOUS_REDIRECT',
    shell: 'bash',
    weight: 4,
    hints: ['redirect'],
    lines: ['bash: {{token}}: ambiguous redirect']
  },
  {
    id: 'E17_PS_OBJECT_NOT_FOUND',
    shell: 'powershell',
    weight: 4,
    hints: ['path'],
    lines: [
      "Get-Item : Cannot find path '{{path}}' because it does not exist.",
      'FullyQualifiedErrorId : PathNotFound'
    ]
  },
  {
    id: 'E18_BASH_NOT_A_DIRECTORY',
    shell: 'bash',
    weight: 4,
    hints: ['path'],
    lines: ['{{cmd}}: {{path}}: Not a directory']
  },
  {
    id: 'E19_PS_TIMEOUT',
    shell: 'powershell',
    weight: 3,
    hints: ['network', 'default'],
    lines: ['OperationStopped: The operation has timed out.', 'FullyQualifiedErrorId : TimeoutException,{{cmd}}']
  },
  {
    id: 'E20_BASH_TIMED_OUT',
    shell: 'bash',
    weight: 3,
    hints: ['network', 'default'],
    lines: ['{{cmd}}: Operation timed out', 'exit status 124']
  },
  {
    id: 'E21_PS_POLICY_BLOCKED',
    shell: 'powershell',
    weight: 3,
    hints: ['default'],
    lines: [
      'File {{pathOrCmd}} cannot be loaded because running scripts is disabled on this system.',
      'For more information, see about_Execution_Policies.',
      'FullyQualifiedErrorId : UnauthorizedAccess'
    ]
  },
  {
    id: 'E22_BASH_SYNTAX_ERROR_NEAR',
    shell: 'bash',
    weight: 3,
    hints: ['redirect', 'pipe'],
    lines: ["bash: syntax error near unexpected token '{{token}}'"]
  }
];

const HUMOR_LINES = [
  { id: 'H01', weight: 6, text: 'Suggestion: consider a break. Your command will still fail later.' },
  { id: 'H02', weight: 5, text: 'That did not work. On the bright side, neither did anything else today.' },
  { id: 'H03', weight: 5, text: 'If you stare at the cursor long enough, it will blink in empathy.' },
  { id: 'H04', weight: 5, text: 'Maybe the real output was the friends you did not ping along the way.' },
  { id: 'H05', weight: 4, when: 'late', text: 'It is after {{time}}. This is a strong case for logging off.' },
  { id: 'H06', weight: 4, when: 'early', text: 'Before {{time}} is a bold time to argue with a terminal.' },
  { id: 'H07', weight: 6, when: 'friday', text: 'It is Friday. Your weekend is attempting to connect.' },
  { id: 'H08', weight: 6, when: 'weekend', text: 'It is the weekend. This command requests that you go outside.' },
  { id: 'H09', weight: 4, when: 'holidaySoon', text: 'Reminder: {{holiday}} is coming up. This is not mandatory productivity season.' },
  { id: 'H10', weight: 4, text: 'Have you tried turning your ambition off and on again?' },
  { id: 'H11', weight: 4, text: 'Error acknowledged. Motivation not found.' },
  { id: 'H12', weight: 4, text: "This system is read-only, like your group chat when you mention 'refactor'." },
  { id: 'H13', weight: 3, text: 'I parsed your input and concluded you deserve snacks.' },
  { id: 'H14', weight: 3, text: 'Your command contained {{keyword}}. I recommend a walk instead.' },
  { id: 'H15', weight: 3, text: 'If this is important, consider writing it down and ignoring it for 20 minutes.' },
  { id: 'H16', weight: 3, text: 'Fun fact: the cursor blinks at approximately the same rate as your patience.' },
  { id: 'H17', weight: 3, text: 'This is not a failure. It is a lifestyle choice.' },
  { id: 'H18', weight: 3, text: 'The terminal has spoken: no. The terminal is very confident.' },
  { id: 'H19', weight: 2, text: "Perhaps today is a 'minimum viable effort' kind of day." },
  { id: 'H20', weight: 2, text: 'If you need inspiration, try a hobby that does not support flags.' }
];

const HOLIDAYS = [
  { name: "New Year's Day", month: 0, day: 1 },
  { name: "Valentine's Day", month: 1, day: 14 },
  { name: 'Independence Day', month: 6, day: 4 },
  { name: 'Halloween', month: 9, day: 31 },
  { name: 'Christmas', month: 11, day: 25 }
];

function hashString(str) {
  let hash = 2166136261;
  for (let i = 0; i < str.length; i += 1) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function mulberry32(seed) {
  let t = seed >>> 0;
  return function random() {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), t | 1);
    r ^= r + Math.imul(r ^ (r >>> 7), r | 61);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function chooseWeighted(items, rng) {
  const total = items.reduce((sum, item) => sum + item.weight, 0);
  let roll = (rng ? rng() : Math.random()) * total;
  for (const item of items) {
    roll -= item.weight;
    if (roll <= 0) return item;
  }
  return items[items.length - 1];
}

function tokenize(inputValue) {
  const tokens = [];
  let current = '';
  let inQuote = false;
  let quoteChar = '';
  for (let i = 0; i < inputValue.length; i += 1) {
    const char = inputValue[i];
    if ((char === '"' || char === "'") && !inQuote) {
      inQuote = true;
      quoteChar = char;
      continue;
    }
    if (inQuote && char === quoteChar) {
      inQuote = false;
      quoteChar = '';
      continue;
    }
    if (!inQuote && /\s/.test(char)) {
      if (current) {
        tokens.push(current);
        current = '';
      }
      continue;
    }
    current += char;
  }
  if (current) tokens.push(current);
  return tokens;
}

function parseInput(raw) {
  const trimmed = raw.trim();
  const tokens = trimmed ? tokenize(trimmed) : [];
  const flags = tokens.filter((token) => token.startsWith('-') || token.startsWith('/'));
  const paths = tokens.filter((token) =>
    token.includes('/') ||
    token.includes('\\') ||
    /\.(txt|js|ps1|sh|json|yml|yaml|log)$/i.test(token)
  );
  const numericLiterals = tokens.filter((token) => /^\d+(\.\d+)?$/.test(token));
  const primaryCommand = tokens.find((token) => !token.startsWith('-') && !token.startsWith('/')) || '';
  const lower = trimmed.toLowerCase();

  return {
    raw,
    trimmed,
    tokens,
    flags,
    paths,
    numericLiterals,
    primaryCommand,
    hasPipe: raw.includes('|'),
    hasRedirect: raw.includes('>') || raw.includes('<'),
    looksLikeNetwork: /\b(http|ssh|scp|ping|curl|wget)\b/i.test(lower),
    lengthClass: trimmed.length > 60 ? 'long' : trimmed.length < 8 ? 'short' : 'medium'
  };
}

function getHints(parsed) {
  const hints = new Set();
  if (parsed.hasPipe) hints.add('pipe');
  if (parsed.hasRedirect) hints.add('redirect');
  if (parsed.flags.length) hints.add('flags');
  if (parsed.paths.length) hints.add('path');
  if (parsed.numericLiterals.length) hints.add('numbers');
  if (parsed.looksLikeNetwork) hints.add('network');
  if (!hints.size) hints.add('default');
  return hints;
}

function extractHost(tokens) {
  for (const token of tokens) {
    if (token.startsWith('http')) {
      try {
        const url = new URL(token);
        return url.hostname;
      } catch (err) {
        continue;
      }
    }
    if (/^[a-z0-9.-]+\.[a-z]{2,}$/i.test(token)) {
      return token;
    }
  }
  return 'example.invalid';
}

function pickTemplate(parsed, shell) {
  const rng = mulberry32(hashString(`${parsed.trimmed}|${shell}|${sessionStart}`));
  const hints = getHints(parsed);
  const candidates = ERROR_TEMPLATES.filter((template) => template.shell === shell).map((template) => {
    const matches = template.hints.some((hint) => hints.has(hint));
    const weight = template.weight * (matches ? 1.5 : template.hints.includes('default') ? 1 : 0.6);
    return { template, weight };
  });
  return chooseWeighted(candidates, rng).template;
}

function sanitizeKeyword(token) {
  const cleaned = token.replace(/[^a-z0-9]/gi, '');
  if (cleaned.length >= 2 && cleaned.length <= 12) return cleaned;
  return '';
}

function pickKeyword(parsed) {
  if (parsed.primaryCommand) {
    const keyword = sanitizeKeyword(parsed.primaryCommand);
    if (keyword) return keyword;
  }
  for (const token of parsed.tokens) {
    if (parsed.paths.includes(token)) continue;
    if (/^\d+$/.test(token)) continue;
    const keyword = sanitizeKeyword(token);
    if (keyword) return keyword;
  }
  return 'coffee';
}

function formatTime(now) {
  return now.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
}

function getUpcomingHoliday(now) {
  let best = null;
  for (const holiday of HOLIDAYS) {
    const year = now.getFullYear();
    const date = new Date(year, holiday.month, holiday.day);
    if (date < now) {
      date.setFullYear(year + 1);
    }
    const diffDays = Math.ceil((date - now) / (1000 * 60 * 60 * 24));
    if (diffDays <= 7 && diffDays >= 0) {
      if (!best || diffDays < best.diffDays) {
        best = { name: holiday.name, diffDays };
      }
    }
  }
  return best;
}

function pickHumorLine(parsed) {
  const now = new Date();
  const hour = now.getHours();
  const day = now.getDay();
  const holiday = getUpcomingHoliday(now);
  const context = {
    late: hour >= 18,
    early: hour < 9,
    friday: day === 5,
    weekend: day === 0 || day === 6,
    holidaySoon: Boolean(holiday)
  };

  const candidates = HUMOR_LINES.filter((line) => {
    if (!line.when) return true;
    return context[line.when];
  }).map((line) => ({ line, weight: line.weight }));

  const chosen = chooseWeighted(candidates);
  let text = chosen.line.text;

  if (text.includes('{{time}}')) {
    text = text.replace('{{time}}', formatTime(now));
  }
  if (text.includes('{{holiday}}') && holiday) {
    text = text.replace('{{holiday}}', holiday.name);
  }
  if (text.includes('{{keyword}}')) {
    text = text.replace('{{keyword}}', pickKeyword(parsed));
  }

  return text;
}

function fillTemplate(lines, parsed) {
  const rng = mulberry32(hashString(`${parsed.trimmed}|${state.shell}|${sessionStart}|template`));
  const cmd = parsed.primaryCommand || 'input';
  const flag = parsed.flags[0] || '--nope';
  const flagShort = flag.replace(/^[-/]+/, '').charAt(0) || 'x';
  const path = parsed.paths[0] || (state.shell === 'powershell' ? 'C:\\ghost\\file.txt' : '/dev/null');
  const number = parsed.numericLiterals[0] || '0';
  const token = parsed.tokens[0] || '<token>';
  const paramList = ['InputObject', 'Path', 'Filter', 'Name', 'Value'];
  const host = extractHost(parsed.tokens);
  const charPos = Math.floor(rng() * 20) + 1;
  const param = paramList[Math.floor(rng() * paramList.length)];
  const pathOrCmd = parsed.paths[0] || cmd;

  return lines.map((line) =>
    line
      .replace(/{{cmd}}/g, cmd)
      .replace(/{{input}}/g, parsed.trimmed)
      .replace(/{{flag}}/g, flag)
      .replace(/{{flagShort}}/g, flagShort)
      .replace(/{{path}}/g, path)
      .replace(/{{number}}/g, number)
      .replace(/{{token}}/g, token)
      .replace(/{{host}}/g, host)
      .replace(/{{charPos}}/g, String(charPos))
      .replace(/{{param}}/g, param)
      .replace(/{{pathOrCmd}}/g, pathOrCmd)
  );
}

function isHelpRequest(trimmed) {
  if (!trimmed) return false;
  const lower = trimmed.toLowerCase();
  if (lower === 'help' || lower === 'man' || trimmed === '/?') return true;
  if (lower.endsWith('--help')) return true;
  return false;
}

function buildHelpLines(shell) {
  const version = `${randomBetween(1, 4)}.${randomBetween(0, 9)}.${randomBetween(0, 9)}`;
  const header = `GLOBAL SHELL HELP SYSTEM v${version}`;
  const persona = shell === 'powershell' ? 'PowerShell persona' : 'Bash persona';

  return [
    header,
    '',
    'NAME',
    '  global-shell - universal interface abstraction layer',
    '',
    'SYNOPSIS',
    '  global-shell [command] [options] [--]',
    '',
    'DESCRIPTION',
    `  ${persona} is currently active for maximum compatibility.`,
    '  Commands are resolved by a deterministic ambiguity resolver.',
    '  Output is informational and should not be relied upon for information.',
    '  For more information, consult this help.',
    '',
    'OPTIONS',
    '  -a, --all            apply to all applicable items',
    '  -q, --quiet          silence non-essential confirmation',
    '  --strict             enforce relaxed constraints',
    '  --lenient            enforce strict constraints',
    '  --dry-run            simulate execution of a simulation',
    '  --force              request polite refusal with confidence',
    '  /?                   display this help payload',
    '',
    'NOTES',
    '  - Options are optional but required for predictable ambiguity.',
    '  - Output ordering is stable unless it is not.',
    '  - This guidance supersedes any guidance, including this line.',
    '  - Do not interpret the absence of results as results.',
    '',
    'EXAMPLES',
    '  global-shell --help',
    '  global-shell run --dry --wet',
    '  global-shell query /? --verbose',
    '  global-shell',
    '',
    'FOOTER',
    "  For additional guidance, type 'help'."
  ];
}

function updatePrompt() {
  promptEl.innerHTML = PROMPT_HTML[state.shell];
}

function appendLineElement(element) {
  const shouldStick = isAtBottom();
  output.appendChild(element);
  trimOutput(shouldStick);
  if (shouldStick) {
    scrollToBottom();
  } else {
    newOutput.classList.add('is-visible');
  }
}

function appendTextLine(text, className) {
  const line = document.createElement('div');
  line.className = `line ${className}`.trim();
  line.textContent = text;
  appendLineElement(line);
}

function appendPromptLine(text) {
  const line = document.createElement('div');
  line.className = 'line line--prompt';
  const promptSpan = document.createElement('span');
  promptSpan.className = 'prompt';
  promptSpan.innerHTML = PROMPT_HTML[state.shell];
  const inputSpan = document.createElement('span');
  inputSpan.className = 'prompt__input';
  inputSpan.textContent = text;
  line.append(promptSpan, inputSpan);
  appendLineElement(line);
}

function appendMultiLine(lines, firstClass, restClass) {
  lines.forEach((lineText, index) => {
    const lineClass = index === 0 ? firstClass : restClass || firstClass;
    appendTextLine(lineText, lineClass);
  });
}

function isAtBottom() {
  return viewport.scrollTop + viewport.clientHeight >= viewport.scrollHeight - 6;
}

function scrollToBottom() {
  viewport.scrollTop = viewport.scrollHeight;
  newOutput.classList.remove('is-visible');
}

function trimOutput(stickToBottom) {
  if (output.children.length <= MAX_LINES) return;
  const prevHeight = viewport.scrollHeight;
  while (output.children.length > MAX_LINES) {
    output.removeChild(output.firstChild);
  }
  if (!stickToBottom) {
    const newHeight = viewport.scrollHeight;
    viewport.scrollTop = Math.max(0, viewport.scrollTop - (prevHeight - newHeight));
  }
}

function updateCursor() {
  const value = input.value;
  const caret = input.selectionStart ?? value.length;
  const before = value.slice(0, caret).replace(/\s/g, '\u00a0');
  measure.textContent = before || '';
  const left = measure.offsetWidth - input.scrollLeft;
  cursor.style.transform = `translateX(${left}px)`;
  const hasSelection = input.selectionStart !== input.selectionEnd;
  cursor.classList.toggle('is-hidden', hasSelection || document.activeElement !== input);
}

function scheduleFocus() {
  requestAnimationFrame(() => {
    input.focus();
    updateCursor();
  });
}

function setBusy(isBusy) {
  state.busy = isBusy;
  input.disabled = isBusy;
  inputLine.classList.toggle('is-hidden', isBusy);
  if (!isBusy) {
    scheduleFocus();
  }
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function playBanner() {
  const lines = BANNERS[state.shell];
  for (const line of lines) {
    appendTextLine(line, 'line--banner');
    await wait(randomBetween(40, 120));
  }
  await wait(randomBetween(150, 300));
  setBusy(false);
}

async function playHelp(shell) {
  const lines = buildHelpLines(shell);
  for (const line of lines) {
    appendTextLine(line, 'line--help');
    await wait(randomBetween(25, 60));
  }
}

async function playErrorSequence(parsed) {
  if (!parsed.trimmed) {
    appendTextLine('Input contained no actionable tokens.', 'line--error');
    await wait(randomBetween(80, 180));
    appendTextLine(`note: ${pickHumorLine(parsed)}`, 'line--humor');
    return;
  }

  const template = pickTemplate(parsed, state.shell);
  const lines = fillTemplate(template.lines, parsed);
  appendMultiLine(lines, 'line--error', 'line--error-dim');
  await wait(randomBetween(80, 220));
  appendTextLine(`note: ${pickHumorLine(parsed)}`, 'line--humor');
}

async function handleSubmit() {
  if (state.busy) return;

  const raw = input.value;
  const trimmed = raw.trim();
  appendPromptLine(raw);
  if (raw) {
    state.history.push(raw);
    state.historyIndex = state.history.length;
  }
  input.value = '';
  updateCursor();

  setBusy(true);

  if (isHelpRequest(trimmed)) {
    await wait(randomBetween(80, 160));
    await playHelp(state.shell);
    await wait(randomBetween(80, 160));
    setBusy(false);
    return;
  }

  await wait(randomBetween(80, 180));
  const parsed = parseInput(raw);
  await playErrorSequence(parsed);
  await wait(randomBetween(80, 160));
  setBusy(false);
}

function handleHistory(direction) {
  if (!state.history.length) return;
  state.historyIndex += direction;
  if (state.historyIndex < 0) state.historyIndex = 0;
  if (state.historyIndex > state.history.length) state.historyIndex = state.history.length;

  if (state.historyIndex === state.history.length) {
    input.value = '';
  } else {
    input.value = state.history[state.historyIndex];
  }
  updateCursor();
}

function switchShell(value) {
  state.shell = value;
  document.body.classList.toggle('shell--powershell', value === 'powershell');
  document.body.classList.toggle('shell--bash', value === 'bash');
  updatePrompt();
  updateCursor();
  appendTextLine(`Persona loaded: ${value === 'powershell' ? 'PowerShell' : 'Bash'} (read-only).`, 'line--banner');
  scrollToBottom();
  if (!state.busy) {
    scheduleFocus();
  }
}

function handleReducedEffectsToggle() {
  document.body.classList.toggle('reduced-effects');
}

function initReducedMotion() {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (prefersReduced.matches) {
    document.body.classList.add('reduced-effects');
  }
  prefersReduced.addEventListener('change', (event) => {
    document.body.classList.toggle('reduced-effects', event.matches);
  });
}

input.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    event.preventDefault();
    handleSubmit();
  } else if (event.key === 'ArrowUp') {
    event.preventDefault();
    handleHistory(-1);
  } else if (event.key === 'ArrowDown') {
    event.preventDefault();
    handleHistory(1);
  }
});

input.addEventListener('input', updateCursor);
input.addEventListener('click', updateCursor);
input.addEventListener('keyup', updateCursor);
input.addEventListener('scroll', updateCursor);

document.addEventListener('selectionchange', () => {
  if (document.activeElement === input) updateCursor();
});

shellSelect.addEventListener('change', (event) => {
  switchShell(event.target.value);
});

newOutput.addEventListener('click', scrollToBottom);
newOutput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    scrollToBottom();
  }
});

viewport.addEventListener('scroll', () => {
  if (isAtBottom()) {
    newOutput.classList.remove('is-visible');
  }
});

document.addEventListener('keydown', (event) => {
  if (event.ctrlKey && event.shiftKey && event.key.toLowerCase() === 'm') {
    handleReducedEffectsToggle();
  }
});

terminal.addEventListener('click', () => {
  if (!state.busy) scheduleFocus();
});

updatePrompt();
setBusy(true);
initReducedMotion();
playBanner();
