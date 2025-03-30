document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const inputText = document.getElementById('inputText');
    const outputText = document.getElementById('outputText');
    const indentationInput = document.getElementById('indentation');
    const quoteStyleInput = document.getElementById('quoteStyle');
    const maxWidthInput = document.getElementById('maxWidth');
    const concatOpInput = document.getElementById('concatOp');
    const finalSepInput = document.getElementById('finalSep');
    const trimOption = document.getElementById('trimOption');
    const dropEmptyLines = document.getElementById('dropEmptyLines');
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

    // Apply trim setting to a string
    function applyTrim(str) {
        switch (trimOption.value) {
            case 'left':
                return str.trimStart();
            case 'right':
                return str.trimEnd();
            case 'all':
                return str.trim();
            default:
                return str;
        }
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

    // Split a line if it exceeds maximum width
    function splitLine(line, maxWidth, indent, quote, concatOp) {
        const result = [];
        let currentLine = line;
        
        // Calculate the fixed part length (indent + quotes + concatOp)
        const fixedPartLength = indent.length + 2 + concatOp.length; // 2 is for opening and closing quotes
        const maxContentLength = maxWidth - fixedPartLength;
        
        if (currentLine.length <= maxWidth) {
            return [currentLine];
        }
        
        while (currentLine.length > maxWidth) {
            // Find a good place to split (ideally at a space)
            let splitIndex = maxContentLength;
            const content = currentLine.substring(indent.length + quote.length, 
                                               currentLine.length - quote.length - concatOp.length);
            
            // Try to find a space to break at
            for (let i = maxContentLength; i >= 0; i--) {
                if (content[i] === ' ') {
                    splitIndex = i;
                    break;
                }
            }
            
            // If no space found, just split at the maximum length
            if (splitIndex <= 0) splitIndex = maxContentLength;
            
            const firstPart = `${indent}${quote}${escapeQuotes(content.substring(0, splitIndex), quote)}${quote}${concatOp}`;
            result.push(firstPart);
            
            // Prepare the next line
            currentLine = `${indent}${quote}${escapeQuotes(content.substring(splitIndex), quote)}${quote}${concatOp}`;
        }
        
        result.push(currentLine);
        return result;
    }

    // Format the text based on configuration settings
    function formatText() {
        if (!validateConfig()) return;

        const indent = ' '.repeat(parseInt(indentationInput.value));
        const quote = quoteStyleInput.value;
        const maxWidth = parseInt(maxWidthInput.value);
        const concatOp = concatOpInput.value;
        const finalSep = finalSepInput.value;
        const shouldDropEmptyLines = dropEmptyLines.checked;

        let lines = inputText.value.split('\n');
        
        // Apply drop empty lines if enabled
        if (shouldDropEmptyLines) {
            lines = lines.filter(line => line.trim() !== '');
        }
        
        const formattedLines = [];
        
        // Process each line
        for (let i = 0; i < lines.length; i++) {
            let line = lines[i];
            const isLastLine = i === lines.length - 1;
            
            // Apply trim option
            line = applyTrim(line);
            
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
            if (formattedLine.length > maxWidth) {
                const splitLines = splitLine(formattedLine, maxWidth, indent, quote, concatOp);
                
                // If this is the last line and has a final separator, ensure it's only on the very last split line
                if (isLastLine && finalSep && splitLines.length > 0) {
                    // Remove the concatenation operator from the last split line
                    let lastSplitLine = splitLines[splitLines.length - 1];
                    lastSplitLine = lastSplitLine.substring(0, lastSplitLine.length - concatOp.length);
                    
                    // Add the final separator
                    lastSplitLine += finalSep;
                    
                    // Replace the last split line
                    splitLines[splitLines.length - 1] = lastSplitLine;
                }
                
                formattedLines.push(...splitLines);
            } else {
                formattedLines.push(formattedLine);
            }
        }

        outputText.value = formattedLines.join('\n');
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
    trimOption.addEventListener('change', debouncedFormatText);
    dropEmptyLines.addEventListener('change', debouncedFormatText);

    copyInputBtn.addEventListener('click', () => copyToClipboard(inputText));
    copyOutputBtn.addEventListener('click', () => copyToClipboard(outputText));

    // Initialize with empty input
    formatText();
});