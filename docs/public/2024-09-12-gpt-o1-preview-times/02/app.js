
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

// Initialize App
function init() {
    renderCategories();
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
        
        category.timers.forEach(timerId => {
            const timer = timers.find(t => t.id === timerId);
            if (timer && !timer.deleted) {
                const timerDiv = createTimerElement(timer);
                categoryDiv.appendChild(timerDiv);
            }
        });
        
        categoriesList.appendChild(categoryDiv);
    });
}

// Create Timer Element
function createTimerElement(timer) {
    const timerDiv = document.createElement('div');
    timerDiv.classList.add('timer');
    timerDiv.setAttribute('data-timer-color', timer.color);
    
    const timerName = document.createElement('span');
    timerName.classList.add('name');
    timerName.textContent = timer.name;
    
    const timerTime = document.createElement('span');
    timerTime.classList.add('time');
    timerTime.textContent = getElapsedTime(timer);
    
    timerDiv.appendChild(timerName);
    timerDiv.appendChild(timerTime);
    
    // Add event listeners
    timerDiv.addEventListener('click', () => openTimerSettings(timer.id));
    
    return timerDiv;
}

// Calculate elapsed time for a timer
function getElapsedTime(timer) {
    const now = Date.now();
    const elapsed = now - timer.startTime;
    
    const days = Math.floor(elapsed / (1000 * 60 * 60 * 24));
    const hours = Math.floor((elapsed / (1000 * 60 * 60)) % 24);
    
    return `${days}d ${hours}h ago`;
}

// Open Timer Settings
function openTimerSettings(timerId) {
    const timer = timers.find(t => t.id === timerId);
    if (timer) {
        settingsContent.innerHTML = `
            <h3>Edit Timer: ${timer.name}</h3>
            <label>Name: <input type="text" id="timer-name" value="${timer.name}"></label>
            <label>Color: <input type="color" id="timer-color" value="${timer.color}"></label>
            <button onclick="updateTimer(${timerId})">Save Changes</button>
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
        
        saveToLocalStorage();
        renderCategories();
    }
}

// Save to Local Storage
function saveToLocalStorage() {
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
        saveToLocalStorage();
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
        saveToLocalStorage();
        renderCategories();
    }
});

// Initialize the app
init();


