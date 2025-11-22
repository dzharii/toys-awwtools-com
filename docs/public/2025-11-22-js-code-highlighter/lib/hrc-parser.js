/**
 * HRC Parser - Parses HRC (Highlight/Regions/Config) XML files
 * Based on FarColorer's HRC format
 */

class HRCParser {
    constructor(regionMapper) {
        this.regionMapper = regionMapper;
        this.schemes = new Map();
        this.fileTypes = new Map();
    }

    /**
     * Parse HRC XML string and extract schemes
     * @param {string} xmlString - HRC XML content
     * @returns {object} Parsed file type information
     */
    parseHRC(xmlString) {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlString, 'text/xml');
        
        // Check for parsing errors
        const parserError = xmlDoc.querySelector('parsererror');
        if (parserError) {
            throw new Error('XML parsing error: ' + parserError.textContent);
        }

        // Parse file type prototypes
        const prototypes = xmlDoc.querySelectorAll('prototype');
        prototypes.forEach(proto => this.parsePrototype(proto));

        // Parse type definitions
        const types = xmlDoc.querySelectorAll('type');
        types.forEach(type => this.parseType(type));

        return {
            schemes: this.schemes,
            fileTypes: this.fileTypes
        };
    }

    /**
     * Parse a prototype definition (file type detection)
     * @param {Element} protoElement - XML prototype element
     */
    parsePrototype(protoElement) {
        const name = protoElement.getAttribute('name');
        const group = protoElement.getAttribute('group');
        const description = protoElement.getAttribute('description');

        const fileType = {
            name: name,
            group: group,
            description: description,
            filename: null,
            firstline: null
        };

        // Parse filename pattern
        const filenameElement = protoElement.querySelector('filename');
        if (filenameElement) {
            fileType.filename = filenameElement.textContent.trim();
        }

        // Parse firstline pattern
        const firstlineElement = protoElement.querySelector('firstline');
        if (firstlineElement) {
            fileType.firstline = firstlineElement.textContent.trim();
        }

        this.fileTypes.set(name, fileType);
    }

    /**
     * Parse a type definition (scheme implementation)
     * @param {Element} typeElement - XML type element
     */
    parseType(typeElement) {
        const name = typeElement.getAttribute('name');

        // Parse scheme children
        const schemeElements = typeElement.querySelectorAll(':scope > scheme');
        schemeElements.forEach(schemeEl => {
            const schemeNode = this.parseScheme(schemeEl);
            if (schemeNode) {
                this.schemes.set(schemeNode.name, schemeNode);
            }
        });

        // If there's a scheme with the same name as the type, it's the main scheme
        // Otherwise, store a reference to the first scheme
        if (!this.schemes.has(name) && schemeElements.length > 0) {
            const firstScheme = this.parseScheme(schemeElements[0]);
            if (firstScheme) {
                this.schemes.set(name, firstScheme);
            }
        }
    }

    /**
     * Parse a scheme definition
     * @param {Element} schemeElement - XML scheme element
     * @returns {object} Scheme object
     */
    parseScheme(schemeElement) {
        const name = schemeElement.getAttribute('name');
        const scheme = {
            name: name,
            nodes: []
        };

        // Parse all child nodes
        Array.from(schemeElement.children).forEach(child => {
            let node = null;
            
            switch (child.tagName.toLowerCase()) {
                case 'regexp':
                    node = this.parseRegexpNode(child);
                    break;
                case 'block':
                    node = this.parseBlockNode(child);
                    break;
                case 'keywords':
                    node = this.parseKeywordsNode(child);
                    break;
                case 'inherit':
                    node = this.parseInheritNode(child);
                    break;
            }
            
            if (node) {
                scheme.nodes.push(node);
            }
        });

        return scheme;
    }

    /**
     * Parse a regexp node (single pattern match)
     * @param {Element} element - XML regexp element
     * @returns {object} Regexp node
     */
    parseRegexpNode(element) {
        const node = {
            type: 'regexp',
            pattern: element.getAttribute('match'),
            region: element.getAttribute('region'),
            priority: element.getAttribute('priority') || 'normal',
            regions: {}
        };

        // Parse region assignments (region0, region1, etc.)
        for (let i = 0; i < 10; i++) {
            const regionAttr = element.getAttribute(`region${i}`);
            if (regionAttr) {
                node.regions[i] = regionAttr;
            }
        }

        return node;
    }

    /**
     * Parse a block node (start/end pattern pair)
     * @param {Element} element - XML block element
     * @returns {object} Block node
     */
    parseBlockNode(element) {
        const node = {
            type: 'block',
            start: element.getAttribute('start'),
            end: element.getAttribute('end'),
            scheme: element.getAttribute('scheme'),
            region: element.getAttribute('region'),
            innerRegion: element.getAttribute('inner-region') === 'yes',
            priority: element.getAttribute('priority') || 'normal',
            startRegions: {},
            endRegions: {}
        };

        // Parse start region assignments
        for (let i = 0; i < 10; i++) {
            const regionAttr = element.getAttribute(`region${i}`);
            if (regionAttr) {
                node.startRegions[i] = regionAttr;
            }
        }

        // Parse end region assignments
        for (let i = 0; i < 10; i++) {
            const regionAttr = element.getAttribute(`region${i}e`);
            if (regionAttr) {
                node.endRegions[i] = regionAttr;
            }
        }

        return node;
    }

    /**
     * Parse a keywords node (keyword list)
     * @param {Element} element - XML keywords element
     * @returns {object} Keywords node
     */
    parseKeywordsNode(element) {
        const node = {
            type: 'keywords',
            region: element.getAttribute('region'),
            ignoreCase: element.getAttribute('ignorecase') === 'yes',
            worddiv: element.getAttribute('worddiv'),
            keywords: []
        };

        // Parse word elements
        const words = element.querySelectorAll('word');
        words.forEach(word => {
            node.keywords.push({
                name: word.getAttribute('name') || word.textContent.trim(),
                region: word.getAttribute('region')
            });
        });

        return node;
    }

    /**
     * Parse an inherit node (scheme inheritance)
     * @param {Element} element - XML inherit element
     * @returns {object} Inherit node
     */
    parseInheritNode(element) {
        return {
            type: 'inherit',
            scheme: element.getAttribute('scheme')
        };
    }

    /**
     * Get scheme by name
     * @param {string} name - Scheme name
     * @returns {object|null} Scheme object
     */
    getScheme(name) {
        return this.schemes.get(name) || null;
    }

    /**
     * Get file type by name
     * @param {string} name - File type name
     * @returns {object|null} File type object
     */
    getFileType(name) {
        return this.fileTypes.get(name) || null;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = HRCParser;
}
