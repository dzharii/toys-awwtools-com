/**
 * @fileoverview codegen-highlight.js - a modified microlight, adapted for
 * The Courteous Machine code generator.
 *
 * Derived from microlight 0.0.7 by asvd.
 * Original project: https://github.com/asvd/microlight
 * Original copyright (c) 2016 asvd <heliosframework@gmail.com>
 * Original licence: MIT. The pristine 0.0.7 source and its MIT LICENCE are
 * vendored beside this file in lib/lib-asvd-microlight-0.0.7/.
 *
 * This file is a modification of that work and is distributed under the same
 * MIT terms. What is retained from microlight: the single-pass character
 * scanner with no grammar or language pack, and its token taxonomy of
 * whitespace, operator, brace, (key)word, string and comment, including its
 * combined multi-language keyword expression.
 *
 * What is modified, and why:
 *  - Tokens are emitted as CSS classes instead of computed inline text-shadow
 *    styles, so the phrasebook palette in styles.css controls the colours.
 *  - The regular-expression and XML-comment token types are removed. Generated
 *    snippets never contain either, and both mis-tokenise Racket quoting and
 *    Rust lifetimes.
 *  - Comment, string and heredoc syntax is supplied per language instead of
 *    being assumed to be C-like, so Erlang (%), Racket (;), Elixir, Python,
 *    PHP and Ruby (#) are read correctly.
 *  - Raw/backtick strings, triple-quoted strings and heredocs are recognised.
 *  - Numeric literals get their own token, and a supplementary keyword list
 *    covers languages that postdate microlight.
 *
 * Classic script. No modules, no network requests, no dependencies.
 */
