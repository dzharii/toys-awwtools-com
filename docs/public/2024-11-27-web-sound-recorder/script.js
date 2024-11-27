
let mediaRecorder;
let audioChunks = [];
let recordings = [];
let timerInterval;
let elapsedTime = 0;
let isRecording = false;

const startButton = document.getElementById('startRecording');
const stopButton = document.getElementById('stopRecording');
const statusMessage = document.getElementById('statusMessage');
const timerDisplay = document.getElementById('timer');
const recordingsList = document.getElementById('recordingsList');
const emptyMessage = document.getElementById('emptyMessage');
const audioURLs = []; // Track generated URLs to revoke them later

startButton.addEventListener('click', startRecording);
stopButton.addEventListener('click', stopRecording);
recordingsList.addEventListener('click', handleRecordingActions);

async function startRecording() {
  if (isRecording) {
    console.warn("Recording is already in progress.");
    return;
  }

  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    alert("Your browser does not support audio recording.");
    return;
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder = new MediaRecorder(stream);

    mediaRecorder.ondataavailable = event => {
      if (event.data && event.data.size > 0) {
        audioChunks.push(event.data);
      } else {
        console.warn("No audio data available.");
      }
    };

    mediaRecorder.onstop = saveRecording;

    mediaRecorder.start();
    isRecording = true;
    elapsedTime = 0;
    audioChunks = [];
    statusMessage.textContent = 'Recording in Progress';
    startButton.disabled = true;
    stopButton.disabled = false;
    emptyMessage.style.display = 'none';

    timerInterval = setInterval(() => {
      elapsedTime++;
      timerDisplay.textContent = `Elapsed Time: ${formatTime(elapsedTime)}`;
    }, 1000);
  } catch (err) {
    console.error("Error starting recording:", err);
  }
}

function stopRecording() {
  if (!isRecording || !mediaRecorder || mediaRecorder.state !== "recording") {
    console.warn("No active recording to stop.");
    return;
  }

  isRecording = false;
  mediaRecorder.stop();
  clearInterval(timerInterval);
  statusMessage.textContent = 'Recording Stopped';
  startButton.disabled = false;
  stopButton.disabled = true;
}

function saveRecording() {
  const blob = new Blob(audioChunks, { type: 'audio/wav' });
  const url = URL.createObjectURL(blob);
  audioURLs.push(url); // Track URL for cleanup
  const now = new Date();
  const filename = `Recording_${now.toLocaleString('en-US').replace(/[:/]/g, '-')}.wav`;
  const duration = elapsedTime;

  const listItem = document.createElement('li');
  listItem.innerHTML = `
    <p>${filename} (${duration} seconds)</p>
    <audio controls class="audio-controls" aria-label="Audio playback">
      <source src="${url}" type="audio/wav">
    </audio>
    <button data-action="download" data-url="${url}" data-filename="${filename}">Download</button>
  `;
  recordingsList.appendChild(listItem);
  recordings.push({ blob, filename, duration });
}

function handleRecordingActions(event) {
  const target = event.target;
  if (target.tagName === 'BUTTON') {
    const action = target.dataset.action;
    const url = target.dataset.url;
    const filename = target.dataset.filename;

    if (action === 'download') {
      downloadRecording(url, filename);
    }
  }
}

function downloadRecording(url, filename) {
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
}

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
  const secs = (seconds % 60).toString().padStart(2, '0');
  return `${mins}:${secs}`;
}

// Cleanup blob URLs to prevent memory leaks
window.addEventListener("beforeunload", () => {
  audioURLs.forEach(url => URL.revokeObjectURL(url));
});

