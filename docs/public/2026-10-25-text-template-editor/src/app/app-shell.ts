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
import { TemplateCatalog } from "../features/templates/ui/template-catalog";
import type { TemplateDefinition } from "../features/templates/model";
import { placeholderNames } from "../features/templates/model";
import { parseTemplate } from "../features/templates/parser";
import { displayedAnswer, renderTemplate } from "../features/templates/renderer";
import { AuthoringService } from "../features/template-authoring/service";
import type { WorkingAuthoringDraft } from "../features/template-authoring/service";
import { AuthoringNavigation } from "../features/template-authoring/ui/authoring-navigation";
import {
  replaceTemplateName,
  templateNameLocation,
} from "../features/template-authoring/template-name";
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
import { PanelManager } from "../platform/ui/panels/panel-manager";
import { renameDialog } from "../platform/ui/rename-dialog";
import { documentFilterKey, filteredDocuments } from "../features/documents/filter";
import type { DocumentFilter } from "../features/documents/filter";

export class GuidedApp extends HTMLElement {
  private storage = new StorageCoordinator();
  private settings = new SettingsService();
  private templates = new TemplateLoader();
  private catalog = new TemplateCatalog();
  private documents = new DocumentService((mode) => this.storage.documents(mode));
  private authoring = new AuthoringService((mode) => this.storage.authoring(mode));
  private page: "document" | "settings" | "authoring" = "document";
  private context: "document" | "authoring" = "document";
  private ready = false;
  private operationError = "";
  private navigationId = 0;
  private sidebar = new DocumentList();
  private documentWorkspace = new DocumentWorkspace();
  private guidance = new GuidancePanel();
  private settingsPage = new SettingsPage();
  private compactSettings = new SettingsPage(true);
  private panels!: PanelManager;
  private historyNavigation = new AuthoringNavigation();
  private documentFilter: DocumentFilter = "active";
  private filterError = "";
  private inspectedCheckpoint = "";
  private bundledInspection?: { id: string; template: TemplateDefinition };
  private inspectionEditor = new SourceEditor("guided-authoring-history-source");
  private authorTitle = el("h2");
  private authorName = el("span", "muted");
  private nameSource = button(
    "Go to source",
    () => this.activeSourceEditor().focusLocation(1, 1),
    "text-button",
    "guided-authoring-main-button-go-to-source",
  );
  private authorHistorical = el("p", "history-state");
  private authorNameButton = button(
    "Edit template name",
    () => void this.renameTemplateName(),
    "text-button",
    "guided-authoring-main-button-template-name",
  );
  private authorRename = button(
    "Rename",
    () => {
      if (this.authoring.active) void this.renameDraft(this.authoring.active);
    },
    "text-button",
    "guided-authoring-main-button-rename",
  );
  private authorSave = button(
    "Save now",
    () =>
      void this.run(async () => {
        this.dismissNotice();
        const draft = this.authoring.active;
        const created = await this.authoring.saveNow(draft);
        this.notify(
          draft?.status === "dirty"
            ? `${created ? "Checkpoint created" : "No new checkpoint"}. Newer current edits remain unsaved.`
            : created
              ? "Source saved and checkpoint created."
              : "Source saved. No new checkpoint: source is unchanged.",
        );
      }),
    "secondary",
    "guided-authoring-main-button-save",
  );
  private authorBack = button(
    "Back to current",
    () => this.backToCurrent(),
    "secondary",
    "guided-authoring-main-button-current",
  );
  private authorRestore = button(
    "Restore this version",
    () =>
      void this.run(async () => {
        this.dismissNotice();
        const draft = this.authoring.active;
        const checkpoint = this.inspectedCheckpoint;
        const applied = await this.authoring.restoreCheckpoint(checkpoint, draft);
        if (this.authoring.active === draft && this.inspectedCheckpoint === checkpoint)
          this.backToCurrent();
        this.notify(
          applied
            ? "Version restored. Previous source is retained in history."
            : "Newer current edits were retained and remain unsaved.",
        );
      }),
    "primary",
    "guided-authoring-history-button-restore",
  );
  private authorCopy = button(
    "Create editable copy",
    () => {
      const bundled = this.bundledInspection;
      if (!bundled) return;
      this.bundledInspection = undefined;
      this.authoring.create(bundled.template.source, bundled.id, `${bundled.template.name} (copy)`);
      this.sourceEditor.textarea.focus({ preventScroll: true });
    },
    "primary",
    "guided-authoring-main-button-editable-copy",
  );
  private sourceEditor = new SourceEditor();
  private main = el("main", "main-region");
  private scrollRegion = el("div", "workspace-scroll");
  private workspace = el("div", "workspace");
  private right = el("aside", "context-region");
  private rightBody = el("div", "context-body");
  private fieldNeutral = el("p", "muted", "Open a document or template preview to edit fields.");
  private issues = el("section", "issues");
  private issueList = el("div", "issue-list");
  private issueSummary = button("Issues", () => this.panels.open("issues"), "text-button");
  private crumb = el("span", "breadcrumb");
  private modeLabel = el("span", "mode-label");
  private notice = el("div", "notice");
  private banner = el("div", "error-banner");
  private preview = el("div", "authoring-preview");
  private sourceDiagnostics = el("div", "source-diagnostics");
  private authorStatus = el("span", "save-status");
  private previewAnswers: Record<string, string> = {};
  private previewVersion = "";
  private previewField = "";
  private noticeTimer: ReturnType<typeof setTimeout> | undefined;

