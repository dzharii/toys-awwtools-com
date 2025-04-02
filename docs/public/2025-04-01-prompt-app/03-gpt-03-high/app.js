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
    
    // Function to render tiles with optional search highlighting
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
            
            // Use escapeHTML and highlight functions for safe text insertion
            const title = searchTerm ? highlightMatch(tile.title, searchTerm) : escapeHTML(tile.title);
            const description = searchTerm ? highlightMatch(tile.description, searchTerm) : escapeHTML(tile.description);
            const category = searchTerm ? highlightMatch(tile.category, searchTerm) : escapeHTML(tile.category);
            
            // Create a preview of the prompt template (markers replaced by "...")
            let promptPreview = tile.promptTemplate.replace(/\[\[\[.*?\]\]\]/g, '...');
            if (promptPreview.length > 150) {
                promptPreview = promptPreview.substring(0, 150) + '...';
            }
            
            // Parse the prompt template to generate form HTML and field definitions
            const { formHTML, formFields } = parsePromptTemplate(tile.promptTemplate);
            
            tileElement.innerHTML = `
                <div class="tile-header">
                    <div class="tile-icon">${tile.icon}</div>
                    <h3 class="tile-title">${title}</h3>
                    <span class="tile-category">${category}</span>
                </div>
                <p class="tile-description">${description}</p>
                <div class="tile-prompt-preview">${escapeHTML(promptPreview)}</div>
                <form class="tile-form" data-title="${escapeHTML(tile.title)}">
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
                
                // Process the prompt template by replacing markers with user input
                let finalPrompt = tile.promptTemplate;
                formFields.forEach(field => {
                    const value = formData.get(field.name) || '';
                    finalPrompt = finalPrompt.replace(field.marker, value);
                });
                
                // Remove any remaining markers
                finalPrompt = finalPrompt.replace(/\[\[\[.*?\]\]\]/g, '');
                
                // Encode the prompt and open the URL in a new tab
                const encodedPrompt = encodeURIComponent(finalPrompt);
                window.open(`https://chatgpt.com/?q=${encodedPrompt}`, '_blank');
            });
            
            tilesContainer.appendChild(tileElement);
        });
    }
    
    // Function to escape HTML special characters for security
    function escapeHTML(str) {
        if (!str) return '';
        return str.replace(/&/g, '&amp;')
                  .replace(/</g, '&lt;')
                  .replace(/>/g, '&gt;')
                  .replace(/"/g, '&quot;')
                  .replace(/'/g, '&#039;');
    }
    
    // Function to highlight matching text safely
    function highlightMatch(text, searchTerm) {
        if (!searchTerm) return escapeHTML(text);
        const escapedText = escapeHTML(text);
        const regex = new RegExp(`(${escapeRegExp(searchTerm)})`, 'gi');
        return escapedText.replace(regex, '<span class="highlight">$1</span>');
    }
    
    // Helper function to escape regex special characters
    function escapeRegExp(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
    
    // Function to parse prompt template and generate form HTML with static text segments
    function parsePromptTemplate(template) {
        const regex = /\[\[\[component=(.*?), name=(.*?)(?:, placeholder="(.*?)")?(?:, rows=(\d+))?(?:, width="(.*?)")?\]\]\]/g;
        let formHTML = '';
        let formFields = [];
        let lastIndex = 0;
        let match;
        
        while ((match = regex.exec(template)) !== null) {
            const [fullMatch, component, name, placeholder = '', rows = '3', width = '100%'] = match;
            
            // Append static text before this marker
            const staticText = template.substring(lastIndex, match.index);
            formHTML += `<div class="static-text">${escapeHTML(staticText)}</div>`;
            lastIndex = regex.lastIndex;
            
            // Create HTML for the form field based on component type
            let fieldHTML = '';
            if (component.trim().toLowerCase() === 'textarea') {
                fieldHTML = `
                    <div class="form-field">
                        <textarea name="${escapeHTML(name.trim())}" placeholder="${escapeHTML(placeholder)}" rows="${rows}" style="width: ${width}"></textarea>
                    </div>
                `;
            } else if (component.trim().toLowerCase() === 'input') {
                fieldHTML = `
                    <div class="form-field">
                        <input type="text" name="${escapeHTML(name.trim())}" placeholder="${escapeHTML(placeholder)}" style="width: ${width}">
                    </div>
                `;
            }
            
            formHTML += fieldHTML;
            formFields.push({
                marker: fullMatch,
                component: component.trim(),
                name: name.trim(),
                placeholder: placeholder,
                rows: rows,
                width: width
            });
        }
        
        // Append any remaining static text after the last marker
        formHTML += `<div class="static-text">${escapeHTML(template.substring(lastIndex))}</div>`;
        
        return { formHTML, formFields };
    }
});

