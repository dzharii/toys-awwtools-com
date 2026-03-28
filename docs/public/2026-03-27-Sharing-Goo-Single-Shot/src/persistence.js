import { clamp, displayLabelFromUrl, makeId, nowMs } from "./utils.js";

export class PersistenceStore {
  constructor(config) {
    this.config = config;
  }

  load() {
    try {
      const raw = localStorage.getItem(this.config.storageKey);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      const valid = parsed
        .map((item) => this.#sanitizeItem(item))
        .filter(Boolean)
        .slice(0, this.config.maxPersistedItems);
      return valid;
    } catch {
      return [];
    }
  }

  save(items) {
    try {
      const safe = items
        .slice(0, this.config.maxPersistedItems)
        .map((item) => ({
          id: item.id,
          url: item.url,
          label: item.label,
          createdAt: item.createdAt,
          x: item.x,
          y: item.y,
          seed: item.seed,
        }));
      localStorage.setItem(this.config.storageKey, JSON.stringify(safe));
    } catch {
      return;
    }
  }

  createItem(normalizedUrl, point, seed) {
    return {
      id: makeId(),
      url: normalizedUrl,
      label: displayLabelFromUrl(normalizedUrl, this.config.tokens.maxLabelChars),
      createdAt: nowMs(),
      x: clamp(point.x, 0, 1),
      y: clamp(point.y, 0, 1),
      seed,
    };
  }

  deriveSinkProgress(item, now = nowMs()) {
    const age = Math.max(0, now - item.createdAt);
    const { mostlyFloatingMs, noticeableSubmergeMs, mostlyLostMs } = this.config.sink;

    if (age <= mostlyFloatingMs) {
      const t = age / mostlyFloatingMs;
      return Math.pow(t, 3) * 0.2;
    }

    if (age <= noticeableSubmergeMs) {
      const t = (age - mostlyFloatingMs) / Math.max(1, noticeableSubmergeMs - mostlyFloatingMs);
      return 0.2 + Math.pow(t, 1.8) * 0.45;
    }

    if (age <= mostlyLostMs) {
      const t = (age - noticeableSubmergeMs) / Math.max(1, mostlyLostMs - noticeableSubmergeMs);
      return 0.65 + Math.pow(t, 1.25) * 0.35;
    }

    return 1;
  }

  isVisible(item, now = nowMs()) {
    return this.deriveSinkProgress(item, now) < this.config.tokens.visibleThreshold;
  }

  #sanitizeItem(item) {
    if (!item || typeof item !== "object") return null;
    const url = typeof item.url === "string" ? item.url : null;
    const label = typeof item.label === "string" ? item.label : null;
    const id = typeof item.id === "string" ? item.id : null;
    const createdAt = Number(item.createdAt);
    const x = Number(item.x);
    const y = Number(item.y);
    const seed = Number(item.seed);

    if (!url || !label || !id || !Number.isFinite(createdAt)) return null;
    if (!Number.isFinite(x) || !Number.isFinite(y)) return null;

    return {
      id,
      url,
      label,
      createdAt,
      x: clamp(x, 0, 1),
      y: clamp(y, 0, 1),
      seed: Number.isFinite(seed) ? seed : Math.floor(Math.random() * 0xffffffff),
    };
  }
}

