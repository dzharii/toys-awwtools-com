
// Elements
const categoriesList = document.getElementById('categories-list');
const addCategoryBtn = document.getElementById('add-category');
const settingsContent = document.getElementById('settings-content');
const historyList = document.getElementById('history-list');
const exportBtn = document.getElementById('export-data');
const importFile = document.getElementById('import-file');

// App Data
let categories = JSON.parse(localStorage.getItem('categories')) || [];
let timers = JSON.parse(localStorage.getItem('timers')) || [];

// Utility functions library for common operations
const utils = {
    // Format time elapsed into days, hours, minutes
    formatElapsedTime: function (elapsed) {
        const days = Math.floor(elapsed / (1000 * 60 * 60 * 24));
        const hours = Math.floor((elapsed / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((elapsed / (1000 * 60)) % 60);
        return `${days}d ${hours}h ${minutes}m ago`;
    },

    // Save state to local storage
    saveToLocalStorage: function () {
        localStorage.setItem('categories', JSON.stringify(categories));
        localStorage.setItem('timers', JSON.stringify(timers));
    },

    // Get elapsed time for a timer
    getElapsedTime: function (timer) {
        const now = Date.now();
        const elapsed = now - timer.startTime;
        return utils.formatElapsedTime(elapsed);
    },

    // Create and return a timer element for the UI
    createTimerElement: function (timer) {
        const timerDiv = document.createElement('div');
        timerDiv.classList.add('timer');
        timerDiv.setAttribute('data-timer-color', timer.color);

        const timerName = document.createElement('span');
        timerName.classList.add('name');
        timerName.textContent = timer.name;

        const timerTime = document.createElement('span');
        timerTime.classList.add('time');
        timerTime.textContent = utils.getElapsedTime(timer);

        timerDiv.appendChild(timerName);
        timerDiv.appendChild(timerTime);

        // Add event listeners
        timerDiv.addEventListener('click', () => openTimerSettings(timer.id));

        return timerDiv;
    },
};

// Initialize App
function init() {
    renderCategories();
    setInterval(updateTimers, 60000); // Update timers every minute
}

// Render Categories and Timers
function renderCategories() {
    categoriesList.innerHTML = '';
    categories.forEach(category => {
        const categoryDiv = document.createElement('div');
        categoryDiv.classList.add('category');

        const categoryTitle = document.createElement('h3');
        categoryTitle.textContent = category.name;
        categoryDiv.appendChild(categoryTitle);

        const addTimerBtn = document.createElement('button');
        addTimerBtn.textContent = 'Add Timer';
        addTimerBtn.addEventListener('click', () => addTimerToCategory(category.id));
        categoryDiv.appendChild(addTimerBtn);

        category.timers.forEach(timerId => {
            const timer = timers.find(t => t.id === timerId);
            if (timer && !timer.deleted) {
                const timerDiv = utils.createTimerElement(timer);
                categoryDiv.appendChild(timerDiv);
            }
        });

        categoriesList.appendChild(categoryDiv);
    });
}

// Add a Timer to a Category
function addTimerToCategory(categoryId) {
    const timerName = prompt("Enter timer name:");
    if (timerName) {
        const newTimer = {
            id: Date.now(),
            name: timerName,
            color: "#e0e0e0",  // default color
            startTime: Date.now(),
            deleted: false,
            history: [],
        };
        timers.push(newTimer);

        const category = categories.find(cat => cat.id === categoryId);
        category.timers.push(newTimer.id);

        utils.saveToLocalStorage();
        renderCategories();
    }
}

// Update all timers (used for real-time ticking)
function updateTimers() {
    timers.forEach(timer => {
        if (!timer.deleted) {
            const timerElement = document.querySelector(`[data-timer-id="${timer.id}"] .time`);
            if (timerElement) {
                timerElement.textContent = utils.getElapsedTime(timer);
            }
        }
    });
}

// Open Timer Settings
function openTimerSettings(timerId) {
    const timer = timers.find(t => t.id === timerId);
    if (timer) {
        settingsContent.innerHTML = `
            <h3>Edit Timer: ${timer.name}</h3>
            <label>Name: <input type="text" id="timer-name" value="${timer.name}"></label>
            <label>Color: <input type="color" id="timer-color" value="${timer.color}"></label>
            <button onclick="resetTimer(${timerId})">Reset Timer</button>
            <button onclick="updateTimer(${timerId})">Save Changes</button>
            <button onclick="deleteTimer(${timerId})">Delete Timer</button>
        `;
    }
}

// Update Timer
function updateTimer(timerId) {
    const timer = timers.find(t => t.id === timerId);
    if (timer) {
        const newName = document.getElementById('timer-name').value;
        const newColor = document.getElementById('timer-color').value;

        timer.name = newName;
        timer.color = newColor;

        utils.saveToLocalStorage();
        renderCategories();
    }
}

// Reset Timer
function resetTimer(timerId) {
    const timer = timers.find(t => t.id === timerId);
    if (timer) {
        timer.history.push({ timestamp: timer.startTime });
        timer.startTime = Date.now();

        utils.saveToLocalStorage();
        renderCategories();
    }
}

// Delete Timer
function deleteTimer(timerId) {
    const timer = timers.find(t => t.id === timerId);
    if (timer) {
        timer.deleted = true;

        utils.saveToLocalStorage();
        renderCategories();
    }
}

// Save to Local Storage
utils.saveToLocalStorage = function () {
    localStorage.setItem('categories', JSON.stringify(categories));
    localStorage.setItem('timers', JSON.stringify(timers));
}

// Export data to JSON file
exportBtn.addEventListener('click', () => {
    const data = { categories, timers };
    const json = JSON.stringify(data);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'timers_data.json';
    a.click();
    URL.revokeObjectURL(url);
});

// Import data from JSON file
importFile.addEventListener('change', (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = (e) => {
        const data = JSON.parse(e.target.result);
        categories = data.categories;
        timers = data.timers;
        utils.saveToLocalStorage();
        renderCategories();
    };

    reader.readAsText(file);
});

// Event Listeners
addCategoryBtn.addEventListener('click', () => {
    const categoryName = prompt('Enter category name:');
    if (categoryName) {
        const newCategory = { id: Date.now(), name: categoryName, timers: [] };
        categories.push(newCategory);
        utils.saveToLocalStorage();
        renderCategories();
    }
});

// Initialize the app
init();


