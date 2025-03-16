
/**
 * Creates a new message object with unique id and timestamp.
 * @param {string} content - The message content.
 * @returns {Object} A message object.
 */
export function createMessage(content) {
    return {
        id: generateUniqueId(),
        timestamp: new Date().toISOString(),
        content: content,
        tags: [],
        priority: null
    };
}

/**
 * Generates a unique identifier for a message.
 * @returns {string} Unique ID string.
 */
function generateUniqueId() {
    return '_' + Math.random().toString(36).substr(2, 9);
}

