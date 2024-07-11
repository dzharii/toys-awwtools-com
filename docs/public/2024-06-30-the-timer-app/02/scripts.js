
// Load predefined timers
const predefinedTimers = [...predefinedTimersArray];

// Function to get timers from local storage
function getStoredTimers() {
    return JSON.parse(localStorage.getItem('customTimers')) || [];
}

// Function to save timers to local storage
function saveTimers(timers) {
    localStorage.setItem('customTimers', JSON.stringify(timers));
}

// Function to merge predefined and stored timers
function mergeTimers() {
    const storedTimers = getStoredTimers();
    const allTimers = [...predefinedTimers, ...storedTimers];
    return allTimers;
}

// Function to render timers
function renderTimers() {
    const categoriesDiv = document.getElementById('categories');
    categoriesDiv.innerHTML = '';

    const timers = mergeTimers();
    const categories = [...new Set(timers.map(timer => timer.category))];

    categories.forEach(category => {
        const categoryDiv = document.createElement('div');
        categoryDiv.classList.add('category');

        const categoryHeader = document.createElement('h2');
        categoryHeader.textContent = category;
        categoryHeader.addEventListener('click', () => {
            const timersDiv = categoryDiv.querySelector('.timers');
            timersDiv.classList.toggle('hidden');
        });

        const timersDiv = document.createElement('div');
        timersDiv.classList.add('timers');

        timers.filter(timer => timer.category === category).forEach(timer => {
            const timerDiv = document.createElement('div');
            timerDiv.classList.add('timer-grid');
            
            const timerDetails = document.createElement('div');
            timerDetails.classList.add('timer-details');
            
            const timerName = document.createElement('h3');
            timerName.textContent = timer.name;

            const timerDesc = document.createElement('p');
            timerDesc.textContent = timer.description || '';

            const timerDuration = document.createElement('p');
            timerDuration.classList.add('timer-duration');
            timerDuration.textContent = formatTime(timer.duration);

            timerDetails.appendChild(timerName);
            timerDetails.appendChild(timerDesc);

            const timerControls = document.createElement('div');
            timerControls.classList.add('timer-controls');

            const startButton = document.createElement('button');
            startButton.textContent = 'Start';
            startButton.addEventListener('click', () => toggleTimer(timer, timerDiv, startButton));

            const resetButton = document.createElement('button');
            resetButton.textContent = 'Reset';
            resetButton.addEventListener('click', () => resetTimer(timer, timerDiv));

            timerControls.appendChild(startButton);
            timerControls.appendChild(resetButton);

            const endTime = document.createElement('p');
            endTime.classList.add('timer-end');
            endTime.textContent = formatEndTime(timer.duration);

            timerDiv.appendChild(timerDetails);
            timerDiv.appendChild(timerControls);
            timerDiv.appendChild(endTime);

            timersDiv.appendChild(timerDiv);
        });

        const addTimerButton = document.createElement('button');
        addTimerButton.textContent = 'Add Timer';
        addTimerButton.addEventListener('click', () => {
            // Logic to add a new timer to this category
            const newTimer = {
                category: category,
                name: 'New Timer',
                description: 'This is a custom timer',
                duration: 3600
            };
            const storedTimers = getStoredTimers();
            storedTimers.push(newTimer);
            saveTimers(storedTimers);
            renderTimers();
        });

        categoryDiv.appendChild(categoryHeader);
        categoryDiv.appendChild(timersDiv);
        categoryDiv.appendChild(addTimerButton);
        categoriesDiv.appendChild(categoryDiv);
    });
}

// Timer control functions
function toggleTimer(timer, timerDiv, button) {
    if (button.textContent === 'Start') {
        startTimer(timer, timerDiv, button);
    } else {
        stopTimer(timer, timerDiv, button);
    }
}

function startTimer(timer, timerDiv, button) {
    if (!timer.intervalId) {
        timer.endTime = Date.now() + timer.duration * 1000;
        timer.intervalId = setInterval(() => updateTimer(timer, timerDiv), 1000);
        button.textContent = 'Stop';
    }
}

function stopTimer(timer, timerDiv, button) {
    clearInterval(timer.intervalId);
    delete timer.intervalId;
    button.textContent = 'Start';
}

function resetTimer(timer, timerDiv) {
    stopTimer(timer, timerDiv);
    delete timer.endTime;
    renderTimers();
}

function updateTimer(timer, timerDiv) {
    const remainingTime = Math.max(0, timer.endTime - Date.now()) / 1000;
    const durationElement = timerDiv.querySelector('.timer-duration');
    durationElement.textContent = formatTime(remainingTime);

    const endTimeElement = timerDiv.querySelector('.timer-end');
    endTimeElement.textContent = formatEndTime(remainingTime);

    if (remainingTime <= 0) {
        stopTimer(timer, timerDiv, timerDiv.querySelector('button'));
        playNotificationSound('complete');
        renderTimers();
    } else {
        if (remainingTime <= timer.duration * 0.1) {
            playNotificationSound('90_percent');
        }
        if (remainingTime <= 5) {
            playNotificationSound('countdown', remainingTime);
        }
    }
}

// Format time in hours, minutes, and seconds
function formatTime(seconds) {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return `${hrs}h ${mins}m ${secs}s`;
}

// Format end time in hours, minutes, and seconds
function formatEndTime(seconds) {
    const endTime = new Date(Date.now() + seconds * 1000);
    const hrs = endTime.getHours();
    const mins = endTime.getMinutes();
    const secs = endTime.getSeconds();
    return `${hrs}:${mins}:${secs}`;
}

// Sound notifications
function playNotificationSound(type, remainingTime) {
    let soundFile = 'sounds/notification.mp3';
    const audio = new Audio(soundFile);
    if (type === 'countdown') {
        audio.playbackRate = 1 + (5 - remainingTime) * 0.2;
    }
    audio.play();
}

// Function to export custom timers
function exportTimers() {
    const storedTimers = getStoredTimers();
    const exportData = JSON.stringify(storedTimers, null, 2);
    const blob = new Blob([exportData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'custom_timers.json';
    a.click();
    URL.revokeObjectURL(url);
}

// Initialization
document.addEventListener('DOMContentLoaded', () => {
    renderTimers();

    document.getElementById('addCategoryBtn').addEventListener('click', () => {
        const newCategory = prompt('Enter new category name:');
        if (newCategory) {
            const categoryDiv = document.createElement('div');
            categoryDiv.classList.add('category');
            const categoryHeader = document.createElement('h2');
            categoryHeader.textContent = newCategory;
            categoryHeader.addEventListener('click', () => {
                const timersDiv = categoryDiv.querySelector('.timers');
                timersDiv.classList.toggle('hidden');
            });
            const timersDiv = document.createElement('div');
            timersDiv.classList.add('timers');
            const addTimerButton = document.createElement('button');
            addTimerButton.textContent = 'Add Timer';
            addTimerButton.addEventListener('click', () => {
                const newTimer = {
                    category: newCategory,
                    name: 'New Timer',
                    description: 'This is a custom timer',
                    duration: 3600
                };
                const storedTimers = getStoredTimers();
                storedTimers.push(newTimer);
                saveTimers(storedTimers);
                renderTimers();
            });
            categoryDiv.appendChild(categoryHeader);
            categoryDiv.appendChild(timersDiv);
            categoryDiv.appendChild(addTimerButton);
            document.getElementById('categories').appendChild(categoryDiv);
        }
    });

    document.getElementById('exportTimersBtn').addEventListener('click', exportTimers);
});

