(function() {
  "use strict";
  if (document.getElementById('hc-console-container')) return;

  // Create and inject CSS with a complete reset for our console container.
  var css = `
    /* Reset styles inside our container */
    #hc-console-container, #hc-console-container * {
      all: unset;
      box-sizing: border-box;
      font-family: monospace;
    }
    /* Container styling */
    #hc-console-container {
      position: fixed;
      top: 100px;
      left: 100px;
      width: 600px;
      height: 350px;
      min-width: 300px;
      min-height: 150px;
      background-color: #000;
      border: 2px solid #0f0;
      z-index: 2147483647;
      box-shadow: 0 0 10px #0f0;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }
    /* Header styling for dragging */
    #hc-console-container .hc-header {
      background-color: #111;
      padding: 5px;
      cursor: move;
      display: flex;
      justify-content: space-between;
      align-items: center;
      user-select: none;
    }
    /* Header buttons */
    #hc-console-container .hc-btn {
      background-color: #222;
      color: #0f0;
      border: 1px solid #0f0;
      padding: 2px 4px;
      font-size: 12px;
      margin-left: 5px;
      cursor: pointer;
    }
    /* Body styling */
    #hc-console-container .hc-body {
      flex: 1;
      padding: 5px;
      overflow-y: auto;
      background-color: #000;
      white-space: pre-wrap;
      word-break: break-word;
    }
    /* Footer styling */
    #hc-console-container .hc-footer {
      background-color: #111;
      padding: 5px;
      flex-shrink: 0;
    }
    /* Input styling */
    #hc-console-container .hc-input {
      width: 100%;
      background-color: #000;
      color: #0f0;
      border: 1px solid #0f0;
      padding: 5px;
      resize: none;
    }
    /* Output blocks */
    #hc-console-container .hc-output {
      margin: 5px 0;
      padding: 10px 40px 10px 10px;
      background-color: #000;
      border: 1px solid #0f0;
      position: relative;
    }
    /* Copy button */
    #hc-console-container .hc-copy-btn {
      position: absolute;
      top: 5px;
      right: 5px;
      background-color: #222;
      border: 1px solid #0f0;
      color: #0f0;
      padding: 2px 4px;
      font-size: 10px;
      cursor: pointer;
    }
    /* Resize handle at bottom-right */
    #hc-console-container .hc-resize-handle {
      position: absolute;
      bottom: 0;
      right: 0;
      width: 16px;
      height: 16px;
      background-color: #0f0;
      cursor: se-resize;
    }
  `;
  var styleEl = document.createElement('style');
  styleEl.id = 'hc-console-style';
  styleEl.textContent = css;
  document.head.appendChild(styleEl);

  // Create container and its sub-elements.
  var container = document.createElement('div');
  container.id = 'hc-console-container';
  container.setAttribute('role', 'dialog');
  container.setAttribute('aria-label', 'Developer Console');

  var header = document.createElement('div');
  header.className = 'hc-header';
  var title = document.createElement('span');
  title.textContent = 'Hacking Console';
  var btnContainer = document.createElement('div');
  var minBtn = document.createElement('button');
  minBtn.className = 'hc-btn';
  minBtn.textContent = '–';
  minBtn.setAttribute('aria-label', 'Minimize Console');
  var closeBtn = document.createElement('button');
  closeBtn.className = 'hc-btn';
  closeBtn.textContent = '×';
  closeBtn.setAttribute('aria-label', 'Close Console');
  btnContainer.appendChild(minBtn);
  btnContainer.appendChild(closeBtn);
  header.appendChild(title);
  header.appendChild(btnContainer);

  var body = document.createElement('div');
  body.className = 'hc-body';
  body.setAttribute('role', 'log');

  var footer = document.createElement('div');
  footer.className = 'hc-footer';
  var input = document.createElement('textarea');
  input.className = 'hc-input';
  input.rows = 2;
  input.placeholder = 'Enter JavaScript command (Shift+Enter for newline)...';
  footer.appendChild(input);

  // Append a custom resize handle.
  var resizeHandle = document.createElement('div');
  resizeHandle.className = 'hc-resize-handle';

  container.appendChild(header);
  container.appendChild(body);
  container.appendChild(footer);
  container.appendChild(resizeHandle);
  document.body.appendChild(container);

  // --- DRAGGING LOGIC ---
  var isDragging = false, dragOffsetX = 0, dragOffsetY = 0;
  header.addEventListener('mousedown', function(e) {
    if (e.target.closest('.hc-btn')) return;
    isDragging = true;
    var rect = container.getBoundingClientRect();
    dragOffsetX = e.clientX - rect.left;
    dragOffsetY = e.clientY - rect.top;
    e.preventDefault();
  });
  document.addEventListener('mousemove', function(e) {
    if (!isDragging) return;
    container.style.left = (e.clientX - dragOffsetX) + 'px';
    container.style.top = (e.clientY - dragOffsetY) + 'px';
  });
  document.addEventListener('mouseup', function() {
    isDragging = false;
  });

  // --- RESIZING LOGIC ---
  var isResizing = false, startX, startY, startWidth, startHeight;
  resizeHandle.addEventListener('mousedown', function(e) {
    isResizing = true;
    var rect = container.getBoundingClientRect();
    startX = e.clientX;
    startY = e.clientY;
    startWidth = rect.width;
    startHeight = rect.height;
    e.preventDefault();
    e.stopPropagation();
  });
  document.addEventListener('mousemove', function(e) {
    if (!isResizing) return;
    var newWidth = startWidth + (e.clientX - startX);
    var newHeight = startHeight + (e.clientY - startY);
    if (newWidth >= 300) container.style.width = newWidth + 'px';
    if (newHeight >= 150) container.style.height = newHeight + 'px';
  });
  document.addEventListener('mouseup', function() {
    isResizing = false;
  });

  // --- MINIMIZE / RESTORE LOGIC ---
  var isMinimized = false, originalSize = { width: container.style.width, height: container.style.height };
  minBtn.addEventListener('click', function(e) {
    e.stopPropagation();
    if (!isMinimized) {
      originalSize.width = container.style.width;
      originalSize.height = container.style.height;
      container.style.height = '30px';
      body.style.display = 'none';
      footer.style.display = 'none';
      isMinimized = true;
    } else {
      container.style.width = originalSize.width;
      container.style.height = originalSize.height;
      body.style.display = 'block';
      footer.style.display = 'block';
      isMinimized = false;
    }
  });
  
  // --- CLOSE LOGIC ---
  closeBtn.addEventListener('click', function(e) {
    e.stopPropagation();
    container.remove();
    styleEl.remove();
  });

  // --- COMMAND INPUT HANDLING ---
  var history = [], historyIndex = -1;
  input.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      var command = input.value.trim();
      if (!command) return;
      history.push(command);
      historyIndex = history.length;
      appendOutput('> ' + command);
      executeCommand(command);
      input.value = '';
    } else if (e.key === 'ArrowUp') {
      if (historyIndex > 0) {
        historyIndex--;
        input.value = history[historyIndex];
      }
      e.preventDefault();
    } else if (e.key === 'ArrowDown') {
      if (historyIndex < history.length - 1) {
        historyIndex++;
        input.value = history[historyIndex];
      } else {
        historyIndex = history.length;
        input.value = '';
      }
      e.preventDefault();
    }
  });

  // --- EVALUATION AND OUTPUT ---
  function executeCommand(cmd) {
    var result;
    try {
      result = eval(cmd);
    } catch (ex) {
      result = ex.toString();
    }
    appendOutput(result);
  }

  function appendOutput(content) {
    var outputDiv = document.createElement('div');
    outputDiv.className = 'hc-output';

    // Convert objects to formatted JSON text, simple conversion.
    if (typeof content === 'object' && content !== null) {
      try {
        content = JSON.stringify(content, null, 2);
      } catch (e) {
        // Fallback if JSON.stringify fails.
      }
    }
    var pre = document.createElement('pre');
    pre.textContent = String(content);
    outputDiv.appendChild(pre);

    var copyBtn = document.createElement('div');
    copyBtn.className = 'hc-copy-btn';
    copyBtn.textContent = 'Copy';
    copyBtn.addEventListener('click', function() {
      copyToClipboard(pre.textContent);
      showNotification(outputDiv, 'Copied!');
    });
    outputDiv.appendChild(copyBtn);

    body.appendChild(outputDiv);
    body.scrollTop = body.scrollHeight;
  }

  function copyToClipboard(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text);
    } else {
      var ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      ta.remove();
    }
  }

  function showNotification(parent, message) {
    var note = document.createElement('div');
    note.textContent = message;
    note.style.position = 'absolute';
    note.style.top = '5px';
    note.style.left = '50%';
    note.style.transform = 'translateX(-50%)';
    note.style.backgroundColor = 'rgba(0,0,0,0.8)';
    note.style.padding = '2px 5px';
    note.style.border = '1px solid #0f0';
    note.style.fontSize = '10px';
    note.style.color = '#0f0';
    parent.appendChild(note);
    setTimeout(function(){ note.remove(); }, 1000);
  }
})();
