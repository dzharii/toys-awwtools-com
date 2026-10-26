/**
 * Main-thread composition root. Feature services own domain state; this shell
 * translates semantic UI events into navigation, editing, and recovery actions.
 * Input updates never wait for the worker.
 */
import { DocumentService } from "../features/documents/service";
import { answerFor } from "../features/documents/model";
import type { WorkingDocument } from "../features/documents/model";
import { DocumentList } from "../features/documents/ui/document-list";
import { DocumentWorkspace } from "../features/documents/ui/document-workspace";
import { GuidancePanel } from "../features/templates/ui/guidance-panel";
import { TemplateLoader } from "../features/templates/loader";
import { placeholderNames } from "../features/templates/model";
import { parseTemplate } from "../features/templates/parser";
import { displayedAnswer, renderTemplate } from "../features/templates/renderer";
import { AuthoringService } from "../features/template-authoring/service";
import { SourceEditor } from "../features/template-authoring/ui/source-editor";
import { SettingsService } from "../features/settings/service";
import { SettingsPage } from "../features/settings/ui/settings-page";
import type { Settings, StorageMode } from "../features/settings/schema";
import {
  copyRichText,
  copyText,
  download,
  exportResult,
  filename,
} from "../features/export/service";
import { StorageCoordinator } from "../platform/storage/coordinator";
import { AppError, errorMessage } from "../platform/errors";
import { logger } from "../platform/diagnostics/logger";
import { button, el } from "../platform/ui/dom";

export class GuidedApp extends HTMLElement {
  private storage = new StorageCoordinator();
  private settings = new SettingsService();
  private templates = new TemplateLoader();
  private documents = new DocumentService((mode) => this.storage.documents(mode));
  private authoring = new AuthoringService((mode) => this.storage.authoring(mode));
  private page: "document" | "settings" | "authoring" = "document";
  private ready = false;
  private navigationId = 0;
  private sidebar = new DocumentList();
  private documentWorkspace = new DocumentWorkspace();
  private guidance = new GuidancePanel();
  private previewGuidance = new GuidancePanel();
  private settingsPage = new SettingsPage();
  private sourceEditor = new SourceEditor();
  private navHost = el("aside", "navigation");
  private drawer = el("dialog", "navigation-drawer");
  private main = el("main", "main-region");
  private scrollRegion = el("div", "workspace-scroll");
  private workspace = el("div", "workspace");
  private right = el("aside", "context-region");
  private rightBody = el("div", "context-body");
  private issues = el("details", "issues");
  private issueList = el("div", "issue-list");
  private issueSummary = el("summary");
  private crumb = el("span", "breadcrumb");
  private modeLabel = el("span", "mode-label");
  private notice = el("div", "notice");
  private banner = el("div", "error-banner");
  private guidanceToggle = button("Hide", () => this.toggleGuidance(), "text-button");
  private preview = el("div", "authoring-preview");
  private sourceDiagnostics = el("div", "source-diagnostics");
  private authorStatus = el("span", "save-status");
  private draftSelect = el("select", "draft-select");
  private draftOptionsKey = "";
  private previewAnswers: Record<string, string> = {};
  private previewVersion = "";
  private previewField = "";
  private mobile = matchMedia("(max-width: 760px)");
  private noticeTimer: ReturnType<typeof setTimeout> | undefined;

