
const settings = {
  use24h: true,
  shake: true,
  tab: true,
  notify: false,
};

function loadSettings() {
  const saved = loadFromLocalStorage("settings", settings);
  Object.assign(settings, saved);
  document.getElementById("toggle24h").checked = settings.use24h;
  document.getElementById("toggleShake").checked = settings.shake;
  document.getElementById("toggleTab").checked = settings.tab;
  document.getElementById("toggleNotify").checked = settings.notify;
}

function initSettingsUI() {
  document.getElementById("toggle24h").addEventListener("change", e => {
    settings.use24h = e.target.checked;
    saveToLocalStorage("settings", settings);
  });
  document.getElementById("toggleShake").addEventListener("change", e => {
    settings.shake = e.target.checked;
    saveToLocalStorage("settings", settings);
  });
  document.getElementById("toggleTab").addEventListener("change", e => {
    settings.tab = e.target.checked;
    saveToLocalStorage("settings", settings);
  });
  document.getElementById("toggleNotify").addEventListener("change", e => {
    settings.notify = e.target.checked;
    saveToLocalStorage("settings", settings);
  });
}

document.getElementById("settingsToggle").addEventListener("click", () => {
  document.getElementById("settingsPanel").classList.toggle("hidden");
});

loadSettings();
initSettingsUI();

