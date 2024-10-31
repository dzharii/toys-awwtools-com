# Emoji Tab Marker Extension
Date: 2024-10-30

The **Emoji Tab Marker** is a browser extension designed to enhance your browsing experience by allowing you to visually mark and organize your open tabs using emojis. This tool provides a quick and intuitive way to identify important or frequently visited pages at a glance, improving productivity and navigation efficiency.

---

**Key Features:**

- **Floating Draggable Button:**
  - A small, movable button appears on every webpage.
  - It is **draggable**, enabling you to position it anywhere within the browser window.
  - The button remains fixed relative to the browser window, so it stays in place even when you scroll.

- **Emoji Selection Dropdown:**
  - Clicking the floating button reveals a dropdown menu containing a list of emojis.
  - The emojis are predefined and include options like "😀", "🚀", "📚", "✔️", "❌", "🔥", "💡", and "⚠️".
  - An additional "No Emoji" option allows you to reset the page title to its original state.

- **Title Modification:**
  - Selecting an emoji prepends it to the page's title, which updates the tab's display in your browser.
  - Only one emoji is allowed per page to keep the tab title clean and readable.
  - If the selected emoji is already present, it won't be added again, preventing duplicates.

- **Persistent Emoji Markers:**
  - The extension uses `chrome.storage.local` to save your emoji selection for each specific page.
  - When you revisit or reload the page, the extension restores the emoji in the title based on your previous selection.
  - The storage key is based on the page's URL (origin and pathname), ensuring that the emoji is associated with that specific page.

- **Easy Reset and Cleanup:**
  - Selecting the "No Emoji" option removes the emoji from the page title.
  - The extension also cleans up by removing the associated data from local storage, leaving no residual data.

---

**Technical Specifications:**

- **Manifest Version 3 Compliance:**
  - The extension is built following the latest Manifest V3 standards, ensuring better security and performance.
  - Uses modern web technologies like HTML5, CSS3, and ECMAScript 6+.

- **Modular and Maintainable Code:**
  - The codebase is organized into separate files:
    - `manifest.json` for configuration.
    - `emojis.js` for the emojis array.
    - `content_script.js` for the main functionality.
    - `content_script.css` for styling.
  - Functions are well-documented using JSDoc, explaining their purpose, parameters, and return values.

- **User Interface and Experience:**
  - The floating button and dropdown are styled to be unobtrusive yet accessible.
  - High `z-index` values ensure the elements appear above page content.
  - The draggable feature allows personalization of the button's position.

- **Robust Event Handling:**
  - Event listeners are carefully managed to prevent memory leaks.
  - The extension adds and removes event listeners appropriately, ensuring optimal performance.

- **Security Best Practices:**
  - The extension does not access or modify sensitive page content.
  - Permissions are minimized, requesting only what's necessary (`storage` and content scripts on all URLs).
  - Data is stored locally and is not transmitted externally, preserving user privacy.

---

**Usage Instructions:**

1. **Installation:**
   - Load the extension into your browser's developer mode or install it from the appropriate extension store if available.

2. **Using the Floating Button:**
   - On any webpage, locate the small floating button.
   - Drag it to your preferred position within the browser window.

3. **Selecting an Emoji:**
   - Click the floating button to open the emoji dropdown menu.
   - Choose an emoji from the list to mark the page.
   - The selected emoji will appear in the tab title immediately.

4. **Removing an Emoji:**
   - To remove the emoji, click the floating button again.
   - Select the "No Emoji" option from the dropdown.
   - The tab title will revert to its original state, and the selection is cleared from storage.

---

**Benefits:**

- **Improved Tab Management:**
  - Quickly identify and switch between important tabs using visual cues.
  - Customize tabs based on tasks, priorities, or categories.

- **Enhanced Productivity:**
  - Reduce time spent searching through multiple open tabs.
  - Maintain focus by easily recognizing pages related to ongoing work.

- **Personalization:**
  - Tailor your browsing experience by selecting emojis that resonate with you.

---

**Potential Use Cases:**

- **Research and Study:**
  - Mark reference materials with a "📚" emoji.
  - Highlight important findings with a "💡" emoji.

- **Work and Projects:**
  - Indicate active tasks with a "🚀" emoji.
  - Flag issues or errors with a "⚠️" emoji.

- **Personal Browsing:**
  - Save recipes, articles, or shopping pages with relevant emojis for easy return visits.

---

**Conclusion:**

The Emoji Tab Marker extension offers a simple yet powerful way to enhance your browsing experience. By integrating visual markers into tab titles, it streamlines navigation and boosts efficiency. Its user-friendly design and adherence to modern web standards make it a valuable tool for anyone looking to improve their online workflow.

---

**Note:** This extension is designed with security and privacy in mind. It operates entirely within your browser, and no data is sent or received from external servers. Your emoji selections are stored locally and are associated only with your browsing session.



