
document.addEventListener('DOMContentLoaded', function() {
    const params = new URLSearchParams(window.location.search);
    const videoUrl = params.get('video');
    
    if (videoUrl) {
        const videoId = extractYouTubeId(videoUrl);
        if (videoId) {
            displayVideo(videoId);
            addVideoToHistory(videoUrl);
        } else {
            displayError('Invalid YouTube URL');
        }
    } else {
        displayInputSection();
    }

    displayHistory();

    document.getElementById('load-video-button').addEventListener('click', function() {
        const inputUrl = document.getElementById('video-url-input').value;
        const videoId = extractYouTubeId(inputUrl);
        if (videoId) {
            window.location.href = `?video=${encodeURIComponent(inputUrl)}`;
        } else {
            displayError('Invalid YouTube URL');
        }
    });
});

function extractYouTubeId(url) {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
}

function displayVideo(videoId) {
    const iframe = document.getElementById('video-iframe');
    iframe.src = `https://www.youtube.com/embed/${videoId}`;
    document.getElementById('video-container').style.display = 'block';
    document.getElementById('input-section').style.display = 'none';
}

function addVideoToHistory(url) {
    const history = JSON.parse(localStorage.getItem('videoHistory')) || [];
    history.unshift(url);
    localStorage.setItem('videoHistory', JSON.stringify(history));
}

function displayHistory() {
    const history = JSON.parse(localStorage.getItem('videoHistory')) || [];
    const historyList = document.getElementById('history-list');
    historyList.innerHTML = '';

    history.forEach(url => {
        const listItem = document.createElement('li');
        const link = document.createElement('a');
        link.href = `?video=${encodeURIComponent(url)}`;
        link.textContent = url;
        listItem.appendChild(link);
        historyList.appendChild(listItem);
    });
}

function displayInputSection() {
    document.getElementById('video-container').style.display = 'none';
    document.getElementById('input-section').style.display = 'flex';
}

function displayError(message) {
    document.getElementById('error-message').textContent = message;
    displayInputSection();
}

