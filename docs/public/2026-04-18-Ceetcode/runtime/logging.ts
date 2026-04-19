import { localStorageKeys } from "./types";

export const loggingLevels = ["error", "warn", "info"] as const;
export type LoggingLevel = (typeof loggingLevels)[number];

export const loggingFormatterNames = ["plain", "emoji", "segments"] as const;
export type LoggingFormatterName = (typeof loggingFormatterNames)[number];

const projectMarker = "🍇";
const projectLabel = "Ceetcode";
const loggingStorageKey = localStorageKeys.loggingSettings;

const levelWeight: Record<LoggingLevel, number> = {
  error: 0,
  warn: 1,
  info: 2
};

export interface LoggingSettings {
  level: LoggingLevel;
  formatter: LoggingFormatterName;
  useDecorativeEmoji: boolean;
  useLabelBackgrounds: boolean;
}

export interface LogOptions {
  subcategory?: string;
  context?: Record<string, unknown>;
}

export interface Logger {
  info: (message: string, options?: LogOptions) => void;
  warn: (message: string, options?: LogOptions) => void;
  error: (message: string, options?: LogOptions) => void;
  withSubcategory: (subcategory: string) => Logger;
}

type SettingsListener = (next: LoggingSettings) => void;

interface LogEvent {
  level: LoggingLevel;
  category: string;
  subcategory: string;
  message: string;
  context?: Record<string, unknown>;
  timestamp: Date;
}

type LogFormatter = (event: LogEvent, settings: LoggingSettings) => unknown[];

const defaultLoggingSettings: LoggingSettings = {
  level: "error",
  formatter: "segments",
  useDecorativeEmoji: true,
  useLabelBackgrounds: true
};

const listeners = new Set<SettingsListener>();
let currentSettings = loadPersistedSettings();

function cloneSettings(settings: LoggingSettings): LoggingSettings {
  return {
    level: settings.level,
    formatter: settings.formatter,
    useDecorativeEmoji: settings.useDecorativeEmoji,
    useLabelBackgrounds: settings.useLabelBackgrounds
  };
}

