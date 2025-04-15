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
      emojiGrid.appendChild(canvas);
      emojiCanvases.push({ canvas, emojiDrawer });

      // Add click event to open ChatGPT link
      canvas.addEventListener("click", async () => {
        const base64Image = await getCanvasBase64(canvas);
        const prompt = `Create masterpiece canvas in the gallery from this base64 encoded PNG; very fancy elite painting, elite gallery. Encoded PNG: ${base64Image}`;
        const url = `https://chatgpt.com/?q=${encodeURIComponent(prompt)}`;
        window.open(url, "_blank");
      });
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
