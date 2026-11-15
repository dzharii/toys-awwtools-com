import { catalog } from "./generated/catalog";
import { options, record } from "./sdk/validation";
async function activeTab(sender: chrome.runtime.MessageSender): Promise<number> {
  if (sender.tab?.id !== undefined) {
    if (sender.frameId !== 0) throw new Error("FRAME_UNSUPPORTED");
    return sender.tab.id;
  }
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab?.id === undefined) throw new Error("NO_TAB");
  return tab.id;
}
async function ensure(tabId: number): Promise<void> {
  await chrome.scripting.executeScript({
    target: { tabId },
    world: "ISOLATED",
    files: ["content.js"],
  });
}
async function handle(message: unknown, sender: chrome.runtime.MessageSender): Promise<unknown> {
  if (sender.id !== chrome.runtime.id || !record(message)) return { ok: false };
  const tabId = await activeTab(sender);
  if (message.type === "load") {
    if (!sender.tab || sender.frameId !== 0) return { ok: false };
    const entry = catalog.find((e) => e.id === message.id);
    if (!entry) return { ok: false };
    await chrome.scripting.executeScript({
      target: { tabId },
      world: "ISOLATED",
      files: [`effects/${entry.id}.js`],
    });
    return { ok: true };
  }
  if (message.type === "stop") {
    try {
      await chrome.tabs.sendMessage(tabId, { type: "stop" });
    } catch {
      /* No injected runtime means nothing is running. */
    }
    return { ok: true };
  }
  if (message.type === "clear-diagnostics") {
    try {
      await chrome.tabs.sendMessage(tabId, { type: "clear-diagnostics" });
    } catch {}
    return { ok: true };
  }
  if (message.type === "diagnostics") {
    try {
      return await chrome.tabs.sendMessage(tabId, { type: "report" });
    } catch {
      return { state: "not loaded", events: [] };
    }
  }
  if (message.type === "launch") {
    if (!catalog.some((e) => e.id === message.id)) return { ok: false };
    await ensure(tabId);
    return chrome.tabs.sendMessage(tabId, {
      type: "select",
      id: message.id,
      options: options(message.options),
    });
  }
  if (message.type === "wheel" || message.type === "catalog") {
    await ensure(tabId);
    return chrome.tabs.sendMessage(tabId, { type: "show", mode: message.type });
  }
  return { ok: false };
}
chrome.runtime.onMessage.addListener((message: unknown, sender, respond) => {
  if (
    !record(message) ||
    !["load", "launch", "wheel", "catalog", "stop", "diagnostics", "clear-diagnostics"].includes(
      String(message.type),
    )
  )
    return false;
  void handle(message, sender)
    .then(respond)
    .catch(() => respond({ ok: false, error: "UNSUPPORTED_PAGE" }));
  return true;
});
chrome.commands.onCommand.addListener((command) => {
  if (command === "open-wheel")
    void chrome.tabs
      .query({ active: true, currentWindow: true })
      .then(async ([tab]) => {
        if (tab?.id !== undefined) {
          await ensure(tab.id);
          await chrome.tabs.sendMessage(tab.id, { type: "show", mode: "wheel" });
        }
      })
      .catch(() => {});
});
