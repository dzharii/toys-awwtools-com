# kitchen timer tiles
Date: 2025-04-02

**Project Overview**  
This application is a locally hosted web interface built with HTML, JavaScript, and CSS. It provides a dynamic, Duolingo-inspired interface where users can manage kitchen timer tiles. Each timer tile allows the user to start, pause, reset, and edit a countdown timer. Tile data is loaded from an external JavaScript file and merged with user modifications stored in local storage. The application supports real-time fuzzy search for filtering tiles and includes global settings for various animations, notifications, and time display formats. Additionally, each tile supports editable web links, allowing users to associate relevant URLs with each timer.

**Core Components**  
HTML (index.html) defines the overall page structure, includes references to the CSS and JavaScript files, and provides containers for the search bar, timer tiles, and the global settings panel.  
CSS (style.css) implements the Duolingo-inspired design with vibrant colors, smooth transitions, rounded corners, and a responsive flex layout that adapts the number of tiles per row based on the viewport width.  
JavaScript is organized into several files:  
• The Data File (data.js) exports an array of predefined timer tile objects. Each object contains properties such as a unique ID, title, description, icon, category, initial timer value, and an indicator of its origin (predefined or modified).  
• The Main Script (app.js) loads the predefined tiles from data.js, merges them with any modifications stored in local storage, and renders the timer tiles. It implements fuzzy search functionality, handles tile editing (including start, pause, reset, and value changes for the countdown timer), manages editable links for each tile, and saves updates to local storage. It also provides export functionality to merge and download the final JSON data.  
• A custom utility function is included to generate unique IDs for tiles, ensuring consistency across sessions without relying on built-in browser methods.

**User Interface & Experience**  
The Search Bar is located at the top of the page and provides real-time fuzzy search filtering with highlighted matches in tile titles, descriptions, or categories.  
Timer tiles are displayed in a responsive flex layout, with multiple tiles per row based on the screen width. The interface features smooth animations and a clean, engaging appearance that emphasizes usability and playful interactivity.

**Timer Tile Specification**  
Each timer tile includes the following elements:  
- **Title:** Displayed prominently at the top as the primary identifier for the timer.  
- **Icon:** Positioned on the left side to provide a visual cue that complements the title.  
- **Category Label:** Shown adjacent to the title and icon with a distinct background, indicating the tile’s category.  
- **Description:** A brief explanation or details about the timer.  
- **Countdown Timer:** Displayed in ISO format (hour:minute:second) with support for 24-hour timing. A global settings toggle allows the user to switch between 24-hour and 12-hour formats.  
- **Timer Controls:**  
  - **Start Button:** Begins the countdown.  
  - **Pause Button:** Pauses the countdown.  
  - **Reset Button:** Resets the timer to its initially set value.  
- **Editable Timer Value:** When in edit mode, the user can modify the timer’s value directly.  
- **Editable Links:**  
  - At the bottom of the tile, a list of web links is displayed.  
  - In read-only mode, each link is presented as a clickable hyperlink (displayed with its title).  
  - In editing mode, the links are presented as a list where each link is represented by two text boxes: one labeled "Title" for the link title and another labeled "URL" for the HTTPS link.  
  - Users can add new links or remove existing ones.  
  - Each link is saved as an object with properties such as link title, link URL, and the date when the link was last updated.  
- **Edit Button:** Replaces the previous submit button. When clicked, it toggles the tile between an editable state (allowing modifications to the timer value and links) and a read-only state.  
- **Save Indicator:** A visual marker or small text indicates whether the tile is the original from data.js or has been modified and saved to local storage.  
- **Completion Animation:** When the countdown reaches zero, the tile performs a light, playful shake animation. Additionally, the browser tab’s title animates (or displays an emoji) to attract the user's attention when the timer completes.

**Global Settings**  
A settings panel is accessible via a settings bar at the top of the page, providing options to:  
- Toggle between 24-hour and 12-hour display formats for countdown timers.  
- Enable or disable the shake animation when a timer completes.  
- Enable or disable the title bar animation for notifications.  
- Enable or disable web page notifications.  
- All settings are saved to local storage to persist user preferences across sessions.

