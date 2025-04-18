# GPT Prompt Tiles / Prompt Library
Date: 2025-04-01

**Project Overview**
 This application is a locally hosted web interface built with HTML, JavaScript, and CSS. It allows users to execute preconfigured GPT prompts by selecting dynamic tiles. Tile data is loaded from an external JavaScript file, and the interface features a real-time fuzzy search with highlighted matches. The design is inspired by Duolingo, offering pleasant animations, rounded corners, and a responsive flex layout. Each tile uses a prompt template that defines static instructions combined with interactive HTML form fields.

**Core Components**
 HTML (index.html) defines the overall structure of the application, links to the CSS and JavaScript files, and includes containers for the search bar and dynamic tiles.
 CSS (style.css) provides a Duolingo-inspired design with vibrant colors, smooth transitions, and a responsive flex layout that adapts the number of tiles per row based on the viewport width.
 JavaScript is divided into two main files:
 • The Data File (data.js) exports an array of tile objects. Each tile object includes properties such as title, description, icon, category, and prompt template. The prompt template is a formatted string that combines fixed prompt instructions with embedded markers that designate where interactive HTML form fields should be rendered.
 • The Main Script (app.js) dynamically loads and renders the tile data, implements fuzzy search with highlighted matching text, and manages user interactions. When a tile is submitted, the prompt template is processed to insert the user’s input into the appropriate marker, the resulting prompt is URL-encoded, and a link is formatted and opened in a new tab.

**User Interface & Experience**
 The Search Bar is located at the top of the page and provides instant fuzzy search filtering with highlighted matches in tile titles, descriptions, or categories.
 Dynamic Tiles are arranged in a responsive flex layout with multiple tiles per row based on the screen width. Each tile displays key elements including an icon, title, category label, and a preview of the prompt template. The tile also incorporates an interactive user input field generated from the prompt template markers and a submit button. Animated transitions and smooth interactions enhance the overall user experience.

**Prompt Template Specification**
 Each tile utilizes a prompt template—a formatted string that contains both fixed text and embedded markers. These markers indicate where interactive HTML form fields (such as textareas) should be rendered and include parameters such as placeholder text, number of rows, and width. The marker syntax is similar to string formatting in languages like C#, providing clarity and flexibility. When processed, the markers are replaced by the corresponding HTML elements, merging static prompt instructions with dynamic user input.

**Tile Interaction Flow**
 Users type into the Search Bar to filter tiles in real time using a fuzzy search algorithm, with matching text highlighted. After selecting a tile, users enter input into the dynamically generated form field within the tile. When the submit button is clicked (labeled with text such as “Run Prompt”), the application concatenates the fixed prompt text with the user’s input (inserted at the marker location), URL-encodes the resulting prompt, and constructs a URL in the following format:
 `https://chatgpt.com/?q=URL_ENCODED_PROMPT`
 This URL is then opened in a new tab (using a target attribute set to `_blank`).

**Data Record Example**

```javascript
{
  title: "Grammar Correction",
  description: "Correct the grammar of your text while preserving its style.",
  icon: "📝",
  category: "Editing",
  promptTemplate: "Please correct the grammar in the following text:\n[[[component=textarea, name=inputText, placeholder=\"Enter your text here\", rows=5, width=\"100%\"]]]\nThank you."
}
```

**Tile Visual Appearance Details**
 Within each tile, the title is displayed prominently at the top as the primary identifier for the prompt. An icon is positioned on the left side, providing a visual cue that complements the title. Adjacent to the title and icon, a category label is shown with a distinct background to clearly differentiate it from other content. Below these elements, a preview of the prompt template is displayed, indicating that additional interactive input is expected. The interactive form field—generated from the prompt template marker—is seamlessly integrated into the tile layout, maintaining a left-aligned, consistent visual structure. A submit button, labeled “Run Prompt” (or similar), is provided for user action. When activated, this button constructs a URL in the format `https://chatgpt.com/?q=...` (with the ellipsis replaced by the URL-encoded combined prompt and user input) and opens the link in a new browser tab.

This specification provides all the necessary details and visual guidelines to ensure a clear, unambiguous implementation.



