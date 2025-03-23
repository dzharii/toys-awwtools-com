/**
 * Main application logic for the Japanese Story Reader
 * Handles story display, animations, word prompts, and user interactions
 */

// Global state
const appState = {
    currentStory: null,
    currentSentenceIndex: 0,
    readingPaused: false,
    readingSpeed: 5,
    promptFrequency: 8,
    correctAnswers: 0,
    totalPrompts: 0,
    startTime: null,
    showFurigana: true,
    sentenceTimer: null
};

// Initialize the application when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', initApp);

function initApp() {
    // Set up UI event listeners
    setupEventListeners();
    
    // Load user settings
    loadUserSettings();
    
    // Display story selection screen
    showStorySelection();
    
    // Set up security measures
    implementSecurityMeasures();
}

// Set up event listeners for UI interactions
function setupEventListeners() {
    // Navigation buttons
    document.getElementById('backToStories').addEventListener('click', () => {
        clearInterval(appState.sentenceTimer);
        showStorySelection();
    });
    
    document.getElementById('returnToStories').addEventListener('click', () => {
        showStorySelection();
    });
    
    document.getElementById('restartStory').addEventListener('click', () => {
        startStory(appState.currentStory.id);
    });
    
    // Controls
    document.getElementById('pauseButton').addEventListener('click', togglePause);
    
    document.getElementById('readingSpeed').addEventListener('input', (e) => {
        appState.readingSpeed = parseInt(e.target.value);
        if (!appState.readingPaused && appState.currentStory) {
            resetSentenceTimer();
        }
    });
    
    // Settings
    document.getElementById('settingsButton').addEventListener('click', () => {
        document.getElementById('settingsModal').classList.remove('hidden');
        appState.readingPaused = true;
    });
    
    document.getElementById('closeSettings').addEventListener('click', () => {
        document.getElementById('settingsModal').classList.add('hidden');
    });
    
    document.getElementById('saveSettings').addEventListener('click', saveSettings);
    
    document.getElementById('promptFrequency').addEventListener('input', (e) => {
        document.getElementById('promptFrequencyValue').textContent = e.target.value;
    });
}

// Toggle story pause state
function togglePause() {
    const pauseButton = document.getElementById('pauseButton');
    
    if (appState.readingPaused) {
        appState.readingPaused = false;
        pauseButton.textContent = '⏸️';
        if (appState.currentStory) {
            displayNextSentence();
        }
    } else {
        appState.readingPaused = true;
        pauseButton.textContent = '▶️';
        clearInterval(appState.sentenceTimer);
    }
}

// Load user settings from localStorage
function loadUserSettings() {
    const settings = getUserSettings();
    
    appState.readingSpeed = settings.readingSpeed;
    appState.promptFrequency = settings.promptFrequency;
    appState.showFurigana = settings.showFurigana;
    
    // Update UI to reflect settings
    document.getElementById('readingSpeed').value = settings.readingSpeed;
    document.getElementById('promptFrequency').value = settings.promptFrequency;
    document.getElementById('promptFrequencyValue').textContent = settings.promptFrequency;
    document.getElementById('showFurigana').checked = settings.showFurigana;
    document.getElementById('audioVolume').value = settings.audioVolume;
}

// Save current settings
function saveSettings() {
    const settings = {
        readingSpeed: parseInt(document.getElementById('readingSpeed').value),
        promptFrequency: parseInt(document.getElementById('promptFrequency').value),
        showFurigana: document.getElementById('showFurigana').checked,
        audioVolume: parseInt(document.getElementById('audioVolume').value)
    };
    
    // Update app state
    appState.readingSpeed = settings.readingSpeed;
    appState.promptFrequency = settings.promptFrequency;
    appState.showFurigana = settings.showFurigana;
    
    // Save to localStorage
    saveUserSettings(settings);
    
    // Reset sentence timer if story is active
    if (appState.currentStory && !appState.readingPaused) {
        resetSentenceTimer();
    }
    
    // Close settings modal
    document.getElementById('settingsModal').classList.add('hidden');
}

// Show story selection screen
function showStorySelection() {
    // Reset state
    appState.currentStory = null;
    appState.currentSentenceIndex = 0;
    appState.readingPaused = false;
    appState.correctAnswers = 0;
    appState.totalPrompts = 0;
    
    // Update UI
    document.getElementById('pauseButton').textContent = '⏸️';
    updateProgressBar(0);
    
    // Hide all screens
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    
    // Show story selection screen
    document.getElementById('storySelectionScreen').classList.add('active');
    
    // Get all stories
    const stories = getAllStories();
    const storyList = document.getElementById('storyList');
    
    // Clear existing stories
    storyList.innerHTML = '';
    
    // Create a story card for each story
    stories.forEach(story => {
        const storyCard = createStoryCard(story);
        storyList.appendChild(storyCard);
    });
}