function getStorage(): Storage | null {
  if (typeof window === "undefined") {
    return null;
  }
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function isLoggingLevel(value: unknown): value is LoggingLevel {
  return typeof value === "string" && (loggingLevels as readonly string[]).includes(value);
}

function isLoggingFormatterName(value: unknown): value is LoggingFormatterName {
  return typeof value === "string" && (loggingFormatterNames as readonly string[]).includes(value);
}

function normalizeSettings(input: Partial<LoggingSettings>): LoggingSettings {
  return {
    level: isLoggingLevel(input.level) ? input.level : defaultLoggingSettings.level,
    formatter: isLoggingFormatterName(input.formatter) ? input.formatter : defaultLoggingSettings.formatter,
    useDecorativeEmoji:
      typeof input.useDecorativeEmoji === "boolean" ? input.useDecorativeEmoji : defaultLoggingSettings.useDecorativeEmoji,
    useLabelBackgrounds:
      typeof input.useLabelBackgrounds === "boolean" ? input.useLabelBackgrounds : defaultLoggingSettings.useLabelBackgrounds
  };
}

function loadPersistedSettings(): LoggingSettings {
  const storage = getStorage();
  if (!storage) {
    return cloneSettings(defaultLoggingSettings);
  }

  try {
    const raw = storage.getItem(loggingStorageKey);
    if (!raw) {
      return cloneSettings(defaultLoggingSettings);
    }
    const parsed = JSON.parse(raw) as Partial<LoggingSettings>;
    return normalizeSettings(parsed);
  } catch {
    return cloneSettings(defaultLoggingSettings);
  }
}

function persistSettings(settings: LoggingSettings): void {
  const storage = getStorage();
  if (!storage) {
    return;
  }
  try {
    storage.setItem(loggingStorageKey, JSON.stringify(settings));
  } catch {
    // Storage can be unavailable in privacy-restricted contexts.
  }
}

function notifySettings(next: LoggingSettings): void {
  const snapshot = cloneSettings(next);
  for (const listener of listeners) {
    listener(snapshot);
  }
}

function localIsoLike(timestamp: Date): string {
  const pad2 = (value: number): string => String(value).padStart(2, "0");
  const pad3 = (value: number): string => String(value).padStart(3, "0");
  const year = timestamp.getFullYear();
  const month = pad2(timestamp.getMonth() + 1);
  const day = pad2(timestamp.getDate());
  const hours = pad2(timestamp.getHours());
  const minutes = pad2(timestamp.getMinutes());
  const seconds = pad2(timestamp.getSeconds());
  const millis = pad3(timestamp.getMilliseconds());
  const offsetMinutes = -timestamp.getTimezoneOffset();
  const sign = offsetMinutes >= 0 ? "+" : "-";
  const absOffset = Math.abs(offsetMinutes);
  const tzHours = pad2(Math.floor(absOffset / 60));
  const tzMinutes = pad2(absOffset % 60);
  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.${millis}${sign}${tzHours}:${tzMinutes}`;
}

function compactJson(value: Record<string, unknown>): string {
  try {
    return JSON.stringify(value, (_key, raw) => {
      if (typeof raw === "bigint") return raw.toString();
      if (raw instanceof Error) {
        return {
          name: raw.name,
          message: raw.message,
          stack: raw.stack?.split("\n").slice(0, 4).join(" | ")
        };
      }
      if (typeof raw === "string") {
        return raw.length > 180 ? `${raw.slice(0, 177)}...` : raw;
      }
      if (Array.isArray(raw)) {
        if (raw.length <= 12) return raw;
        return [...raw.slice(0, 12), `...(${raw.length - 12} more)`];
      }
      if (raw && typeof raw === "object") {
        const entries = Object.entries(raw as Record<string, unknown>);
        if (entries.length <= 12) return raw;
        const compact: Record<string, unknown> = {};
        for (const [key, entryValue] of entries.slice(0, 12)) {
          compact[key] = entryValue;
        }
        compact.__moreKeys = entries.length - 12;
        return compact;
      }
      return raw;
    });
  } catch {
    return "{\"context\":\"unserializable\"}";
  }
}

function levelLabel(level: LoggingLevel): string {
  return level.toUpperCase();
}

function scopeLabel(event: LogEvent, useDecorativeEmoji: boolean): string {
  const scope = `${event.category}/${event.subcategory}`;
  if (!useDecorativeEmoji) {
    return scope;
  }
  const emojiMap: Record<string, string> = {
    App: "🧭",
    UI: "🖱️",
    Run: "🏁",
    Worker: "🧵",
    WorkerClient: "🧵",
    Harness: "🧪",
    Persistence: "💾",
    Settings: "⚙️",
    Runtime: "🛠️",
    Network: "🌐"
  };
  const marker = emojiMap[event.category] ?? "🔹";
  return `${marker} ${scope}`;
}

function plainFormatter(event: LogEvent, settings: LoggingSettings): unknown[] {
  const prefix = `${projectMarker}[${projectLabel}][${levelLabel(event.level)}][${scopeLabel(event, settings.useDecorativeEmoji)}]`;
  const contextPart = event.context ? ` ${compactJson(event.context)}` : "";
  const timestampPart = ` (${localIsoLike(event.timestamp)})`;
  return [`${prefix} ${event.message}${contextPart}${timestampPart}`];
}

function emojiFormatter(event: LogEvent, settings: LoggingSettings): unknown[] {
  const scope = scopeLabel(event, settings.useDecorativeEmoji);
  const head = `${projectMarker}[${projectLabel}][${levelLabel(event.level)}][${scope}]`;
  const contextPart = event.context ? ` ${compactJson(event.context)}` : "";
  return [`${head} ${event.message}${contextPart} (${localIsoLike(event.timestamp)})`];
}

function segmentStyle(baseColor: string, useBackground: boolean): string {
  if (!useBackground) {
    return `color:${baseColor};font-weight:600;`;
  }
  return `color:${baseColor};background:color-mix(in srgb, ${baseColor} 14%, transparent);padding:1px 4px;border-radius:4px;font-weight:700;`;
}

function segmentsFormatter(event: LogEvent, settings: LoggingSettings): unknown[] {
  const levelColor =
    event.level === "error" ? "#b42318" : event.level === "warn" ? "#b54708" : "#175cd3";
  const scope = scopeLabel(event, settings.useDecorativeEmoji);
  const contextText = event.context ? compactJson(event.context) : "";
  const timestamp = localIsoLike(event.timestamp);

  const format =
    `%c${projectMarker} ${projectLabel}` +
    `%c ${levelLabel(event.level)}` +
    `%c ${scope}` +
    `%c ${event.message}` +
    (contextText ? `%c ${contextText}` : "") +
    `%c ${timestamp}`;

  const args: unknown[] = [
    format,
    segmentStyle("#5e35b1", settings.useLabelBackgrounds),
    segmentStyle(levelColor, settings.useLabelBackgrounds),
    segmentStyle("#0f766e", settings.useLabelBackgrounds),
    "color:#101828;font-weight:500;",
    "color:#667085;font-family:ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;"
  ];

  if (contextText) {
    args.splice(5, 0, "color:#155eef;font-family:ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;");
  }

  return args;
}

const formatters: Record<LoggingFormatterName, LogFormatter> = {
  plain: plainFormatter,
  emoji: emojiFormatter,
  segments: segmentsFormatter
};

function shouldRender(level: LoggingLevel, threshold: LoggingLevel): boolean {
  return levelWeight[level] <= levelWeight[threshold];
}

function emitLog(event: LogEvent): void {
  const settings = currentSettings;
  if (!shouldRender(event.level, settings.level)) {
    return;
  }

  const formatter = formatters[settings.formatter] ?? formatters.segments;
  const rendered = formatter(event, settings);
  console.log(...rendered);
}

function normalizeLabel(value: string, fallback: string): string {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : fallback;
}

function write(level: LoggingLevel, category: string, baseSubcategory: string, message: string, options?: LogOptions): void {
  const event: LogEvent = {
    level,
    category: normalizeLabel(category, "General"),
    subcategory: normalizeLabel(options?.subcategory ?? baseSubcategory, "General"),
    message: normalizeLabel(message, "(empty message)"),
    context: options?.context,
    timestamp: new Date()
  };
  emitLog(event);
}

export function getLoggingSettings(): LoggingSettings {
  return cloneSettings(currentSettings);
}

export function setLoggingSettings(next: LoggingSettings): LoggingSettings {
  const normalized = normalizeSettings(next);
  currentSettings = normalized;
  persistSettings(normalized);
  notifySettings(normalized);
  return cloneSettings(normalized);
}

export function updateLoggingSettings(patch: Partial<LoggingSettings>): LoggingSettings {
  return setLoggingSettings({ ...currentSettings, ...patch });
}

export function subscribeLoggingSettings(listener: SettingsListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function createLogger(category: string, defaultSubcategory = "General"): Logger {
  const normalizedCategory = normalizeLabel(category, "General");
  const normalizedSubcategory = normalizeLabel(defaultSubcategory, "General");

  return {
    info: (message, options) => write("info", normalizedCategory, normalizedSubcategory, message, options),
    warn: (message, options) => write("warn", normalizedCategory, normalizedSubcategory, message, options),
    error: (message, options) => write("error", normalizedCategory, normalizedSubcategory, message, options),
    withSubcategory: (subcategory) => createLogger(normalizedCategory, subcategory)
  };
}
