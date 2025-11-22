/**
 * Text Highlighter - Applies syntax highlighting rules to text
 * Based on FarColorer's TextParser
 */

class TextHighlighter {
    constructor(regionMapper, hrcParser) {
        this.regionMapper = regionMapper;
        this.hrcParser = hrcParser;
        this.maxRecursionLevel = 100;
    }

    /**
     * Highlight text using a specified scheme
     * @param {string} text - Text to highlight
     * @param {string} schemeName - Name of the scheme to use
     * @returns {string} HTML with highlighted text
     */
    highlight(text, schemeName) {
        const scheme = this.hrcParser.getScheme(schemeName);
        if (!scheme) {
            return this.escapeHtml(text);
        }

        const lines = text.split('\n');
        const highlightedLines = [];

        for (let lineNum = 0; lineNum < lines.length; lineNum++) {
            const line = lines[lineNum];
            const highlightedLine = this.highlightLine(line, scheme, 0);
            highlightedLines.push(highlightedLine);
        }

        return highlightedLines.join('\n');
    }

    /**
     * Highlight a single line of text
     * @param {string} line - Line to highlight
     * @param {object} scheme - Scheme to apply
     * @param {number} recursionLevel - Current recursion depth
     * @returns {string} HTML with highlighted line
     */
    highlightLine(line, scheme, recursionLevel) {
        if (recursionLevel > this.maxRecursionLevel) {
            return this.escapeHtml(line);
        }

        if (!line) {
            return '';
        }

        // Array to store matched regions with their positions
        const matches = [];

        // Process all nodes in the scheme
        for (const node of scheme.nodes) {
            switch (node.type) {
                case 'regexp':
                    this.matchRegexp(line, node, matches);
                    break;
                case 'keywords':
                    this.matchKeywords(line, node, matches);
                    break;
                case 'block':
                    // Block matching is simplified for single-line processing
                    this.matchBlock(line, node, matches);
                    break;
                case 'inherit':
                    // Handle scheme inheritance
                    const inheritedScheme = this.hrcParser.getScheme(node.scheme);
                    if (inheritedScheme) {
                        return this.highlightLine(line, inheritedScheme, recursionLevel + 1);
                    }
                    break;
            }
        }

        // Sort matches by position and priority
        matches.sort((a, b) => {
            if (a.start !== b.start) {
                return a.start - b.start;
            }
            // Higher priority (lower number) comes first
            return (a.priority || 0) - (b.priority || 0);
        });

        // Remove overlapping matches (keep higher priority)
        const filteredMatches = this.removeOverlaps(matches);

        // Build highlighted HTML
        return this.buildHighlightedHTML(line, filteredMatches);
    }

    /**
     * Match regular expression patterns
     * @param {string} line - Line to search
     * @param {object} node - Regexp node
     * @param {Array} matches - Array to store matches
     */
    matchRegexp(line, node, matches) {
        if (!node.pattern) return;

        try {
            const regex = new RegExp(node.pattern, 'g');
            let match;

            while ((match = regex.exec(line)) !== null) {
                const region = node.region || 'def:Syntax';
                matches.push({
                    start: match.index,
                    end: match.index + match[0].length,
                    region: region,
                    text: match[0],
                    priority: node.priority === 'low' ? 10 : 0,
                    groups: match
                });

                // Handle captured groups with their own regions
                for (let i = 1; i < match.length; i++) {
                    if (match[i] && node.regions[i]) {
                        const groupStart = line.indexOf(match[i], match.index);
                        matches.push({
                            start: groupStart,
                            end: groupStart + match[i].length,
                            region: node.regions[i],
                            text: match[i],
                            priority: node.priority === 'low' ? 10 : 0
                        });
                    }
                }
            }
        } catch (e) {
            console.warn('Invalid regexp pattern:', node.pattern, e);
        }
    }