// Create a story card element
function createStoryCard(story) {
    // Create card element
    const card = document.createElement('div');
    card.className = 'story-card';
    card.dataset.storyId = story.id;
    
    // Add difficulty class
    const difficultyClass = `difficulty-${story.difficulty}`;
    
    // Get story progress
    const storyProgress = getStoryProgress()[story.id] || { sentencesRead: 0 };
    const totalSentences = story.sentences.length;
    const progressPercent = Math.min(100, Math.round((storyProgress.sentencesRead / totalSentences) * 100));
    
    // Add card content
    card.innerHTML = `
        <div class="story-icon">${story.icon}</div>
        <h3 class="story-title-card">${story.title}</h3>
        <p class="story-description">${story.description}</p>
        <div class="story-length">${totalSentences} sentences</div>
        <div class="story-difficulty ${difficultyClass}">${story.difficulty}</div>
        <div class="story-progress">
            <div class="progress-indicator" style="width: ${progressPercent}%"></div>
            <div class="progress-text">${progressPercent}% complete</div>
        </div>
    `;
    
    // Add click event to start the story
    card.addEventListener('click', () => {
        startStory(story.id);
    });
    
    return card;
}

// Start reading a story
function startStory(storyId) {
    // Get the story data
    const story = getStoryById(storyId);
    
    if (!story) {
        console.error('Story not found:', storyId);
        return;
    }
    
    // Set up app state
    appState.currentStory = story;
    appState.currentSentenceIndex = 0;
    appState.readingPaused = false;
    appState.correctAnswers = 0;
    appState.totalPrompts = 0;
    appState.startTime = new Date();
    
    // Update UI
    document.getElementById('storyTitle').textContent = `${story.title} (${story.titleEn})`;
    document.getElementById('sentenceContainer').innerHTML = '';
    document.getElementById('pauseButton').textContent = '⏸️';
    
    // Switch to story reading screen
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById('storyReadingScreen').classList.add('active');
    
    // Start displaying sentences
    displayNextSentence();
}

// Display the next sentence in the current story
function displayNextSentence() {
    // Clear any existing timer
    clearInterval(appState.sentenceTimer);
    
    // Check if we've reached the end of the story
    if (appState.currentSentenceIndex >= appState.currentStory.sentences.length) {
        showCompletionScreen();
        return;
    }
    
    // Get current sentence
    const sentence = appState.currentStory.sentences[appState.currentSentenceIndex];
    
    // Update progress bar
    const progress = (appState.currentSentenceIndex / appState.currentStory.sentences.length) * 100;
    updateProgressBar(progress);
    
    // Check if this sentence has a word prompt and we should show it
    if (sentence.wordPrompt && shouldShowPrompt()) {
        showWordPrompt(sentence.wordPrompt);
        return; // Don't advance to next sentence until prompt is answered
    }
    
    // Create sentence element
    const sentenceElement = createSentenceElement(sentence);
    
    // Add to container
    const container = document.getElementById('sentenceContainer');
    container.appendChild(sentenceElement);
    
    // Scroll to the new sentence
    sentenceElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    
    // Increment sentence index
    appState.currentSentenceIndex++;
    
    // Save progress
    saveStoryProgress(
        appState.currentStory.id,
        appState.currentSentenceIndex,
        appState.correctAnswers,
        appState.totalPrompts
    );
    
    // Set timer for next sentence based on reading speed
    if (!appState.readingPaused) {
        const delay = calculateReadingDelay(sentence);
        appState.sentenceTimer = setTimeout(displayNextSentence, delay);
    }
}

// Create a sentence element
function createSentenceElement(sentence) {
    // Clone the template
    const template = document.getElementById('sentenceTemplate');
    const sentenceElement = document.importNode(template.content, true);
    
    // Get Japanese and translation elements
    const japaneseText = sentenceElement.querySelector('.japanese-text');
    const translationText = sentenceElement.querySelector('.translation-text');
    
    // Set text content
    if (appState.showFurigana) {
        japaneseText.innerHTML = addFurigana(sentence.ja);
    } else {
        japaneseText.textContent = sentence.ja;
    }
    
    translationText.textContent = sentence.en;
    
    return sentenceElement.firstElementChild;
}

// Calculate reading delay based on sentence length and reading speed
function calculateReadingDelay(sentence) {
    // Base delay in milliseconds
    const baseDelay = 3000;
    
    // Adjust based on sentence length (longer sentences need more time)
    const lengthFactor = Math.max(1, sentence.ja.length / 15);
    
    // Adjust based on user's reading speed setting (1-10)
    // Higher reading speed means shorter delay
    const speedFactor = 2 - (appState.readingSpeed / 10);
    
    return Math.round(baseDelay * lengthFactor * speedFactor);
}

