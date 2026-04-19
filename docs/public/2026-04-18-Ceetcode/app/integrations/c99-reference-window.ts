import type { Logger } from "../../runtime/logging";
import { FloatingToolWindow } from "../tool-window/floating-window";

const EMBED_CONTRACT_NAMESPACE = "awwtools.c99-reference.embed";
const EMBED_SCHEMA_VERSION = 1;
const STARTUP_HASH_KEY = "embedded-reference-config";

interface EmbedEnvelope {
  contractNamespace: string;
  schemaVersion: number;
  messageType: string;
  requestIdentifier?: string;
  payload?: Record<string, unknown>;
}

interface C99ReferenceEmbedMessage {
  messageType: string;
  payload: Record<string, unknown>;
  requestIdentifier: string | null;
}

export interface C99ReferenceWindowIntegrationOptions {
  logger: Logger;
  onUnhandledError: (source: string, message: string, options?: { details?: string; stack?: string }) => void;
  onSnippetInsertRequested: (snippetText: string, insertionMode: string) => void;
}

function normalizeText(value: unknown, fallback = ""): string {
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed || fallback;
  }
  return fallback;
}

function buildReferenceBaseCandidates(): URL[] {
  const href = new URL(window.location.href);
  return [new URL("./external-app-c99-reference/", href), new URL("../external-app-c99-reference/", href)];
}

function ensureTrailingSlash(url: URL): URL {
  if (!url.pathname.endsWith("/")) {
    url.pathname = `${url.pathname}/`;
  }
  return url;
}

function tokenizeReferenceSearchSeed(raw: string): string {
  const normalized = raw.trim();
  if (!normalized) return "";
  const token = normalized.match(/[A-Za-z_][A-Za-z0-9_]*/)?.[0] ?? "";
  return token;
}

export class C99ReferenceWindowIntegration {
  private readonly log: Logger;
  private readonly onUnhandledError: C99ReferenceWindowIntegrationOptions["onUnhandledError"];
  private readonly onSnippetInsertRequested: C99ReferenceWindowIntegrationOptions["onSnippetInsertRequested"];
  private readonly shell: FloatingToolWindow;
  private readonly frame: HTMLIFrameElement;
  private readonly baseCandidates: URL[];
  private activeCandidateIndex = 0;
  private currentStartupSearch = "";
  private hasLoadedFrameSource = false;
  private ready = false;
  private fallbackAttempted = false;
  private startupTimeoutId: ReturnType<typeof setTimeout> | null = null;
  private disposed = false;

  constructor(options: C99ReferenceWindowIntegrationOptions) {
    this.log = options.logger;
    this.onUnhandledError = options.onUnhandledError;
    this.onSnippetInsertRequested = options.onSnippetInsertRequested;
    this.baseCandidates = buildReferenceBaseCandidates().map((candidate) => ensureTrailingSlash(candidate));

    this.shell = new FloatingToolWindow({
      id: "reference-window",
      title: "C99 Reference",
      minWidth: 420,
      minHeight: 320,
      defaultWidthRatio: 0.48,
      defaultHeightRatio: 0.72,
      maxWidth: 1160,
      maxHeight: 900,
      storageKey: "ceetcode.reference.window.geometry.v1",
      onRequestOpenStandalone: () => this.openStandalone(),
      onRequestClose: () => {
        this.log.info("Embedded reference window closed", {
          subcategory: "Window"
        });
      }
    });

    this.frame = document.createElement("iframe");
    this.frame.className = "reference-window-frame";
    this.frame.title = "C99 reference";
    this.frame.loading = "eager";
    this.frame.referrerPolicy = "same-origin";
    this.frame.setAttribute("data-testid", "reference-iframe");

    this.shell.getContentElement().appendChild(this.frame);

    this.frame.addEventListener("load", () => {
      this.log.info("Reference iframe loaded", {
        subcategory: "Load",
        context: {
          candidateIndex: this.activeCandidateIndex,
          frameSrc: this.frame.src
        }
      });
    });

    window.addEventListener("message", this.onWindowMessage);
  }

