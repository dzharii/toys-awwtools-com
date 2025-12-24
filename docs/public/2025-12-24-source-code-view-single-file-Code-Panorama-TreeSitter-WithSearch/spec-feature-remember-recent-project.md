2025-12-22

What you are using in Edge is the File System Access API (Chromium). Historically, the reason you get prompted again after a reload is that access was session-scoped: access generally lasted until you closed the last tab for that origin, and then the next time you opened the app you had to re-grant access. ([Chrome for Developers][1])

There are now two separate pieces you can implement: remembering the last opened folder, and (when the browser allows it) keeping permissions from expiring.

Remembering which project (folder) was opened is done by storing the directory handle you got from `showDirectoryPicker()` in IndexedDB. Chromium browsers allow FileSystemHandle objects to be stored in IndexedDB, and this is how apps like vscode.dev remember “recent folders”. ([Chrome for Developers][1])

On startup you load that stored handle from IndexedDB, then check whether the handle is still usable via `queryPermission({ mode: "read" })`. If it is not granted, you can call `requestPermission(...)`, but that call still requires a user gesture (for example a click) in normal web pages. ([MDN Web Docs][2])

Separately, Chromium introduced “persistent permissions” for the File System Access API. When this is available, the browser prompt can include an option like “Allow on every visit”, which lets the user grant ongoing access that survives restarts until they revoke it. This behavior is described as launching in Chromium starting around Chrome 122 (and it also existed behind flags earlier). Edge tracks Chromium, so on sufficiently new Edge versions you should see the same style of prompt and behavior when it is enabled/available. ([Chrome for Developers][1])

About opening in read-only mode: yes, you can explicitly request read-only access. `showDirectoryPicker()` supports a `mode` option that defaults to `"read"` (read-only) and can be set to `"readwrite"` when you actually want write access. ([MDN Web Docs][3])  Likewise, `requestPermission()` lets you request `"read"` vs `"readwrite"` (and it also requires a user gesture). ([MDN Web Docs][2])  If you always use `mode: "read"` and never request `"readwrite"`, the platform will not grant write permission to your origin for that handle, and you will not be able to create writable streams for editing.

A practical pattern is below. This both “remembers the project” (handle persisted in IndexedDB) and keeps you in read-only mode. It also gracefully handles the case where permissions are not currently granted, by deferring the prompt to a user gesture.

```js
// Minimal IndexedDB helper (you can swap this for idb, Dexie, etc.)
function openDb() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open("myapp-db", 1);
    req.onupgradeneeded = () => req.result.createObjectStore("kv");
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}
async function kvGet(key) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("kv", "readonly");
    const req = tx.objectStore("kv").get(key);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}
async function kvSet(key, value) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("kv", "readwrite");
    tx.objectStore("kv").put(value, key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

// Call this from a user gesture (e.g., button click) when needed.
async function pickProjectDirectoryReadOnly() {
  const dirHandle = await window.showDirectoryPicker({
    id: "myapp-project",   // helps the picker reopen near the last place for this id
    mode: "read",          // explicit read-only
  });
  await kvSet("projectDir", dirHandle);
  return dirHandle;
}

async function loadRememberedProjectDirectoryReadOnly() {
  const dirHandle = await kvGet("projectDir");
  if (!dirHandle) return null;

  // If persistent permissions are available and the user chose "Allow on every visit",
  // this may already be "granted" after a restart.
  const state = await dirHandle.queryPermission({ mode: "read" });
  if (state === "granted") return dirHandle;

  // Not granted. Do NOT auto-call requestPermission here unless you are in a user gesture.
  return null;
}
```

Two extra details that matter for the UX you want.

First, the `id` option does not grant permission by itself; it just lets the browser remember where to open the picker for that “slot” in the future. ([MDN Web Docs][3])  It complements storing the handle in IndexedDB, but it does not replace it.

Second, if what you actually want is “no permission prompts ever”, the user-visible file system cannot guarantee that, because it is designed to require explicit user consent and allow easy revocation. If your “project” can live inside browser storage instead of a user-chosen folder, consider the Origin Private File System (OPFS), which does not use file picker permissions because it is not user-visible; it is an origin-scoped virtual filesystem accessed via `navigator.storage.getDirectory()`. ([web.dev][4])

[1]: https://developer.chrome.com/blog/persistent-permissions-for-the-file-system-access-api "Persistent permissions for the File System Access API  |  Blog  |  Chrome for Developers"
[2]: https://developer.mozilla.org/en-US/docs/Web/API/FileSystemHandle/requestPermission "FileSystemHandle: requestPermission() method - Web APIs | MDN"
[3]: https://developer.mozilla.org/en-US/docs/Web/API/Window/showDirectoryPicker "Window: showDirectoryPicker() method - Web APIs | MDN"
[4]: https://web.dev/articles/origin-private-file-system?utm_source=chatgpt.com "The origin private file system | Articles"
