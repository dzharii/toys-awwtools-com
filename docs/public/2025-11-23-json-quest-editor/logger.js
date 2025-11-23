// Centralized logger for the editor.
(function () {
  var levels = { verbose: 0, info: 1, warn: 2, error: 3 };
  var currentLevelName = window.SubwayConfig && window.SubwayConfig.logLevel ? window.SubwayConfig.logLevel : "verbose";
  var currentLevel = levels[currentLevelName] != null ? levels[currentLevelName] : 0;

  function formatEntry(category, module, message, data) {
    var base = "[" + category + "][" + module + "] " + message;
    if (data !== undefined) {
      var serialized;
      try {
        serialized = JSON.stringify(data);
      } catch (e) {
        serialized = "unserializable-data";
      }
      base += "; data = " + serialized;
    }
    return base;
  }

  function emit(levelName, category, module, message, data) {
    if (levels[levelName] < currentLevel) {
      return;
    }
    var entry = formatEntry(category, module, message, data);
    /* eslint-disable no-console */
    if (levelName === "error") {
      console.error(entry);
    } else if (levelName === "warn") {
      console.warn(entry);
    } else {
      console.log(entry);
    }
    /* eslint-enable no-console */
  }

  var SubwayLogger = {
    getLevel: function () {
      return currentLevelName;
    },
    setLevel: function (levelName) {
      if (!levels.hasOwnProperty(levelName)) {
        emit("warn", "LOGGER", "Config", "Attempted to set unknown log level", { levelName: levelName });
        return;
      }
      currentLevelName = levelName;
      currentLevel = levels[levelName];
      emit("info", "LOGGER", "Config", "Log level changed", { level: levelName });
    },
    logVerbose: function (category, module, message, data) {
      emit("verbose", category, module, message, data);
    },
    logInfo: function (category, module, message, data) {
      emit("info", category, module, message, data);
    },
    logWarn: function (category, module, message, data) {
      emit("warn", category, module, message, data);
    },
    logError: function (category, module, message, data) {
      emit("error", category, module, message, data);
    }
  };

  window.SubwayLogger = SubwayLogger;
})();

