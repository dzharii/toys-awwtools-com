// Application bootstrap and orchestration. Wires file input, parsing,
// rendering, both reading modes, the E Ink controller, settings, keyboard and
// accessibility behavior. Keeps DOM event binding centralized so interactions
// are auditable. Book content lives in memory only for the session.

import { appState, clearDocument } from "./state.js";
import {
  loadPreferences,
  savePreferences,
  validatePreferences,
  clearPreferences,
  hasStoredPreferences,
} from "./preferences.js";
import { log, setDebugEnabled, getLogEntries, formatLogsForCopy, clearLogs } from "./logging.js";
import { AppError, ErrorCode, describe, toAppError } from "./errors.js";
import { initFileOpen } from "./file-open.js";
import { buildDocument } from "./document-model.js";
import { applyPreferences, buildContent } from "./renderer.js";
import { Paginator } from "./paginator.js";
import { ScrollReader } from "./scroll-reader.js";
import { EinkController } from "./eink-effect.js";
import { createSettingsPanel } from "./settings.js";
import { prefersReducedMotion, onReducedMotionChange, trapFocus } from "./accessibility.js";
import { debounce } from "./utils.js";
import { initUpdatesPanel } from "./rss-updates.js";

// Preference keys that require a layout recalculation when changed.
const LAYOUT_KEYS = new Set([
  "fontFamily",
  "fontSize",
  "lineHeight",
  "measure",
  "paraSpacing",
  "align",
  "margin",
  "readerMode",
]);
// Keys that are a visual redraw (full refresh) but need no relayout.
const VISUAL_FULL_KEYS = new Set(["theme", "contrast"]);

class ReaderApp {
  constructor() {
    this.els = {};
    this.currentContent = null;
    this.pendingResult = null; // last file result, for plain-text fallback
    this.settingsPanel = null;
    this.releaseFocusTrap = null;
    this.toastTimer = null;
    this.loadSeq = 0; // increments on each load/close to cancel stale async work
  }

  init() {
    this.cacheEls();

    // Preferences.
    appState.preferences = loadPreferences();
    appState.ui.debugEnabled = appState.preferences.debugEnabled;
    setDebugEnabled(appState.ui.debugEnabled);

    // Reduced motion.
    appState.ui.reducedMotionSystem = prefersReducedMotion();

    // E Ink controller.
    this.eink = new EinkController(this.els.stage);
    this.applyEinkConfig();

    // Reading views.
    this.paginator = new Paginator(this.els.pageViewport);
    this.scroll = new ScrollReader(this.els.stage, this.els.scrollHost);

    // Apply preferences to the DOM.
    applyPreferences(appState.preferences, { html: this.els.html, reader: this.els.reader }, appState.ui.reducedMotionSystem);

    // Settings panel factory.
    this.settingsPanel = createSettingsPanel({
      getPrefs: () => appState.preferences,
      onChange: (patch) => this.onPreferenceChange(patch),
      diagnostics: {
        getLogs: () => getLogEntries(),
        copyLogs: () => this.copyLogs(),
        clearLogs: () => clearLogs(),
        clearPreferences: () => this.resetPreferences(),
      },
    });

    this.bindFileOpen();
    this.bindReaderControls();
    this.bindKeyboard();
    this.bindResize();
    this.bindReducedMotion();

    // Home-screen project updates (reads local feed.xml; failures are calm).
    initUpdatesPanel(this.els.updatesList);

    // First-run hint: preferences restored, book must be reopened.
    if (hasStoredPreferences()) {
      this.showOpenNotice({
        title: "Welcome back",
        message: "Preferences were restored. Reopen your book file to continue reading.",
        actions: [],
      });
    }

    log.info("app:init", { mode: appState.preferences.readerMode });
  }

