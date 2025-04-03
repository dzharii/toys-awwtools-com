// app.js - Main application logic for the kitchen timer app

// Global state
var allTiles = [];
var activeTiles = [];
var intervalIds = {};
var settings = {
  timeFormat: '24h',
  shakeAnimation: true,
  titleAnimation: true,
  webNotifications: false
};

// DOM Elements
var searchInput = document.getElementById('search-input');
var searchClear = document.getElementById('search-clear');
var tilesContainer = document.getElementById('tiles-container');
var settingsToggle = document.getElementById('settings-toggle');
var settingsPanel = document.getElementById('settings-panel');
var timeFormatSelect = document.getElementById('time-format');
var shakeAnimationToggle = document.getElementById('shake-animation');
var titleAnimationToggle = document.getElementById('title-animation');
var webNotificationsToggle = document.getElementById('web-notifications');
var exportDataBtn = document.getElementById('export-data');
var timerTileTemplate = document.getElementById('timer-tile-template');

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
  var savedSettings = localStorage.getItem('kitchenTimerSettings');
  if (savedSettings) {
    var parsedSettings = JSON.parse(savedSettings);
    for (var key in parsedSettings) {
      if (parsedSettings.hasOwnProperty(key)) {
        settings[key] = parsedSettings[key];
      }
    }
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

// Load tiles from predefined data and local storage
function loadTiles() {
  var savedTiles = localStorage.getItem('kitchenTimerTiles');
  var userTiles = savedTiles ? JSON.parse(savedTiles) : [];
  
  // Combine predefined tiles with user-modified tiles
  allTiles = predefinedTiles.map(function(predefinedTile) {
    var userTile = userTiles.find(function(tile) { 
      return tile.id === predefinedTile.id; 
    });
    return userTile || predefinedTile;
  });
  
  // Add any new user-created tiles
  userTiles.forEach(function(userTile) {
    var exists = allTiles.some(function(tile) { 
      return tile.id === userTile.id; 
    });
    if (!exists) {
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
    var noResults = document.createElement('div');
    noResults.className = 'no-results';
    noResults.textContent = 'No timers found. Try a different search term.';
    tilesContainer.appendChild(noResults);
    return;
  }
  
  tiles.forEach(function(tile) {
    var tileElement = createTileElement(tile);
    tilesContainer.appendChild(tileElement);
  });
  
  activeTiles = tiles;
}

// Create a tile DOM element based on tile data
function createTileElement(tile) {
  var searchTerm = searchInput.value.trim().toLowerCase();
  var tileElement = timerTileTemplate.content.cloneNode(true).querySelector('.timer-tile');
  
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
  var timerDisplay = tileElement.querySelector('.timer-display');
  timerDisplay.textContent = formatTimerValue(tile.timerValue);
  
  // Timer edit input
  var timerEditInput = tileElement.querySelector('.timer-edit-input');
  timerEditInput.value = tile.timerValue;
  
  // Links
  renderLinks(tile.links, tileElement);
  
  // Setup event listeners for this specific tile
  setupTileEventListeners(tileElement, tile);
  
  return tileElement;
}

// Format timer value based on settings
function formatTimerValue(timerValue) {
  var parts = timerValue.split(':').map(Number);
  var hours = parts[0];
  var minutes = parts[1];
  var seconds = parts[2];
  
  if (settings.timeFormat === '24h') {
    return padZero(hours) + ":" + padZero(minutes) + ":" + padZero(seconds);
  } else {
    // 12-hour format
    var period = hours >= 12 ? 'PM' : 'AM';
    var displayHours = hours % 12 || 12;
    return displayHours + ":" + padZero(minutes) + ":" + padZero(seconds) + " " + period;
  }
}

// Parse timer input value
function parseTimerInput(inputValue) {
  var parts = inputValue.split(':');
  var hours = 0, minutes = 0, seconds = 0;
  
  if (parts.length === 3) {
    hours = parseInt(parts[0], 10);
    minutes = parseInt(parts[1], 10);
    seconds = parseInt(parts[2], 10);
  } else if (parts.length === 2) {
    minutes = parseInt(parts[0], 10);
    seconds = parseInt(parts[1], 10);
  } else if (parts.length === 1) {
    seconds = parseInt(parts[0], 10);
  }
  
  // Ensure valid time values
  hours = Math.min(Math.max(0, hours), 23);
  minutes = Math.min(Math.max(0, minutes), 59);
  seconds = Math.min(Math.max(0, seconds), 59);
  
  return padZero(hours) + ":" + padZero(minutes) + ":" + padZero(seconds);
}

// Render links for a tile
function renderLinks(links, tileElement) {
  var linksList = tileElement.querySelector('.tile-links-list');
  var linksEdit = tileElement.querySelector('.tile-links-edit');
  
  // Clear previous content
  linksList.innerHTML = '';
  
  // Add each link to the read-only view
  if (links && links.length > 0) {
    links.forEach(function(link) {
      var linkElement = document.createElement('a');
      linkElement.href = link.url;
      linkElement.textContent = link.title;
      linkElement.target = '_blank';
      linkElement.rel = 'noopener noreferrer';
      linksList.appendChild(linkElement);
    });
  } else {
    var noLinks = document.createElement('p');
    noLinks.textContent = 'No links added yet.';
    noLinks.className = 'no-links-message';
    linksList.appendChild(noLinks);
  }
  
  // Setup edit view for links
  linksEdit.innerHTML = ''; // Clear previous edit fields
  
  if (links && links.length > 0) {
    links.forEach(function(link, index) {
      var linkEditTemplate = document.createElement('div');
      linkEditTemplate.className = 'link-edit-template';
      
      var titleInput = document.createElement('input');
      titleInput.type = 'text';
      titleInput.className = 'link-title';
      titleInput.value = link.title;
      titleInput.placeholder = 'Title';
      
      var urlInput = document.createElement('input');
      urlInput.type = 'text';
      urlInput.className = 'link-url';
      urlInput.value = link.url;
      urlInput.placeholder = 'https://';
      
      var removeBtn = document.createElement('button');
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
  var addLinkBtn = document.createElement('button');
  addLinkBtn.className = 'add-link-btn';
  addLinkBtn.textContent = '+ Add Link';
  linksEdit.appendChild(addLinkBtn);
}

// Set up event listeners for a specific tile
function setupTileEventListeners(tileElement, tile) {
  var tileId = tile.id;
  var startBtn = tileElement.querySelector('.timer-start');
  var pauseBtn = tileElement.querySelector('.timer-pause');
  var resetBtn = tileElement.querySelector('.timer-reset');
  var editBtn = tileElement.querySelector('.tile-edit');
  var timerDisplay = tileElement.querySelector('.timer-display');
  var timerEditContainer = tileElement.querySelector('.timer-edit-container');
  var timerEditInput = tileElement.querySelector('.timer-edit-input');
  var linksContainer = tileElement.querySelector('.tile-links-container');
  var linksList = tileElement.querySelector('.tile-links-list');
  var linksEdit = tileElement.querySelector('.tile-links-edit');
  var addLinkBtn = tileElement.querySelector('.add-link-btn');
  
  // Timer control buttons
  startBtn.addEventListener('click', function() {
    startTimer(tileId, timerDisplay, startBtn, pauseBtn, resetBtn);
  });
  
  pauseBtn.addEventListener('click', function() {
    pauseTimer(tileId, startBtn, pauseBtn);
  });
  
  resetBtn.addEventListener('click', function() {
    resetTimer(tileId, timerDisplay, startBtn, pauseBtn, resetBtn, tile.timerValue);
  });
  
  // Edit button toggles edit mode
  editBtn.addEventListener('click', function() {
    var isEditing = editBtn.classList.toggle('editing');
    
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
      var newTimerValue = parseTimerInput(timerEditInput.value);
      timerDisplay.textContent = formatTimerValue(newTimerValue);
      
      // Save links
      var linkEdits = linksEdit.querySelectorAll('.link-edit-template');
      var updatedLinks = Array.from(linkEdits).map(function(linkEdit) {
        return {
          title: linkEdit.querySelector('.link-title').value.trim(),
          url: linkEdit.querySelector('.link-url').value.trim(),
          lastUpdated: new Date().toISOString()
        };
      }).filter(function(link) {
        return link.title && link.url;
      });
      
      // Update the tile in the global state
      var tileIndex = -1;
      for (var i = 0; i < allTiles.length; i++) {
        if (allTiles[i].id === tileId) {
          tileIndex = i;
          break;
        }
      }
      
      if (tileIndex !== -1) {
        allTiles[tileIndex] = {
          id: allTiles[tileIndex].id,
          title: allTiles[tileIndex].title,
          description: allTiles[tileIndex].description,
          icon: allTiles[tileIndex].icon,
          category: allTiles[tileIndex].category,
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
  addLinkBtn.addEventListener('click', function() {
    var linkEditTemplate = document.createElement('div');
    linkEditTemplate.className = 'link-edit-template';
    
    var titleInput = document.createElement('input');
    titleInput.type = 'text';
    titleInput.className = 'link-title';
    titleInput.placeholder = 'Title';
    
    var urlInput = document.createElement('input');
    urlInput.type = 'text';
    urlInput.className = 'link-url';
    urlInput.placeholder = 'https://';
    
    var removeBtn = document.createElement('button');
    removeBtn.className = 'link-remove';
    removeBtn.textContent = '✕';
    
    linkEditTemplate.appendChild(titleInput);
    linkEditTemplate.appendChild(urlInput);
    linkEditTemplate.appendChild(removeBtn);
    
    linksEdit.insertBefore(linkEditTemplate, addLinkBtn);
    
    // Add remove button listener
    removeBtn.addEventListener('click', function() {
      linkEditTemplate.remove();
    });
    
    // Focus the new title input
    titleInput.focus();
  });
  
  // Remove link button listeners
  var removeButtons = tileElement.querySelectorAll('.link-remove');
  for (var i = 0; i < removeButtons.length; i++) {
    removeButtons[i].addEventListener('click', function(e) {
      e.target.closest('.link-edit-template').remove();
    });
  }
}

// Start a timer
function startTimer(tileId, timerDisplay, startBtn, pauseBtn, resetBtn) {
  // Clear existing interval if any
  if (intervalIds[tileId]) {
    clearInterval(intervalIds[tileId]);
  }
  
  // Get the timer value
  var timeString = timerDisplay.textContent;
  var totalSeconds = parseTimeToSeconds(timeString);
  
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
  var startTime = Date.now();
  var initialSeconds = totalSeconds;
  
  // Start the interval
  intervalIds[tileId] = setInterval(function() {
    // Calculate elapsed time in seconds
    var elapsedSeconds = Math.floor((Date.now() - startTime) / 1000);
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
  var tileElement = document.querySelector('.timer-tile[data-id="' + tileId + '"]');
  
  // Shake animation if enabled
  if (settings.shakeAnimation) {
    tileElement.classList.add('shake-animation');
    setTimeout(function() {
      tileElement.classList.remove('shake-animation');
    }, 1000);
  }
  
  // Title bar animation if enabled
  if (settings.titleAnimation) {
    var originalTitle = document.title;
    var titleInterval = setInterval(function() {
      document.title = document.title === originalTitle ? '⏰ Timer Complete! ⏰' : originalTitle;
    }, 1000);
    
    // Stop title animation after 10 seconds
    setTimeout(function() {
      clearInterval(titleInterval);
      document.title = originalTitle;
    }, 10000);
  }
  
  // Browser notification if enabled
  if (settings.webNotifications) {
    var tile = null;
    for (var i = 0; i < allTiles.length; i++) {
      if (allTiles[i].id === tileId) {
        tile = allTiles[i];
        break;
      }
    }
    
    if (tile) {
      sendNotification(tile.title, 'Your ' + tile.title + ' timer is complete!');
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
      icon: '/favicon.ico' // You can add a default icon or remove this line
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
  searchInput.addEventListener('input', function() {
    var searchTerm = searchInput.value.trim().toLowerCase();
    
    if (searchTerm === '') {
      searchClear.classList.add('hidden');
      renderTiles(allTiles);
    } else {
      searchClear.classList.remove('hidden');
      var filteredTiles = fuzzySearch(allTiles, searchTerm);
      renderTiles(filteredTiles);
    }
  });
  
  searchClear.addEventListener('click', function() {
    searchInput.value = '';
    searchClear.classList.add('hidden');
    renderTiles(allTiles);
    searchInput.focus();
  });
  
  // Settings panel toggle
  settingsToggle.addEventListener('click', function() {
    settingsPanel.classList.toggle('hidden');
  });
  
  // Settings changes
  timeFormatSelect.addEventListener('change', function() {
    settings.timeFormat = timeFormatSelect.value;
    saveSettings();
    
    // Update all displayed timers
    var timerDisplays = document.querySelectorAll('.timer-display');
    for (var i = 0; i < timerDisplays.length; i++) {
      var display = timerDisplays[i];
      var tileId = display.closest('.timer-tile').dataset.id;
      var tile = null;
      
      for (var j = 0; j < allTiles.length; j++) {
        if (allTiles[j].id === tileId) {
          tile = allTiles[j];
          break;
        }
      }
      
      if (tile) {
        // Only update display for timers that aren't currently running
        if (!intervalIds[tileId]) {
          display.textContent = formatTimerValue(tile.timerValue);
        }
      }
    }
  });
  
  shakeAnimationToggle.addEventListener('change', function() {
    settings.shakeAnimation = shakeAnimationToggle.checked;
    saveSettings();
  });
  
  titleAnimationToggle.addEventListener('change', function() {
    settings.titleAnimation = titleAnimationToggle.checked;
    saveSettings();
  });
  
  webNotificationsToggle.addEventListener('change', function() {
    settings.webNotifications = webNotificationsToggle.checked;
    if (settings.webNotifications) {
      requestNotificationPermission();
    }
    saveSettings();
  });
  
  // Export data button
  exportDataBtn.addEventListener('click', exportData);
  
  // Handle clicks outside the settings panel to close it
  document.addEventListener('click', function(event) {
    if (!settingsPanel.classList.contains('hidden') && 
        !settingsPanel.contains(event.target) && 
        event.target !== settingsToggle) {
      settingsPanel.classList.add('hidden');
    }
  });
}

// Export data as JSON file
function exportData() {
  var dataStr = JSON.stringify(allTiles, null, 2);
  var dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
  
  var now = new Date();
  var dateString = now.getFullYear() + '-' + 
                  padZero(now.getMonth() + 1) + '-' + 
                  padZero(now.getDate());
  
  var exportFileName = 'kitchen-timers-export-' + dateString + '.json';
  
  var linkElement = document.createElement('a');
  linkElement.setAttribute('href', dataUri);
  linkElement.setAttribute('download', exportFileName);
  document.body.appendChild(linkElement);
  linkElement.click();
  document.body.removeChild(linkElement);
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', init);