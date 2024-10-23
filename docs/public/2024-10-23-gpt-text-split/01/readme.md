# Hello
Date: 2024-10-23

I will take regular breaks to refresh my mind and stay productive.



Here's the updated **Project Specification** with the **Testing section** removed. 

---

# **Project Specification: Web-Based Text Splitting Tool**

---

## **1. Project Overview**

### **Objective:**
The objective of this project is to build a simple, user-friendly web-based application that allows users to split large chunks of text into smaller segments based on user-defined rules. The tool will provide multiple splitting strategies, append/prepend content to the split segments, and allow for easy copying of the results. Additionally, the tool will include the ability to export split text segments into files, track undo/redo actions, and manage character limits dynamically.

The application should be developed using **HTML**, **CSS**, and **JavaScript** and must ensure responsiveness across different devices. Browser local storage should be used to preserve user preferences.

### **Core Features:**
1. Input area for users to paste or enter large text blocks.
2. Sidebar for selecting and configuring splitting strategies.
3. Output area to display the split segments with “Copy to Clipboard” functionality.
4. Ability to prepend/append content to each split segment, ensuring the total character count of each segment remains within a user-defined limit.
5. Dynamic loading of splitting strategies defined in a separate **JavaScript file** using an array of **JSON objects**.
6. Undo/Redo functionality for text and splitting operations.
7. Option to export split segments to a **.txt** or **.csv** file.
8. Local storage for saving user preferences (without saving actual text input/output).

---

## **2. User Interface (UI) Specification**

### **2.1. Main Text Input Area**
- A large input box for users to paste or type in text.
- **Placeholder Text**: “Paste or type your text here.”
- Optional **Character Counter** displayed below the text box to show how many characters the user has entered.
  
### **2.2. Sidebar (Settings Panel)**
The sidebar will allow users to configure the splitting strategy and any additional settings related to their task. It will contain the following elements:

#### **2.2.1. Splitting Strategy Selection**
- **Dropdown Menu**:
  - Dynamically populated from an array of JSON objects, representing the available splitting strategies.
  - Each JSON object will have a `displayName` and an associated `input` parameter list (if any). 
  - Users select a strategy, and any required parameters will be displayed for them to configure (e.g., a character limit input field).
  
#### **2.2.2. Prepend/Append Fields**
- **Prepend Input Field**:
  - A text box where users can enter text that will be prepended to each segment.
  - The character count will update dynamically to ensure that prepended content plus the split text does not exceed the user-defined character limit.
  
- **Append Input Field**:
  - A text box where users can enter text that will be appended to each segment.
  - Similar validation to the prepend field.

#### **2.2.3. Character Limit Configuration**
- **Character Limit Input Field**:
  - A numerical input field where users define the maximum number of characters allowed for each segment, including appended/prepended text.
  
#### **2.2.4. Save Preferences Toggle**
- A switch or button allowing users to save their preferences (split strategy, prepended/appended content, character limit) to browser local storage.
- **Note**: Do not save actual input/output text for privacy reasons.

### **2.3. Output Display Area**
- For each segment produced by the splitting function, a new text box will be dynamically generated in the output area.
- Each text box will display the split segment, and the following functionalities will be included:
  - **Copy to Clipboard Button**: A button next to each text box that copies the segment to the clipboard when clicked.
  - Optional: A character counter for each segment.

---

## **3. Functionality Specification**

### **3.1. Splitting Strategies (JSON Objects in Separate File)**
The splitting strategies should be defined in a **JavaScript file** (`splittingStrategies.js`) and structured as an array of **JSON objects**. Each object will have the following structure:

```javascript
const splittingStrategies = [
    {
        displayName: "Split by N characters",
        input: [
            { parameterName: "limit", parameterType: "int", defaultValue: "5000" }
        ],
        func: function (text, limit) {
            let result = [];
            for (let i = 0; i < text.length; i += limit) {
                result.push(text.substring(i, i + limit));
            }
            return result;
        },
    },
    {
        displayName: "Split by sentences",
        input: [],
        func: function (text) {
            return text.split(/[.!?]\s/);  // Example logic to split by sentences
        }
    }
];
```

