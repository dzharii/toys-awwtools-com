
// Array of note objects
const notes = [
    {
        id: 1,
        content: "### First Note\n\nThis is the content of the first note.",
        dateAdded: "2024-09-16T12:34:00Z",
        dateModified: "2024-09-16T13:00:00Z"
    },
    {
        id: 2,
        content: "### Second Note\n\nHere's some text for the second note.",
        dateAdded: "2024-09-17T09:00:00Z",
        dateModified: "2024-09-17T09:30:00Z"
    },
    // More notes can be added
];

// To store pinned notes, retrieved from localStorage or initialized as empty
let pinnedNotes = JSON.parse(localStorage.getItem('pinnedNotes')) || [];

/**
 * Debounce function to limit the frequency of function execution.
 * @param {Function} fn - The function to debounce.
 * @param {number} delay - The delay in milliseconds.
 * @returns {Function} - Debounced function.
 */
const debounce = (fn, delay) => {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => fn.apply(this, args), delay);
    };
};

/**
 * Filters notes based on the search query.
 * @param {string} query - The search term.
 * @returns {Array} - Array of filtered notes.
 */
const filterNotes = (query) => {
    const lowerCaseQuery = query.toLowerCase();
    return notes.filter(note => note.content.toLowerCase().includes(lowerCaseQuery));
};

/**
 * Formats a date string into a human-readable format.
 * @param {string} dateString - The ISO date string.
 * @returns {string} - Formatted date string.
 */
const formatDate = (dateString) => {
    const options = { 
        year: 'numeric', month: 'long', day: 'numeric', 
        hour: '2-digit', minute: '2-digit' 
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
};

/**
 * Highlights the search term within the content.
 * @param {string} content - The HTML content of the note.
 * @param {string} query - The search term to highlight.
 * @returns {string} - Content with highlighted search terms.
 */
const highlightSearchTerm = (content, query) => {
    if (!query) return content;
    const regex = new RegExp(`(${escapeRegExp(query)})`, 'gi');
    return content.replace(regex, '<span class="highlight">$1</span>');
};

/**
 * Escapes special characters in a string for use in a regular expression.
 * @param {string} string - The string to escape.
 * @returns {string} - Escaped string.
 */
const escapeRegExp = (string) => {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

/**
 * Renders the list of notes in the main content section.
 * @param {Array} notesToRender - Array of notes to display.
 */
const renderNotes = (notesToRender) => {
    const notesContainer = document.getElementById('notesContainer');
    notesContainer.innerHTML = ''; // Clear previous content

    const query = document.getElementById('searchInput').value;

    notesToRender.forEach(note => {
        const noteElement = document.createElement('div');
        noteElement.classList.add('note');

        // Convert markdown to HTML
        let noteContentHTML =  marked.parse(note.content);

        // Highlight search terms if any
        noteContentHTML = highlightSearchTerm(noteContentHTML, query);

        // Format dates
        const formattedDateAdded = formatDate(note.dateAdded);
        const formattedDateModified = formatDate(note.dateModified);

        // Construct note HTML with header, content, dates, and pin button
        noteElement.innerHTML = `
            <div class="note-header">
                <div class="note-title">${noteContentHTML}</div>
                <button 
                    class="pin-button" 
                    data-id="${note.id}" 
                    aria-label="${isPinned(note.id) ? 'Unpin note' : 'Pin note'}"
                >
                    ${isPinned(note.id) ? 'Unpin' : 'Pin'}
                </button>
            </div>
            <div class="note-dates">
                <small>Added: ${formattedDateAdded}</small><br>
                <small>Modified: ${formattedDateModified}</small>
            </div>
        `;

        notesContainer.appendChild(noteElement);
    });

    // Add event listeners for pin buttons
    const pinButtons = notesContainer.querySelectorAll('button.pin-button');
    pinButtons.forEach(button => {
        button.addEventListener('click', () => {
            const noteId = parseInt(button.getAttribute('data-id'), 10);
            togglePin(noteId);
        });
    });
};

/**
 * Checks if a note is currently pinned.
 * @param {number} noteId - The ID of the note.
 * @returns {boolean} - True if pinned, else false.
 */
const isPinned = (noteId) => {
    return pinnedNotes.some(pinnedNote => pinnedNote.id === noteId);
};

/**
 * Toggles the pin state of a note.
 * @param {number} noteId - The ID of the note to toggle.
 */
const togglePin = (noteId) => {
    const note = notes.find(n => n.id === noteId);
    if (!note) return; // Note not found, exit early

    if (isPinned(noteId)) {
        // Unpin note
        pinnedNotes = pinnedNotes.filter(pinnedNote => pinnedNote.id !== noteId);
    } else {
        // Pin note
        pinnedNotes.push(note);
    }
    // Update localStorage
    localStorage.setItem('pinnedNotes', JSON.stringify(pinnedNotes));
    // Re-render pinned notes and main notes
    renderPinnedNotes();
    renderNotes(filterNotes(document.getElementById('searchInput').value));
};

/**
 * Renders the list of pinned notes in the footer section.
 */
const renderPinnedNotes = () => {
    const pinnedSection = document.getElementById('pinnedSection');
    pinnedSection.innerHTML = ''; // Clear previous content

    pinnedNotes.forEach(note => {
        const pinnedNoteElement = document.createElement('div');
        pinnedNoteElement.classList.add('pinned-note');

        // Convert markdown to HTML
        let pinnedContentHTML =  marked.parse(note.content);

        // Highlight search terms if any
        const query = document.getElementById('searchInput').value;
        pinnedContentHTML = highlightSearchTerm(pinnedContentHTML, query);

        // Format dates
        const formattedDateAdded = formatDate(note.dateAdded);
        const formattedDateModified = formatDate(note.dateModified);

        // Construct pinned note HTML with header, content, dates, and unpin button
        pinnedNoteElement.innerHTML = `
            <div class="pinned-note-header">
                <div class="pinned-note-title">${pinnedContentHTML}</div>
                <button 
                    class="pin-button unpin" 
                    data-id="${note.id}" 
                    aria-label="Unpin note"
                >
                    Unpin
                </button>
            </div>
            <div class="note-dates">
                <small>Added: ${formattedDateAdded}</small><br>
                <small>Modified: ${formattedDateModified}</small>
            </div>
        `;

        pinnedSection.appendChild(pinnedNoteElement);
    });

    // Add event listeners for unpin buttons
    const unpinButtons = pinnedSection.querySelectorAll('button.pin-button.unpin');
    unpinButtons.forEach(button => {
        button.addEventListener('click', () => {
            const noteId = parseInt(button.getAttribute('data-id'), 10);
            togglePin(noteId);
        });
    });
};

/**
 * Initializes the search input with debounce functionality.
 */
const initializeSearch = () => {
    const searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('input', debounce(() => {
        const query = searchInput.value;
        const filteredNotes = filterNotes(query);
        renderNotes(filteredNotes);
        renderPinnedNotes(); // Update pinned notes highlighting if needed
    }, 300));
};

/**
 * Initializes the application by rendering notes and setting up event listeners.
 */
const initializeApp = () => {
    renderNotes(notes);
    renderPinnedNotes();
    initializeSearch();
};

// Wait for DOM content to load before initializing the app
document.addEventListener('DOMContentLoaded', initializeApp);

