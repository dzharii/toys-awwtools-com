
const canvas = document.getElementById('myCanvas');
const ctx = canvas.getContext('2d');
const textInput = document.getElementById('textInput');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const resumeBtn = document.getElementById('resumeBtn');
const stopBtn = document.getElementById('stopBtn');
const videoPreview = document.getElementById('videoPreview');
const downloadLink = document.getElementById('downloadLink');

let mediaRecorder;
let recordedChunks = [];
let text = '';
let index = 0;
let typingInterval;
const lineHeight = 20;
const maxWidth = canvas.width - 20;

// Fill the canvas with white color
ctx.fillStyle = '#FFFFFF';
ctx.fillRect(0, 0, canvas.width, canvas.height);

function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
    const words = text.split(' ');
    let line = '';
    const lines = [];

    for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + ' ';
        const metrics = ctx.measureText(testLine);
        const testWidth = metrics.width;
        if (testWidth > maxWidth && n > 0) {
            lines.push(line);
            line = words[n] + ' ';
        } else {
            line = testLine;
        }
    }
    lines.push(line);
    return lines;
}

// Function to draw text on the canvas
function drawText(text) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font = '16px Arial';
    ctx.fillStyle = '#000';

    const lines = wrapText(ctx, text, 10, 50, maxWidth, lineHeight);
    for (let i = 0; i < lines.length; i++) {
        ctx.fillText(lines[i], 10, 50 + (i * lineHeight));
    }
}

// Function to simulate typing
function simulateTyping() {
    if (index <= text.length) {
        drawText(text.substring(0, index));
        index++;
    } else {
        clearInterval(typingInterval);
        mediaRecorder.stop();
    }
}

startBtn.addEventListener('click', () => {
    text = textInput.value;
    recordedChunks = [];
    index = 0;
    canvas.style.display = 'block';
    videoPreview.style.display = 'none';
    downloadLink.style.display = 'none';
    
    const stream = canvas.captureStream(25);
    mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm; codecs=vp9'
    });

    mediaRecorder.ondataavailable = function(event) {
        if (event.data.size > 0) {
            recordedChunks.push(event.data);
        }
    };

    mediaRecorder.onstop = function() {
        const blob = new Blob(recordedChunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);

        videoPreview.src = url;
        videoPreview.style.display = 'block';

        downloadLink.href = url;
        downloadLink.download = 'typing_animation.webm';
        downloadLink.style.display = 'inline';
    };

    mediaRecorder.start();

    startBtn.disabled = true;
    pauseBtn.disabled = false;
    resumeBtn.disabled = true;
    stopBtn.disabled = false;

    typingInterval = setInterval(simulateTyping, 100);
});

pauseBtn.addEventListener('click', () => {
    clearInterval(typingInterval);
    mediaRecorder.pause();

    pauseBtn.disabled = true;
    resumeBtn.disabled = false;
});

resumeBtn.addEventListener('click', () => {
    mediaRecorder.resume();
    typingInterval = setInterval(simulateTyping, 100);

    pauseBtn.disabled = false;
    resumeBtn.disabled = true;
});

stopBtn.addEventListener('click', () => {
    clearInterval(typingInterval);
    mediaRecorder.stop();

    startBtn.disabled = false;
    pauseBtn.disabled = true;
    resumeBtn.disabled = true;
    stopBtn.disabled = true;
});

