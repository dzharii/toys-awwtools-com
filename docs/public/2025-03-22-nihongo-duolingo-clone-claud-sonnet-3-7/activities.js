/**
 * Activities implementation for Japanese language learning app
 * Contains functions for creating, handling, and checking different activity types
 */

// Store the current state of the activity
const activityState = {
    currentExercise: null,
    currentActivityIndex: 0,
    selectedAnswers: [],
    matchedPairs: [],
    isActivityCompleted: false,
    correctAnswers: 0,
    totalActivities: 0
};

// Activity factory - creates the appropriate activity based on type
function createActivity(activity) {
    switch (activity.type) {
        case 'multipleChoice':
            return createMultipleChoiceActivity(activity);
        case 'matching':
            return createMatchingActivity(activity);
        case 'typing':
            return createTypingActivity(activity);
        default:
            console.error('Unknown activity type:', activity.type);
            return document.createElement('div');
    }
}

// Create multiple choice activity
function createMultipleChoiceActivity(activity) {
    // Clone the template
    const template = document.getElementById('multipleChoiceTemplate');
    const activityElement = document.importNode(template.content, true);
    
    // Set the prompt
    const promptText = activityElement.querySelector('.prompt-text');
    promptText.textContent = activity.prompt;
    promptText.classList.add('japanese-text');
    
    // Add audio button functionality if audio is provided
    const audioButton = activityElement.querySelector('.audio-button');
    if (activity.audio) {
        audioButton.querySelector('.play-audio').addEventListener('click', () => {
            playAudio(activity.audio);
        });
    } else {
        audioButton.style.display = 'none';
    }
    
    // Create options
    const optionsContainer = activityElement.querySelector('.options-container');
    activity.options.forEach((option, index) => {
        const optionElement = document.createElement('div');
        optionElement.className = 'option';
        optionElement.dataset.index = index;
        optionElement.textContent = option.text;
        optionElement.classList.add('japanese-text');
        
        // Add click handler
        optionElement.addEventListener('click', () => {
            // Deselect all options
            document.querySelectorAll('.option').forEach(opt => {
                opt.classList.remove('selected');
            });
            
            // Select this option
            optionElement.classList.add('selected');
            
            // Store the selected answer
            activityState.selectedAnswers = [index];
            
            // Enable the check button
            document.getElementById('checkAnswer').disabled = false;
        });
        
        optionsContainer.appendChild(optionElement);
    });
    
    return activityElement;
}

// Create matching activity
function createMatchingActivity(activity) {
    // Clone the template
    const template = document.getElementById('matchingTemplate');
    const activityElement = document.importNode(template.content, true);
    
    // Set the prompt
    const promptText = activityElement.querySelector('.prompt-text');
    promptText.textContent = activity.prompt;
    
    // Create shuffled arrays for left and right sides
    const leftItems = activity.pairs.map((pair, index) => ({ text: pair.left, index }));
    const rightItems = activity.pairs.map((pair, index) => ({ text: pair.right, index }));
    
    // Shuffle right items
    shuffleArray(rightItems);
    
    // Reset matched pairs
    activityState.matchedPairs = [];
    activityState.selectedAnswers = [];
    
    // Create left side items
    const leftContainer = activityElement.querySelector('.matching-left');
    leftItems.forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.className = 'matching-item japanese-text';
        itemElement.dataset.index = item.index;
        itemElement.textContent = item.text;
        
        // Add click handler
        itemElement.addEventListener('click', () => handleMatchingItemClick(itemElement, 'left'));
        
        leftContainer.appendChild(itemElement);
    });
    
    // Create right side items
    const rightContainer = activityElement.querySelector('.matching-right');
    rightItems.forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.className = 'matching-item';
        itemElement.dataset.index = item.index;
        itemElement.textContent = item.text;
        
        // Add click handler
        itemElement.addEventListener('click', () => handleMatchingItemClick(itemElement, 'right'));
        
        rightContainer.appendChild(itemElement);
    });
    
    return activityElement;
}

