# 2024-07-21-teams-roulette
Date: 2024-07-21



Certainly! Here is the full outline for your HTML/JavaScript application, including all the details we've discussed and refined:

### Full Outline for HTML/JavaScript Meeting Moderator Application:

#### **1. UI Design:**

**Basic HTML Structure:**
- **Header:**
  - Title of the application.
- **Input Text Box:**
  - Textarea for entering names, each on a new line.
- **Buttons:**
  - "Choose a Person" button to start the selection.
  - "Reset" button to clear the fields and reset the application.
- **Display Areas:**
  - Area to show the animated roulette effect.
  - Area to display the selected name.
- **Instructions Area:**
  - General instructions for using the application.

**CSS for Styling:**
- **Layout and Positioning:**
  - Centered container for the application elements.
- **Color Scheme:**
  - Simple, visually appealing palette.
  - Background, text, and button colors.
- **Animations:**
  - CSS transitions for smooth effects.
  - Fade-in and fade-out animations.
  - Highlight effect for the selected name.

#### **2. Functionality:**

**Input for Names:**
- Textarea to input names, one per line.
- Disable the textarea after the first roll.

**Button to Start Selection:**
- Event listener for "Choose a Person" button.
- Parse names from textarea.
- Disable the textarea upon button press.

**Roulette Animation:**
- JavaScript to create a spinning roulette effect.
- Random selection logic.
- Fade-in/fade-out for name switches.

**Highlight Selected Name:**
- Highlighting logic with changing color and effects.
- Confetti/fireworks effect upon selection.

**Internal Logic:**
- Track selected names to ensure they are skipped in subsequent rolls.

**Reset Button:**
- Event listener for "Reset" button.
- Logic to clear fields, reset states, and re-enable the textarea.

**Instructions Display:**
- Static text or dynamic instructions for user guidance.

### Full Code Implementation:

#### HTML (index.html):
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Meeting Moderator</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <div class="container">
        <h1>Meeting Moderator</h1>
        <textarea id="namesInput" placeholder="Enter names, one per line"></textarea>
        <button id="chooseButton">Choose a Person</button>
        <button id="resetButton">Reset</button>
        <div id="animationArea"></div>
        <div id="selectedName"></div>
        <div id="instructions">
            <p>Enter each name on a new line.</p>
            <p>Click "Choose a Person" to start the selection.</p>
            <p>Click "Reset" to start over.</p>
        </div>
    </div>
    <script src="script.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/confetti-js@0.0.18/dist/index.min.js"></script>
</body>
</html>
```

#### CSS (styles.css):
```css
body {
    font-family: Arial, sans-serif;
    background-color: #f4f4f4;
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
}

.container {
    text-align: center;
    background-color: white;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

textarea {
    width: 100%;
    height: 100px;
    margin-bottom: 10px;
    border-radius: 4px;
    border: 1px solid #ccc;
    padding: 10px;
}

button {
    margin: 5px;
    padding: 10px 20px;
    border: none;
    border-radius: 4px;
    background-color: #007BFF;
    color: white;
    cursor: pointer;
    transition: background-color 0.3s ease;
}

button:hover {
    background-color: #0056b3;
}

#animationArea {
    margin: 20px 0;
    height: 50px;
}

#selectedName {
    font-size: 1.5em;
    color: green;
    margin-top: 10px;
}

#instructions {
    margin-top: 20px;
    font-size: 0.9em;
    color: #666;
}

.highlight {
    animation: highlightEffect 1s forwards;
}

@keyframes highlightEffect {
    0% { background-color: yellow; }
    100% { background-color: green; }
}
```

#### JavaScript (script.js):
```javascript
document.getElementById('chooseButton').addEventListener('click', choosePerson);
document.getElementById('resetButton').addEventListener('click', resetApp);

let selectedNames = [];

function choosePerson() {
    const namesInput = document.getElementById('namesInput');
    namesInput.disabled = true;
    const names = namesInput.value.split('\n').filter(name => name.trim() !== '' && !selectedNames.includes(name.trim()));
    if (names.length === 0) {
        alert('No more names to choose from.');
        return;
    }

    let index = 0;
    const totalSpins = 30; 
    const interval = setInterval(() => {
        if (index >= totalSpins) {
            clearInterval(interval);
            const selectedName = names[Math.floor(Math.random() * names.length)];
            selectedNames.push(selectedName);
            document.getElementById('selectedName').textContent = selectedName;
            animateSelection(selectedName);
            startConfetti();
            return;
        }

        document.getElementById('animationArea').textContent = names[index % names.length];
        index++;
    }, 100);
}

function animateSelection(name) {
    const selectedNameDiv = document.getElementById('selectedName');
    selectedNameDiv.classList.add('highlight');
    setTimeout(() => {
        selectedNameDiv.classList.remove('highlight');
    }, 500);
}

function resetApp() {
    const namesInput = document.getElementById('namesInput');
    namesInput.value = '';
    namesInput.disabled = false;
    document.getElementById('animationArea').textContent = '';
    document.getElementById('selectedName').textContent = '';
    selectedNames = [];
}

function startConfetti() {
    const confettiSettings = { target: 'selectedName', max: 80, size: 1, animate: true };
    const confetti = new ConfettiGenerator(confettiSettings);
    confetti.render();
    setTimeout(() => {
        confetti.clear();
    }, 5000);
}
```

### Summary:
1. **UI Design:** Simple and visually appealing with necessary elements for functionality.
2. **Functionality:** 
   - Input for names.
   - Start selection with a spinning roulette effect.
   - Highlight selected name with confetti/fireworks effect.
   - Disable input during selection, enable on reset.
   - Track selected names and skip them in subsequent rolls.
3. **Code Implementation:** HTML, CSS, and JavaScript files provided.

Let me know if you have any questions or further adjustments!



