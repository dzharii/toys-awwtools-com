/**
 * Region Mapper - Handles hierarchical region definitions and mappings
 * Based on FarColorer's Region system
 */

class RegionMapper {
    constructor() {
        this.regions = new Map();
        this.regionIdCounter = 0;
        this.initializeDefaultRegions();
    }

    /**
     * Initialize default region hierarchy based on Colorer's def: namespace
     */
    initializeDefaultRegions() {
        // Root region
        this.addRegion('def:default', null, 'Default text');
        
        // Syntax elements
        this.addRegion('def:Syntax', 'def:default', 'Syntax elements');
        this.addRegion('def:Comment', 'def:Syntax', 'Comments');
        this.addRegion('def:CommentContent', 'def:Comment', 'Comment content');
        this.addRegion('def:String', 'def:Syntax', 'String literals');
        this.addRegion('def:StringContent', 'def:String', 'String content');
        this.addRegion('def:Character', 'def:Syntax', 'Character literals');
        this.addRegion('def:Number', 'def:Syntax', 'Numeric literals');
        this.addRegion('def:NumberDec', 'def:Number', 'Decimal numbers');
        this.addRegion('def:NumberHex', 'def:Number', 'Hexadecimal numbers');
        this.addRegion('def:NumberBin', 'def:Number', 'Binary numbers');
        this.addRegion('def:NumberOct', 'def:Number', 'Octal numbers');
        this.addRegion('def:NumberFloat', 'def:Number', 'Floating point numbers');
        
        // Keywords and identifiers
        this.addRegion('def:Keyword', 'def:Syntax', 'Keywords');
        this.addRegion('def:Operator', 'def:Syntax', 'Operators');
        this.addRegion('def:Identifier', 'def:Syntax', 'Identifiers');
        this.addRegion('def:Symbol', 'def:Syntax', 'Symbols');
        this.addRegion('def:SymbolStrong', 'def:Symbol', 'Strong symbols');
        
        // Types and functions
        this.addRegion('def:Type', 'def:Syntax', 'Type names');
        this.addRegion('def:TypeKeyword', 'def:Type', 'Type keywords');
        this.addRegion('def:Function', 'def:Syntax', 'Function names');
        this.addRegion('def:Constant', 'def:Syntax', 'Constants');
        this.addRegion('def:Variable', 'def:Syntax', 'Variables');
        this.addRegion('def:VarStrong', 'def:Variable', 'Strong variables');
        
        // Preprocessor and directives
        this.addRegion('def:Directive', 'def:Syntax', 'Preprocessor directives');
        this.addRegion('def:DirectiveContent', 'def:Directive', 'Directive content');
        
        // Markup
        this.addRegion('def:Tag', 'def:Syntax', 'Markup tags');
        this.addRegion('def:OpenTag', 'def:Tag', 'Opening tags');
        this.addRegion('def:CloseTag', 'def:Tag', 'Closing tags');
        this.addRegion('def:Attribute', 'def:Syntax', 'Attributes');
        this.addRegion('def:AttributeContent', 'def:Attribute', 'Attribute content');
        
        // Special and errors
        this.addRegion('def:Special', 'def:Syntax', 'Special characters');
        this.addRegion('def:Escape', 'def:Special', 'Escape sequences');
        this.addRegion('def:Error', 'def:Syntax', 'Syntax errors');
        this.addRegion('def:TODO', 'def:CommentContent', 'TODO markers');
        this.addRegion('def:Debug', 'def:Syntax', 'Debug statements');
        
        // Delimiters
        this.addRegion('def:PairStart', 'def:Symbol', 'Opening delimiter');
        this.addRegion('def:PairEnd', 'def:Symbol', 'Closing delimiter');
    }

    /**
     * Add a new region to the mapper
     * @param {string} name - Fully qualified region name (e.g., 'def:Comment')
     * @param {string|null} parentName - Parent region name
     * @param {string} description - Region description
     */
    addRegion(name, parentName, description) {
        const parent = parentName ? this.regions.get(parentName) : null;
        const region = {
            name: name,
            id: this.regionIdCounter++,
            parent: parent,
            description: description
        };
        this.regions.set(name, region);
        return region;
    }

    /**
     * Get a region by name
     * @param {string} name - Region name
     * @returns {object|null} Region object or null
     */
    getRegion(name) {
        return this.regions.get(name) || null;
    }

    /**
     * Check if a region has a specific parent in its ancestry
     * @param {string} regionName - Region to check
     * @param {string} parentName - Parent region to look for
     * @returns {boolean} True if parent exists in ancestry
     */
    hasParent(regionName, parentName) {
        let region = this.regions.get(regionName);
        while (region) {
            if (region.name === parentName) {
                return true;
            }
            region = region.parent;
        }
        return false;
    }

    /**
     * Get CSS class name for a region
     * @param {string} regionName - Region name
     * @returns {string} CSS class name
     */
    getCSSClass(regionName) {
        if (!regionName) return '';
        // Convert 'def:Comment' to 'def-comment'
        return regionName.toLowerCase().replace(/:/g, '-');
    }

    /**
     * Get all regions
     * @returns {Map} All regions
     */
    getAllRegions() {
        return this.regions;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = RegionMapper;
}
