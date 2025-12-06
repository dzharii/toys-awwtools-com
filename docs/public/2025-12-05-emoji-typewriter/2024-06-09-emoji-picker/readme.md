Date: 2024-06-09

# Emoji Picker

## Overview
Emoji Picker is a web application that allows users to search, copy, and manage their favorite emojis. This application features a clean and minimalistic design, ensuring a seamless user experience. It supports dynamic emoji search, copying emojis to the clipboard, and tracking recently used emojis.

## Features
- **Search for Emojis**: A search bar allows users to dynamically filter emojis by name.
- **Copy to Clipboard**: Users can copy emojis to the clipboard by clicking on them.
- **Recent Emojis**: Tracks recently used emojis and displays them for quick access.
- **Responsive Design**: The layout adapts to different screen sizes, ensuring usability across various devices.

## Installation
To use this application, follow these steps:

1. **Clone the repository:**
    ```sh
    git clone https://github.com/your-username/emoji-picker.git
    ```

2. **Navigate to the project directory:**
    ```sh
    cd emoji-picker
    ```

3. **Open `index.html` in your web browser:**
    ```sh
    open index.html
    ```

## Usage
### Search for Emojis
1. Start typing in the search bar to filter emojis by name.
2. The results will dynamically update as you type.

### Copy Emojis to Clipboard
1. Click on any emoji in the results or recent list.
2. A notification will appear indicating that the emoji has been copied to the clipboard.

### View Recent Emojis
1. The sidebar on the left displays the most recently used emojis.
2. Click on any emoji in the recent list to copy it to the clipboard.

## File Structure
- `index.html`: The main HTML file containing the structure of the application.
- `styles.css`: The CSS file for styling the application.
- `script.js`: The main JavaScript file for handling the application's functionality.
- `data.raw.json.js`: Contains the emoji data used for searching and displaying emojis.

## Local Storage
The application uses local storage to persist the recent emojis list. The data is stored under a top-level key, which ensures easy retrieval and storage.

### Key Details
- **Top-Level Key**: `b4fc7cc1-eb82-4bd9-acac-22c34004adf5`
- **Stored Data**: 
  - `recentEmojis`: An array of recently used emojis.

## Contributing
Contributions are welcome! Feel free to open an issue or submit a pull request.

## License
This project is licensed under the MIT License. See the `LICENSE` file for details.

## Acknowledgements
- Emoji data provided by [Emojibase](https://github.com/milesj/emojibase).

## Contact
For questions or suggestions, please open an issue or contact the repository owner.




