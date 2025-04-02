document.addEventListener('DOMContentLoaded', () => {
    const tilesContainer = document.getElementById('tiles-container');
    const searchInput = document.getElementById('search-input');
    
    // Render all tiles initially
    renderTiles(promptTiles);
    
    // Set up search functionality
    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        
        if (searchTerm.trim() === '') {
            renderTiles(promptTiles);
            return;
        }
        
        // Perform fuzzy search
        const filteredTiles = promptTiles.filter(tile => {
            const titleMatch = tile.title.toLowerCase().includes(searchTerm);
            const descMatch = tile.description.toLowerCase().includes(searchTerm);
            const categoryMatch = tile.category.toLowerCase().includes(searchTerm);
            return titleMatch || descMatch || categoryMatch;
        });
        
        renderTiles(filteredTiles, searchTerm);
    });
    
    // Function to render tiles
    function renderTiles(tiles, searchTerm = '') {
        tilesContainer.innerHTML = '';
        
        if (tiles.length === 0) {
            tilesContainer.innerHTML = `
                <div class="no-results">
                    <p>No prompts found matching your search.</p>
                </div>
            `;
            return;
        }
        
        tiles.forEach(tile => {
            const tileElement = document.createElement('div');
            tileElement.className = 'tile';
            
            // Create the tile content
            const title = searchTerm ? highlightMatch(tile.title, searchTerm) : tile.title;
            const description = searchTerm ? highlightMatch(tile.description, searchTerm) : tile.description;
            const category = searchTerm ? highlightMatch(tile.category, searchTerm) : tile.category;
            
            // Create a preview of the prompt template (without the markers)
            const promptPreview = tile.promptTemplate
                .replace(/\[\[\[.*?\]\]\]/g, '...')
                .substring(0, 150) + (tile.promptTemplate.length > 150 ? '...' : '');
            
            // Create the form fields from the prompt template
            const { formHTML, formFields } = parsePromptTemplate(tile.promptTemplate);
            
            tileElement.innerHTML = `
                <div class="tile-header">
                    <div class="tile-icon">${tile.icon}</div>
                    <h3 class="tile-title">${title}</h3>
                    <span class="tile-category">${category}</span>
                </div>
                <p class="tile-description">${description}</p>
                <div class="tile-prompt-preview">${promptPreview}</div>
                <form class="tile-form" data-title="${tile.title}">
                    ${formHTML}
                    <button type="submit" class="submit-btn">
                        <span>Run Prompt</span>
                        <span>→</span>
                    </button>
                </form>
            `;
            
            // Add event listener for form submission
            const form = tileElement.querySelector('.tile-form');
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                
                // Get the form data
                const formData = new FormData(form);
                
                // Process the prompt template with the form data
                let finalPrompt = tile.promptTemplate;
                formFields.forEach(field => {
                    const value = formData.get(field.name) || '';
                    finalPrompt = finalPrompt.replace(field.marker, value);
                });
                
                // Remove any remaining markers
                finalPrompt = finalPrompt.replace(/\[\[\[.*?\]\]\]/g, '');
                
                // Encode the prompt and open ChatGPT
                const encodedPrompt = encodeURIComponent(finalPrompt);
                window.open(`https://chatgpt.com/?q=${encodedPrompt}`, '_blank');
            });
            
            tilesContainer.appendChild(tileElement);
        });
    }
    
    // Function to parse prompt template and extract form fields
    function parsePromptTemplate(template) {
        const regex = /\[\[\[component=(.*?), name=(.*?)(?:, placeholder=(.*?))?(?:, rows=(\d+))?(?:, width=(.*?))?\]\]\]/g;
        const formFields = [];
        let formHTML = '';
        let lastIndex = 0;
        
        let match;
        while ((match = regex.exec(template)) !== null) {
            const [fullMatch, component, name, placeholder = '', rows = 3, width = '100%'] = match;
            
            formFields.push({
                marker: fullMatch,
                component,
                name,
                placeholder,
                rows,
                width
            });
            
            // Create the appropriate form field HTML
            let fieldHTML = '';
            if (component === 'textarea') {
                fieldHTML = `
                    <div class="form-field">
                        <textarea name="${name}" placeholder="${placeholder}" rows="${rows}" style="width: ${width}"></textarea>
                    </div>
                `;
            } else if (component === 'input') {
                fieldHTML = `
                    <div class="form-field">
                        <input type="text" name="${name}" placeholder="${placeholder}" style="width: ${width}">
                    </div>
                `;
            }
            
            formHTML += fieldHTML;
        }
        
        return { formHTML, formFields };
    }
    
    // Function to highlight matching text
    function highlightMatch(text, searchTerm) {
        if (!searchTerm) return text;
        
        const regex = new RegExp(`(${escapeRegExp(searchTerm)})`, 'gi');
        return text.replace(regex, '<span class="highlight">$1</span>');
    }
    
    // Helper function to escape regex special characters
    function escapeRegExp(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
});