import type { Page } from "@playwright/test";
import type { BrowserDiagnostics } from "../framework/diagnostics";

/** Faults affect only this scenario's browser environment, never production hooks. */
export class BrowserFaults {
  constructor(private readonly page: Page) {}
  async denyLayoutWrites(): Promise<void> {
    await this.page.evaluate(() => {
      const setItem = Storage.prototype.setItem;
      Reflect.set(window, "__acceptanceRejectLayout", true);
      Storage.prototype.setItem = function (key, value) {
        if (key === "gtl.workspace-layout.v1" && Reflect.get(window, "__acceptanceRejectLayout"))
          throw new DOMException("Layout storage blocked.", "SecurityError");
        return setItem.call(this, key, value);
      };
    });
  }
  async restoreLayoutWrites(): Promise<void> {
    await this.page.evaluate(() => Reflect.set(window, "__acceptanceRejectLayout", false));
  }
  async denyCheckpointsAfter(count: number): Promise<void> {
    await this.page.evaluate((limit) => {
      const setItem = Storage.prototype.setItem;
      Reflect.set(window, "__acceptanceRejectCheckpoints", true);
      Storage.prototype.setItem = function (key, bytes) {
        if (key === "gtl.authoring.v1" && Reflect.get(window, "__acceptanceRejectCheckpoints")) {
          const collection: unknown = JSON.parse(bytes);
          if (
            typeof collection === "object" &&
            collection !== null &&
            "records" in collection &&
            Array.isArray(collection.records) &&
            collection.records.some(
              (record: unknown) =>
                typeof record === "object" &&
                record !== null &&
                "checkpoints" in record &&
                Array.isArray(record.checkpoints) &&
                record.checkpoints.length > limit,
            )
          )
            throw new DOMException("Checkpoint quota exceeded.", "QuotaExceededError");
        }
        return setItem.call(this, key, bytes);
      };
    }, count);
  }
  async restoreCheckpointWrites(): Promise<void> {
    await this.page.evaluate(() => Reflect.set(window, "__acceptanceRejectCheckpoints", false));
  }

  async quotaFailure(): Promise<void> {
    await this.page.addInitScript(() => {
      const original = Storage.prototype.setItem;
      Storage.prototype.setItem = function (key: string, value: string) {
        if (key === "gtl.documents.v1" && Reflect.get(window, "__acceptanceRejectWrites")) {
          throw new DOMException("Storage quota exceeded.", "QuotaExceededError");
        }
        original.call(this, key, value);
      };
      Reflect.set(window, "__acceptanceRejectWrites", true);
    });
  }

  async restoreWrites(): Promise<void> {
    await this.page.evaluate(() => Reflect.set(window, "__acceptanceRejectWrites", false));
  }

  async blockedPreferences(): Promise<void> {
    await this.page.addInitScript(() => {
      const original = Storage.prototype.getItem;
      Storage.prototype.getItem = function (key: string) {
        if (key === "gtl.preferences.v1") throw new DOMException("Blocked", "SecurityError");
        return original.call(this, key);
      };
    });
  }

  async unavailableWorker(): Promise<void> {
    await this.page.addInitScript(() => {
      Object.defineProperty(window, "Worker", {
        value: class {
          constructor() {
            throw new Error("Worker blocked by acceptance setup");
          }
        },
      });
    });
  }

  async deniedClipboard(): Promise<void> {
    await this.page.evaluate(() =>
      Object.defineProperty(navigator, "clipboard", {
        configurable: true,
        value: {
          writeText: () => Promise.reject(new DOMException("Denied", "NotAllowedError")),
          write: () => Promise.reject(new DOMException("Denied", "NotAllowedError")),
        },
      }),
    );
  }

  async replaceBundledTemplate(source: string): Promise<void> {
    await this.page.route("**/templates/project-description.gtl", (route) =>
      route.fulfill({ contentType: "text/plain", body: source }),
    );
  }
  async stallTemplateResource(): Promise<() => Promise<void>> {
    const pattern = "**/templates/blank-note.gtl";
    let resume!: () => void;
    const gate = new Promise<void>((resolve) => {
      resume = resolve;
    });
    const pending: Promise<void>[] = [];
    await this.page.route(pattern, (route) => {
      const handled = gate.then(() => route.continue());
      pending.push(handled);
      return handled;
    });
    return async () => {
      resume();
      await Promise.all(pending);
      await this.page.unroute(pattern);
    };
  }

  async blockTemplateResource(
    asset: "blank-note.gtl" | "manifest.json",
    diagnostics: BrowserDiagnostics,
  ): Promise<() => Promise<void>> {
    const pattern = `**/templates/${asset}`;
    const release = diagnostics.allowResourceFailure(
      new URL(`templates/${asset}`, this.page.url()).pathname,
    );
    await this.page.route(pattern, (route) => route.abort("failed"));
    return async () => {
      await this.page.unroute(pattern);
      release();
    };
  }
}
