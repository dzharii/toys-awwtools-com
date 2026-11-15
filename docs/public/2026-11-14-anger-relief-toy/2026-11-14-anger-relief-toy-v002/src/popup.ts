import { mountCatalog } from "./ui/catalog";
async function send(type: string, id?: string, options?: unknown): Promise<void> {
  const response = await chrome.runtime.sendMessage({ type, id, options });
  if (!response?.ok) throw new Error("UNSUPPORTED_PAGE");
}
let equippedId: string | undefined;
void chrome.runtime
  .sendMessage({ type: "state" })
  .then((data) => {
    equippedId = typeof data?.equipped === "string" ? data.equipped : undefined;
  })
  .catch(() => {
    equippedId = undefined;
  })
  .then(() =>
    mountCatalog(
      document.querySelector<HTMLElement>("#app")!,
      async (id, options) => {
        await send("launch", id, options);
        window.close();
      },
      {
        equipped: () => equippedId,
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
          void send("stop")
            .then(() => {
              equippedId = undefined;
              const put = document.querySelector<HTMLButtonElement>(".footer .put-away");
              if (put) put.disabled = true;
              document
                .querySelectorAll(".tool")
                .forEach((node) => node.setAttribute("data-equipped", "false"));
              document
                .querySelectorAll(".tool-use")
                .forEach((node) => node.setAttribute("aria-pressed", "false"));
            })
            .catch(() => {});
        },
        clearDiagnostics: () => {
          void send("clear-diagnostics").catch(() => {});
        },
        diagnostics: async () => chrome.runtime.sendMessage({ type: "diagnostics" }),
      },
    ),
  );
