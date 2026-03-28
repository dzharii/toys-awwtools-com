import { ReservoirScene } from "./scene.js";

function main() {
  const canvas = document.getElementById("sceneCanvas");
  const pasteReceiver = document.getElementById("pasteReceiver");
  const liveRegion = document.getElementById("liveRegion");
  const statusEl = document.getElementById("subtleStatus");
  const muteToggle = document.getElementById("muteToggle");

  if (!(canvas instanceof HTMLCanvasElement)) {
    throw new Error("sceneCanvas not found");
  }
  if (!(pasteReceiver instanceof HTMLButtonElement)) {
    throw new Error("pasteReceiver not found");
  }
  if (!(liveRegion instanceof HTMLDivElement)) {
    throw new Error("liveRegion not found");
  }
  if (!(statusEl instanceof HTMLDivElement)) {
    throw new Error("subtleStatus not found");
  }
  if (!(muteToggle instanceof HTMLButtonElement)) {
    throw new Error("muteToggle not found");
  }

  const scene = new ReservoirScene({
    canvas,
    pasteReceiver,
    liveRegion,
    statusEl,
    muteToggle,
  });

  scene.start();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", main, { once: true });
} else {
  main();
}
