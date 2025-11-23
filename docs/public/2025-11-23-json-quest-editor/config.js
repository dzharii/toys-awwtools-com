// Global configuration for the diagram editor.
// Exposed on window as SubwayConfig.
(function () {
  var config = {
    appName: "JSON Quest Editor",
    version: "2025-11-23",
    logLevel: "verbose", // verbose | info | warn | error
    defaultPalette: [
      "#0f766e",
      "#2563eb",
      "#7c3aed",
      "#db2777",
      "#ea580c",
      "#eab308",
      "#16a34a",
      "#111827",
      "#6b7280",
      "#f3f4f6"
    ],
    defaultNodeRadius: 28,
    defaultStroke: "#111827",
    defaultConnectionColor: "#111827",
    defaultFontSize: 14,
    gridSize: 20,
    minZoom: 0.25,
    maxZoom: 4,
    undoLimit: 200,
    snapEnabled: true,
    gridVisible: true
  };

  window.SubwayConfig = config;
})();

