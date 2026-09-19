export const PALETTES = Object.freeze({
  aurora: {
    label: "Aurora",
    colors: ["#72a8ff", "#9675ff", "#f39be9"],
    background: "#040710",
    accent: "#9a7cff",
  },
  silk: {
    label: "Silk Pearl",
    colors: ["#d9e4ff", "#a6bfff", "#e9baff"],
    background: "#070811",
    accent: "#b9caff",
  },
  membrane: {
    label: "Opaline",
    colors: ["#f2eeff", "#bfc8ee", "#bca6d9"],
    background: "#07070b",
    accent: "#d8d0f1",
  },
  liquid: {
    label: "Lagoon",
    colors: ["#6af7e7", "#35bfe9", "#4177ff"],
    background: "#020b13",
    accent: "#46dce2",
  },
  chrome: {
    label: "Chrome",
    colors: ["#edf3ff", "#779dff", "#aa72ff"],
    background: "#03050a",
    accent: "#8faaff",
  },
  nebula: {
    label: "Orion",
    colors: ["#5788ff", "#9a57ee", "#ff73da"],
    background: "#04030d",
    accent: "#b468f4",
  },
  particle: {
    label: "Ion",
    colors: ["#6be8ff", "#7c86ff", "#c29aff"],
    background: "#03070d",
    accent: "#72d7ff",
  },
  ember: {
    label: "Ember",
    colors: ["#ffd36f", "#ff8a35", "#d8491c"],
    background: "#100402",
    accent: "#ff9a48",
  },
  ocean: {
    label: "Ocean",
    colors: ["#55f0e5", "#21b9e8", "#285bca"],
    background: "#021019",
    accent: "#33d3de",
  },
  forest: {
    label: "Forest",
    colors: ["#79dd83", "#d2cf72", "#2f9161"],
    background: "#030b06",
    accent: "#83c97a",
  },
  void: {
    label: "Void",
    colors: ["#f1f3f8", "#89919f", "#3b414d"],
    background: "#020305",
    accent: "#b8c0cc",
  },
});

export function hexToRgb(hex) {
  const value = Number.parseInt(hex.slice(1), 16);
  return [
    ((value >> 16) & 255) / 255,
    ((value >> 8) & 255) / 255,
    (value & 255) / 255,
  ];
}
