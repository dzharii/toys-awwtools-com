// app.js - Main application logic for the kitchen timer app
import { predefinedTiles } from './data.js';
import { generateUniqueId, fuzzySearch, highlightMatch, parseTimeToSeconds, formatSecondsToTime } from './utils.js';

// Global state
let allTiles = [];
let activeTiles = [];
let intervalIds = {};
let settings = {
  timeFormat: '24h',
  shakeAnimation: true,
  titleAnimation: true,
  webNotifications: false
};

// DOM Elements
const searchInput = document.getElementById('search-input');
const searchClear = document.getElementById('search-clear');
const tilesContainer = document.getElementById('tiles-container');
const settingsToggle = document.getElementById('settings-toggle');
const settingsPanel = document.getElementById('settings-panel');
const timeFormatSelect = document.getElementById('time-format');
const shakeAnimationToggle = document.getElementById('shake-animation');
const titleAnimationToggle = document.getElementById('title-animation');
const webNotificationsToggle = document.getElementById('web-notifications');
const exportDataBtn = document.getElementById('export-data');
const timerTileTemplate = document.getElementById('timer-tile-template');

// Initialize the app
function init() {
  loadSettings();
  loadTiles();
  renderTiles(allTiles);
  setupEventListeners();
  requestNotificationPermission();
}

// Load settings from local storage
function loadSettings() {
  const savedSettings = localStorage.getItem('kitchenTimerSettings');
  if (savedSettings) {
    settings = { ...settings, ...JSON.parse(savedSettings) };
  }
  
  // Apply loaded settings to UI
  timeFormatSelect.value = settings.timeFormat;
  shakeAnimationToggle.checked = settings.shakeAnimation;
  titleAnimationToggle.checked = settings.titleAnimation;
  webNotificationsToggle.checked = settings.webNotifications;
}

// Save settings to local storage
function saveSettings() {
  localStorage.setItem('kitchenTimerSettings', JSON.stringify(settings));
}

// Load tiles from data.js and local storage
function loadTiles() {
  const savedTiles = localStorage.getItem('kitchenTimerTiles');
  const userTiles = savedTiles ? JSON.parse(savedTiles) : [];
  
  // Combine predefined tiles with user-modified tiles
  allTiles = predefinedTiles.map(predefinedTile => {
    const userTile = userTiles.find(tile => tile.id === predefinedTile.id);
    return userTile || predefinedTile;
  });
  
  // Add any new user-created tiles
  userTiles.forEach(userTile => {
    if (!allTiles.some(tile => tile.id === userTile.id)) {
      allTiles.push(userTile);
    }
  });
}

// Save tiles to local storage
function saveTiles() {
  localStorage.setItem('kitchenTimerTiles', JSON.stringify(allTiles));
}

// Render tiles based on filtered list
function renderTiles(tiles) {
  tilesContainer.innerHTML = '';
  
  if (tiles.length === 0) {
    const noResults = document.createElement('div');
    noResults.className = 'no-results';
    noResults.textContent = 'No timers found. Try a different search term.';
    tilesContainer.appendChild(noResults);
    return;
  }
  
  tiles.forEach(tile => {
    const tileElement = createTileElement(tile);
    tilesContainer.appendChild(tileElement);
  });
  
  activeTiles = tiles;
}

// Create a tile DOM element based on tile data
function createTileElement(tile) {
  const searchTerm = searchInput.value.trim().toLowerCase();
  const tileElement = timerTileTemplate.content.cloneNode(true).querySelector('.timer-tile');
  
  // Set tile data
  tileElement.dataset.id = tile.id;
  
  // Header elements
  tileElement.querySelector('.tile-icon').textContent = tile.icon;
  
  // Apply highlighting if search is active
  if (searchTerm) {
    tileElement.querySelector('.tile-title').innerHTML = highlightMatch(tile.title, searchTerm);
    tileElement.querySelector('.tile-description').innerHTML = highlightMatch(tile.description, searchTerm);
  } else {
    tileElement.querySelector('.tile-title').textContent = tile.title;
    tileElement.querySelector('.tile-description').textContent = tile.description;
  }
  
  tileElement.querySelector('.tile-category').textContent = tile.category;
  tileElement.querySelector('.tile-origin').textContent = tile.origin === 'user-modified' ? '(Modified)' : '';

  // Timer display
  const timerDisplay = tileElement.querySelector('.timer-display');
  timerDisplay.textContent = formatTimerValue(tile.timerValue);
  
  // Timer edit input
  const timerEditInput = tileElement.querySelector('.timer-edit-input');
  timerEditInput.value = tile.timerValue;
  
  // Links
  renderLinks(tile.links, tileElement);
  
  // Setup event listeners for this specific tile
  setupTileEventListeners(tileElement, tile);
  
  return tileElement;
}

