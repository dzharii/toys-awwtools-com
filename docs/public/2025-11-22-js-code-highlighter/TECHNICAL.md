# Colorer JS - Technical Implementation Guide

## Overview

This document explains the technical implementation details of Colorer JS, including algorithms, data structures, and how it mirrors the FarColorer architecture.

## Architecture Comparison

### FarColorer (C++)
```
FarColorer Plugin
    ↓
TextParser (applies rules)
    ↓
HrcLibrary (loads schemes)
    ↓
SchemeImpl (scheme storage)
    ↓
Region (syntax categories)
```

### Colorer JS (JavaScript)
```
ColorerApp (UI integration)
    ↓
ColorerCore (coordination)
    ↓
TextHighlighter (applies rules)
    ↓
HRCParser (loads schemes)
    ↓
RegionMapper (region management)
```

## Core Components

### 1. RegionMapper (`region-mapper.js`)

**Purpose**: Manages hierarchical region definitions and CSS class mappings.

**Key Data Structures**:
```javascript
{
    regions: Map<string, Region>,
    regionIdCounter: number
}

Region = {
    name: string,      // e.g., "def:Comment"
    id: number,        // Unique identifier
    parent: Region,    // Parent region (hierarchy)
    description: string
}
```

**Algorithm**: Region Hierarchy Traversal
```javascript
hasParent(regionName, parentName) {
    region = getRegion(regionName)
    while (region != null) {
        if (region.name == parentName) return true
        region = region.parent
    }
    return false
}
```

**FarColorer Equivalent**: `Region` class in `Region.h`

---

### 2. HRCParser (`hrc-parser.js`)

**Purpose**: Parses HRC XML files and extracts syntax rules.

**Key Data Structures**:
```javascript
Scheme = {
    name: string,
    nodes: [SchemeNode]
}

SchemeNode = RegexpNode | BlockNode | KeywordsNode | InheritNode

RegexpNode = {
    type: 'regexp',
    pattern: string,
    region: string,
    priority: string,
    regions: {[index]: string}  // Capture group regions
}

BlockNode = {
    type: 'block',
    start: string,
    end: string,
    scheme: string,
    region: string,
    startRegions: {[index]: string},
    endRegions: {[index]: string}
}

KeywordsNode = {
    type: 'keywords',
    region: string,
    ignoreCase: boolean,
    worddiv: string,
    keywords: [{name: string, region: string}]
}

InheritNode = {
    type: 'inherit',
    scheme: string
}
```

**Algorithm**: XML Parsing
```javascript
parseHRC(xmlString) {
    doc = DOMParser.parseFromString(xmlString)
    
    for each prototype in doc.querySelectorAll('prototype') {
        fileType = parsePrototype(prototype)
        store fileType
    }
    
    for each type in doc.querySelectorAll('type') {
        schemes = parseType(type)
        store schemes
    }
}
```

**FarColorer Equivalent**: `HrcLibraryImpl` class in `HrcLibraryImpl.cpp`

---

### 3. TextHighlighter (`text-highlighter.js`)

**Purpose**: Applies syntax highlighting rules to source code.

**Algorithm**: Line Highlighting

```javascript
highlightLine(line, scheme, recursionLevel) {
    if (recursionLevel > MAX_RECURSION) return escapedLine
    
    matches = []
    
    // Collect all matches from scheme nodes
    for each node in scheme.nodes {
        switch (node.type) {
            case 'regexp':
                matchRegexp(line, node, matches)
            case 'keywords':
                matchKeywords(line, node, matches)
            case 'block':
                matchBlock(line, node, matches)
            case 'inherit':
                inheritedScheme = getScheme(node.scheme)
                return highlightLine(line, inheritedScheme, recursionLevel + 1)
        }
    }
    
    // Sort matches by position and priority
    matches.sort((a, b) => {
        if (a.start != b.start) return a.start - b.start
        return a.priority - b.priority
    })
    
    // Remove overlaps (keep higher priority)
    filteredMatches = removeOverlaps(matches)
    
    // Build HTML with highlighting
    return buildHighlightedHTML(line, filteredMatches)
}
```

**Algorithm**: Regular Expression Matching

```javascript
matchRegexp(line, node, matches) {
    regex = new RegExp(node.pattern, 'g')
    
    while (match = regex.exec(line)) {
        // Add main match
        matches.push({
            start: match.index,
            end: match.index + match[0].length,
            region: node.region,
            priority: node.priority
        })
        
        // Add capture group matches
        for i = 1 to match.length - 1 {
            if (match[i] && node.regions[i]) {
                groupStart = indexOf(match[i], match.index)
                matches.push({
                    start: groupStart,
                    end: groupStart + match[i].length,
                    region: node.regions[i],
                    priority: node.priority
                })
            }
        }
    }
}
```

