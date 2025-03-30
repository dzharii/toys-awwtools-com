# Concatenated String Formatter Specification
Date: 2025-03-30

Overview  
The Concatenated String Formatter is a single-page web application built with HTML, CSS, and JavaScript. Its primary purpose is to convert large blocks of text into a formatted series of string literals concatenated together for different programming languages. This tool is designed to help developers format documentation, messages, or SQL queries into code-friendly string literals.

Functional Requirements  
Input Area:  
• A standard text area where users can copy, paste, or type large blocks of text.  
• The tool must respect and preserve all line breaks from the original text.  

Real-Time Transformation:  
• As the user edits the input text, the output area updates instantly with the formatted result.

Output Area:  
• Displays the transformed text in a read-only text area.  
• Each original line or segment is processed to include a configurable number of indentation spaces, wrapped in configurable quote characters, and appended with a configurable concatenation operator.  
• The final line will not have the concatenation operator unless a final separator is configured.

Configuration Settings  
• Indentation: A text input that allows the user to set the number of spaces or tabs to appear at the beginning of each output line.  
• Quote Style: A text input for specifying the quote character (e.g., single quote, double quote, backtick) used to wrap each string literal. The default is a double quote.  
• Maximum Line Width: A number input for setting the maximum number of characters per output line. If a formatted line exceeds this limit, the text is wrapped or split while preserving any original line breaks. A default value (e.g., 100) should be provided.  
• Concatenation Operator: A text input for specifying the operator (e.g., +, ., or none) used to concatenate string literals.  
• Final Separator: A text input for specifying an optional separator (such as a semicolon) to be appended to the final line. The default may be a semicolon or an empty string.

User Interface and Experience  
• A top configuration strip spanning the full width of the page contains all configuration controls (all as simple text or number inputs). Changes to any configuration setting will trigger an immediate update to the output.  
• The main content area is split into two equally sized vertical halves below the configuration strip.  
 – Left Panel: Contains a title label (“Original Text”) and a “Copy to Clipboard” button aligned to the right. Below the title is the large editable text area for input.  
 – Right Panel: Contains a title label (“Formatted Output”) and a “Copy to Clipboard” button aligned to the right. Below the title is the read-only text area displaying the formatted result.  
• The design should be minimalistic, responsive (using CSS Flexbox), and visually clean.

Technical Implementation Details  
• Frontend Technologies:  
 – HTML: A single HTML page with div elements for the configuration strip and the two main panels.  
 – CSS: Use Flexbox for layout and ensure a responsive design that adapts to different screen sizes.  
 – JavaScript:  
  • Attach event listeners to the input text area and configuration inputs to capture changes in real time.  
  • Process the text by splitting it into lines, then for each line apply the configured indentation, wrap it in the selected quotes, and append the concatenation operator (except on the final line, unless a final separator is specified).  
  • Ensure that each output line conforms to the maximum line width, wrapping or splitting as necessary while preserving original line breaks.  
  • Implement debounce handling for performance on very large texts.  
  • Validate configuration inputs (for example, the maximum line width must be a positive number) and display clear error messages in a dedicated error strip below the configuration strip if any issues are detected.

Additional Considerations  
• Provide clear, educational error messages in a dedicated error display area below the configuration strip when configuration inputs are invalid.  
• Include “Copy to Clipboard” buttons above both the input and output panels that copy the respective text area’s content with one click.  
• Use default configuration values suited for common programming languages (e.g., JavaScript, C++) so that the tool is immediately useful without requiring extensive configuration.

This specification is intended to provide clear, detailed guidance for implementation without further clarification.



