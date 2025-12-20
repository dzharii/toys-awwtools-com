2025-12-20
A00-00 Document purpose and scope

This document describes the user interface and user experience of the application from a practical, user-centered perspective. It focuses on how the page looks, how controls are arranged, and how a user navigates the interface to solve real problems. It complements the technical specification and does not restate internal architecture unless needed for clarity. The emphasis is on concrete usage scenarios described narratively, showing intent, action, and outcome.

B00-00 Overall page layout and visual structure

The application is a single-page layout with a vertical flow designed to work on both desktop and mobile screens. The page is divided into clear functional regions stacked from top to bottom.

At the top of the page is a compact control header. This header contains the formatted paste toggle, the insertion mode selector, and the profile selector. These controls are always visible without scrolling on typical screen sizes. The header visually communicates the current mode of the editor, especially whether formatted paste is enabled or disabled.

Below the header is the pipeline configuration area. This area shows the currently active pipeline as a vertical list of steps. Each step is presented as a compact row with the step name, its configuration controls, and buttons to reorder or remove the step. An add-step control appears at the end of the list. The pipeline area is visually separated from the editor to make it clear that it configures behavior rather than content.

Below the pipeline area is the main editor. The editor occupies the majority of the vertical space. It is a plain text editing surface with minimal visual decoration. It is designed to feel stable and predictable, similar to a simple notes app, not like an IDE.

Optionally, below or overlaid near the editor is a collapsible preview area. This preview shows the last paste operation, displaying the raw clipboard text and the transformed output. On small screens, this preview is hidden by default and can be expanded when needed.

C00-00 Control header details

The formatted paste toggle is the most prominent control in the header. It is a binary switch labeled clearly, for example “Formatted paste ON” and “Formatted paste OFF”. The visual style changes noticeably between states so the user can see the current mode at a glance. This toggle directly answers the question “will my paste be modified right now”.

Next to the toggle is the insertion mode selector. This is a dropdown or segmented control that lists available insertion modes such as insert at cursor, append to end, insert on new line, delimiter-prefixed insertion, and delimiter-suffixed insertion. The selected mode reflects how the transformed text will be placed into the editor.

Also in the header is the profile selector. This control allows the user to load a predefined profile. Profiles are named in a way that reflects intent, such as “SQL comma list” or “JSON string item”. Selecting a profile immediately updates the pipeline editor to show the steps defined by that profile.

The header is intentionally compact. It does not contain advanced settings or rarely used controls. Its purpose is to let the user confirm the current editing mode before pasting.

D00-00 Pipeline configuration UI

The pipeline configuration area visually represents the transformation flow from clipboard input to final output. Each step appears as a small card or row with a clear label, such as “Trim”, “Case transform”, or “Template wrap”.

Within each step, only the configuration relevant to that step is shown. For example, the case transform step shows a selector for lowercase, uppercase, snake_case, kebab-case, camelCase, or PascalCase. The template wrap step shows a text input for the template string and may include a small helper hint showing available placeholders like ${value} and ${json}.

Steps are ordered vertically from top to bottom. The visual order matches execution order. Up and down buttons allow changing the order. Removing a step is a single action with a clear affordance.

The add-step control opens a small menu listing available step types. This list is short by design to avoid feature overload. Adding a step appends it to the pipeline, after which it can be reordered.

When a predefined profile is loaded, the pipeline editor populates with its steps. From the user’s perspective, the profile feels like a starting point, not a locked configuration. The user can immediately modify steps or reorder them.

E00-00 Editor appearance and behavior

The editor is a plain text area with no syntax highlighting. It supports standard text editing interactions such as selection, cursor movement, and undo.

The editor visually reflects focus clearly. When the user taps or clicks into it, it becomes the active area for paste operations.

The editor does not show formatting hints, placeholders, or hidden characters. The goal is to keep attention on the text being built, not on editor features.

F00-00 Preview area behavior

The preview area shows the most recent paste operation. It displays two sections: the raw clipboard content and the transformed output. This gives the user confidence that the pipeline is doing what they expect.

