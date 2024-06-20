__FILE::README.md

# Image Dithering Web Application

## Overview

This application allows users to paste an image from the clipboard into a web interface, and it converts the image into a 16-color dithered version. The app features two panels: one for the source image and one for the dithered result. The conversion process is automatic upon pasting a new image, and both panels can be cleared independently.

## Features

- **Paste Image**: Paste an image directly from the clipboard into the source panel.
- **Automatic Dithering**: Converts the source image into a 16-color dithered image automatically.
- **Clear Panels**: Clear the source and result panels with a single button click.
- **Responsive Design**: Simple and elegant design that works well on different screen sizes.

## Technologies Used

- **HTML5**: For the structure of the application.
- **CSS3**: For styling and layout.
- **JavaScript**: For handling image pasting, conversion, and user interactions.
- **Canvas API**: For image processing and displaying the dithered result.

## How to Use

1. **Open the Application**: Launch the web application in a modern web browser.
2. **Paste an Image**: Click inside the "Input" panel and paste an image from your clipboard (Ctrl+V or Cmd+V).
3. **View Dithered Image**: The dithered version of the image will automatically appear in the "Result" panel.
4. **Clear Panels**: Use the "Clear" button to remove the source image and its dithered result.

## File Structure

- `index.html`: The main HTML file containing the structure of the application.
- `styles.css`: The CSS file for styling the application.
- `script.js`: The JavaScript file handling the application's logic and functionality.