#### **Functionality Requirements**:
- **Display Name**: This will be the name of the strategy shown in the dropdown menu.
- **Input Parameters**: The parameters required for the function (if any), such as character limit. The UI will dynamically display input fields for these parameters based on the JSON object.
- **Function (`func`)**: The splitting function will take the input text (and any required parameters, like the character limit) and return an array of strings (each string representing a segment).
- **UI Integration**: When a user selects a strategy from the dropdown, the selected function is invoked with the required parameters. The resulting array will be processed in a loop to create the output text boxes.

### **3.2. Appending/Prepending Functionality**
- For each split segment, the tool must append or prepend user-defined text.
- **Validation**: Ensure that the total length of each segment (original text + prepended/appended text) does not exceed the defined character limit.
  
### **3.3. Clipboard Copy Function**
- Each output text box must include a **Copy to Clipboard Button**.
- When clicked, the button should copy the text in the corresponding text box to the clipboard.
- A success message or visual feedback (e.g., a checkmark) should confirm that the content was successfully copied.

### **3.4. Export to File**
- Provide an option for users to export split segments into a **.txt** or **.csv** file.
- Each segment should be saved as a new line (for **.txt**) or as a new row (for **.csv**).
- The "Export to File" button should be placed next to the "Copy to Clipboard" button.

### **3.5. Local Storage for User Preferences**
- Store user preferences such as selected splitting strategy, prepended/appended content, and character limits in **local storage**.
- Automatically load these preferences when the user revisits the page.
- **Note**: Ensure no actual input/output text is stored to maintain privacy.

### **3.6. Undo/Redo Functionality**
- Implement undo/redo functionality for operations such as text input, text splitting, or parameter changes.
- Provide buttons in the UI to allow users to undo the last action or redo an undone action.

### **3.7. Advanced Character Count Management**
- Display a detailed breakdown of character usage for each split segment (including the original text, appended, and prepended content).
- Update dynamically as users modify their inputs or split configurations.

---

## **4. Performance and Optimization**

### **4.1. Handling Large Text Inputs**
- Ensure the JavaScript functions are optimized to handle large volumes of text (e.g., 50,000+ characters).
- Text processing and UI updates should be efficient, with minimal delays in rendering the output.

### **4.2. Responsiveness**
- Use CSS media queries to ensure that the UI adapts to different screen sizes (desktop, tablet, mobile).
- All UI components (text boxes, buttons, sidebar) should remain fully functional on small screens.

### **4.3. User Experience**
- Provide real-time updates when users adjust the split parameters.
- Ensure smooth transitions between actions and show feedback (e.g., loading indicators for large text splits).
- Handle errors gracefully (e.g., invalid input formats, exceeding character limits).

---

## **5. Additional Considerations**

### **5.1. Security and Privacy**
- Ensure that no input or output text is stored in the local storage to maintain user privacy.
- The tool must not send or store any user data outside the browser environment.

---

### **Conclusion:**

This specification should provide the implementer with all the necessary details to develop the web-based text splitting tool, ensuring clarity at every step. The project should be completed with attention to both functionality and user experience, maintaining high performance even with large inputs, and providing an intuitive and responsive UI for the user.

---

This should now serve as a comprehensive project specification document, clear enough for an implementer to follow without needing additional clarifications.



---

### **Section 1: Plan**

To develop the **Web-Based Text Splitting Tool** as specified, the following implementation plan and file structure are proposed:

#### **Implementation Plan:**

1. **Project Structure:**
   - **index.html**: The main HTML file that structures the user interface, including the input area, sidebar, and output display area.
   - **styles.css**: Contains all CSS styles to ensure a responsive and user-friendly UI using modern CSS3 techniques.
   - **main.js**: Handles the core functionality, including text splitting, appending/prepending, clipboard operations, export functionality, undo/redo actions, and interaction with local storage.
   - **splittingStrategies.js**: Defines the available text splitting strategies as an array of JSON objects, allowing dynamic loading and configuration.
   - **utils.js**: (Optional) Contains utility functions to support main.js for better code organization and reusability.

2. **Key Features Implementation:**
   - **Input Area**: A textarea with a placeholder and a character counter.
   - **Sidebar**: Includes dropdown for splitting strategies, input fields for prepend/append texts, character limit configuration, and a toggle for saving preferences.
   - **Output Area**: Dynamically generates text boxes for each split segment with copy buttons and character counters.
   - **Undo/Redo Functionality**: Utilizes a stack-based approach to track user actions and manage undo/redo operations.
   - **Export Functionality**: Allows exporting split segments to `.txt` or `.csv` files using Blob and URL APIs.
   - **Local Storage Integration**: Saves and retrieves user preferences without storing actual text inputs/outputs.

