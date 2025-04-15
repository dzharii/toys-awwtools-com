window.addEventListener("DOMContentLoaded", function () {
  // Grid configuration
  const rowsRange = document.getElementById("rowsRange");
  const colsRange = document.getElementById("colsRange");
  const rowsValue = document.getElementById("rowsValue");
  const colsValue = document.getElementById("colsValue");
  const emojiGrid = document.getElementById("emojiGrid");

  // Initial values
  let rows = parseInt(rowsRange.value);
  let cols = parseInt(colsRange.value);
  let emojiCanvases = [];

  // Update row display and grid when slider changes
  rowsRange.addEventListener("input", () => {
    rows = parseInt(rowsRange.value);
    rowsValue.textContent = rows;
    updateGridLayout();
  });

  // Update column display and grid when slider changes
  colsRange.addEventListener("input", () => {
    cols = parseInt(colsRange.value);
    colsValue.textContent = cols;
    updateGridLayout();
  });

  // Generate grid based on rows and columns
  function updateGridLayout() {
    // Clear existing grid
    emojiGrid.innerHTML = "";
    emojiCanvases = [];

    // Update grid CSS
    emojiGrid.style.gridTemplateColumns = `repeat(${cols}, 32px)`; // Updated to 32px

    // Create new grid of canvases
    for (let i = 0; i < rows * cols; i++) {
      const canvas = document.createElement("canvas");
      canvas.width = 32; // Updated to 32
      canvas.height = 32; // Updated to 32
      const ctx = canvas.getContext("2d");
      const emojiDrawer = new CanvasEmoji(ctx);

      emojiDrawer.drawRandomEmoji();

      // Create a link element wrapping the canvas
      const link = document.createElement("a");
      link.target = "_blank";

      // Generate the ChatGPT link dynamically
      getCanvasBase64(canvas).then((base64Image) => {
        const prompt = `Use image tool! Create masterpiece canvas in the gallery from this base64-encoded PNG; very fancy elite painting, elite gallery. Using python, Decode the encoded png. You will save it as /mnt/data/base_image.png.  Then use image tool to generate image using this file. Encoded PNG: ${base64Image}`;
        link.href = `https://chatgpt.com/?q=${encodeURIComponent(prompt)}`;
      });

      link.appendChild(canvas);
      emojiGrid.appendChild(link);
      emojiCanvases.push({ canvas, emojiDrawer });
    }
  }

  // Helper function to get base64 content of a canvas
  function getCanvasBase64(canvas) {
    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result.split(",")[1]); // Extract base64 content
        reader.readAsDataURL(blob);
      });
    });
  }

  // Regenerate all emojis in the grid
  document.getElementById("regenerateBtn").addEventListener("click", () => {
    emojiCanvases.forEach(({ emojiDrawer }) => {
      emojiDrawer.drawRandomEmoji();
    });
  });

  // Theme toggle logic
  const themeToggle = document.getElementById("themeToggle");
  themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark-theme");
    if (document.body.classList.contains("dark-theme")) {
      themeToggle.textContent = "Switch to Light Theme";
    } else {
      themeToggle.textContent = "Switch to Dark Theme";
    }
  });

  // Initialize the grid
  updateGridLayout();
});