// Format timer value based on settings
function formatTimerValue(timerValue) {
  const [hours, minutes, seconds] = timerValue.split(':').map(Number);
  
  if (settings.timeFormat === '24h') {
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  } else {
    // 12-hour format
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')} ${period}`;
  }
}

// Parse timer input value
function parseTimerInput(inputValue) {
  const parts = inputValue.split(':');
  let hours = 0, minutes = 0, seconds = 0;
  
  if (parts.length === 3) {
    [hours, minutes, seconds] = parts.map(Number);
  } else if (parts.length === 2) {
    [minutes, seconds] = parts.map(Number);
  } else if (parts.length === 1) {
    seconds = Number(parts[0]);
  }
  
  // Ensure valid time values
  hours = Math.min(Math.max(0, hours), 23);
  minutes = Math.min(Math.max(0, minutes), 59);
  seconds = Math.min(Math.max(0, seconds), 59);
  
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

// Render links for a tile
function renderLinks(links, tileElement) {
  const linksList = tileElement.querySelector('.tile-links-list');
  const linksEdit = tileElement.querySelector('.tile-links-edit');
  
  // Clear previous content
  linksList.innerHTML = '';
  
  // Add each link to the read-only view
  if (links && links.length > 0) {
    links.forEach(link => {
      const linkElement = document.createElement('a');
      linkElement.href = link.url;
      linkElement.textContent = link.title;
      linkElement.target = '_blank';
      linkElement.rel = 'noopener noreferrer';
      linksList.appendChild(linkElement);
    });
  } else {
    const noLinks = document.createElement('p');
    noLinks.textContent = 'No links added yet.';
    noLinks.className = 'no-links-message';
    linksList.appendChild(noLinks);
  }
  
  // Setup edit view for links
  linksEdit.innerHTML = ''; // Clear previous edit fields
  
  if (links && links.length > 0) {
    links.forEach((link, index) => {
      const linkEditTemplate = document.createElement('div');
      linkEditTemplate.className = 'link-edit-template';
      
      const titleInput = document.createElement('input');
      titleInput.type = 'text';
      titleInput.className = 'link-title';
      titleInput.value = link.title;
      titleInput.placeholder = 'Title';
      
      const urlInput = document.createElement('input');
      urlInput.type = 'text';
      urlInput.className = 'link-url';
      urlInput.value = link.url;
      urlInput.placeholder = 'https://';
      
      const removeBtn = document.createElement('button');
      removeBtn.className = 'link-remove';
      removeBtn.textContent = '✕';
      removeBtn.dataset.index = index;
      
      linkEditTemplate.appendChild(titleInput);
      linkEditTemplate.appendChild(urlInput);
      linkEditTemplate.appendChild(removeBtn);
      linksEdit.appendChild(linkEditTemplate);
    });
  }
  
  // Add "Add Link" button
  const addLinkBtn = document.createElement('button');
  addLinkBtn.className = 'add-link-btn';
  addLinkBtn.textContent = '+ Add Link';
  linksEdit.appendChild(addLinkBtn);
}

// Set up event listeners for a specific tile
function setupTileEventListeners(tileElement, tile) {
  const tileId = tile.id;
  const startBtn = tileElement.querySelector('.timer-start');
  const pauseBtn = tileElement.querySelector('.timer-pause');
  const resetBtn = tileElement.querySelector('.timer-reset');
  const editBtn = tileElement.querySelector('.tile-edit');
  const timerDisplay = tileElement.querySelector('.timer-display');
  const timerEditContainer = tileElement.querySelector('.timer-edit-container');
  const timerEditInput = tileElement.querySelector('.timer-edit-input');
  const linksContainer = tileElement.querySelector('.tile-links-container');
  const linksList = tileElement.querySelector('.tile-links-list');
  const linksEdit = tileElement.querySelector('.tile-links-edit');
  const addLinkBtn = tileElement.querySelector('.add-link-btn');
  
  // Timer control buttons
  startBtn.addEventListener('click', () => startTimer(tileId, timerDisplay, startBtn, pauseBtn, resetBtn));
  pauseBtn.addEventListener('click', () => pauseTimer(tileId, startBtn, pauseBtn));
  resetBtn.addEventListener('click', () => resetTimer(tileId, timerDisplay, startBtn, pauseBtn, resetBtn, tile.timerValue));
  
  // Edit button toggles edit mode
  editBtn.addEventListener('click', () => {
    const isEditing = editBtn.classList.toggle('editing');
    
    if (isEditing) {
      // Enter edit mode
      editBtn.textContent = 'Save';
      timerDisplay.classList.add('hidden');
      timerEditContainer.classList.remove('hidden');
      linksList.classList.add('hidden');
      linksEdit.classList.remove('hidden');
      
      // Pause timer if running
      if (intervalIds[tileId]) {
        pauseTimer(tileId, startBtn, pauseBtn);
      }
    } else {
      // Exit edit mode and save changes
      editBtn.textContent = 'Edit';
      timerDisplay.classList.remove('hidden');
      timerEditContainer.classList.add('hidden');
      linksList.classList.remove('hidden');
      linksEdit.classList.add('hidden');
      
      // Save timer value
      const newTimerValue = parseTimerInput(timerEditInput.value);
      timerDisplay.textContent = formatTimerValue(newTimerValue);
      
      // Save links
      const linkEdits = linksEdit.querySelectorAll('.link-edit-template');
      const updatedLinks = Array.from(linkEdits).map(linkEdit => {
        return {
          title: linkEdit.querySelector('.link-title').value.trim(),
          url: linkEdit.querySelector('.link-url').value.trim(),
          lastUpdated: new Date().toISOString()
        };
      }).filter(link => link.title && link.url);
      
      // Update the tile in the global state
      const tileIndex = allTiles.findIndex(t => t.id === tileId);
      if (tileIndex !== -1) {
        allTiles[tileIndex] = {
          ...allTiles[tileIndex],
          timerValue: newTimerValue,
          links: updatedLinks,
          origin: 'user-modified' // Mark as user-modified
        };
        
        // Update the tile element to show it's modified
        tileElement.querySelector('.tile-origin').textContent = '(Modified)';
        
        // Re-render links
        renderLinks(updatedLinks, tileElement);
        
        // Save to local storage
        saveTiles();
      }
    }
  });
  
  // Add new link
  addLinkBtn.addEventListener('click', () => {
    const linkEditTemplate = document.createElement('div');
    linkEditTemplate.className = 'link-edit-template';
    
    const titleInput = document.createElement('input');
    titleInput.type = 'text';
    titleInput.className = 'link-title';
    titleInput.placeholder = 'Title';
    
    const urlInput = document.createElement('input');
    urlInput.type = 'text';
    urlInput.className = 'link-url';
    urlInput.placeholder = 'https://';
    
    const removeBtn = document.createElement('button');
    removeBtn.className = 'link-remove';
    removeBtn.textContent = '✕';
    
    linkEditTemplate.appendChild(titleInput);
    linkEditTemplate.appendChild(urlInput);
    linkEditTemplate.appendChild(removeBtn);
    
    linksEdit.insertBefore(linkEditTemplate, addLinkBtn);
    
    // Add remove button listener
    removeBtn.addEventListener('click', () => {
      linkEditTemplate.remove();
    });
    
    // Focus the new title input
    titleInput.focus();
  });
  
  // Remove link button listeners
  tileElement.querySelectorAll('.link-remove').forEach(button => {
    button.addEventListener('click', (e) => {
      e.target.closest('.link-edit-template').remove();
    });
  });
}

// Start a timer
function startTimer(tileId, timerDisplay, startBtn, pauseBtn, resetBtn) {
  // Clear existing interval if any
  if (intervalIds[tileId]) {
    clearInterval(intervalIds[tileId]);
  }
  
  // Get the timer value
  const timeString = timerDisplay.textContent;
  let totalSeconds = parseTimeToSeconds(timeString);
  
  if (totalSeconds <= 0) {
    // Timer is already at 0, nothing to do
    return;
  }
  
  // Enable pause and reset buttons
  pauseBtn.disabled = false;
  resetBtn.disabled = false;
  
  // Disable start button
  startBtn.disabled = true;
  
  // Store start time for accurate timing
  const startTime = Date.now();
  const initialSeconds = totalSeconds;
  
  // Start the interval
  intervalIds[tileId] = setInterval(() => {
    // Calculate elapsed time in seconds
    const elapsedSeconds = Math.floor((Date.now() - startTime) / 1000);
    totalSeconds = Math.max(0, initialSeconds - elapsedSeconds);
    
    // Update the timer display
    timerDisplay.textContent = formatTimerValue(formatSecondsToTime(totalSeconds));
    
    // Check if timer has reached 0
    if (totalSeconds <= 0) {
      timerComplete(tileId, timerDisplay, startBtn, pauseBtn, resetBtn);
    }
  }, 1000);
}

// Pause a timer
function pauseTimer(tileId, startBtn, pauseBtn) {
  if (intervalIds[tileId]) {
    clearInterval(intervalIds[tileId]);
    intervalIds[tileId] = null;
    
    // Enable start button, disable pause button
    startBtn.disabled = false;
    pauseBtn.disabled = true;
  }
}

// Reset a timer
function resetTimer(tileId, timerDisplay, startBtn, pauseBtn, resetBtn, initialValue) {
  // Clear interval if running
  if (intervalIds[tileId]) {
    clearInterval(intervalIds[tileId]);
    intervalIds[tileId] = null;
  }
  
  // Reset display to initial value
  timerDisplay.textContent = formatTimerValue(initialValue);
  
  // Reset buttons
  startBtn.disabled = false;
  pauseBtn.disabled = true;
  resetBtn.disabled = true;
}

// Handle timer completion
function timerComplete(tileId, timerDisplay, startBtn, pauseBtn, resetBtn) {
  // Clear interval
  clearInterval(intervalIds[tileId]);
  intervalIds[tileId] = null;
  
  // Get the tile element
  const tileElement = document.querySelector(`.timer-tile[data-id="${tileId}"]`);
  
  // Shake animation if enabled
  if (settings.shakeAnimation) {
    tileElement.classList.add('shake-animation');
    setTimeout(() => {
      tileElement.classList.remove('shake-animation');
    }, 1000);
  }
  
  // Title bar animation if enabled
  if (settings.titleAnimation) {
    let originalTitle = document.title;
    let titleInterval = setInterval(() => {
      document.title = document.title === originalTitle ? '⏰ Timer Complete! ⏰' : originalTitle;
    }, 1000);
    
    // Stop title animation after 10 seconds
    setTimeout(() => {
      clearInterval(titleInterval);
      document.title = originalTitle;
    }, 10000);
  }
  
  // Browser notification if enabled
  if (settings.webNotifications) {
    const tile = allTiles.find(t => t.id === tileId);
    if (tile) {
      sendNotification(tile.title, `Your ${tile.title} timer is complete!`);
    }
  }
  
  // Reset buttons
  startBtn.disabled = true;
  pauseBtn.disabled = true;
  resetBtn.disabled = false;
}

// Send browser notification
function sendNotification(title, message) {
  if (!('Notification' in window)) {
    console.log('This browser does not support notifications');
    return;
  }
  
  if (Notification.permission === 'granted') {
    new Notification(title, {
      body: message,
      icon: '/favicon.ico'
    });
  }
}

// Request notification permission
function requestNotificationPermission() {
  if (!('Notification' in window)) {
    console.log('This browser does not support notifications');
    return;
  }
  
  if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
    Notification.requestPermission();
  }
}

