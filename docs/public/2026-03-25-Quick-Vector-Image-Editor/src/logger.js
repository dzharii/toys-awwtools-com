import { LOG_LIMIT } from "./constants.js";
import { nowIso } from "./utils.js";

export class AppLogger {
    constructor(limit = LOG_LIMIT) {
        this.limit = limit;
        this.entries = [];
        this.listeners = new Set();
    }

    subscribe(listener) {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    }

    clearView() {
        this.entries = [];
        this.emit();
    }

    getEntries() {
        return [...this.entries];
    }

    info(event, detail = {}) {
        this.log("info", event, detail);
    }

    warn(event, detail = {}) {
        this.log("warn", event, detail);
    }

    error(event, detail = {}) {
        this.log("error", event, detail);
    }

    log(level, event, detail = {}) {
        const entry = {
            timestamp: nowIso(),
            level,
            event,
            detail
        };
        this.entries.push(entry);
        if (this.entries.length > this.limit) {
            this.entries.splice(0, this.entries.length - this.limit);
        }
        const consoleMethod = level === "error" ? "error" : level === "warn" ? "warn" : "log";
        console[consoleMethod](`[VE:${level}] ${event}`, detail);
        this.emit();
    }

    formatEntries() {
        return this.entries
            .map((entry) => `${entry.timestamp} [${entry.level.toUpperCase()}] ${entry.event}\n${safeStringify(entry.detail)}`)
            .join("\n\n");
    }

    emit() {
        for (const listener of this.listeners) {
            listener();
        }
    }
}

function safeStringify(value) {
    try {
        return JSON.stringify(value, null, 2);
    } catch (error) {
        return JSON.stringify({
            stringifyError: String(error),
            fallback: String(value)
        }, null, 2);
    }
}
