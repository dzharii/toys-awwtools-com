/* The Courteous Machine - code generation language pack.
 *
 * One renderer per language. Each renderer receives the same message model and
 * returns a complete, self-contained snippet: a comment header, one function,
 * and a commented example call.
 *
 * Every generated parameter is a text parameter. The caller decides formatting,
 * rounding and localisation, which keeps the message layer free of assumptions
 * a phrasebook entry cannot make on its own.
 *
 * Classic script. No modules, no network requests, no dependencies.
 */
(function () {
  'use strict';

  /* ---------------------------------------------------------------- naming */

  function lower(words) { return words.map(function (word) { return word.toLowerCase(); }); }
  function capitalise(word) { return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(); }

  function camel(words) {
    return lower(words).map(function (word, index) { return index ? capitalise(word) : word; }).join('');
  }
  function pascal(words) { return words.map(capitalise).join(''); }
  function snake(words) { return lower(words).join('_'); }
  function kebab(words) { return lower(words).join('-'); }

  var CASE = { camel: camel, pascal: pascal, snake: snake, kebab: kebab };

  /* ------------------------------------------------------------- escaping */

  // The shared base: a backslash-escaped, double-quoted literal.
  function escapeBase(text) {
    return String(text).replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\r/g, '\\r');
  }
  function escapeSingle(text) {
    return String(text).replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\r/g, '\\r');
  }
  // printf-style formats consume per cent signs.
  function escapePrintf(text) { return escapeBase(text).replace(/%/g, '%%'); }
  // Erlang and Racket format strings consume tildes.
  function escapeTilde(text) { return escapeBase(text).replace(/~/g, '~~'); }

  /* ------------------------------------------------------- shared builders */

  function commentLines(lines, marker) {
    return lines.map(function (line) { return line ? marker + ' ' + line : marker; });
  }

  function names(model, style) {
    return model.params.map(function (param) { return CASE[style](param.words); });
  }

  function functionName(model, style) { return CASE[style](model.nameWords); }

  /**
   * Turns the message model into one literal expression per line, so a renderer
   * only has to decide how its language joins them.
   *
   * escape   how ordinary prose is made safe inside the chosen literal
   * interp   how a parameter is written inside the chosen literal
   * quote    the opening and closing delimiter
   * prefix   optional literal prefix, chosen per line (f-strings, s-strings)
   */
  function lineLiterals(model, style, options) {
    var paramNames = names(model, style);
    var quote = options.quote || '"';
    return model.lines.map(function (line) {
      var hasParam = false;
      var body = line.map(function (segment) {
        if (segment.param === undefined) return options.escape(segment.text);
        hasParam = true;
        return options.interp(paramNames[segment.param]);
      }).join('');
      var prefix = options.prefix ? options.prefix(hasParam) : '';
      return prefix + quote + body + quote;
    });
  }

  // A single literal with explicit newline escapes, for languages whose idiom
  // is one format string rather than a joined list.
  function flatLiteral(model, style, options) {
    var paramNames = names(model, style);
    return model.lines.map(function (line) {
      return line.map(function (segment) {
        return segment.param === undefined
          ? options.escape(segment.text)
          : options.interp(paramNames[segment.param]);
      }).join('');
    }).join('\\n');
  }

  function indentBlock(text, indent) {
    return text.split('\n').map(function (line) { return line ? indent + line : line; }).join('\n');
  }

  function sampleArguments(model, escape, quote) {
    return model.params.map(function (param) { return quote + escape(param.sample) + quote; });
  }

  // A format string that numbers its holes positionally needs one argument per
  // hole, so a parameter used twice has to be passed twice.
  function occurrences(model, style) {
    var paramNames = names(model, style);
    var used = [];
    model.lines.forEach(function (line) {
      line.forEach(function (segment) {
        if (segment.param !== undefined) used.push(paramNames[segment.param]);
      });
    });
    return used;
  }

  /* --------------------------------------------------------------- C-like */

  function braceFunction(options) {
    var body = options.body.map(function (line) { return line ? options.indent + line : line; });
    var open = options.braceOnOwnLine ? '\n{\n' : ' {\n';
    return options.signature + open + body.join('\n') + '\n}';
  }

  var languages = [];

  function define(language) { languages.push(language); }

  /* ------------------------------------------------------------------- C */

  define({
    id: 'c', label: 'C', syntax: 'c', indent: '    ',
    render: function (model) {
      var name = functionName(model, 'snake');
      var params = names(model, 'snake');
      var format = flatLiteral(model, 'snake', {
        escape: escapePrintf,
        interp: function () { return '%s'; }
      });
      var typed = params.map(function (param) { return 'const char *' + param; });
      var literalLines = format.split('\\n').map(function (part, index, all) {
        return '"' + part + (index < all.length - 1 ? '\\n' : '') + '"';
      });
      var body = ['return snprintf(buffer, size,'];
      literalLines.forEach(function (line) { body.push('                ' + line); });
      var formatArgs = occurrences(model, 'snake');
      body[body.length - 1] += formatArgs.length ? ',' : ');';
      if (formatArgs.length) body.push('                ' + formatArgs.join(', ') + ');');

      var forward = params.length ? ', ' + params.join(', ') : '';

      /* Two entry points, because allocating inside a message helper is often
       * exactly what a C caller does not want. The buffer version writes into
       * memory the caller already owns; the allocating version is there for
       * the times when the length is not known in advance. */
      var allocating = [
        'char *' + name + '_alloc(' + (typed.length ? typed.join(', ') : 'void') + ')',
        '{',
        '    char *' + model.shape.result + ';',
        '    int needed = ' + name + '(NULL, 0' + forward + ');',
        '',
        '    if (needed < 0) {',
        '        return NULL;',
        '    }',
        '',
        '    ' + model.shape.result + ' = malloc((size_t) needed + 1);',
        '    if (' + model.shape.result + ' == NULL) {',
        '        return NULL;',
        '    }',
        '',
        '    ' + name + '(' + model.shape.result + ', (size_t) needed + 1' + forward + ');',
        '    return ' + model.shape.result + ';',
        '}'
      ];

      return [
        commentLines(model.header, '//').join('\n'),
        '',
        '#include <stdio.h>',
        '#include <stdlib.h>',
        '',
        '/* Writes into a buffer the caller owns. Returns the length the whole',
        '   message needs, exactly as snprintf does, so truncation is detectable. */',
        braceFunction({
          signature: 'int ' + name + '(char *buffer, size_t size' +
            (typed.length ? ', ' + typed.join(', ') : '') + ')',
          indent: '    ',
          braceOnOwnLine: true,
          body: body
        }),
        '',
        '/* Allocates instead. The caller owns the result and must free it;',
        '   NULL means the message could not be allocated. */',
        allocating.join('\n'),
        '',
        '/* Example:',
        '   char buffer[512];',
        '   ' + name + '(buffer, sizeof buffer' +
          (params.length ? ', ' + sampleArguments(model, escapeBase, '"').join(', ') : '') + ');',
        '',
        '   char *owned = ' + name + '_alloc(' +
          (params.length ? sampleArguments(model, escapeBase, '"').join(', ') : '') + ');',
        '   free(owned); */'
      ].join('\n');
    }
  });

  /* ------------------------------------------------------------------ C# */

  define({
    id: 'csharp', label: 'C#', syntax: 'csharp', indent: '    ',
    render: function (model) {
      var name = functionName(model, 'pascal');
      var params = names(model, 'camel');
      var literals = lineLiterals(model, 'camel', {
        escape: function (text) { return escapeBase(text).replace(/[{}]/g, '$&$&'); },
        interp: function (param) { return '{' + param + '}'; },
        prefix: function (hasParam) { return hasParam ? '$' : ''; }
      });
      var declared = params.map(function (param) { return 'string ' + param; }).join(', ');
      var build = literals.length === 1
        ? ['var ' + model.shape.result + ' = ' + literals[0] + ';']
        : ['var ' + model.shape.result + ' = string.Join("\\n", new[]']
            .concat(['{'], literals.map(function (line, index) {
              return '    ' + line + (index < literals.length - 1 ? ',' : '');
            }), ['});']);
      var deliver = ['return ' + model.shape.result + ';'];

      return [
        commentLines(model.header, '//').join('\n'),
        '',
        'public static class CourteousMachine',
        '{',
        indentBlock(braceFunction({
          signature: 'public static string ' + name + '(' + declared + ')',
          indent: '    ',
          body: build.concat(deliver)
        }), '    '),
        '}',
        '',
        '// Example: ' + name + '(' + sampleArguments(model, escapeBase, '"').join(', ') + ');'
      ].join('\n');
    }
  });

  /* ----------------------------------------------------------------- C++ */

  define({
    id: 'cpp', label: 'C++', syntax: 'cpp', indent: '    ',
    render: function (model) {
      var name = functionName(model, 'snake');
      var paramNames = names(model, 'snake');
      var stream = model.lines.map(function (line, index) {
        var parts = line.map(function (segment) {
          return segment.param === undefined
            ? '"' + escapeBase(segment.text) + '"'
            : paramNames[segment.param];
        });
        if (index < model.lines.length - 1) parts.push('"\\n"');
        return (index ? '       ' : 'message') + ' << ' + parts.join(' << ');
      });
      stream[stream.length - 1] += ';';
      var declared = paramNames.map(function (param) { return 'const std::string& ' + param; }).join(', ');
      var deliver = ['return message.str();'];

      return [
        commentLines(model.header, '//').join('\n'),
        '',
        '#include <sstream>',
        '#include <string>',
        '',
        braceFunction({
          signature: 'std::string ' + name + '(' + declared + ')',
          indent: '    ',
          body: ['std::ostringstream message;'].concat(stream, '', deliver)
        }),
        '',
        '// Example: ' + name + '(' + sampleArguments(model, escapeBase, '"').join(', ') + ');'
      ].join('\n');
    }
  });

  /* ---------------------------------------------------------------- Dart */

  define({
    id: 'dart', label: 'Dart', syntax: 'dart', indent: '  ',
    render: function (model) {
      var name = functionName(model, 'camel');
      var params = names(model, 'camel');
      var literals = lineLiterals(model, 'camel', {
        quote: "'",
        escape: function (text) { return escapeSingle(text).replace(/\$/g, '\\$'); },
        interp: function (param) { return '${' + param + '}'; }
      });
      var declared = params.map(function (param) { return 'String ' + param; }).join(', ');
      var build = literals.length === 1
        ? ['final ' + model.shape.result + ' = ' + literals[0] + ';']
        : ['final ' + model.shape.result + ' = [']
            .concat(literals.map(function (line) { return '  ' + line + ','; }), ["].join('\\n');"]);
      var deliver = ['return ' + model.shape.result + ';'];

      return [
        commentLines(model.header, '//').join('\n'),
        '',
        braceFunction({
          signature: 'String ' + name + '(' + declared + ')',
          indent: '  ',
          body: build.concat(deliver)
        }),
        '',
        '// Example: ' + name + '(' + sampleArguments(model, escapeSingle, "'").join(', ') + ');'
      ].join('\n');
    }
  });

  /* -------------------------------------------------------------- Elixir */

  define({
    id: 'elixir', label: 'Elixir', syntax: 'elixir', indent: '  ',
    render: function (model) {
      var name = functionName(model, 'snake');
      var params = names(model, 'snake');
      var literals = lineLiterals(model, 'snake', {
        escape: function (text) { return escapeBase(text).replace(/#\{/g, '\\#{'); },
        interp: function (param) { return '#{' + param + '}'; }
      });
      var build = literals.length === 1
        ? [model.shape.result + ' = ' + literals[0]]
        : [model.shape.result + ' =']
            .concat(['  Enum.join(['], literals.map(function (line, index) {
              return '    ' + line + (index < literals.length - 1 ? ',' : '');
            }), ['  ], "\\n")']);
      var deliver = [model.shape.result];

      var body = ['def ' + name + '(' + params.join(', ') + ') do']
        .concat(build.concat('', deliver).map(function (line) { return line ? '  ' + line : line; }), ['end']);

      return [
        commentLines(model.header, '#').join('\n'),
        '',
        'defmodule CourteousMachine do',
        indentBlock(body.join('\n'), '  '),
        'end',
        '',
        '# Example: ' + 'CourteousMachine.' + name +
          '(' + sampleArguments(model, escapeBase, '"').join(', ') + ')'
      ].join('\n');
    }
  });

  /* -------------------------------------------------------------- Erlang */

  define({
    id: 'erlang', label: 'Erlang', syntax: 'erlang', indent: '    ',
    render: function (model) {
      var name = functionName(model, 'snake');
      var params = model.params.map(function (param) { return pascal(param.words); });
      var format = flatLiteral(model, 'snake', {
        escape: escapeTilde,
        interp: function () { return '~s'; }
      }).split('\\n').join('~n');
      var used = occurrences(model, 'pascal');
      var formatArgs = used.length ? ', [' + used.join(', ') + ']' : ', []';
      var deliver = '    Message.';

      return [
        commentLines(model.header, '%%').join('\n'),
        '',
        '-module(courteous_machine).',
        '-export([' + name + '/' + params.length + ']).',
        '',
        name + '(' + params.join(', ') + ') ->',
        '    Message = lists:flatten(io_lib:format(',
        '        "' + format + '"' + formatArgs + ')),',
        deliver,
        '',
        '%% Example: courteous_machine:' + name +
          '(' + sampleArguments(model, escapeBase, '"').join(', ') + ').'
      ].join('\n');
    }
  });

  /* ------------------------------------------------------------------ Go */

  define({
    id: 'go', label: 'Go', syntax: 'go', indent: '\t',
    render: function (model) {
      var name = functionName(model, 'pascal');
      var params = names(model, 'camel');
      var format = flatLiteral(model, 'camel', {
        escape: escapePrintf,
        interp: function () { return '%s'; }
      });
      var used = occurrences(model, 'camel');
      var call = used.length ? ', ' + used.join(', ') : '';
      var declared = params.map(function (param) { return param + ' string'; }).join(', ');
      var body = ['return fmt.Sprintf("' + format + '"' + call + ')'];

      return [
        commentLines(model.header, '//').join('\n'),
        '',
        'package courteous',
        '',
        'import "fmt"',
        '',
        braceFunction({
          signature: 'func ' + name + '(' + declared + ') string',
          indent: '\t',
          body: body
        }),
        '',
        '// Example: message := ' + name +
          '(' + sampleArguments(model, escapeBase, '"').join(', ') + ')'
      ].join('\n');
    }
  });

  /* ---------------------------------------------------------------- Java */

  // For languages that concatenate rather than interpolate.
  function concatLiterals(model, style, options) {
    var paramNames = names(model, style);
    var quote = options.quote || '"';
    return model.lines.map(function (line) {
      var parts = [];
      line.forEach(function (segment) {
        parts.push(segment.param === undefined
          ? quote + options.escape(segment.text) + quote
          : paramNames[segment.param]);
      });
      return parts.length ? parts.join(' + ') : quote + quote;
    });
  }

  define({
    id: 'java', label: 'Java', syntax: 'java', indent: '    ',
    render: function (model) {
      var name = functionName(model, 'camel');
      var params = names(model, 'camel');
      var literals = concatLiterals(model, 'camel', { escape: escapeBase });
      var build = literals.length === 1
        ? ['String ' + model.shape.result + ' = ' + literals[0] + ';']
        : ['String ' + model.shape.result + ' = String.join("\\n",']
            .concat(literals.map(function (line, index) {
              return '        ' + line + (index < literals.length - 1 ? ',' : ');');
            }));
      var deliver = ['return ' + model.shape.result + ';'];
      var declared = params.map(function (param) { return 'String ' + param; }).join(', ');

      return [
        commentLines(model.header, '//').join('\n'),
        '',
        'public final class CourteousMachine {',
        '',
        indentBlock(braceFunction({
          signature: 'public static String ' + name + '(' + declared + ')',
          indent: '    ',
          body: build.concat('', deliver)
        }), '    '),
        '',
        '    private CourteousMachine() {',
        '    }',
        '}',
        '',
        '// Example: CourteousMachine.' + name +
          '(' + sampleArguments(model, escapeBase, '"').join(', ') + ');'
      ].join('\n');
    }
  });

  /* ---------------------------------------------------------- JavaScript */

  function escapeTemplate(text) {
    return String(text).replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$\{/g, '\\${');
  }

  function templateBuild(model, resultName, keyword) {
    var literals = lineLiterals(model, 'camel', {
      quote: '`',
      escape: escapeTemplate,
      interp: function (param) { return '${' + param + '}'; }
    });
    if (literals.length === 1) return [keyword + ' ' + resultName + ' = ' + literals[0] + ';'];
    return [keyword + ' ' + resultName + ' = [']
      .concat(literals.map(function (line, index) {
        return '  ' + line + (index < literals.length - 1 ? ',' : '');
      }), ["].join('\\n');"]);
  }

  define({
    id: 'javascript', label: 'JavaScript', syntax: 'javascript', indent: '  ',
    render: function (model) {
      var name = functionName(model, 'camel');
      var params = names(model, 'camel');
      var deliver = ['return ' + model.shape.result + ';'];

      return [
        commentLines(model.header, '//').join('\n'),
        '',
        braceFunction({
          signature: 'function ' + name + '(' + params.join(', ') + ')',
          indent: '  ',
          body: templateBuild(model, model.shape.result, 'const').concat('', deliver)
        }),
        '',
        '// Example: ' + name + '(' + sampleArguments(model, escapeBase, '"').join(', ') + ');'
      ].join('\n');
    }
  });

  /* -------------------------------------------------------------- Kotlin */

  define({
    id: 'kotlin', label: 'Kotlin', syntax: 'kotlin', indent: '    ',
    render: function (model) {
      var name = functionName(model, 'camel');
      var params = names(model, 'camel');
      var literals = lineLiterals(model, 'camel', {
        escape: function (text) { return escapeBase(text).replace(/\$/g, '\\$'); },
        interp: function (param) { return '$' + param; }
      });
      var build = literals.length === 1
        ? ['val ' + model.shape.result + ' = ' + literals[0]]
        : ['val ' + model.shape.result + ' = listOf(']
            .concat(literals.map(function (line, index) {
              return '    ' + line + (index < literals.length - 1 ? ',' : '');
            }), [').joinToString("\\n")']);
      var deliver = ['return ' + model.shape.result];
      var declared = params.map(function (param) { return param + ': String'; }).join(', ');

      return [
        commentLines(model.header, '//').join('\n'),
        '',
        braceFunction({
          signature: 'fun ' + name + '(' + declared + '): String',
          indent: '    ',
          body: build.concat('', deliver)
        }),
        '',
        '// Example: ' + name + '(' + sampleArguments(model, escapeBase, '"').join(', ') + ')'
      ].join('\n');
    }
  });

  /* ----------------------------------------------------------------- PHP */

  define({
    id: 'php', label: 'PHP', syntax: 'php', indent: '    ',
    render: function (model) {
      var name = functionName(model, 'camel');
      var params = names(model, 'camel');
      var literals = lineLiterals(model, 'camel', {
        escape: function (text) { return escapeBase(text).replace(/\$/g, '\\$'); },
        interp: function (param) { return '{$' + param + '}'; }
      });
      var result = '$' + model.shape.result;
      var build = literals.length === 1
        ? [result + ' = ' + literals[0] + ';']
        : [result + ' = implode("\\n", [']
            .concat(literals.map(function (line) { return '    ' + line + ','; }), ']);');
      var deliver = ['return ' + result + ';'];
      var declared = params.map(function (param) { return 'string $' + param; }).join(', ');

      return [
        '<?php',
        '',
        commentLines(model.header, '//').join('\n'),
        '',
        'declare(strict_types=1);',
        '',
        'function ' + name + '(' + declared + '): string',
        '{',
        indentBlock(build.concat('', deliver).join('\n'), '    '),
        '}',
        '',
        '// Example: ' + name + '(' + sampleArguments(model, escapeSingle, "'").join(', ') + ');'
      ].join('\n');
    }
  });

  /* -------------------------------------------------------------- Python */

  define({
    id: 'python', label: 'Python', syntax: 'python', indent: '    ',
    render: function (model) {
      var name = functionName(model, 'snake');
      var params = names(model, 'snake');
      var literals = lineLiterals(model, 'snake', {
        escape: function (text) { return escapeBase(text).replace(/[{}]/g, '$&$&'); },
        interp: function (param) { return '{' + param + '}'; },
        prefix: function (hasParam) { return hasParam ? 'f' : ''; }
      });
      var build = literals.length === 1
        ? [model.shape.result + ' = ' + literals[0]]
        : [model.shape.result + ' = "\\n".join([']
            .concat(literals.map(function (line) { return '    ' + line + ','; }), ['])']);
      var deliver = ['return ' + model.shape.result];
      var declared = params.map(function (param) { return param + ': str'; }).join(', ');

      return [
        commentLines(model.header, '#').join('\n'),
        '',
        'def ' + name + '(' + declared + ') -> str:',
        indentBlock(build.concat('', deliver).join('\n'), '    '),
        '',
        '# Example: ' + name + '(' + sampleArguments(model, escapeBase, '"').join(', ') + ')'
      ].join('\n');
    }
  });

  /* -------------------------------------------------------------- Racket */

  define({
    id: 'racket', label: 'Racket', syntax: 'racket', indent: '  ',
    render: function (model) {
      var name = functionName(model, 'kebab');
      var params = names(model, 'kebab');
      var format = flatLiteral(model, 'kebab', {
        escape: escapeTilde,
        interp: function () { return '~a'; }
      });
      var used = occurrences(model, 'kebab');
      var call = used.length ? ' ' + used.join(' ') : '';
      var body = ['(format "' + format + '"' + call + ')'];

      return [
        '#lang racket/base',
        '',
        commentLines(model.header, ';;').join('\n'),
        '',
        '(define (' + name + (params.length ? ' ' + params.join(' ') : '') + ')',
        indentBlock(body.join('\n'), '  ') + ')',
        '',
        ';; Example: (' + name +
          (model.params.length ? ' ' + sampleArguments(model, escapeBase, '"').join(' ') : '') + ')'
      ].join('\n');
    }
  });

  /* ---------------------------------------------------------------- Ruby */

  define({
    id: 'ruby', label: 'Ruby', syntax: 'ruby', indent: '  ',
    render: function (model) {
      var name = functionName(model, 'snake');
      var params = names(model, 'snake');
      var paramNames = params;
      var heredocLabel = 'MESSAGE';
      var escapeBody = function (text) {
        return String(text).replace(/\\/g, '\\\\').replace(/#\{/g, '\\#{');
      };
      var plainLines = model.lines.map(function (line) {
        return line.map(function (segment) {
          return segment.param === undefined
            ? escapeBody(segment.text)
            : '#{' + paramNames[segment.param] + '}';
        }).join('');
      });
      var quotedLines = model.lines.map(function (line) {
        return line.map(function (segment) {
          return segment.param === undefined
            ? escapeBase(segment.text).replace(/#\{/g, '\\#{')
            : '#{' + paramNames[segment.param] + '}';
        }).join('');
      });
      // The squiggly heredoc is the Ruby idiom for prose, but it cannot carry a
      // line that repeats its own terminator, and it removes the indentation
      // shared by every line, which would flatten a message that indents all of
      // its own lines on purpose.
      var terminatorClash = plainLines.some(function (line) {
        return line.trim() === heredocLabel;
      });
      var bodyLines = plainLines.filter(function (line) { return line.trim(); });
      var allIndented = bodyLines.length > 0 && bodyLines.every(function (line) {
        return /^\s/.test(line);
      });
      var build;
      if (plainLines.length === 1) {
        build = [model.shape.result + ' = "' + quotedLines[0] + '"'];
      } else if (terminatorClash || allIndented) {
        build = [model.shape.result + ' = ['].concat(
          quotedLines.map(function (line, index) {
            return '  "' + line + '"' + (index < quotedLines.length - 1 ? ',' : '');
          }),
          ['].join("\\n")']);
      } else {
        build = [model.shape.result + ' = <<~' + heredocLabel + '.chomp'].concat(
          plainLines.map(function (line) { return line ? '  ' + line : line; }),
          [heredocLabel]);
      }
      var deliver = [model.shape.result];

      return [
        commentLines(model.header, '#').join('\n'),
        '',
        'def ' + name + '(' + params.join(', ') + ')',
        indentBlock(build.concat('', deliver).join('\n'), '  '),
        'end',
        '',
        '# Example: ' + name + '(' + sampleArguments(model, escapeBase, '"').join(', ') + ')'
      ].join('\n');
    }
  });

  /* ---------------------------------------------------------------- Rust */

  define({
    id: 'rust', label: 'Rust', syntax: 'rust', indent: '    ',
    render: function (model) {
      var name = functionName(model, 'snake');
      var params = names(model, 'snake');
      var escape = function (text) { return escapeBase(text).replace(/[{}]/g, '$&$&'); };
      var pieces = model.lines.map(function (line) {
        return line.map(function (segment) {
          return segment.param === undefined
            ? escape(segment.text)
            : '{' + names(model, 'snake')[segment.param] + '}';
        }).join('');
      });
      // A trailing backslash removes the source newline and the next line's
      // indentation, so the literal stays readable without changing the text.
      // That same rule would eat indentation the message intends to keep, so a
      // message with an indented line is joined from one literal per line.
      var indented = pieces.some(function (piece) { return /^\s/.test(piece); });
      var body;
      if (pieces.length === 1) {
        body = ['format!("' + pieces[0] + '")'];
      } else if (indented) {
        body = ['['].concat(
          pieces.map(function (piece) { return '    format!("' + piece + '"),'; }),
          [']', '.join("\\n")']);
      } else {
        var literal = pieces.map(function (piece, index) {
          if (index === 0) return '"' + piece + '\\n\\';
          return ' ' + piece + (index === pieces.length - 1 ? '"' : '\\n\\');
        });
        body = ['format!('].concat(
          literal.map(function (line) { return '    ' + line; }), [')']);
      }
      var declared = params.map(function (param) { return param + ': &str'; }).join(', ');

      return [
        commentLines(model.header, '//').join('\n'),
        '',
        braceFunction({
          signature: 'pub fn ' + name + '(' + declared + ') -> String',
          indent: '    ',
          body: body
        }),
        '',
        '// Example: ' + name + '(' + sampleArguments(model, escapeBase, '"').join(', ') + ');'
      ].join('\n');
    }
  });

  /* --------------------------------------------------------------- Scala */

  define({
    id: 'scala', label: 'Scala', syntax: 'scala', indent: '  ',
    render: function (model) {
      var name = functionName(model, 'camel');
      var params = names(model, 'camel');
      var literals = lineLiterals(model, 'camel', {
        // The s-interpolator reads a lone dollar sign as the start of a splice.
        escape: function (text) { return escapeBase(text).replace(/\$/g, '$$$$'); },
        interp: function (param) { return '$' + param; },
        prefix: function (hasParam) { return hasParam ? 's' : ''; }
      });
      var build = literals.length === 1
        ? ['val ' + model.shape.result + ' = ' + literals[0]]
        : ['val ' + model.shape.result + ' = List(']
            .concat(literals.map(function (line, index) {
              return '  ' + line + (index < literals.length - 1 ? ',' : '');
            }), [').mkString("\\n")']);
      var deliver = [model.shape.result];
      var declared = params.map(function (param) { return param + ': String'; }).join(', ');

      return [
        commentLines(model.header, '//').join('\n'),
        '',
        'object CourteousMachine {',
        indentBlock(braceFunction({
          signature: 'def ' + name + '(' + declared + '): String =',
          indent: '  ',
          body: build.concat('', deliver)
        }), '  '),
        '}',
        '',
        '// Example: CourteousMachine.' + name +
          '(' + sampleArguments(model, escapeBase, '"').join(', ') + ')'
      ].join('\n');
    }
  });

  /* --------------------------------------------------------------- Swift */

  define({
    id: 'swift', label: 'Swift', syntax: 'swift', indent: '    ',
    render: function (model) {
      var name = functionName(model, 'camel');
      var params = names(model, 'camel');
      var escapeBlock = function (text) { return String(text).replace(/\\/g, '\\\\'); };
      var plainLines = model.lines.map(function (line) {
        return line.map(function (segment) {
          return segment.param === undefined
            ? escapeBlock(segment.text)
            : '\\(' + params[segment.param] + ')';
        }).join('');
      });
      var blockUnsafe = plainLines.some(function (line) { return line.indexOf('"""') >= 0; });
      var build;
      if (plainLines.length === 1) {
        build = ['let ' + model.shape.result + ' = "' +
          model.lines[0].map(function (segment) {
            return segment.param === undefined
              ? escapeBase(segment.text)
              : '\\(' + params[segment.param] + ')';
          }).join('') + '"'];
      } else if (blockUnsafe) {
        build = ['let ' + model.shape.result + ' = ['].concat(
          plainLines.map(function (line, index) {
            return '    "' + escapeBase(line) + '"' + (index < plainLines.length - 1 ? ',' : '');
          }),
          ['].joined(separator: "\\n")']);
      } else {
        // The closing delimiter's indentation is what Swift strips from every
        // line, so content and terminator are indented together.
        build = ['let ' + model.shape.result + ' = """'].concat(
          plainLines.map(function (line) { return line ? '    ' + line : line; }),
          ['    """']);
      }
      var deliver = ['return ' + model.shape.result];
      var declared = params.map(function (param) { return param + ': String'; }).join(', ');

      return [
        commentLines(model.header, '//').join('\n'),
        '',
        braceFunction({
          signature: 'func ' + name + '(' + declared + ') -> String',
          indent: '    ',
          body: build.concat('', deliver)
        }),
        '',
        '// Example: ' + name + '(' +
          model.params.map(function (param, index) {
            return params[index] + ': "' + escapeBase(param.sample) + '"';
          }).join(', ') + ')'
      ].join('\n');
    }
  });

  /* ---------------------------------------------------------- TypeScript */

  define({
    id: 'typescript', label: 'TypeScript', syntax: 'typescript', indent: '  ',
    render: function (model) {
      var name = functionName(model, 'camel');
      var params = names(model, 'camel');
      var deliver = ['return ' + model.shape.result + ';'];
      var declared = params.map(function (param) { return param + ': string'; }).join(', ');

      return [
        commentLines(model.header, '//').join('\n'),
        '',
        braceFunction({
          signature: 'export function ' + name + '(' + declared + '): string',
          indent: '  ',
          body: templateBuild(model, model.shape.result, 'const').concat('', deliver)
        }),
        '',
        '// Example: ' + name + '(' + sampleArguments(model, escapeBase, '"').join(', ') + ');'
      ].join('\n');
    }
  });

  languages.sort(function (a, b) { return a.label.localeCompare(b.label, 'en'); });

  window.CourtesyCodeLanguages = languages;
  window.CourtesyCodeHelpers = {
    CASE: CASE,
    camel: camel, pascal: pascal, snake: snake, kebab: kebab,
    escapeBase: escapeBase, escapeSingle: escapeSingle,
    escapePrintf: escapePrintf, escapeTilde: escapeTilde,
    commentLines: commentLines, names: names, functionName: functionName,
    lineLiterals: lineLiterals, flatLiteral: flatLiteral,
    indentBlock: indentBlock, sampleArguments: sampleArguments,
    braceFunction: braceFunction, define: define
  };
}());
