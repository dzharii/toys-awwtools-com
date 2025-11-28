import {
  fileApisSupported,
  pickWorkspaceDirectory,
  verifyPermission,
  saveWorkspaceHandle,
  loadWorkspaceHandle,
  clearWorkspaceHandle,
  deleteFile
} from "./filesystem.js";
import {
  ensureWorkspace,
  loadMessages,
  createMessage,
  updateMessage,
  deleteMessage as removeMessageFile,
  copyAttachment,
  persistWorkspaceMeta
} from "./workspace.js";
import { createUI } from "./ui.js";
import { sanitizeComposerHtml, getContentText } from "./formatting.js";

const PREF_KEY = "notes-chat-preferences";

function getStoredPreferences() {
  try {
    const raw = localStorage.getItem(PREF_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function storePreferences(prefs) {
  try {
    localStorage.setItem(PREF_KEY, JSON.stringify(prefs));
  } catch {
    // ignore
  }
}

let appState = {
  hasWorkspace: false,
  workspaceTitle: "",
  workspacePath: "",
  meta: null,
  messages: [],
  diagnostics: [],
  preferences: { theme: "light", fontSizePx: 14 },
  pendingAttachments: [],
  editingId: null,
  status: "",
  error: "",
  autoScroll: false,
  selectedIds: new Set()
};

const handles = {
  root: null,
  messagesDir: null,
  attachmentsDir: null
};

const attachmentUrlCache = new Map();

const actions = {
  onSelectWorkspace: () => selectWorkspace(false),
  onSwitchWorkspace: () => selectWorkspace(true),
  onPost: () => postOrSave(),
  onAttach: (files) => addAttachments(files),
  onEdit: (id) => beginEdit(id),
  onDelete: (id) => deleteMessageFlow(id),
  onCancelEdit: () => cancelEdit(),
  onThemeChange: (theme) => updateTheme(theme),
  onFontSizeChange: (size) => updateFontSize(size),
  onToggleSelect: (id) => toggleSelect(id),
  onToggleSelectAll: () => toggleSelectAll(),
  onCopySelected: () => copySelected(),
  resolveAttachmentUrl: (relativePath) => resolveAttachment(relativePath)
};

const ui = createUI(actions);

function setState(updates) {
  appState = { ...appState, ...updates };
  ui.update(appState);
}

function clearAttachmentCache() {
  for (const url of attachmentUrlCache.values()) {
    URL.revokeObjectURL(url);
  }
  attachmentUrlCache.clear();
}

async function selectWorkspace(force) {
  if (!fileApisSupported()) {
    setState({ error: "This browser does not support required file system APIs.", status: "" });
    return;
  }
  try {
    const handle = await pickWorkspaceDirectory();
    await prepareWorkspace(handle);
    await saveWorkspaceHandle(handle);
  } catch (err) {
    if (force) setState({ error: err?.message || String(err) });
  }
}

async function prepareWorkspace(rootHandle) {
  const hasPerm = await verifyPermission(rootHandle, "readwrite");
  if (!hasPerm) {
    setState({ error: "Permission to folder denied.", status: "" });
    return;
  }
  const { meta, messagesDir, attachmentsDir } = await ensureWorkspace(rootHandle);
  const { messages, diagnostics } = await loadMessages(messagesDir);
  handles.root = rootHandle;
  handles.messagesDir = messagesDir;
  handles.attachmentsDir = attachmentsDir;
  clearAttachmentCache();
  const storedPrefs = getStoredPreferences();
  const prefs = {
    theme: meta.settings?.theme || storedPrefs.theme || "light",
    fontSizePx: meta.settings?.fontSizePx || storedPrefs.fontSizePx || 14
  };
  setState({
    hasWorkspace: true,
    workspaceTitle: meta.title || "Local Notes Chat",
    workspacePath: rootHandle.name || "",
    meta,
    messages,
    diagnostics,
    preferences: prefs,
    pendingAttachments: [],
    editingId: null,
    status: "",
    error: "",
    autoScroll: true,
    selectedIds: new Set()
  });
  ui.clearComposer();
  ui.focusComposer();
}

async function bootstrap() {
  if (!fileApisSupported()) {
    setState({ hasWorkspace: false, status: "Unsupported browser. File System Access API is required.", error: "" });
    return;
  }
  const saved = await loadWorkspaceHandle().catch(() => null);
  if (saved) {
    const permitted = await verifyPermission(saved, "readwrite");
    if (permitted) {
      await prepareWorkspace(saved);
      return;
    }
  }
  setState({ hasWorkspace: false, status: "Select a folder to begin.", error: "" });
}

async function addAttachments(files) {
  setState({ pendingAttachments: [...appState.pendingAttachments, ...files], status: "" });
}

async function getNextAttachmentIndex() {
  const files = await listAttachmentFiles();
  let max = 0;
  for (const name of files) {
    const match = name.match(/img-(\d+)\./);
    if (match) {
      max = Math.max(max, Number(match[1]));
    }
  }
  return max + 1;
}

async function listAttachmentFiles() {
  const entries = [];
  if (!handles.attachmentsDir) return entries;
  for await (const [name, entry] of handles.attachmentsDir.entries()) {
    if (entry.kind === "file") entries.push(name);
  }
  return entries;
}

async function copyPendingAttachments() {
  const pending = appState.pendingAttachments || [];
  if (!pending.length) return [];
  let next = await getNextAttachmentIndex();
  const created = [];
  const metadata = [];
  try {
    for (const file of pending) {
      const res = await copyAttachment({
        attachmentsDir: handles.attachmentsDir,
        sourceFile: file,
        nextIndex: next
      });
      metadata.push({
        type: "image",
        relativePath: res.relativePath,
        originalFilename: res.originalFilename
      });
      created.push(res.generatedName);
      next += 1;
    }
    return metadata;
  } catch (err) {
    for (const name of created) {
      try {
        await deleteFile(handles.attachmentsDir, name);
      } catch {
        // ignore cleanup errors
      }
    }
    throw err;
  }
}

async function postOrSave() {
  const composerEl = ui.composerArea;
  const contentHtml = sanitizeComposerHtml(composerEl);
  const contentText = getContentText(composerEl);
  if (!handles.root) {
    setState({ error: "No workspace selected." });
    return;
  }
  if (!contentText.trim()) {
    setState({ error: "Message is empty." });
    return;
  }
  try {
    if (appState.editingId) {
      const message = appState.messages.find((m) => m.id === appState.editingId);
      if (!message) {
        setState({ error: "Message not found." });
        return;
      }
      const updated = {
        ...message,
        contentHtml,
        contentText: contentText.trim(),
        updatedAt: new Date().toISOString()
      };
      await updateMessage({
        rootHandle: handles.root,
        messagesDir: handles.messagesDir,
        meta: appState.meta,
        message: updated
      });
      const messages = appState.messages.map((m) => (m.id === updated.id ? updated : m));
      setState({
        messages,
        editingId: null,
        pendingAttachments: [],
        error: "",
        status: "Saved changes.",
        autoScroll: false
      });
      ui.clearComposer();
      return;
    }

    const attachmentsMeta = await copyPendingAttachments();
    const message = await createMessage({
      rootHandle: handles.root,
      messagesDir: handles.messagesDir,
      attachmentsDir: handles.attachmentsDir,
      meta: appState.meta,
      contentText: contentText.trim(),
      contentHtml,
      attachments: attachmentsMeta
    });
    setState({
      messages: [...appState.messages, message],
      pendingAttachments: [],
      error: "",
      status: "Message posted.",
      autoScroll: true
    });
    ui.clearComposer();
    ui.focusComposer();
  } catch (err) {
    setState({ error: err?.message || String(err) });
  }
}

async function beginEdit(id) {
  const message = appState.messages.find((m) => m.id === id);
  if (!message) return;
  setState({ editingId: id, status: "", error: "", pendingAttachments: [] });
  ui.setComposerContent(message.contentHtml);
  ui.focusComposer();
}

function cancelEdit() {
  setState({ editingId: null, pendingAttachments: [], status: "", error: "" });
  ui.clearComposer();
}

async function deleteMessageFlow(id) {
  if (!confirm("Delete this message? Attachments stay on disk.")) return;
  try {
    await removeMessageFile({
      rootHandle: handles.root,
      messagesDir: handles.messagesDir,
      meta: appState.meta,
      id
    });
    const messages = appState.messages.filter((m) => m.id !== id);
    const selected = new Set(appState.selectedIds);
    selected.delete(id);
    setState({ messages, status: "Message deleted.", autoScroll: false, selectedIds: selected });
  } catch (err) {
    setState({ error: err?.message || String(err) });
  }
}

async function resolveAttachment(relativePath) {
  if (attachmentUrlCache.has(relativePath)) return attachmentUrlCache.get(relativePath);
  const parts = relativePath.split("/");
  const filename = parts[parts.length - 1];
  const handle = await handles.attachmentsDir.getFileHandle(filename);
  const file = await handle.getFile();
  const url = URL.createObjectURL(file);
  attachmentUrlCache.set(relativePath, url);
  return url;
}

async function updateTheme(theme) {
  const meta = appState.meta;
  if (meta?.settings) {
    meta.settings.theme = theme;
    await persistWorkspaceMeta(handles.root, meta);
  }
  const prefs = { ...appState.preferences, theme };
  storePreferences(prefs);
  setState({ preferences: prefs });
}

async function updateFontSize(size) {
  const meta = appState.meta;
  if (meta?.settings) {
    meta.settings.fontSizePx = size;
    await persistWorkspaceMeta(handles.root, meta);
  }
  const prefs = { ...appState.preferences, fontSizePx: size };
  storePreferences(prefs);
  setState({ preferences: prefs });
}

function toggleSelect(id) {
  const selected = new Set(appState.selectedIds || []);
  if (selected.has(id)) {
    selected.delete(id);
  } else {
    selected.add(id);
  }
  setState({ selectedIds: selected, status: "" });
}

function toggleSelectAll() {
  if (!appState.messages?.length) return;
  const allSelected = appState.selectedIds && appState.selectedIds.size === appState.messages.length;
  const selected = allSelected ? new Set() : new Set(appState.messages.map((m) => m.id));
  setState({ selectedIds: selected, status: "" });
}

async function copySelected() {
  const ids = Array.from(appState.selectedIds || []);
  if (!ids.length) return;
  const selectedMessages = appState.messages.filter((m) => ids.includes(m.id));
  if (!selectedMessages.length) return;
  const htmlParts = [];
  const textParts = [];
  for (const msg of selectedMessages) {
    const ts = new Date(msg.createdAt);
    const displayTs = ts.toLocaleString();
    htmlParts.push(`<div><div><strong>${displayTs}</strong></div>${msg.contentHtml}</div>`);
    textParts.push(`${displayTs}\n${msg.contentText}`);
  }
  const html = htmlParts.join("<hr>");
  const text = textParts.join("\n\n");
  try {
    if (navigator.clipboard && navigator.clipboard.write) {
      const item = new ClipboardItem({
        "text/html": new Blob([html], { type: "text/html" }),
        "text/plain": new Blob([text], { type: "text/plain" })
      });
      await navigator.clipboard.write([item]);
    } else if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
    } else {
      throw new Error("Clipboard API not available.");
    }
    setState({ status: "Copied selected messages.", error: "" });
  } catch (err) {
    setState({ error: err?.message || String(err) });
  }
}

window.addEventListener("keydown", (e) => {
  if (e.ctrlKey && e.key.toLowerCase() === "l") {
    e.preventDefault();
    ui.focusComposer();
  }
  if (e.ctrlKey && e.key === "Enter") {
    e.preventDefault();
    actions.onPost();
  }
  if (e.key === "Escape") {
    ui.focusTimeline();
  }
});

document.addEventListener("DOMContentLoaded", () => {
  bootstrap();
});
