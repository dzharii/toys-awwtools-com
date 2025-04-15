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
    emojiGrid.style.gridTemplateColumns = `repeat(${cols}, 64px)`;

    // Create new grid of canvases
    for (let i = 0; i < rows * cols; i++) {
      const canvas = document.createElement("canvas");
      canvas.width = 64;
      canvas.height = 64;
      const ctx = canvas.getContext("2d");
      const emojiDrawer = new CanvasEmoji(ctx);

      emojiDrawer.drawRandomEmoji();
      emojiGrid.appendChild(canvas);
      emojiCanvases.push({ canvas, emojiDrawer });
    }
  }

  // Regenerate all emojis in the grid
  document.getElementById("regenerateBtn").addEventListener("click", () => {
    emojiCanvases.forEach(({ emojiDrawer }) => {
      emojiDrawer.drawRandomEmoji();
    });
  });

  // Download all emojis as a tar archive
  document.getElementById("downloadBtn").addEventListener("click", async () => {
    const tar = new TarArchive();

    // Add each emoji as a separate file to the archive
    for (let i = 0; i < emojiCanvases.length; i++) {
      const { emojiDrawer } = emojiCanvases[i];
      const pngData = await emojiDrawer.getImageDataAsUint8Array();
      tar.addFile(`emoji_${i + 1}.png`, pngData);
    }

    // Create and trigger download
    const blob = tar.getBlob();
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "emoji_grid.tar";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  });

  // Initialize the grid
  updateGridLayout();
});
