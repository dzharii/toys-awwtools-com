/**
 * Colorer Core - Main Colorer library integration
 * Coordinates RegionMapper, HRCParser, and TextHighlighter
 */

class ColorerCore {
    constructor() {
        this.regionMapper = new RegionMapper();
        this.hrcParser = new HRCParser(this.regionMapper);
        this.textHighlighter = new TextHighlighter(this.regionMapper, this.hrcParser);
        this.loadedSchemes = new Map();
    }

    /**
     * Load an HRC scheme from XML string
     * @param {string} xmlString - HRC XML content
     * @returns {Promise<object>} Parsed scheme information
     */
    async loadScheme(xmlString) {
        try {
            const result = this.hrcParser.parseHRC(xmlString);
            
            // Store loaded schemes
            for (const [name, scheme] of result.schemes) {
                this.loadedSchemes.set(name, scheme);
            }
            
            return {
                success: true,
                schemes: Array.from(result.schemes.keys()),
                fileTypes: Array.from(result.fileTypes.keys())
            };
        } catch (error) {
            console.error('Failed to load scheme:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Load scheme from URL
     * @param {string} url - URL to HRC file
     * @returns {Promise<object>} Load result
     */
    async loadSchemeFromURL(url) {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const xmlString = await response.text();
            return await this.loadScheme(xmlString);
        } catch (error) {
            console.error('Failed to load scheme from URL:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Highlight text using a loaded scheme
     * @param {string} text - Text to highlight
     * @param {string} schemeName - Name of scheme to use
     * @returns {string} Highlighted HTML
     */
    highlight(text, schemeName) {
        if (!this.loadedSchemes.has(schemeName)) {
            console.warn(`Scheme '${schemeName}' not loaded`);
            return this.escapeHtml(text);
        }
        
        return this.textHighlighter.highlight(text, schemeName);
    }

    /**
     * Get list of available schemes
     * @returns {Array<string>} Scheme names
     */
    getAvailableSchemes() {
        return Array.from(this.loadedSchemes.keys());
    }

    /**
     * Get list of available file types
     * @returns {Array<object>} File type information
     */
    getAvailableFileTypes() {
        const fileTypes = [];
        for (const [name, fileType] of this.hrcParser.fileTypes) {
            fileTypes.push({
                name: name,
                description: fileType.description,
                group: fileType.group
            });
        }
        return fileTypes;
    }

    /**
     * Get region mapper instance
     * @returns {RegionMapper} Region mapper
     */
    getRegionMapper() {
        return this.regionMapper;
    }

    /**
     * Get HRC parser instance
     * @returns {HRCParser} HRC parser
     */
    getHRCParser() {
        return this.hrcParser;
    }

    /**
     * Escape HTML special characters
     * @param {string} text - Text to escape
     * @returns {string} Escaped text
     */
    escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;'
        };
        return text.replace(/[&<>"']/g, m => map[m]);
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ColorerCore;
}
