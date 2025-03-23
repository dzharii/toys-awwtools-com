/**
 * Main application logic for the Japanese Language Learning App
 * Handles navigation, UI updates, and user interactions
 */

// Initialize the application when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', initApp);

function initApp() {
    // Set up navigation event listeners
    document.getElementById('startLearning').addEventListener('click', () => {
        showExercises();
    });
    
    document.getElementById('backToExercises').addEventListener('click', () => {
        switchScreen('exerciseScreen');
    });
    
    document.getElementById('checkAnswer').addEventListener('click', () => {
        checkActivityAnswer();
    });
    
    document.getElementById('nextActivity').addEventListener('click', () => {
        moveToNextActivity();
    });
    
    document.getElementById('returnToExercises').addEventListener('click', () => {
        showExercises();
    });
    
    // Load user stats
    const stats = getUserStats();
    updateStatsDisplay(stats);
    
    // Display home screen
    switchScreen('homeScreen');
}

// Show all available exercises
function showExercises() {
    // Get all exercises
    const exercises = getAllExercises();
    const exerciseList = document.getElementById('exerciseList');
    
    // Clear existing exercises
    exerciseList.innerHTML = '';
    
    // Create an exercise card for each exercise
    exercises.forEach(exercise => {
        const exerciseCard = createExerciseCard(exercise);
        exerciseList.appendChild(exerciseCard);
    });
    
    // Switch to exercise screen
    switchScreen('exerciseScreen');
}

// Create an exercise card element
function createExerciseCard(exercise) {
    // Get user progress for this exercise
    const userProgress = getUserProgress();
    const exerciseProgress = userProgress[exercise.id] || { completedActivities: 0, score: 0 };
    
    // Calculate progress percentage
    const totalActivities = exercise.activities.length;
    const progressPercent = totalActivities > 0 ? 
        (exerciseProgress.completedActivities / totalActivities) * 100 : 0;
    
    // Create card element
    const card = document.createElement('div');
    card.className = 'exercise-card';
    card.dataset.exerciseId = exercise.id;
    
    // Add card content
    card.innerHTML = `
        <div class="exercise-icon">${exercise.icon}</div>
        <h3 class="exercise-title">${exercise.title}</h3>
        <p class="exercise-description">${exercise.description}</p>
        <div class="exercise-progress">
            <div class="exercise-progress-bar" style="width: ${progressPercent}%"></div>
        </div>
        <div class="exercise-score">${exerciseProgress.score ? exerciseProgress.score + '%' : 'Not started'}</div>
    `;
    
    // Add click event to start the exercise
    card.addEventListener('click', () => {
        startExercise(exercise.id);
    });
    
    return card;
}

// Switch between screens
function switchScreen(screenId) {
    // Hide all screens
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    
    // Show the requested screen
    document.getElementById(screenId).classList.add('active');
    
    // Update progress bar based on screen
    if (screenId === 'homeScreen' || screenId === 'exerciseScreen') {
        updateProgressBar(0);
    }
    
    // Scroll to top
    window.scrollTo(0, 0);
}

// Update user stats display
function updateStatsDisplay(stats) {
    document.getElementById('streakCount').textContent = stats.streak;
    document.getElementById('pointsCount').textContent = stats.points;
}

// Handle key events for keyboard shortcuts
document.addEventListener('keydown', (event) => {
    // Space or Enter to check answer when available
    if ((event.key === ' ' || event.key === 'Enter') && 
        document.getElementById('activityScreen').classList.contains('active') &&
        !document.getElementById('checkAnswer').disabled &&
        !activityState.isActivityCompleted) {
        event.preventDefault();
        checkActivityAnswer();
        return;
    }
    
    // Right arrow or Enter to proceed to next activity
    if ((event.key === 'ArrowRight' || event.key === 'Enter') && 
        document.getElementById('activityScreen').classList.contains('active') &&
        activityState.isActivityCompleted) {
        event.preventDefault();
        moveToNextActivity();
        return;
    }
    
    // Escape to go back to exercises
    if (event.key === 'Escape' && 
        document.getElementById('activityScreen').classList.contains('active')) {
        event.preventDefault();
        switchScreen('exerciseScreen');
        return;
    }
});

// Implement security measures
(function implementSecurityMeasures() {
    // Prevent XSS in user input
    document.addEventListener('input', function(event) {
        if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
            // Sanitize input
            const sanitized = event.target.value
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;');
            
            if (sanitized !== event.target.value) {
                event.target.value = sanitized;
            }
        }
    });
    
    // Content Security Policy
    const metaTag = document.createElement('meta');
    metaTag.httpEquiv = 'Content-Security-Policy';
    metaTag.content = "default-src 'self'; style-src 'self' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com;";
    document.head.appendChild(metaTag);
})();
