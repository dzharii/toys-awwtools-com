(function () {
  const App = window.App = window.App || {};

  function insertAtCursor(value, selectionStart, selectionEnd, insertText) {
    const before = value.slice(0, selectionStart);
    const after = value.slice(selectionEnd);
    const newValue = before + insertText + after;
    const newPos = before.length + insertText.length;
    return {
      value: newValue,
      selectionStart: newPos,
      selectionEnd: newPos
    };
  }

  function appendToEnd(value, selectionStart, selectionEnd, insertText) {
    const newValue = value + insertText;
    const newPos = newValue.length;
    return {
      value: newValue,
      selectionStart: newPos,
      selectionEnd: newPos
    };
  }

  function prependToStart(value, selectionStart, selectionEnd, insertText) {
    const newValue = insertText + value;
    const newPos = insertText.length;
    return {
      value: newValue,
      selectionStart: newPos,
      selectionEnd: newPos
    };
  }

  function insertOnNewLineAtCursor(value, selectionStart, selectionEnd, insertText) {
    const before = value.slice(0, selectionStart);
    const after = value.slice(selectionEnd);
    const needsLeadingNewline = selectionStart > 0 && value.charAt(selectionStart - 1) !== "\n";
    const needsTrailingNewline = selectionEnd < value.length && value.charAt(selectionEnd) !== "\n";
    const prefix = needsLeadingNewline ? "\n" : "";
    const suffix = needsTrailingNewline ? "\n" : "";
    const newValue = before + prefix + insertText + suffix + after;
    const newPos = (before + prefix + insertText).length;
    return {
      value: newValue,
      selectionStart: newPos,
      selectionEnd: newPos
    };
  }

  function appendOnNewLineAtEnd(value, selectionStart, selectionEnd, insertText, config) {
    const needsLeadingNewline = value.length > 0 && value.charAt(value.length - 1) !== "\n";
    const prefix = needsLeadingNewline ? "\n" : "";
    const suffix = config && config.trailingNewline ? "\n" : "";
    const newValue = value + prefix + insertText + suffix;
    const newPos = newValue.length;
    return {
      value: newValue,
      selectionStart: newPos,
      selectionEnd: newPos
    };
  }

  function delimiterPrefixed(value, selectionStart, selectionEnd, insertText, config) {
    const delimiter = (config && typeof config.delimiter === "string") ? config.delimiter : ", ";
    return insertAtCursor(value, selectionStart, selectionEnd, delimiter + insertText);
  }

  function delimiterSuffixed(value, selectionStart, selectionEnd, insertText, config) {
    const delimiter = (config && typeof config.delimiter === "string") ? config.delimiter : ", ";
    return insertAtCursor(value, selectionStart, selectionEnd, insertText + delimiter);
  }

  const catalog = [
    {
      id: "insertAtCursor",
      label: "Insert at cursor",
      apply: insertAtCursor
    },
    {
      id: "replaceSelection",
      label: "Replace selection",
      apply: insertAtCursor
    },
    {
      id: "appendToEnd",
      label: "Append to end",
      apply: appendToEnd
    },
    {
      id: "prependToStart",
      label: "Prepend to start",
      apply: prependToStart
    },
    {
      id: "insertOnNewLineAtCursor",
      label: "Insert on new line at cursor",
      apply: insertOnNewLineAtCursor
    },
    {
      id: "appendOnNewLineAtEnd",
      label: "Append on new line at end",
      apply: appendOnNewLineAtEnd
    },
    {
      id: "delimiterPrefix",
      label: "Delimiter-prefixed insertion",
      apply: delimiterPrefixed,
      config: {
        delimiter: ", "
      }
    },
    {
      id: "delimiterSuffix",
      label: "Delimiter-suffixed insertion",
      apply: delimiterSuffixed,
      config: {
        delimiter: ", "
      }
    }
  ];

  function getMode(id) {
    return catalog.find((mode) => mode.id === id) || null;
  }

  App.insertion = {
    getCatalog: function () {
      return catalog.slice();
    },
    getMode: getMode
  };
})();