  cacheEls() {
    const $ = (id) => document.getElementById(id);
    this.els = {
      html: document.documentElement,
      openScreen: $("open-screen"),
      openNotice: $("open-notice"),
      dropzone: $("dropzone"),
      fileInput: $("file-input"),
      openButton: $("open-button"),
      updatesList: $("updates-list"),
      reader: $("reader"),
      readerTitle: $("reader-title"),
      closeButton: $("close-document-button"),
      settingsButton: $("settings-button"),
      openButton2: $("open-button-2"),
      stage: $("reader-stage"),
      paper: $("paper"),
      pageViewport: $("page-viewport"),
      scrollHost: $("reader-scroll"),
      zonePrev: $("zone-prev"),
      zoneNext: $("zone-next"),
      prevPage: $("prev-page"),
      nextPage: $("next-page"),
      progress: $("progress"),
      settingsMount: $("settings-mount"),
      busy: $("busy"),
      busyLabel: $("busy-label"),
      toast: $("toast"),
    };
  }

  applyEinkConfig() {
    const p = appState.preferences;
    this.eink.configure({
      intensity: p.einkIntensity,
      motion: p.motion,
      reducedMotionSystem: appState.ui.reducedMotionSystem,
      fullRefreshInterval: p.fullRefreshInterval,
    });
  }

  // ---------- File open ----------

  bindFileOpen() {
    this.fileOpen = initFileOpen({
      dropzone: this.els.dropzone,
      fileInput: this.els.fileInput,
      onLoad: (result) => this.loadDocument(result),
      onError: (err) => this.handleError(err),
    });
    this.els.openButton.addEventListener("click", () => this.fileOpen.openPicker());
    this.els.openButton2.addEventListener("click", () => this.fileOpen.openPicker());
  }

  async loadDocument(result, opts = {}) {
    const seq = ++this.loadSeq; // cancels if closeDocument/another load supersedes
    this.pendingResult = result;
    this.setBusy(true, "Reading…");
    try {
      const doc = buildDocument({
        fileName: result.fileName,
        fileType: result.fileType,
        sourceText: result.sourceText,
        forceText: !!opts.forceText,
      });

      // A close (or newer load) happened while building — abort silently.
      if (seq !== this.loadSeq) return;

      // Store in memory only (never persisted).
      appState.document = {
        loaded: true,
        id: doc.id,
        fileName: doc.fileName,
        fileType: doc.fileType,
        title: doc.title,
        characterCount: doc.characterCount,
        wordEstimate: doc.wordEstimate,
        sections: [],
        sourceText: result.sourceText,
      };

      this.currentContent = buildContent(doc);
      this.els.readerTitle.textContent = doc.title || doc.fileName;

      this.enterReader();
      this.clearOpenNotice();

      // Large file warning (non-blocking).
      if (result.largeWarning && !opts.forceText) {
        this.showToast("This file is large and may take longer to paginate.");
      }
      if (doc.hadRawHtml && doc.fileType === "markdown") {
        this.showToast("Some HTML in this file was not rendered for safety.");
      }

      // Enter reader with a full refresh.
      await this.eink.run("full", async () => {
        if (seq !== this.loadSeq) return; // closed mid-transition
        await this.layoutCurrentMode(true);
      });
      if (seq !== this.loadSeq) return;
      this.setBusy(false);
    } catch (err) {
      if (seq !== this.loadSeq) return;
      this.setBusy(false);
      this.handleError(err);
    }
  }

  enterReader() {
    this.els.openScreen.hidden = true;
    this.els.reader.hidden = false;
  }

