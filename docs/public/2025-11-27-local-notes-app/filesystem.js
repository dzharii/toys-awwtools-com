const DB_NAME = "notes-chat-handles";
const DB_VERSION = 1;
const STORE_NAME = "handles";

function openHandleDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    req.onerror = () => reject(req.error);
    req.onsuccess = () => resolve(req.result);
  });
}

async function withStore(mode, fn) {
  const db = await openHandleDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, mode);
    const store = tx.objectStore(STORE_NAME);
    const res = fn(store);
    tx.oncomplete = () => resolve(res instanceof IDBRequest ? res.result : res);
    tx.onerror = () => reject(tx.error);
  });
}

export function fileApisSupported() {
  return typeof window.showDirectoryPicker === "function";
}

export async function saveWorkspaceHandle(handle) {
  return withStore("readwrite", (store) => store.put(handle, "workspace"));
}

export async function loadWorkspaceHandle() {
  return withStore("readonly", (store) => store.get("workspace"));
}

export async function clearWorkspaceHandle() {
  return withStore("readwrite", (store) => store.delete("workspace"));
}

export async function pickWorkspaceDirectory() {
  const handle = await window.showDirectoryPicker({ id: "notes-chat-workspace" });
  return handle;
}

export async function verifyPermission(handle, mode = "readwrite") {
  const opts = { mode };
  if ((await handle.queryPermission(opts)) === "granted") return true;
  if ((await handle.requestPermission(opts)) === "granted") return true;
  return false;
}

export async function ensureDirectory(root, name) {
  return root.getDirectoryHandle(name, { create: true });
}

export async function getFileHandle(dirHandle, name, create = false) {
  return dirHandle.getFileHandle(name, { create });
}

export async function writeFile(fileHandle, content) {
  const writable = await fileHandle.createWritable();
  if (content instanceof Blob) {
    await writable.write(content);
  } else if (typeof content === "string") {
    await writable.write(content);
  } else {
    await writable.write(JSON.stringify(content, null, 2));
  }
  await writable.close();
}

export async function readFile(handle) {
  const file = await handle.getFile();
  const text = await file.text();
  return text;
}

export async function deleteFile(dirHandle, name) {
  await dirHandle.removeEntry(name);
}

export async function listFiles(dirHandle, predicate) {
  const result = [];
  for await (const [name, entry] of dirHandle.entries()) {
    if (predicate && !predicate(name, entry)) continue;
    if (entry.kind === "file") result.push({ name, handle: entry });
  }
  return result;
}

export async function copyFileToDirectory(sourceFile, targetDir, targetName) {
  const target = await targetDir.getFileHandle(targetName, { create: true });
  const writable = await target.createWritable();
  await writable.write(sourceFile);
  await writable.close();
  return target;
}
