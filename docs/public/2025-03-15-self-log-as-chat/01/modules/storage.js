
const STORAGE_KEY = 'chat-log';

/**
 * Retrieves all messages from local storage.
 * @returns {Array} Array of message objects.
 */
export function getMessages() {
    const messages = localStorage.getItem(STORAGE_KEY);
    return messages ? JSON.parse(messages) : [];
}

/**
 * Saves a message object to local storage.
 * @param {Object} message - The message object to save.
 */
export function saveMessage(message) {
    const messages = getMessages();
    messages.push(message);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
}

/**
 * Exports messages to a downloadable JSON file.
 */
export function exportMessages() {
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

