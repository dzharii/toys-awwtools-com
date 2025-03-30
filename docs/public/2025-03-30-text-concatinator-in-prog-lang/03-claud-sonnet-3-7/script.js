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

    // Format a single line of text with quotes, indentation, and operator
    function formatSingleLine(line, indent, quote, concatOp, isLastLine, finalSep) {
        const escapedLine = escapeQuotes(line, quote);
        let result = `${indent}${quote}${escapedLine}${quote}`;
        
        if (!isLastLine) {
            result += concatOp;
        } else if (finalSep) {
            result += concatOp + finalSep;
        }
        
        return result;
    }

    // Split a long line into multiple lines that respect the max width
    function splitLongLine(formattedLine, maxWidth, indent, quote, concatOp, isLastLine, finalSep) {
        const result = [];
        
        // Calculate the parts that will be fixed for each line
        const fixedPrefix = indent + quote;
        const fixedSuffix = quote + concatOp;
        const fixedLength = fixedPrefix.length + fixedSuffix.length;
        
        // Extract the content between quotes
        const contentStart = indent.length + quote.length;
        const contentEnd = formattedLine.length - (isLastLine && !finalSep ? quote.length : quote.length + concatOp.length + (finalSep ? finalSep.length : 0));
        let content = formattedLine.substring(contentStart, contentEnd);
        
        // Calculate how much content can fit per line
        const maxContentPerLine = maxWidth - fixedLength;
        
        // Edge case: if maxContentPerLine is too small, we need to use at least one character
        if (maxContentPerLine <= 0) {
            // Just add the original line and return a warning
            result.push(formattedLine);
            errorArea.textContent = 'Warning: Maximum line width is too small for the current configuration. Consider increasing it.';
            errorArea.classList.add('show');
            return result;
        }
        
        // Split the content into chunks that fit within maxContentPerLine
        while (content.length > 0) {
            let chunkSize = Math.min(content.length, maxContentPerLine);
            
            // Try to find a good break point (space) if possible
            if (chunkSize < content.length && chunkSize > 0) {
                // Look for the last space within the allowed length
                let spaceIndex = -1;
                for (let i = chunkSize - 1; i >= 0; i--) {
                    if (content[i] === ' ') {
                        spaceIndex = i;
                        break;
                    }
                }
                
                // If we found a space, break there
                if (spaceIndex > 0) {
                    chunkSize = spaceIndex + 1; // Include the space in the current chunk
                }
            }
            
            const chunk = content.substring(0, chunkSize);
            content = content.substring(chunkSize);
            
            // Add this chunk as a formatted line
            const isLastChunk = content.length === 0 && isLastLine;
            let lineEnd;
            
            if (isLastChunk) {
                lineEnd = quote + (finalSep ? concatOp + finalSep : '');
            } else {
                lineEnd = quote + concatOp;
            }
            
            result.push(fixedPrefix + escapeQuotes(chunk, quote) + lineEnd);
        }
        
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

        // Get input lines and filter out empty ones if needed
        let lines = inputText.value.split('\n');
        if (shouldDropEmptyLines) {
            lines = lines.filter(line => line.trim() !== '');
        }
        
        const formattedLines = [];
        
        // Process each line
        for (let i = 0; i < lines.length; i++) {
            const isLastLine = i === lines.length - 1;
            const trimmedLine = applyTrim(lines[i]);
            
            // Format this line
            const formattedLine = formatSingleLine(
                trimmedLine, 
                indent, 
                quote, 
                concatOp, 
                isLastLine, 
                finalSep
            );
            
            // Check if the line exceeds maximum width and needs to be split
            if (formattedLine.length > maxWidth) {
                const splitLines = splitLongLine(
                    formattedLine, 
                    maxWidth, 
                    indent, 
                    quote, 
                    concatOp, 
                    isLastLine, 
                    finalSep
                );
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
        
        try {
            // Try to use the newer clipboard API if available
            if (navigator.clipboard && window.isSecureContext) {
                navigator.clipboard.writeText(element.value).then(() => {
                    showCopyFeedback(element);
                });
            } else {
                // Fall back to the older execCommand method
                const successful = document.execCommand('copy');
                if (successful) {
                    showCopyFeedback(element);
                } else {
                    console.error('Failed to copy text');
                }
            }
        } catch (err) {
            console.error('Error copying to clipboard:', err);
        }
    }
    
    // Show visual feedback when text is copied
    function showCopyFeedback(element) {
        const originalBackground = element.style.backgroundColor;
        element.style.backgroundColor = '#e8f5e9';
        setTimeout(() => {
            element.style.backgroundColor = originalBackground;
        }, 200);
    }

    // Event listeners
    const debouncedFormatText = debounce(formatText, 300);

    // Input text changes
    inputText.addEventListener('input', debouncedFormatText);
    
    // Configuration changes
    indentationInput.addEventListener('input', debouncedFormatText);
    quoteStyleInput.addEventListener('input', debouncedFormatText);
    maxWidthInput.addEventListener('input', debouncedFormatText);
    concatOpInput.addEventListener('input', debouncedFormatText);
    finalSepInput.addEventListener('input', debouncedFormatText);
    trimOption.addEventListener('change', debouncedFormatText);
    dropEmptyLines.addEventListener('change', debouncedFormatText);

    // Copy button clicks
    copyInputBtn.addEventListener('click', () => copyToClipboard(inputText));
    copyOutputBtn.addEventListener('click', () => copyToClipboard(outputText));

    // Initialize with empty input
    formatText();
});