    /**
     * Match keywords
     * @param {string} line - Line to search
     * @param {object} node - Keywords node
     * @param {Array} matches - Array to store matches
     */
    matchKeywords(line, node, matches) {
        if (!node.keywords || node.keywords.length === 0) return;

        // Default word dividers
        const worddiv = node.worddiv || '\\s\\t\\r\\n\\[\\]\\(\\)\\{\\}\\<\\>\\.\\,\\;\\:\\!\\?\\&\\|\\+\\-\\*\\/\\=\\%\\^\\~';
        const wordBoundary = `[${worddiv}]`;

        for (const keyword of node.keywords) {
            const keywordName = keyword.name;
            const region = keyword.region || node.region || 'def:Keyword';
            
            // Create regex for whole word match
            const flags = node.ignoreCase ? 'gi' : 'g';
            const pattern = `(?:^|${wordBoundary})(${this.escapeRegex(keywordName)})(?=${wordBoundary}|$)`;
            
            try {
                const regex = new RegExp(pattern, flags);
                let match;

                while ((match = regex.exec(line)) !== null) {
                    const keywordMatch = match[1];
                    const start = match.index + (match[0].length - keywordMatch.length);
                    
                    matches.push({
                        start: start,
                        end: start + keywordMatch.length,
                        region: region,
                        text: keywordMatch,
                        priority: 0
                    });
                }
            } catch (e) {
                console.warn('Invalid keyword pattern:', keywordName, e);
            }
        }
    }

    /**
     * Match block patterns (simplified for single-line)
     * @param {string} line - Line to search
     * @param {object} node - Block node
     * @param {Array} matches - Array to store matches
     */
    matchBlock(line, node, matches) {
        if (!node.start) return;

        try {
            const startRegex = new RegExp(node.start, 'g');
            let match;

            while ((match = startRegex.exec(line)) !== null) {
                const startPos = match.index;
                const startEnd = match.index + match[0].length;
                let endPos = line.length;

                // Try to find end pattern
                if (node.end) {
                    const endRegex = new RegExp(node.end, 'g');
                    endRegex.lastIndex = startEnd;
                    const endMatch = endRegex.exec(line);
                    if (endMatch) {
                        endPos = endMatch.index + endMatch[0].length;
                    }
                }

                const region = node.region || 'def:Syntax';
                matches.push({
                    start: startPos,
                    end: endPos,
                    region: region,
                    text: line.substring(startPos, endPos),
                    priority: node.priority === 'low' ? 10 : 0
                });
            }
        } catch (e) {
            console.warn('Invalid block pattern:', node.start, e);
        }
    }

    /**
     * Remove overlapping matches
     * @param {Array} matches - Sorted array of matches
     * @returns {Array} Filtered matches without overlaps
     */
    removeOverlaps(matches) {
        const filtered = [];
        let lastEnd = 0;

        for (const match of matches) {
            if (match.start >= lastEnd) {
                filtered.push(match);
                lastEnd = match.end;
            }
        }

        return filtered;
    }

    /**
     * Build highlighted HTML from matches
     * @param {string} line - Original line
     * @param {Array} matches - Filtered matches
     * @returns {string} HTML string
     */
    buildHighlightedHTML(line, matches) {
        if (matches.length === 0) {
            return this.escapeHtml(line);
        }

        let html = '';
        let pos = 0;

        for (const match of matches) {
            // Add unmatched text before this match
            if (match.start > pos) {
                html += this.escapeHtml(line.substring(pos, match.start));
            }

            // Add matched text with styling
            const cssClass = this.regionMapper.getCSSClass(match.region);
            html += `<span class="${cssClass}">${this.escapeHtml(match.text)}</span>`;
            
            pos = match.end;
        }

        // Add remaining text
        if (pos < line.length) {
            html += this.escapeHtml(line.substring(pos));
        }

        return html;
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

    /**
     * Escape special regex characters
     * @param {string} text - Text to escape
     * @returns {string} Escaped text
     */
    escapeRegex(text) {
        return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TextHighlighter;
}
