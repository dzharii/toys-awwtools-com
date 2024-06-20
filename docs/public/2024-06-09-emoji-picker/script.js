
const appStoreKey = 'b4fc7cc1-eb82-4bd9-acac-22c34004adf5';

document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('search');
    const emojiGrid = document.getElementById('emoji-grid');
    const recentGrid = document.getElementById('recent-grid');
    const notification = document.getElementById('notification');

    const loadFromLocalStorage = (key) => {
        try {
            const storedData = localStorage.getItem(appStoreKey);
            if (storedData) {
                const parsedData = JSON.parse(storedData);
                return parsedData[key] || [];
            }
        } catch (error) {
            console.error('Error loading from localStorage:', error);
        }
        return [];
    };

    const saveToLocalStorage = (key, data) => {
        try {
            const storedData = localStorage.getItem(appStoreKey);
            let parsedData = {};
            if (storedData) {
                parsedData = JSON.parse(storedData);
            }
            parsedData[key] = data;
            localStorage.setItem(appStoreKey, JSON.stringify(parsedData));
        } catch (error) {
            console.error('Error saving to localStorage:', error);
        }
    };

    const getRandomEmojis = (count) => {
        const shuffled = [...emojiData].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, count).map(emoji => emoji.emoji);
    };

    const calculateMinCells = () => {
        const gridWidth = emojiGrid.clientWidth;
        const gridHeight = emojiGrid.clientHeight;
        const cellSize = 60; // Assuming each cell including padding and margins is 60px
        const cols = Math.floor(gridWidth / cellSize);
        const rows = Math.floor(gridHeight / cellSize);
        return cols * rows;
    };

    const recentEmojis = loadFromLocalStorage('recentEmojis');
    let currentEmojis = getRandomEmojis(120);

    const renderGrid = (grid, emojis) => {
        grid.innerHTML = '';
        emojis.forEach(emoji => {
            const emojiDiv = document.createElement('div');
            emojiDiv.innerText = emoji;
            emojiDiv.addEventListener('click', () => {
                copyToClipboard(emoji);
                updateRecentEmojis(emoji);
            });
            grid.appendChild(emojiDiv);
        });

        // Add empty cells to maintain minimum number of cells
        const minCells = calculateMinCells();
        while (grid.children.length < minCells) {
            const emptyDiv = document.createElement('div');
            emptyDiv.classList.add('empty-cell');
            grid.appendChild(emptyDiv);
        }
    };

    const copyToClipboard = (emoji) => {
        navigator.clipboard.writeText(emoji).then(() => {
            showNotification('Copied!');
        }).catch(err => {
            console.error('Could not copy text: ', err);
        });
    };

    const showNotification = (message) => {
        notification.innerText = message;
        notification.classList.add('visible');
        setTimeout(() => {
            notification.classList.remove('visible');
        }, 2000);
    };

    const updateRecentEmojis = (emoji) => {
        if (!recentEmojis.includes(emoji)) {
            recentEmojis.unshift(emoji);
            if (recentEmojis.length > 20) recentEmojis.pop();
            saveToLocalStorage('recentEmojis', recentEmojis);
            renderGrid(recentGrid, recentEmojis);
        }
    };

    const searchEmojis = (query) => {
        if (!query) {
            return getRandomEmojis(120);
        }
        const lowerCaseQuery = query.toLowerCase();
        return emojiData.filter(emoji => emoji.label.includes(lowerCaseQuery)).map(emoji => emoji.emoji);
    };

    const debounce = (func, wait) => {
        let timeout;
        return function(...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    };

    const handleSearchInput = (e) => {
        const query = e.target.value;
        currentEmojis = searchEmojis(query);
        renderGrid(emojiGrid, currentEmojis);
    };

    searchInput.addEventListener('input', debounce(handleSearchInput, 300));

    window.addEventListener('resize', () => {
        renderGrid(emojiGrid, currentEmojis);
    });

    renderGrid(recentGrid, recentEmojis);
    renderGrid(emojiGrid, currentEmojis);
});