// Handle click on matching items
function handleMatchingItemClick(itemElement, side) {
    // Skip if item is already matched
    if (itemElement.classList.contains('matched')) {
        return;
    }
    
    // Deselect all items on the same side
    document.querySelectorAll(`.matching-${side} .matching-item`).forEach(item => {
        if (!item.classList.contains('matched')) {
            item.classList.remove('selected');
        }
    });
    
    // Select this item
    itemElement.classList.add('selected');
    
    // Update selected answers
    if (side === 'left') {
        activityState.selectedAnswers[0] = parseInt(itemElement.dataset.index);
    } else {
        activityState.selectedAnswers[1] = parseInt(itemElement.dataset.index);
    }
    
    // Check if we have both sides selected
    if (activityState.selectedAnswers.length === 2 && 
        activityState.selectedAnswers[0] !== undefined && 
        activityState.selectedAnswers[1] !== undefined) {
        // Enable the check button
        document.getElementById('checkAnswer').disabled = false;
    }
}

// Create typing activity
function createTypingActivity(activity) {
    // Clone the template
    const template = document.getElementById('typingTemplate');
    const activityElement = document.importNode(template.content, true);
    
    // Set the prompt
    const promptText = activityElement.querySelector('.prompt-text');
    promptText.textContent = activity.prompt;
    promptText.classList.add('japanese-text');
    
    // Add audio button functionality if audio is provided
    const audioButton = activityElement.querySelector('.audio-button');
    if (activity.audio) {
        audioButton.querySelector('.play-audio').addEventListener('click', () => {
            playAudio(activity.audio);
        });
    } else {
        audioButton.style.display = 'none';
    }
    
    // Set up input field
    const inputField = activityElement.querySelector('.typing-input');
    
    // Add input handler
    inputField.addEventListener('input', () => {
        // Store the typed answer
        activityState.selectedAnswers = [inputField.value.trim().toLowerCase()];
        
        // Enable the check button if there is any input
        document.getElementById('checkAnswer').disabled = !inputField.value.trim();
    });
    
    return activityElement;
}

// Check the current activity answer
function checkActivityAnswer() {
    // Get the current activity
    const currentActivity = activityState.currentExercise.activities[activityState.currentActivityIndex];
    const activityContainer = document.getElementById('activityContainer');
    const feedbackElement = activityContainer.querySelector('.feedback');
    
    // Disable the check button
    document.getElementById('checkAnswer').disabled = true;
    
    let isCorrect = false;
    
    // Check based on activity type
    switch (currentActivity.type) {
        case 'multipleChoice':
            isCorrect = checkMultipleChoiceAnswer(currentActivity);
            break;
        case 'matching':
            isCorrect = checkMatchingAnswer(currentActivity);
            break;
        case 'typing':
            isCorrect = checkTypingAnswer(currentActivity);
            break;
    }
    
    // Update activity state
    activityState.isActivityCompleted = true;
    
    // Update stats
    if (isCorrect) {
        activityState.correctAnswers++;
    }
    
    // Show feedback
    feedbackElement.textContent = isCorrect ? 
        currentActivity.feedback.correct : 
        currentActivity.feedback.incorrect;
    
    feedbackElement.className = 'feedback ' + (isCorrect ? 'correct' : 'incorrect');
    
    // Enable the next button
    document.getElementById('nextActivity').disabled = false;
    
    return isCorrect;
}

// Check multiple choice answer
function checkMultipleChoiceAnswer(activity) {
    const selectedIndex = activityState.selectedAnswers[0];
    const isCorrect = activity.options[selectedIndex] && activity.options[selectedIndex].isCorrect;
    
    // Update UI
    const options = document.querySelectorAll('.option');
    
    options.forEach((option, index) => {
        const optionData = activity.options[index];
        
        if (index === selectedIndex) {
            option.classList.add(isCorrect ? 'correct' : 'incorrect');
        } else if (optionData.isCorrect) {
            option.classList.add('correct');
        }
    });
    
    return isCorrect;
}

// Check matching answer
function checkMatchingAnswer(activity) {
    const [leftIndex, rightIndex] = activityState.selectedAnswers;
    const isCorrect = leftIndex === rightIndex;
    
    // Update UI
    const leftItems = document.querySelectorAll('.matching-left .matching-item');
    const rightItems = document.querySelectorAll('.matching-right .matching-item');
    
    if (isCorrect) {
        // Mark as matched
        leftItems[leftIndex].classList.add('matched');
        rightItems.forEach(item => {
            if (parseInt(item.dataset.index) === rightIndex) {
                item.classList.add('matched');
            }
        });
        
        // Add to matched pairs
        activityState.matchedPairs.push(leftIndex);
        
        // Clear selection
        activityState.selectedAnswers = [];
        
        // Check if all pairs are matched
        if (activityState.matchedPairs.length === activity.pairs.length) {
            return true;
        } else {
            // Enable check button for next pairing
            document.getElementById('checkAnswer').disabled = true;
            
            // Remove selected class
            document.querySelectorAll('.matching-item').forEach(item => {
                if (!item.classList.contains('matched')) {
                    item.classList.remove('selected');
                }
            });
            
            return false;
        }
    } else {
        // Show correct match
        leftItems.forEach(item => {
            if (parseInt(item.dataset.index) === leftIndex) {
                item.classList.add('incorrect');
            }
        });
        
        rightItems.forEach(item => {
            if (parseInt(item.dataset.index) === leftIndex) {
                item.classList.add('correct');
            } else if (parseInt(item.dataset.index) === rightIndex) {
                item.classList.add('incorrect');
            }
        });
        
        return false;
    }
}

