/** Explicit gray-box storage inspection: UI outcomes remain the acceptance oracle. */
import type { Page } from "@playwright/test";
interface ObservedEffects {
  layoutWrites: number;
  contentTransactions: number;
  workerMessages: number;
}
declare global {
  interface Window {
    __acceptanceEffects?: ObservedEffects;
  }
}

export class BrowserState {
  constructor(private readonly page: Page) {}
  layoutBytes(): Promise<string | null> {
    return this.page.evaluate(() => localStorage.getItem("gtl.workspace-layout.v1"));
  }
  async replaceLayout(bytes: string): Promise<void> {
    await this.page.evaluate(
      (value) => localStorage.setItem("gtl.workspace-layout.v1", value),
      bytes,
    );
  }
  async observeEffects(): Promise<void> {
    await this.page.evaluate(() => {
      const effects = { layoutWrites: 0, contentTransactions: 0, workerMessages: 0 };
      window.__acceptanceEffects = effects;
      const setItem = Storage.prototype.setItem;
      Storage.prototype.setItem = function (key, value) {
        if (key === "gtl.workspace-layout.v1") effects.layoutWrites++;
        if (key === "gtl.documents.v1" || key === "gtl.authoring.v1") effects.contentTransactions++;
        return setItem.call(this, key, value);
      };
      const transaction = IDBDatabase.prototype.transaction;
      IDBDatabase.prototype.transaction = function (stores, mode, options) {
        if (mode === "readwrite") effects.contentTransactions++;
        return transaction.call(this, stores, mode, options);
      };
      const postMessage = Worker.prototype.postMessage;
      Worker.prototype.postMessage = function (
        message: unknown,
        options?: Transferable[] | StructuredSerializeOptions,
      ) {
        effects.workerMessages++;
        return Reflect.apply(postMessage, this, [message, options]);
      };
    });
  }
  effects(): Promise<ObservedEffects> {
    return this.page.evaluate(() => {
      if (!window.__acceptanceEffects)
        throw new Error("Effect observation has not been installed.");
      return window.__acceptanceEffects;
    });
  }

  async records(
    table: "documents" | "authoringDrafts" = "documents",
  ): Promise<Record<string, unknown>[]> {
    return this.page.evaluate(async (tableName) => {
      const db = await new Promise<IDBDatabase>((resolve, reject) => {
        const request = indexedDB.open("guided-document-editor");
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
      try {
        return await new Promise<Record<string, unknown>[]>((resolve, reject) => {
          const request = db.transaction(tableName).objectStore(tableName).getAll();
          request.onsuccess = () => {
            const values: unknown = request.result;
            if (
              !Array.isArray(values) ||
              !values.every(
                (item: unknown): item is Record<string, unknown> =>
                  typeof item === "object" && item !== null && !Array.isArray(item),
              )
            )
              reject(new Error("The observed database did not contain record objects."));
            else resolve(values);
          };
          request.onerror = () => reject(request.error);
        });
      } finally {
        db.close();
      }
    }, table);
  }

  async localRecords(
    table: "documents" | "authoring" = "documents",
  ): Promise<Record<string, unknown>[]> {
    const raw = await this.rawLocal(table);
    if (raw === null) return [];
    const parsed: unknown = JSON.parse(raw);
    if (
      typeof parsed !== "object" ||
      parsed === null ||
      !("records" in parsed) ||
      !Array.isArray(parsed.records) ||
      !parsed.records.every(
        (item: unknown): item is Record<string, unknown> =>
          typeof item === "object" && item !== null && !Array.isArray(item),
      )
    )
      throw new Error("Observed local storage has an invalid current collection shape.");
    return parsed.records;
  }

  rawLocal(table: "documents" | "authoring" = "documents"): Promise<string | null> {
    return this.page.evaluate((name) => localStorage.getItem(`gtl.${name}.v1`), table);
  }

  async corruptLocalCollection(bytes: string): Promise<void> {
    await this.page.evaluate((value) => localStorage.setItem("gtl.documents.v1", value), bytes);
  }

  async clipboardText(): Promise<string> {
    return this.page.evaluate(() => navigator.clipboard.readText());
  }

  async richClipboard(): Promise<{ types: string[]; html: string; text: string }> {
    return this.page.evaluate(async () => {
      const item = (await navigator.clipboard.read())[0];
      if (!item) throw new Error("Clipboard is empty after Rich Copy.");
      return {
        types: [...item.types],
        html: await (await item.getType("text/html")).text(),
        text: await (await item.getType("text/plain")).text(),
      };
    });
  }
}
