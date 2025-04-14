(function() {
  // Prevent multiple instances
  if (document.getElementById('hw-hacker-console')) {
    document.getElementById('hw-hacker-console').remove();
  }

  // Create an isolated container and attach Shadow DOM if possible
  const container = document.createElement('div');
  container.id = 'hw-hacker-console-container';
  document.body.appendChild(container);

  let consoleRoot;
  let shadowRoot;
  try {
    shadowRoot = container.attachShadow({ mode: 'open' });
    consoleRoot = shadowRoot;
  } catch (e) {
    consoleRoot = container;
  }

  // Inject CSS styles with !important to override host page styles
  const styles = `
    :host { all: initial; }
    * { box-sizing: border-box !important; }
    #hw-hacker-console {
      position: fixed !important;
      top: 50px !important;
      left: 50px !important;
      width: 600px !important;
      height: 400px !important;
      min-width: 300px !important;
      min-height: 200px !important;
      max-height: 80vh !important;
      background-color: rgba(0, 10, 0, 0.95) !important;
      border: 1px solid #0f0 !important;
      border-radius: 5px !important;
      box-shadow: 0 0 10px #0f0, 0 0 20px rgba(0, 255, 0, 0.5) !important;
      color: #0f0 !important;
      font-family: 'Courier New', monospace !important;
      z-index: 2147483647 !important;
      display: flex !important;
      flex-direction: column !important;
      overflow: hidden !important;
      transition: all 0.3s ease !important;
      padding: 0 !important;
      margin: 0 !important;
      backdrop-filter: blur(2px) !important;
    }
    #hw-hacker-console.minimized {
      width: 200px !important;
      height: 40px !important;
      min-height: 40px !important;
      overflow: hidden !important;
      left: 10px !important;
      top: 10px !important;
    }
    #hw-hacker-header {
      padding: 10px !important;
      background-color: rgba(0, 40, 0, 0.9) !important;
      cursor: move !important;
      display: flex !important;
      justify-content: space-between !important;
      align-items: center !important;
      border-bottom: 1px solid #0f0 !important;
      user-select: none !important;
      font-size: 14px !important;
      touch-action: none !important;
    }
    #hw-hacker-title {
      font-weight: bold !important;
      text-transform: uppercase !important;
      letter-spacing: 2px !important;
      font-size: 14px !important;
      color: #0f0 !important;
    }
    #hw-hacker-controls {
      display: flex !important;
      gap: 10px !important;
    }
    .hw-hacker-btn {
      background: none !important;
      border: 1px solid #0f0 !important;
      color: #0f0 !important;
      font-family: 'Courier New', monospace !important;
      font-size: 12px !important;
      cursor: pointer !important;
      transition: all 0.2s ease !important;
      padding: 2px 8px !important;
      border-radius: 3px !important;
      margin: 0 !important;
      outline: none !important;
    }
    .hw-hacker-btn:hover {
      background-color: rgba(0, 255, 0, 0.2) !important;
      box-shadow: 0 0 5px #0f0 !important;
    }
    #hw-hacker-output {
      flex: 1 !important;
      overflow-y: auto !important;
      padding: 10px !important;
      display: flex !important;
      flex-direction: column !important;
      gap: 10px !important;
      scrollbar-width: thin !important;
      scrollbar-color: #0f0 rgba(0, 20, 0, 0.5) !important;
      font-size: 14px !important;
    }
    #hw-hacker-output::-webkit-scrollbar {
      width: 8px !important;
    }
    #hw-hacker-output::-webkit-scrollbar-track {
      background: rgba(0, 20, 0, 0.5) !important;
    }
    #hw-hacker-output::-webkit-scrollbar-thumb {
      background-color: #0f0 !important;
      border-radius: 10px !important;
    }
    #hw-hacker-input-container {
      display: flex !important;
      padding: 10px !important;
      background-color: rgba(0, 30, 0, 0.9) !important;
      border-top: 1px solid #0f0 !important;
      font-size: 14px !important;
    }
    #hw-hacker-prompt {
      color: #0f0 !important;
      margin-right: 5px !important;
      font-weight: bold !important;
      font-size: 14px !important;
    }
    #hw-hacker-input {
      flex: 1 !important;
      background: none !important;
      border: none !important;
      color: #0f0 !important;
      font-family: 'Courier New', monospace !important;
      font-size: 14px !important;
      outline: none !important;
      padding: 0 !important;
      margin: 0 !important;
      width: auto !important;
    }
    .hw-hacker-entry {
      margin-bottom: 10px !important;
      position: relative !important;
    }
    .hw-hacker-cmd {
      padding: 5px !important;
      color: #0ff !important;
      font-style: italic !important;
      border-left: 2px solid #0ff !important;
      margin-bottom: 5px !important;
      font-size: 14px !important;
    }
    .hw-hacker-result {
      padding: 10px !important;
      background-color: rgba(0, 50, 0, 0.3) !important;
      border-radius: 3px !important;
      white-space: pre-wrap !important;
      overflow: hidden !important;
      position: relative !important;
      font-size: 14px !important;
    }
    .hw-hacker-result.truncated {
      max-height: 300px !important;
      overflow-y: hidden !important;
    }
    .hw-hacker-truncated-fade {
      position: absolute !important;
      bottom: 0 !important;
      left: 0 !important;
      right: 0 !important;
      height: 60px !important;
      background: linear-gradient(transparent, rgba(0, 40, 0, 0.9)) !important;
      pointer-events: none !important;
    }
    .hw-hacker-show-more {
      position: absolute !important;
      bottom: 0 !important;
      right: 0 !important;
      background: rgba(0, 40, 0, 0.9) !important;
      color: #0f0 !important;
      border: 1px solid #0f0 !important;
      padding: 3px 10px !important;
      cursor: pointer !important;
      font-size: 12px !important;
      z-index: 1 !important;
      margin: 0 !important;
    }
    .hw-hacker-show-more:hover {
      background-color: rgba(0, 255, 0, 0.2) !important;
    }
    .hw-hacker-copy-btn {
      position: absolute !important;
      top: 5px !important;
      right: 5px !important;
      background: rgba(0, 40, 0, 0.8) !important;
      color: #0f0 !important;
      border: 1px solid #0f0 !important;
      padding: 3px 8px !important;
      border-radius: 3px !important;
      font-size: 12px !important;
      cursor: pointer !important;
      opacity: 0 !important;
      transition: opacity 0.2s ease !important;
      z-index: 1 !important;
      margin: 0 !important;
    }
    .hw-hacker-entry:hover .hw-hacker-copy-btn {
      opacity: 1 !important;
    }
    .hw-hacker-notification {
      position: fixed !important;
      top: 20px !important;
      right: 20px !important;
      background: rgba(0, 40, 0, 0.9) !important;
      color: #0f0 !important;
      border: 1px solid #0f0 !important;
      padding: 5px 10px !important;
      border-radius: 3px !important;
      z-index: 2147483647 !important;
      font-family: 'Courier New', monospace !important;
      font-size: 14px !important;
      animation: hw-fade-out 1.5s forwards !important;
    }
    @keyframes hw-fade-out {
      0% { opacity: 1; }
      70% { opacity: 1; }
      100% { opacity: 0; }
    }
    .hw-hacker-error {
      color: #f66 !important;
      border-left: 2px solid #f66 !important;
      padding: 5px !important;
      font-size: 14px !important;
    }
    .hw-hacker-json {
      font-family: 'Courier New', monospace !important;
      font-size: 13px !important;
    }
    .hw-hacker-json-key {
      color: #0ff !important;
    }
    .hw-hacker-json-string {
      color: #ff0 !important;
    }
    .hw-hacker-json-number {
      color: #f90 !important;
    }
    .hw-hacker-json-boolean {
      color: #f0f !important;
    }
    .hw-hacker-json-null {
      color: #999 !important;
    }
    .hw-hacker-expandable {
      cursor: pointer !important;
      user-select: none !important;
    }
    .hw-hacker-expandable:hover {
      text-decoration: underline !important;
    }
    #hw-hacker-resize-handle {
      position: absolute !important;
      bottom: 0 !important;
      right: 0 !important;
      width: 20px !important;
      height: 20px !important;
      cursor: nwse-resize !important;
      z-index: 2 !important;
      touch-action: none !important;
      user-select: none !important;
    }
    #hw-hacker-resize-icon {
      position: absolute !important;
      bottom: 3px !important;
      right: 3px !important;
      width: 14px !important;
      height: 14px !important;
      display: flex !important;
      flex-direction: column !important;
      justify-content: flex-end !important;
      align-items: flex-end !important;
    }
    .hw-hacker-resize-dot {
      width: 2px !important;
      height: 2px !important;
      background-color: #0f0 !important;
      margin: 1px !important;
      box-shadow: 0 0 2px #0f0 !important;
    }
    .hw-hacker-resize-row {
      display: flex !important;
      justify-content: flex-end !important;
    }
  `;
  const styleElement = document.createElement('style');
  styleElement.textContent = styles;
  consoleRoot.appendChild(styleElement);

  // Build console structure
  const consoleElement = document.createElement('div');
  consoleElement.id = 'hw-hacker-console';

  // Header
  const headerElement = document.createElement('div');
  headerElement.id = 'hw-hacker-header';
  const titleElement = document.createElement('div');
  titleElement.id = 'hw-hacker-title';
  titleElement.textContent = 'HOLLYWOOD HACKER CONSOLE';
  const controlsElement = document.createElement('div');
  controlsElement.id = 'hw-hacker-controls';
  const minimizeButton = document.createElement('button');
  minimizeButton.className = 'hw-hacker-btn';
  minimizeButton.textContent = '_';
  minimizeButton.title = 'Minimize console';
  const clearButton = document.createElement('button');
  clearButton.className = 'hw-hacker-btn';
  clearButton.textContent = 'Clear';
  clearButton.title = 'Clear console output';
  const closeButton = document.createElement('button');
  closeButton.className = 'hw-hacker-btn';
  closeButton.textContent = 'X';
  closeButton.title = 'Close console';
  controlsElement.appendChild(minimizeButton);
  controlsElement.appendChild(clearButton);
  controlsElement.appendChild(closeButton);
  headerElement.appendChild(titleElement);
  headerElement.appendChild(controlsElement);

  // Output area
  const outputElement = document.createElement('div');
  outputElement.id = 'hw-hacker-output';

  // Input container
  const inputContainerElement = document.createElement('div');
  inputContainerElement.id = 'hw-hacker-input-container';
  const promptElement = document.createElement('div');
  promptElement.id = 'hw-hacker-prompt';
  promptElement.textContent = '>';
  const inputElement = document.createElement('input');
  inputElement.id = 'hw-hacker-input';
  inputElement.type = 'text';
  inputElement.placeholder = 'Enter JavaScript command...';
  inputElement.autocomplete = 'off';
  inputElement.spellcheck = false;
  inputContainerElement.appendChild(promptElement);
  inputContainerElement.appendChild(inputElement);

  // Custom resize handle
  const resizeHandle = document.createElement('div');
  resizeHandle.id = 'hw-hacker-resize-handle';
  const resizeIcon = document.createElement('div');
  resizeIcon.id = 'hw-hacker-resize-icon';
  for (let i = 0; i < 3; i++) {
    const row = document.createElement('div');
    row.className = 'hw-hacker-resize-row';
    for (let j = 0; j < 3 - i; j++) {
      const dot = document.createElement('div');
      dot.className = 'hw-hacker-resize-dot';
      row.appendChild(dot);
    }
    resizeIcon.appendChild(row);
  }
  resizeHandle.appendChild(resizeIcon);

  // Assemble console
  consoleElement.appendChild(headerElement);
  consoleElement.appendChild(outputElement);
  consoleElement.appendChild(inputContainerElement);
  consoleElement.appendChild(resizeHandle);
  consoleRoot.appendChild(consoleElement);

  // Command history variables
  const commandHistory = [];
  let historyIndex = -1;
  let tempCommand = '';

  // Helper: escape HTML
  function escapeHTML(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // Helper: format JSON with syntax highlighting and collapsible sections
  function formatJSON(json, indentLevel = 0) {
    if (typeof json !== 'object' || json === null) {
      if (typeof json === 'string') {
        return `<span class="hw-hacker-json-string">"${escapeHTML(json)}"</span>`;
      } else if (typeof json === 'number') {
        return `<span class="hw-hacker-json-number">${json}</span>`;
      } else if (typeof json === 'boolean') {
        return `<span class="hw-hacker-json-boolean">${json}</span>`;
      } else {
        return `<span class="hw-hacker-json-null">null</span>`;
      }
    }
    const isArray = Array.isArray(json);
    const indent = '  '.repeat(indentLevel);
    const indentInner = '  '.repeat(indentLevel + 1);
    let result = isArray ? '[' : '{';
    const expanderId = `hw-expander-${Math.random().toString(36).substr(2, 9)}`;
    result = `<span class="hw-hacker-expandable" data-expander="${expanderId}">${result}</span><div id="${expanderId}" style="display:none;">`;
    const entries = Object.entries(json);
    for (let i = 0; i < entries.length; i++) {
      const [key, value] = entries[i];
      result += `\n${indentInner}`;
      if (!isArray) {
        result += `<span class="hw-hacker-json-key">"${escapeHTML(key)}"</span>: `;
      }
      result += formatJSON(value, indentLevel + 1);
      if (i < entries.length - 1) {
        result += ',';
      }
    }
    result += `\n${indent}` + (isArray ? ']' : '}') + '</div>';
    return result;
  }

  // Add output entry to the console
  function addOutputEntry(command, result, isError = false) {
    const entryElement = document.createElement('div');
    entryElement.className = 'hw-hacker-entry';

    const cmdElement = document.createElement('div');
    cmdElement.className = 'hw-hacker-cmd';
    cmdElement.textContent = command;
    entryElement.appendChild(cmdElement);

    const resultElement = document.createElement('div');
    resultElement.className = 'hw-hacker-result';
    if (isError) {
      resultElement.innerHTML = `<div class="hw-hacker-error">${escapeHTML(result.toString())}</div>`;
    } else {
      try {
        let formattedOutput = '';
        if (typeof result === 'object' && result !== null) {
          formattedOutput = `<div class="hw-hacker-json">${formatJSON(result)}</div>`;
        } else if (typeof result === 'string') {
          try {
            const jsonObj = JSON.parse(result);
            formattedOutput = `<div class="hw-hacker-json">${formatJSON(jsonObj)}</div>`;
          } catch (e) {
            formattedOutput = escapeHTML(result.toString());
          }
        } else {
          formattedOutput = escapeHTML(result.toString());
        }
        resultElement.innerHTML = formattedOutput;
      } catch (e) {
        resultElement.textContent = result.toString();
      }
    }

    const copyButton = document.createElement('button');
    copyButton.className = 'hw-hacker-copy-btn';
    copyButton.textContent = 'Copy';
    copyButton.onclick = () => {
      let textToCopy;
      if (isError) {
        textToCopy = result.toString();
      } else if (typeof result === 'object') {
        textToCopy = JSON.stringify(result, null, 2);
      } else {
        textToCopy = result.toString();
      }
      navigator.clipboard.writeText(textToCopy)
        .then(() => showNotification('Copied to clipboard!'))
        .catch(err => showNotification('Failed to copy: ' + err));
    };

    entryElement.appendChild(copyButton);
    entryElement.appendChild(resultElement);
    outputElement.appendChild(entryElement);
    outputElement.scrollTop = outputElement.scrollHeight;

    const expandables = entryElement.querySelectorAll('.hw-hacker-expandable');
    expandables.forEach(expandable => {
      const expanderId = expandable.getAttribute('data-expander');
      const content = document.getElementById(expanderId);
      if (content) {
        content.style.display = 'none';
        expandable.innerHTML += '...';
        expandable.addEventListener('click', (e) => {
          e.stopPropagation();
          if (content.style.display === 'none') {
            content.style.display = '';
            expandable.innerHTML = expandable.innerHTML.replace('...', '');
          } else {
            content.style.display = 'none';
            if (!expandable.innerHTML.includes('...')) {
              expandable.innerHTML += '...';
            }
          }
        });
      }
    });
  }

  // Execute the command and capture output
  function executeCommand(command) {
    if (!command.trim()) return;
    if (commandHistory.length === 0 || commandHistory[commandHistory.length - 1] !== command) {
      commandHistory.push(command);
    }
    historyIndex = commandHistory.length;
    try {
      const result = (function() {
        try {
          return eval.call(window, command);
        } catch (e) {
          return e;
        }
      })();
      if (result instanceof Error) {
        addOutputEntry(command, result, true);
      } else {
        addOutputEntry(command, result);
      }
    } catch (error) {
      addOutputEntry(command, error, true);
    }
  }

  // Notification function
  function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'hw-hacker-notification';
    notification.textContent = message;
    document.body.appendChild(notification);
    setTimeout(() => {
      notification.remove();
    }, 1500);
  }

  // Input event handling for command execution and history navigation
  inputElement.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      const command = inputElement.value;
      inputElement.value = '';
      executeCommand(command);
      e.stopPropagation();
    } else if (e.key === 'ArrowUp') {
      if (historyIndex === commandHistory.length) {
        tempCommand = inputElement.value;
      }
      historyIndex = Math.max(0, historyIndex - 1);
      inputElement.value = commandHistory[historyIndex] || '';
      setTimeout(() => {
        inputElement.selectionStart = inputElement.value.length;
        inputElement.selectionEnd = inputElement.value.length;
      }, 0);
      e.preventDefault();
      e.stopPropagation();
    } else if (e.key === 'ArrowDown') {
      historyIndex = Math.min(commandHistory.length, historyIndex + 1);
      if (historyIndex === commandHistory.length) {
        inputElement.value = tempCommand;
      } else {
        inputElement.value = commandHistory[historyIndex] || '';
      }
      setTimeout(() => {
        inputElement.selectionStart = inputElement.value.length;
        inputElement.selectionEnd = inputElement.value.length;
      }, 0);
      e.preventDefault();
      e.stopPropagation();
    }
  }, true);

  // Clear output functionality
  clearButton.addEventListener('click', (e) => {
    e.stopPropagation();
    while (outputElement.firstChild) {
      outputElement.removeChild(outputElement.firstChild);
    }
  });

  // Minimize / Restore functionality
  let isMinimized = false;
  minimizeButton.addEventListener('click', (e) => {
    e.stopPropagation();
    isMinimized = !isMinimized;
    if (isMinimized) {
      consoleElement.classList.add('minimized');
      titleElement.textContent = 'HC';
      inputContainerElement.style.display = 'none';
      outputElement.style.display = 'none';
      resizeHandle.style.display = 'none';
      minimizeButton.textContent = '□';
      if (parseInt(consoleElement.style.top || '50px') > window.innerHeight - 40) {
        consoleElement.style.top = (window.innerHeight - 50) + 'px';
      }
    } else {
      consoleElement.classList.remove('minimized');
      titleElement.textContent = 'HOLLYWOOD HACKER CONSOLE';
      inputContainerElement.style.display = '';
      outputElement.style.display = '';
      resizeHandle.style.display = '';
      minimizeButton.textContent = '_';
      const rect = consoleElement.getBoundingClientRect();
      if (rect.right > window.innerWidth) {
        consoleElement.style.left = Math.max(0, window.innerWidth - rect.width - 10) + 'px';
      }
      if (rect.bottom > window.innerHeight) {
        consoleElement.style.top = Math.max(0, window.innerHeight - rect.height - 10) + 'px';
      }
    }
  });

  // Close console functionality
  closeButton.addEventListener('click', (e) => {
    e.stopPropagation();
    container.remove();
  });

  // Drag functionality for header (mouse)
  let isDragging = false, dragOffsetX = 0, dragOffsetY = 0;
  headerElement.addEventListener('mousedown', (e) => {
    if (e.button !== 0) return;
    isDragging = true;
    const rect = consoleElement.getBoundingClientRect();
    dragOffsetX = e.clientX - rect.left;
    dragOffsetY = e.clientY - rect.top;
    consoleElement.style.zIndex = '2147483647';
    e.preventDefault();
    e.stopPropagation();
  });
  document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    let newLeft = e.clientX - dragOffsetX;
    let newTop = e.clientY - dragOffsetY;
    const rect = consoleElement.getBoundingClientRect();
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    const minVisibleX = Math.min(100, rect.width * 0.2);
    const minVisibleY = Math.min(40, rect.height * 0.2);
    newLeft = Math.min(windowWidth - minVisibleX, Math.max(-rect.width + minVisibleX, newLeft));
    newTop = Math.min(windowHeight - minVisibleY, Math.max(-rect.height + minVisibleY, newTop));
    consoleElement.style.left = newLeft + 'px';
    consoleElement.style.top = newTop + 'px';
    e.preventDefault();
    e.stopPropagation();
  });
  document.addEventListener('mouseup', (e) => {
    if (isDragging) {
      isDragging = false;
      e.preventDefault();
      e.stopPropagation();
    }
  });

  // Touch drag support
  headerElement.addEventListener('touchstart', (e) => {
    if (e.touches.length !== 1) return;
    const touch = e.touches[0];
    isDragging = true;
    const rect = consoleElement.getBoundingClientRect();
    dragOffsetX = touch.clientX - rect.left;
    dragOffsetY = touch.clientY - rect.top;
    consoleElement.style.zIndex = '2147483647';
    e.preventDefault();
    e.stopPropagation();
  }, { passive: false });
  document.addEventListener('touchmove', (e) => {
    if (!isDragging || e.touches.length !== 1) return;
    const touch = e.touches[0];
    let newLeft = touch.clientX - dragOffsetX;
    let newTop = touch.clientY - dragOffsetY;
    const rect = consoleElement.getBoundingClientRect();
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    const minVisibleX = Math.min(100, rect.width * 0.2);
    const minVisibleY = Math.min(40, rect.height * 0.2);
    newLeft = Math.min(windowWidth - minVisibleX, Math.max(-rect.width + minVisibleX, newLeft));
    newTop = Math.min(windowHeight - minVisibleY, Math.max(-rect.height + minVisibleY, newTop));
    consoleElement.style.left = newLeft + 'px';
    consoleElement.style.top = newTop + 'px';
    e.preventDefault();
    e.stopPropagation();
  }, { passive: false });
  document.addEventListener('touchend', (e) => {
    if (isDragging) {
      isDragging = false;
      e.preventDefault();
      e.stopPropagation();
    }
  });

  // Resize functionality
  let isResizing = false, initialWidth, initialHeight, initialX, initialY;
  function initResize(e) {
    if (isMinimized) return;
    isResizing = true;
    initialWidth = consoleElement.offsetWidth;
    initialHeight = consoleElement.offsetHeight;
    if (e.type === 'mousedown') {
      initialX = e.clientX;
      initialY = e.clientY;
    } else if (e.type === 'touchstart' && e.touches.length === 1) {
      initialX = e.touches[0].clientX;
      initialY = e.touches[0].clientY;
    }
    e.preventDefault();
    e.stopPropagation();
  }
  function doResize(e) {
    if (!isResizing) return;
    let currentX, currentY;
    if (e.type === 'mousemove') {
      currentX = e.clientX;
      currentY = e.clientY;
    } else if (e.type === 'touchmove' && e.touches.length === 1) {
      currentX = e.touches[0].clientX;
      currentY = e.touches[0].clientY;
    } else return;
    const deltaX = currentX - initialX;
    const deltaY = currentY - initialY;
    const newWidth = Math.max(300, initialWidth + deltaX);
    const newHeight = Math.max(200, initialHeight + deltaY);
    consoleElement.style.width = newWidth + 'px';
    consoleElement.style.height = newHeight + 'px';
    e.preventDefault();
    e.stopPropagation();
  }
  function stopResize(e) {
    if (isResizing) {
      isResizing = false;
      e.preventDefault();
      e.stopPropagation();
    }
  }
  resizeHandle.addEventListener('mousedown', initResize);
  resizeHandle.addEventListener('touchstart', initResize, { passive: false });
  document.addEventListener('mousemove', doResize);
  document.addEventListener('mouseup', stopResize);
  document.addEventListener('touchmove', doResize, { passive: false });
  document.addEventListener('touchend', stopResize);

  window.addEventListener('resize', () => {
    const rect = consoleElement.getBoundingClientRect();
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    if (rect.left > windowWidth - 50) {
      consoleElement.style.left = (windowWidth - 100) + 'px';
    }
    if (rect.top > windowHeight - 50) {
      consoleElement.style.top = (windowHeight - 100) + 'px';
    }
  });

  // Initial welcome message
  const now = new Date();
  const dateString = now.toISOString().replace('T', ' ').substr(0, 19);
  addOutputEntry(
    '// Welcome to Hollywood Hacker Console',
    `Hollywood Hacker REPL v1.2.0
UTC: ${dateString}
Date: ${now.toDateString()}
User: ${typeof dzhari !== 'undefined' ? dzhari : 'Anonymous'}
Ready for your commands.

Try: 
  - document.title
  - Object.keys(window)
  - JSON.stringify({a:1, b:{c:2}}, null, 2)
  - new Array(5).fill().map((_, i) => i * i)`,
    false
  );

  inputElement.focus();
})();
