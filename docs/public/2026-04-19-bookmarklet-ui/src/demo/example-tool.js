import { TAGS } from "../core/constants.js";

function iconPlus() {
  return `<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 3v10M3 8h10" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="square"/></svg>`;
}

export function buildExampleToolWindow({ title = "Page Extraction Tool" } = {}) {
  const win = document.createElement(TAGS.window);
  win.setAttribute("title", title);

  const menubar = document.createElement(TAGS.menubar);
  menubar.slot = "menubar";
  menubar.innerHTML = `
    <button type="button" data-menu="file">File</button>
    <button type="button" data-menu="view">View</button>
    <button type="button" data-menu="help">Help</button>

    <${TAGS.menu} name="file">
      <button type="button" data-command="tool.run">Run</button>
      <button type="button" data-command="tool.reset">Reset</button>
      <div data-separator role="separator"></div>
      <button type="button" data-command="tool.close">Close</button>
    </${TAGS.menu}>

    <${TAGS.menu} name="view">
      <button type="button" data-command="view.compact">Compact Mode</button>
      <button type="button" data-command="view.normal">Normal Mode</button>
    </${TAGS.menu}>

    <${TAGS.menu} name="help">
      <button type="button" data-command="help.about">About</button>
    </${TAGS.menu}>
  `;

  const toolbar = document.createElement("div");
  toolbar.slot = "toolbar";
  toolbar.style.display = "flex";
  toolbar.style.flexWrap = "wrap";
  toolbar.style.gap = "8px";
  toolbar.style.padding = "6px 8px";
  toolbar.style.alignItems = "center";
  toolbar.innerHTML = `
    <${TAGS.iconButton} id="tool-refresh" aria-label="Refresh">${iconPlus()}</${TAGS.iconButton}>
    <${TAGS.button} id="tool-run">Run</${TAGS.button}>
    <${TAGS.button} id="tool-close">Close</${TAGS.button}>
  `;

  const status = document.createElement(TAGS.statusbar);
  status.slot = "statusbar";
  status.innerHTML = `<span id="status-main">Ready</span><span id="status-count">0 selected</span><span id="status-mode">Normal</span>`;

  const body = document.createElement("div");
  body.style.display = "grid";
  body.style.gap = "12px";
  body.innerHTML = `
    <${TAGS.group} caption="Target">
      <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap:8px; align-items:center;">
        <${TAGS.input} id="target-input" placeholder="CSS selector or current selection"></${TAGS.input}>
        <${TAGS.button} id="target-refresh">Refresh</${TAGS.button}>
        <${TAGS.button} id="target-pick">Pick Again</${TAGS.button}>
      </div>
    </${TAGS.group}>

    <${TAGS.panel}>
      <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap:12px;">
        <${TAGS.group} caption="Options">
          <div style="display:grid; gap:8px;">
            <${TAGS.checkbox} checked id="opt-trim">Trim whitespace</${TAGS.checkbox}>
            <${TAGS.checkbox} id="opt-links">Include links</${TAGS.checkbox}>
            <${TAGS.checkbox} checked id="opt-visible">Only visible nodes</${TAGS.checkbox}>
            <div style="display:grid; gap:6px; margin-top:4px;">
              <${TAGS.radio} name="mode" value="text" checked>Text</${TAGS.radio}>
              <${TAGS.radio} name="mode" value="html">HTML</${TAGS.radio}>
            </div>
          </div>
        </${TAGS.group}>

        <${TAGS.group} caption="Output">
          <${TAGS.tabs} id="output-tabs">
            <${TAGS.tabPanel} label="Result" selected>
              <${TAGS.textarea} id="result-output" rows="6" placeholder="Extraction result"></${TAGS.textarea}>
            </${TAGS.tabPanel}>
            <${TAGS.tabPanel} label="History">
              <${TAGS.listbox} id="history-list">
                <div role="option" aria-selected="true" data-value="run-1">Run #1</div>
                <div role="option" data-value="run-2">Run #2</div>
                <div role="option" data-value="run-3">Run #3</div>
              </${TAGS.listbox}>
            </${TAGS.tabPanel}>
          </${TAGS.tabs}>
        </${TAGS.group}>
      </div>
    </${TAGS.panel}>

    <${TAGS.group} caption="Actions">
      <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap:12px; align-items:center;">
        <div style="display:grid; gap:8px;">
          <label style="display:grid; gap:4px;">Preset
            <${TAGS.select} id="preset-select">
              <option value="quick" selected>Quick</option>
              <option value="balanced">Balanced</option>
              <option value="full">Full</option>
            </${TAGS.select}>
          </label>
          <label style="display:grid; gap:4px;">Confidence
            <${TAGS.range} id="confidence-range" min="0" max="100" value="65"></${TAGS.range}>
          </label>
        </div>
        <div style="display:grid; gap:8px;">
          <${TAGS.progress} id="run-progress" value="0" max="100"></${TAGS.progress}>
          <div style="display:flex; flex-wrap:wrap; justify-content:flex-end; gap:8px;">
            <${TAGS.button} id="action-run">Run</${TAGS.button}>
            <${TAGS.button} id="action-close">Close</${TAGS.button}>
          </div>
        </div>
      </div>
    </${TAGS.group}>
  `;

  win.append(menubar, toolbar, body, status);

  const statusMain = () => status.querySelector("#status-main");
  const statusCount = () => status.querySelector("#status-count");
  const statusMode = () => status.querySelector("#status-mode");

  const setStatus = (text) => {
    statusMain().textContent = text;
  };

  const setMode = (mode) => {
    statusMode().textContent = mode;
    body.dataset.mode = mode;
    if (mode === "Compact") {
      body.style.gap = "8px";
    } else {
      body.style.gap = "12px";
    }
  };

  const close = () => win.requestClose();

  const run = () => {
    setStatus("Running...");
    const progress = body.querySelector("#run-progress");
    let value = Number(progress.getAttribute("value") || "0");
    value = Math.min(100, value + 35);
    progress.setAttribute("value", String(value));

    const output = body.querySelector("#result-output");
    output.value = `Extracted ${value} records from ${body.querySelector("#target-input").value || "current page"}.`;

    statusCount().textContent = `${Math.ceil(value / 10)} selected`;
    setStatus(value >= 100 ? "Completed" : "Running step complete");
  };

  menubar.commandRegistry.register({ id: "tool.run", label: "Run", run });
  menubar.commandRegistry.register({ id: "tool.reset", label: "Reset", run: () => {
    body.querySelector("#run-progress").setAttribute("value", "0");
    body.querySelector("#result-output").value = "";
    setStatus("Ready");
    statusCount().textContent = "0 selected";
  } });
  menubar.commandRegistry.register({ id: "tool.close", label: "Close", run: close });
  menubar.commandRegistry.register({ id: "view.compact", label: "Compact", run: () => setMode("Compact") });
  menubar.commandRegistry.register({ id: "view.normal", label: "Normal", run: () => setMode("Normal") });
  menubar.commandRegistry.register({ id: "help.about", label: "About", run: () => setStatus("AWW Bookmarklet Framework v1") });

  toolbar.querySelector("#tool-run").addEventListener("click", run);
  toolbar.querySelector("#tool-close").addEventListener("click", close);
  toolbar.querySelector("#tool-refresh").addEventListener("click", () => setStatus("Refreshed target snapshot"));

  body.querySelector("#target-refresh").addEventListener("click", () => setStatus("Target refreshed"));
  body.querySelector("#target-pick").addEventListener("click", () => setStatus("Pick mode enabled"));
  body.querySelector("#action-run").addEventListener("click", run);
  body.querySelector("#action-close").addEventListener("click", close);

  body.querySelector("#history-list").addEventListener("change", (event) => {
    setStatus(`History selected: ${event.detail.value}`);
  });

  body.querySelectorAll(`${TAGS.radio}[name='mode']`).forEach((radio) => {
    radio.addEventListener("change", () => {
      if (radio.hasAttribute("checked")) setStatus(`Mode switched to ${radio.getAttribute("value")}`);
    });
  });

  body.querySelector("#confidence-range").addEventListener("input", (event) => {
    statusCount().textContent = `${event.target.value}% confidence`;
  });

  return win;
}