The preview updates only when a paste occurs. It does not update on every keystroke. This reinforces that the preview is about paste behavior, not general editing.

The preview can be collapsed. On mobile, it is hidden by default to preserve screen space. When expanded, it appears below the editor or as a modal-style overlay.

G00-00 Usage scenario 1: building a SQL select list from Excel

The user is working on a SQL query and needs to build a SELECT clause with many column names. The column names already exist in an Excel spreadsheet.

The user opens the application in a browser. The page loads and restores their previous session. The formatted paste toggle is ON, which the user confirms by looking at the header.

The user selects a predefined profile named “SQL comma prefix”. The pipeline editor updates to show a simple pipeline, possibly with a trim step and no other transformation. The insertion mode automatically switches to delimiter-prefixed insertion with the delimiter set to comma and space.

The user clicks into the editor and types the beginning of a SQL query, for example “SELECT id”.

Next, the user switches to Excel, selects a cell containing a column name, and copies it.

Back in the application, the user places the cursor at the end of the editor content and pastes. Because formatted paste is enabled, the app intercepts the paste, applies the pipeline, and inserts “, column_name” into the editor.

The user repeats this copy and paste operation for multiple columns. Each paste appends a comma-prefixed column name. The user does not need to manually type commas or worry about spacing.

At one point, the user wants to paste some explanatory text without formatting. Instead of toggling formatted paste off, the user uses the raw paste bypass shortcut. The text is pasted normally.

The user accidentally refreshes the page. When it reloads, the editor content, pipeline configuration, and insertion mode are restored automatically.

H00-00 Usage scenario 2: inserting JSON string values

The user is building a JSON array manually and needs to insert string values that must be properly escaped.

The user opens the app and loads a profile named “JSON string item”. The pipeline editor shows a template wrap step configured with ${json}. The insertion mode is set to insert on new line.

The user clicks into the editor and types an opening bracket for a JSON array.

The user copies a word or phrase from another source. When pasting into the editor, the app transforms the clipboard text using JSON.stringify and inserts the quoted string on its own line.

The user continues pasting values. Each value appears as a valid JSON string, reducing the risk of syntax errors.

If the user wants to adjust formatting, for example switching to uppercase values, they add a case transform step above the template wrap step. The change applies immediately to subsequent paste operations.

I00-00 Usage scenario 3: ad hoc pipeline customization

The user does not want to use a predefined profile and instead wants a custom transformation.

The user ensures formatted paste is ON and opens the pipeline editor. They add a trim step, then a case transform step set to kebab-case, then a template wrap step with a custom template like “‘${value}’”.

The user copies text containing spaces and inconsistent casing from a document. When pasting, the app produces a clean, kebab-cased, quoted string.

The user decides the delimiter behavior is wrong. They change the insertion mode from insert at cursor to append on new line. The next paste uses the new insertion behavior without affecting existing text.

J00-00 Navigation and mental model from the user perspective

From the user’s perspective, the app has a simple mental model. The pipeline defines how pasted text is transformed. The insertion mode defines where the result goes. The formatted paste toggle defines whether this behavior is active.

The user generally configures the pipeline first, then focuses entirely on the editor and paste workflow. The UI supports this by keeping configuration visible but unobtrusive.

The user does not need to think about saving. The app continuously preserves state. The user does not need to think about files. The editor content is simply “what I am working on right now”.

K00-00 UX principles embodied in the design

The UI favors explicit state over hidden behavior. The formatted paste toggle and insertion mode are always visible.

The UI favors composition over specialization. Instead of many hardcoded scenarios, the user combines small steps.

The UI favors predictability over cleverness. Delimiter insertion does not attempt complex detection in this version. What is configured is what happens.

The UI favors recovery. Accidental refresh or navigation does not destroy work.

This document defines how a user sees and experiences the application, while the technical specification defines how it is built. Together, they describe a tool that is intentionally small, focused, and optimized for repetitive paste-driven text editing workflows.

