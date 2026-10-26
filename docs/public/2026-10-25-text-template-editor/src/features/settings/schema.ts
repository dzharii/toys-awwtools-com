/** Declarative settings are the single source for defaults, validation, and UI. */
export type StorageMode = "indexeddb" | "local" | "memory";
export interface Settings {
  theme: "dark" | "light";
  background: "plain" | "sage" | "dusk";
  density: "comfortable" | "compact";
  guidance: boolean;
  keyboardHelp: boolean;
  storageMode: StorageMode;
  autosaveSeconds: number;
  logLevel: "error" | "warn" | "info" | "debug";
  logFormatter: "styled" | "plain";
}
export interface SettingDefinition {
  id: keyof Settings;
  category: string;
  title: string;
  description: string;
  control: "select" | "number" | "checkbox";
  default: string | number | boolean;
  options?: { value: string; label: string }[];
  min?: number;
  max?: number;
}
const options = (pairs: [string, string][]) => pairs.map(([value, label]) => ({ value, label }));
export const settingsSchema: SettingDefinition[] = [
  {
    id: "theme",
    category: "Appearance",
    title: "Theme",
    description: "Choose a comfortable reading surface.",
    control: "select",
    default: "dark",
    options: options([
      ["dark", "Dark"],
      ["light", "Light"],
    ]),
  },
  {
    id: "background",
    category: "Appearance",
    title: "Background",
    description: "Subtle, original color studies. Never included in exports.",
    control: "select",
    default: "plain",
    options: options([
      ["plain", "Plain charcoal"],
      ["sage", "Quiet garden"],
      ["dusk", "Evening light"],
    ]),
  },
  {
    id: "density",
    category: "Appearance",
    title: "Visual density",
    description: "A little more space, or a little less.",
    control: "select",
    default: "comfortable",
    options: options([
      ["comfortable", "Comfortable"],
      ["compact", "Compact"],
    ]),
  },
  {
    id: "guidance",
    category: "Editing",
    title: "Show guidance",
    description: "Keep questions and examples open beside your document.",
    control: "checkbox",
    default: true,
  },
  {
    id: "keyboardHelp",
    category: "Editing",
    title: "Show keyboard hints",
    description: "Display arrow-key navigation reminders below the value editor.",
    control: "checkbox",
    default: true,
  },
  {
    id: "storageMode",
    category: "Storage",
    title: "Storage mode",
    description:
      "Changing stores never migrates or deletes documents. Old-store work stays in this tab; switch back to edit it. Memory-only content disappears when this tab closes.",
    control: "select",
    default: "indexeddb",
    options: options([
      ["indexeddb", "IndexedDB (recommended)"],
      ["local", "Browser localStorage (small collections)"],
      ["memory", "Memory only (this tab)"],
    ]),
  },
  {
    id: "autosaveSeconds",
    category: "Storage",
    title: "Autosave interval",
    description:
      "Seconds between save opportunities for changed documents. Navigation also attempts a save; a crash may lose unsaved changes.",
    control: "number",
    default: 60,
    min: 1,
    max: 3600,
  },
  {
    id: "logLevel",
    category: "Diagnostics",
    title: "Console verbosity",
    description: "Local diagnostics only. Document text and answers are never logged.",
    control: "select",
    default: "info",
    options: options([
      ["error", "Errors"],
      ["warn", "Warnings"],
      ["info", "Information"],
      ["debug", "Debug"],
    ]),
  },
  {
    id: "logFormatter",
    category: "Diagnostics",
    title: "Console formatter",
    description: "Choose styled or plain browser-console output.",
    control: "select",
    default: "styled",
    options: options([
      ["styled", "Styled"],
      ["plain", "Plain"],
    ]),
  },
];
function schemaDefaults(): Settings {
  const values: unknown = Object.fromEntries(settingsSchema.map((item) => [item.id, item.default]));
  if (!isSettings(values)) throw new Error("The settings schema contains invalid defaults.");
  return values;
}
export const defaultSettings: Settings = schemaDefaults();
export function isValidSetting(definition: SettingDefinition, value: unknown): boolean {
  if (definition.control === "checkbox") return typeof value === "boolean";
  if (definition.control === "number")
    return (
      typeof value === "number" &&
      Number.isInteger(value) &&
      value >= definition.min! &&
      value <= definition.max!
    );
  return (
    typeof value === "string" && !!definition.options?.some((option) => option.value === value)
  );
}
export function isSettings(value: unknown): value is Settings {
  return (
    typeof value === "object" &&
    value !== null &&
    settingsSchema.every((definition) =>
      isValidSetting(definition, Reflect.get(value, definition.id)),
    )
  );
}
