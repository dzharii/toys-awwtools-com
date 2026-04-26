(function installWorkerLogger(globalScope) {
  const levelWeight = { error: 0, warn: 1, info: 2, debug: 3 };
  const levelColor = { error: "#b42318", warn: "#b54708", info: "#175cd3", debug: "#475467" };
  const settings = { level: "debug", formatter: "segments", useLabelBackgrounds: true };

  function createLogger(category, defaultSubcategory) {
    function emit(level, message, options) {
      const context = options && options.context ? options.context : {};
      if (levelWeight[level] > levelWeight[settings.level]) return;
      const event = { level, category, subcategory: (options && options.subcategory) || defaultSubcategory || "", message, context, timestamp: new Date().toISOString() };
      const args = settings.formatter === "plain" ? formatPlain(event) : formatSegments(event);
      const method = level === "error" ? "error" : level === "warn" ? "warn" : "log";
      console[method](...args);
    }
    return {
      error: (message, options) => emit("error", message, options),
      warn: (message, options) => emit("warn", message, options),
      info: (message, options) => emit("info", message, options),
      debug: (message, options) => emit("debug", message, options),
      withSubcategory: (subcategory) => createLogger(category, subcategory),
    };
  }

  function compactJson(value) {
    const seen = new WeakSet();
    try {
      return JSON.stringify(value, (_key, raw) => {
        if (typeof raw === "bigint") return raw.toString();
        if (raw instanceof Error) return normalizeError(raw);
        if (typeof raw === "string") return raw.length > 240 ? `${raw.slice(0, 237)}...` : raw;
        if (Array.isArray(raw)) return raw.length <= 20 ? raw : [...raw.slice(0, 20), `...(${raw.length - 20} more)`];
        if (raw && typeof raw === "object") {
          if (seen.has(raw)) return "[Circular]";
          seen.add(raw);
          const entries = Object.entries(raw);
          if (entries.length <= 20) return raw;
          return Object.fromEntries([...entries.slice(0, 20), ["__moreKeys", entries.length - 20]]);
        }
        return raw;
      });
    } catch {
      return "{\"context\":\"unserializable\"}";
    }
  }

  function normalizeError(error) {
    return {
      name: error && error.name ? error.name : "Error",
      message: error && error.message ? error.message : String(error),
      code: error && error.code,
      stack: error && error.stack ? String(error.stack).split("\n").slice(0, 6).join(" | ") : "",
    };
  }

  function formatPlain(event) {
    const scope = [event.category, event.subcategory].filter(Boolean).join("/");
    return [`[TRN] ${event.level.toUpperCase()} ${scope} ${event.message} ${compactJson(event.context)} ${event.timestamp}`];
  }

  function formatSegments(event) {
    const scope = [event.category, event.subcategory].filter(Boolean).join("/");
    return [
      "%c▣ TRN %c %s %c %s %c %s %c %s %c %s",
      segmentStyle("#315f99"),
      segmentStyle(levelColor[event.level]),
      event.level.toUpperCase(),
      segmentStyle("#0f766e"),
      scope,
      "color:#121820;font-weight:700",
      event.message,
      "color:#344054",
      compactJson(event.context),
      "color:#667085",
      event.timestamp,
    ];
  }

  function segmentStyle(color) {
    return settings.useLabelBackgrounds
      ? `background:${color};color:#fff;border-radius:2px;padding:1px 4px;font-weight:700`
      : `color:${color};font-weight:700`;
  }

  globalScope.TRNLogger = { createLogger, compactJson, normalizeError };
})(self);
