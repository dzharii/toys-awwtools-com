__FILE::app.nomodule.js

document.addEventListener('DOMContentLoaded', function() {
  const predefinedTiles = window.predefinedTiles;
  const utils = window.kitchenUtils;

  const searchInput = document.getElementById('search-input');
  const tilesContainer = document.getElementById('tiles-container');
  const timerTileTemplate = document.getElementById('timer-tile-template');
  const exportDataBtn = document.getElementById('export-data');
  const settingsToggle = document.getElementById('settings-toggle');
  const settingsPanel = document.getElementById('settings-panel');
  const timeFormatSelect = document.getElementById('time-format');
  const shakeAnimationToggle = document.getElementById('shake-animation');
  const titleAnimationToggle = document.getElementById('title-animation');
  const webNotificationsToggle = document.getElementById('web-notifications');
  const searchClear = document.getElementById('search-clear');

  let allTiles = [];
  let intervalIds = {};
  let settings = {
    timeFormat: '24h',
    shakeAnimation: true,
    titleAnimation: true,
    webNotifications: false
  };

  function loadSettings() {
    const saved = localStorage.getItem('kitchenTimerSettings');
    if (saved) Object.assign(settings, JSON.parse(saved));
    timeFormatSelect.value = settings.timeFormat;
    shakeAnimationToggle.checked = settings.shakeAnimation;
    titleAnimationToggle.checked = settings.titleAnimation;
    webNotificationsToggle.checked = settings.webNotifications;
  }

  function saveSettings() {
    localStorage.setItem('kitchenTimerSettings', JSON.stringify(settings));
  }

  function loadTiles() {
    const saved = localStorage.getItem('kitchenTimerTiles');
    const userTiles = saved ? JSON.parse(saved) : [];
    const tileMap = new Map(userTiles.map(t => [t.id, t]));
    allTiles = predefinedTiles.map(t => tileMap.get(t.id) || t);
    userTiles.forEach(t => {
      if (!allTiles.find(p => p.id === t.id)) allTiles.push(t);
    });
  }

  function saveTiles() {
    localStorage.setItem('kitchenTimerTiles', JSON.stringify(allTiles));
  }

  function formatDisplay(value) {
    const [h, m, s] = value.split(':').map(Number);
    if (settings.timeFormat === '12h') {
      const period = h >= 12 ? 'PM' : 'AM';
      const displayH = h % 12 || 12;
      return `${displayH}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')} ${period}`;
    }
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }

  function renderTiles(tiles) {
    tilesContainer.innerHTML = '';
    if (!tiles.length) {
      const noResults = document.createElement('div');
      noResults.className = 'no-results';
      noResults.textContent = 'No timers found.';
      tilesContainer.appendChild(noResults);
      return;
    }

    tiles.forEach(tile => {
      const el = timerTileTemplate.content.cloneNode(true).querySelector('.timer-tile');
      el.dataset.id = tile.id;
      el.querySelector('.tile-icon').textContent = tile.icon;
      el.querySelector('.tile-title').textContent = tile.title;
      el.querySelector('.tile-category').textContent = tile.category;
      el.querySelector('.tile-origin').textContent = tile.origin === 'user-modified' ? '(Modified)' : '';
      el.querySelector('.tile-description').textContent = tile.description;
      el.querySelector('.timer-display').textContent = formatDisplay(tile.timerValue);
      el.querySelector('.timer-edit-input').value = tile.timerValue;
      renderLinks(tile.links, el);
      setupTileListeners(el, tile);
      tilesContainer.appendChild(el);
    });
  }

  function renderLinks(links, el) {
    const list = el.querySelector('.tile-links-list');
    list.innerHTML = '';
    if (!links || !links.length) {
      const msg = document.createElement('p');
      msg.textContent = 'No links added yet.';
      list.appendChild(msg);
      return;
    }
    links.forEach(link => {
      const a = document.createElement('a');
      a.href = link.url;
      a.textContent = link.title;
      a.target = '_blank';
      list.appendChild(a);
    });
  }

  function setupTileListeners(el, tile) {
    const tileId = tile.id;
    const display = el.querySelector('.timer-display');
    const input = el.querySelector('.timer-edit-input');
    const editBtn = el.querySelector('.tile-edit');
    const startBtn = el.querySelector('.timer-start');
    const pauseBtn = el.querySelector('.timer-pause');
    const resetBtn = el.querySelector('.timer-reset');

    let currentValue = utils.parseTimeToSeconds(tile.timerValue);

    startBtn.onclick = () => {
      if (intervalIds[tileId]) clearInterval(intervalIds[tileId]);
      const startTime = Date.now();
      const initial = currentValue;

      intervalIds[tileId] = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        currentValue = Math.max(0, initial - elapsed);
        display.textContent = formatDisplay(utils.formatSecondsToTime(currentValue));
        if (currentValue <= 0) {
          clearInterval(intervalIds[tileId]);
          if (settings.shakeAnimation) el.classList.add('shake-animation');
          if (settings.titleAnimation) animateTitle(tile.title);
          if (settings.webNotifications && 'Notification' in window && Notification.permission === 'granted') {
            new Notification(`${tile.title} Done!`, { body: `${tile.description}` });
          }
        }
      }, 1000);
    };

    pauseBtn.onclick = () => {
      clearInterval(intervalIds[tileId]);
    };

    resetBtn.onclick = () => {
      clearInterval(intervalIds[tileId]);
      currentValue = utils.parseTimeToSeconds(tile.timerValue);
      display.textContent = formatDisplay(tile.timerValue);
    };

    editBtn.onclick = () => {
      const editing = el.querySelector('.timer-edit-container').classList.toggle('hidden') === false;
      display.classList.toggle('hidden');
      if (editing) {
        editBtn.textContent = 'Save';
        if (intervalIds[tileId]) clearInterval(intervalIds[tileId]);
      } else {
        editBtn.textContent = 'Edit';
        const newVal = input.value.trim();
        tile.timerValue = newVal;
        currentValue = utils.parseTimeToSeconds(newVal);
        display.textContent = formatDisplay(newVal);
        tile.origin = 'user-modified';
        saveTiles();
        renderLinks(tile.links, el);
        el.querySelector('.tile-origin').textContent = '(Modified)';
      }
    };
  }

  function animateTitle(text) {
    const original = document.title;
    let i = 0;
    const interval = setInterval(() => {
      document.title = i % 2 ? `⏰ ${text}` : original;
      i++;
    }, 1000);
    setTimeout(() => {
      clearInterval(interval);
      document.title = original;
    }, 10000);
  }

  function initSearch() {
    searchInput.addEventListener('input', () => {
      const term = searchInput.value.trim().toLowerCase();
      const filtered = term ? utils.fuzzySearch(allTiles, term) : allTiles;
      searchClear.classList.toggle('hidden', !term);
      renderTiles(filtered);
    });
    searchClear.addEventListener('click', () => {
      searchInput.value = '';
      searchClear.classList.add('hidden');
      renderTiles(allTiles);
    });
  }

  function initSettingsPanel() {
    settingsToggle.addEventListener('click', () => {
      settingsPanel.classList.toggle('hidden');
    });

    timeFormatSelect.addEventListener('change', () => {
      settings.timeFormat = timeFormatSelect.value;
      saveSettings();
      renderTiles(allTiles);
    });

    shakeAnimationToggle.addEventListener('change', () => {
      settings.shakeAnimation = shakeAnimationToggle.checked;
      saveSettings();
    });

    titleAnimationToggle.addEventListener('change', () => {
      settings.titleAnimation = titleAnimationToggle.checked;
      saveSettings();
    });

    webNotificationsToggle.addEventListener('change', () => {
      settings.webNotifications = webNotificationsToggle.checked;
      if (settings.webNotifications && Notification.permission !== 'granted') {
        Notification.requestPermission();
      }
      saveSettings();
    });
  }

  function initExport() {
    exportDataBtn.addEventListener('click', () => {
      const blob = new Blob([JSON.stringify(allTiles, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `kitchen-timers-${new Date().toISOString().slice(0, 10)}.json`;
      link.click();
      URL.revokeObjectURL(url);
    });
  }

  // Bootstrap
  loadSettings();
  loadTiles();
  renderTiles(allTiles);
  initSearch();
  initSettingsPanel();
  initExport();
});
