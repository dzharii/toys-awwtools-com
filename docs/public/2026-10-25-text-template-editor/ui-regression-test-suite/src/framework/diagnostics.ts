import type { BrowserContext, Page } from "@playwright/test";

interface Diagnostic {
  pageId: number;
  kind: "pageerror" | "crash" | "console" | "resource";
  message: string;
  critical: boolean;
  expected: boolean;
}

function pathOf(url: string): string {
  try {
    return new URL(url).pathname;
  } catch {
    return "";
  }
}

function boundedMessage(message: string): string {
  return message.replace(/https?:\/\/[^\s)]+/g, "[url]").slice(0, 600);
}

export class BrowserDiagnostics {
  readonly entries: Diagnostic[] = [];
  private readonly pages = new WeakMap<Page, number>();
  private pageCount = 0;
  private readonly expectedResources = new Set<string>();
  private criticalCount = 0;
  private readonly criticalSamples: Diagnostic[] = [];

  constructor(
    context: BrowserContext,
    readonly identity: string,
  ) {
    for (const page of context.pages()) this.attach(page);
    context.on("page", (page) => this.attach(page));
  }

  identityOf(page: Page): string {
    this.attach(page);
    return `${this.identity}/page-${this.pages.get(page)}`;
  }

  allowResourceFailure(path: string): () => void {
    this.expectedResources.add(path);
    return () => this.expectedResources.delete(path);
  }

  private record(entry: Diagnostic): void {
    const bounded = { ...entry, message: boundedMessage(entry.message) };
    if (entry.critical && !entry.expected) {
      this.criticalCount++;
      if (this.criticalSamples.length < 5) this.criticalSamples.push(bounded);
    }
    this.entries.push(bounded);
    if (this.entries.length > 80) this.entries.shift();
  }

  private attach(page: Page): void {
    if (this.pages.has(page)) return;
    const pageId = ++this.pageCount;
    this.pages.set(page, pageId);
    page.on("pageerror", (error) =>
      this.record({
        kind: "pageerror",
        message: error.message,
        critical: true,
        expected: false,
        pageId,
      }),
    );
    page.on("crash", () =>
      this.record({
        kind: "crash",
        message: "Browser page crashed.",
        critical: true,
        expected: false,
        pageId,
      }),
    );
    page.on("console", (message) => {
      if (message.type() !== "error" && message.type() !== "warning") return;
      this.record({
        kind: "console",
        message: message.text(),
        critical:
          message.type() === "error" &&
          /\[critical\]|\buncaught\b|\bunhandled\b|\bfatal\b/i.test(message.text()),
        expected: this.expectedResources.has(pathOf(message.location().url)),
        pageId,
      });
    });
    page.on("requestfailed", (request) => {
      const path = pathOf(request.url());
      if (/\.(js|css|json|gtl)$/.test(path)) {
        this.record({
          kind: "resource",
          message: `${path}: ${request.failure()?.errorText ?? "Request failed"}`,
          critical: true,
          expected: this.expectedResources.has(path),
          pageId,
        });
      }
    });
    page.on("response", (response) => {
      const path = pathOf(response.url());
      if (response.status() >= 400 && /\.(js|css|json|gtl)$/.test(path)) {
        this.record({
          kind: "resource",
          message: `${path}: HTTP ${response.status()}`,
          critical: true,
          expected: this.expectedResources.has(path),
          pageId,
        });
      }
    });
  }

  hasCriticalErrors(): boolean {
    return this.criticalCount > 0;
  }

  summary(): string {
    return (
      [...this.criticalSamples, ...this.entries.slice(-5)]
        .map((entry) => `${this.identity}/page-${entry.pageId} ${entry.kind}: ${entry.message}`)
        .join("\n") || "No browser warnings or errors captured."
    );
  }

  assertHealthy(operation: string): void {
    if (this.hasCriticalErrors()) {
      throw new Error(`${operation}: unexpected critical browser errors.\n${this.summary()}`);
    }
  }
}
