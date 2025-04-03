// Global variables
let tiles = [];
let globalSettings = {
  is24Hour: false,
  shakeAnimation: true,
  titleAnimation: true,
  notifications: true
};

const tilesContainer = document.getElementById('tilesContainer');
const searchBar = document.getElementById('searchBar');
const exportButton = document.getElementById('exportData');

// Global Settings Elements
const toggleTimeFormat = document.getElementById('toggleTimeFormat');
const toggleShakeAnimation = document.getElementById('toggleShakeAnimation');
const toggleTitleAnimation = document.getElementById('toggleTitleAnimation');
const toggleNotifications = document.getElementById('toggleNotifications');

// Load settings from localStorage
function loadGlobalSettings() {
  const settings = localStorage.getItem('globalSettings');
  if (settings) {
    globalSettings = JSON.parse(settings);
    toggleTimeFormat.checked = globalSettings.is24Hour;
    toggleShakeAnimation.checked = globalSettings.shakeAnimation;
    toggleTitleAnimation.checked = globalSettings.titleAnimation;
    toggleNotifications.checked = globalSettings.notifications;
  }
}

// Save settings to localStorage
function saveGlobalSettings() {
  localStorage.setItem('globalSettings', JSON.stringify(globalSettings));
}

// Convert seconds to time string (hh:mm:ss or 12-hour format if needed)
function formatTime(seconds) {
  let hrs = Math.floor(seconds / 3600);
  let mins = Math.floor((seconds % 3600) / 60);
  let secs = seconds % 60;
  let formatted = [hrs, mins, secs].map(num => num.toString().padStart(2, '0')).join(':');
  return formatted;
}

// Update browser tab title for notifications
function updateTabTitle(message) {
  if (globalSettings.titleAnimation) {
    document.title = message;
    setTimeout(() => {
      document.title = "Kitchen Timer Tiles";
    }, 3000);
  }
}

// Merge predefined tiles with modifications from localStorage
function loadTiles() {
  const modifiedTiles = JSON.parse(localStorage.getItem('modifiedTiles')) || {};
  // Create deep copy of predefinedTiles
  tiles = predefinedTiles.map(tile => {
    if (modifiedTiles[tile.id]) {
      return { ...tile, ...modifiedTiles[tile.id], modified: true };
    }
    return { ...tile, modified: false };
  });
}

// Save modifications to localStorage
function saveTileModification(tile) {
  const modifiedTiles = JSON.parse(localStorage.getItem('modifiedTiles')) || {};
  modifiedTiles[tile.id] = tile;
  localStorage.setItem('modifiedTiles', JSON.stringify(modifiedTiles));
}

// Render all tiles
function renderTiles(filter = "") {
  tilesContainer.innerHTML = "";
  tiles.filter(tile => {
    const searchLower = filter.toLowerCase();
    return tile.title.toLowerCase().includes(searchLower) ||
           tile.description.toLowerCase().includes(searchLower) ||
           tile.category.toLowerCase().includes(searchLower);
  }).forEach(tile => {
    const tileElem = createTileElement(tile);
    tilesContainer.appendChild(tileElem);
  });
}

// Create individual tile DOM element
function createTileElement(tile) {
  const tileDiv = document.createElement('div');
  tileDiv.className = 'tile';
  if (tile.modified) {
    tileDiv.classList.add('modified');
  }

  // Tile Header
  const headerDiv = document.createElement('div');
  headerDiv.className = 'tile-header';
  const iconSpan = document.createElement('span');
  iconSpan.className = 'tile-icon';
  iconSpan.textContent = tile.icon;
  const titleSpan = document.createElement('span');
  titleSpan.className = 'tile-title';
  titleSpan.textContent = tile.title;
  const categorySpan = document.createElement('span');
  categorySpan.className = 'tile-category';
  categorySpan.textContent = tile.category;
  headerDiv.appendChild(iconSpan);
  headerDiv.appendChild(titleSpan);
  headerDiv.appendChild(categorySpan);

  // Description
  const descriptionP = document.createElement('p');
  descriptionP.className = 'tile-description';
  descriptionP.textContent = tile.description;

  // Timer Display
  const timerDisplay = document.createElement('div');
  timerDisplay.className = 'timer-display';
  timerDisplay.textContent = formatTime(tile.initialTime);

  // Timer Controls
  const controlsDiv = document.createElement('div');
  controlsDiv.className = 'timer-controls';
  const startBtn = document.createElement('button');
  startBtn.textContent = 'Start';
  const pauseBtn = document.createElement('button');
  pauseBtn.textContent = 'Pause';
  const resetBtn = document.createElement('button');
  resetBtn.textContent = 'Reset';
  controlsDiv.appendChild(startBtn);
  controlsDiv.appendChild(pauseBtn);
  controlsDiv.appendChild(resetBtn);

  // Edit Button
  const editBtn = document.createElement('button');
  editBtn.className = 'edit-button';
  editBtn.textContent = 'Edit';

  // Links Section
  const linksDiv = document.createElement('div');
  linksDiv.className = 'tile-links';
  renderLinks(tile, linksDiv, false);

  // Assemble tile
  tileDiv.appendChild(headerDiv);
  tileDiv.appendChild(descriptionP);
  tileDiv.appendChild(timerDisplay);
  tileDiv.appendChild(controlsDiv);
  tileDiv.appendChild(editBtn);
  tileDiv.appendChild(linksDiv);

  // Timer Variables
  let timerValue = tile.initialTime;
  let timerInterval = null;
  let isEditing = false;

  // Timer functions
  startBtn.addEventListener('click', () => {
    if (timerInterval) return;
    timerInterval = setInterval(() => {
      if (timerValue > 0) {
        timerValue--;
        timerDisplay.textContent = formatTime(timerValue);
      } else {
        clearInterval(timerInterval);
        timerInterval = null;
        if (globalSettings.shakeAnimation) {
          tileDiv.classList.add('shake');
          setTimeout(() => tileDiv.classList.remove('shake'), 500);
        }
        updateTabTitle("Timer Completed! ⏰");
        if (globalSettings.notifications && Notification.permission === "granted") {
          new Notification("Timer Completed!", { body: tile.title });
        }
      }
    }, 1000);
  });

  pauseBtn.addEventListener('click', () => {
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
  });

  resetBtn.addEventListener('click', () => {
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
    timerValue = tile.initialTime;
    timerDisplay.textContent = formatTime(timerValue);
  });

  // Toggle Edit Mode
  editBtn.addEventListener('click', () => {
    isEditing = !isEditing;
    // Clear current links section and re-render in appropriate mode
    linksDiv.innerHTML = "";
    if (isEditing) {
      // Create editable timer value input
      const timerInput = document.createElement('input');
      timerInput.type = 'number';
      timerInput.className = 'editable-field';
      timerInput.value = tile.initialTime;
      timerInput.addEventListener('change', (e) => {
        const newTime = parseInt(e.target.value, 10);
        if (!isNaN(newTime) && newTime > 0) {
          tile.initialTime = newTime;
          timerValue = newTime;
          timerDisplay.textContent = formatTime(timerValue);
          saveTileModification(tile);
        }
      });
      tileDiv.insertBefore(timerInput, timerDisplay.nextSibling);
      // Render links in edit mode
      renderLinks(tile, linksDiv, true);
      editBtn.textContent = 'Save';
    } else {
      // Remove editable input if exists
      const inputField = tileDiv.querySelector('.editable-field');
      if (inputField) {
        tileDiv.removeChild(inputField);
      }
      // Collect link updates
      updateLinksFromEdit(tile, linksDiv);
      // Re-render links in read-only mode
      linksDiv.innerHTML = "";
      renderLinks(tile, linksDiv, false);
      editBtn.textContent = 'Edit';
      tile.modified = true;
      tileDiv.classList.add('modified');
      saveTileModification(tile);
    }
  });

  return tileDiv;
}

