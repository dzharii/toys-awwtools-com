# Clipboard Image Stack
Date: 2024-08-04

🚀 **Introducing Clipboard Image Stack: Paste & Play with Your Clipboard Images!** 🎨

Are you tired of saving images manually from your clipboard? We've got you covered with our new web app, **Clipboard Image Stack**! 🎉

Simply **paste images using Ctrl+V**, and voilà—they appear in a neat stack! But wait, there’s more! You can:
- **Add a stylish border** to your images with just a click.
- **Apply the Riemersma dithering effect** for a retro pixel-art look! 🎨
- **Preview images in full size** by clicking on them, opening in a new tab.

This intuitive, minimalist app is perfect for quick image edits and organizing your clipboard images. No installation required—just open the link and start pasting!

Dive in and let your creativity flow! 🌟

---

## Technical Details

**Project Overview:**

Clipboard Image Stack is a client-side web application that allows users to paste images directly from the clipboard into a browser-based stack. It supports basic image manipulations like adding borders and applying the Riemersma dithering effect. The app also provides an option to view images in full size by opening them in a new tab.

**Technical Architecture:**

1. **HTML Structure:**
   - The HTML is organized into three main sections: header, main content area, and footer. The main content area contains a stack (`div#image-stack`) where the pasted images are displayed in rows.

2. **CSS Styling:**
   - The application uses a clean and minimalistic design with CSS. The stack of images is styled to ensure responsiveness and proper alignment. Action buttons are vertically aligned within a control panel, offering intuitive image manipulation options.

3. **JavaScript Functionality:**
   - **Event Listeners:** The app uses a `DOMContentLoaded` event to initialize, and a `paste` event to capture images from the clipboard.
   - **Local Storage:** Images are stored in the browser's local storage, ensuring persistence across sessions. The stack is limited to the last 20 images, automatically removing the oldest when the limit is exceeded.
   - **Image Manipulation:**
     - **Border Addition:** This feature adds a 10-pixel blue border around the image using the canvas API. The modified image is then reinserted at the top of the stack.
     - **Riemersma Dithering:** The Riemersma algorithm is implemented to dither images, creating a pixel-art effect. This transformation also uses the canvas API, manipulating image data at the pixel level.
       - [Ditherpunk — The article I wish I had about monochrome image dithering — surma.dev](https://surma.dev/things/ditherpunk/) surma.dev
       - [Riemersma dither](https://www.compuphase.com/riemer.htm) compuphase.com
   
4. **Image Interaction:**
   - Clicking on an image opens it in a new tab, allowing users to view the full-size version.

**Key Implementation Highlights:**

- **Canvas API:** Central to image manipulation tasks, ensuring efficient and flexible handling of image data.
- **Local Storage Management:** Optimizes the user experience by persisting data and managing the stack limit.
- **Modular Design:** Each feature (border, dither) is encapsulated in its own function, promoting clean and maintainable code.

This project demonstrates a practical use of modern web technologies, providing a seamless experience for end-users while offering technical robustness under the hood. It's an excellent example of client-side capabilities in managing and manipulating multimedia content directly in the browser.

Feel free to explore the code and experiment with the features. We hope you find this tool both fun and useful!