  connectedCallback(): void {
    if (this.ready || this.contains(this.main)) return;
    this.dataset.testid = "guided-app-main-region-root";
    for (const [element, id] of [
      [this.workspace, "guided-app-main-region-workspace"],
      [this.right, "guided-workspace-main-region-guidance"],
      [this.rightBody, "guided-workspace-main-region-context-body"],
      [this.issues, "guided-issues-main-panel-root"],
      [this.issueSummary, "guided-issues-main-button-toggle"],
      [this.issueList, "guided-issues-main-list-items"],
      [this.notice, "guided-app-main-status-notice"],
      [this.banner, "guided-app-main-alert-error"],
      [this.crumb, "guided-app-main-label-location"],
      [this.modeLabel, "guided-app-main-label-storage"],
      [this.authorStatus, "guided-authoring-main-status-save"],
      [this.sourceDiagnostics, "guided-authoring-source-region-diagnostics"],
      [this.preview, "guided-authoring-preview-region-root"],
    ] as const)
      element.dataset.testid = id;
    this.workspace.id = "workspace";
    this.workspace.tabIndex = -1;
    this.main.setAttribute("aria-label", "Document workspace");
    this.right.setAttribute("aria-label", "Field editor");
    this.rightBody.tabIndex = 0;
    this.rightBody.setAttribute("role", "region");
    this.rightBody.setAttribute("aria-label", "Context and editing guidance");
    const menu = button(
      "Navigation",
      () =>
        this.panels.open(this.context === "authoring" ? "history" : "documents", undefined, true),
      "text-button",
    );
    menu.dataset.testid = "guided-documents-navigation-button-menu";
    menu.setAttribute("aria-label", "Open document navigation");
    const contextButton = button("Field editor", () => this.toggleGuidance(), "context-button");
    contextButton.dataset.testid = "guided-workspace-main-button-open-guidance";
    const header = el(
      "header",
      "topbar",
      el("div", "topbar-path", menu, el("span", "workspace-symbol", "▤"), this.crumb),
      el(
        "div",
        "topbar-tools",
        this.modeLabel,
        this.issueSummary,
        contextButton,
        button(
          "Settings",
          () => this.panels.open("settings"),
          "text-button",
          "guided-settings-compact-button-open",
        ),
      ),
    );
    this.notice.setAttribute("role", "status");
    this.notice.setAttribute("aria-live", "polite");
    this.banner.setAttribute("role", "alert");
    this.banner.hidden = true;
    this.scrollRegion.append(this.workspace);
    this.main.append(header, this.banner, this.scrollRegion);
    this.issues.append(this.issueList);
    this.fieldNeutral.hidden = true;
    this.rightBody.append(this.guidance, this.fieldNeutral);
    this.right.append(this.rightBody);
    this.replaceChildren(el("div", "app-layout", this.main), this.notice);
    const compact = el(
      "div",
      "compact-settings",
      this.compactSettings,
      button(
        "Reset workspace layout",
        () => this.panels.reset(),
        "secondary",
        "guided-settings-compact-button-reset-layout",
      ),
      button(
        "Open full Settings",
        () => this.navigate("settings"),
        "secondary",
        "guided-settings-compact-button-open-full",
      ),
    );
    this.panels = new PanelManager(this, this.main, {
      documents: this.sidebar,
      history: this.historyNavigation,
      field: this.right,
      issues: this.issues,
      settings: compact,
    });
    this.panels.onError = () => {
      if (this.ready) this.renderIssues();
    };
    header.querySelector(".topbar-tools")!.append(this.panels.trigger);
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
        if (navigation) {
          this.inspectedCheckpoint = "";
          this.bundledInspection = undefined;
          this.renderPage();
        } else {
          this.renderAuthoringLive();
          this.renderIssues();
        }
      }
    };
    this.settings.subscribe(() => this.applySettings());
    this.storage.subscribe((scope, mode) => {
      if (mode !== this.settings.value.storageMode) return;
      if (scope === "documents") void this.documents.load(mode);
      else void this.authoring.load(mode);
    });
    window.addEventListener("focus", () => {
      if (!this.ready) return;
      void this.documents.load(this.settings.value.storageMode);
      void this.authoring.load(this.settings.value.storageMode);
    });
    window.addEventListener("storage", (event) => {
      if (event.key === "gtl.documents.v1" && this.settings.value.storageMode === "local")
        void this.documents.load("local");
      if (event.key === "gtl.authoring.v1" && this.settings.value.storageMode === "local")
        void this.authoring.load("local");
    });
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
  private bindEvents(): void {
    const on = <T>(name: string, handler: (detail: T) => void) =>
      this.addEventListener(name, (event) => handler((event as CustomEvent<T>).detail));
    on("new-document", () => {
      this.panels.dismissNavigation();
      void this.run(() => this.newDocument());
    });
    on<{ templateId: string; versionId?: string }>(
      "template-select",
      (detail) => void this.run(() => this.newDocument(detail.templateId, detail.versionId)),
    );
    on<DocumentFilter>("document-filter-change", (filter) => {
      this.documentFilter = filter;
      try {
        localStorage.setItem(documentFilterKey, filter);
        this.filterError = "";
      } catch {
        this.filterError = "The document filter applies in this tab but could not be remembered.";
      }
      this.renderLive();
    });
    on<WorkingDocument>(
      "document-request-rename",
      (working) =>
        void this.run(async () => {
          if (working.origin !== this.settings.value.storageMode)
            throw new AppError(
              "INACTIVE_STORE",
              "Switch to this document's storage mode to rename it.",
            );
          const title = await renameDialog(
            this,
            "Rename document",
            working.record.title,
            this.settings.value.browserSuggestions,
          );
          if (title !== null) this.documents.rename(title, working);
        }),
    );
    on<{ working: WorkingDocument; archived: boolean }>(
      "document-archive",
      (detail) =>
        void this.run(async () => {
          const wasActive = this.documents.active === detail.working;
          await this.documents.setArchived(detail.working, detail.archived);
          if (wasActive && this.documents.active === detail.working && detail.archived) {
            const next = this.visibleDocuments().find(
              (item) => !item.record.archivedAt && item.origin === this.settings.value.storageMode,
            );
            if (next) this.documents.select(next);
            else {
              this.documents.active = null;
              this.renderPage();
            }
          }
          this.notify(
            detail.archived ? "Document archived." : "Document restored.",
            detail.archived
              ? () =>
                  void this.run(async () => {
                    await this.documents.setArchived(detail.working, false);
                    this.documents.select(detail.working);
                    this.notify("Document restored.");
                  })
              : undefined,
          );
        }),
    );
    on<WorkingDocument>("document-select", (working) => {
      this.panels.dismissNavigation();
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
              `“${working.record.title || "Untitled document"}” will be permanently deleted. Created ${working.record.createdAt}; ID ${working.record.id}. Other documents are not affected.`,
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
    on("open-documents", () => {
      this.panels.dismissNavigation();
      this.page = "document";
      this.renderPage();
    });
    on("authoring-new", () => {
      this.panels.dismissNavigation();
      this.navigationId++;
      this.page = "authoring";
      this.authoring.create();
      this.sourceEditor.textarea.focus({ preventScroll: true });
    });
    on<WorkingAuthoringDraft>("authoring-select", (draft) => {
      this.panels.dismissNavigation();
      this.page = "authoring";
      this.authoring.select(draft);
    });
    on<WorkingAuthoringDraft>("authoring-rename", (draft) => void this.renameDraft(draft));
    on<WorkingAuthoringDraft>("authoring-delete", (draft) => void this.deleteDraft(draft));
    on<string>("authoring-inspect", (id) => {
      this.inspectedCheckpoint = id;
      this.bundledInspection = undefined;
      this.previewAnswers = {};
      this.renderAuthoringLive();
      this.renderIssues();
      this.inspectionEditor.textarea.focus({ preventScroll: true });
    });
    on("authoring-current", () => this.backToCurrent());
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
      const navigationId = this.navigationId;
      const indexing = this.catalog.initialize(this.templates);
      // Background indexing must not dismiss an unrelated operation's failure.
      void this.run(async () => {
        await indexing;
        if (
          this.ready &&
          this.navigationId === navigationId &&
          this.page === "document" &&
          !this.documents.active &&
          this.catalog.firstAvailable
        )
          await this.newDocument();
      }, false);
      try {
        const filter = localStorage.getItem(documentFilterKey);
        if (filter === "active" || filter === "archived" || filter === "recent")
          this.documentFilter = filter;
      } catch {
        this.filterError =
          "The document filter could not be read. Active is selected for this session.";
      }
      await Promise.all([
        this.documents.load(this.settings.value.storageMode),
        this.authoring.load(this.settings.value.storageMode),
      ]);
      this.ready = true;
      this.applySettings();
      // Restore the most recently edited saved document; untouched previews never enter history.
      const recent = this.documents.documents.find(
        (item) => item.origin === this.settings.value.storageMode && !item.record.archivedAt,
      );
      if (recent) this.documents.select(recent);
      else {
        this.renderPage();
        if (!this.catalog.isIndexing && this.catalog.firstAvailable) await this.newDocument();
      }
    } catch {
      this.workspace.replaceChildren(
        el("h1", "", "Your writing space could not open."),
        el(
          "p",
          "muted",
          "The template files could not be loaded. Check the static deployment, then try again.",
        ),
        button(
          "Try again",
          () => void this.initialize(),
          "primary",
          "guided-app-main-button-retry-initialization",
        ),
      );
    }
  }
  private applySettings(): void {
    const settings = this.settings.value;
    document.documentElement.dataset.theme = settings.theme;
    document.documentElement.dataset.background = settings.background;
    document.documentElement.dataset.density = settings.density;
    document.documentElement.style.setProperty(
      "--document-scale",
      settings.documentTextSize === "large" ? "1.25" : "1",
    );
    this.guidance.preferences(settings.browserSuggestions, settings.fieldTextSize);
    this.documentWorkspace.preferences(settings.documentTextSize);
    for (const input of this.querySelectorAll<HTMLInputElement>("[data-browser-suggestions]")) {
      if (settings.browserSuggestions) input.removeAttribute("autocomplete");
      else input.autocomplete = "off";
    }
    this.modeLabel.textContent =
      settings.storageMode === "memory"
        ? "Memory only"
        : settings.storageMode === "indexeddb"
          ? "IndexedDB"
          : "localStorage";
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
    this.compactSettings.update(settings);
    if (this.ready) this.renderLive();
  }
  private toggleGuidance(): void {
    this.panels.open("field");
    if (this.page === "document") this.guidance.focusEditor();
    else if (this.page === "authoring") this.guidance.focusEditor();
  }
  private async newDocument(
    templateId = this.catalog.firstAvailable ?? this.templates.entries[0]!.id,
    versionId?: string,
  ): Promise<void> {
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
      this.documents.create(templateId, template, versionId);
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
    this.panels.dismissNavigation();
    void this.documents.flushAll();
    void this.authoring.flushAll();
    this.page = page;
    if (page === "authoring" && !this.authoring.active) this.authoring.create();
    this.renderPage();
    if (page === "authoring") this.activeSourceEditor().textarea.focus({ preventScroll: true });
    else this.workspace.focus({ preventScroll: true });
  }
  private renderPage(): void {
    if (this.page !== "settings") this.context = this.page;
    this.panels.setContext(this.context);
    const preserveDocumentSurface =
      this.page === "document" && this.workspace.contains(this.documentWorkspace);
    this.workspace.inert = false;
    this.rightBody.inert = false;
    this.main.removeAttribute("aria-busy");
    this.banner.hidden = true;
    this.fieldNeutral.hidden = this.page !== "settings";
    this.workspace.className = `workspace ${this.page}-workspace`;
    this.workspace.dataset.testid =
      this.page === "authoring"
        ? "guided-authoring-main-region-workspace"
        : "guided-app-main-region-workspace";
    if (this.page === "document") {
      const current = this.documents.active;
      this.crumb.textContent = "Documents / " + (current?.record.title ?? "New document");
      if (!current) {
        this.workspace.replaceChildren(
          el("div", "intro", el("h1", "", "Documents")),
          this.templatePicker(),
        );
      } else if (!preserveDocumentSurface) {
        this.workspace.replaceChildren(
          el("div", "intro", el("h1", "", "Documents")),
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
          el("h1", "", "Settings"),
          el("p", "muted", "Changes apply immediately."),
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
    this.catalog.select(this.documents.active?.record.templateId ?? "");
    return this.catalog;
  }
  private visibleDocuments(): WorkingDocument[] {
    return filteredDocuments(
      this.documents.documents,
      this.documentFilter,
      this.settings.value.recentLimit,
    );
  }
  private renderLive(): void {
    if (
      this.page === "document" &&
      !this.documents.active &&
      this.workspace.contains(this.documentWorkspace)
    ) {
      this.renderPage();
      return;
    }
    this.banner.hidden = true;
    this.catalog.select(this.documents.active?.record.templateId ?? "");
    this.sidebar.update(
      this.visibleDocuments(),
      this.documents.active,
      this.page,
      this.settings.value.storageMode,
      this.documentFilter,
    );
    if (this.page === "document" && this.documents.active) {
      this.guidance.hidden = false;
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
      this.crumb.textContent = `Documents / ${working.record.title}`;
    } else if (this.page === "document") {
      this.guidance.hidden = false;
      this.guidance.clear();
    } else if (this.page === "settings") {
      this.guidance.hidden = true;
    } else if (this.page === "authoring") this.renderAuthoringLive();
    this.renderIssues();
  }
  private focusPlaceholder(name: string, caret?: "start" | "end"): void {
    if (!name) return;
    const token = [...this.workspace.querySelectorAll<HTMLElement>("[data-placeholder-name]")].find(
      (item) => item.dataset.placeholderName === name,
    );
    this.panels.open("field", token?.getBoundingClientRect());
    if (this.page === "authoring") {
      this.previewField = name;
      this.renderAuthoringPreview();
      this.guidance.focusEditor(caret);
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
    if (this.filterError) issues.push({ message: this.filterError });
    if (this.storage.warning) issues.push({ message: this.storage.warning });
    if (this.panels.error)
      issues.push({ message: this.panels.error, action: () => this.panels.retry() });
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
          message: `$${name} needs a valid answer.`,
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
      if (draft?.checkpointError) issues.push({ message: draft.checkpointError });
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
        for (const diagnostic of parseTemplate(this.authoringSource()).diagnostics)
          issues.push({
            message: `${diagnostic.severity === "error" ? "Error" : "Warning"} · ${diagnostic.line}:${diagnostic.column} ${diagnostic.message}`,
            action: () =>
              this.activeSourceEditor().focusLocation(diagnostic.line, diagnostic.column),
          });
    }
    this.issueSummary.replaceChildren(
      el("span", "", "Issues"),
      el("span", "issue-count", String(issues.length)),
    );
    this.issueList.replaceChildren(
      ...issues.map((issue) =>
        issue.action
          ? button(issue.message, issue.action, "issue", "guided-issues-main-button-action")
          : el("p", "issue", issue.message),
      ),
    );
    if (!issues.length) this.issueList.append(el("p", "muted small", "No issues."));
    if (
      working &&
      this.page === "document" &&
      (working.status === "failed" || working.status === "conflict")
    ) {
      this.issueList.append(
        button(
          "Retry storage",
          () => void this.retryStorage(),
          "secondary",
          "guided-issues-main-button-retry-storage",
        ),
      );
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
          "guided-issues-main-button-download-recovery",
        ),
      );
      if (working.status === "conflict") {
        this.issueList.append(
          button(
            "Preserve local copy",
            () => this.documents.preserveLocalCopy(),
            "secondary",
            "guided-issues-main-button-preserve-copy",
          ),
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
            "guided-issues-main-button-reopen-latest",
          ),
        );
      }
    }
    if (this.authoring.active?.status === "conflict" && this.page === "authoring") {
      this.issueList.append(
        button(
          "Preserve local template copy",
          () => this.authoring.preserveCopy(),
          "secondary",
          "guided-authoring-main-button-preserve-copy",
        ),
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
          "guided-authoring-main-button-reopen-latest",
        ),
      );
    }
    const critical =
      this.documents.loadError ||
      this.settings.error ||
      this.documents.documents.find((item) => item.error)?.error ||
      this.authoring.drafts.find((item) => item.error)?.error ||
      this.authoring.drafts.find((item) => item.checkpointError)?.checkpointError ||
      (this.page === "authoring" ? this.authoring.error : "");
    if (critical || this.operationError) this.showError(critical || this.operationError, false);
    else this.banner.hidden = true;
  }
  private async retryStorage(): Promise<void> {
    this.storage.worker.restart();
    await Promise.all([
      this.documents.load(this.settings.value.storageMode),
      this.authoring.load(this.settings.value.storageMode),
    ]);
    await Promise.all([this.documents.flushAll(), this.authoring.flushAll()]);
    this.operationError = "";
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
    open.dataset.testid = "guided-authoring-main-select-bundled";
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
          const id = open.value;
          const request = ++this.navigationId;
          const template = await this.templates.load(id);
          if (request !== this.navigationId || this.page !== "authoring") return;
          this.bundledInspection = { id, template };
          this.inspectedCheckpoint = "";
          this.previewAnswers = {};
          this.renderAuthoringLive();
          this.inspectionEditor.textarea.focus({ preventScroll: true });
        }),
    );
    open.value = this.bundledInspection?.id ?? "";
    this.sourceEditor.value = draft?.record.source ?? "";
    this.inspectionEditor.textarea.readOnly = true;
    const downloadSource = button(
      "Download .gtl ↓",
      () => {
        const title = this.bundledInspection?.template.name ?? this.authoring.active?.record.title;
        if (title)
          download(
            this.authoringSource(),
            `${filename(title)}${this.inspectedCheckpoint ? "-checkpoint" : ""}.gtl`,
            "text/plain;charset=utf-8",
          );
      },
      "primary",
      "guided-authoring-main-button-download",
    );
    const remove = button(
      "Delete draft",
      () => {
        if (this.authoring.active) void this.deleteDraft(this.authoring.active);
      },
      "text-button danger",
      "guided-authoring-main-button-delete",
    );
    this.workspace.replaceChildren(
      el("div", "intro", el("h1", "", "Template authoring")),
      el(
        "div",
        "authoring-toolbar",
        button(
          "+ New template",
          () => {
            this.authoring.create();
            this.sourceEditor.textarea.focus({ preventScroll: true });
          },
          "secondary",
          "guided-authoring-main-button-new",
        ),
        open,
      ),
      el("div", "document-title-row", this.authorTitle, this.authorRename),
      el("div", "template-name-row", this.authorName, this.authorNameButton, this.nameSource),
      this.authorHistorical,
      el("div", "authoring-actions", this.authorBack, this.authorRestore, this.authorCopy),
      el(
        "div",
        "section-heading",
        el("span", "eyebrow", "Template source / GTL"),
        this.authorStatus,
      ),
      this.sourceEditor,
      this.inspectionEditor,
      this.sourceDiagnostics,
      el("div", "authoring-actions", downloadSource, this.authorSave, remove),
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
    this.historyNavigation.update(
      this.authoring.drafts,
      draft,
      this.settings.value.storageMode,
      this.inspectedCheckpoint,
    );
    const readOnly = !!this.inspectedCheckpoint || !!this.bundledInspection;
    const source = this.authoringSource();
    // Reloads may advance the revision; the editor must display that same source snapshot.
    if (draft && this.sourceEditor.value !== draft.record.source)
      this.sourceEditor.value = draft.record.source;
    this.sourceEditor.hidden = readOnly || !draft;
    this.inspectionEditor.hidden = !readOnly;
    if (readOnly) this.inspectionEditor.value = source;
    this.sourceEditor.disabled = !!draft && draft.origin !== this.settings.value.storageMode;
    this.authorTitle.textContent =
      this.bundledInspection?.template.name ?? draft?.record.title ?? "No template draft selected";
    this.authorTitle.dataset.testid = "guided-authoring-main-label-title";
    this.authorName.dataset.testid = "guided-authoring-main-label-template-name";
    this.authorHistorical.dataset.testid = "guided-authoring-history-status-inspection";
    this.crumb.dataset.testid = "guided-workspace-main-label-breadcrumb";
    this.crumb.textContent = `Template Authoring / ${this.authorTitle.textContent}${this.bundledInspection ? " / Bundled read-only" : this.inspectedCheckpoint ? " / Historical version" : ""}`;
    const location = templateNameLocation(source);
    this.authorName.textContent = `GTL template name: ${location?.name ?? "unavailable; edit the source"}`;
    this.nameSource.hidden = !!location;
    this.authorNameButton.disabled =
      readOnly || !location || !draft || draft.origin !== this.settings.value.storageMode;
    this.authorRename.disabled =
      readOnly || !draft || draft.origin !== this.settings.value.storageMode;
    this.authorSave.disabled =
      readOnly ||
      !draft ||
      draft.origin !== this.settings.value.storageMode ||
      this.authoring.isBusy(draft);
    this.authorBack.hidden = !readOnly;
    this.authorCopy.hidden = !this.bundledInspection;
    this.authorRestore.hidden = !this.inspectedCheckpoint;
    const checkpoint = draft?.record.checkpoints.find(
      (item) => item.id === this.inspectedCheckpoint,
    );
    this.authorRestore.disabled =
      !checkpoint ||
      draft?.origin !== this.settings.value.storageMode ||
      this.authoring.isBusy(draft);
    const remove = this.workspace.querySelector<HTMLButtonElement>(
      '[data-testid="guided-authoring-main-button-delete"]',
    );
    if (remove)
      remove.disabled =
        !!this.bundledInspection ||
        !draft ||
        draft.origin !== this.settings.value.storageMode ||
        this.authoring.isBusy(draft);
    this.authorHistorical.hidden = !readOnly;
    const downloadSource = this.workspace.querySelector<HTMLButtonElement>(
      '[data-testid="guided-authoring-main-button-download"]',
    );
    if (downloadSource) downloadSource.disabled = !draft && !this.bundledInspection;
    this.authorHistorical.textContent = this.bundledInspection
      ? "Bundled template · read-only inspection. Create an editable copy to change it."
      : checkpoint
        ? `Historical version · ${new Date(checkpoint.createdAt).toLocaleString()} · read only`
        : "Historical version unavailable. Current source has not been changed; return to current or refresh history.";
    const statuses = {
      temporary: "No draft yet",
      dirty: "Unsaved changes",
      saving: "Saving…",
      saved: draft?.origin === "memory" ? "In memory · this tab" : "Saved",
      failed: "Save failed",
      conflict: "Save conflict",
    };
    this.authorStatus.setAttribute("role", "status");
    const statusText = readOnly ? "Read-only inspection" : draft ? statuses[draft.status] : "";
    if (this.authorStatus.textContent !== statusText) this.authorStatus.textContent = statusText;
    this.sourceDiagnostics.replaceChildren(
      ...(draft || this.bundledInspection ? parseTemplate(source).diagnostics : [])
        .filter((item) => item.severity === "error")
        .map((item) =>
          button(
            `Line ${item.line}:${item.column} · ${item.message}`,
            () => this.activeSourceEditor().focusLocation(item.line, item.column),
            "source-diagnostic",
            "guided-authoring-source-button-diagnostic",
          ),
        ),
    );
    this.renderAuthoringPreview();
  }
  private authoringSource(): string {
    if (this.bundledInspection) return this.bundledInspection.template.source;
    if (this.inspectedCheckpoint)
      return (
        this.authoring.active?.record.checkpoints.find(
          (item) => item.id === this.inspectedCheckpoint,
        )?.source ?? ""
      );
    return this.authoring.active?.record.source ?? "";
  }
  private activeSourceEditor(): SourceEditor {
    return this.inspectedCheckpoint || this.bundledInspection
      ? this.inspectionEditor
      : this.sourceEditor;
  }
  private backToCurrent(): void {
    this.inspectedCheckpoint = "";
    this.bundledInspection = undefined;
    this.previewAnswers = {};
    this.renderAuthoringLive();
    this.renderIssues();
    this.sourceEditor.textarea.focus({ preventScroll: true });
  }
  private async renameDraft(draft: WorkingAuthoringDraft): Promise<void> {
    await this.run(async () => {
      if (draft.origin !== this.settings.value.storageMode)
        throw new AppError("INACTIVE_STORE", "Switch to this draft's storage mode to rename it.");
      const title = await renameDialog(
        this,
        "Rename template draft",
        draft.record.title,
        this.settings.value.browserSuggestions,
      );
      if (title !== null) this.authoring.rename(title, draft);
    });
  }
  private async renameTemplateName(): Promise<void> {
    await this.run(async () => {
      const draft = this.authoring.active;
      const location = draft && templateNameLocation(draft.record.source);
      if (!draft || !location)
        throw new AppError(
          "AMBIGUOUS_TEMPLATE_NAME",
          "Edit the source: a unique TEMPLATE: directive is required.",
        );
      const source = draft.record.source;
      const name = await renameDialog(
        this,
        "Edit GTL template name",
        location.name,
        this.settings.value.browserSuggestions,
      );
      if (name === null) return;
      if (draft !== this.authoring.active || source !== draft.record.source)
        throw new AppError(
          "SOURCE_CHANGED",
          "The source changed while naming it. Review the latest source and retry.",
        );
      this.sourceEditor.editValue(replaceTemplateName(source, name));
    });
  }
  private async deleteDraft(draft: WorkingAuthoringDraft): Promise<void> {
    await this.run(async () => {
      if (
        await this.confirm(
          "Delete template draft?",
          `“${draft.record.title}” and its ${draft.record.checkpoints.length} checkpoints will be permanently deleted. Created ${draft.record.createdAt}; ID ${draft.record.id}. Bundled templates and documents are not affected.`,
          "Delete draft",
        )
      )
        await this.authoring.delete(draft);
    });
  }
  private renderAuthoringPreview(): void {
    this.guidance.hidden = false;
    const draft = this.authoring.active;
    const parsed = parseTemplate(this.authoringSource());
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
      this.guidance.clear("Fix source errors to edit preview fields.");
      return;
    }
    const template = parsed.template;
    const version =
      template.versions.find((item) => item.id === this.previewVersion) ?? template.versions[0]!;
    this.previewVersion = version.id;
    const select = el("select", "style-select");
    select.dataset.testid = "guided-authoring-preview-select-version";
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
    if (!names.includes(this.previewField)) this.previewField = "";
    const prose = el("div", "guided-prose author-preview-prose");
    prose.dataset.testid = "guided-authoring-preview-region-guided-text";
    for (const part of version.parts) {
      if (part.kind === "literal") prose.append(part.text);
      else {
        const token = button(
          displayedAnswer(
            template.placeholders[part.name]!,
            answerFor(this.previewAnswers, part.name),
          ) ?? `$${part.name}`,
          () => this.focusPlaceholder(part.name),
          "placeholder",
        );
        token.classList.toggle("active", this.previewField === part.name);
        token.setAttribute("aria-label", `Edit $${part.name}: ${token.textContent}`);
        token.dataset.testid = "guided-authoring-preview-button-placeholder";
        token.dataset.placeholderName = part.name;
        prose.append(token);
      }
    }
    const result = renderTemplate(template, version, this.previewAnswers);
    const previewResult = el("div", "result-text", result.text);
    previewResult.dataset.testid = "guided-authoring-preview-region-result";
    this.preview.append(
      select,
      prose,
      previewResult,
      el(
        "p",
        "small muted",
        "Preview answers are temporary. They are not part of your template draft.",
      ),
    );
    this.guidance.update(
      template,
      version,
      this.previewAnswers,
      this.previewField,
      this.settings.value.keyboardHelp,
    );
  }
  private async confirm(title: string, message: string, action: string): Promise<boolean> {
    const dialog = el("dialog", "confirm-dialog");
    dialog.dataset.testid = "guided-confirmation-main-dialog-root";
    const heading = el("h2", "", title);
    heading.id = "confirmation-title";
    dialog.setAttribute("aria-labelledby", heading.id);
    let accepted = false;
    const cancel = button(
      "Cancel",
      () => dialog.close(),
      "secondary",
      "guided-confirmation-main-button-cancel",
    );
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
          "guided-confirmation-main-button-confirm",
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
  private dismissNotice(): void {
    clearTimeout(this.noticeTimer);
    this.notice.replaceChildren();
  }
  private notify(message: string, undo?: () => void): void {
    clearTimeout(this.noticeTimer);
    this.notice.replaceChildren(el("span", "", message));
    if (undo)
      this.notice.append(button("Undo", undo, "text-button", "guided-app-main-button-undo"));
    this.noticeTimer = setTimeout(
      () => {
        this.notice.textContent = "";
      },
      undo ? 8000 : 3500,
    );
  }
  private showError(message: string, transient = true): void {
    if (transient) this.operationError = message;
    this.banner.hidden = false;
    this.banner.replaceChildren(
      el("span", "", message),
      button(
        "Dismiss",
        () => {
          this.operationError = "";
          this.banner.hidden = true;
        },
        "text-button",
        "guided-app-main-button-dismiss-error",
      ),
    );
  }
  private async run(action: () => Promise<void>, clearOperationError = true): Promise<void> {
    try {
      await action();
      if (clearOperationError) this.operationError = "";
      this.renderIssues();
    } catch (error) {
      this.showError(errorMessage(error));
      logger.warn("ui.operation.failed", {
        code: error instanceof AppError ? error.code : "BROWSER_OPERATION_FAILED",
      });
    }
  }
}
customElements.define("gtl-app", GuidedApp);
