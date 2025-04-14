(() => {
  const promptEl = document.getElementById('prompt');
  const titleEl = document.getElementById('title');
  const iconEl = document.getElementById('icon');
  const modeEls = document.querySelectorAll('input[name="iconMode"]');
  const faIconsEl = document.getElementById('fa-icons');
  const fgEl = document.getElementById('fgcolor');
  const bgEl = document.getElementById('bgcolor');
  const bookmarkletEl = document.getElementById('bookmarklet');
  const canvas = document.getElementById('favicon-canvas');
  const ctx = canvas.getContext('2d');
  const faviconLink = document.getElementById('favicon');
  const emojiContainer = document.getElementById('emoji-list');
  const bookmarkletCodeEl = document.getElementById('bookmarklet-code');

  const emojiList = ['✨', '⚡', '🔥', '💡', '🧠', '🚀', '📎', '💬'];

  const faIconsList = [
    { name: 'Star', char: '\uf005' },
    { name: 'Heart', char: '\uf004' },
    { name: 'Smile', char: '\uf118' },
    { name: 'Rocket', char: '\uf135' }
  ];

  const debounce = (func, delay = 300) => {
    let timeout;
    return function (...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), delay);
    };
  };

  function drawFavicon(icon, fg, bg) {
    try {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      if (getSelectedMode() === 'fa') {
        ctx.font = "24px 'Font Awesome 5 Free'";
      } else {
        ctx.font = "24px sans-serif";
      }
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = fg;
      ctx.fillText(icon, canvas.width / 2, canvas.height / 2);
    } catch (e) {
      console.error("Canvas rendering error, fallback applied:", e);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#fff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.font = "24px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = '#f00';
      ctx.fillText("F", canvas.width / 2, canvas.height / 2);
    }
    const dataURL = canvas.toDataURL();
    faviconLink.href = dataURL;
  }

  function generateBookmarklet(prompt) {
    const encoded = encodeURIComponent(prompt || 'null prompt');
    return `javascript:window.open('https://chat.openai.com/?q=${encoded}');`;
  }

  function updateOutput() {
    const prompt = promptEl.value.trim();
    let title = titleEl.value.trim() || 'prompt no name';
    const icon = iconEl.value.trim() || '⚡';
    const fg = fgEl.value;
    const bg = bgEl.value;

    drawFavicon(icon, fg, bg);
    const jsCode = generateBookmarklet(prompt);
    bookmarkletEl.href = jsCode;
    bookmarkletEl.textContent = title;
    bookmarkletEl.title = title;
    bookmarkletCodeEl.value = jsCode;

    try {
      localStorage.setItem("bookmarkletData", JSON.stringify({
        prompt, title, icon, fg, bg,
        mode: getSelectedMode()
      }));
    } catch (e) {
      console.error("localStorage save failed:", e);
    }
  }

  function getSelectedMode() {
    return [...modeEls].find(el => el.checked).value;
  }

  function loadState() {
    try {
      const saved = JSON.parse(localStorage.getItem("bookmarkletData"));
      if (!saved) return;
      
      promptEl.value = saved.prompt || '';
      titleEl.value = saved.title || '';
      iconEl.value = saved.icon || '';
      fgEl.value = saved.fg || '#000000';
      bgEl.value = saved.bg || '#ffffff';

      modeEls.forEach(el => {
        el.checked = el.value === (saved.mode || 'emoji');
      });

      if (saved.mode === 'fa' && faIconsEl.options.length > 0) {
        for (let i = 0; i < faIconsEl.options.length; i++) {
          if (faIconsEl.options[i].value === saved.icon) {
            faIconsEl.selectedIndex = i;
            break;
          }
        }
      }
    } catch (e) {
      console.error("localStorage load failed:", e);
    }
  }

  function initEmojiList() {
    emojiList.forEach(e => {
      const span = document.createElement('span');
      span.textContent = e;
      span.onclick = () => {
        iconEl.value = e;
        updateOutput();
      };
      emojiContainer.appendChild(span);
    });
  }

  function initFAIcons() {
    faIconsList.forEach(icon => {
      const option = document.createElement('option');
      option.value = icon.char;
      option.textContent = icon.name;
      faIconsEl.appendChild(option);
    });
  }

  function tryEnableFontAwesome() {
    if (typeof FontAwesome !== 'undefined') {
      faIconsEl.disabled = false;
    } else {
      faIconsEl.disabled = true;
    }
  }

  promptEl.addEventListener('input', debounce(updateOutput));
  titleEl.addEventListener('input', debounce(updateOutput));
  iconEl.addEventListener('input', debounce(updateOutput));
  fgEl.addEventListener('input', updateOutput);
  bgEl.addEventListener('input', updateOutput);
  modeEls.forEach(el => el.addEventListener('change', updateOutput));
  faIconsEl.addEventListener('change', () => {
    iconEl.value = faIconsEl.value;
    updateOutput();
  });

  window.addEventListener('load', () => {
    loadState();
    initEmojiList();
    initFAIcons();
    tryEnableFontAwesome();
    updateOutput();
  });
})();