3. **Security and Performance:**
   - Ensure all user inputs are properly sanitized to prevent XSS attacks.
   - Optimize JavaScript functions to handle large texts efficiently.
   - Use CSS media queries for responsiveness across devices.
   - Implement efficient DOM manipulation to minimize reflows and repaints.

4. **Testing and Validation:**
   - Ensure all functionalities work as expected across modern browsers.
   - Validate character limits and prevent exceeding user-defined constraints.
   - Test undo/redo operations for reliability.

#### **Confidence Level:** 95%

# **Section 2: Implementation**

``` 
__FILE::index.html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Web-Based Text Splitting Tool</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <div class="container">
        <header>
            <h1>Text Splitting Tool</h1>
        </header>
        <main>
            <section class="input-section">
                <textarea id="inputText" placeholder="Paste or type your text here."></textarea>
                <div class="char-counter" id="inputCharCounter">0 characters</div>
            </section>
            <aside class="sidebar">
                <div class="sidebar-section">
                    <label for="strategySelect">Splitting Strategy:</label>
                    <select id="strategySelect">
                        <!-- Options will be populated dynamically -->
                    </select>
                </div>
                <div class="sidebar-section">
                    <label for="prependText">Prepend Text:</label>
                    <input type="text" id="prependText" placeholder="Text to prepend">
                    <div class="char-counter" id="prependCharCounter">0 characters</div>
                </div>
                <div class="sidebar-section">
                    <label for="appendText">Append Text:</label>
                    <input type="text" id="appendText" placeholder="Text to append">
                    <div class="char-counter" id="appendCharCounter">0 characters</div>
                </div>
                <div class="sidebar-section">
                    <label for="charLimit">Character Limit:</label>
                    <input type="number" id="charLimit" min="1" value="5000">
                </div>
                <div class="sidebar-section">
                    <label for="savePreferences">Save Preferences:</label>
                    <input type="checkbox" id="savePreferences">
                </div>
                <div class="sidebar-section">
                    <button id="undoButton" disabled>Undo</button>
                    <button id="redoButton" disabled>Redo</button>
                </div>
            </aside>
            <section class="output-section">
                <div id="outputContainer">
                    <!-- Split segments will appear here -->
                </div>
                <div class="export-section">
                    <button id="exportTxt">Export as .txt</button>
                    <button id="exportCsv">Export as .csv</button>
                </div>
            </section>
        </main>
    </div>
    <script src="splittingStrategies.js"></script>
    <script src="main.js"></script>
</body>
</html>

__FILE::styles.css
* {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
}

body {
    font-family: Arial, sans-serif;
    background-color: #f4f4f4;
}

.container {
    display: flex;
    flex-direction: column;
    height: 100vh;
}

header {
    background-color: #333;
    color: #fff;
    padding: 1rem;
    text-align: center;
}

main {
    display: flex;
    flex: 1;
    overflow: hidden;
}

.input-section {
    flex: 2;
    padding: 1rem;
    display: flex;
    flex-direction: column;
}

.input-section textarea {
    flex: 1;
    padding: 0.5rem;
    font-size: 1rem;
    resize: none;
}

.char-counter {
    text-align: right;
    margin-top: 0.5rem;
    font-size: 0.9rem;
    color: #555;
}

.sidebar {
    flex: 1;
    background-color: #fff;
    padding: 1rem;
    border-left: 1px solid #ccc;
    overflow-y: auto;
}

.sidebar-section {
    margin-bottom: 1.5rem;
}

.sidebar-section label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: bold;
}

.sidebar-section input[type="text"],
.sidebar-section input[type="number"],
.sidebar-section select {
    width: 100%;
    padding: 0.5rem;
    font-size: 1rem;
}

.sidebar-section input[type="checkbox"] {
    transform: scale(1.5);
}

.sidebar-section button {
    padding: 0.5rem 1rem;
    font-size: 1rem;
    margin-right: 0.5rem;
}

.output-section {
    flex: 3;
    padding: 1rem;
    display: flex;
    flex-direction: column;
    overflow-y: auto;
}

#outputContainer {
    flex: 1;
    display: flex;
    flex-direction: column;
}

.output-segment {
    background-color: #fff;
    padding: 0.5rem;
    margin-bottom: 0.5rem;
    border: 1px solid #ccc;
    position: relative;
}

.output-segment textarea {
    width: 100%;
    height: 100px;
    resize: none;
    padding: 0.5rem;
    font-size: 1rem;
}

.copy-button {
    position: absolute;
    top: 0.5rem;
    right: 0.5rem;
    padding: 0.3rem 0.6rem;
    font-size: 0.9rem;
    cursor: pointer;
}

.export-section {
    margin-top: 1rem;
    text-align: right;
}

.export-section button {
    padding: 0.5rem 1rem;
    font-size: 1rem;
    margin-left: 0.5rem;
}

@media (max-width: 768px) {
    main {
        flex-direction: column;
    }
    .sidebar {
        border-left: none;
        border-top: 1px solid #ccc;
    }
}

__FILE::splittingStrategies.js
const splittingStrategies = [
    {
        displayName: "Split by N characters",
        input: [
            { parameterName: "limit", parameterType: "number", defaultValue: 5000 }
        ],
        func: function (text, limit) {
            const result = [];
            for (let i = 0; i < text.length; i += limit) {
                result.push(text.substring(i, i + limit));
            }
            return result;
        },
    },
    {
        displayName: "Split by sentences",
        input: [],
        func: function (text) {
            return text.match(/[^\.!\?]+[\.!\?]+/g) || [];
        }
    },
    {
        displayName: "Split by lines",
        input: [],
        func: function (text) {
            return text.split(/\r?\n/);
        }
    }
];

__FILE::main.js
document.addEventListener('DOMContentLoaded', () => {
    const inputText = document.getElementById('inputText');
    const inputCharCounter = document.getElementById('inputCharCounter');
    const strategySelect = document.getElementById('strategySelect');
    const prependText = document.getElementById('prependText');
    const appendText = document.getElementById('appendText');
    const prependCharCounter = document.getElementById('prependCharCounter');
    const appendCharCounter = document.getElementById('appendCharCounter');
    const charLimit = document.getElementById('charLimit');
    const savePreferences = document.getElementById('savePreferences');
    const outputContainer = document.getElementById('outputContainer');
    const exportTxt = document.getElementById('exportTxt');
    const exportCsv = document.getElementById('exportCsv');
    const undoButton = document.getElementById('undoButton');
    const redoButton = document.getElementById('redoButton');

    let historyStack = [];
    let redoStack = [];

    // Initialize splitting strategies
    function initializeStrategies() {
        splittingStrategies.forEach((strategy, index) => {
            const option = document.createElement('option');
            option.value = index;
            option.textContent = strategy.displayName;
            strategySelect.appendChild(option);
        });
    }

    // Update character counters
    function updateCharCounters() {
        inputCharCounter.textContent = `${inputText.value.length} characters`;
        prependCharCounter.textContent = `${prependText.value.length} characters`;
        appendCharCounter.textContent = `${appendText.value.length} characters`;
    }

    // Save preferences to local storage
    function saveUserPreferences() {
        if (savePreferences.checked) {
            const preferences = {
                strategyIndex: strategySelect.value,
                prependText: prependText.value,
                appendText: appendText.value,
                charLimit: charLimit.value
            };
            localStorage.setItem('textSplitPreferences', JSON.stringify(preferences));
        } else {
            localStorage.removeItem('textSplitPreferences');
        }
    }

    // Load preferences from local storage
    function loadUserPreferences() {
        const preferences = JSON.parse(localStorage.getItem('textSplitPreferences'));
        if (preferences) {
            strategySelect.value = preferences.strategyIndex;
            prependText.value = preferences.prependText;
            appendText.value = preferences.appendText;
            charLimit.value = preferences.charLimit;
            savePreferences.checked = true;
        }
    }

    // Split text based on selected strategy
    function splitText() {
        const strategy = splittingStrategies[strategySelect.value];
        const limit = Number(charLimit.value);
        let segments = [];

        if (strategy.input.length > 0) {
            segments = strategy.func(inputText.value, limit);
        } else {
            segments = strategy.func(inputText.value);
        }

        // Apply prepend and append
        const finalSegments = segments.map(segment => {
            let newSegment = `${prependText.value}${segment}${appendText.value}`;
            if (newSegment.length > limit) {
                newSegment = newSegment.substring(0, limit);
            }
            return newSegment;
        });

        displaySegments(finalSegments);
    }

    // Display split segments
    function displaySegments(segments) {
        outputContainer.innerHTML = '';
        segments.forEach((segment, index) => {
            const segmentDiv = document.createElement('div');
            segmentDiv.classList.add('output-segment');

            const textarea = document.createElement('textarea');
            textarea.value = segment;
            textarea.readOnly = true;

            const copyButton = document.createElement('button');
            copyButton.textContent = 'Copy';
            copyButton.classList.add('copy-button');
            copyButton.addEventListener('click', () => {
                navigator.clipboard.writeText(textarea.value).then(() => {
                    copyButton.textContent = 'Copied!';
                    setTimeout(() => {
                        copyButton.textContent = 'Copy';
                    }, 2000);
                });
            });

            segmentDiv.appendChild(textarea);
            segmentDiv.appendChild(copyButton);
            outputContainer.appendChild(segmentDiv);
        });
    }

    // Export segments as .txt
    function exportAsTxt() {
        const segments = Array.from(document.querySelectorAll('.output-segment textarea')).map(textarea => textarea.value);
        const blob = new Blob([segments.join('\n')], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'split_segments.txt';
        a.click();
        URL.revokeObjectURL(url);
    }

    // Export segments as .csv
    function exportAsCsv() {
        const segments = Array.from(document.querySelectorAll('.output-segment textarea')).map(textarea => `"${textarea.value.replace(/"/g, '""')}"`);
        const csvContent = segments.join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'split_segments.csv';
        a.click();
        URL.revokeObjectURL(url);
    }

    // Handle undo action
    function undoAction() {
        if (historyStack.length > 0) {
            const lastState = historyStack.pop();
            redoStack.push({
                strategyIndex: strategySelect.value,
                prependText: prependText.value,
                appendText: appendText.value,
                charLimit: charLimit.value,
                inputText: inputText.value
            });
            applyState(lastState);
            updateUndoRedoButtons();
        }
    }

    // Handle redo action
    function redoAction() {
        if (redoStack.length > 0) {
            const nextState = redoStack.pop();
            historyStack.push({
                strategyIndex: strategySelect.value,
                prependText: prependText.value,
                appendText: appendText.value,
                charLimit: charLimit.value,
                inputText: inputText.value
            });
            applyState(nextState);
            updateUndoRedoButtons();
        }
    }

    // Apply a given state to the UI
    function applyState(state) {
        strategySelect.value = state.strategyIndex;
        prependText.value = state.prependText;
        appendText.value = state.appendText;
        charLimit.value = state.charLimit;
        inputText.value = state.inputText;
        updateCharCounters();
        splitText();
        if (savePreferences.checked) {
            saveUserPreferences();
        }
    }

    // Save current state to history
    function saveState() {
        historyStack.push({
            strategyIndex: strategySelect.value,
            prependText: prependText.value,
            appendText: appendText.value,
            charLimit: charLimit.value,
            inputText: inputText.value
        });
        redoStack = [];
        updateUndoRedoButtons();
    }

    // Update the state of undo and redo buttons
    function updateUndoRedoButtons() {
        undoButton.disabled = historyStack.length === 0;
        redoButton.disabled = redoStack.length === 0;
    }

    // Event listeners
    inputText.addEventListener('input', () => {
        updateCharCounters();
        saveState();
    });

    strategySelect.addEventListener('change', () => {
        saveState();
        splitText();
        if (savePreferences.checked) {
            saveUserPreferences();
        }
    });

    prependText.addEventListener('input', () => {
        updateCharCounters();
        saveState();
        splitText();
        if (savePreferences.checked) {
            saveUserPreferences();
        }
    });

    appendText.addEventListener('input', () => {
        updateCharCounters();
        saveState();
        splitText();
        if (savePreferences.checked) {
            saveUserPreferences();
        }
    });

    charLimit.addEventListener('input', () => {
        saveState();
        splitText();
        if (savePreferences.checked) {
            saveUserPreferences();
        }
    });

    savePreferences.addEventListener('change', () => {
        saveUserPreferences();
    });

    exportTxt.addEventListener('click', exportAsTxt);
    exportCsv.addEventListener('click', exportAsCsv);
    undoButton.addEventListener('click', undoAction);
    redoButton.addEventListener('click', redoAction);

    // Initialize the application
    initializeStrategies();
    loadUserPreferences();
    updateCharCounters();
    splitText();
    updateUndoRedoButtons();
});

```