**Algorithm**: Keyword Matching

```javascript
matchKeywords(line, node, matches) {
    worddiv = node.worddiv || defaultWordDividers
    
    for each keyword in node.keywords {
        // Build regex with word boundaries
        pattern = `(?:^|[${worddiv}])(${escapeRegex(keyword.name)})(?=[${worddiv}]|$)`
        flags = node.ignoreCase ? 'gi' : 'g'
        regex = new RegExp(pattern, flags)
        
        while (match = regex.exec(line)) {
            keywordMatch = match[1]
            start = match.index + (match[0].length - keywordMatch.length)
            
            matches.push({
                start: start,
                end: start + keywordMatch.length,
                region: keyword.region || node.region,
                priority: 0
            })
        }
    }
}
```

**Algorithm**: Overlap Removal

```javascript
removeOverlaps(matches) {
    // Assumes matches are sorted by start position
    filtered = []
    lastEnd = 0
    
    for each match in matches {
        if (match.start >= lastEnd) {
            filtered.push(match)
            lastEnd = match.end
        }
        // else: overlapping match, skip it
    }
    
    return filtered
}
```

**FarColorer Equivalent**: `TextParserImpl` class in `TextParserImpl.cpp`

---

### 4. ColorerCore (`colorer-core.js`)

**Purpose**: Coordinates all components and provides high-level API.

**Key Methods**:

```javascript
async loadScheme(xmlString) {
    result = hrcParser.parseHRC(xmlString)
    store schemes
    return {success: true, schemes: [...]}
}

highlight(text, schemeName) {
    if (!schemeExists(schemeName)) return escapedText
    return textHighlighter.highlight(text, schemeName)
}
```

---

## Highlighting Process Flow

```
User Input (text + language)
    ↓
ColorerCore.highlight()
    ↓
TextHighlighter.highlight()
    ↓
Split text into lines
    ↓
For each line:
    ↓
    TextHighlighter.highlightLine()
        ↓
        Collect matches from all nodes
        ↓
        matchRegexp() - find regex patterns
        matchKeywords() - find keywords
        matchBlock() - find block patterns
        ↓
        Sort matches by position and priority
        ↓
        removeOverlaps() - eliminate conflicts
        ↓
        buildHighlightedHTML() - generate output
    ↓
Combine highlighted lines
    ↓
Display in UI
```

## Pattern Matching Details

### Regular Expression Patterns

HRC patterns are standard regex, with some XML entity escaping:

| HRC Notation | Actual Regex | Meaning |
|--------------|--------------|---------|
| `//.*$` | `//.*$` | Comment to end of line |
| `/\d+/` | `\d+` | One or more digits |
| `/&quot;/` | `"` | Double quote (XML entity) |
| `/&apos;/` | `'` | Single quote (XML entity) |
| `/&lt;/` | `<` | Less than (XML entity) |
| `/&gt;/` | `>` | Greater than (XML entity) |

### Capture Groups

Capture groups allow different parts of a match to have different regions:

```xml
<regexp match="/function\s+(\w+)\s*\(/" 
        region0="def:Keyword"    <!-- Entire match -->
        region1="def:Function"/> <!-- First capture group -->
```

Results in:
- `function` → highlighted as Keyword
- `functionName` → highlighted as Function
- `(` → highlighted as Keyword

### Priority System

When matches overlap, priority determines which one wins:

1. **Normal priority** (default): `priority="normal"` or not specified → priority = 0
2. **Low priority**: `priority="low"` → priority = 10

Lower numbers win in conflicts.

Example:
```xml
<!-- High priority - matches first -->
<regexp match="/\d+/" region="def:Number"/>

<!-- Low priority - only matches if number doesn't -->
<regexp match="/\w+/" region="def:Identifier" priority="low"/>
```

## Performance Considerations

### Time Complexity

For a line of length `n` with `m` nodes:

- **Regular expression matching**: O(n * m) - each regex scans the line
- **Keyword matching**: O(n * k) where k = number of keywords
- **Sorting matches**: O(p log p) where p = number of matches
- **Overlap removal**: O(p)

**Overall**: O(n * m + p log p)

### Optimization Strategies