// Reset the sentence timer based on current reading speed
function resetSentenceTimer() {
    clearInterval(appState.sentenceTimer);
    
    if (!appState.readingPaused && appState.currentStory) {
        const currentSentence = appState.currentStory.sentences[appState.currentSentenceIndex - 1];
        if (currentSentence) {
            const delay = calculateReadingDelay(currentSentence);
            appState.sentenceTimer = setTimeout(displayNextSentence, delay);
        }
    }
}

// Determine if we should show a word prompt
function shouldShowPrompt() {
    // Every nth sentence based on user settings
    return (appState.currentSentenceIndex % appState.promptFrequency === 0);
}

// Show word selection prompt
function showWordPrompt(promptData) {
    // Pause the reading
    const wasPaused = appState.readingPaused;
    appState.readingPaused = true;
    
    // Get prompt elements
    const wordPromptElement = document.getElementById('wordPrompt');
    const wordOptionsElement = document.getElementById('wordOptions');
    const feedbackElement = document.getElementById('promptFeedback');
    
    // Clear previous content
    wordOptionsElement.innerHTML = '';
    feedbackElement.textContent = '';
    feedbackElement.className = 'prompt-feedback';
    
    // Create options
    const shuffledOptions = [...promptData.options];
    shuffleArray(shuffledOptions);
    
    shuffledOptions.forEach(option => {
        // Create option element
        const optionElement = document.createElement('div');
        optionElement.className = 'word-option';
        
        const wordText = document.createElement('span');
        wordText.className = 'word-text';
        wordText.textContent = option;
        
        optionElement.appendChild(wordText);
        
        // Add click handler
        optionElement.addEventListener('click', () => {
            // Prevent multiple selections
            if (feedbackElement.textContent) return;
            
            // Mark as selected
            document.querySelectorAll('.word-option').forEach(opt => {
                opt.classList.remove('selected');
            });
            optionElement.classList.add('selected');
            
            // Check if correct
            const isCorrect = option === promptData.correctWord;
            
            // Increment counters
            appState.totalPrompts++;
            if (isCorrect) {
                appState.correctAnswers++;
            }
            
            // Show feedback
            feedbackElement.textContent = isCorrect ? 
                'Correct! Good job!' : 
                `Incorrect. The correct answer is "${promptData.correctWord}"`;
            
            feedbackElement.className = `prompt-feedback ${isCorrect ? 'correct' : 'incorrect'}`;
            
            // Apply correct/incorrect classes
            optionElement.classList.add(isCorrect ? 'correct' : 'incorrect');
            
            if (!isCorrect) {
                // Highlight the correct answer
                document.querySelectorAll('.word-option').forEach(opt => {
                    if (opt.querySelector('.word-text').textContent === promptData.correctWord) {
                        opt.classList.add('correct');
                    }
                });
            }
            
            // Continue after a delay
            setTimeout(() => {
                wordPromptElement.classList.add('hidden');
                appState.readingPaused = wasPaused;
                
                // Increment sentence index
                appState.currentSentenceIndex++;
                
                // Save progress
                saveStoryProgress(
                    appState.currentStory.id,
                    appState.currentSentenceIndex,
                    appState.correctAnswers,
                    appState.totalPrompts
                );
                
                // Continue reading
                displayNextSentence();
            }, 2000);
        });
        
        wordOptionsElement.appendChild(optionElement);
    });
    
    // Show the context text
    const contextDisplay = document.createElement('p');
    contextDisplay.className = 'prompt-context japanese-text';
    contextDisplay.textContent = promptData.context;
    
    // Insert context before options
    const promptContent = wordPromptElement.querySelector('.word-prompt-content');
    promptContent.insertBefore(contextDisplay, wordOptionsElement);
    
    // Show the prompt
    wordPromptElement.classList.remove('hidden');
}

// Show story completion screen
function showCompletionScreen() {
    // Calculate stats
    const accuracy = appState.totalPrompts > 0 ? 
        Math.round((appState.correctAnswers / appState.totalPrompts) * 100) : 100;
    
    const timeSpent = Math.round((new Date() - appState.startTime) / 60000); // in minutes
    
    // Update UI
    document.getElementById('scorePercent').textContent = `${accuracy}%`;
    document.getElementById('correctAnswers').textContent = appState.correctAnswers;
    document.getElementById('totalPrompts').textContent = appState.totalPrompts;
    document.getElementById('timeSpent').textContent = `${timeSpent} ${timeSpent === 1 ? 'minute' : 'minutes'}`;
    
    // Switch to completion screen
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById('completionScreen').classList.add('active');
    
    // Save final progress
    saveStoryProgress(
        appState.currentStory.id,
        appState.currentStory.sentences.length,
        appState.correctAnswers,
        appState.totalPrompts
    );
}

// Update progress bar
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

// Implement security measures
function implementSecurityMeasures() {
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
    
    // Prevent clickjacking
    const frameOptions = document.createElement('meta');
    frameOptions.httpEquiv = 'X-Frame-Options';
    frameOptions.content = 'DENY';
    document.head.appendChild(frameOptions);
}