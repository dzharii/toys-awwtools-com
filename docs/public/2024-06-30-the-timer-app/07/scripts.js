// Load predefined timers
const predefinedTimers = [...predefinedTimersArray];

// Function to get timers from local storage
function getStoredTimers() {
    try {
        return JSON.parse(localStorage.getItem('customTimers')) || [];
    } catch (error) {
        console.error('Error parsing timers from local storage:', error);
        return [];
    }
}

// Function to save timers to local storage
function saveTimers(timers) {
    try {
        localStorage.setItem('customTimers', JSON.stringify(timers));
    } catch (error) {
        console.error('Error saving timers to local storage:', error);
    }
}

// Function to merge predefined and stored timers
function mergeTimers() {
    try {
        const storedTimers = getStoredTimers();
        return [...predefinedTimers, ...storedTimers];
    } catch (error) {
        console.error('Error merging timers:', error);
        return predefinedTimers;
    }
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
            categoryDiv.classList.toggle('collapsed');
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

            const currentTimerValue = document.createElement('p');
            currentTimerValue.classList.add('current-timer-value');
            currentTimerValue.textContent = formatTime(timer.duration);

            const endTime = document.createElement('p');
            endTime.classList.add('timer-end');
            endTime.textContent = formatEndTime(timer.duration);

            timerDiv.appendChild(timerDetails);
            timerDiv.appendChild(timerControls);
            timerDiv.appendChild(currentTimerValue);
            timerDiv.appendChild(endTime);

            timersDiv.appendChild(timerDiv);
        });

        const addTimerButton = document.createElement('button');
        addTimerButton.textContent = 'Add Timer';
        addTimerButton.classList.add('add-timer-button');
        addTimerButton.addEventListener('click', () => {
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
    const resetButton = timerDiv.querySelector('.timer-controls button:nth-child(2)');
    if (button.textContent === 'Start') {
        startTimer(timer, timerDiv, button);
        resetButton.disabled = true;
    } else {
        stopTimer(timer, timerDiv, button);
        resetButton.disabled = false;
    }
}

function startTimer(timer, timerDiv, button) {
    if (!timer.intervalId) {
        timer.endTime = Date.now() + timer.duration * 1000;
        timer.intervalId = setInterval(() => updateTimer(timer, timerDiv), 1000);
        button.textContent = 'Stop';
        console.log(`Timer "${timer.name}" started.`);
    }
}

function stopTimer(timer, timerDiv, button) {
    if (timer.intervalId) {
        clearInterval(timer.intervalId);
        delete timer.intervalId;
        button.textContent = 'Start';
        console.log(`Timer "${timer.name}" stopped.`);
    }
}

function resetTimer(timer, timerDiv) {
    stopTimer(timer, timerDiv, timerDiv.querySelector('.timer-controls button:nth-child(1)'));
    delete timer.endTime;
    console.log(`Timer "${timer.name}" reset.`);
    renderTimers();
}

function updateTimer(timer, timerDiv) {
    const remainingTime = Math.max(0, timer.endTime - Date.now()) / 1000;
    const durationElement = timerDiv.querySelector('.timer-duration');
    const currentTimerValueElement = timerDiv.querySelector('.current-timer-value');
    const endTimeElement = timerDiv.querySelector('.timer-end');
    
    if (durationElement && currentTimerValueElement && endTimeElement) {
        durationElement.textContent = formatTime(timer.duration);
        currentTimerValueElement.textContent = formatTime(remainingTime);
        endTimeElement.textContent = formatEndTime(remainingTime);
    } else {
        console.error('Timer elements not found:', { durationElement, currentTimerValueElement, endTimeElement });
        return;
    }

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
    return `${hrs.toString().padStart(2, '0')}h ${mins.toString().padStart(2, '0')}m ${secs.toString().padStart(2, '0')}s`;
}

// Format end time in hours, minutes, and seconds
function formatEndTime(seconds) {
    const endTime = new Date(Date.now() + seconds * 1000);
    const hrs = endTime.getHours().toString().padStart(2, '0');
    const mins = endTime.getMinutes().toString().padStart(2, '0');
    const secs = endTime.getSeconds().toString().padStart(2, '0');
    return `${hrs}:${mins}:${secs}`;
}

// Sound notifications using Web Audio API
function playNotificationSound(type, remainingTime) {
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        switch (type) {
            case '90_percent':
                oscillator.frequency.value = 440; // A4
                break;
            case 'countdown':
                oscillator.frequency.value = 880 - remainingTime * 100; // decreasing pitch
                break;
            case 'complete':
                oscillator.frequency.value = 660; // E5
                break;
            default:
                oscillator.frequency.value = 440; // A4
        }
        
        oscillator.type = 'sine';
        gainNode.gain.setValueAtTime(1, audioContext.currentTime);
        oscillator.start();
        
        setTimeout(() => {
            gainNode.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 0.5);
            oscillator.stop(audioContext.currentTime + 0.5);
        }, 500);
        
        console.log(`Playing sound: ${type}`);
    } catch (error) {
        console.error('Error playing notification sound:', error);
    }
}

// Function to export custom timers
function exportTimers() {
    try {
        const storedTimers = getStoredTimers();
        const exportData = JSON.stringify(storedTimers, null, 2);
        const blob = new Blob([exportData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'custom_timers.json';
        a.click();
        URL.revokeObjectURL(url);
        console.log('Timers exported successfully.');
    } catch (error) {
        console.error('Error exporting timers:', error);
    }
}

// Initialization
document.addEventListener('DOMContentLoaded', () => {
    try {
        renderTimers();
    
        document.getElementById('addCategoryBtn').addEventListener('click', () => {
            const newCategory = prompt('Enter new category name:');
            if (newCategory) {
                const storedTimers = getStoredTimers();
                storedTimers.push({ category: newCategory, name: '', description: '', duration: 0 });
                saveTimers(storedTimers);
                renderTimers();
                console.log(`Category "${newCategory}" added.`);
            }
        });
    
        document.getElementById('exportTimersBtn').addEventListener('click', exportTimers);
    } catch (error) {
        console.error('Error during initialization:', error);
    }
});

