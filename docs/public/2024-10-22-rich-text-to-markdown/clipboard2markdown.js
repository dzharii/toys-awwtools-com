(function () {
  'use strict';

  var escape = function (str) {
    return str.replace(/[\u2018\u2019\u00b4]/g, "'")
              .replace(/[\u201c\u201d\u2033]/g, '"')
              .replace(/[\u2212\u2022\u00b7\u25aa]/g, '-')
              .replace(/[\u2013\u2015]/g, '--')
              .replace(/\u2014/g, '---')
              .replace(/\u2026/g, '...')
              .replace(/[ ]+\n/g, '\n')
              .replace(/\s*\\\n/g, '\\\n')
              .replace(/\s*\\\n\s*\\\n/g, '\n\n')
              .replace(/\s*\\\n\n/g, '\n\n')
              .replace(/\n-\n/g, '\n')
              .replace(/\n\n\s*\\\n/g, '\n\n')
              .replace(/\n\n\n*/g, '\n\n')
              .replace(/[ ]+$/gm, '')
              .replace(/^\s+|[\s\\]+$/g, '');
  };

  var convert = function (containerElement) {
    var turndownService = new TurndownService();

    const gfm = turndownPluginGfm.gfm;
    const highlightedCodeBlock = turndownPluginGfm.highlightedCodeBlock;
    const strikethrough = turndownPluginGfm.strikethrough;
    const tables = turndownPluginGfm.tables;
    const taskListItems = turndownPluginGfm.taskListItems;

    // Add the custom 'table' rule
    // AI Code
    turndownService.addRule('table', {
      filter: 'table',
      replacement: function (content, node) {
        // Helper function to escape pipe characters in cell content
        function escapePipe(text) {
          return text.replace(/\|/g, '\\|');
        }

        // Convert the table node to a DOM element
        const table = node;
        const rows = Array.from(table.querySelectorAll('tr'));
        if (rows.length === 0) {
          return '';
        }

        let markdown = '';

        // Determine if the first row contains th elements (headers)
        const headerCells = rows[0].querySelectorAll('th');
        let headers = [];
        let alignments = [];

        if (headerCells.length > 0) {
          // Extract headers from th elements
          headers = Array.from(headerCells).map(cell =>
            escapePipe(turndownService.turndown(cell.textContent.trim()))
          );

          // Determine alignment based on 'text-align' style
          alignments = Array.from(headerCells).map(cell => {
            const style = cell.getAttribute('style') || '';
            if (style.includes('text-align: left')) {
              return ':---';
            } else if (style.includes('text-align: right')) {
              return '---:';
            } else if (style.includes('text-align: center')) {
              return ':---:';
            } else {
              return '---';
            }
          });

          // Remove the header row from rows
          rows.shift();
        } else {
          // If no th elements, use the first row as headers
          const firstRowCells = rows[0].querySelectorAll('td');
          headers = Array.from(firstRowCells).map(cell =>
            escapePipe(turndownService.turndown(cell.textContent.trim()))
          );

          // Default alignment
          alignments = headers.map(() => '---');

          // Remove the first row from rows
          rows.shift();
        }

        // Construct the Markdown header row
        markdown += `| ${headers.join(' | ')} |\n`;
        // Construct the Markdown alignment row
        markdown += `| ${alignments.join(' | ')} |\n`;

        // Process each remaining row
        rows.forEach(row => {
          const cells = Array.from(row.querySelectorAll('th, td')).map(cell =>
            escapePipe(turndownService.turndown(cell.textContent.trim()))
          );
          markdown += `| ${cells.join(' | ')} |\n`;
        });

        // Return the Markdown table with surrounding newlines for readability
        return `\n${markdown}\n`;
      }
    });

    turndownService.use([gfm]);
    //turndownService.use([gfm, highlightedCodeBlock, strikethrough, tables, taskListItems]);
    var markdown = turndownService.turndown(containerElement);
    return escape(markdown);
  }

  var insert = function (myField, myValue) {
      if (document.selection) {
          myField.focus();
          sel = document.selection.createRange();
          sel.text = myValue;
          sel.select()
      } else {
          if (myField.selectionStart || myField.selectionStart == "0") {
              var startPos = myField.selectionStart;
              var endPos = myField.selectionEnd;
              var beforeValue = myField.value.substring(0, startPos);
              var afterValue = myField.value.substring(endPos, myField.value.length);
              myField.value = beforeValue + myValue + afterValue;
              myField.selectionStart = startPos + myValue.length;
              myField.selectionEnd = startPos + myValue.length;
              myField.focus()
          } else {
              myField.value += myValue;
              myField.focus()
          }
      }
  };

  // http://stackoverflow.com/questions/2176861/javascript-get-clipboard-data-on-paste-event-cross-browser
  document.addEventListener('DOMContentLoaded', function () {
    var info = document.querySelector('#info');
    var pastebin = document.querySelector('#pastebin');
    var output = document.querySelector('#output');
    var wrapper = document.querySelector('#wrapper');

    document.addEventListener('keydown', function (event) {
      if (event.ctrlKey || event.metaKey) {
        if (String.fromCharCode(event.which).toLowerCase() === 'v') {
          pastebin.innerHTML = '';
          pastebin.focus();
          info.classList.add('hidden');
          wrapper.classList.add('hidden');
        }
      }
    });

    pastebin.addEventListener('paste', function () {
      setTimeout(function () {
        var markdown = convert(pastebin);
        // output.value = markdown;
        insert(output, markdown);
        wrapper.classList.remove('hidden');
        output.focus();
        output.select();
      }, 200);
    });
  });
})();
