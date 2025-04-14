javascript:(function() {
  // Prevent multiple instances
  if (document.getElementById('hw-hacker-console')) {
    document.getElementById('hw-hacker-console').remove();
  }
  
  // Create isolated container using Shadow DOM if supported
  const container = document.createElement('div');
  container.id = 'hw-hacker-console-container';
  document.body.appendChild(container);
  
  // Setup Shadow DOM if available or fallback to direct styling
  let consoleRoot;
  let shadowRoot;
  
  try {
    shadowRoot = container.attachShadow({mode: 'open'});
    consoleRoot = shadowRoot;
  } catch (e) {
    consoleRoot = container;
  }
  
  // CSS styles for the console with !important flags on critical properties
  const styles = `
    :host {
      all: initial;
    }
    
    * {
      box-sizing: border-box !important;
    }
    
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
      margin: 0 !important;
      padding: 0 !important;
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
    
    /* JSON formatting styles */
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

  // Create and inject style element
  const styleElement = document.createElement('style');
  styleElement.textContent = styles;
  consoleRoot.appendChild(styleElement);

  // Create console DOM structure
  const consoleElement = document.createElement('div');
  consoleElement.id = 'hw-hacker-console';
  
  // Create console header
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
  
  // Create console output area
  const outputElement = document.createElement('div');
  outputElement.id = 'hw-hacker-output';
  
  // Create input container
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
  
  // Create custom resize handle
  const resizeHandle = document.createElement('div');
  resizeHandle.id = 'hw-hacker-resize-handle';
  
  const resizeIcon = document.createElement('div');
  resizeIcon.id = 'hw-hacker-resize-icon';
  
  // Create the dot pattern for the resize icon
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

  // Command history functionality
  const commandHistory = [];
  let historyIndex = -1;
  let tempCommand = '';

  // Track event listeners for proper cleanup
  const eventListeners = [];
  
  function addEventListenerWithCleanup(element, event, handler, options) {
    element.addEventListener(event, handler, options);
    eventListeners.push({ element, event, handler, options });
  }

  // Helper functions
  function showNotification(message) {
    // Create notification in document body (outside shadow DOM) for visibility
    const notification = document.createElement('div');
    notification.className = 'hw-hacker-notification';
    notification.textContent = message;
    notification.style.position = 'fixed';
    notification.style.top = '20px';
    notification.style.right = '20px';
    notification.style.backgroundColor = 'rgba(0, 40, 0, 0.9)';
    notification.style.color = '#0f0';
    notification.style.border = '1px solid #0f0';
    notification.style.padding = '5px 10px';
    notification.style.borderRadius = '3px';
    notification.style.zIndex = '2147483647';
    notification.style.fontFamily = "'Courier New', monospace";
    notification.style.fontSize = '14px';
    notification.style.animation = 'hw-fade-out 1.5s forwards';
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.remove();
    }, 1500);
  }

  // Format JSON output with syntax highlighting and collapsible sections
  function formatJSON(json, indentLevel = 0) {
    if (typeof json !== 'object' || json === null) {
      // Handle primitive values
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

    const indent = '  '.repeat(indentLevel);
    const indentInner = '  '.repeat(indentLevel + 1);
    const isArray = Array.isArray(json);
    
    if (Object.keys(json).length === 0) {
      return isArray ? '[]' : '{}';
    }

    let result = isArray ? '[' : '{';
    const expanderId = `hw-expander-${Math.random().toString(36).substr(2, 9)}`;
    result = `<span class="hw-hacker-expandable" data-expander="${expanderId}">${result}</span><div id="${expanderId}">`;

    const entries = Object.entries(json);
    for (let i = 0; i < entries.length; i++) {
      const [key, value] = entries[i];
      result += '\n' + indentInner;
      
      if (!isArray) {
        result += `<span class="hw-hacker-json-key">"${escapeHTML(key)}"</span>: `;
      }
      
      result += formatJSON(value, indentLevel + 1);
      
      if (i < entries.length - 1) {
        result += ',';
      }
    }

    result += `\n${indent}` + (isArray ? ']' : '}');
    result += '</div>';
    
    return result;
  }

  function escapeHTML(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // Add an entry to the output
  function addOutputEntry(command, result, isError = false) {
    const entryElement = document.createElement('div');
    entryElement.className = 'hw-hacker-entry';
    
    // Command section
    const cmdElement = document.createElement('div');
    cmdElement.className = 'hw-hacker-cmd';
    cmdElement.textContent = command;
    entryElement.appendChild(cmdElement);
    
    // Result section
    const resultElement = document.createElement('div');
    resultElement.className = 'hw-hacker-result';
    
    if (isError) {
      resultElement.innerHTML = `<div class="hw-hacker-error">${escapeHTML(result.toString())}</div>`;
    } else {
      try {
        // Try to parse as JSON if it's a stringified object
        let formattedOutput = '';
        let isJSON = false;
        
        // If result is an object (not string), try to process it as JSON
        if (typeof result === 'object' && result !== null) {
          formattedOutput = `<div class="hw-hacker-json">${formatJSON(result)}</div>`;
          isJSON = true;
        } else if (typeof result === 'string') {
          try {
            // Try to parse string as JSON
            const jsonObj = JSON.parse(result);
            formattedOutput = `<div class="hw-hacker-json">${formatJSON(jsonObj)}</div>`;
            isJSON = true;
          } catch (e) {
            // Not JSON, treat as plain text
            formattedOutput = escapeHTML(result.toString());
          }
        } else {
          // Plain result
          formattedOutput = escapeHTML(result.toString());
        }
        
        resultElement.innerHTML = formattedOutput;
      } catch (e) {
        // Fallback to plain text
        resultElement.textContent = result.toString();
      }
    }
    
    // Add copy button
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
    
    // Check if output needs truncation (using requestAnimationFrame for proper rendering)
    requestAnimationFrame(() => {
      if (resultElement.scrollHeight > 300) {
        resultElement.classList.add('truncated');
        
        const fadeElement = document.createElement('div');
        fadeElement.className = 'hw-hacker-truncated-fade';
        resultElement.appendChild(fadeElement);
        
        const showMoreButton = document.createElement('button');
        showMoreButton.className = 'hw-hacker-show-more';
        showMoreButton.textContent = 'Show More';
        showMoreButton.onclick = (e) => {
          e.stopPropagation(); // Prevent event bubbling
          if (resultElement.classList.contains('truncated')) {
            resultElement.classList.remove('truncated');
            fadeElement.style.display = 'none';
            showMoreButton.textContent = 'Show Less';
          } else {
            resultElement.classList.add('truncated');
            fadeElement.style.display = '';
            showMoreButton.textContent = 'Show More';
          }
        };
        
        resultElement.appendChild(showMoreButton);
      }
    });
    
    outputElement.appendChild(entryElement);
    outputElement.scrollTop = outputElement.scrollHeight;
    
    // Add click handlers for expandable JSON sections
    const expandables = entryElement.querySelectorAll('.hw-hacker-expandable');
    expandables.forEach(expandable => {
      const expanderId = expandable.getAttribute('data-expander');
      const content = document.getElementById(expanderId);
      
      // Start collapsed
      if (content) {
        content.style.display = 'none';
        expandable.innerHTML += '...';
        
        expandable.addEventListener('click', (e) => {
          e.stopPropagation(); // Prevent event bubbling
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

  // REPL Execution function with improved safety
  function executeCommand(command) {
    if (!command.trim()) return;
    
    // Add to history
    if (commandHistory.length === 0 || commandHistory[commandHistory.length - 1] !== command) {
      commandHistory.push(command);
    }
    historyIndex = commandHistory.length;
    
    try {
      // Create a safe execution context
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

  // Event Listeners with improved handling to prevent events leaking to the page
  addEventListenerWithCleanup(inputElement, 'keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) {
      const command = inputElement.value;
      inputElement.value = '';
      executeCommand(command);
      e.preventDefault();
      e.stopPropagation();
    } else if (e.key === 'ArrowUp') {
      // Navigate up in history
      if (historyIndex === commandHistory.length) {
        tempCommand = inputElement.value;
      }
      
      historyIndex = Math.max(0, historyIndex - 1);
      if (historyIndex < commandHistory.length) {
        inputElement.value = commandHistory[historyIndex];
      }
      
      // Move cursor to end
      setTimeout(() => {
        inputElement.selectionStart = inputElement.value.length;
        inputElement.selectionEnd = inputElement.value.length;
      }, 0);
      
      e.preventDefault();
      e.stopPropagation();
    } else if (e.key === 'ArrowDown') {
      // Navigate down in history
      historyIndex = Math.min(commandHistory.length, historyIndex + 1);
      
      if (historyIndex === commandHistory.length) {
        inputElement.value = tempCommand;
      } else {
        inputElement.value = commandHistory[historyIndex];
      }
      
      // Move cursor to end
      setTimeout(() => {
        inputElement.selectionStart = inputElement.value.length;
        inputElement.selectionEnd = inputElement.value.length;
      }, 0);
      
      e.preventDefault();
      e.stopPropagation();
    }
  }, true); // Use capture phase

  // Clear button functionality
  clearButton.addEventListener('click', (e) => {
    e.stopPropagation();
    while (outputElement.firstChild) {
      outputElement.removeChild(outputElement.firstChild);
    }
  });

  // Minimize button functionality
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
      
      // Ensure console remains in view when minimized
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
      
      // Ensure console is visible when restored
      const rect = consoleElement.getBoundingClientRect();
      if (rect.right > window.innerWidth) {
        consoleElement.style.left = Math.max(0, window.innerWidth - rect.width - 10) + 'px';
      }
      if (rect.bottom > window.innerHeight) {
        consoleElement.style.top = Math.max(0, window.innerHeight - rect.height - 10) + 'px';
      }
    }
  });

  // Safely remove all elements and event listeners
  function cleanupConsole() {
    // Remove all registered event listeners
    eventListeners.forEach(({ element, event, handler, options }) => {
      element.removeEventListener(event, handler, options);
    });
    
    // Remove elements from DOM
    if (shadowRoot) {
      container.remove();
    } else {
      consoleElement.remove();
      styleElement.remove();
    }
    
    // Remove any global references
    container.remove();
  }

  // Close button functionality
  closeButton.addEventListener('click', (e) => {
    e.stopPropagation();
    cleanupConsole();
  });

  // Make the console draggable with improved positioning
  let isDragging = false;
  let dragOffsetX, dragOffsetY;

  // Window drag functionality (mouse)
  function initDragging(e) {
    if (e.button !== 0) return; // Only respond to left mouse button
    
    isDragging = true;
    dragOffsetX = e.clientX - consoleElement.getBoundingClientRect().left;
    dragOffsetY = e.clientY - consoleElement.getBoundingClientRect().top;
    
    // Set higher z-index during drag to avoid conflicts
    consoleElement.style.zIndex = '2147483647';
    
    e.preventDefault();
    e.stopPropagation();
  }
  
  function doDragging(e) {
    if (!isDragging) return;
    
    const newLeft = e.clientX - dragOffsetX;
    const newTop = e.clientY - dragOffsetY;
    
    // Calculate visible area to ensure console stays accessible
    const consoleWidth = consoleElement.offsetWidth;
    const consoleHeight = consoleElement.offsetHeight;
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    
    // Keep at least 100px or 20% of width/height (whichever is smaller) visible
    const minVisible = {
      x: Math.min(100, consoleWidth * 0.2),
      y: Math.min(40, consoleHeight * 0.2)
    };
    
    // Calculate boundaries
    const maxLeft = windowWidth - minVisible.x;
    const maxTop = windowHeight - minVisible.y;
    
    // Apply positioning with constraints
    consoleElement.style.left = Math.min(maxLeft, Math.max(-consoleWidth + minVisible.x, newLeft)) + 'px';
    consoleElement.style.top = Math.min(maxTop, Math.max(-consoleHeight + minVisible.y, newTop)) + 'px';
    
    e.preventDefault();
    e.stopPropagation();
  }
  
  function stopDragging(e) {
    if (isDragging) {
      isDragging = false;
      e.preventDefault();
      e.stopPropagation();
    }
  }
  
  // Touch drag functionality
  function initTouchDragging(e) {
    if (e.touches.length !== 1) return;
    
    const touch = e.touches[0];
    isDragging = true;
    dragOffsetX = touch.clientX - consoleElement.getBoundingClientRect().left;
    dragOffsetY = touch.clientY - consoleElement.getBoundingClientRect().top;
    
    // Set higher z-index during drag to avoid conflicts
    consoleElement.style.zIndex = '2147483647';
    
    e.preventDefault();
    e.stopPropagation();
  }
  
  function doTouchDragging(e) {
    if (!isDragging || e.touches.length !== 1) return;
    
    const touch = e.touches[0];
    const newLeft = touch.clientX - dragOffsetX;
    const newTop = touch.clientY - dragOffsetY;
    
    // Calculate visible area to ensure console stays accessible
    const consoleWidth = consoleElement.offsetWidth;
    const consoleHeight = consoleElement.offsetHeight;
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    
    // Keep at least 100px or 20% of width/height (whichever is smaller) visible
    const minVisible = {
      x: Math.min(100, consoleWidth * 0.2),
      y: Math.min(40, consoleHeight * 0.2)
    };
    
    // Calculate boundaries
    const maxLeft = windowWidth - minVisible.x;
    const maxTop = windowHeight - minVisible.y;
    
    // Apply positioning with constraints
    consoleElement.style.left = Math.min(maxLeft, Math.max(-consoleWidth + minVisible.x, newLeft)) + 'px';
    consoleElement.style.top = Math.min(maxTop, Math.max(-consoleHeight + minVisible.y, newTop)) + 'px';
    
    e.preventDefault();
    e.stopPropagation();
  }
  
  function stopTouchDragging(e) {
    if (isDragging) {
      isDragging = false;
      e.preventDefault();
      e.stopPropagation();
    }
  }
  
  // Add drag listeners with both mouse and touch support
  headerElement.addEventListener('mousedown', initDragging);
  headerElement.addEventListener('touchstart', initTouchDragging, { passive: false });

  // Use document-level events with capture for reliable dragging
  addEventListenerWithCleanup(document, 'mousemove', doDragging, { capture: true });
  addEventListenerWithCleanup(document, 'mouseup', stopDragging, { capture: true });
  addEventListenerWithCleanup(document, 'touchmove', doTouchDragging, { capture: true, passive: false });
  addEventListenerWithCleanup(document, 'touchend', stopTouchDragging, { capture: true });
  
  // Custom resize functionality
  let isResizing = false;
  let initialWidth, initialHeight, initialX, initialY;
  
  function initResize(e) {
    if (isMinimized) return;
    
    isResizing = true;
    initialWidth = consoleElement.offsetWidth;
    initialHeight = consoleElement.offsetHeight;
    
    if (e.type === 'mousedown') {
      initialX = e.clientX;
      initialY = e.clientY;
    } else if (e.type === 'touchstart') {
      if (e.touches.length !== 1) return;
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
    } else if (e.type === 'touchmove') {
      if (e.touches.length !== 1) return;
      currentX = e.touches[0].clientX;
      currentY = e.touches[0].clientY;
    } else {
      return;
    }
    
    const deltaX = currentX - initialX;
    const deltaY = currentY - initialY;
    
    const newWidth = Math.max(300, initialWidth + deltaX); // Minimum width of 300px
    const newHeight = Math.max(200, initialHeight + deltaY); // Minimum height of 200px
    
    // Apply new dimensions
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
  
  // Add resize event handlers
  resizeHandle.addEventListener('mousedown', initResize);
  resizeHandle.addEventListener('touchstart', initResize, { passive: false });
  
  addEventListenerWithCleanup(document, 'mousemove', doResize, { capture: true });
  addEventListenerWithCleanup(document, 'mouseup', stopResize, { capture: true });
  addEventListenerWithCleanup(document, 'touchmove', doResize, { capture: true, passive: false });
  addEventListenerWithCleanup(document, 'touchend', stopResize, { capture: true });

  // Prevent console from disappearing if window is resized
  addEventListenerWithCleanup(window, 'resize', () => {
    const rect = consoleElement.getBoundingClientRect();
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    
    // If console is off-screen, bring it back
    if (rect.left > windowWidth - 50) {
      consoleElement.style.left = (windowWidth - 100) + 'px';
    }
    if (rect.top > windowHeight - 50) {
      consoleElement.style.top = (windowHeight - 100) + 'px';
    }
  });

  // Initialize with a welcome message
  const now = new Date();
  
  // Format date as YYYY-MM-DD HH:MM:SS
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

  // Focus input field
  inputElement.focus();
})();