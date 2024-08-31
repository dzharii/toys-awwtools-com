# JavaScript Spreadsheet Component

## Overview

This project implements a basic spreadsheet component using only HTML, CSS, and JavaScript. The component provides functionality similar to a basic spreadsheet, including cell editing, column and row resizing, and data persistence using LocalStorage.

## Files

- **index.html**: The main HTML file for the project.
- **styles.css**: Contains the CSS styles for the spreadsheet layout and appearance.
- **app.js**: The JavaScript file that implements the spreadsheet functionality.

## Features

- **Dynamic Grid Layout**: A 26x1000 grid (A-Z columns, 1000 rows) is generated dynamically.
- **Cell Editing**: Users can edit cell content directly by clicking on any non-header cell.
- **Column and Row Resizing**: Columns and rows can be resized by dragging their edges.
- **Data Persistence**: The spreadsheet data is stored in LocalStorage, allowing it to persist across browser sessions.
- **API Functions**: 
  - `setValue(cell, value)`: Sets the value of a specific cell.
  - `getValue(cell)`: Retrieves the value of a specific cell.
  - `loadData(data)`: Loads a set of data into the spreadsheet.
  - `getData()`: Returns the current data in the spreadsheet.

## Setup Instructions

1. Clone or download the repository.
2. Open the `index.html` file in any modern web browser.
3. The spreadsheet will be initialized with default settings. You can start editing cells and resizing columns/rows immediately.

## Usage Examples

**Setting a Value Programmatically**:
```javascript
  setValue({row: 2, col: 2}, 'Hello World');
```
  
**Getting a Value Programmatically**:
```javascript
  const value = getValue({row: 2, col: 2});
  console.log(value);
```
  
**Loading Data**:
```javascript
  const data = {
    'A1': 'First Cell',
    'B2': 'Second Cell',
    // Add more data as needed
  };
  loadData(data);
```

## Security Considerations

- User input is sanitized to prevent XSS attacks.
- Error messages are displayed in a persistent error label within the component.

## Compatibility

- The component is designed to be compatible with modern web browsers (Chrome, Firefox, Safari, Edge).
- Responsive design ensures that the component works well across different screen sizes.

## Performance

- Optimized for handling large datasets using lazy loading and throttling techniques.
- Efficient DOM manipulation to maintain performance during intensive operations like resizing.

