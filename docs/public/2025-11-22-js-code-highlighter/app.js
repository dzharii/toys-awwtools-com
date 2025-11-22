/**
 * Main Application - Colorer JS Syntax Highlighter
 */

class ColorerApp {
    constructor() {
        this.colorer = new ColorerCore();
        this.currentLanguage = 'javascript';
        this.currentTheme = 'default';
        this.initialized = false;
        
        this.samples = {
            javascript: `// JavaScript Example
function fibonacci(n) {
    if (n <= 1) return n;
    return fibonacci(n - 1) + fibonacci(n - 2);
}

// Calculate first 10 Fibonacci numbers
const numbers = [];
for (let i = 0; i < 10; i++) {
    numbers.push(fibonacci(i));
}

console.log('Fibonacci sequence:', numbers);

// Modern ES6+ features
const greet = (name) => \`Hello, \${name}!\`;
const message = greet('World');

// Async/await example
async function fetchData(url) {
    try {
        const response = await fetch(url);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error:', error);
    }
}`,

            python: `# Python Example
def fibonacci(n):
    """Calculate nth Fibonacci number"""
    if n <= 1:
        return n
    return fibonacci(n - 1) + fibonacci(n - 2)

# Calculate first 10 Fibonacci numbers
numbers = [fibonacci(i) for i in range(10)]
print('Fibonacci sequence:', numbers)

# Class example
class Person:
    def __init__(self, name, age):
        self.name = name
        self.age = age
    
    def greet(self):
        return f"Hello, my name is {self.name}"

# Create instance
person = Person("Alice", 30)
message = person.greet()
print(message)

# Async example (Python 3.7+)
import asyncio

async def fetch_data(url):
    # Simulated async operation
    await asyncio.sleep(1)
    return {"data": "example"}`,

            cpp: `// C++ Example
#include <iostream>
#include <vector>
#include <algorithm>

int fibonacci(int n) {
    if (n <= 1) return n;
    return fibonacci(n - 1) + fibonacci(n - 2);
}

int main() {
    // Calculate first 10 Fibonacci numbers
    std::vector<int> numbers;
    for (int i = 0; i < 10; i++) {
        numbers.push_back(fibonacci(i));
    }
    
    // Print results
    std::cout << "Fibonacci sequence: ";
    for (const auto& num : numbers) {
        std::cout << num << " ";
    }
    std::cout << std::endl;
    
    return 0;
}`,

            java: `// Java Example
public class Fibonacci {
    public static int fibonacci(int n) {
        if (n <= 1) return n;
        return fibonacci(n - 1) + fibonacci(n - 2);
    }
    
    public static void main(String[] args) {
        // Calculate first 10 Fibonacci numbers
        int[] numbers = new int[10];
        for (int i = 0; i < 10; i++) {
            numbers[i] = fibonacci(i);
        }
        
        // Print results
        System.out.print("Fibonacci sequence: ");
        for (int num : numbers) {
            System.out.print(num + " ");
        }
        System.out.println();
    }
}`,

            html: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Example Page</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 20px;
        }
    </style>
</head>
<body>
    <h1>Welcome to My Page</h1>
    <p>This is a <strong>sample</strong> HTML document.</p>
    
    <ul>
        <li>Item 1</li>
        <li>Item 2</li>
        <li>Item 3</li>
    </ul>
    
    <script>
        console.log('Page loaded!');
    </script>
</body>
</html>`,

            css: `/* CSS Example */
body {
    font-family: 'Arial', sans-serif;
    margin: 0;
    padding: 20px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.container {
    max-width: 1200px;
    margin: 0 auto;
    background: white;
    border-radius: 10px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

h1, h2, h3 {
    color: #333;
    margin-bottom: 15px;
}

.button {
    padding: 10px 20px;
    background-color: #667eea;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    transition: all 0.3s;
}

.button:hover {
    background-color: #764ba2;
    transform: translateY(-2px);
}`,

            json: `{
  "name": "colorer-js",
  "version": "1.0.0",
  "description": "JavaScript syntax highlighter",
  "main": "index.html",
  "scripts": {
    "start": "serve .",
    "test": "echo \\"No tests specified\\""
  },
  "keywords": [
    "syntax",
    "highlighting",
    "colorer"
  ],
  "author": "Colorer Team",
  "license": "MIT",
  "dependencies": {},
  "devDependencies": {}
}`,

            xml: `<?xml version="1.0" encoding="UTF-8"?>
<catalog>
    <book id="1">
        <title>JavaScript: The Good Parts</title>
        <author>Douglas Crockford</author>
        <year>2008</year>
        <price currency="USD">29.99</price>
    </book>
    <book id="2">
        <title>Clean Code</title>
        <author>Robert C. Martin</author>
        <year>2008</year>
        <price currency="USD">42.99</price>
    </book>
</catalog>`
        };
    }

    /**
     * Initialize the application
     */
    async init() {
        if (this.initialized) return;

        // Load default schemes
        await this.loadSchemes();

        // Setup event listeners
        this.setupEventListeners();

        // Load initial sample
        this.loadSample();

        this.initialized = true;
        this.updateInfo('Application initialized successfully');
    }

    /**
     * Load HRC schemes for different languages
     */
    async loadSchemes() {
        const schemes = ['javascript', 'python'];
        
        for (const scheme of schemes) {
            try {
                const result = await this.colorer.loadSchemeFromURL(`samples/${scheme}.hrc`);
                if (result.success) {
                    console.log(`Loaded scheme: ${scheme}`);
                } else {
                    console.error(`Failed to load scheme ${scheme}:`, result.error);
                }
            } catch (error) {
                console.error(`Error loading scheme ${scheme}:`, error);
            }
        }
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        const editor = document.getElementById('code-editor');
        
        // Language selection
        document.getElementById('language-select').addEventListener('change', (e) => {
            this.currentLanguage = e.target.value;
            this.loadSample();
        });

        // Theme selection
        document.getElementById('theme-select').addEventListener('change', (e) => {
            this.currentTheme = e.target.value;
            this.applyTheme();
        });

        // Highlight button
        document.getElementById('highlight-btn').addEventListener('click', () => {
            this.highlightCode();
        });

        // Load sample button
        document.getElementById('load-sample-btn').addEventListener('click', () => {
            this.loadSample();
        });

        // Auto-highlight on input (with debounce)
        let debounceTimer;
        editor.addEventListener('input', () => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                this.highlightCode();
            }, 300);
        });

        // Prevent default paste behavior and insert plain text
        editor.addEventListener('paste', (e) => {
            e.preventDefault();
            const text = e.clipboardData.getData('text/plain');
            document.execCommand('insertText', false, text);
        });

        // Handle tab key
        editor.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                e.preventDefault();
                document.execCommand('insertText', false, '    ');
            }
        });
    }

    /**
     * Load sample code for current language
     */
    loadSample() {
        const sample = this.samples[this.currentLanguage] || '';
        const editor = document.getElementById('code-editor');
        editor.textContent = sample;
        this.highlightCode();
    }

    /**
     * Get plain text content from editor
     */
    getEditorText() {
        const editor = document.getElementById('code-editor');
        return editor.textContent || '';
    }

    /**
     * Highlight the code in the editor
     */
    highlightCode() {
        const editor = document.getElementById('code-editor');
        const text = this.getEditorText();

        if (!text.trim()) {
            return;
        }

        // Save cursor position
        const selection = window.getSelection();
        const range = selection.rangeCount > 0 ? selection.getRangeAt(0) : null;
        let cursorOffset = 0;
        
        if (range) {
            const preCaretRange = range.cloneRange();
            preCaretRange.selectNodeContents(editor);
            preCaretRange.setEnd(range.endContainer, range.endOffset);
            cursorOffset = preCaretRange.toString().length;
        }

        try {
            const highlighted = this.colorer.highlight(text, this.currentLanguage);
            editor.innerHTML = highlighted;
            this.updateInfo(`Highlighted ${text.split('\n').length} lines using ${this.currentLanguage} scheme`);

            // Restore cursor position
            if (cursorOffset > 0) {
                this.setCursorPosition(editor, cursorOffset);
            }
        } catch (error) {
            console.error('Highlighting error:', error);
            editor.textContent = text;
            this.updateInfo(`Error: ${error.message}`, 'error');
        }
    }

    /**
     * Set cursor position in the editor
     */
    setCursorPosition(element, offset) {
        try {
            const range = document.createRange();
            const selection = window.getSelection();
            
            let currentOffset = 0;
            const walker = document.createTreeWalker(
                element,
                NodeFilter.SHOW_TEXT,
                null,
                false
            );

            let node;
            while (node = walker.nextNode()) {
                const nodeLength = node.textContent.length;
                if (currentOffset + nodeLength >= offset) {
                    range.setStart(node, offset - currentOffset);
                    range.collapse(true);
                    selection.removeAllRanges();
                    selection.addRange(range);
                    return;
                }
                currentOffset += nodeLength;
            }

            // If we couldn't find the exact position, set to end
            range.selectNodeContents(element);
            range.collapse(false);
            selection.removeAllRanges();
            selection.addRange(range);
        } catch (e) {
            // Silently fail if cursor positioning doesn't work
            console.debug('Could not restore cursor position:', e);
        }
    }

    /**
     * Apply the selected theme
     */
    applyTheme() {
        document.body.className = `theme-${this.currentTheme}`;
        this.updateInfo(`Applied theme: ${this.currentTheme}`);
    }

    /**
     * Update information panel
     */
    updateInfo(message, type = 'info') {
        const infoContent = document.getElementById('info-content');
        const timestamp = new Date().toLocaleTimeString();
        const messageHTML = `<p class="${type}"><strong>[${timestamp}]</strong> ${message}</p>`;
        infoContent.innerHTML = messageHTML + infoContent.innerHTML;
        
        // Keep only last 5 messages
        const messages = infoContent.querySelectorAll('p');
        if (messages.length > 5) {
            for (let i = 5; i < messages.length; i++) {
                messages[i].remove();
            }
        }
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
    const app = new ColorerApp();
    await app.init();
});