1. **Limit regex complexity**: Avoid catastrophic backtracking
2. **Use keywords for static words**: Faster than regex alternatives
3. **Set max recursion limit**: Prevent infinite recursion
4. **Cache compiled regexes**: Reuse RegExp objects (future improvement)

### Memory Usage

- Schemes: O(number of rules)
- Regions: O(number of regions) 
- Matches per line: O(line length)
- Total: Linear in input size

## Limitations vs FarColorer

### Simplifications in Colorer JS

1. **Single-line processing**: No multi-line state tracking
   - FarColorer: Maintains state across lines for multi-line constructs
   - Colorer JS: Simplified block matching within single lines

2. **No parse caching**: Re-parses on every change
   - FarColorer: Intelligent caching and incremental parsing
   - Colorer JS: Full re-parse for simplicity

3. **Limited error recovery**: Basic error handling
   - FarColorer: Robust error recovery
   - Colorer JS: Educational focus, minimal error handling

4. **No virtual entries**: Simplified inheritance
   - FarColorer: Complex virtual entry system for scheme parameterization
   - Colorer JS: Basic scheme inheritance only

### Why These Simplifications?

Colorer JS is designed as an **educational tool** to demonstrate core concepts, not a production replacement for FarColorer.

## Extending Colorer JS

### Adding a New Node Type

1. Define the node structure in `HRCParser`:
```javascript
parseCustomNode(element) {
    return {
        type: 'custom',
        // ... custom properties
    }
}
```

2. Handle it in `TextHighlighter`:
```javascript
case 'custom':
    this.matchCustom(line, node, matches);
    break;
```

3. Implement matching logic:
```javascript
matchCustom(line, node, matches) {
    // Your custom matching algorithm
}
```

### Adding New Regions

Update `RegionMapper.initializeDefaultRegions()`:
```javascript
this.addRegion('def:MyRegion', 'def:Syntax', 'My custom region');
```

Add CSS styling in `main.css`:
```css
.def-myregion {
    color: #ff00ff;
    font-weight: bold;
}
```

## Testing Strategies

### Unit Testing Approach

```javascript
// Test region hierarchy
test('region hasParent', () => {
    mapper = new RegionMapper()
    assert(mapper.hasParent('def:CommentContent', 'def:Comment'))
    assert(mapper.hasParent('def:Comment', 'def:Syntax'))
    assert(!mapper.hasParent('def:String', 'def:Comment'))
})

// Test HRC parsing
test('parse regexp node', () => {
    xml = '<regexp match="//.*$" region="def:Comment"/>'
    node = parser.parseRegexpNode(parseXML(xml))
    assert(node.type === 'regexp')
    assert(node.pattern === '//.*$')
    assert(node.region === 'def:Comment')
})

// Test highlighting
test('highlight comment', () => {
    scheme = {nodes: [{type: 'regexp', pattern: '//.*$', region: 'def:Comment'}]}
    result = highlighter.highlightLine('// comment', scheme, 0)
    assert(result.includes('def-comment'))
})
```

### Integration Testing

Test with real HRC files and sample code:
```javascript
test('JavaScript highlighting', async () => {
    await colorer.loadSchemeFromURL('samples/javascript.hrc')
    code = 'function test() { return 42; }'
    result = colorer.highlight(code, 'javascript')
    assert(result.includes('def-keyword'))  // function
    assert(result.includes('def-function'))  // test
    assert(result.includes('def-number'))    // 42
})
```

## Future Enhancements

### Potential Improvements

1. **Multi-line state tracking**: Maintain parsing state across lines
2. **Parse caching**: Cache parsing results for better performance
3. **Incremental parsing**: Only re-parse changed regions
4. **Virtual entries**: Full scheme parameterization
5. **Better error messages**: Detailed parsing error reporting
6. **More schemes**: Add more language definitions
7. **Export functionality**: Save highlighted code as HTML
8. **Custom themes**: User-definable color schemes

### Contributing

To contribute enhancements:

1. Study the existing code structure
2. Implement your feature following the patterns
3. Add tests for new functionality
4. Update documentation
5. Test with multiple browsers
6. Submit a pull request

## Conclusion

Colorer JS demonstrates the core concepts of the FarColorer syntax highlighting system in a browser-accessible, educational format. While simplified, it captures the essential algorithms and data structures that make Colorer powerful.

For production use, consider:
- The full **Colorer library** (C++)
- The **FarColorer plugin** (for Far Manager)
- Other mature JS highlighters (Prism.js, highlight.js)

Happy learning! 🚀
