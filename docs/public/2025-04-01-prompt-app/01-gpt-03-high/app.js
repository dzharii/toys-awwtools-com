document.addEventListener("DOMContentLoaded", () => {
  const tileContainer = document.getElementById("tileContainer");
  const searchInput = document.getElementById("searchInput");

  // Store original text for each tile to revert highlights if needed.
  const originalTileData = new Map();

  // Render all tiles from the data array.
  function renderTiles(data) {
    tileContainer.innerHTML = "";
    data.forEach((tile, index) => {
      // Create tile container
      const tileEl = document.createElement("div");
      tileEl.classList.add("tile");
      tileEl.setAttribute("data-index", index);

      // Tile header: icon, title and category label
      const headerEl = document.createElement("div");
      headerEl.classList.add("tile-header");
      const iconEl = document.createElement("div");
      iconEl.classList.add("tile-icon");
      iconEl.textContent = tile.icon;
      const titleEl = document.createElement("div");
      titleEl.classList.add("tile-title");
      titleEl.textContent = tile.title;
      // Save original title text
      titleEl.dataset.originalText = tile.title;
      const categoryEl = document.createElement("div");
      categoryEl.classList.add("tile-category");
      categoryEl.textContent = tile.category;
      // Save original category text
      categoryEl.dataset.originalText = tile.category;

      headerEl.appendChild(iconEl);
      headerEl.appendChild(titleEl);
      headerEl.appendChild(categoryEl);

      // Tile description
      const descriptionEl = document.createElement("div");
      descriptionEl.classList.add("tile-description");
      descriptionEl.textContent = tile.description;
      // Save original description text
      descriptionEl.dataset.originalText = tile.description;

      // Prompt preview (showing the fixed text part of the template)
      const previewEl = document.createElement("div");
      previewEl.classList.add("prompt-preview");
      // Remove the marker from the preview to show a cleaner message.
      const previewText = tile.promptTemplate.replace(/\[\[\[.*?\]\]\]/, "<<< interactive input >>>");
      previewEl.textContent = previewText;

      // Create interactive form element from the prompt template marker.
      const inputEl = createInputElement(tile.promptTemplate);
      inputEl.classList.add("tile-input");

      // Create submit button
      const buttonEl = document.createElement("button");
      buttonEl.classList.add("run-button");
      buttonEl.textContent = "Run Prompt";
      buttonEl.addEventListener("click", () => {
        // Process the prompt template and open the new URL.
        const userInput = inputEl.value.trim();
        const finalPrompt = processPromptTemplate(tile.promptTemplate, userInput);
        const encodedPrompt = encodeURIComponent(finalPrompt);
        const finalURL = `https://chatgpt.com/?q=${encodedPrompt}`;
        window.open(finalURL, "_blank");
      });

      // Assemble tile
      tileEl.appendChild(headerEl);
      tileEl.appendChild(descriptionEl);
      tileEl.appendChild(previewEl);
      tileEl.appendChild(inputEl);
      tileEl.appendChild(buttonEl);

      // Save the tile's text elements for later search highlighting
      originalTileData.set(tileEl, {
        title: titleEl.dataset.originalText,
        description: descriptionEl.dataset.originalText,
        category: categoryEl.dataset.originalText,
      });

      tileContainer.appendChild(tileEl);
    });
  }

  // Create an input element (currently supports textarea) based on the prompt template marker.
  function createInputElement(template) {
    const markerRegex = /\[\[\[\s*component=([^,]+),\s*name=([^,]+),\s*placeholder="([^"]+)",\s*rows=([^,]+),\s*width="([^"]+)"\s*\]\]\]/;
    const match = template.match(markerRegex);
    if (match) {
      const component = match[1].trim();
      const name = match[2].trim();
      const placeholder = match[3].trim();
      const rows = match[4].trim();
      const width = match[5].trim();
      if (component.toLowerCase() === "textarea") {
        const textarea = document.createElement("textarea");
        textarea.name = name;
        textarea.placeholder = placeholder;
        textarea.rows = parseInt(rows, 10);
        textarea.style.width = width;
        return textarea;
      }
    }
    // Fallback: if no marker found or unsupported component, create a simple input.
    const input = document.createElement("input");
    input.type = "text";
    return input;
  }

  // Process the prompt template by replacing marker with user input.
  function processPromptTemplate(template, userInput) {
    return template.replace(/\[\[\[\s*component=[^]+\]\]\]/, userInput);
  }

  // Fuzzy search and highlight matching text.
  function performSearch(query) {
    const tiles = tileContainer.getElementsByClassName("tile");
    Array.from(tiles).forEach(tileEl => {
      const { title, description, category } = originalTileData.get(tileEl);
      const titleEl = tileEl.querySelector(".tile-title");
      const descriptionEl = tileEl.querySelector(".tile-description");
      const categoryEl = tileEl.querySelector(".tile-category");
      
      const queryLower = query.toLowerCase();

      // Determine if the tile should be visible.
      const matchFound = title.toLowerCase().includes(queryLower) ||
                         description.toLowerCase().includes(queryLower) ||
                         category.toLowerCase().includes(queryLower);
      
      if (matchFound || query === "") {
        tileEl.style.display = "flex";
        // Highlight matches in each text element.
        titleEl.innerHTML = highlightText(title, query);
        descriptionEl.innerHTML = highlightText(description, query);
        categoryEl.innerHTML = highlightText(category, query);
      } else {
        tileEl.style.display = "none";
      }
    });
  }

  // Highlight matching text by wrapping it in <mark> tags.
  function highlightText(text, query) {
    if (!query) return text;
    const regex = new RegExp(`(${query})`, "gi");
    return text.replace(regex, "<mark>$1</mark>");
  }

  // Event listener for the search bar.
  searchInput.addEventListener("input", (e) => {
    const query = e.target.value.trim();
    performSearch(query);
  });

  // Initial render of all tiles.
  renderTiles(tilesData);
});

