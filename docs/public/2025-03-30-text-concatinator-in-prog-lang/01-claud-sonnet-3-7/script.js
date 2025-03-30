document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const inputText = document.getElementById('inputText');
    const outputText = document.getElementById('outputText');
    const indentationInput = document.getElementById('indentation');
    const quoteStyleInput = document.getElementById('quoteStyle');
    const maxWidthInput = document.getElementById('maxWidth');
    const concatOpInput = document.getElementById('concatOp');
    const finalSepInput = document.getElementById('finalSep');
    const errorArea = document.getElementById('errorArea');
    const copyInputBtn = document.getElementById('copyInput');
    const copyOutputBtn = document.getElementById('copyOutput');

    // Debounce function to limit how often the processing function is called
    function debounce(func, wait) {
        let timeout;
        return function(...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    }

    // Validate configuration inputs and show errors if needed
    function validateConfig() {
        let isValid = true;
        let errorMessages = [];

        // Validate indentation
        const indentation = parseInt(indentationInput.value);
        if (isNaN(indentation) || indentation < 0) {
            errorMessages.push('Indentation must be a non-negative number.');
            isValid = false;
        }

        // Validate quote style (can be empty, but should be handled)
        if (quoteStyleInput.value.length > 1) {
            errorMessages.push('Quote style should be a single character.');
            isValid = false;
        }

        // Validate maximum line width
        const maxWidth = parseInt(maxWidthInput.value);
        if (isNaN(maxWidth) || maxWidth < 10) {
            errorMessages.push('Maximum line width must be at least 10 characters.');
            isValid = false;
        }

        // Display errors if any
        if (!isValid) {
            errorArea.textContent = errorMessages.join(' ');
            errorArea.classList.add('show');
        } else {
            errorArea.textContent = '';
            errorArea.classList.remove('show');
        }

        return isValid;
    }

    // Format the text based on configuration settings
    function formatText() {
        if (!validateConfig()) return;

        const indent = ' '.repeat(parseInt(indentationInput.value));
        const quote = quoteStyleInput.value;
        const maxWidth = parseInt(maxWidthInput.value);
        const concatOp = concatOpInput.value;
        const finalSep = finalSepInput.value;

        const lines = inputText.value.split('\n');
        const formattedLines = [];
        
        // Process each line
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const isLastLine = i === lines.length - 1;
            
            // Format the line with quotes and operator
            let formattedLine = `${indent}${quote}${escapeQuotes(line, quote)}${quote}`;
            
            // Add concatenation operator if not last line or if final separator is defined
            if (!isLastLine || finalSep) {
                formattedLine += concatOp;
            }
            
            // Add final separator if it's the last line and separator is defined
            if (isLastLine && finalSep) {
                formattedLine += finalSep;
            }
            
            // Split line if it exceeds maximum width
            // This is a simplified approach; for complex cases, you might need more logic
            if (formattedLine.length > maxWidth) {
                // Split the line logic would go here
                // For now, we'll just add the line as is
                formattedLines.push(formattedLine);
            } else {
                formattedLines.push(formattedLine);
            }
        }

        outputText.value = formattedLines.join('\n');
    }

    // Escape quotes in the string
    function escapeQuotes(str, quoteChar) {
        if (quoteChar === '"') {
            return str.replace(/"/g, '\\"');
        } else if (quoteChar === "'") {
            return str.replace(/'/g, "\\'");
        } else if (quoteChar === '`') {
            return str.replace(/`/g, "\\`");
        }
        return str;
    }

    // Copy to clipboard function
    function copyToClipboard(element) {
        element.select();
        element.setSelectionRange(0, 99999); // For mobile devices
        document.execCommand('copy');
        
        // Visual feedback
        const originalBackground = element.style.backgroundColor;
        element.style.backgroundColor = '#e8f5e9';
        setTimeout(() => {
            element.style.backgroundColor = originalBackground;
        }, 200);
    }

    // Event listeners
    const debouncedFormatText = debounce(formatText, 300);

    inputText.addEventListener('input', debouncedFormatText);
    indentationInput.addEventListener('input', debouncedFormatText);
    quoteStyleInput.addEventListener('input', debouncedFormatText);
    maxWidthInput.addEventListener('input', debouncedFormatText);
    concatOpInput.addEventListener('input', debouncedFormatText);
    finalSepInput.addEventListener('input', debouncedFormatText);

    copyInputBtn.addEventListener('click', () => copyToClipboard(inputText));
    copyOutputBtn.addEventListener('click', () => copyToClipboard(outputText));

    // Initialize with empty input
    formatText();
});