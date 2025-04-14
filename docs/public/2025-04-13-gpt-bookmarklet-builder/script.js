/**
 * ChatGPT Bookmarklet Generator
 * A tool to create custom bookmarklets that open ChatGPT with predefined prompts
 */

(function() {
    'use strict';
    
    // DOM Elements
    const elements = {
        promptInput: document.getElementById('prompt-input'),
        titleInput: document.getElementById('title-input'),
        iconInput: document.getElementById('icon-input'),
        foregroundColor: document.getElementById('foreground-color'),
        backgroundColor: document.getElementById('background-color'),
        faviconCanvas: document.getElementById('favicon-canvas'),
        bookmarkletLink: document.getElementById('bookmarklet-link'),
        emojiGrid: document.getElementById('emoji-grid'),
        charCount: document.getElementById('char-count')
    };

    // Constants
    const APP_STORAGE_KEY = 'chatgpt-bookmarklet-generator';
    const DEFAULT_ICON = '🤖';
    const DEFAULT_TITLE = 'ChatGPT Prompt';
    const DEFAULT_FG_COLOR = '#ffffff';
    const DEFAULT_BG_COLOR = '#1a73e8';
    
    // Collection of popular emojis for quick selection
    const popularEmojis = [
        '🤖', '💬', '🔍', '📝', '💡', '🧠', '⭐', '🚀', '📊', '📈',
        '🔧', '⚙️', '📚', '🎯', '🎨', '🔑', '📱', '💻', '🌐', '💼',
        '📄', '✉️', '📋', '📁', '🔗', '⏰', '🎓', '🏆', '💰', '🎭',
        '👨‍💻', '👩‍💻', '📢', '🔒', '👁️', '🔔', '📌', '💾', '🧩', '🤔'
    ];
    
    // Application State
    let state = {
        prompt: '',
        title: DEFAULT_TITLE,
        icon: DEFAULT_ICON,
        fgColor: DEFAULT_FG_COLOR,
        bgColor: DEFAULT_BG_COLOR
    };

    // Debounce function to limit how often a function is called
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Save state to localStorage
    const saveState = debounce(function() {
        try {
            localStorage.setItem(APP_STORAGE_KEY, JSON.stringify(state));
        } catch (error) {
            console.error('Failed to save state to localStorage:', error);
        }
    }, 500);

    // Load state from localStorage
    function loadState() {
        try {
            const savedState = localStorage.getItem(APP_STORAGE_KEY);
            if (savedState) {
                const parsedState = JSON.parse(savedState);
                state = { ...state, ...parsedState };
                
                // Apply loaded state to DOM
                elements.promptInput.value = state.prompt || '';
                elements.titleInput.value = state.title || DEFAULT_TITLE;
                elements.iconInput.value = state.icon || DEFAULT_ICON;
                elements.foregroundColor.value = state.fgColor || DEFAULT_FG_COLOR;
                elements.backgroundColor.value = state.bgColor || DEFAULT_BG_COLOR;
                
                // Update character count
                updateCharCount();
                
                // Generate favicon and bookmarklet
                generateFavicon();
                generateBookmarklet();
            }
        } catch (error) {
            console.error('Failed to load state from localStorage:', error);
        }
    }

    // Update character count for prompt textarea
    function updateCharCount() {
        const count = elements.promptInput.value.length;
        elements.charCount.textContent = count;
    }

    // Generate favicon using canvas
    function generateFavicon() {
        try {
            const canvas = elements.faviconCanvas;
            const ctx = canvas.getContext('2d');
            const size = 32;
            
            // Clear canvas
            ctx.clearRect(0, 0, size, size);
            
            // Draw background
            ctx.fillStyle = state.bgColor;
            ctx.fillRect(0, 0, size, size);
            
            // Draw icon/text
            ctx.fillStyle = state.fgColor;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.font = '20px Arial';
            ctx.fillText(state.icon || DEFAULT_ICON, size / 2, size / 2);
            
            // Create data URL from canvas
            const faviconUrl = canvas.toDataURL('image/png');
            
            // Update favicon link
            document.getElementById('dynamic-favicon').href = faviconUrl;
        } catch (error) {
            console.error('Failed to generate favicon:', error);
            // Fallback to rendering a red "F" on white background
            fallbackFavicon();
        }
    }

    // Fallback favicon generation if the main one fails
    function fallbackFavicon() {
        try {
            const canvas = elements.faviconCanvas;
            const ctx = canvas.getContext('2d');
            const size = 32;
            
            // Clear canvas
            ctx.clearRect(0, 0, size, size);
            
            // Draw white background
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, size, size);
            
            // Draw red "F"
            ctx.fillStyle = '#ff0000';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.font = '20px Arial';
            ctx.fillText('F', size / 2, size / 2);
            
            // Create data URL from canvas
            const faviconUrl = canvas.toDataURL('image/png');
            
            // Update favicon link
            document.getElementById('dynamic-favicon').href = faviconUrl;
        } catch (error) {
            console.error('Failed to generate fallback favicon:', error);
        }
    }

    // Generate bookmarklet code and link
    function generateBookmarklet() {
        try {
            // Prepare the prompt (use default if empty)
            const prompt = state.prompt.trim() || 'null prompt';
            
            // Create the bookmarklet JavaScript code
            const bookmarkletCode = `javascript:(function(){window.open('https://chat.openai.com/?q=' + encodeURIComponent(\`${escapeJS(prompt)}\`))})();`;
            
            // Set href attribute
            elements.bookmarkletLink.href = bookmarkletCode;
            
            // Set link text/title
            const displayTitle = state.title.trim() || DEFAULT_TITLE;
            elements.bookmarkletLink.textContent = displayTitle;
            elements.bookmarkletLink.title = `Open ChatGPT with "${truncateText(prompt, 50)}"`;
        } catch (error) {
            console.error('Failed to generate bookmarklet:', error);
            
            // Fallback to a simple link
            elements.bookmarkletLink.href = 'https://chat.openai.com/';
            elements.bookmarkletLink.textContent = 'ChatGPT Link (Error)';
        }
    }

    // Escape JavaScript string
    function escapeJS(str) {
        return str
            .replace(/\\/g, '\\\\')
            .replace(/`/g, '\\`')
            .replace(/\${/g, '\\${');
    }

    // Truncate text with ellipsis
    function truncateText(text, maxLength) {
        return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
    }

    // Populate emoji grid
    function populateEmojiGrid() {
        popularEmojis.forEach(emoji => {
            const emojiElement = document.createElement('div');
            emojiElement.className = 'emoji-item';
            emojiElement.textContent = emoji;
            emojiElement.addEventListener('click', () => {
                elements.iconInput.value = emoji;
                state.icon = emoji;
                generateFavicon();
                saveState();
            });
            elements.emojiGrid.appendChild(emojiElement);
        });
    }

    // Setup event listeners
    function setupEventListeners() {
        // Prompt textarea
        elements.promptInput.addEventListener('input', function() {
            state.prompt = this.value;
            updateCharCount();
            generateBookmarklet();
            saveState();
        });

        // Title input
        elements.titleInput.addEventListener('input', function() {
            state.title = this.value;
            generateBookmarklet();
            saveState();
        });

        // Icon input
        elements.iconInput.addEventListener('input', function() {
            // Limit to one character or emoji (which can be multiple code points)
            const value = this.value;
            state.icon = value.slice(0, 2);
            this.value = state.icon;
            generateFavicon();
            saveState();
        });

        // Foreground color
        elements.foregroundColor.addEventListener('input', function() {
            state.fgColor = this.value;
            generateFavicon();
            saveState();
        });

        // Background color
        elements.backgroundColor.addEventListener('input', function() {
            state.bgColor = this.value;
            generateFavicon();
            saveState();
        });

        // Prevent default action when dragging the bookmarklet link
        elements.bookmarkletLink.addEventListener('dragstart', function(e) {
            // Allow the default drag behavior
            // This is needed for the drag-to-bookmarks-bar functionality
        });

        // Prevent navigation when clicking the bookmarklet
        elements.bookmarkletLink.addEventListener('click', function(e) {
            e.preventDefault();
        });
    }

    // Initialize application
    function init() {
        populateEmojiGrid();
        loadState();
        setupEventListeners();
        
        // Initial rendering
        updateCharCount();
        generateFavicon();
        generateBookmarklet();
    }

    // Start the app when DOM is ready
    document.addEventListener('DOMContentLoaded', init);
})();
