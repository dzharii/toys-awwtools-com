
document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('search');
    const emojiGrid = document.getElementById('emoji-grid');
    const recentGrid = document.getElementById('recent-grid');
    const favoritesGrid = document.getElementById('favorites-grid');
    const notification = document.getElementById('notification');

    const recentEmojis = JSON.parse(localStorage.getItem('recentEmojis')) || [];
    const favoriteEmojis = JSON.parse(localStorage.getItem('favoriteEmojis')) || [];

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
            localStorage.setItem('recentEmojis', JSON.stringify(recentEmojis));
            renderGrid(recentGrid, recentEmojis);
        }
    };

    const updateFavoriteEmojis = (emoji) => {
        const index = favoriteEmojis.indexOf(emoji);
        if (index === -1) {
            favoriteEmojis.push(emoji);
        } else {
            favoriteEmojis.splice(index, 1);
        }
        localStorage.setItem('favoriteEmojis', JSON.stringify(favoriteEmojis));
        renderGrid(favoritesGrid, favoriteEmojis);
    };

    const searchEmojis = (query) => {
        if (!query) {
            return [];
        }
        const lowerCaseQuery = query.toLowerCase();
        return emojiData.filter(emoji => emoji.label.includes(lowerCaseQuery)).map(emoji => emoji.emoji);
    };

    searchInput.addEventListener('input', (e) => {
        const query = e.target.value;
        const results = searchEmojis(query);
        renderGrid(emojiGrid, results);
    });

    renderGrid(recentGrid, recentEmojis);
    renderGrid(favoritesGrid, favoriteEmojis);
});