  /**
   * Close the current document and return to the home screen. Clears in-memory
   * document state and rendered content, resets reader position/progress, closes
   * settings, and moves focus to the Open file button. Preferences are never
   * touched and no book content is persisted. Uses a calm E Ink refresh
   * (reduced-motion / effect-off collapses to an immediate, calm transition).
   */
  async closeDocument() {
    if (this.els.reader.hidden && !appState.document.loaded) return;
    // Supersede any in-flight load so a late result cannot reopen the reader.
    this.loadSeq++;

    if (appState.ui.settingsOpen) this.closeSettings();
    this.pendingResult = null; // drop retained source text

    await this.eink.run("full", () => {
      // Clear document + reader state.
      clearDocument();
      this.currentContent = null;
      this.paginator.detach();
      this.scroll.detach();
      this.els.readerTitle.textContent = "Reader";
      this.els.progress.textContent = "";
      this.els.prevPage.disabled = false;
      this.els.nextPage.disabled = false;
      this.els.stage.scrollTop = 0;

      // Swap surfaces.
      this.els.reader.hidden = true;
      this.els.openScreen.hidden = false;
      this.setBusy(false);
    });

    // Calm, non-restorable notice + sensible focus target.
    this.showOpenNotice({
      title: "Document closed",
      message: "Open a TXT or Markdown file to continue reading.",
      actions: [],
    });
    if (this.els.openButton && typeof this.els.openButton.focus === "function") {
      this.els.openButton.focus();
    }
    log.info("app:document-close");
  }

  // ---------- Layout ----------