(function () {
  'use strict';

  // Retained verbatim from microlight 0.0.7: one expression covering the
  // keywords of many languages at once, which is why no language packs exist.
  var MICROLIGHT_KEYWORDS = /^(a(bstract|lias|nd|rguments|rray|s(m|sert)?|uto)|b(ase|egin|ool(ean)?|reak|yte)|c(ase|atch|har|hecked|lass|lone|ompl|onst|ontinue)|de(bugger|cimal|clare|f(ault|er)?|init|l(egate|ete)?)|do|double|e(cho|ls?if|lse(if)?|nd|nsure|num|vent|x(cept|ec|p(licit|ort)|te(nds|nsion|rn)))|f(allthrough|alse|inal(ly)?|ixed|loat|or(each)?|riend|rom|unc(tion)?)|global|goto|guard|i(f|mp(lements|licit|ort)|n(it|clude(_once)?|line|out|stanceof|t(erface|ernal)?)?|s)|l(ambda|et|ock|ong)|m(icrolight|odule|utable)|NaN|n(amespace|ative|ext|ew|il|ot|ull)|o(bject|perator|r|ut|verride)|p(ackage|arams|rivate|rotected|rotocol|ublic)|r(aise|e(adonly|do|f|gister|peat|quire(_once)?|scue|strict|try|turn))|s(byte|ealed|elf|hort|igned|izeof|tatic|tring|truct|ubscript|uper|ynchronized|witch)|t(emplate|hen|his|hrows?|ransient|rue|ry|ype(alias|def|id|name|of))|u(n(checked|def(ined)?|ion|less|signed|til)|se|sing)|v(ar|irtual|oid|olatile)|w(char_t|hen|here|hile|ith)|xor|yield)$/;

  // Added: vocabulary that microlight 0.0.7 predates or never covered.
  var EXTRA_KEYWORDS = /^(async|await|fn|impl|mut|pub|crate|dyn|move|Self|Option|Result|Some|Ok|Err|None|True|False|defmodule|defp|defmacro|defstruct|fun|receive|cond|val|suspend|companion|lateinit|deinit|nonlocal|pass|chan|defer|go|range|define|display|error|panic|printf|sprintf|println|print|format|String|Error|Exception|IO|Enum|List|lists|io_lib|erlang|std|fmt|strings|Console|System|StateError|RuntimeError|IllegalStateException|InvalidOperationException|ValueError)$/;

  /*
   * Per-language syntax. Only the parts a scanner cannot guess are listed:
   * comment markers, which quote characters open a string, and whether the
   * language has triple-quoted strings, backtick strings or heredocs.
   */
  var SYNTAX = {
    c: { line: ['//'], block: ['/*', '*/'], apostrophe: true },
    csharp: { line: ['//'], block: ['/*', '*/'], apostrophe: true, triple: true },
    cpp: { line: ['//'], block: ['/*', '*/'], apostrophe: true },
    dart: { line: ['//'], block: ['/*', '*/'], apostrophe: true, triple: true },
    elixir: { line: ['#'], apostrophe: false, triple: true },
    erlang: { line: ['%'], apostrophe: false },
    go: { line: ['//'], block: ['/*', '*/'], apostrophe: true, backtick: true },
    java: { line: ['//'], block: ['/*', '*/'], apostrophe: true, triple: true },
    javascript: { line: ['//'], block: ['/*', '*/'], apostrophe: true, backtick: true },
    kotlin: { line: ['//'], block: ['/*', '*/'], apostrophe: true, triple: true },
    php: { line: ['//', '#'], block: ['/*', '*/'], apostrophe: true, heredoc: true },
    python: { line: ['#'], apostrophe: true, triple: true },
    racket: { line: [';'], block: ['#|', '|#'], apostrophe: false },
    ruby: { line: ['#'], apostrophe: true, heredoc: true },
    rust: { line: ['//'], block: ['/*', '*/'], apostrophe: false },
    scala: { line: ['//'], block: ['/*', '*/'], apostrophe: true, triple: true },
    swift: { line: ['//'], block: ['/*', '*/'], apostrophe: false, triple: true },
    typescript: { line: ['//'], block: ['/*', '*/'], apostrophe: true, backtick: true }
  };

  var DEFAULT_SYNTAX = SYNTAX.javascript;

  // PHP <<<TEXT / <<<'TEXT' and Ruby <<~TEXT / <<-TEXT / <<TEXT.
  var HEREDOC_OPENING = /^<<(<?)([~-]?)(["']?)([A-Za-z_][A-Za-z0-9_]*)\3/;

  var PUNCTUATION = /[{}[\]()\-+*=<>:;|\\.,?!&@~/%^#$]/;
  var WORD_START = /[A-Za-z_$]/;
  var WORD_BODY = /[A-Za-z0-9_$]/;
  var DIGIT = /[0-9]/;

  function escapeHtml(text) {
    return text.replace(/[&<>]/g, function (character) {
      return character === '&' ? '&amp;' : character === '<' ? '&lt;' : '&gt;';
    });
  }

  function span(className, text) {
    return className ? '<span class="' + className + '">' + escapeHtml(text) + '</span>' : escapeHtml(text);
  }

  function startsWith(source, position, marker) {
    return marker && source.substr(position, marker.length) === marker;
  }

  // Consumes a quoted run, honouring backslash escapes, and tolerates an
  // unterminated literal by running to the end of the source.
  function readQuoted(source, start, delimiter, escapable) {
    var position = start + delimiter.length;
    while (position < source.length) {
      if (escapable && source[position] === '\\') {
        position += 2;
        continue;
      }
      if (startsWith(source, position, delimiter)) return position + delimiter.length;
      position += 1;
    }
    return source.length;
  }

  function readUntil(source, start, terminator) {
    var index = source.indexOf(terminator, start);
    return index < 0 ? source.length : index + terminator.length;
  }

  function readLine(source, start) {
    var index = source.indexOf('\n', start);
    return index < 0 ? source.length : index;
  }

  // A heredoc ends at the first line whose only content before the delimiter
  // is whitespace, which is how both PHP and Ruby terminate one.
  function readHeredoc(source, start, label) {
    var terminator = new RegExp('^[ \\t]*' + label + '\\b');
    var position = readLine(source, start);
    while (position < source.length) {
      position += 1;
      var lineEnd = readLine(source, position);
      if (terminator.test(source.slice(position, lineEnd))) return lineEnd;
      position = lineEnd;
    }
    return source.length;
  }

  function classifyWord(word) {
    if (DIGIT.test(word[0])) return 'ml-num';
    return MICROLIGHT_KEYWORDS.test(word) || EXTRA_KEYWORDS.test(word) ? 'ml-key' : '';
  }

  /**
   * Returns highlighted HTML for one snippet. Unknown languages fall back to
   * C-like syntax rather than failing, which keeps the editor usable while the
   * reader types freely.
   */
  function toHtml(code, languageId) {
    var syntax = SYNTAX[languageId] || DEFAULT_SYNTAX;
    var source = String(code == null ? '' : code);
    var output = '';
    var plain = '';
    var position = 0;

    function flushPlain() {
      if (plain) {
        output += escapeHtml(plain);
        plain = '';
      }
    }

    function emit(className, end) {
      flushPlain();
      output += span(className, source.slice(position, end));
      position = end;
    }

    while (position < source.length) {
      var character = source[position];
      var index;
      var handled = false;

      if (syntax.block && startsWith(source, position, syntax.block[0])) {
        emit('ml-com', readUntil(source, position + syntax.block[0].length, syntax.block[1]));
        continue;
      }

      for (index = 0; index < syntax.line.length; index += 1) {
        if (startsWith(source, position, syntax.line[index])) {
          emit('ml-com', readLine(source, position));
          handled = true;
          break;
        }
      }
      if (handled) continue;

      if (syntax.triple && startsWith(source, position, '"""')) {
        emit('ml-str', readQuoted(source, position, '"""', false));
        continue;
      }

      if (syntax.triple && syntax.apostrophe && startsWith(source, position, "'''")) {
        emit('ml-str', readQuoted(source, position, "'''", false));
        continue;
      }

      if (syntax.heredoc && character === '<') {
        var opening = HEREDOC_OPENING.exec(source.slice(position));
        if (opening) {
          emit('ml-str', readHeredoc(source, position + opening[0].length, opening[4]));
          continue;
        }
      }

      if (syntax.backtick && character === '`') {
        emit('ml-str', readQuoted(source, position, '`', false));
        continue;
      }

      if (character === '"') {
        emit('ml-str', readQuoted(source, position, '"', true));
        continue;
      }

      if (syntax.apostrophe && character === "'") {
        emit('ml-str', readQuoted(source, position, "'", true));
        continue;
      }

      if (WORD_START.test(character) || DIGIT.test(character)) {
        var end = position + 1;
        while (end < source.length && (WORD_BODY.test(source[end]) || (DIGIT.test(character) && source[end] === '.'))) end += 1;
        var className = classifyWord(source.slice(position, end));
        if (className) {
          emit(className, end);
        } else {
          plain += source.slice(position, end);
          position = end;
        }
        continue;
      }

      if (PUNCTUATION.test(character)) {
        emit('ml-pun', position + 1);
        continue;
      }

      plain += character;
      position += 1;
    }

    flushPlain();

    // A trailing newline is invisible inside <pre>; the mirror needs the extra
    // line so it cannot end one row shorter than the textarea it sits behind.
    if (source.slice(-1) === '\n') output += '\n';
    return output;
  }

  window.CourtesyHighlight = { toHtml: toHtml, syntax: SYNTAX };
}());
