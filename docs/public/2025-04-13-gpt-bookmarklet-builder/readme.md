# Bookmarklet Generator for ChatGPT Prompts — Project Specification

Date: 2025-04-13



**Project Overview**

This application is a user-friendly, browser-based tool designed to help users create custom bookmarklets that open ChatGPT with a prefilled ChatGPT prompt. A bookmarklet is a small JavaScript function stored as a browser bookmark that instantly launches ChatGPT with your chosen query. Whether you are a power user who frequently uses specific prompts or someone looking to streamline your ChatGPT experience, this tool enables you to save, customize, and quickly reuse prompts with a single click.

Users can enter their preferred prompt, customize the bookmarklet title, and choose an icon by selecting a predefined emoji. As the user types, the app automatically creates the corresponding JavaScript code and a ready-to-use bookmarklet link. This link can be easily dragged into the browser’s bookmarks bar to create a working bookmarklet without any manual copying or scripting.

The tool preserves all your settings and work across sessions. Using localStorage, the app remembers your prompt, title, selected icon, chosen foreground and background colors, and any changes you make. Whether your browser crashes or you return later, everything is restored automatically. No installations, no accounts—just an elegant interface to build personalized ChatGPT shortcuts in seconds.

*Footnotes:*

- **ChatGPT prompt:** The textual query intended for input into ChatGPT.
- **Bookmarklet:** A small JavaScript snippet stored as a browser bookmark, used to perform a task when clicked.
- **localStorage:** A browser feature used to store data persistently on the client-side.

------

**1. Core Features**

**1.1 Prompt Input**

- Provides a textarea for users to enter a ChatGPT prompt.
- Maximum character limit: 10,000 characters.
- Automatically updates the generated bookmarklet link as the user types.
- The prompt will be processed as plain text and must be properly URL encoded when passed in a URL.
- Saves the prompt to localStorage in JSON format.

**1.2 Title Input**

- Provides a single-line text input for naming the bookmarklet.
- Acceptable character set is unrestricted; maximum length is 1,000 characters.
- If the title is empty or contains invalid characters, a placeholder such as "link no name" or "prompt no name" is used.
- Updates live and is saved to localStorage.

**1.3 Icon Selector**

- Offers a predefined emoji selection input populated from a predefined list.
- The selected emoji is inserted into the icon input text box; the user may also manually edit this text box to insert their own value (such as a single letter).
- A nearby browser-native color selection control is provided for choosing the foreground and background colors, which will be applied both in the text box and in the canvas rendering.

**1.4 Favicon Generator**

- Utilizes an HTML Canvas to render the icon:
  - The canvas takes a one-character input (which may be an emoji or any other character) and applies the selected foreground and background colors.
  - If canvas rendering fails, the canvas defaults to rendering a red letter "F" on a white background.
- The generated 32x32 PNG (created from the canvas) is directly updated into the DOM by setting it as the Base64 data in the page’s `<link rel="icon">` attribute.

**1.5 Bookmarklet Generation**

- Constructs a dynamic JavaScript bookmarklet, for example:
  - `javascript:window.open('https://chat.openai.com/?q=' + encodeURIComponent(prompt));`
- The bookmarklet code is assembled and updated on every input change.
- Edge cases are handled by properly escaping input text depending on context.
- If the prompt is empty, a placeholder "null prompt" string is used in its place.

**1.6 Bookmarklet Link Output**

- Generates an `<a>` element for the bookmarklet:
  - The `href` attribute contains the generated bookmarklet code.
  - The link’s `title` and visible text are set to the user-supplied title (or the appropriate placeholder).
  - The link is styled to ensure visibility and drag-and-drop compatibility, allowing users to drag it to the browser’s bookmark bar.

**1.7 Local Storage Integration**

- All user inputs and application state are persisted in localStorage as JSON, including:
  - ChatGPT prompt
  - Bookmarklet title
  - Selected emoji
  - Chosen foreground and background colors
  - Generated favicon
- In case localStorage operations fail (e.g., if localStorage is disabled), errors are logged to the browser console, and the error is suppressed to avoid breaking the application.
- State persistence is implemented using a debounced event that saves data after the user stops typing.

**1.8 Automatic Update Behavior**

- No explicit “generate” button exists; all changes trigger instantaneous updates to outputs and state.
- The application restores full state on load using localStorage.

------

**2. Technical Components**

**2.1 HTML Structure**

- ChatGPT prompt input (textarea)
- Bookmarklet title input (text)
- Icon input text box for emoji selection
- Predefined emoji list for selection, inserted into the text box upon selection
- Browser-native color selection controls for foreground and background colors
- Preview area for generated favicon
- Output `<a>` element for the bookmarklet link
- Optional hidden textarea to display the generated JavaScript code

**2.2 JavaScript Logic**

- Event listeners for all input fields.
- LocalStorage read/write operations, with JSON formatting and debounced saving.
- Canvas rendering logic for favicon creation, including fallback rendering (red "F" on white) if rendering fails.
- Direct DOM update for the `<link rel="icon">` element using Base64 image data.
- Bookmarklet string generator that properly escapes and encodes input text.
- Functional decomposition to structure code into reusable functions using a legacy modular approach (without using modern JavaScript modules).
- Error and debug logging via the browser console.

**2.3 CSS Styling**

- Responsive design tailored for desktop only (as bookmarklets are supported on desktop only).
- Modern layout with clear visual sections and styled inputs featuring focus and validation states.
- No animations; all updates occur instantly without transitional effects.
- No external CDN is used; all assets are loaded locally.

------

**3. External Dependencies**

- No external dependencies are required for icon selection; all necessary assets are provided locally.

------

**Notes:**

- No additional documentation or unit testing is required for this project at this time.
- All key terms (e.g., ChatGPT prompt, bookmarklet, localStorage) are defined in the footnotes.

