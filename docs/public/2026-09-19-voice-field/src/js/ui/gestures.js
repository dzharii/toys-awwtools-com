export function installMobileGestures({ root, state, interactiveSelector = "input, select, button, a, label" }) {
  let gesture = null;
  let exitTimer = 0;
  const exitButton = document.querySelector("#performance-exit");

  const revealExit = () => {
    if (state.mobileMode !== "performance") return;
    exitButton.classList.add("is-visible");
    clearTimeout(exitTimer);
    exitTimer = setTimeout(() => exitButton.classList.remove("is-visible"), 2600);
  };

  const setMode = (mode) => {
    state.setMobileMode(mode);
    root.dataset.mobileMode = mode;
    if (mode === "performance") revealExit();
    else exitButton.classList.remove("is-visible");
  };

  const toggle = () => setMode(state.mobileMode === "compose" ? "performance" : "compose");

  root.addEventListener("pointerdown", (event) => {
    if (!matchMedia("(max-width: 760px)").matches || event.target.closest(interactiveSelector)) return;
    gesture = { x: event.clientX, y: event.clientY, time: performance.now(), id: event.pointerId };
  });
  root.addEventListener("pointerup", (event) => {
    if (!gesture || event.pointerId !== gesture.id) return;
    const dx = event.clientX - gesture.x;
    const dy = event.clientY - gesture.y;
    const duration = performance.now() - gesture.time;
    gesture = null;
    if (Math.abs(dx) >= 70 && Math.abs(dx) > Math.abs(dy) * 1.5 && Math.abs(dy) < 54 && duration < 900) toggle();
    else if (state.mobileMode === "performance") revealExit();
  });
  root.addEventListener("pointercancel", () => { gesture = null; });

  document.querySelector("#performance-button")?.addEventListener("click", () => setMode("performance"));
  document.querySelector("#footer-performance-button")?.addEventListener("click", () => setMode("performance"));
  exitButton?.addEventListener("click", () => setMode("compose"));

  return { toggle, setMode, revealExit };
}