// Check typing answer
function checkTypingAnswer(activity) {
    const userAnswer = activityState.selectedAnswers[0];
    
    // Check against correct answer and alternatives
    let isCorrect = userAnswer === activity.answer.toLowerCase();
    
    if (!isCorrect && activity.alternatives) {
        isCorrect = activity.alternatives.some(alt => 
            alt.toLowerCase() === userAnswer
        );
    }
    
    // Update UI
    const inputField = document.querySelector('.typing-input');
    inputField.classList.add(isCorrect ? 'correct' : 'incorrect');
    inputField.readOnly = true;
    
    return isCorrect;
}

// Move to the next activity
function moveToNextActivity() {
    // Increment activity index
    activityState.currentActivityIndex++;
    
    // Check if we've finished all activities
    if (activityState.currentActivityIndex >= activityState.currentExercise.activities.length) {
        // Show results screen
        showResults();
    } else {
        // Load the next activity
        loadActivity();
    }
}

// Show exercise results
function showResults() {
    // Calculate score
    const score = Math.round((activityState.correctAnswers / activityState.totalActivities) * 100);
    const pointsEarned = activityState.correctAnswers * 10;
    
    // Update UI
    document.getElementById('scorePercent').textContent = score + '%';
    document.getElementById('correctAnswers').textContent = activityState.correctAnswers + ' / ' + activityState.totalActivities;
    document.getElementById('pointsEarned').textContent = pointsEarned;
    
    // Switch to results screen
    switchScreen('resultsScreen');
    
    // Save progress
    saveUserProgress(
        activityState.currentExercise.id, 
        activityState.totalActivities, 
        score
    );
    
    // Update user stats
    const stats = updateUserStats(pointsEarned);
    updateStatsDisplay(stats);
}

// Load an activity into the DOM
function loadActivity() {
    // Reset state for the new activity
    activityState.selectedAnswers = [];
    activityState.isActivityCompleted = false;
    
    // Get the current activity
    const currentActivity = activityState.currentExercise.activities[activityState.currentActivityIndex];
    
    // Update progress indicators
    document.getElementById('currentActivity').textContent = activityState.currentActivityIndex + 1;
    document.getElementById('totalActivities').textContent = activityState.totalActivities;
    
    // Update progress bar
    updateProgressBar((activityState.currentActivityIndex / activityState.totalActivities) * 100);
    
    // Create the activity element
    const activityElement = createActivity(currentActivity);
    
    // Insert into container
    const activityContainer = document.getElementById('activityContainer');
    activityContainer.innerHTML = '';
    activityContainer.appendChild(activityElement);
    
    // Reset buttons
    document.getElementById('checkAnswer').disabled = true;
    document.getElementById('nextActivity').disabled = true;
}

// Start a new exercise
function startExercise(exerciseId) {
    // Get the exercise data
    const exercise = getExerciseById(exerciseId);
    
    if (!exercise) {
        console.error('Exercise not found:', exerciseId);
        return;
    }
    
    // Set up activity state
    activityState.currentExercise = exercise;
    activityState.currentActivityIndex = 0;
    activityState.correctAnswers = 0;
    activityState.totalActivities = exercise.activities.length;
    
    // Load the first activity
    loadActivity();
    
    // Switch to activity screen
    switchScreen('activityScreen');
}

// Update the progress bar
function updateProgressBar(percentage) {
    document.getElementById('progressBar').style.width = percentage + '%';
}

// Utility function to shuffle array
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Play audio file (stubbed for local use)
function playAudio(audioFile) {
    console.log('Playing audio:', audioFile);
    // In a real implementation, this would play the audio file
    // Since this is a local demo without actual audio files, we'll just show an alert
    alert('Playing audio: ' + audioFile + ' (Audio would play in a complete implementation)');
}

