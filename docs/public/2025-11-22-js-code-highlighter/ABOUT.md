# Colorer JS Syntax Highlighter

## Overview

The `js-highlighter` directory contains a complete vanilla JavaScript implementation of the Colorer syntax highlighting engine. This application demonstrates how FarColorer works internally by re-implementing its core algorithms in JavaScript.

## What's Inside

A fully functional web application that:
- Parses HRC (Highlight/Regions/Config) XML scheme files
- Applies syntax highlighting rules using regular expressions and keywords
- Supports multiple programming languages (JavaScript, Python, and extensible)
- Provides three color themes (Default, Dark, Light)
- Includes comprehensive documentation and examples

## Quick Start

```bash
cd js-highlighter
python -m http.server 8000
# Open http://localhost:8000 in your browser
```

Or simply open `js-highlighter/index.html` directly in your browser.

## Documentation

- **README.md** - Main documentation with architecture overview
- **QUICKSTART.md** - Step-by-step getting started guide
- **TECHNICAL.md** - Deep dive into algorithms and implementation

## Purpose

This is an **educational tool** designed to:
1. Help developers understand how Colorer's syntax highlighting works
2. Demonstrate HRC scheme format and usage
3. Show the algorithms behind pattern matching and region management
4. Provide a starting point for creating custom syntax schemes

## Use Cases

- **Learning**: Understand syntax highlighting internals
- **Prototyping**: Test HRC schemes before using in FarColorer
- **Teaching**: Demonstrate compiler/parser concepts
- **Experimentation**: Try new language definitions quickly

## Not Intended For

This is NOT a production replacement for:
- FarColorer plugin (the real thing)
- Colorer C++ library (production-grade)
- Established JS highlighters (Prism.js, highlight.js, etc.)

## Features

✅ Full HRC XML parsing  
✅ Hierarchical region system  
✅ Regular expression matching  
✅ Keyword lists with word boundaries  
✅ Block patterns (start/end)  
✅ Scheme inheritance  
✅ Real-time highlighting  
✅ Multiple themes  
✅ Extensible architecture  
✅ Well-documented code  

## Creating Your Own Language

1. Copy `samples/template.hrc`
2. Define your syntax rules
3. Add to `app.js` and `index.html`
4. Test in the browser!

See QUICKSTART.md for detailed instructions.

## Contributing

Want to add more languages or features? Check out:
- Template HRC file in `samples/template.hrc`
- Technical implementation guide in `TECHNICAL.md`
- Existing language schemes as examples

## License

Part of the FarColorer project. See main repository LICENSE.

## Links

- Main Repository: [FarColorer](https://github.com/colorer/FarColorer)
- Colorer Library: [Colorer-library](https://github.com/colorer/Colorer-library)
- Documentation: [https://colorer.github.io](https://colorer.github.io)
