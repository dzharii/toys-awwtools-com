/* The Courteous Machine - code generation.
 *
 * Turns one phrasebook entry into a small, self-contained function in the
 * reader's language of choice, and presents it in an editable, highlighted box.
 *
 * Three steps, in order:
 *   1. build a message model   (placeholders become parameters)
 *   2. choose a shape          (the category decides how the message is delivered)
 *   3. hand the model to a language renderer in codegen-languages.js
 *
 * Classic script. No modules, no network requests, no dependencies.
 */
(function () {
  'use strict';

  var PLACEHOLDER = /<([a-zA-Z][\w. -]*)>/g;

  /* ------------------------------------------------------------- shapes */

  /* A phrasebook entry is not only prose; it carries an intent. The category
   * tells us whether the message reports a failure, an uncertainty, a success,
   * an announcement, or is simply a wording pattern to copy. Each intent gets
   * its own verb and its own one-line caution, so the generated function reads
   * like something a careful author would have written by hand.
   *
   * Every shape returns text and nothing else. This generator writes wording,
   * not control flow: whether the result is thrown, logged, returned to a user
   * or written to a file is a decision only the calling program can make. */
  var SHAPES = {
    failure: {
      verb: 'report',
      result: 'message',
      guidance: 'Use this wording only once the described failure has actually been observed.'
    },
    uncertain: {
      verb: 'describe',
      result: 'status',
      guidance: 'The outcome is not confirmed. Do not word it as a success or as a failure.'
    },
    success: {
      verb: 'announce',
      result: 'message',
      guidance: 'Use this wording only once the work has finished and been checked.'
    },
    notice: {
      verb: 'notify',
      result: 'notice',
      guidance: 'This is an announcement. It asks for the reader\'s attention, not for their blame.'
    },
    wording: {
      verb: 'compose',
      result: 'message',
      guidance: 'This is a wording pattern. Adapt the parameters and keep the courtesy.'
    }
  };

  /* Printed in every header, because it is the single most important thing to
   * know about the generated function. */
  var SCOPE_NOTE = [
    'Composes the text and returns it. Raising, logging or showing it is yours.'
  ];

  /* The example is prose written for a person and is already broken into lines
   * that read well, so a line that fits is copied exactly: runs of spaces that
   * align a small table are part of the message and must survive. Only an
   * over-long line is folded, and then it keeps its own indentation. */
  function wrapExample(text, width) {
    var out = [];
    String(text).replace(/\r\n?/g, '\n').split('\n').forEach(function (line) {
      if (!line.trim()) { out.push(''); return; }
      if (line.length <= width) { out.push(line); return; }
      var lead = (line.match(/^\s*/) || [''])[0];
      var row = lead;
      line.slice(lead.length).split(/\s+/).forEach(function (word) {
        if (row.length > lead.length && row.length + 1 + word.length > width) {
          out.push(row);
          row = lead + word;
        } else {
          row += row.length > lead.length ? ' ' + word : word;
        }
      });
      out.push(row);
    });
    return out;
  }

  var CATEGORY_SHAPE = {
    apology: 'failure', regret: 'failure', confession: 'failure',
    predicament: 'failure', refusal: 'failure', correction: 'failure',
    responsibility: 'failure',
    uncertainty: 'uncertain', caution: 'uncertain', assurance: 'uncertain',
    success: 'success', recovery: 'success',
    attention: 'notice', confirmation: 'notice', cancellation: 'notice',
    empty: 'notice', closure: 'notice',
    grammar: 'wording', technical: 'wording', personification: 'wording',
    understatement: 'wording', recognition: 'wording', remedy: 'wording'
  };

  /* The noun that completes the function name. Most categories are already a
   * good noun; a few read better with a plainer word. */
  var CATEGORY_NOUN = {
    grammar: ['pattern'],
    technical: ['detail'],
    personification: ['character'],
    empty: ['empty', 'state'],
    closure: ['closing'],
    recovery: ['recovery']
  };

  /* --------------------------------------------------------- sample values */

  /* Sample arguments exist so the snippet can be pasted and run. They are not
   * suggestions about what the caller should say. */
  var SAMPLES = {
    operation: 'the nightly reconciliation',
    status_location: 'Settings > Activity',
    request_id: 'REQ-4821',
    time: '14:05 UTC',
    reference: 'INC-4821',
    value: '42',
    service: 'the billing service',
    host: 'reports.internal',
    action: 'saving your changes',
    port: '8443',
    version: '2.4.1',
    reason: 'the upstream service declined the request',
    component: 'the export module',
    stage: 'verification',
    label: 'Quarterly Report',
    cause: 'a lost network connection',
    confirmation_phrase: 'CONFIRM',
    cancellation_phrase: 'STOP',
    timeout: '30 seconds',
    setting: 'Automatic backups',
    file: 'quarterly-report.xlsx',
    delay: '5 minutes',
    item: 'the invoice',
    data: 'your draft',
    consequence: 'the report will be incomplete',
    next_step: 'please try again in a few minutes',
    field: 'Postcode',
    expected: 'a date',
    actual: 'a telephone number',
    size: '48 MB',
    limit: '25 MB',
    printer: 'Reception Laser',
    tray: 'Tray 2',
    resource: 'the archive',
    event: 'the scheduled export',
    step: 'the final review',
    person: 'Dr Whitfield',
    feature: 'bulk editing',
    formats: 'CSV and JSON',
    recipient: 'the finance team',
    purpose: 'reconciliation',
    query: 'unpaid invoices',
    caveat: 'the figures exclude refunds',
    short_title: 'Export incomplete',
    status: 'pending',
    scope: 'this month',
    task: 'the reconciliation',
    fact: 'the ledger closed at midnight',
    alternative: 'the printable view',
    time_zone: 'Europe/London',
    local_date_time: '2026-03-29 01:30',
    first_utc_instant: '00:30 UTC',
    second_utc_instant: '01:30 UTC',
    accepted_at: '14:05 UTC',
    last_updated_at: '09:12 UTC',
    start: '09:00 UTC',
    end: '17:00 UTC',
    deadline: '17:00 UTC',
    duration: '90 seconds',
    old_version: '2.4.0',
    new_version: '2.4.1',
    renderer: 'the new layout engine',
    fallback_renderer: 'the previous layout engine',
    large_upload_method: 'the resumable upload',
    protected_area: 'the payroll records',
    available_features: 'reading and exporting',
    technical_component: 'the queue worker',
    civilised_human_action: 'a cup of tea'
  };

  /* Where no exact sample exists, the shape of the name is a fair guide. */
  var HEURISTICS = [
    { test: /(^|_)(count|pages|line|row_number|number|position|instances_\w+)$/, value: '3' },
    { test: /(^|_)(id|key|code|token|correlation\w*)$/, value: 'REF-4821' },
    { test: /(^|_)(at|time|start|end|deadline|instant|updated)$/, value: '14:05 UTC' },
    { test: /(timeout|duration|delay)/, value: '30 seconds' },
    { test: /(location|path|destination|area|folder)/, value: 'Settings > Activity' },
    { test: /(phrase)/, value: 'CONFIRM' },
    { test: /(count)/, value: '3' },
    { test: /(state|status)/, value: 'pending' },
    { test: /(organisation|organization)/, value: 'Northgate Ltd' },
    { test: /(password|secret|connection_string\w*)/, value: 'not printed here' }
  ];

  function sampleFor(key, words) {
    if (Object.prototype.hasOwnProperty.call(SAMPLES, key)) return SAMPLES[key];
    for (var i = 0; i < HEURISTICS.length; i += 1) {
      if (HEURISTICS[i].test.test(key)) return HEURISTICS[i].value;
    }
    return words.join(' ');
  }

  /* ---------------------------------------------------------- model building */

  /* Placeholder names in the catalogue are written for people, so they may
   * contain spaces, hyphens and capitals. Identifiers may not. */
  function toWords(raw) {
    var words = String(raw)
      .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
      .split(/[^A-Za-z0-9]+/)
      .filter(Boolean)
      .map(function (word) { return word.toLowerCase(); });
    if (!words.length) words = ['value'];
    if (/^[0-9]/.test(words[0])) words.unshift('v');
    return words;
  }

  function splitLine(line, register) {
    var segments = [];
    var cursor = 0;
    var match;
    PLACEHOLDER.lastIndex = 0;
    while ((match = PLACEHOLDER.exec(line)) !== null) {
      if (match.index > cursor) segments.push({ text: line.slice(cursor, match.index) });
      segments.push({ param: register(match[1]) });
      cursor = match.index + match[0].length;
    }
    if (cursor < line.length) segments.push({ text: line.slice(cursor) });
    if (!segments.length) segments.push({ text: '' });
    return segments;
  }

  function titleCase(text) {
    return String(text).charAt(0).toUpperCase() + String(text).slice(1);
  }

  /* A parameter name has to survive eighteen languages at once, so the union of
   * their keywords is off limits, and so are the few identifiers the renderers
   * introduce themselves (a C buffer and its size, the local that holds the
   * finished text). A clashing name gains a "value" word, which reads naturally
   * and keeps the parameter called the same thing in every language. */
  var RESERVED = {};
  ('abstract alias and as assert async await base become begin bool boolean break byte ' +
   'case catch chan char class con const constructor continue cond data debugger decimal ' +
   'declare def default defer define del delegate delete do done double dynamic each elif ' +
   'else elsif end ensure enum event except exception explicit export extends extern false ' +
   'final finally fixed float fn for foreach friend from fun func function global go goto ' +
   'guard if impl implements import in include inline instanceof int interface internal is ' +
   'lambda let list lock long loop macro match mod module move mut namespace native new next ' +
   'nil no none not null object of open operator or out override package params partial pass ' +
   'print private proc protected pub public raise readonly rec redo ref register require ' +
   'rescue restrict retry return sbyte sealed select self short signed sizeof stackalloc ' +
   'static string struct subscript super switch synchronized template then this throw throws ' +
   'trait transient true try type typealias typedef typeof uint ulong unchecked union unless ' +
   'unsafe unsigned until use ushort using val var virtual void volatile when where while ' +
   'with yield ' +
   'buffer size needed message status notice').split(' ')
    .forEach(function (word) { RESERVED[word] = true; });

  /**
   * Builds the language-independent model that every renderer consumes.
   *
   * source: { text, id, category, register, kind, origin }
   */
  function buildModel(source) {
    var shapeId = CATEGORY_SHAPE[source.category] || 'wording';
    var shape = SHAPES[shapeId];
    var params = [];
    var seen = {};

    function register(raw) {
      var words = toWords(raw);
      var key = words.join('_');
      if (Object.prototype.hasOwnProperty.call(seen, key)) return seen[key];
      seen[key] = params.length;
      var safe = words;
      if (RESERVED[key] || RESERVED[words.join('')]) safe = words.concat(['value']);
      params.push({ raw: raw, key: key, words: safe, sample: sampleFor(key, words) });
      return seen[key];
    }

    var lines = String(source.text).replace(/\r\n?/g, '\n').split('\n')
      .map(function (line) { return splitLine(line, register); });

    /* An entry with no placeholders would produce a function with nothing to
     * decide. The constructor on this page already closes a composed message
     * with a reference line, so the generated function does the same: the
     * parameter is always present, always used, and always in voice. */
    var referenceAdded = false;
    if (!params.length) {
      var index = register('reference');
      lines.push([{ text: 'Reference: ' }, { param: index }]);
      referenceAdded = true;
    }

    var noun = CATEGORY_NOUN[source.category] || [source.category || 'message'];
    var header = [
      'The Courteous Machine - ' + titleCase(source.category || 'message') +
        (source.register ? ' (' + source.register + ' ' + (source.kind || 'phrase') + ')' : ''),
      source.id ? 'Entry ' + source.id : 'Composed in the message constructor',
      ''
    ];
    /* What the message looks like once the blanks are filled is the one thing a
     * reader of this function cannot work out from the code, so it goes first. */
    if (source.example) {
      header.push('A worked example of this message in use:');
      header.push('');
      wrapExample(source.example, 74).forEach(function (line) {
        header.push(line ? '  ' + line : '');
      });
      header.push('');
    } else if (source.passage) {
      /* A passage is already a complete message, so repeating it above the
       * function would print it twice. What the reader needs instead is a word
       * about its shape, because the blank lines in the body are load-bearing. */
      header.push('This entry is a complete message of several paragraphs, so the body below');
      header.push('is its own worked example. The empty lines separate those paragraphs and');
      header.push('are part of the message.');
      header.push('');
    }
    header.push(shape.guidance);
    header.push('');
    header = header.concat(SCOPE_NOTE);
    if (referenceAdded) {
      header.push('');
      header.push('This entry has no placeholders, so a closing reference line carries the');
      header.push('one detail the reader will need in order to ask about it.');
    }

    return {
      shape: shape,
      shapeId: shapeId,
      params: params,
      lines: lines,
      header: header,
      nameWords: [shape.verb].concat(noun),
      source: source
    };
  }

  window.CourtesyCodegenModel = {
    build: buildModel,
    shapes: SHAPES,
    categoryShape: CATEGORY_SHAPE
  };

  /* -------------------------------------------------------------- the panel */

  /* The editable, highlighted box is a transparent textarea laid exactly over a
   * highlighted copy of the same text. The reader types into the textarea and
   * reads the copy underneath, so editing stays ordinary: selection, undo,
   * spell-check off, and the caret all behave as the browser intends. */

  var dialog, select, editor, mirror, status, sourceLine, titleNode;
  var current = null;
  var chosenLanguage = 'javascript';
  var statusTimer = 0;

  function languages() { return window.CourtesyCodeLanguages || []; }

  function languageById(id) {
    var all = languages();
    for (var i = 0; i < all.length; i += 1) if (all[i].id === id) return all[i];
    return all[0];
  }

  function say(message) {
    if (!status) return;
    status.textContent = message || '';
    window.clearTimeout(statusTimer);
    if (message) statusTimer = window.setTimeout(function () { status.textContent = ''; }, 4000);
  }

  function paint() {
    if (!mirror || !editor) return;
    var language = languageById(select.value);
    mirror.innerHTML = window.CourtesyHighlight
      ? window.CourtesyHighlight.toHtml(editor.value, language.syntax)
      : '';
    mirror.scrollTop = editor.scrollTop;
    mirror.scrollLeft = editor.scrollLeft;
  }

  function generate() {
    if (!current) return;
    var language = languageById(select.value);
    chosenLanguage = language.id;
    try {
      editor.value = language.render(buildModel(current));
    } catch (error) {
      editor.value = '// The generator could not render this entry in ' +
        language.label + '.\n// ' + error.message;
    }
    editor.scrollTop = 0;
    editor.scrollLeft = 0;
    paint();
  }

  function copy() {
    var text = editor.value;
    function fallback() {
      editor.focus();
      editor.setSelectionRange(0, text.length);
      var done = false;
      try { done = document.execCommand('copy'); } catch (error) { done = false; }
      editor.setSelectionRange(text.length, text.length);
      say(done ? 'Code copied.' : 'Copying was declined. Please select the code and copy it.');
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () { say('Code copied.'); }, fallback);
    } else {
      fallback();
    }
  }

  function bind() {
    if (dialog) return true;
    dialog = document.getElementById('codegen-dialog');
    if (!dialog) return false;
    select = document.getElementById('codegen-language');
    editor = document.getElementById('codegen-editor');
    mirror = document.getElementById('codegen-mirror');
    status = document.getElementById('codegen-status');
    sourceLine = document.getElementById('codegen-source');
    titleNode = document.getElementById('codegen-title');

    languages().forEach(function (language) {
      var option = document.createElement('option');
      option.value = language.id;
      option.textContent = language.label;
      select.appendChild(option);
    });

    select.addEventListener('change', function () {
      generate();
      say('Regenerated in ' + languageById(select.value).label + '.');
    });
    editor.addEventListener('input', paint);
    editor.addEventListener('scroll', function () {
      mirror.scrollTop = editor.scrollTop;
      mirror.scrollLeft = editor.scrollLeft;
    });

    document.getElementById('codegen-copy').addEventListener('click', copy);
    document.getElementById('codegen-restore').addEventListener('click', function () {
      generate();
      say('Generated code restored. Your edits were discarded.');
    });
    document.getElementById('codegen-close').addEventListener('click', close);

    // A click on the backdrop is the conventional way out of a modal.
    dialog.addEventListener('click', function (event) {
      if (event.target === dialog) close();
    });

    /* While the panel is open the page behind it should stay exactly where the
     * reader left it. The editor keeps its own scrollbar and its own wheel,
     * but once it reaches an end the wheel must stop there rather than pass
     * the remaining scroll to the page. Anywhere else, including the backdrop,
     * the wheel has nothing to scroll and is simply declined. The listener
     * sits on the window because a wheel over a modal backdrop is delivered
     * to the document root rather than to the dialog. */
    function heldStill(event) {
      if (!isOpen()) return;
      var target = event.target;
      var scroller = target && target.closest ? target.closest('.codegen-editor') : null;
      if (!scroller) { event.preventDefault(); return; }
      if (event.type !== 'wheel') return;
      var atTop = scroller.scrollTop <= 0;
      var atBottom = scroller.scrollTop + scroller.clientHeight >= scroller.scrollHeight - 1;
      if ((event.deltaY < 0 && atTop) || (event.deltaY > 0 && atBottom)) event.preventDefault();
    }
    window.addEventListener('wheel', heldStill, { passive: false });
    window.addEventListener('touchmove', heldStill, { passive: false });
    return true;
  }

  function isOpen() {
    return !!dialog && (dialog.open || dialog.classList.contains('is-open'));
  }

  function close() {
    if (!dialog) return;
    if (dialog.open && dialog.close) dialog.close();
    dialog.removeAttribute('open');
    dialog.classList.remove('is-open');
  }

  /**
   * source: { text, id, category, register, kind, label }
   */
  function open(source) {
    if (!bind()) return;
    current = source;
    select.value = languageById(chosenLanguage).id;
    titleNode.textContent = 'Generate code';
    sourceLine.textContent = source.label ||
      (source.id ? 'Entry ' + source.id + ' - ' + source.category : 'Composed message');
    say('');
    generate();

    if (dialog.showModal) {
      if (!dialog.open) dialog.showModal();
    } else {
      // Older browsers get a plain in-page panel rather than nothing at all.
      dialog.setAttribute('open', 'open');
      dialog.classList.add('is-open');
    }
    select.focus();
  }

  window.CourtesyCodegen = { open: open, close: close };
}());