// Setup global event listeners
function setupEventListeners() {
  // Search functionality
  searchInput.addEventListener('input', () => {
    const searchTerm = searchInput.value.trim().toLowerCase();
    
    if (searchTerm === '') {
      searchClear.classList.add('hidden');
      renderTiles(allTiles);
    } else {
      searchClear.classList.remove('hidden');
      const filteredTiles = fuzzySearch(allTiles, searchTerm);
      renderTiles(filteredTiles);
    }
  });
  
  searchClear.addEventListener('click', () => {
    searchInput.value = '';
    searchClear.classList.add('hidden');
    renderTiles(allTiles);
    searchInput.focus();
  });
  
  // Settings panel toggle
  settingsToggle.addEventListener('click', () => {
    settingsPanel.classList.toggle('hidden');
  });
  
  // Settings changes
  timeFormatSelect.addEventListener('change', () => {
    settings.timeFormat = timeFormatSelect.value;
    saveSettings();
    
    // Update all displayed timers
    document.querySelectorAll('.timer-display').forEach(display => {
      const tileId = display.closest('.timer-tile').dataset.id;
      const tile = allTiles.find(t => t.id === tileId);
      if (tile) {
        // Only update display for timers that aren't currently running
        if (!intervalIds[tileId]) {
          display.textContent = formatTimerValue(tile.timerValue);
        }
      }
    });
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
    if (settings.webNotifications) {
      requestNotificationPermission();
    }
    saveSettings();
  });
  
  // Export data button
  exportDataBtn.addEventListener('click', exportData);
  
  // Handle clicks outside the settings panel to close it
  document.addEventListener('click', (event) => {
    if (!settingsPanel.classList.contains('hidden') && 
        !settingsPanel.contains(event.target) && 
        event.target !== settingsToggle) {
      settingsPanel.classList.add('hidden');
    }
  });
}

// Export data as JSON file
function exportData() {
  const dataStr = JSON.stringify(allTiles, null, 2);
  const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
  
  const exportFileName = `kitchen-timers-export-${new Date().toISOString().slice(0, 10)}.json`;
  
  const linkElement = document.createElement('a');
  linkElement.setAttribute('href', dataUri);
  linkElement.setAttribute('download', exportFileName);
  document.body.appendChild(linkElement);
  linkElement.click();
  document.body.removeChild(linkElement);
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', init);