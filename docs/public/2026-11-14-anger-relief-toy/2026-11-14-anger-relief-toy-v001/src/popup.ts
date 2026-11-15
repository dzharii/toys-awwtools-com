import { mountCatalog } from "./ui/catalog";
async function send(type: string, id?: string, options?: unknown): Promise<void> {
  const response = await chrome.runtime.sendMessage({ type, id, options });
  if (!response?.ok) throw new Error("UNSUPPORTED_PAGE");
}
void mountCatalog(
  document.querySelector<HTMLElement>("#app")!,
  async (id, options) => {
    await send("launch", id, options);
    window.close();
  },
  {
    wheel: () => {
      void send("wheel")
        .then(() => window.close())
        .catch(() => {
          const status = document.querySelector(".status");
          if (status)
            status.textContent = "Open an ordinary webpage and click the extension again.";
        });
    },
    stop: () => {
      void send("stop").catch(() => {});
    },
    clearDiagnostics: () => {
      void send("clear-diagnostics").catch(() => {});
    },
    diagnostics: async () => chrome.runtime.sendMessage({ type: "diagnostics" }),
  },
);
