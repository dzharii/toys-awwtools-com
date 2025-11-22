# Quick Start Guide - Colorer JS

## What is Colorer JS?

Colorer JS is a **live demonstration** of how the FarColorer syntax highlighting plugin works. It's a complete re-implementation in vanilla JavaScript that shows the internal algorithms and data structures used by Colorer.

## Getting Started in 3 Steps

### 1. Open the Application

#### Option A: Direct File Access (Simple)
```bash
# Navigate to the js-highlighter directory
cd js-highlighter

# Open index.html in your browser
# On macOS:
open index.html

# On Windows:
start index.html

# On Linux:
xdg-open index.html
```

#### Option B: Local Web Server (Recommended)
```bash
# Navigate to the js-highlighter directory
cd js-highlighter

# Start a local web server (choose one):
python -m http.server 8000
# or
python3 -m http.server 8000
# or
npx serve .

# Open http://localhost:8000 in your browser
```

### 2. Try It Out

1. **Select a Language**: Choose JavaScript, Python, or another language from the dropdown
2. **Load Sample Code**: Click "Load Sample" to see example code
3. **Edit the Code**: Type in the left panel and see live highlighting
4. **Switch Themes**: Try Default, Dark, or Light theme

### 3. Understand How It Works

Open the **Information** panel at the bottom to see:
- How many lines were highlighted
- Which scheme was used
- Real-time processing messages

## Understanding HRC Schemes

HRC (Highlight/Regions/Config) files define syntax highlighting rules. Here's a simple example:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<hrc>
  <type name="mylang">
    <scheme name="mylang">
      <!-- Match single-line comments -->
      <regexp match="//.*$" region="def:Comment"/>
      
      <!-- Match strings -->
      <block start="/&quot;/" end="/&quot;/" region="def:String"/>
      
      <!-- Match keywords -->
      <keywords region="def:Keyword">
        <word name="if"/>
        <word name="else"/>
        <word name="while"/>
      </keywords>
    </scheme>
  </type>
</hrc>
```

### HRC Node Types

1. **`<regexp>`** - Single pattern matches
   - Example: Comments, numbers, operators
   - Supports capture groups

2. **`<block>`** - Start/end pattern pairs
   - Example: Strings, multi-line comments
   - Can have nested schemes

3. **`<keywords>`** - Word lists
   - Example: Language keywords, built-in functions
   - Case-sensitive or insensitive matching

4. **`<inherit>`** - Include other schemes
   - Example: Reuse base syntax rules
   - Enables composition

## Creating Your Own Language Scheme

### Step 1: Create HRC File

Create `samples/mylang.hrc`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<hrc>
  <prototype name="mylang" group="custom" description="My Language">
    <filename>/\.ml$/i</filename>
  </prototype>

  <type name="mylang">
    <scheme name="mylang">
      <!-- Add your syntax rules here -->
      <regexp match="#.*$" region="def:Comment"/>
      
      <keywords region="def:Keyword">
        <word name="myKeyword"/>
        <word name="myOtherKeyword"/>
      </keywords>
    </scheme>
  </type>
</hrc>
```

### Step 2: Add to Application

Edit `app.js` and add your language:

```javascript
// In ColorerApp.loadSchemes() method, add:
const schemes = ['javascript', 'python', 'mylang'];  // Add 'mylang'

// In ColorerApp.samples object, add:
mylang: `# My Language Example
myKeyword variable = 42
myOtherKeyword function() {
    # This is a comment
}`,
```

### Step 3: Add UI Option

Edit `index.html` and add to the language dropdown:

```html
<select id="language-select">
    <option value="javascript">JavaScript</option>
    <option value="python">Python</option>
    <option value="mylang">My Language</option>  <!-- Add this -->
</select>
```

### Step 4: Test

Reload the page, select your language, and test the highlighting!

## Region Reference

Common regions used in syntax highlighting:

| Region | Purpose | Example |
|--------|---------|---------|
| `def:Comment` | Comments | `// comment` |
| `def:String` | String literals | `"hello"` |
| `def:Number` | Numeric values | `42`, `3.14` |
| `def:Keyword` | Language keywords | `if`, `while` |
| `def:Operator` | Operators | `+`, `-`, `==` |
| `def:Function` | Function names | `myFunction()` |
| `def:Type` | Type names | `String`, `int` |
| `def:Constant` | Constants | `true`, `false`, `null` |
| `def:Variable` | Variables | Variable identifiers |
| `def:Directive` | Preprocessor | `#include` |
| `def:Escape` | Escape sequences | `\n`, `\t` |
| `def:TODO` | TODO markers | `TODO:` |

## Advanced Features

### Capture Groups

Match and highlight parts of a pattern differently:

```xml
<regexp match="/function\s+(\w+)\s*\(/" 
        region0="def:Keyword" 
        region1="def:Function"/>
```

### Nested Blocks

Highlight content inside blocks with a different scheme:

```xml
<block start="/`/" end="/`/" scheme="TemplateLiteral" region="def:String"/>

<scheme name="TemplateLiteral">
  <block start="/\$\{/" end="/\}/" scheme="javascript" region="def:Special"/>
</scheme>
```

### Word Boundaries

Control what counts as a word boundary for keywords:

```xml
<keywords region="def:Keyword" 
          worddiv="\s\t\r\n(){}[],.;"
          ignorecase="yes">
  <word name="keyword"/>
</keywords>
```

## Troubleshooting

### Highlighting Not Working?

1. Check browser console for errors (F12)
2. Verify HRC XML is well-formed
3. Check that scheme name matches in all places
4. Ensure regex patterns are valid

### Performance Issues?

1. Simplify complex regex patterns
2. Reduce number of keywords
3. Use word boundaries instead of regex for keywords
4. Test with smaller code samples first

### Colors Not Showing?

1. Check that region names are correct
2. Verify CSS classes exist in `styles/main.css`
3. Try switching themes to see if issue is theme-specific

## Learning Resources

- **FarColorer**: https://github.com/colorer/FarColorer
- **Colorer Library**: https://github.com/colorer/Colorer-library
- **Documentation**: https://colorer.github.io

## Example: Adding C++ Support

Here's a complete example of adding C++ highlighting:

1. Create `samples/cpp.hrc`
2. Add C++ sample to `app.js`
3. Add "C++" option to `index.html`
4. Reload and test!

See the existing `javascript.hrc` and `python.hrc` files as examples.

## Contributing

To add more languages:
1. Study the existing HRC files
2. Create your HRC scheme
3. Add sample code
4. Test thoroughly
5. Share with the community!

## Questions?

This is a learning tool to understand how Colorer works. For production syntax highlighting, consider using the actual Colorer library or other mature solutions like Prism.js or highlight.js.

Enjoy exploring syntax highlighting! 🎨