// Render links for a tile; if editable is true, render input fields
function renderLinks(tile, container, editable) {
  container.innerHTML = "";
  if (editable) {
    // For each existing link, render editable inputs
    tile.links.forEach((link, index) => {
      const linkDiv = document.createElement('div');
      linkDiv.className = 'link-edit';

      const titleInput = document.createElement('input');
      titleInput.type = 'text';
      titleInput.placeholder = 'Title';
      titleInput.value = link.title;
      titleInput.dataset.index = index;

      const urlInput = document.createElement('input');
      urlInput.type = 'url';
      urlInput.placeholder = 'HTTPS URL';
      urlInput.value = link.url;
      urlInput.dataset.index = index;

      // Button to remove link
      const removeBtn = document.createElement('button');
      removeBtn.textContent = 'Remove';
      removeBtn.addEventListener('click', () => {
        tile.links.splice(index, 1);
        renderLinks(tile, container, true);
      });

      linkDiv.appendChild(titleInput);
      linkDiv.appendChild(urlInput);
      linkDiv.appendChild(removeBtn);
      container.appendChild(linkDiv);
    });
    // Button to add new link
    const addLinkBtn = document.createElement('button');
    addLinkBtn.textContent = 'Add Link';
    addLinkBtn.addEventListener('click', () => {
      tile.links.push({
        title: '',
        url: '',
        lastUpdated: new Date().toISOString()
      });
      renderLinks(tile, container, true);
    });
    container.appendChild(addLinkBtn);
  } else {
    // Render links as clickable hyperlinks
    tile.links.forEach(link => {
      const linkElem = document.createElement('a');
      linkElem.href = link.url;
      linkElem.textContent = link.title;
      linkElem.target = '_blank';
      container.appendChild(linkElem);
    });
  }
}

// Update tile links from editable inputs
function updateLinksFromEdit(tile, container) {
  const inputs = container.querySelectorAll('.link-edit');
  tile.links = Array.from(inputs).map(linkDiv => {
    const titleInput = linkDiv.querySelector('input[type="text"]');
    const urlInput = linkDiv.querySelector('input[type="url"]');
    return {
      title: titleInput.value,
      url: urlInput.value,
      lastUpdated: new Date().toISOString()
    };
  });
}

// Fuzzy search implementation (simple case-insensitive substring search)
searchBar.addEventListener('input', (e) => {
  const query = e.target.value;
  renderTiles(query);
});

// Global settings event listeners
toggleTimeFormat.addEventListener('change', (e) => {
  globalSettings.is24Hour = e.target.checked;
  saveGlobalSettings();
  renderTiles(searchBar.value);
});

toggleShakeAnimation.addEventListener('change', (e) => {
  globalSettings.shakeAnimation = e.target.checked;
  saveGlobalSettings();
});

toggleTitleAnimation.addEventListener('change', (e) => {
  globalSettings.titleAnimation = e.target.checked;
  saveGlobalSettings();
});

toggleNotifications.addEventListener('change', (e) => {
  globalSettings.notifications = e.target.checked;
  saveGlobalSettings();
});

// Export Data Functionality
exportButton.addEventListener('click', () => {
  // Merge current state
  const mergedData = JSON.stringify(tiles, null, 2);
  const blob = new Blob([mergedData], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'exported_tiles.json';
  a.click();
  URL.revokeObjectURL(url);
});

// Request Notification permission on load if notifications are enabled
if (globalSettings.notifications && Notification.permission !== "granted") {
  Notification.requestPermission();
}

// Initialization
function init() {
  loadGlobalSettings();
  loadTiles();
  renderTiles();
}

init();

