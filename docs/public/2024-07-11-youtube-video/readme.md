Ack.

I WILL NOT BE LAZY. I WILL DO EXCELLENT RESEARCH. I WILL PROVIDE ALWAYS ACCURATE ANSWERS. I AM AWARE OF YOUR DISABILITY. DUE TO THIS DISABILITY, I WILL NEVER USE PLACEHOLDERS OR TODOS IN CODE. I WILL ALWAYS DISPLAY FULL EXECUTABLE CODE TO ASSIST THE DISABLED AND MINIMIZE YOUR STRAIN.

### Section 1: Plan

1. **HTML File (`index.html`)**:
    - Create a basic HTML structure.
    - Add a sidebar on the right side for displaying the history of played videos.
    - Add an initial page load section with instructions and a text box to paste the YouTube URL.
    - Add JavaScript to handle URL parameter reading, validation, and embedding.
    - Add an error message display for invalid URLs.

2. **JavaScript File (`script.js`)**:
    - Extract the `video` parameter from the URL.
    - Validate the YouTube URL parameter to ensure it's a proper YouTube link.
    - Embed the video in the iframe using the extracted URL.
    - Store the video URL in the browser's local storage.
    - Retrieve and display the history of played videos from the local storage.
    - Display instructions and a text box if no `video` parameter is present.
    - Redirect to the URL with the `video` parameter after the user inputs a valid YouTube URL.

3. **CSS File (`styles.css`)**:
    - Add styles to ensure the iframe covers the remaining screen space.
    - Style the sidebar to be narrow and on the right side.
    - Style the initial instruction page and text box.
    - Style the error message.

Confidence Level: 95%

### Section 2: Implementation

``` 
__FILE::index.html

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>YouTube Video Embed with History</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <div id="video-container">
        <iframe id="video-iframe" frameborder="0" allowfullscreen></iframe>
    </div>
    <div id="history-sidebar">
        <h2>Video History</h2>
        <ul id="history-list"></ul>
    </div>
    <div id="input-section">
        <p>Paste the YouTube URL into the text box below:</p>
        <input type="text" id="video-url-input" placeholder="Enter YouTube URL here">
        <button id="load-video-button">Load Video</button>
        <p id="error-message"></p>
    </div>
    <script src="script.js"></script>
</body>
</html>

__FILE::styles.css

html, body {
    margin: 0;
    padding: 0;
    height: 100%;
    width: 100%;
    overflow: hidden;
    display: flex;
}

#video-container {
    flex: 1;
    position: relative;
    display: none;
}

#video-iframe {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
}

#history-sidebar {
    width: 250px;
    background-color: #f4f4f4;
    border-left: 1px solid #ccc;
    padding: 10px;
    box-sizing: border-box;
    overflow-y: auto;
}

#history-list {
    list-style: none;
    padding: 0;
}

#history-list li {
    margin-bottom: 10px;
}

#history-list a {
    text-decoration: none;
    color: #333;
}

#history-list a:hover {
    text-decoration: underline;
}

#input-section {
    display: none;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 20px;
}

#input-section p {
    margin-bottom: 10px;
}

#video-url-input {
    width: 80%;
    padding: 10px;
    margin-bottom: 10px;
}

#error-message {
    color: red;
    margin-top: 10px;
}

__FILE::script.js

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
```

I WILL NOT BE LAZY. I WILL DO EXCELLENT RESEARCH. I WILL PROVIDE ALWAYS ACCURATE ANSWERS. I AM AWARE OF YOUR DISABILITY. DUE TO THIS DISABILITY, I WILL NEVER USE PLACEHOLDERS OR TODOS IN CODE. I WILL ALWAYS DISPLAY FULL EXECUTABLE CODE TO ASSIST THE DISABLED AND MINIMIZE YOUR STRAIN.