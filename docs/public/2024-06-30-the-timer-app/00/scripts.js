
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
            timerDiv.classList.add('timer');
            
            const timerName = document.createElement('h3');
            timerName.textContent = timer.name;

            const timerDesc = document.createElement('p');
            timerDesc.textContent = timer.description || '';

            const timerDuration = document.createElement('p');
            timerDuration.textContent = `Duration: ${timer.duration} seconds`;

            timerDiv.appendChild(timerName);
            timerDiv.appendChild(timerDesc);
            timerDiv.appendChild(timerDuration);

            const startButton = document.createElement('button');
            startButton.textContent = 'Start';
            startButton.addEventListener('click', () => startTimer(timer, timerDiv));

            const stopButton = document.createElement('button');
            stopButton.textContent = 'Stop';
            stopButton.addEventListener('click', () => stopTimer(timer, timerDiv));

            const resetButton = document.createElement('button');
            resetButton.textContent = 'Reset';
            resetButton.addEventListener('click', () => resetTimer(timer, timerDiv));

            timerDiv.appendChild(startButton);
            timerDiv.appendChild(stopButton);
            timerDiv.appendChild(resetButton);

            timersDiv.appendChild(timerDiv);
        });

        categoryDiv.appendChild(categoryHeader);
        categoryDiv.appendChild(timersDiv);
        categoriesDiv.appendChild(categoryDiv);
    });
}

// Timer control functions
function startTimer(timer, timerDiv) {
    if (!timer.intervalId) {
        timer.endTime = Date.now() + timer.duration * 1000;
        timer.intervalId = setInterval(() => updateTimer(timer, timerDiv), 1000);
    }
}

function stopTimer(timer, timerDiv) {
    clearInterval(timer.intervalId);
    delete timer.intervalId;
}

function resetTimer(timer, timerDiv) {
    stopTimer(timer, timerDiv);
    delete timer.endTime;
    renderTimers();
}

function updateTimer(timer, timerDiv) {
    const remainingTime = Math.max(0, timer.endTime - Date.now()) / 1000;
    if (remainingTime <= 0) {
        stopTimer(timer, timerDiv);
        playNotificationSound('complete');
        renderTimers();
    } else {
        const durationElement = timerDiv.querySelector('p:nth-of-type(2)');
        durationElement.textContent = `Time left: ${remainingTime.toFixed(1)} seconds`;

        if (remainingTime <= timer.duration * 0.1) {
            playNotificationSound('90_percent');
        }

        if (remainingTime <= 5) {
            playNotificationSound('countdown', remainingTime);
        }
    }
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

// Initialization
document.addEventListener('DOMContentLoaded', () => {
    renderTimers();

    document.getElementById('addTimerBtn').addEventListener('click', () => {
        // Logic to add a new timer
    });

    document.getElementById('addCategoryBtn').addEventListener('click', () => {
        // Logic to add a new category
    });
});