  openEmbedded(seedText = ""): void {
    const searchSeed = tokenizeReferenceSearchSeed(seedText);
    const wasOpen = this.shell.isOpen();

    this.shell.open();

    if (!this.hasLoadedFrameSource) {
      this.currentStartupSearch = searchSeed;
      this.shell.setTitle("C99 Reference");
      this.loadCandidate(0);
      return;
    }

    if (searchSeed && this.ready) {
      this.executeReferenceSearch(searchSeed);
      return;
    }

    if (!wasOpen) {
      this.log.info("Embedded reference reopened from warm state", {
        subcategory: "Window"
      });
    }
  }

  openStandalone(): void {
    const activeBase = this.baseCandidates[this.activeCandidateIndex] ?? this.baseCandidates[0];
    const standaloneUrl = new URL("index.html", activeBase);
    window.open(standaloneUrl.toString(), "_blank", "noopener,noreferrer");

    this.log.info("Reference opened in standalone tab", {
      subcategory: "Window",
      context: {
        url: standaloneUrl.toString()
      }
    });
  }

  closeEmbedded(): void {
    this.shell.close();
  }

  dispose(): void {
    if (this.disposed) {
      return;
    }

    this.disposed = true;
    if (this.startupTimeoutId !== null) {
      clearTimeout(this.startupTimeoutId);
      this.startupTimeoutId = null;
    }

    window.removeEventListener("message", this.onWindowMessage);
    this.shell.dispose();
  }

  private loadCandidate(candidateIndex: number): void {
    const candidate = this.baseCandidates[candidateIndex];
    if (!candidate) {
      this.onUnhandledError("reference", "No reference URL candidates are available.");
      return;
    }

    this.ready = false;
    this.fallbackAttempted = candidateIndex > 0;
    this.activeCandidateIndex = candidateIndex;
    this.hasLoadedFrameSource = true;

    const startupConfig = this.buildStartupConfig(this.currentStartupSearch);
    const encodedConfig = encodeURIComponent(JSON.stringify(startupConfig));

    const frameUrl = new URL("index.html", candidate);
    frameUrl.hash = `${STARTUP_HASH_KEY}=${encodedConfig}`;

    this.frame.src = frameUrl.toString();
    this.startReadyTimeout();

    this.log.info("Embedded reference requested", {
      subcategory: "Load",
      context: {
        candidateIndex,
        searchSeed: this.currentStartupSearch,
        frameUrl: frameUrl.toString()
      }
    });
  }

  private startReadyTimeout(): void {
    if (this.startupTimeoutId !== null) {
      clearTimeout(this.startupTimeoutId);
    }

    this.startupTimeoutId = setTimeout(() => {
      if (this.ready) {
        return;
      }

      if (!this.fallbackAttempted && this.baseCandidates.length > 1) {
        this.log.warn("Primary embedded reference URL did not signal ready; trying fallback", {
          subcategory: "Load",
          context: {
            previousCandidateIndex: this.activeCandidateIndex
          }
        });
        this.loadCandidate(1);
        return;
      }

      this.onUnhandledError("reference", "Embedded C99 reference did not finish initialization.", {
        details: this.frame.src
      });
    }, 5000);
  }

  private buildStartupConfig(initialSearchQueryText: string): Record<string, unknown> {
    return {
      schemaVersion: EMBED_SCHEMA_VERSION,
      embeddingMode: {
        isEmbeddedInsideHostApplication: true,
        embeddedPresentationMode: "panel",
        hideStandaloneTopNavigation: true,
        hideStandaloneFooterArea: true,
        useCompactSpacing: true
      },
      initialViewState: {
        initialFocusTarget: initialSearchQueryText ? "search-input" : "none"
      },
      initialSearchState: {
        initialSearchQueryText,
        initialSearchMatchMode: "best-effort",
        autoRunInitialSearch: Boolean(initialSearchQueryText)
      },
      hostThemeState: {
        hostThemeMode: "named-host-preset",
        hostColorTokenPresetName: "ceetcode-light"
      },
      integrationHints: {
        snippetActionMode: "insert-into-host-editor",
        enableOutboundHeightReporting: true,
        enableHashDrivenInternalNavigation: true
      }
    };
  }

