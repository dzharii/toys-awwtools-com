
let tiles = [];
let timers = {};
const container = document.getElementById("tilesContainer");

function mergeTiles() {
  const localMods = loadFromLocalStorage("tiles", []);
  const modMap = Object.fromEntries(localMods.map(t => [t.id, t]));
  return PREDEFINED_TILES.map(t => modMap[t.id] || t).concat(localMods.filter(t => !PREDEFINED_TILES.some(pt => pt.id === t.id)));
}

function renderTiles(term = "") {
  container.innerHTML = "";
  for (const tile of tiles) {
    if (term && !fuzzySearch(term, tile.title, tile.description, tile.category)) continue;
    const div = document.createElement("div");
    div.className = "tile";
    div.dataset.id = tile.id;

    const title = document.createElement("h3");
    title.textContent = `${tile.icon} ${tile.title}`;
    
    const category = document.createElement("span");
    category.textContent = tile.category;
    
    const desc = document.createElement("p");
    desc.textContent = tile.description;

    const time = document.createElement("div");
    time.className = "time";
    let current = tile.initialTime;
    time.textContent = formatTime(current, settings.use24h);

    const controls = document.createElement("div");
    controls.className = "controls";

    const startBtn = document.createElement("button");
    startBtn.textContent = "▶️";
    startBtn.onclick = () => {
      clearInterval(timers[tile.id]);
      timers[tile.id] = setInterval(() => {
        if (--current <= 0) {
          clearInterval(timers[tile.id]);
          div.classList.add("complete");
          if (settings.shake) div.classList.add("shake");
          if (settings.tab) document.title = "⏰ " + tile.title;
          if (settings.notify && Notification.permission === "granted") {
            new Notification("Timer complete", { body: tile.title });
          }
        }
        time.textContent = formatTime(current, settings.use24h);
      }, 1000);
    };

    const pauseBtn = document.createElement("button");
    pauseBtn.textContent = "⏸️";
    pauseBtn.onclick = () => clearInterval(timers[tile.id]);

    const resetBtn = document.createElement("button");
    resetBtn.textContent = "🔄";
    resetBtn.onclick = () => {
      clearInterval(timers[tile.id]);
      current = tile.initialTime;
      time.textContent = formatTime(current, settings.use24h);
    };

    controls.append(startBtn, pauseBtn, resetBtn);
    div.append(title, category, desc, time, controls);

    container.appendChild(div);
  }
}

document.getElementById("searchInput").addEventListener("input", e => {
  renderTiles(e.target.value);
});

document.getElementById("exportData").addEventListener("click", () => {
  const allTiles = mergeTiles();
  const blob = new Blob([JSON.stringify(allTiles, null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "kitchen_timer_export.json";
  a.click();
});

if (Notification.permission !== "granted") {
  Notification.requestPermission();
}

tiles = mergeTiles();
renderTiles();


