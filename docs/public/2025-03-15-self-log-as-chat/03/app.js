
const STORAGE_KEY = 'chat-log';

/**
 * Retrieves all messages from local storage.
 * @returns {Array} Array of message objects.
 */
function getMessages() {
    const messages = localStorage.getItem(STORAGE_KEY);
    return messages ? JSON.parse(messages) : [];
}

/**
 * Saves a message object to local storage.
 * @param {Object} message - The message object to save.
 */
function saveMessage(message) {
    const messages = getMessages();
    messages.push(message);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
}

/**
 * Exports messages to a downloadable JSON file.
 */
function exportMessages() {
    const messages = getMessages();
    const blob = new Blob([JSON.stringify(messages, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'chat-log.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

/**
 * Generates a unique identifier for a message.
 * @returns {string} Unique ID string.
 */
function generateUniqueId() {
    return '_' + Math.random().toString(36).substr(2, 9);
}

/**
 * Creates a new message object with unique id and timestamp.
 * @param {string} content - The message content.
 * @returns {Object} A message object.
 */
function createMessage(content) {
    return {
        id: generateUniqueId(),
        timestamp: new Date().toISOString(),
        content: content,
        tags: [],
        priority: null
    };
}

/**
 * Renders all messages from local storage to the chat log display.
 */
function renderMessages() {
    const messages = getMessages();
    const chatLog = document.getElementById('chat-log');
    chatLog.innerHTML = '';
    messages.forEach(msg => {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message');
        messageElement.innerHTML = `<small>${msg.timestamp}</small><p>${msg.content}</p>`;
        chatLog.appendChild(messageElement);
    });
}

/**
 * Displays a status message in the status bar.
 * @param {string} message - The message to display.
 * @param {boolean} [isError=false] - Whether the message is an error.
 */
function showStatus(message, isError = false) {
    const statusBar = document.getElementById('status-bar');
    statusBar.textContent = message;
    statusBar.style.display = 'flex';
    statusBar.style.backgroundColor = isError ? '#f8d7da' : '#d4edda';
    setTimeout(() => {
        statusBar.style.display = 'none';
    }, 3000);
}

/**
 * Initializes event listeners for send and export buttons.
 */
function initEvents() {
    document.getElementById('send-btn').addEventListener('click', handleSend);
    document.getElementById('export-btn').addEventListener('click', handleExport);
}

/**
 * Handles the sending of a message.
 */
function handleSend() {
    const inputArea = document.getElementById('input-area');
    const content = inputArea.innerHTML.trim();
    if (!content) {
        showStatus('Cannot send an empty message.', true);
        return;
    }

    const message = createMessage(content);
    saveMessage(message);
    renderMessages();
    inputArea.innerHTML = '';
    showStatus('Message sent.');
}

/**
 * Handles the export of messages to JSON.
 */
function handleExport() {
    exportMessages();
    showStatus('Log exported as JSON.');
}

/**
 * Initializes the UI when the page loads.
 */
document.addEventListener('DOMContentLoaded', () => {
    renderMessages();
    initEvents();
});

