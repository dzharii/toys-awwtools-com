
import { saveMessage, exportMessages } from './storage.js';
import { renderMessages, showStatus } from './ui.js';
import { createMessage } from './dataModel.js';

/**
 * Initializes event listeners for send and export buttons.
 */
export function initEvents() {
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

