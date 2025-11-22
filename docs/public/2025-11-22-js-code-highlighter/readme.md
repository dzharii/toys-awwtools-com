# Colorer JS - JavaScript Syntax Highlighter

A vanilla JavaScript implementation of the Colorer syntax highlighting engine, based on the FarColorer plugin architecture.

## Overview

This application demonstrates how the Colorer library works by re-implementing its core functionality in vanilla JavaScript. It uses the same approach as FarColorer:

- **HRC-based scheme definitions** - XML files that define syntax rules
- **Regular expression pattern matching** - For flexible text matching
- **Hierarchical region system** - Organized syntax element categories
- **Keyword lists and block structures** - For efficient syntax recognition

## Architecture

### Components

1. **RegionMapper** (`lib/region-mapper.js`)
   - Manages hierarchical region definitions (def:Comment, def:String, etc.)
   - Maps regions to CSS classes for styling
   - Handles region parent-child relationships

2. **HRCParser** (`lib/hrc-parser.js`)
   - Parses HRC XML scheme files
   - Extracts syntax rules (regexp, keywords, blocks, inherit)
   - Manages file type prototypes

3. **TextHighlighter** (`lib/text-highlighter.js`)
   - Applies syntax rules to source code
   - Processes regexp patterns and keyword matches
   - Generates highlighted HTML output
   - Handles scheme inheritance and recursion

4. **ColorerCore** (`lib/colorer-core.js`)
   - Main integration layer
   - Coordinates all components
   - Provides high-level API

### HRC Scheme Format

HRC schemes are XML files that define syntax highlighting rules. Here's the structure:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<hrc>
  <!-- File type prototype (for detection) -->
  <prototype name="javascript" group="scripts" description="JavaScript">
    <filename>/\.(js|mjs)$/i</filename>
    <firstline>/^#!/i</firstline>
  </prototype>

  <!-- Type definition with scheme -->
  <type name="javascript">
    <scheme name="javascript">
      <!-- Regular expression match -->
      <regexp match="//.*$" region="def:Comment"/>
      
      <!-- Block with start/end patterns -->
      <block start="/&quot;/" end="/&quot;/" scheme="String" region="def:String"/>
      
      <!-- Keywords list -->
      <keywords region="def:Keyword">
        <word name="if"/>
        <word name="else"/>
      </keywords>
      
      <!-- Scheme inheritance -->
      <inherit scheme="base-scheme"/>
    </scheme>
  </type>
</hrc>
```

### Node Types

1. **Regexp Nodes**
   - Single pattern matches
   - Supports capture groups with individual regions
   - Example: Comments, operators, numbers

2. **Block Nodes**
   - Start/end pattern pairs
   - Can have nested schemes
   - Example: Strings, multi-line comments

3. **Keywords Nodes**
   - Word lists for efficient matching
   - Case-sensitive or insensitive
   - Custom word boundaries
   - Example: Language keywords, built-in functions

4. **Inherit Nodes**
   - Include rules from other schemes
   - Enables scheme reuse and composition

## How It Works

### Highlighting Process

1. **Load HRC Scheme**
   - Parse XML file
   - Extract all syntax rules
   - Build scheme tree

2. **Process Text**
   - Split into lines
   - Apply scheme rules to each line
   - Collect all matches (regexp, keywords, blocks)

3. **Resolve Matches**
   - Sort by position and priority
   - Remove overlaps (higher priority wins)
   - Handle nested blocks

4. **Generate HTML**
   - Apply CSS classes based on regions
   - Escape HTML special characters
   - Add line numbers

### Region Hierarchy

The region system is hierarchical, allowing styles to be inherited:

```
def:default
└── def:Syntax
    ├── def:Comment
    │   ├── def:CommentContent
    │   └── def:TODO
    ├── def:String
    │   └── def:StringContent
    ├── def:Keyword
    ├── def:Operator
    ├── def:Number
    │   ├── def:NumberDec
    │   ├── def:NumberHex
    │   └── def:NumberFloat
    └── def:Function
```

CSS classes are generated from regions:
- `def:Comment` → `.def-comment`
- `def:String` → `.def-string`

## Usage

### Opening the Application

1. Open `index.html` in a modern web browser
2. No build process or server required (can run from file://)
3. For best results, use a local web server:
   ```bash
   python -m http.server 8000
   # or
   npx serve .
   ```

### Using the Interface

1. **Select Language** - Choose from the dropdown
2. **Enter Code** - Type or paste code in the left panel
3. **View Highlighted** - See syntax highlighting in the right panel
4. **Load Sample** - Click to load example code
5. **Change Theme** - Switch between color schemes

### Creating Custom Schemes

1. Create a new `.hrc` file in the `samples/` directory
2. Define your syntax rules using HRC XML format
3. Add the scheme to the load list in `app.js`
4. The scheme will be available in the language dropdown

Example minimal scheme:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<hrc>
  <prototype name="mylang" group="custom" description="My Language">
    <filename>/\.ml$/i</filename>
  </prototype>

  <type name="mylang">
    <scheme name="mylang">
      <regexp match="//.*$" region="def:Comment"/>
      <keywords region="def:Keyword">
        <word name="myKeyword"/>
      </keywords>
    </scheme>
  </type>
</hrc>
```

## Features

### Implemented

- ✅ HRC XML parsing
- ✅ Region hierarchy system
- ✅ Regular expression matching
- ✅ Keyword matching with word boundaries
- ✅ Block (start/end) patterns
- ✅ Scheme inheritance
- ✅ Multiple language support
- ✅ Theme switching
- ✅ Real-time highlighting
- ✅ Line numbers
- ✅ Sample code library

### Limitations

- Single-line processing (no multi-line state tracking)
- Simplified block matching
- No file type auto-detection
- Limited error recovery

## Comparison with FarColorer

### Similarities

- Uses same HRC XML format
- Same region naming system
- Similar matching priorities
- Compatible scheme definitions

### Differences

- JavaScript vs C++ implementation
- Browser-based vs native plugin
- Simplified parser (educational)
- No editor integration

## Browser Compatibility

- Chrome/Edge: ✅ Fully supported
- Firefox: ✅ Fully supported
- Safari: ✅ Fully supported
- IE11: ❌ Not supported (uses modern JS)

## Files Structure

```
js-highlighter/
├── index.html              # Main HTML file
├── app.js                  # Application logic
├── styles/
│   └── main.css           # Styles and themes
├── lib/
│   ├── colorer-core.js    # Core integration
│   ├── region-mapper.js   # Region management
│   ├── hrc-parser.js      # HRC XML parser
│   └── text-highlighter.js # Highlighting engine
└── samples/
    ├── javascript.hrc     # JavaScript scheme
    └── python.hrc         # Python scheme
```

## Contributing

To add a new language:

1. Create an HRC file in `samples/`
2. Add sample code to `app.js` samples object
3. Add option to language select in `index.html`
4. Load the scheme in `ColorerApp.loadSchemes()`

## License

This implementation is based on the FarColorer plugin and Colorer library architecture.
See the main repository LICENSE for details.

## References

- [FarColorer GitHub](https://github.com/colorer/FarColorer)
- [Colorer Library](https://github.com/colorer/Colorer-library)
- [Colorer Documentation](https://colorer.github.io)

## Author

Created as a demonstration of Colorer library concepts in vanilla JavaScript.
