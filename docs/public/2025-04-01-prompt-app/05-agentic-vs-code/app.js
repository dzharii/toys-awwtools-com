document.addEventListener("DOMContentLoaded", () => {
  const searchBar = document.getElementById("searchBar");
  const tileContainer = document.getElementById("tileContainer");

  function fuzzyMatch(text, query) {
    let qi = 0;
    let result = "";
    const lowerText = text.toLowerCase();
    const lowerQuery = query.toLowerCase();
    for (let i = 0; i < text.length; i++) {
      const c = text[i];
      if (qi < lowerQuery.length && lowerText[i] === lowerQuery[qi]) {
        result += `<span class="highlight">${c}</span>`;
        qi++;
      } else {
        result += c;
      }
    }
    return { matched: qi === lowerQuery.length, highlighted: result };
  }

  function generateFormField(template) {
    return template.replace(
      /\[\[\[component=textarea, name=(.*?), placeholder=(.*?), rows=(\d+), width=(.*?)\]\]\]/g,
      (match, name, placeholder, rows, width) =>
        `<textarea name="${name}" placeholder="${placeholder}" rows="${rows}" style="width: ${width};"></textarea>`
    );
  }

  function runPrompt(template, container) {
    const textarea = container.querySelector("textarea");
    const userInput = textarea ? textarea.value : "";
    const prompt = template.replace(/\[\[\[.*?\]\]\]/, userInput);
    const encoded = encodeURIComponent(prompt);
    window.open(`https://chatgpt.com/?q=${encoded}`, "_blank");
  }

  function renderTiles(tiles, query = "") {
    const q = query.trim();
    tileContainer.innerHTML = "";
    tiles.forEach((tile) => {
      const titleMatch = q
        ? fuzzyMatch(tile.title, q)
        : { matched: true, highlighted: tile.title };
      const descMatch = q
        ? fuzzyMatch(tile.description, q)
        : { matched: true, highlighted: tile.description };
      const catMatch = q
        ? fuzzyMatch(tile.category, q)
        : { matched: true, highlighted: tile.category };
      if (q && !titleMatch.matched && !descMatch.matched && !catMatch.matched)
        return;

      const preview = tile.promptTemplate.split("[[[")[0];
      const previewMatch = q ? fuzzyMatch(preview, q).highlighted : preview;

      const tileEl = document.createElement("div");
      tileEl.className = "tile";
      tileEl.innerHTML = `
                <h2>${tile.icon} ${
        titleMatch.highlighted
      }<span class="category-label">${catMatch.highlighted}</span></h2>
                <p>${descMatch.highlighted}</p>
                <div class="template-preview">${previewMatch}</div>
                <div>${generateFormField(tile.promptTemplate)}</div>
                <button>Run Prompt</button>
            `;
      tileEl
        .querySelector("button")
        .addEventListener("click", () =>
          runPrompt(tile.promptTemplate, tileEl)
        );
      tileContainer.appendChild(tileEl);
    });
  }

  searchBar.addEventListener("input", () =>
    renderTiles(tiles, searchBar.value)
  );
  renderTiles(tiles);
});
