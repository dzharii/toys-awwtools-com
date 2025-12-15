export function createLogger(panel) {
  const target = panel;

  function append(entry) {
    if (!target) return;
    const row = document.createElement("div");
    row.className = `log-entry level-${entry.level}`;
    const time = document.createElement("span");
    time.className = "log-time";
    time.textContent = entry.timestamp;
    const name = document.createElement("span");
    name.className = "log-event";
    name.textContent = entry.event;
    const data = document.createElement("span");
    data.className = "log-data";
    data.textContent = JSON.stringify(entry.data);
    row.append(time, name, data);
    target.appendChild(row);
    target.scrollTop = target.scrollHeight;
  }

  function log(event, data = {}, level = "info") {
    const entry = {
      timestamp: new Date().toISOString(),
      event,
      data,
      level,
    };
    if (level === "error") {
      console.error(`[${entry.timestamp}] ${event}`, data);
    } else if (level === "warn") {
      console.warn(`[${entry.timestamp}] ${event}`, data);
    } else {
      console.log(`[${entry.timestamp}] ${event}`, data);
    }
    append(entry);
  }

  return {
    log,
    warn: (event, data = {}) => log(event, data, "warn"),
    error: (event, data = {}) => log(event, data, "error"),
    clear: () => {
      if (target) target.innerHTML = "";
    },
  };
}