**Data Handling and Export Functionality**  
- On initialization, the application loads predefined timer tiles from data.js and merges them with any modifications stored in local storage. If a tile has been edited, the modified version overrides the corresponding tile from data.js.  
- Each tile includes a unique ID generated by a custom utility function, ensuring consistency across sessions.  
- The application provides an export feature that merges the current state of timer tiles (combining data.js with local storage modifications, including any updated links) into a final JSON file that the user can download. This export captures all modifications and user settings accurately.

This complete technical specification provides all necessary details and guidelines to ensure a clear, unambiguous implementation.

============
to better understand what I want, here is the user story:
Ellison had always taken pride in her culinary experiments, but managing her busy kitchen used to be a source of constant stress. One day, while browsing for solutions online, she discovered a new timer app—a locally hosted, Duolingo-inspired tool designed to bring order and delight to her cooking routine.

From the moment Ellison launched the app on her sleek tablet, she was struck by its vibrant, intuitive design. The search bar at the top immediately caught her eye, allowing her to quickly filter through a collection of beautifully designed timer tiles. Each tile, with its rounded corners, playful animations, and clear layout, seemed like a mini dashboard dedicated to a specific kitchen task.

Her first stop was the “Pasta Perfection” tile. At a glance, the tile showcased a cheerful icon and a bold title, while a distinct category label, “Cooking,” adorned its header. Below, a brief description promised a countdown timer set in an ISO format—hours, minutes, and seconds ticking steadily. With a satisfying tap, the tile expanded to reveal its full functionality: an interactive timer with clearly labeled start, pause, and reset buttons. Ellison quickly adjusted the timer value to match her recipe’s exact boiling time, and with one press of the start button, the countdown began.

But what truly fascinated Ellison was a new feature that set this app apart from any timer she had used before. At the bottom of each tile, she noticed an area reserved for web links—editable links that could be tailored to her needs. In read-only mode, these links appeared as clickable titles, offering direct access to helpful online resources. However, when she switched the tile into edit mode by tapping the “Edit” button, the interface transformed. Two neat text boxes appeared for each link: one labeled “Title” and the other labeled “URL.” 

Ellison’s eyes lit up as she began to customize her “Pasta Perfection” tile further. She added a link to her favorite pasta recipe website, entering a descriptive title and the corresponding HTTPS URL. In another pair of boxes, she included a link to a quick instructional video on how to perfect al dente pasta. Each link was automatically stamped with the date of her update, a small detail that made her feel in complete control of her culinary toolkit. A subtle indicator on the tile confirmed that these customizations were now safely stored in the app’s local storage, merging seamlessly with the original data.

As the timer ticked down, Ellison noticed the app’s responsive behavior. When the countdown reached zero, the “Pasta Perfection” tile performed a light, playful shake—a delightful animation reminiscent of a favorite mobile game. At the same moment, the browser tab title began to animate with a cheerful emoji, ensuring that even if Ellison was momentarily distracted, she would quickly catch the reminder that her timer had completed.

Throughout her busy day, Ellison toggled the global settings with ease. With just a click, she switched between 24-hour and 12-hour time formats, and she fine-tuned the notification settings—choosing whether to enable the shake animation, the tab title animation, and even browser notifications. These settings, like all her customizations, were persistently saved, ensuring that her personalized experience would greet her every time she opened the app.

By the end of the week, Ellison’s kitchen had transformed from a chaotic battleground into a well-orchestrated symphony of culinary precision. The app not only helped her manage her timers with intuitive controls and engaging animations, but it also provided a space to store valuable links—recipes, instructional videos, and tips—that enriched her cooking journey. With the ability to edit, save, and export her personalized timer tiles as a merged JSON file, Ellison felt empowered and organized. Each feature of the app played its part in turning daily challenges into moments of joy and creativity, making her kitchen a place of effortless innovation and delight.