  /** Build/lay out the current reading mode, waiting for fonts on first load. */
  async layoutCurrentMode(waitFonts) {
    const mode = appState.preferences.readerMode;
    this.els.reader.setAttribute("data-mode", mode);

    if (waitFonts && document.fonts && document.fonts.ready) {
      try {
        await Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 1500))]);
      } catch (_) {
        /* font loading errors fall through to fallback stacks */
      }
    }

    if (mode === "paged") {
      try {
        this.paginator.attach(this.currentContent);
        await this._ensureReaderFontLoaded(this.currentContent);
        this.paginator.measure(appState.preferences.measure);
        appState.reader.pageCount = this.paginator.pageCount;
        appState.reader.currentPageIndex = this.paginator.index;
      } catch (err) {
        // Pagination failed — fall back to scroll mode.
        log.error("pagination:error", { reason: (err && err.message) || "layout" });
        appState.preferences.readerMode = "scroll";
        this.els.reader.setAttribute("data-mode", "scroll");
        this.scroll.layout(this.currentContent);
        this.showToast(describe(ErrorCode.PAGINATION_FAILED).message);
      }
    } else {
      this.scroll.layout(this.currentContent);
      await this._ensureReaderFontLoaded(this.currentContent);
    }
    appState.reader.layoutReady = true;
    this.updateProgress();
    this.updateNavState();
  }

  /**
   * Await the specific reader font (family + weight + style + size) used by the
   * given element. document.fonts.ready can resolve before a lazily-requested
   * variable font is applied, which would make the first pagination measure the
   * fallback font and produce a different page count. Loading the exact face
   * first keeps measurements stable. Times out so a missing font never hangs.
   */
  async _ensureReaderFontLoaded(el) {
    if (!el || !document.fonts || !document.fonts.load) return;
    try {
      const cs = getComputedStyle(el);
      const family = (cs.fontFamily || "serif").split(",")[0].trim();
      const spec = `${cs.fontStyle || "normal"} ${cs.fontWeight || "400"} ${cs.fontSize || "20px"} ${family}`;
      await Promise.race([
        document.fonts.load(spec),
        new Promise((resolve) => setTimeout(resolve, 1200)),
      ]);
    } catch (_) {
      /* fall back to whatever metrics are available */
    }
  }

  /** Re-layout preserving reading position, inside a refresh. */
  async relayoutPreserving(type = "full") {
    if (!appState.document.loaded || !this.currentContent) return;
    const mode = appState.preferences.readerMode;
    const anchor = mode === "paged" ? this.paginator.getAnchorFraction() : this.scroll.getAnchorFraction();

    await this.eink.run(type, async () => {
      if (mode === "paged") {
        await this._ensureReaderFontLoaded(this.currentContent);
        this.paginator.measure(appState.preferences.measure);
        this.paginator.setAnchorFraction(anchor);
        appState.reader.pageCount = this.paginator.pageCount;
        appState.reader.currentPageIndex = this.paginator.index;
      } else {
        // Scroll content reflows automatically; restore fraction next frame.
        requestAnimationFrame(() => this.scroll.setAnchorFraction(anchor));
      }
      this.updateProgress();
      this.updateNavState();
    });
  }

  /** Switch reading mode preserving position. */
  async switchMode(newMode, oldMode) {
    // applyPreferences() may have already written the new mode to the DOM and
    // to appState, so the caller passes the previous mode explicitly.
    if (oldMode == null) oldMode = this.els.reader.getAttribute("data-mode");
    if (newMode === oldMode) return;
    const anchor = oldMode === "paged" ? this.paginator.getAnchorFraction() : this.scroll.getAnchorFraction();
    appState.preferences.readerMode = newMode;
    this.persist();

    await this.eink.run("full", async () => {
      this.els.reader.setAttribute("data-mode", newMode);
      await this.layoutCurrentMode(false);
      if (newMode === "paged") this.paginator.setAnchorFraction(anchor);
      else requestAnimationFrame(() => this.scroll.setAnchorFraction(anchor));
      this.updateProgress();
      this.updateNavState();
    });
  }

  // ---------- Navigation ----------

  bindReaderControls() {
    this.els.nextPage.addEventListener("click", () => this.pageNext());
    this.els.prevPage.addEventListener("click", () => this.pagePrev());
    this.els.zoneNext.addEventListener("click", () => this.pageNext());
    this.els.zonePrev.addEventListener("click", () => this.pagePrev());
    this.els.settingsButton.addEventListener("click", () => this.openSettings());
    this.els.closeButton.addEventListener("click", () => this.closeDocument());
  }

  pageNext() {
    if (!appState.document.loaded) return;
    if (appState.preferences.readerMode === "scroll") {
      this.scroll.scrollByPage(1);
      this.updateProgress();
      return;
    }
    if (this.paginator.atEnd()) return;
    this.eink.runPageTurn(() => {
      this.paginator.next();
      appState.reader.currentPageIndex = this.paginator.index;
      this.updateProgress();
      this.updateNavState();
    });
  }

  pagePrev() {
    if (!appState.document.loaded) return;
    if (appState.preferences.readerMode === "scroll") {
      this.scroll.scrollByPage(-1);
      this.updateProgress();
      return;
    }
    if (this.paginator.atStart()) return;
    this.eink.runPageTurn(() => {
      this.paginator.prev();
      appState.reader.currentPageIndex = this.paginator.index;
      this.updateProgress();
      this.updateNavState();
    });
  }

  goStart() {
    if (appState.preferences.readerMode === "scroll") {
      this.eink.run("full", () => this.scroll.toStart());
    } else {
      this.eink.run("full", () => {
        this.paginator.goToPage(0);
        appState.reader.currentPageIndex = 0;
        this.updateProgress();
        this.updateNavState();
      });
    }
  }

  goEnd() {
    if (appState.preferences.readerMode === "scroll") {
      this.eink.run("full", () => this.scroll.toEnd());
    } else {
      this.eink.run("full", () => {
        this.paginator.goToPage(this.paginator.pageCount - 1);
        appState.reader.currentPageIndex = this.paginator.index;
        this.updateProgress();
        this.updateNavState();
      });
    }
  }

  updateProgress() {
    const p = appState.preferences;
    if (!p.showProgress) return;
    if (p.readerMode === "paged") {
      this.els.progress.textContent = `Page ${this.paginator.index + 1} of ${this.paginator.pageCount}`;
    } else {
      const frac = this.scroll.getAnchorFraction();
      this.els.progress.textContent = `${Math.round(frac * 100)}%`;
    }
  }

  updateNavState() {
    const paged = appState.preferences.readerMode === "paged";
    const disablePrev = paged && this.paginator.atStart();
    const disableNext = paged && this.paginator.atEnd();
    this.els.prevPage.disabled = disablePrev;
    this.els.nextPage.disabled = disableNext;
  }

  // ---------- Preferences / settings ----------

  onPreferenceChange(patch) {
    const before = appState.preferences;
    const merged = validatePreferences({ ...before, ...patch });
    const changedKeys = Object.keys(patch).filter((k) => merged[k] !== before[k] || k in patch);
    appState.preferences = merged;
    this.persist();

    // Debug toggle side effect.
    if ("debugEnabled" in patch) {
      appState.ui.debugEnabled = merged.debugEnabled;
      setDebugEnabled(merged.debugEnabled);
    }

    // Apply visual prefs to the DOM immediately.
    applyPreferences(merged, { html: this.els.html, reader: this.els.reader }, appState.ui.reducedMotionSystem);
    this.applyEinkConfig();

    if (!appState.document.loaded) return;

    const needsLayout = changedKeys.some((k) => LAYOUT_KEYS.has(k));
    const needsFull = changedKeys.some((k) => VISUAL_FULL_KEYS.has(k));

    if (changedKeys.includes("readerMode")) {
      this.switchMode(merged.readerMode, before.readerMode);
    } else if (needsLayout) {
      this.relayoutPreserving("full");
    } else if (needsFull) {
      // Theme/contrast: full refresh reveal without relayout.
      this.eink.run("full", () => {});
    }

    if ("showProgress" in patch) this.updateProgress();
  }

  persist() {
    const ok = savePreferences(appState.preferences);
    if (!ok) {
      // Non-blocking: settings still apply for the session.
      this.showToast(describe(ErrorCode.PREF_SAVE_FAILED).message);
    }
  }

  openSettings() {
    if (appState.ui.settingsOpen) return;
    appState.ui.settingsOpen = true;
    const panel = this.settingsPanel.render(this.els.settingsMount, () => this.closeSettings());
    this.releaseFocusTrap = trapFocus(panel);
    log.debug("settings:open");
  }

  closeSettings() {
    if (!appState.ui.settingsOpen) return;
    appState.ui.settingsOpen = false;
    if (this.releaseFocusTrap) {
      this.releaseFocusTrap();
      this.releaseFocusTrap = null;
    }
    this.els.settingsMount.innerHTML = "";
    log.debug("settings:close");
  }

  resetPreferences() {
    clearPreferences();
    appState.preferences = validatePreferences(null);
    applyPreferences(appState.preferences, { html: this.els.html, reader: this.els.reader }, appState.ui.reducedMotionSystem);
    this.applyEinkConfig();
    setDebugEnabled(appState.preferences.debugEnabled);
    this.closeSettings();
    if (appState.document.loaded) this.relayoutPreserving("full");
    this.showToast("Preferences were reset.");
  }

  copyLogs() {
    const text = formatLogsForCopy();
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(
        () => this.showToast("Diagnostics copied."),
        () => this.showToast("Could not copy diagnostics.")
      );
    } else {
      this.showToast("Clipboard is not available.");
    }
  }

  // ---------- Keyboard ----------

  bindKeyboard() {
    document.addEventListener("keydown", (e) => this.onKeydown(e));
  }

  onKeydown(e) {
    const tag = (e.target && e.target.tagName) || "";
    const inControl = /^(INPUT|SELECT|TEXTAREA)$/.test(tag);

    if (e.key === "Escape") {
      if (appState.ui.settingsOpen) {
        e.preventDefault();
        this.closeSettings();
      }
      return;
    }

    // Shortcuts that must not fire while typing in a control.
    if (!inControl && !appState.ui.settingsOpen) {
      if (e.key === "s" || e.key === "S") {
        e.preventDefault();
        this.openSettings();
        return;
      }
      if (e.key === "o" || e.key === "O") {
        e.preventDefault();
        this.fileOpen.openPicker();
        return;
      }
    }

    if (!appState.document.loaded || appState.ui.settingsOpen) return;
    const paged = appState.preferences.readerMode === "paged";

    switch (e.key) {
      case "ArrowRight":
        e.preventDefault();
        this.pageNext();
        break;
      case "ArrowLeft":
        e.preventDefault();
        this.pagePrev();
        break;
      case " ": // Space
        // Space is the native activation key for a focused button/link (e.g. the
        // reader-bar Close/Open/Settings controls); don't hijack it for page
        // turns in that case. Space turns the page only when reading (stage).
        if (inControl || /^(BUTTON|A)$/.test(tag)) break;
        e.preventDefault();
        if (e.shiftKey) this.pagePrev();
        else this.pageNext();
        break;
      case "PageDown":
        e.preventDefault();
        this.pageNext();
        break;
      case "PageUp":
        e.preventDefault();
        this.pagePrev();
        break;
      case "Home":
        e.preventDefault();
        this.goStart();
        break;
      case "End":
        e.preventDefault();
        this.goEnd();
        break;
      default:
        break;
    }
  }

  // ---------- Resize / orientation / reduced motion ----------

  bindResize() {
    const onResize = debounce(() => {
      if (!appState.document.loaded) return;
      this.relayoutPreserving("full");
    }, 220);
    window.addEventListener("resize", onResize);
    window.addEventListener("orientationchange", onResize);
  }

  bindReducedMotion() {
    onReducedMotionChange((matches) => {
      appState.ui.reducedMotionSystem = matches;
      this.applyEinkConfig();
      applyPreferences(appState.preferences, { html: this.els.html, reader: this.els.reader }, matches);
      log.info("motion:system-change", { reduced: matches });
    });
  }

  // ---------- Notices / errors / busy ----------

  handleError(err) {
    const appErr = err instanceof AppError ? err : toAppError(err);
    appState.ui.lastError = appErr.code;
    const info = describe(appErr.code);

    if (appState.document.loaded) {
      // In-reader: show a toast; for parse issues offer plain-text fallback.
      if (this.canFallbackToText(appErr.code) && this.pendingResult) {
        this.showActionToast(info.message, "Open as plain text", () =>
          this.loadDocument(this.pendingResult, { forceText: true })
        );
      } else {
        this.showToast(info.message);
      }
    } else {
      this.showOpenNotice(info, appErr);
    }
  }

  canFallbackToText(code) {
    return (
      code === ErrorCode.PARSE_FAILED ||
      code === ErrorCode.PARSER_UNAVAILABLE ||
      code === ErrorCode.SANITIZER_UNAVAILABLE
    );
  }

  showOpenNotice(info, appErr) {
    const notice = this.els.openNotice;
    notice.innerHTML = "";
    notice.className = "notice" + (appErr ? " notice--error" : "");
    const title = document.createElement("strong");
    title.textContent = info.title;
    const msg = document.createElement("div");
    msg.textContent = info.message;
    notice.append(title, msg);

    const actions = (info.actions || []).filter((a) => a !== "open"); // open button already present
    if (this.canFallbackToText(appErr && appErr.code) && this.pendingResult) {
      const btn = document.createElement("button");
      btn.className = "button";
      btn.textContent = "Open as plain text";
      btn.addEventListener("click", () => this.loadDocument(this.pendingResult, { forceText: true }));
      const wrap = document.createElement("div");
      wrap.className = "notice__actions";
      wrap.appendChild(btn);
      notice.appendChild(wrap);
    }
    notice.hidden = false;
  }

  clearOpenNotice() {
    this.els.openNotice.hidden = true;
    this.els.openNotice.innerHTML = "";
  }

  setBusy(on, label) {
    appState.ui.busy = on;
    this.els.busy.hidden = !on;
    if (label) this.els.busyLabel.textContent = label;
  }

  showToast(message) {
    const t = this.els.toast;
    t.textContent = message;
    t.hidden = false;
    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => {
      t.hidden = true;
    }, 4200);
  }

  showActionToast(message, actionLabel, onAction) {
    const t = this.els.toast;
    t.textContent = message + "  ";
    const btn = document.createElement("button");
    btn.className = "button";
    btn.style.marginLeft = "10px";
    btn.textContent = actionLabel;
    btn.addEventListener("click", () => {
      t.hidden = true;
      onAction();
    });
    t.appendChild(btn);
    t.hidden = false;
    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => {
      t.hidden = true;
    }, 8000);
  }
}

// Boot.
const app = new ReaderApp();
window.__einkReader = app; // exposed for Playwright test hooks (no behavior change)
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => app.init());
} else {
  app.init();
}

export { ReaderApp, app };
