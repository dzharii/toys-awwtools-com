# Prompt Library

2025-04-01

## Overview

The Prompt Library is a locally hosted web application built with HTML, CSS, and JavaScript. It provides users with an interactive interface to execute pre-configured GPT prompts via dynamic tiles. The application features real-time fuzzy search, inline prompt composition, and smooth animations for a seamless user experience.

## Main Features

- **Dynamic Prompt Tiles:**
   Each tile displays a unique prompt with an icon, title, description, and a preview of the prompt template.
- **Real-Time Fuzzy Search:**
   Filter prompts by title, description, or category. Matching text is highlighted to help you quickly locate desired prompts.
- **Inline Prompt Composition:**
   Interactive form fields are embedded directly within the prompt text. This allows you to view the complete prompt while entering your input.
- **Prompt Execution:**
   When a prompt is submitted, the static text is combined with your input, URL-encoded, and then opened in a new browser tab, directing you to ChatGPT.

## Project Structure

- **index.html:**
   The main HTML file that sets up the overall layout and structure of the application.
- **style.css:**
   Provides a Duolingo-inspired design with responsive flex layouts, vibrant colors, and smooth transitions.
- **data.js:**
   Contains an array of prompt tile objects. Each object includes properties such as title, description, icon, category, and the prompt template.
- **app.js:**
   Implements the dynamic rendering of tiles, inline form field generation from prompt templates, fuzzy search functionality, and prompt processing.

## How to Add New Prompts in data.js

To add new prompts, update the `data.js` file by appending a new object to the `promptTiles` array. Each prompt object should include the following properties:

- **title:**
   The name of the prompt.

- **description:**
   A brief explanation of what the prompt does.

- **icon:**
   An emoji or icon representing the prompt.

- **category:**
   A category label used for organizing the prompt.

- **promptTemplate:**
   A string that combines static text with inline interactive markers. Use the marker syntax below to define interactive form fields:

  ```
  [[[component=<component>, name=<name>, placeholder="<placeholder>", rows=<number>, width="<width>"]]]
  ```

  - **component:**
     The type of input component. Supported components are `textarea` and `input`.
  - **name:**
     The identifier for the input field.
  - **placeholder:**
     The placeholder text for the input field.
  - **rows:**
     *(Optional)* The number of rows for a textarea. If not specified, the default is 3.
  - **width:**
     *(Optional)* The CSS width of the input field (e.g., "100%").

**Example Prompt Object:**

```js
{
  title: "Grammar Correction",
  description: "Correct the grammar of your text while preserving its style.",
  icon: "📝",
  category: "Editing",
  promptTemplate: "Please correct the grammar in the following text. Preserve the style and tone of the original writing:\n\n[[[component=textarea, name=inputText, placeholder=\"Enter your text here\", rows=5, width=\"100%\"]]]\n\nReturn only the corrected version without explanations."
}
```

Simply add your new prompt object to the `promptTiles` array in `data.js`, and the application will automatically render a new tile with your prompt.

## Usage

1. Open `index.html` in a modern web browser.
2. Use the search bar to filter available prompts.
3. Enter your input directly into the inline fields within the prompt.
4. Click the "Run Prompt" button to process your input and open the final URL in a new tab.

## Compatibility

The application is designed to work on all modern web browsers and adapts to various screen sizes using responsive design techniques.