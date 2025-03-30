Concatenated String Formatter Specification
Date: 2025-03-30


## Overview

The Concatenated String Formatter is a lightweight web-based tool that converts large blocks of text into formatted series of string literals for use in various programming languages. Whether you're working with documentation, error messages, SQL queries, or any multi-line text that needs to be inserted into code, this tool streamlines the formatting process.

## ✨ Features

- **Real-Time Transformation**: See your formatted output instantly as you type
- **Configurable String Format**: Customize every aspect of the output format
- **Smart Line Splitting**: Automatically handles long lines to respect maximum width
- **Trim Options**: Control whitespace handling with multiple trimming modes
- **Empty Line Handling**: Option to remove empty lines from the output
- **Copy with One Click**: Copy both input and output text with dedicated buttons
- **Responsive Design**: Works on desktop and mobile devices

## 🚀 Use Cases

- Convert documentation text into string literals for code
- Format error messages for logging systems
- Prepare SQL queries as strings in application code
- Convert configuration templates into code-friendly formats
- Format JSON or XML content for inclusion in source code

## 🔧 Configuration Options

The tool offers comprehensive configuration to match your specific programming language needs:

- **Indentation**: Set the number of spaces to prefix each line
- **Quote Style**: Choose your preferred quote character (`"`, `'`, or `` ` ``)
- **Quote Escape**: Define how quotes within the text should be escaped
- **Maximum Line Width**: Control when lines should be split for readability
- **Concatenation Operator**: Specify the operator used to join strings (`+`, `.`, etc.)
- **Final Separator**: Add a terminator character like semicolon if needed
- **Resulting Text Newline**: Specify the newline character sequence
- **Trim**: Choose how whitespace should be handled (None, Left, Right, All)
- **Drop Empty Lines**: Toggle whether empty lines should be included in output

## 📝 Example

### Input Text:

```
SELECT * FROM users WHERE status = 'active' AND last_login > '2025-01-01' ORDER BY username;
```

### Output With Default Settings:
```javascript
    "SELECT *\n" +
    "FROM users\n" +
    "WHERE status = 'active'\n" +
    "  AND last_login > '2025-01-01'\n" +
    "ORDER BY username;";
```

## 💻 Technical Details

The Concatenated String Formatter is built with:

- Pure HTML, CSS, and JavaScript
- No external dependencies or frameworks
- Responsive design using CSS Flexbox
- Performance optimization with debounced updates

## 🌟 Why Use This Tool?

- **Save Time**: Manually formatting strings is tedious and error-prone
- **Consistency**: Get perfectly formatted code every time
- **Flexibility**: Works with any programming language that uses string literals
- **Zero Installation**: Web-based tool works directly in your browser
- **Privacy-Focused**: All processing happens locally in your browser
