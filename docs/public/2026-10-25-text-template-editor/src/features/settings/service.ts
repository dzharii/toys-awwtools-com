/** Bootstrap preferences are independent of document storage and reload across tabs. */
import { AppError, isRecord } from "../../platform/errors";
import { configureLogger, logger } from "../../platform/diagnostics/logger";
import { defaultSettings, isSettings, isValidSetting, settingsSchema } from "./schema";
import type { Settings } from "./schema";
export const SETTINGS_KEY = "gtl.preferences.v1";
export class SettingsService {
  value: Settings = { ...defaultSettings };
  error = "";
  private subscribers = new Set<() => void>();
  private channel =
    typeof BroadcastChannel === "undefined" ? null : new BroadcastChannel("gtl.preferences");
  constructor() {
    this.load();
    window.addEventListener("storage", (event) => {
      if (event.key === SETTINGS_KEY || event.key === null) this.reload();
    });
    this.channel?.addEventListener("message", () => this.reload());
  }
  private load(): void {
    try {
      const raw = localStorage.getItem(SETTINGS_KEY);
      if (raw) {
        const stored: unknown = JSON.parse(raw);
        if (!isRecord(stored) || stored.schemaVersion !== 1 || !isSettings(stored.values)) {
          throw new AppError(
            "INVALID_SETTINGS",
            "Stored preferences are invalid. Defaults are active; the original record has not been replaced.",
          );
        }
        this.value = { ...stored.values };
      } else this.value = { ...defaultSettings };
      this.error = "";
    } catch {
      this.error =
        "Preferences could not be read. Defaults or the last valid settings are active; browser data has not been reset.";
      logger.warn("settings.read.failed");
    }
    configureLogger(this.value);
  }
  private reload(): void {
    this.load();
    this.notify();
  }
  subscribe(listener: () => void): () => void {
    this.subscribers.add(listener);
    return () => this.subscribers.delete(listener);
  }
  private notify(): void {
    for (const subscriber of this.subscribers) subscriber();
  }
  set(id: keyof Settings, value: unknown): void {
    const definition = settingsSchema.find((item) => item.id === id)!;
    if (!isValidSetting(definition, value))
      throw new AppError("INVALID_SETTING", `Choose a valid value for ${definition.title}.`);
    if (this.value[id] === value && !this.error) return;
    const proposed = { ...this.value, [id]: value };
    if (!isSettings(proposed))
      throw new AppError("INVALID_SETTINGS", "These preferences are invalid.");
    this.value = proposed;
    configureLogger(this.value);
    try {
      // Read first: malformed records remain available for manual recovery.
      const raw = localStorage.getItem(SETTINGS_KEY);
      if (raw) {
        const stored: unknown = JSON.parse(raw);
        if (!isRecord(stored) || stored.schemaVersion !== 1 || !isSettings(stored.values))
          throw new AppError("INVALID_SETTINGS", "The stored preferences are invalid.");
      }
      localStorage.setItem(SETTINGS_KEY, JSON.stringify({ schemaVersion: 1, values: this.value }));
      this.error = "";
      this.channel?.postMessage({ changed: true });
    } catch {
      this.error =
        "Preferences apply in this tab, but could not be saved or shared. Check browser storage permissions.";
      logger.warn("settings.write.failed");
    }
    this.notify();
  }
}
