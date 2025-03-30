
function debounce(fn, delay = 300) {
  let timer = null;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

function getConfig() {
  return {
    indentation: document.getElementById('indentation').value || '',
    quote: document.getElementById('quote').value || '"',
    maxWidth: parseInt(document.getElementById('maxWidth').value, 10),
    concat: document.getElementById('concat').value || '',
    finalSeparator: document.getElementById('finalSeparator').value || '',
    trim: document.getElementById('trim').value,
    dropEmptyLines: document.getElementById('dropEmptyLines').checked
  };
}

function displayError(msg) {
  const errorDisplay = document.getElementById('errorDisplay');
  errorDisplay.style.display = msg ? 'block' : 'none';
  errorDisplay.textContent = msg || '';
}

function formatText(inputText, config) {
  if (isNaN(config.maxWidth) || config.maxWidth <= 0) {
    displayError('Maximum Line Width must be a positive number.');
    return '';
  }

  displayError('');

  let lines = inputText.split('\n');

  if (config.dropEmptyLines) {
    lines = lines.filter(line => line.trim() !== '');
  }

  return lines.map((line, idx) => {
    switch (config.trim) {
      case 'left':
        line = line.trimStart();
        break;
      case 'right':
        line = line.trimEnd();
        break;
      case 'all':
        line = line.trim();
        break;
    }

    const quote = config.quote;
    const indent = config.indentation;
    const concat = config.concat;
    const end = (idx === lines.length - 1) ? config.finalSeparator : concat;

    const parts = [];
    while ((indent + quote + line + quote + end).length > config.maxWidth) {
      const sliceIndex = config.maxWidth - indent.length - quote.length * 2 - end.length;
      let splitPos = sliceIndex;
      while (splitPos > 0 && line[splitPos] !== ' ') splitPos--;
      if (splitPos === 0) splitPos = sliceIndex;

      const chunk = line.slice(0, splitPos);
      parts.push(indent + quote + chunk + quote + concat);
      line = line.slice(splitPos).trimStart();
    }

    parts.push(indent + quote + line + quote + end);
    return parts.join('\n');
  }).join('\n');
}

function updateOutput() {
  const config = getConfig();
  const input = document.getElementById('inputText').value;
  const output = formatText(input, config);
  document.getElementById('outputText').value = output;
}

const debouncedUpdate = debounce(updateOutput, 200);

document.querySelectorAll('input, select, textarea').forEach(el => {
  el.addEventListener('input', debouncedUpdate);
});

function copyToClipboard(id) {
  const el = document.getElementById(id);
  el.select();
  document.execCommand('copy');
}