  connectedCallback(): void {
    if (this.ready || this.contains(this.main)) return;
    this.workspace.id = "workspace";
    this.workspace.tabIndex = -1;
    this.main.setAttribute("aria-label", "Document workspace");
    this.right.setAttribute("aria-label", "Guidance and unresolved issues");
    this.drawer.setAttribute("aria-label", "Document navigation");
    this.drawer.append(button("Close navigation ×", () => this.drawer.close(), "drawer-close"));
    const menu = button("☰", () => this.drawer.showModal(), "menu-button");
    menu.setAttribute("aria-label", "Open document navigation");
    const contextButton = button("Field notes", () => this.toggleGuidance(), "context-button");
    const header = el(
      "header",
      "topbar",
      el("div", "topbar-path", menu, el("span", "workspace-symbol", "▤"), this.crumb),
      el("div", "topbar-tools", this.modeLabel, contextButton),
    );
    this.notice.setAttribute("role", "status");
    this.notice.setAttribute("aria-live", "polite");
    this.banner.setAttribute("role", "alert");
    this.banner.hidden = true;
    this.scrollRegion.append(this.workspace);
    this.main.append(header, this.banner, this.scrollRegion);
    this.issues.open = false;
    this.issues.append(this.issueSummary, this.issueList);
    this.right.append(
      el("div", "context-topbar", el("span", "eyebrow", "A little guidance"), this.guidanceToggle),
      this.rightBody,
      this.issues,
    );
    this.replaceChildren(
      el("div", "app-layout", this.navHost, this.main, this.right),
      this.drawer,
      this.notice,
    );
    this.positionNavigation();
    this.mobile.addEventListener("change", () => this.positionNavigation());
    this.drawer.addEventListener("click", (event) => {
      if (event.target === this.drawer && event.clientX > this.drawer.getBoundingClientRect().right)
        this.drawer.close();
    });
    const resize = () =>
      document.documentElement.style.setProperty(
        "--app-height",
        `${visualViewport?.height ?? innerHeight}px`,
      );
    visualViewport?.addEventListener("resize", resize);
    resize();
    this.bindEvents();
    this.documents.subscribe((change) => {
      if (!this.ready) return;
      if (change === "navigation") {
        this.page = "document";
        this.renderPage();
      } else this.renderLive();
    });
    this.authoring.onChange = (navigation) => {
      if (!this.ready) return;
      if (this.page === "authoring") {
        if (navigation) this.renderPage();
        else {
          this.renderAuthoringLive();
          this.renderIssues();
        }
      }
    };
    this.settings.subscribe(() => this.applySettings());
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        void this.documents.flushAll();
        void this.authoring.flushAll();
      }
    });
    window.addEventListener("pagehide", () => {
      void this.documents.flushAll();
      void this.authoring.flushAll();
    });
    window.addEventListener("beforeunload", (event) => {
      const unsaved =
        this.documents.documents.some((item) =>
          ["dirty", "saving", "failed", "conflict"].includes(item.status),
        ) ||
        this.authoring.drafts.some((item) =>
          ["dirty", "saving", "failed", "conflict"].includes(item.status),
        );
      if (unsaved) event.preventDefault();
    });
    void this.initialize();
  }
  private positionNavigation(): void {
    if (this.mobile.matches) {
      this.drawer.append(this.sidebar);
    } else {
      this.drawer.close();
      this.navHost.append(this.sidebar);
    }
  }
  private bindEvents(): void {
    const on = <T>(name: string, handler: (detail: T) => void) =>
      this.addEventListener(name, (event) => handler((event as CustomEvent<T>).detail));
    on("new-document", () => {
      this.drawer.close();
      void this.run(() => this.newDocument());
    });
    on<WorkingDocument>("document-select", (working) => {
      this.drawer.close();
      this.navigationId++;
      this.documents.select(working);
      this.workspace.focus({ preventScroll: true });
    });
    on<WorkingDocument>(
      "document-delete",
      (working) =>
        void this.run(async () => {
          if (
            await this.confirm(
              "Delete document?",
              `“${working.record.title || "Untitled document"}” will be permanently deleted. Other documents are not affected.`,
              "Delete document",
            )
          ) {
            await this.documents.delete(working);
            this.workspace.focus({ preventScroll: true });
          }
        }),
    );
    on("open-settings", () => this.navigate("settings"));
    on("open-authoring", () => this.navigate("authoring"));
    on<string>("document-rename", (title) => this.documents.rename(title));
    on<string>("template-version-select", (version) => this.documents.switchVersion(version));
    on<{ name: string; value: string }>("placeholder-change", (detail) => {
      if (this.page === "authoring") {
        this.previewAnswers[detail.name] = detail.value;
        this.renderAuthoringPreview();
      } else this.documents.updateAnswer(detail.name, detail.value);
    });
    on<{ name: string; caret?: "start" | "end" }>("placeholder-focus", (detail) =>
      this.focusPlaceholder(detail.name, detail.caret),
    );
    on<string>(
      "copy-example",
      (value) =>
        void this.run(async () => {
          await copyText(value);
          this.notify("Example copied.");
        }),
    );
    on<"plain" | "rich">(
      "result-copy",
      (format) =>
        void this.run(async () => {
          const result = this.generatedResult();
          if (format === "rich") await copyRichText(result.text);
          else await copyText(result.text);
          this.notify(format === "rich" ? "Rich text copied." : "Text copied.");
        }),
    );
    on<"txt" | "md" | "html">(
      "result-export",
      (format) =>
        void this.run(async () => {
          const result = this.generatedResult();
          exportResult(result.text, this.documents.active?.record.title || "Document", format);
        }),
    );
    on<{ id: keyof Settings; value: unknown }>(
      "setting-change",
      (detail) => void this.run(async () => this.settings.set(detail.id, detail.value)),
    );
    on<string>("source-change", (source) => this.authoring.update(source));
  }
  private async initialize(): Promise<void> {
    this.workspace.replaceChildren(el("p", "muted", "Opening your writing space…"));
    try {
      await this.templates.initialize();
      await Promise.all([
        this.documents.load(this.settings.value.storageMode),
        this.authoring.load(this.settings.value.storageMode),
      ]);
      this.ready = true;
      this.applySettings();
      // Restore the most recently edited saved document; untouched previews never enter history.
      const recent = this.documents.documents.find(
        (item) => item.origin === this.settings.value.storageMode,
      );
      if (recent) this.documents.select(recent);
      else await this.newDocument();
    } catch {
      this.workspace.replaceChildren(
        el("h1", "", "Your writing space could not open."),
        el(
          "p",
          "muted",
          "The template files could not be loaded. Check the static deployment, then try again.",
        ),
        button("Try again", () => void this.initialize(), "primary"),
      );
    }
  }
  private applySettings(): void {
    const settings = this.settings.value;
    document.documentElement.dataset.theme = settings.theme;
    document.documentElement.dataset.background = settings.background;
    document.documentElement.dataset.density = settings.density;
    this.classList.toggle("guidance-collapsed", !settings.guidance);
    this.guidanceToggle.textContent = settings.guidance ? "Hide" : "Show";
    this.guidanceToggle.setAttribute("aria-expanded", String(settings.guidance));
    this.modeLabel.textContent =
      settings.storageMode === "memory" ? "Memory only" : "Local to this browser";
    this.documents.configureAutosave(settings.autosaveSeconds);
    this.authoring.configureAutosave(settings.autosaveSeconds);
    if (this.documents.mode !== settings.storageMode) {
      void this.documents.load(settings.storageMode);
      void this.authoring.load(settings.storageMode);
    }
    if (settings.storageMode === "indexeddb")
      void this.storage.worker.request("system.configure", settings).catch(() => {
        logger.warn("worker.configure.failed");
        this.showError(
          "The storage worker could not receive preferences. Retry storage to reconnect.",
        );
      });
    this.settingsPage.update(settings);
    if (this.ready) this.renderLive();
  }
  private toggleGuidance(): void {
    this.settings.set("guidance", !this.settings.value.guidance);
  }
  private async newDocument(templateId = this.templates.entries[0]!.id): Promise<void> {
    const navigationId = ++this.navigationId;
    void this.documents.flushAll();
    void this.authoring.flushAll();
    this.workspace.inert = true;
    this.rightBody.inert = true;
    this.main.setAttribute("aria-busy", "true");
    try {
      const template = await this.templates.load(templateId);
      if (navigationId !== this.navigationId) return;
      this.page = "document";
      this.documents.create(templateId, template);
      this.workspace.focus({ preventScroll: true });
    } finally {
      if (navigationId === this.navigationId) {
        this.workspace.inert = false;
        this.rightBody.inert = false;
        this.main.removeAttribute("aria-busy");
      }
    }
  }
  private navigate(page: "settings" | "authoring"): void {
    this.navigationId++;
    this.drawer.close();
    void this.documents.flushAll();
    void this.authoring.flushAll();
    this.page = page;
    if (page === "authoring" && !this.authoring.active) this.authoring.create();
    this.renderPage();
  }
  private renderPage(): void {
    const preserveDocumentSurface =
      this.page === "document" && this.workspace.contains(this.documentWorkspace);
    this.workspace.inert = false;
    this.rightBody.inert = false;
    this.main.removeAttribute("aria-busy");
    this.banner.hidden = true;
    this.workspace.className = `workspace ${this.page}-workspace`;
    if (this.page === "document") {
      const current = this.documents.active;
      this.crumb.textContent =
        "Workspace / " + (current?.record.templateSnapshot.name ?? "New document");
      if (!current) {
        this.workspace.replaceChildren(
          el(
            "div",
            "intro",
            el("div", "eyebrow", "A fresh start"),
            el("h1", "", "What would you like to write?"),
          ),
          this.templatePicker(),
        );
      } else if (preserveDocumentSurface) {
        this.workspace.querySelector(".template-picker")?.replaceWith(this.templatePicker());
      } else {
        this.workspace.replaceChildren(
          el(
            "div",
            "intro",
            el("div", "eyebrow", "Your writing space"),
            el("h1", "", "A little structure. Your own words."),
            el("p", "muted", "Start with a template, then make it unmistakably yours."),
          ),
          this.templatePicker(),
          this.documentWorkspace,
        );
      }
    } else if (this.page === "settings") {
      this.crumb.textContent = "Workspace / Settings";
      this.workspace.replaceChildren(
        el(
          "div",
          "intro",
          el("div", "eyebrow", "Make yourself at home"),
          el("h1", "", "Your space, your preferences."),
          el("p", "muted", "Changes apply right away. Everything stays in your browser."),
        ),
        this.settingsPage,
      );
      this.settingsPage.update(this.settings.value);
    } else {
      this.crumb.textContent = "Workspace / Template Authoring";
      this.renderAuthoringPage();
    }
    if (!preserveDocumentSurface) this.scrollRegion.scrollTop = 0;
    this.renderLive();
  }
  private templatePicker(): HTMLElement {
    const picker = el("div", "template-picker");
    const current = this.documents.active?.record.templateId;
    picker.append(
      el(
        "div",
        "template-picker-heading",
        el("span", "eyebrow", "Choose a starting point"),
        el("span", "small muted", `${this.templates.entries.length} templates · 7 writing styles`),
      ),
    );
    const cards = el("div", "template-cards");
    const marks = ["[  ]", "≡", "↗"];
    for (const [index, entry] of this.templates.entries.entries()) {
      const card = button(
        "",
        () => void this.run(() => this.newDocument(entry.id)),
        "template-card",
      );
      card.setAttribute("aria-pressed", String(current === entry.id));
      card.classList.toggle("selected", current === entry.id);
      card.append(
        el("span", "template-mark", marks[index] ?? "[ ]"),
        el("span", "template-card-title", entry.name),
        el("span", "template-card-description", entry.description),
        el("span", "card-corner", current === entry.id ? "✓" : "↗"),
      );
      cards.append(card);
    }
    picker.append(cards);
    return picker;
  }
  private renderLive(): void {
    this.banner.hidden = true;
    this.sidebar.update(
      this.documents.documents,
      this.documents.active,
      this.page,
      this.settings.value.storageMode,
    );
    if (this.page === "document" && this.documents.active) {
      const working = this.documents.active;
      this.documentWorkspace.update(working, this.settings.value.storageMode);
      const version = working.record.templateSnapshot.versions.find(
        (item) => item.id === working.record.templateVersionId,
      )!;
      this.guidance.update(
        working.record.templateSnapshot,
        version,
        working.record.answers,
        working.activePlaceholder,
        this.settings.value.keyboardHelp,
        working.origin !== this.settings.value.storageMode,
      );
      if (this.guidance.parentElement !== this.rightBody)
        this.rightBody.replaceChildren(this.guidance);
    } else if (this.page === "settings") {
      this.rightBody.replaceChildren(
        el(
          "div",
          "settings-note",
          el("div", "tag", "GOOD TO KNOW"),
          el("h2", "", "Yours, by design."),
          el(
            "p",
            "",
            "Your documents are processed on this device. No account, no cloud, no telemetry.",
          ),
          el(
            "p",
            "",
            "IndexedDB is the recommended storage mode. Browser storage can be cleared by your browser; export important work.",
          ),
          el(
            "p",
            "",
            "Memory-only mode never persists document or template source. General preferences can still be saved.",
          ),
        ),
      );
    } else if (this.page === "authoring") this.renderAuthoringLive();
    this.renderIssues();
  }
  private focusPlaceholder(name: string, caret: "start" | "end" = "end"): void {
    if (!name) return;
    if (!this.settings.value.guidance) this.settings.set("guidance", true);
    if (this.page === "authoring") {
      this.previewField = name;
      this.renderAuthoringPreview();
      this.previewGuidance.focusEditor(caret);
    } else if (this.documents.active) {
      this.documents.active.activePlaceholder = name;
      this.documentWorkspace.highlight(name);
      const current = this.documents.active;
      const version = current.record.templateSnapshot.versions.find(
        (item) => item.id === current.record.templateVersionId,
      )!;
      this.guidance.update(
        current.record.templateSnapshot,
        version,
        current.record.answers,
        name,
        this.settings.value.keyboardHelp,
        current.origin !== this.settings.value.storageMode,
      );
      this.guidance.focusEditor(caret);
      this.documentWorkspace.scrollToActive(name);
    }
  }
  private renderIssues(): void {
    const issues: { message: string; action?: () => void }[] = [];
    if (this.settings.error) issues.push({ message: this.settings.error });
    if (this.documents.loadError)
      issues.push({ message: this.documents.loadError, action: () => void this.retryStorage() });
    const working = this.documents.active;
    for (const other of this.documents.documents) {
      if (!other.error || (other === working && this.page === "document")) continue;
      issues.push({
        message: `${other.record.title || "Untitled document"}: ${other.error}`,
        action: () => this.documents.select(other),
      });
    }
    for (const other of this.authoring.drafts) {
      if (!other.error || (other === this.authoring.active && this.page === "authoring")) continue;
      issues.push({
        message: `${other.record.title}: ${other.error}`,
        action: () => {
          this.page = "authoring";
          this.authoring.select(other);
        },
      });
    }
    if (this.page === "document" && working) {
      if (working.origin !== this.settings.value.storageMode)
        issues.push({
          message: `This document belongs to ${working.origin}. Its in-memory work is retained, not migrated. Switch back to edit or save it.`,
          action: () => this.settings.set("storageMode", working.origin),
        });
      const version = working.record.templateSnapshot.versions.find(
        (item) => item.id === working.record.templateVersionId,
      )!;
      for (const name of renderTemplate(
        working.record.templateSnapshot,
        version,
        working.record.answers,
      ).unresolved) {
        issues.push({
          message: `${name.replaceAll("-", " ")} needs a valid answer.`,
          action: () => this.focusPlaceholder(name),
        });
      }
      if (working.error)
        issues.push({
          message: working.error,
          action:
            working.status === "conflict"
              ? undefined
              : () => void this.run(() => this.documents.flush(working)),
        });
    }
    if (this.page === "authoring") {
      if (this.authoring.error)
        issues.push({ message: this.authoring.error, action: () => void this.retryStorage() });
      const draft = this.authoring.active;
      if (draft?.error)
        issues.push({
          message: draft.error,
          action: draft.status === "conflict" ? undefined : () => void this.authoring.flush(draft),
        });
      if (draft && draft.origin !== this.settings.value.storageMode)
        issues.push({
          message: `This draft belongs to ${draft.origin}. Switch back to edit or save it.`,
          action: () => this.settings.set("storageMode", draft.origin),
        });
      if (draft)
        for (const diagnostic of parseTemplate(draft.record.source).diagnostics)
          issues.push({
            message: `${diagnostic.severity === "error" ? "Error" : "Warning"} · ${diagnostic.line}:${diagnostic.column} ${diagnostic.message}`,
            action: () => this.sourceEditor.focusLocation(diagnostic.line, diagnostic.column),
          });
    }
    this.issueSummary.replaceChildren(
      el("span", "eyebrow", "Unresolved issues"),
      el("span", "issue-count", String(issues.length)),
    );
    this.issueList.replaceChildren(
      ...issues.map((issue) =>
        issue.action
          ? button(issue.message, issue.action, "issue")
          : el("p", "issue", issue.message),
      ),
    );
    if (!issues.length)
      this.issueList.append(el("p", "muted small", "Everything is in good shape."));
    if (
      working &&
      this.page === "document" &&
      (working.status === "failed" || working.status === "conflict")
    ) {
      this.issueList.append(button("Retry storage", () => void this.retryStorage(), "secondary"));
      this.issueList.append(
        button(
          "Download recovery file",
          () => {
            download(
              JSON.stringify({ schemaVersion: 1, document: working.record }, null, 2),
              `${filename(working.record.title)}.recovery.json`,
              "application/json;charset=utf-8",
            );
          },
          "secondary",
        ),
      );
      if (working.status === "conflict") {
        this.issueList.append(
          button("Preserve local copy", () => this.documents.preserveLocalCopy(), "secondary"),
          button(
            "Reopen latest saved document",
            () =>
              void this.run(async () => {
                if (
                  await this.confirm(
                    "Reopen latest?",
                    "Your unsaved local changes will be replaced by the stored document.",
                    "Reopen latest",
                  )
                )
                  await this.documents.reopenLatest();
              }),
            "secondary",
          ),
        );
      }
      this.issues.open = true;
    }
    if (this.authoring.active?.status === "conflict" && this.page === "authoring") {
      this.issueList.append(
        button("Preserve local template copy", () => this.authoring.preserveCopy(), "secondary"),
        button(
          "Reopen latest template draft",
          () =>
            void this.run(async () => {
              if (
                await this.confirm(
                  "Reopen latest draft?",
                  "Your unsaved source will be replaced by the stored draft.",
                  "Reopen latest",
                )
              )
                await this.authoring.reopenLatest();
            }),
          "secondary",
        ),
      );
      this.issues.open = true;
    }
    const critical =
      this.documents.loadError ||
      this.settings.error ||
      this.documents.documents.find((item) => item.error)?.error ||
      this.authoring.drafts.find((item) => item.error)?.error ||
      (this.page === "authoring" ? this.authoring.error : "");
    if (critical) this.showError(critical);
  }
  private async retryStorage(): Promise<void> {
    this.storage.worker.restart();
    await Promise.all([
      this.documents.load(this.settings.value.storageMode),
      this.authoring.load(this.settings.value.storageMode),
    ]);
    await Promise.all([this.documents.flushAll(), this.authoring.flushAll()]);
    this.renderLive();
  }
  private generatedResult() {
    const current = this.documents.active;
    if (!current) throw new AppError("NO_DOCUMENT", "Open a document first.");
    const version = current.record.templateSnapshot.versions.find(
      (item) => item.id === current.record.templateVersionId,
    )!;
    const generated = renderTemplate(
      current.record.templateSnapshot,
      version,
      current.record.answers,
    );
    if (!generated.canCopy)
      throw new AppError(
        "INCOMPLETE_RESULT",
        "Fill the required fields before copying or exporting.",
      );
    return generated;
  }
  private renderAuthoringPage(): void {
    const draft = this.authoring.active;
    this.previewAnswers = {};
    this.previewField = "";
    this.previewVersion = "";
    const open = el("select", "bundled-select");
    open.setAttribute("aria-label", "Open bundled template");
    const blank = el("option", "", "Open a bundled template…");
    blank.value = "";
    open.append(blank);
    for (const entry of this.templates.entries) {
      const option = el("option", "", entry.name);
      option.value = entry.id;
      open.append(option);
    }
    open.addEventListener(
      "change",
      () =>
        void this.run(async () => {
          if (!open.value) return;
          const template = await this.templates.load(open.value);
          this.authoring.create(template.source, open.value);
        }),
    );
    this.draftSelect = el("select", "draft-select");
    this.draftOptionsKey = "";
    this.draftSelect.setAttribute("aria-label", "Saved template drafts");
    this.draftSelect.addEventListener("change", () => {
      const item = this.authoring.drafts.find(
        (entry) => `${entry.origin}:${entry.record.id}` === this.draftSelect.value,
      );
      if (item) this.authoring.select(item);
    });
    this.sourceEditor.value = draft?.record.source ?? "";
    const downloadSource = button(
      "Download .gtl ↓",
      () => {
        const record = this.authoring.active?.record;
        if (record)
          download(record.source, `${filename(record.title)}.gtl`, "text/plain;charset=utf-8");
      },
      "primary",
    );
    const remove = button(
      "Delete draft",
      () =>
        void this.run(async () => {
          const current = this.authoring.active;
          if (
            current &&
            (await this.confirm(
              "Delete template draft?",
              `“${current.record.title}” will be deleted. Bundled template files are not affected.`,
              "Delete draft",
            ))
          )
            await this.authoring.delete(current);
        }),
      "text-button danger",
    );
    this.workspace.replaceChildren(
      el(
        "div",
        "intro",
        el("div", "eyebrow", "Template workshop"),
        el("h1", "", "Give your next idea a head start."),
        el("p", "muted", "Write a little structure. Add a few good questions. Reuse it."),
      ),
      el(
        "div",
        "authoring-toolbar",
        button("+ New template", () => this.authoring.create(), "secondary"),
        open,
        this.draftSelect,
      ),
      el(
        "div",
        "section-heading",
        el("span", "eyebrow", "Template source / GTL"),
        this.authorStatus,
      ),
      ...(draft ? [this.sourceEditor] : [el("p", "muted", "Create or open a template to begin.")]),
      this.sourceDiagnostics,
      el(
        "div",
        "authoring-actions",
        downloadSource,
        button("Save now", () => void this.authoring.flushAll(), "secondary"),
        remove,
      ),
      el(
        "p",
        "small muted",
        "Drafts stay local. Downloading source is always allowed, even with errors. To publish it, add the .gtl file to the project and register it in templates/manifest.json.",
      ),
      this.preview,
    );
  }
  private renderAuthoringLive(): void {
    const draft = this.authoring.active;
    // Reloads may advance the revision; the editor must display that same source snapshot.
    if (draft && this.sourceEditor.value !== draft.record.source)
      this.sourceEditor.value = draft.record.source;
    this.sourceEditor.disabled = !!draft && draft.origin !== this.settings.value.storageMode;
    const statuses = {
      temporary: "No draft yet",
      dirty: "Unsaved changes",
      saving: "Saving…",
      saved: draft?.origin === "memory" ? "In memory · this tab" : "Saved",
      failed: "Save failed",
      conflict: "Save conflict",
    };
    this.authorStatus.setAttribute("role", "status");
    const statusText = draft ? statuses[draft.status] : "";
    if (this.authorStatus.textContent !== statusText) this.authorStatus.textContent = statusText;
    const visibleDrafts = this.authoring.drafts.filter(
      (item) => item.record.revision > 0 || item.status !== "temporary",
    );
    const optionsKey =
      JSON.stringify(
        visibleDrafts.map((item) => [item.origin, item.record.id, item.record.title]),
      ) + this.settings.value.storageMode;
    if (this.draftOptionsKey !== optionsKey) {
      this.draftOptionsKey = optionsKey;
      this.draftSelect.replaceChildren(
        el("option", "", "Local template drafts…"),
        ...visibleDrafts.map((item) => {
          const option = el(
            "option",
            "",
            `${item.record.title}${item.origin !== this.settings.value.storageMode ? ` (${item.origin})` : ""}`,
          );
          option.value = `${item.origin}:${item.record.id}`;
          return option;
        }),
      );
    }
    if (draft) this.draftSelect.value = `${draft.origin}:${draft.record.id}`;
    this.sourceDiagnostics.replaceChildren(
      ...(draft ? parseTemplate(draft.record.source).diagnostics : [])
        .filter((item) => item.severity === "error")
        .map((item) =>
          button(
            `Line ${item.line}:${item.column} · ${item.message}`,
            () => this.sourceEditor.focusLocation(item.line, item.column),
            "source-diagnostic",
          ),
        ),
    );
    this.renderAuthoringPreview();
  }
  private renderAuthoringPreview(): void {
    const draft = this.authoring.active;
    const parsed = parseTemplate(draft?.record.source ?? "");
    this.preview.replaceChildren(
      el(
        "div",
        "section-heading",
        el("span", "eyebrow", "Live template preview"),
        el("span", "result-label", parsed.template ? "VALID GTL" : "NEEDS ATTENTION"),
      ),
    );
    if (!parsed.template) {
      this.preview.append(
        el(
          "p",
          "muted small",
          "Fix source errors to preview this template. Your source can still be saved and downloaded.",
        ),
      );
      this.rightBody.replaceChildren(
        el(
          "div",
          "settings-note",
          el("div", "tag", "GTL QUICK REFERENCE"),
          el("h2", "", "Text, with a little guidance."),
          el(
            "p",
            "",
            "TEMPLATE names your definition. TEXT contains the fixed prose. Write {{$name}} where an answer belongs.",
          ),
          el(
            "p",
            "",
            "$name: Question adds guidance. Indent HINT:, EXAMPLE:, INPUT: multiline, or OPTION key: Label beneath it.",
          ),
          el(
            "p",
            "",
            "Use $notes OPTIONAL: Question for optional fields. Or VERSION: Name with an indented TEXT: block for alternative structures.",
          ),
        ),
      );
      return;
    }
    const template = parsed.template;
    const version =
      template.versions.find((item) => item.id === this.previewVersion) ?? template.versions[0]!;
    this.previewVersion = version.id;
    const select = el("select", "style-select");
    select.setAttribute("aria-label", "Preview writing style");
    for (const item of template.versions) {
      const option = el("option", "", item.name);
      option.value = item.id;
      select.append(option);
    }
    select.value = version.id;
    select.addEventListener("change", () => {
      this.previewVersion = select.value;
      this.previewAnswers = {};
      this.previewField = "";
      this.renderAuthoringPreview();
    });
    const names = placeholderNames(version);
    if (!names.includes(this.previewField)) this.previewField = names[0] ?? "";
    const prose = el("div", "guided-prose author-preview-prose");
    for (const part of version.parts) {
      if (part.kind === "literal") prose.append(part.text);
      else {
        const token = button(
          displayedAnswer(
            template.placeholders[part.name]!,
            answerFor(this.previewAnswers, part.name),
          ) ?? part.name,
          () => this.focusPlaceholder(part.name),
          "placeholder",
        );
        token.classList.toggle("active", this.previewField === part.name);
        prose.append(token);
      }
    }
    const result = renderTemplate(template, version, this.previewAnswers);
    this.preview.append(
      select,
      prose,
      el("div", "result-text", result.text),
      el(
        "p",
        "small muted",
        "Preview answers are temporary. They are not part of your template draft.",
      ),
    );
    this.previewGuidance.update(
      template,
      version,
      this.previewAnswers,
      this.previewField,
      this.settings.value.keyboardHelp,
    );
    if (this.previewGuidance.parentElement !== this.rightBody)
      this.rightBody.replaceChildren(this.previewGuidance);
  }
  private async confirm(title: string, message: string, action: string): Promise<boolean> {
    const dialog = el("dialog", "confirm-dialog");
    const heading = el("h2", "", title);
    heading.id = "confirmation-title";
    dialog.setAttribute("aria-labelledby", heading.id);
    let accepted = false;
    const cancel = button("Cancel", () => dialog.close(), "secondary");
    dialog.append(
      heading,
      el("p", "muted", message),
      el(
        "div",
        "dialog-actions",
        cancel,
        button(
          action,
          () => {
            accepted = true;
            dialog.close();
          },
          "primary",
        ),
      ),
    );
    this.append(dialog);
    dialog.showModal();
    cancel.focus();
    return new Promise((resolve) =>
      dialog.addEventListener(
        "close",
        () => {
          dialog.remove();
          resolve(accepted);
        },
        { once: true },
      ),
    );
  }
  private notify(message: string): void {
    clearTimeout(this.noticeTimer);
    this.notice.textContent = message;
    this.noticeTimer = setTimeout(() => {
      this.notice.textContent = "";
    }, 3500);
  }
  private showError(message: string): void {
    this.banner.hidden = false;
    this.banner.replaceChildren(
      el("span", "", message),
      button(
        "Dismiss",
        () => {
          this.banner.hidden = true;
        },
        "text-button",
      ),
    );
  }
  private async run(action: () => Promise<void>): Promise<void> {
    try {
      await action();
    } catch (error) {
      this.showError(errorMessage(error));
      logger.warn("ui.operation.failed", {
        code: error instanceof AppError ? error.code : "BROWSER_OPERATION_FAILED",
      });
    }
  }
}
customElements.define("gtl-app", GuidedApp);
