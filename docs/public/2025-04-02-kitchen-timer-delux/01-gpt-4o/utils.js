
function generateId() {
  return 'id-' + Math.random().toString(36).substr(2, 9);
}

function formatTime(seconds, use24h = true) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${use24h ? h.toString().padStart(2, '0') : ((h % 12) || 12).toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

function fuzzySearch(term, ...fields) {
  const t = term.toLowerCase();
  return fields.some(f => f.toLowerCase().includes(t));
}

function saveToLocalStorage(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

function loadFromLocalStorage(key, defaultValue = []) {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : defaultValue;
}

