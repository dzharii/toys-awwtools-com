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


