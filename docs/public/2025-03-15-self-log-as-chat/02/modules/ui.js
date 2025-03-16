
import { getMessages } from './storage.js';

/**
 * Initializes the UI by rendering existing messages.
 */
export function initUI() {
    renderMessages();
}

/**
 * Renders all messages from local storage to the chat log display.
 */
export function renderMessages() {
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
export function showStatus(message, isError = false) {
    const statusBar = document.getElementById('status-bar');
    statusBar.textContent = message;
    statusBar.style.display = 'flex';
    statusBar.style.backgroundColor = isError ? '#f8d7da' : '#d4edda';
    setTimeout(() => {
        statusBar.style.display = 'none';
    }, 3000);
}