  private postToFrame(messageType: string, payload: Record<string, unknown> = {}, requestIdentifier?: string): void {
    const contentWindow = this.frame.contentWindow;
    if (!contentWindow) {
      return;
    }

    const envelope: EmbedEnvelope = {
      contractNamespace: EMBED_CONTRACT_NAMESPACE,
      schemaVersion: EMBED_SCHEMA_VERSION,
      messageType,
      payload
    };

    if (requestIdentifier) {
      envelope.requestIdentifier = requestIdentifier;
    }

    contentWindow.postMessage(envelope, window.location.origin);
  }

  private onWindowMessage = (event: MessageEvent): void => {
    if (event.origin !== window.location.origin) {
      return;
    }

    if (!this.frame.contentWindow || event.source !== this.frame.contentWindow) {
      return;
    }

    const data = event.data;
    if (!data || typeof data !== "object") {
      return;
    }

    const envelope = data as Partial<EmbedEnvelope>;
    if (envelope.contractNamespace !== EMBED_CONTRACT_NAMESPACE) {
      return;
    }

    const message: C99ReferenceEmbedMessage = {
      messageType: normalizeText(envelope.messageType),
      payload: envelope.payload && typeof envelope.payload === "object" ? envelope.payload : {},
      requestIdentifier: normalizeText(envelope.requestIdentifier, "") || null
    };

    if (!message.messageType) {
      return;
    }

    this.handleEmbedMessage(message);
  };

  private handleEmbedMessage(message: C99ReferenceEmbedMessage): void {
    switch (message.messageType) {
      case "REFERENCE_EMBED_READY":
        this.onEmbedReady(message.payload);
        break;
      case "REFERENCE_CURRENT_ENTRY_CHANGED":
        this.onCurrentEntryChanged(message.payload);
        break;
      case "REFERENCE_SNIPPET_INSERT_REQUESTED":
        this.onSnippetInsertEvent(message.payload);
        break;
      case "REFERENCE_SNIPPET_COPY_REQUESTED":
        this.onSnippetCopyEvent(message.payload);
        break;
      case "REFERENCE_ERROR_EVENT":
        this.onEmbedError(message.payload);
        break;
      case "REFERENCE_SEARCH_STATE_CHANGED":
        this.log.info("Reference search state changed", {
          subcategory: "Events",
          context: {
            searchQueryText: normalizeText(message.payload.searchQueryText),
            visibleResultCount:
              typeof message.payload.visibleResultCount === "number" ? message.payload.visibleResultCount : null
          }
        });
        break;
      default:
        break;
    }
  }

  private onEmbedReady(payload: Record<string, unknown>): void {
    this.ready = true;
    if (this.startupTimeoutId !== null) {
      clearTimeout(this.startupTimeoutId);
      this.startupTimeoutId = null;
    }

    this.log.info("Reference iframe reported ready", {
      subcategory: "Events",
      context: {
        referenceApplicationIdentifier: normalizeText(payload.referenceApplicationIdentifier),
        candidateIndex: this.activeCandidateIndex
      }
    });

    this.postToFrame("INITIALIZE_REFERENCE_EMBEDDING_CONTEXT", {
      hostApplicationIdentifier: "ceetcode",
      embeddedPresentationMode: "panel",
      hideStandaloneTopNavigation: true,
      hideStandaloneFooterArea: true,
      useCompactSpacing: true,
      hostThemeMode: "named-host-preset",
      snippetActionMode: "insert-into-host-editor",
      enableOutboundHeightReporting: true,
      enableHashDrivenInternalNavigation: true
    });

    this.postToFrame("APPLY_HOST_THEME_TOKENS", {
      themeTokenMap: this.buildThemeTokenMap()
    });

    this.postToFrame("REQUEST_CURRENT_REFERENCE_STATE", {
      includeCurrentEntryState: true,
      includeCurrentSearchState: true,
      includeCurrentHeightMeasurement: false
    });
  }

