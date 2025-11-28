import { execFormatCommand, toggleCode, toggleCodeBlock, applyLink } from "./formatting.js";

export function createUI(actions) {
  const root = document.getElementById("app");
  const welcome = document.createElement("div");
  welcome.className = "welcome";
  welcome.innerHTML = `
    <h1>Local Notes Chat</h1>
    <p>Select a notes folder to get started. Everything stays on your disk.</p>
    <div style="margin-top:16px;">
      <button class="btn primary" id="select-folder-btn">Select notes folder</button>
    </div>
  `;
  const welcomeStatus = document.createElement("div");
  welcomeStatus.className = "status-line";
  welcomeStatus.style.marginTop = "12px";
  welcome.appendChild(welcomeStatus);
  const selectBtn = welcome.querySelector("#select-folder-btn");
  selectBtn.addEventListener("click", () => actions.onSelectWorkspace());

  const topBar = document.createElement("div");
  topBar.className = "top-bar";
  const info = document.createElement("div");
  info.className = "top-info";
  const titleEl = document.createElement("div");
  titleEl.className = "workspace-title";
  const pathEl = document.createElement("div");
  pathEl.className = "workspace-path";
  info.appendChild(titleEl);
  info.appendChild(pathEl);
  const topActions = document.createElement("div");
  topActions.className = "top-actions";
  const settingsBtn = document.createElement("button");
  settingsBtn.className = "btn";
  settingsBtn.textContent = "Settings";
  const switchBtn = document.createElement("button");
  switchBtn.className = "btn";
  switchBtn.textContent = "Change folder";
  const selectionToggle = document.createElement("button");
  selectionToggle.className = "btn";
  selectionToggle.textContent = "Select all";
  const copySelectedBtn = document.createElement("button");
  copySelectedBtn.className = "btn";
  copySelectedBtn.textContent = "Copy selected";
  copySelectedBtn.disabled = true;
  topActions.appendChild(settingsBtn);
  topActions.appendChild(switchBtn);
  topActions.appendChild(selectionToggle);
  topActions.appendChild(copySelectedBtn);
  topBar.appendChild(info);
  topBar.appendChild(topActions);

  const layout = document.createElement("div");
  layout.className = "layout";
  const timeline = document.createElement("div");
  timeline.className = "timeline";
  timeline.setAttribute("tabindex", "0");
  const composer = document.createElement("div");
  composer.className = "composer";

  const composerArea = document.createElement("div");
  composerArea.className = "composer-area";
  composerArea.contentEditable = "true";
  composerArea.setAttribute("role", "textbox");
  composerArea.setAttribute("aria-multiline", "true");

  const fileInput = document.createElement("input");
  fileInput.type = "file";
  fileInput.accept = "image/*";
  fileInput.multiple = true;
  fileInput.style.display = "none";
  fileInput.addEventListener("change", () => {
    const files = Array.from(fileInput.files || []);
    if (files.length) actions.onAttach(files);
    fileInput.value = "";
  });

  const toolbar = document.createElement("div");
  toolbar.className = "toolbar";
  const btnBold = button("B", () => execFormatCommand("bold"));
  const btnItalic = button("I", () => execFormatCommand("italic"));
  const btnCode = button("Code", () => toggleCode(composerArea));
  const btnCodeBlock = button("Code block", () => toggleCodeBlock(composerArea));
  const btnLink = button("Link", async () => {
    const url = prompt("Enter URL");
    if (url) applyLink(composerArea, url);
  });
  const attachBtn = button("Attach image", () => fileInput.click());
  toolbar.append(btnBold, btnItalic, btnCode, btnCodeBlock, btnLink, attachBtn);

  const composerActions = document.createElement("div");
  composerActions.className = "composer-actions";
  const statusLine = document.createElement("div");
  statusLine.className = "status-line";
  const actionButtons = document.createElement("div");
  const cancelEditBtn = button("Cancel edit", () => actions.onCancelEdit());
  cancelEditBtn.style.display = "none";
  const postBtn = button("Post", () => actions.onPost());
  postBtn.classList.add("primary");
  actionButtons.append(cancelEditBtn, postBtn);
  composerActions.append(statusLine, actionButtons);

  const composerAttachments = document.createElement("div");
  composerAttachments.className = "attachments";

  composer.append(toolbar, composerArea, composerAttachments, composerActions, fileInput);

  layout.append(timeline, composer);

  const settingsPanel = document.createElement("div");
  settingsPanel.className = "settings-panel";
  const themeRow = row("Theme", () => {
    const select = document.createElement("select");
    select.innerHTML = `<option value="light">Light</option><option value="dark">Dark</option>`;
    select.addEventListener("change", () => actions.onThemeChange(select.value));
    return select;
  });
  const fontRow = row("Font size", () => {
    const input = document.createElement("input");
    input.type = "number";
    input.min = "12";
    input.max = "24";
    input.value = "14";
    input.addEventListener("change", () => actions.onFontSizeChange(Number(input.value)));
    return input;
  });
  const pathRow = document.createElement("div");
  pathRow.className = "settings-row";
  pathRow.innerHTML = `<div>Folder</div><div class="workspace-path" id="settings-path"></div>`;
  const diagnosticsTitle = document.createElement("div");
  diagnosticsTitle.textContent = "Diagnostics";
  const diagnosticsBox = document.createElement("div");
  diagnosticsBox.className = "diagnostics";
  const switchRow = row("Switch workspace", () => {
    const btn = button("Change", () => actions.onSwitchWorkspace());
    return btn;
  });
  settingsPanel.append(themeRow.container, fontRow.container, pathRow, switchRow.container, diagnosticsTitle, diagnosticsBox);

  settingsBtn.addEventListener("click", () => {
    settingsPanel.classList.toggle("open");
  });
  switchBtn.addEventListener("click", () => actions.onSwitchWorkspace());
  selectionToggle.addEventListener("click", () => actions.onToggleSelectAll());
  copySelectedBtn.addEventListener("click", () => actions.onCopySelected());

  composerArea.addEventListener("paste", (e) => {
    const dt = e.clipboardData;
    if (!dt) return;
    const imageItems = Array.from(dt.items || [])
      .filter((item) => item.kind === "file")
      .map((item) => item.getAsFile())
      .filter((file) => file && file.type.startsWith("image/"));
    if (imageItems.length) {
      e.preventDefault();
      const now = Date.now();
      const renamed = imageItems.map((file, idx) => {
        const ext = (file.type.split("/")[1] || "png").split("+")[0];
        const name = file.name && file.name !== "image.png" ? file.name : `pasted-image-${now}-${idx}.${ext}`;
        try {
          return new File([file], name, { type: file.type });
        } catch {
          file.name = name;
          return file;
        }
      });
      actions.onAttach(renamed);
      return;
    }
    e.preventDefault();
    const text = dt.getData("text/plain");
    document.execCommand("insertText", false, text);
  });

  composerArea.addEventListener("dragover", (e) => {
    e.preventDefault();
  });
  composerArea.addEventListener("drop", (e) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files || []).filter((f) => f.type.startsWith("image/"));
    if (files.length) actions.onAttach(files);
  });

  function button(label, onClick) {
    const el = document.createElement("button");
    el.className = "btn";
    el.type = "button";
    el.textContent = label;
    el.addEventListener("click", onClick);
    return el;
  }

  function row(label, builder) {
    const container = document.createElement("div");
    container.className = "settings-row";
    const left = document.createElement("div");
    left.textContent = label;
    const right = builder();
    container.append(left, right);
    return { container, right };
  }

  function clearComposer() {
    composerArea.innerHTML = "";
    composerAttachments.innerHTML = "";
  }

  function renderMessages(state) {
    timeline.innerHTML = "";
    if (!state.messages || state.messages.length === 0) {
      const empty = document.createElement("div");
      empty.className = "empty-state";
      empty.textContent = "No messages yet.";
      timeline.appendChild(empty);
      return;
    }
    for (const msg of state.messages) {
      const card = document.createElement("div");
      card.className = "message";
      const selected = state.selectedIds?.has(msg.id);
      if (selected) card.classList.add("selected");
      const header = document.createElement("div");
      header.className = "message-header";
      const selectBox = document.createElement("input");
      selectBox.type = "checkbox";
      selectBox.checked = Boolean(selected);
      selectBox.addEventListener("change", () => actions.onToggleSelect(msg.id));
      const ts = document.createElement("div");
      ts.className = "timestamp";
      const created = new Date(msg.createdAt);
      ts.textContent = created.toLocaleString();
      ts.title = created.toISOString();
      if (msg.updatedAt) {
        const edited = document.createElement("span");
        edited.className = "edited";
        edited.textContent = "edited";
        ts.appendChild(edited);
      }
      const actionsBox = document.createElement("div");
      actionsBox.className = "message-actions";
      const editBtn = button("Edit", () => actions.onEdit(msg.id));
      const deleteBtn = button("Delete", () => actions.onDelete(msg.id));
      deleteBtn.classList.add("danger");
      actionsBox.append(editBtn, deleteBtn);
      header.append(selectBox, ts, actionsBox);
      const content = document.createElement("div");
      content.className = "message-content";
      content.innerHTML = msg.contentHtml;
      const attachments = document.createElement("div");
      attachments.className = "attachments";
      if (msg.attachments && msg.attachments.length) {
        for (const att of msg.attachments) {
          const img = document.createElement("img");
          img.alt = att.originalFilename || att.relativePath;
          attachments.appendChild(img);
          actions
            .resolveAttachmentUrl(att.relativePath)
            .then((url) => {
              img.src = url;
            })
            .catch(() => {
              img.replaceWith(document.createTextNode("Attachment unavailable"));
            });
        }
      }
      card.append(header, content);
      if (attachments.childNodes.length) {
        card.appendChild(attachments);
      }
      timeline.appendChild(card);
    }
    if (state.autoScroll) {
      timeline.scrollTop = timeline.scrollHeight;
    }
    const allSelected = state.selectedIds && state.messages.length > 0 && state.selectedIds.size === state.messages.length;
    selectionToggle.textContent = allSelected ? "Clear selection" : "Select all";
    copySelectedBtn.disabled = !state.selectedIds || state.selectedIds.size === 0;
  }

  function renderComposerState(state) {
    if (state.editingId) {
      statusLine.textContent = `Editing message ${state.editingId}`;
      cancelEditBtn.style.display = "";
      postBtn.textContent = "Save changes";
    } else {
      statusLine.textContent = state.status || "";
      cancelEditBtn.style.display = "none";
      postBtn.textContent = "Post";
    }
    const attachments = state.pendingAttachments || [];
    composerAttachments.innerHTML = "";
    for (const att of attachments) {
      const badge = document.createElement("div");
      badge.className = "btn";
      badge.textContent = att.name;
      composerAttachments.appendChild(badge);
    }
    if (state.error) {
      statusLine.classList.add("error");
      statusLine.textContent = state.error;
    } else {
      statusLine.classList.remove("error");
    }
  }

  function renderSettings(state) {
    titleEl.textContent = state.workspaceTitle || "Local Notes Chat";
    pathEl.textContent = state.workspacePath || "";
    const settingsPath = settingsPanel.querySelector("#settings-path");
    settingsPath.textContent = state.workspacePath || "";
    themeRow.right.value = state.preferences.theme || "light";
    fontRow.right.value = state.preferences.fontSizePx || 14;
    diagnosticsBox.textContent = state.diagnostics && state.diagnostics.length ? state.diagnostics.join("\n") : "No diagnostics.";
  }

  function setTheme(theme) {
    const rootEl = document.documentElement;
    if (theme === "dark") {
      rootEl.classList.add("theme-dark");
    } else {
      rootEl.classList.remove("theme-dark");
    }
  }

  function setFontSize(px) {
    if (!px) return;
    document.body.style.fontSize = `${px}px`;
  }

  function update(state) {
    if (!state.hasWorkspace) {
      root.innerHTML = "";
      if (state.error) {
        welcomeStatus.textContent = state.error;
        welcomeStatus.classList.add("error");
      } else {
        welcomeStatus.textContent = state.status || "";
        welcomeStatus.classList.remove("error");
      }
      root.appendChild(welcome);
      return;
    }
    root.innerHTML = "";
    root.append(topBar, layout, settingsPanel);
    setTheme(state.preferences.theme);
    setFontSize(state.preferences.fontSizePx);
    renderSettings(state);
    renderMessages(state);
    renderComposerState(state);
  }

  function focusComposer() {
    composerArea.focus();
  }

  function focusTimeline() {
    timeline.focus();
  }

  return {
    update,
    focusComposer,
    focusTimeline,
    setComposerContent(html) {
      composerArea.innerHTML = html || "";
    },
    clearComposer,
    timelineEl: timeline,
    composerArea
  };
}
