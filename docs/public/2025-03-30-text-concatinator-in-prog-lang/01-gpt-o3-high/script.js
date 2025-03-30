document.addEventListener('DOMContentLoaded', () => {
  const inputTextArea = document.getElementById('inputText');
  const outputTextArea = document.getElementById('outputText');
  const errorDisplay = document.getElementById('errorDisplay');

  const indentationInput = document.getElementById('indentation');
  const quoteStyleInput = document.getElementById('quoteStyle');
  const maxLineWidthInput = document.getElementById('maxLineWidth');
  const concatOperatorInput = document.getElementById('concatOperator');
  const finalSeparatorInput = document.getElementById('finalSeparator');
  const trimOptionSelect = document.getElementById('trimOption');
  const dropEmptyCheckbox = document.getElementById('dropEmpty');

  const copyInputBtn = document.getElementById('copyInputBtn');
  const copyOutputBtn = document.getElementById('copyOutputBtn');

  let debounceTimer;

  // Debounce function to limit the frequency of processing
  function debounce(callback, delay) {
    return function() {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(callback, delay);
    };
  }

  // Function to display error messages
  function displayError(message) {
    errorDisplay.textContent = message;
  }

  // Main transformation function
  function transformText() {
    displayError(''); // Clear previous errors

    // Validate maxLineWidth
    const maxLineWidth = parseInt(maxLineWidthInput.value, 10);
    if (isNaN(maxLineWidth) || maxLineWidth < 1) {
      displayError('Maximum Line Width must be a positive number.');
      outputTextArea.value = '';
      return;
    }

    // Retrieve configurations
    const indentation = indentationInput.value;
    const quoteChar = quoteStyleInput.value || '"';
    const concatOperator = concatOperatorInput.value;
    const finalSeparator = finalSeparatorInput.value;
    const trimOption = trimOptionSelect.value;
    const dropEmpty = dropEmptyCheckbox.checked;

    // Split input text into lines preserving original line breaks
    let lines = inputTextArea.value.split('\n');

    // Process each line: apply trim and drop empty lines if required
    const processedLines = lines.map(line => {
      let trimmedLine = line;
      if (trimOption === 'left') {
        trimmedLine = trimmedLine.trimStart();
      } else if (trimOption === 'right') {
        trimmedLine = trimmedLine.trimEnd();
      } else if (trimOption === 'all') {
        trimmedLine = trimmedLine.trim();
      }
      return trimmedLine;
    }).filter(line => dropEmpty ? line.length > 0 : true);

    // Function to split a single line into chunks based on available width
    function splitLineIntoChunks(content, availableNonFinal, availableFinal) {
      let chunks = [];
      let index = 0;
      const len = content.length;
      while (index < len) {
        // Decide available length for this chunk
        const remaining = len - index;
        let available = remaining > availableNonFinal ? availableNonFinal : availableFinal;
        let chunk = content.substr(index, available);
        chunks.push(chunk);
        index += available;
      }
      return chunks;
    }

    // Build formatted output lines
    const formattedLines = [];
    processedLines.forEach((lineContent, i) => {
      // Determine if this is the final original line
      const isFinalOriginalLine = (i === processedLines.length - 1);
      // Prepare the raw string literal content (without quotes and indentation)
      // Determine the operator lengths for splitting
      // For non-final chunks always add concatOperator length; for the final chunk, if final original line then use finalSeparator if provided
      const operatorLengthNonFinal = concatOperator.length;
      const operatorLengthFinal = isFinalOriginalLine ? finalSeparator.length : concatOperator.length;
      
      // Calculate available characters for the text content within quotes per line
      const baseOverheadNonFinal = indentation.length + (2 /* for quotes */) + operatorLengthNonFinal;
      const baseOverheadFinal = indentation.length + (2 /* for quotes */) + operatorLengthFinal;
      const availableNonFinal = maxLineWidth - baseOverheadNonFinal;
      const availableFinal = maxLineWidth - baseOverheadFinal;
      
      if (availableNonFinal < 1 || availableFinal < 1) {
        displayError('Maximum Line Width is too small for the current configuration.');
        outputTextArea.value = '';
        return;
      }
      
      // If the entire content fits without splitting, do that.
      if (lineContent.length <= availableFinal) {
        let lineStr = indentation + quoteChar + lineContent + quoteChar;
        // Append operator if not final original line or if finalSeparator is provided for final line
        if (!isFinalOriginalLine || (isFinalOriginalLine && finalSeparator)) {
          lineStr += isFinalOriginalLine ? finalSeparator : concatOperator;
        }
        formattedLines.push(lineStr);
      } else {
        // Split the content into chunks
        const chunks = splitLineIntoChunks(lineContent, availableNonFinal, availableFinal);
        chunks.forEach((chunk, j) => {
          // For chunks, decide if this is the final chunk of this original line
          const isFinalChunk = (j === chunks.length - 1);
          let lineStr = indentation + quoteChar + chunk + quoteChar;
          if (!isFinalChunk || (!isFinalChunk && !isFinalOriginalLine)) {
            // For non-final chunks, always add concatOperator.
            lineStr += concatOperator;
          } else {
            // For final chunk of the original line: if this is not the final original line, add concatOperator.
            // If it is the final original line, add finalSeparator if provided.
            lineStr += isFinalOriginalLine ? finalSeparator : concatOperator;
          }
          formattedLines.push(lineStr);
        });
      }
    });

    outputTextArea.value = formattedLines.join('\n');
  }

  // Attach event listeners with debounce for real-time transformation
  const debouncedTransform = debounce(transformText, 300);
  inputTextArea.addEventListener('input', debouncedTransform);
  indentationInput.addEventListener('input', debouncedTransform);
  quoteStyleInput.addEventListener('input', debouncedTransform);
  maxLineWidthInput.addEventListener('input', debouncedTransform);
  concatOperatorInput.addEventListener('input', debouncedTransform);
  finalSeparatorInput.addEventListener('input', debouncedTransform);
  trimOptionSelect.addEventListener('change', debouncedTransform);
  dropEmptyCheckbox.addEventListener('change', debouncedTransform);

  // Copy to clipboard functionality
  copyInputBtn.addEventListener('click', () => {
    inputTextArea.select();
    document.execCommand('copy');
  });

  copyOutputBtn.addEventListener('click', () => {
    outputTextArea.select();
    document.execCommand('copy');
  });
});

