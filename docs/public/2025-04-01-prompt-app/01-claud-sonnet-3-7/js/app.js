import { tiles } from './data.js';

document.addEventListener('DOMContentLoaded', () => {
    const tilesContainer = document.getElementById('tiles-container');
    const searchInput = document.getElementById('search-input');

    // Initialize display
    renderTiles(tiles);

    // Set up search functionality
    searchInput.addEventListener('input', () => {
        const searchTerm = searchInput.value.toLowerCase();
        if (searchTerm === '') {
            renderTiles(tiles);
        } else {
            const filteredTiles = fuzzySearch(tiles, searchTerm);
            renderTiles(filteredTiles, searchTerm);
        }
    });

    /**
     * Renders the tiles on the page
     * @param {Array} tilesToRender - The tiles to render
     * @param {string} searchTerm - Optional search term for highlighting
     */
    function renderTiles(tilesToRender, searchTerm = '') {
        tilesContainer.innerHTML = '';

        tilesToRender.forEach(tile => {
            const tileElement = createTileElement(tile, searchTerm);
            tilesContainer.appendChild(tileElement);
        });
    }

    /**
     * Creates a tile element
     * @param {Object} tile - The tile data
     * @param {string} searchTerm - Optional search term for highlighting
     * @returns {HTMLElement} - The tile element
     */
    function createTileElement(tile, searchTerm) {
        const tileElement = document.createElement('div');
        tileElement.className = 'tile';

        // Create tile header with icon, title and category
        const tileHeader = document.createElement('div');
        tileHeader.className = 'tile-header';

        const iconElement = document.createElement('span');
        iconElement.className = 'tile-icon';
        iconElement.textContent = tile.icon;

        const titleElement = document.createElement('h3');
        titleElement.className = 'tile-title';
        titleElement.innerHTML = searchTerm ? highlightText(tile.title, searchTerm) : tile.title;

        const categoryElement = document.createElement('span');
        categoryElement.className = 'tile-category';
        categoryElement.innerHTML = searchTerm ? highlightText(tile.category, searchTerm) : tile.category;

        tileHeader.appendChild(iconElement);
        tileHeader.appendChild(titleElement);
        tileHeader.appendChild(categoryElement);

        // Create description
        const descriptionElement = document.createElement('p');
        descriptionElement.className = 'tile-description';
        descriptionElement.innerHTML = searchTerm ? highlightText(tile.description, searchTerm) : tile.description;

        // Create form
        const formElement = document.createElement('form');
        formElement.className = 'tile-form';
        
        // Parse prompt template and create form elements
        const { processedTemplate, formElements } = parsePromptTemplate(tile.promptTemplate);
        
        // Add form elements to form
        formElements.forEach(element => {
            const formGroup = document.createElement('div');
            formGroup.className = 'form-group';
            formGroup.appendChild(element);
            formElement.appendChild(formGroup);
        });
        
        // Create submit button
        const submitButton = document.createElement('button');
        submitButton.type = 'submit';
        submitButton.className = 'submit-button';
        submitButton.textContent = 'Run Prompt';
        
        formElement.appendChild(submitButton);
        
        // Add event listener for form submission
        formElement.addEventListener('submit', function(event) {
            event.preventDefault();
            const formData = new FormData(this);
            let finalPrompt = processedTemplate;
            
            // Replace form fields with user input
            formData.forEach((value, key) => {
                // Find the marker pattern in the processed template
                const markerPattern = `[INPUT:${key}]`;
                finalPrompt = finalPrompt.replace(markerPattern, value);
            });
            
            // URL encode the prompt and open in a new tab
            const encodedPrompt = encodeURIComponent(finalPrompt);
            window.open(`https://chatgpt.com/?q=${encodedPrompt}`, '_blank');
        });

        // Assemble the tile
        tileElement.appendChild(tileHeader);
        tileElement.appendChild(descriptionElement);
        tileElement.appendChild(formElement);

        return tileElement;
    }

    /**
     * Parses a prompt template and creates form elements
     * @param {string} template - The prompt template
     * @returns {Object} - The processed template and form elements
     */
    function parsePromptTemplate(template) {
        let processedTemplate = template;
        const formElements = [];
        const componentRegex = /\[\[\[component=(textarea|input), name=([^,]+), placeholder="([^"]+)"(?:, rows=(\d+))?(?:, width="([^"]+)")?\]\]\]/g;
        
        // Replace each component marker with an input marker and create form elements
        processedTemplate = processedTemplate.replace(componentRegex, (match, type, name, placeholder, rows, width) => {
            let element;
            
            if (type === 'textarea') {
                element = document.createElement('textarea');
                element.rows = rows || 3;
            } else {
                element = document.createElement('input');
                element.type = 'text';
            }
            
            element.name = name;
            element.placeholder = placeholder;
            
            if (width) {
                element.style.width = width;
            }
            
            formElements.push(element);
            return `[INPUT:${name}]`; // Replace with a marker that will be filled in later
        });
        
        return { processedTemplate, formElements };
    }

    /**
     * Performs a fuzzy search on the tiles
     * @param {Array} items - The items to search through
     * @param {string} query - The search query
     * @returns {Array} - The filtered items
     */
    function fuzzySearch(items, query) {
        return items.filter(item => {
            const title = item.title.toLowerCase();
            const description = item.description.toLowerCase();
            const category = item.category.toLowerCase();
            
            // Check if any of the fields contain the query
            return title.includes(query) || 
                   description.includes(query) || 
                   category.includes(query);
        });
    }

    /**
     * Highlights text based on a search term
     * @param {string} text - The text to highlight
     * @param {string} searchTerm - The search term
     * @returns {string} - The highlighted text
     */
    function highlightText(text, searchTerm) {
        if (!searchTerm) return text;
        
        const regex = new RegExp(`(${escapeRegExp(searchTerm)})`, 'gi');
        return text.replace(regex, '<span class="highlighted">$1</span>');
    }

    /**
     * Escapes special characters in a string for use in a regular expression
     * @param {string} string - The string to escape
     * @returns {string} - The escaped string
     */
    function escapeRegExp(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
});