  private buildThemeTokenMap(): Record<string, string> {
    const computed = getComputedStyle(document.documentElement);

    const read = (token: string, fallback: string): string => {
      const value = computed.getPropertyValue(token).trim();
      return value || fallback;
    };

    return {
      "--embedded-reference-background-color": read("--bg", "#f7f7f5"),
      "--embedded-reference-panel-color": read("--panel", "#ffffff"),
      "--embedded-reference-surface-color": read("--panel-subtle", "#f0efe9"),
      "--embedded-reference-text-color": read("--text", "#1f1f1a"),
      "--embedded-reference-muted-text-color": read("--muted", "#5d5f52"),
      "--embedded-reference-border-color": read("--border", "#d6d8cc"),
      "--embedded-reference-accent-color": read("--accent", "#0f766e"),
      "--embedded-reference-link-color": read("--accent", "#0f766e"),
      "--embedded-reference-code-background-color": "#f2f2ec",
      "--embedded-reference-code-text-color": read("--text", "#1f1f1a"),
      "--embedded-reference-search-highlight-color": "#fff2ad",
      "--embedded-reference-font-family": read("--ui", '"Atkinson Hyperlegible", "Segoe UI", "Helvetica Neue", sans-serif'),
      "--embedded-reference-font-size": "15px",
      "--embedded-reference-line-height": "1.5",
      "--embedded-reference-border-radius": "10px",
      "--embedded-reference-spacing-unit": "0.9rem"
    };
  }

  private onCurrentEntryChanged(payload: Record<string, unknown>): void {
    const entryTitle = normalizeText(payload.entryTitle);
    this.shell.setTitle(entryTitle ? `C99 Reference - ${entryTitle}` : "C99 Reference");
  }

  private onSnippetInsertEvent(payload: Record<string, unknown>): void {
    const snippetText = normalizeText(payload.snippetText);
    if (!snippetText) {
      return;
    }

    const insertionMode = normalizeText(payload.insertionMode, "insert-at-cursor");
    this.onSnippetInsertRequested(snippetText, insertionMode);

    this.log.info("Reference snippet insert requested", {
      subcategory: "Snippet",
      context: {
        snippetIdentifier: normalizeText(payload.snippetIdentifier),
        snippetLength: snippetText.length,
        insertionMode
      }
    });
  }

  private onSnippetCopyEvent(payload: Record<string, unknown>): void {
    const snippetText = normalizeText(payload.snippetText);
    if (!snippetText) {
      return;
    }

    void navigator.clipboard
      .writeText(snippetText)
      .then(() => {
        this.log.info("Reference snippet copied to clipboard", {
          subcategory: "Snippet",
          context: {
            snippetIdentifier: normalizeText(payload.snippetIdentifier),
            snippetLength: snippetText.length
          }
        });
      })
      .catch((error) => {
        this.onUnhandledError("reference", `Reference snippet copy failed: ${normalizeText(error, String(error))}`);
      });
  }

  private onEmbedError(payload: Record<string, unknown>): void {
    const errorCode = normalizeText(payload.errorCode, "REFERENCE_ERROR");
    const errorMessage = normalizeText(payload.errorMessage, "Unknown reference embed error.");

    this.log.warn("Reference embed reported error", {
      subcategory: "Events",
      context: {
        errorCode,
        errorMessage,
        relatedRequestIdentifier: normalizeText(payload.relatedRequestIdentifier)
      }
    });

    this.onUnhandledError("reference", `${errorCode}: ${errorMessage}`);
  }

  private executeReferenceSearch(searchQueryText: string): void {
    this.postToFrame("EXECUTE_REFERENCE_SEARCH", {
      searchQueryText,
      searchMatchMode: "best-effort"
    });
  }
}
