import {
  ensureDirectory,
  getFileHandle,
  writeFile,
  readFile,
  listFiles,
  deleteFile,
  copyFileToDirectory
} from "./filesystem.js";

export const SCHEMA_VERSION = 1;

export function formatMessageId(num) {
  return num.toString().padStart(6, "0");
}

async function fileExists(dirHandle, name) {
  try {
    await getFileHandle(dirHandle, name, false);
    return true;
  } catch {
    return false;
  }
}

export async function ensureWorkspace(rootHandle) {
  const messagesDir = await ensureDirectory(rootHandle, "messages");
  const attachmentsDir = await ensureDirectory(rootHandle, "attachments");
  const hasWorkspaceFile = await fileExists(rootHandle, "workspace.json");

  if (!hasWorkspaceFile) {
    const createdAt = new Date().toISOString();
    const meta = {
      schemaVersion: SCHEMA_VERSION,
      title: rootHandle.name || "My Notes Chat",
      createdAt,
      lastOpenedAt: createdAt,
      nextMessageNumericId: 1,
      settings: {
        theme: "light",
        fontSizePx: 14
      }
    };
    const workspaceHandle = await getFileHandle(rootHandle, "workspace.json", true);
    await writeFile(workspaceHandle, meta);
    return { meta, messagesDir, attachmentsDir };
  }

  const workspaceHandle = await getFileHandle(rootHandle, "workspace.json", false);
  const text = await readFile(workspaceHandle);
  const meta = JSON.parse(text);
  if (meta.schemaVersion !== SCHEMA_VERSION) {
    throw new Error("Unsupported workspace schema version");
  }
  meta.lastOpenedAt = new Date().toISOString();
  await writeFile(workspaceHandle, meta);
  return { meta, messagesDir, attachmentsDir };
}

export async function loadMessages(messagesDir) {
  const files = await listFiles(messagesDir, (name) => /^\d{6}\.json$/.test(name));
  const messages = [];
  const diagnostics = [];
  for (const { name, handle } of files) {
    try {
      const text = await readFile(handle);
      const data = JSON.parse(text);
      messages.push(data);
    } catch (err) {
      diagnostics.push(`Failed to read ${name}: ${err?.message || err}`);
    }
  }
  messages.sort((a, b) => {
    const dateA = new Date(a.createdAt).getTime();
    const dateB = new Date(b.createdAt).getTime();
    if (dateA === dateB) return a.id.localeCompare(b.id);
    return dateA - dateB;
  });
  return { messages, diagnostics };
}

async function writeWorkspaceMeta(rootHandle, meta) {
  const handle = await getFileHandle(rootHandle, "workspace.json", true);
  await writeFile(handle, meta);
}

export async function createMessage({ rootHandle, messagesDir, attachmentsDir, meta, contentText, contentHtml, attachments }) {
  const idNum = meta.nextMessageNumericId;
  const id = formatMessageId(idNum);
  const createdAt = new Date().toISOString();
  const message = {
    id,
    createdAt,
    updatedAt: null,
    author: "me",
    contentText,
    contentHtml,
    formatVersion: 1,
    attachments
  };

  const filename = `${id}.json`;
  const fileHandle = await getFileHandle(messagesDir, filename, true);
  await writeFile(fileHandle, message);

  meta.nextMessageNumericId = idNum + 1;
  meta.lastOpenedAt = new Date().toISOString();
  await writeWorkspaceMeta(rootHandle, meta);
  return message;
}

export async function updateMessage({ rootHandle, messagesDir, meta, message }) {
  const fileHandle = await getFileHandle(messagesDir, `${message.id}.json`, false);
  await writeFile(fileHandle, message);
  meta.lastOpenedAt = new Date().toISOString();
  await writeWorkspaceMeta(rootHandle, meta);
}

export async function deleteMessage({ rootHandle, messagesDir, meta, id }) {
  await deleteFile(messagesDir, `${id}.json`);
  meta.lastOpenedAt = new Date().toISOString();
  await writeWorkspaceMeta(rootHandle, meta);
}

export async function copyAttachment({ attachmentsDir, sourceFile, nextIndex }) {
  const ext = sourceFile.name.includes(".") ? sourceFile.name.split(".").pop() : "bin";
  const name = `img-${nextIndex.toString().padStart(6, "0")}.${ext}`;
  await copyFileToDirectory(sourceFile, attachmentsDir, name);
  return { relativePath: `attachments/${name}`, originalFilename: sourceFile.name, generatedName: name };
}

export async function persistWorkspaceMeta(rootHandle, meta) {
  await writeWorkspaceMeta(rootHandle, meta);
}
