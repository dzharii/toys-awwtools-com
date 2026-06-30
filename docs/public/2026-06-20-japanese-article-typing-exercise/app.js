(() => {
  "use strict";

  const STORAGE_KEYS = {
    source: "jpTyping.currentArticleSource",
    hash: "jpTyping.currentArticleHash",
    state: "jpTyping.currentState",
    stats: "jpTyping.currentStats",
    settings: "jpTyping.currentSettings",
    typedInput: "jpTyping.currentTypedInput",
    lastSaved: "jpTyping.lastSavedAt"
  };

  const DEFAULT_SETTINGS = {
    fontSize: "normal",
    theme: "light",
    delays: { short: 2400, medium: 6400, long: 10000 },
    startTimer: "first-input",
    automaticCaretMovement: true,
    romajiAliases: true,
    punctuationPractice: false,
    typingInputMode: "desktop-only",
    backspaceBehavior: "edit-current",
    manualNavigation: true,
    showRomaji: true,
    showMeaning: true,
    showReading: false,
    showArticleImage: true,
    caretAnimation: "normal",
    speechRate: 1,
    wordGuidanceMode: "focus",
    pictureHintsEnabled: true
  };

  // Token guidance modes for the practice-screen Guidance control. The XML never
  // stores a guidance mode; this is a user preference, not article metadata.
  const GUIDANCE_MODES = [
    { value: "focus", label: "Focus Only" },
    { value: "boundaries", label: "Word Boundaries" },
    { value: "grammar", label: "Grammar Colors" },
    { value: "review", label: "Review Highlights" }
  ];

  // UI labels for semantic token roles. The stored XML value for adjectives stays
  // "adjective"; only the displayed label uses "Describer".
  const TOKEN_TYPE_LABELS = {
    word: "Word",
    particle: "Particle",
    punctuation: "Punctuation",
    phrase: "Phrase",
    name: "Name",
    date: "Date",
    number: "Number",
    place: "Place",
    verb: "Verb",
    adjective: "Describer"
  };

  // Token roles shown in the Grammar Colors legend, in reading-aid order.
  const LEGEND_TYPES = ["word", "place", "name", "verb", "adjective", "particle", "phrase", "date", "number", "punctuation"];

  // Remember which unknown token types we already warned about to avoid console spam.
  const warnedTokenTypes = new Set();

  // Fixed sprite-atlas profile for optional picture hints. The atlas image must be
  // a 1254x1254 grid of 19x19 cells, each 66x66 px. Any atlas that does not match
  // this profile is rejected softly (warn once) so practice is never broken.
  const VISUAL_ATLAS_PROFILE = Object.freeze({
    profile: "practical-19x19-66",
    width: 1254,
    height: 1254,
    columns: 19,
    rows: 19,
    cellSize: 66
  });

  // Atlas/sprite problems must never throw. Each distinct problem is logged once so
  // a malformed lesson cannot spam the console while the learner practises.
  const visualAtlasWarnings = new Set();
  function warnVisualAtlasOnce(code, message, detail) {
    if (visualAtlasWarnings.has(code)) return;
    visualAtlasWarnings.add(code);
    if (detail !== undefined) console.warn(message, detail);
    else console.warn(message);
  }

  // Runtime state for the custom picture-hint tooltip. "pinned" means the hint was
  // opened by a tap (mobile) and should stay until dismissed; otherwise it follows
  // the pointer (desktop hover) and hides on leave.
  const visualHintState = { visible: false, pinned: false, sprite: null };

  const FONT_SIZES = [
    { value: "small", label: "Small", scale: 0.9 },
    { value: "normal", label: "Normal", scale: 1 },
    { value: "large", label: "Large", scale: 1.15 },
    { value: "extra-large", label: "Extra Large", scale: 1.3 }
  ];

  const CARET_DURATIONS = {
    off: "0ms",
    short: "90ms",
    normal: "140ms"
  };

  const PUNCTUATION_TYPES = new Set(["punctuation"]);
  const VALID_DELAYS = new Set(["short", "medium", "long"]);
  const IMAGE_MIMES = new Set(["image/png", "image/jpeg", "image/webp"]);

  const COMMON_ALIASES = {
    "し": ["shi", "si"],
    "ち": ["chi", "ti"],
    "つ": ["tsu", "tu"],
    "ふ": ["fu", "hu"],
    "じ": ["ji", "zi"],
    "を": ["wo", "o"],
    "ん": ["n", "nn", "n'"]
  };

  const els = {
    title: document.querySelector("#lesson-title"),
    subtitle: document.querySelector("#lesson-subtitle"),
    sessionMeta: document.querySelector("#session-meta"),
    progressPercent: document.querySelector("#progress-percent"),
    progressFill: document.querySelector("#progress-fill"),
    timerValue: document.querySelector("#timer-value"),
    characterCount: document.querySelector("#character-count"),
    speakButton: document.querySelector("#speak-button"),
    menuButton: document.querySelector("#menu-button"),
    emptyState: document.querySelector("#empty-state"),
    emptyUploadButton: document.querySelector("#empty-upload-button"),
    sampleTextSelect: document.querySelector("#sample-text-select"),
    sampleTextStatus: document.querySelector("#sample-text-status"),
    practiceScroll: document.querySelector("#practice-scroll"),
    practiceArea: document.querySelector("#practice-area"),
    articleArt: document.querySelector("#article-art"),
    previousSentence: document.querySelector("#previous-sentence"),
    activeSentence: document.querySelector("#active-sentence"),
    activeSpeakButton: document.querySelector("#active-speak-button"),
    activeSentenceLine: document.querySelector("#active-sentence-line"),
    activeMeaningLine: document.querySelector("#active-meaning-line"),
    typingInput: document.querySelector("#typing-input"),
    remainingText: document.querySelector("#remaining-text"),
    bottomControls: document.querySelector("#bottom-controls"),
    guidanceSelect: document.querySelector("#guidance-mode-select"),
    legendButton: document.querySelector("#legend-button"),
    pictureHintsControl: document.querySelector("#picture-hints-control"),
    pictureHintsToggle: document.querySelector("#picture-hints-toggle"),
    visualHintTooltip: document.querySelector("#visual-hint-tooltip"),
    previousButton: document.querySelector("#previous-button"),
    pauseButton: document.querySelector("#pause-button"),
    nextButton: document.querySelector("#next-button"),
    dropOverlay: document.querySelector("#drop-overlay"),
    dropTitle: document.querySelector("#drop-title"),
    dropSubtitle: document.querySelector("#drop-subtitle"),
    modalRoot: document.querySelector("#modal-root"),
    toastRegion: document.querySelector("#toast-region"),
    fileInput: document.querySelector("#file-input")
  };

  const runtime = {
    article: null,
    source: "",
    hash: "",
    state: createFreshState(),
    stats: createFreshStats(),
    settings: clone(DEFAULT_SETTINGS),
    storageAvailable: true,
    storageWarning: "",
    modalOpen: false,
    dropDepth: 0,
    pendingImport: null,
    sampleTexts: [],
    japaneseVoice: null,
    speechSupported: "speechSynthesis" in window,
    tokenStartActiveMs: 0,
    lastTickAt: performance.now(),
    advancing: false,
    rendering: false,
    imageVisible: false
  };

  function createFreshState() {
    return {
      sentenceIndex: 0,
      tokenIndex: 0,
      typedInput: "",
      paused: false,
      timerStarted: true,
      activeElapsedMs: 0,
      completed: false
    };
  }

  function createFreshStats() {
    return {
      records: [],
      missed: [],
      skipped: [],
      correct: 0
    };
  }

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function boot() {
    runtime.storageAvailable = testStorage();
    runtime.settings = { ...clone(DEFAULT_SETTINGS), ...safeReadJson(STORAGE_KEYS.settings, {}) };
    runtime.settings.delays = { ...DEFAULT_SETTINGS.delays, ...(runtime.settings.delays || {}) };
    applySettings();
    restoreSavedArticle();
    bindEvents();
    detectSpeechVoices();
    setInterval(tick, 500);
    render();
    loadSampleTextIndex();
  }

  function bindEvents() {
    els.emptyUploadButton.addEventListener("click", () => openFilePicker());
    els.sampleTextSelect.addEventListener("change", () => handleSampleTextSelect());
    els.fileInput.addEventListener("change", () => {
      const file = els.fileInput.files && els.fileInput.files[0];
      els.fileInput.value = "";
      if (file) importFile(file);
    });
    els.menuButton.addEventListener("click", () => openMenu());
    els.guidanceSelect.addEventListener("change", () => handleGuidanceChange(els.guidanceSelect.value));
    els.legendButton.addEventListener("click", () => openLegendDialog());
    els.pictureHintsToggle.addEventListener("change", handlePictureHintsToggle);
    bindVisualHintEvents();
    els.speakButton.addEventListener("click", () => speakActiveSentence());
    els.activeSpeakButton.addEventListener("click", () => speakActiveSentence());
    els.previousButton.addEventListener("click", event => movePrevious(event.shiftKey));
    els.nextButton.addEventListener("click", event => moveNext(event.shiftKey));
    els.pauseButton.addEventListener("click", togglePause);
    els.typingInput.addEventListener("input", handleTypingInput);
    els.typingInput.addEventListener("keydown", handleInputKeydown);
    document.addEventListener("keydown", handleGlobalKeydown);
    document.addEventListener("dragenter", handleDragEnter);
    document.addEventListener("dragover", handleDragOver);
    document.addEventListener("dragleave", handleDragLeave);
    document.addEventListener("drop", handleDrop);
    if (runtime.speechSupported) {
      window.speechSynthesis.addEventListener("voiceschanged", detectSpeechVoices);
    }
    window.addEventListener("resize", applySettings);
  }

  function testStorage() {
    try {
      const key = "__jpTyping_test__";
      localStorage.setItem(key, "1");
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      runtime.storageWarning = "Local recovery is unavailable in this browser.";
      console.warn("localStorage unavailable", error);
      return false;
    }
  }

  function safeReadJson(key, fallback) {
    if (!runtime.storageAvailable) return fallback;
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (error) {
      console.warn("localStorage read failed", { key, error });
      runtime.storageWarning = "Saved recovery data could not be read.";
      return fallback;
    }
  }

  function safeSet(key, value) {
    if (!runtime.storageAvailable) return;
    try {
      localStorage.setItem(key, value);
      localStorage.setItem(STORAGE_KEYS.lastSaved, new Date().toISOString());
    } catch (error) {
      console.warn("localStorage save failed", { key, error });
      runtime.storageWarning = "This browser could not save the latest practice state.";
    }
  }

  function safeRemove(key) {
    if (!runtime.storageAvailable) return;
    try {
      localStorage.removeItem(key);
      localStorage.setItem(STORAGE_KEYS.lastSaved, new Date().toISOString());
    } catch (error) {
      console.warn("localStorage remove failed", { key, error });
    }
  }

  function saveAll() {
    saveSettings();
    if (!runtime.article) return;
    safeSet(STORAGE_KEYS.source, runtime.source);
    safeSet(STORAGE_KEYS.hash, runtime.hash);
    safeSet(STORAGE_KEYS.state, JSON.stringify(runtime.state));
    safeSet(STORAGE_KEYS.stats, JSON.stringify(runtime.stats));
    safeSet(STORAGE_KEYS.typedInput, runtime.state.typedInput || "");
  }

  function saveSettings() {
    safeSet(STORAGE_KEYS.settings, JSON.stringify(runtime.settings));
  }

  function restoreSavedArticle() {
    if (!runtime.storageAvailable) return;
    const source = localStorage.getItem(STORAGE_KEYS.source);
    if (!source) return;
    try {
      const parsed = parseLesson(source);
      runtime.article = parsed.article;
      runtime.source = source;
      runtime.hash = localStorage.getItem(STORAGE_KEYS.hash) || hashString(source);
      runtime.state = { ...createFreshState(), ...safeReadJson(STORAGE_KEYS.state, {}) };
      runtime.stats = { ...createFreshStats(), ...safeReadJson(STORAGE_KEYS.stats, {}) };
      runtime.state.typedInput = localStorage.getItem(STORAGE_KEYS.typedInput) || runtime.state.typedInput || "";
      if (!runtime.state.paused && !runtime.state.completed) runtime.state.timerStarted = true;
      clampPosition();
      ensureCurrentTokenInteractive("restore");
      resetTokenTimer();
      console.info("Restored saved Japanese typing article", {
        title: runtime.article.title,
        sentences: runtime.article.sentences.length,
        hash: runtime.hash
      });
    } catch (error) {
      console.warn("Saved article restore failed", error);
      runtime.storageWarning = "Saved article recovery failed. Import the article again to continue.";
      clearArticleStorage();
    }
  }

  function clearArticleStorage() {
    [
      STORAGE_KEYS.source,
      STORAGE_KEYS.hash,
      STORAGE_KEYS.state,
      STORAGE_KEYS.stats,
      STORAGE_KEYS.typedInput
    ].forEach(safeRemove);
  }

  function importFile(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const source = String(reader.result || "");
      handleImportedSource(source, file.name);
    };
    reader.onerror = () => {
      console.warn("Article file read failed", { name: file.name, error: reader.error });
      showToast("This article file could not be read.");
    };
    reader.readAsText(file, "utf-8");
  }

  async function loadSampleTextIndex() {
    setSampleTextStatus("Loading samples...");
    try {
      const indexUrl = new URL("texts/index.xml", window.location.href);
      const response = await fetch(indexUrl, { cache: "no-cache" });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const source = await response.text();
      runtime.sampleTexts = parseSampleTextIndex(source, indexUrl);
      renderSampleTextSelect();
      console.info("Sample text index loaded", {
        count: runtime.sampleTexts.length,
        indexUrl: indexUrl.href
      });
    } catch (error) {
      runtime.sampleTexts = [];
      renderSampleTextSelect();
      setSampleTextStatus("Sample list could not be loaded.");
      console.warn("Sample text index load failed", error);
    }
  }

  function parseSampleTextIndex(source, indexUrl) {
    const doc = new DOMParser().parseFromString(source, "application/xml");
    const parseError = doc.querySelector("parsererror");
    if (parseError) throw new Error("Invalid sample text index XML.");
    return [...doc.querySelectorAll("text")]
      .map((item, index) => {
        const href = readAttr(item, "href");
        const title = readAttr(item, "title") || href || `Sample ${index + 1}`;
        const description = readAttr(item, "description");
        if (!href) return null;
        return {
          title,
          description,
          href: new URL(href, indexUrl).href
        };
      })
      .filter(Boolean);
  }

  function renderSampleTextSelect() {
    clearNode(els.sampleTextSelect);
    const placeholder = document.createElement("option");
    placeholder.value = "";
    placeholder.textContent = runtime.sampleTexts.length ? "Choose a sample article" : "No samples available";
    els.sampleTextSelect.append(placeholder);
    runtime.sampleTexts.forEach(sample => {
      const option = document.createElement("option");
      option.value = sample.href;
      option.textContent = sample.title;
      option.title = sample.description || sample.title;
      els.sampleTextSelect.append(option);
    });
    els.sampleTextSelect.disabled = !runtime.sampleTexts.length;
    setSampleTextStatus(runtime.sampleTexts.length ? "" : "No sample articles are listed yet.");
  }

  async function handleSampleTextSelect() {
    const href = els.sampleTextSelect.value;
    if (!href) return;
    const sample = runtime.sampleTexts.find(item => item.href === href);
    els.sampleTextSelect.value = "";
    setSampleTextStatus("Loading sample...");
    try {
      const response = await fetch(href, { cache: "no-cache" });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const source = await response.text();
      handleImportedSource(source, sample ? sample.title : "Sample article");
      setSampleTextStatus(sample ? `Loaded sample: ${sample.title}` : "Loaded sample.");
      console.info("Sample text loaded", { href, title: sample?.title || "" });
    } catch (error) {
      setSampleTextStatus("Sample article could not be loaded.");
      console.warn("Sample text load failed", { href, error });
    }
  }

  function setSampleTextStatus(message) {
    els.sampleTextStatus.textContent = message;
  }

  function handleImportedSource(source, fileName) {
    let parsed;
    try {
      parsed = parseLesson(source);
    } catch (error) {
      console.warn("Import validation failed", {
        fileName,
        message: error.message,
        details: error.details || []
      });
      openMessageDialog(
        "This article could not be loaded.",
        "Please choose a valid lesson document."
      );
      return;
    }

    runtime.pendingImport = { source, article: parsed.article, hash: hashString(source), fileName };
    console.info("Article import validated", {
      fileName,
      title: parsed.article.title,
      sentences: parsed.article.sentences.length,
      tokens: parsed.article.tokens.length,
      warnings: parsed.warnings
    });
    if (parsed.warnings.length) {
      console.warn("Article import warnings", parsed.warnings);
    }

    if (runtime.article) {
      openConfirmDialog({
        title: "Replace current article?",
        message: "This will erase the current article progress and load the new article.",
        confirmLabel: "Replace Article",
        destructive: true,
        onConfirm: () => loadPendingImport()
      });
    } else {
      loadPendingImport();
    }
  }

  function loadPendingImport() {
    if (!runtime.pendingImport) return;
    if (runtime.speechSupported) window.speechSynthesis.cancel();
    runtime.article = runtime.pendingImport.article;
    runtime.source = runtime.pendingImport.source;
    runtime.hash = runtime.pendingImport.hash;
    runtime.state = createFreshState();
    runtime.stats = createFreshStats();
    runtime.pendingImport = null;
    ensureCurrentTokenInteractive("article-import");
    resetTokenTimer();
    saveAll();
    render();
    focusTyping();
    smartScrollToPracticeFrame("article-import", true);
  }

  // Parse the lesson source into a DOM. Lesson files are XML and may use
  // self-closing custom tags such as <jp-token .../> or <jp-image-ref .../>. The
  // HTML parser ignores self-closing syntax on unknown elements and nests every
  // following sibling inside them, which hides sentences and breaks validation.
  // So we parse as XML first (which honors self-closing and explicit-close tags
  // identically) and only fall back to lenient HTML parsing for legacy documents
  // that are not well-formed XML.
  function parseLessonDocument(source) {
    try {
      const xmlDoc = new DOMParser().parseFromString(source, "application/xml");
      if (!xmlDoc.querySelector("parsererror") && xmlDoc.querySelector("jp-lesson")) {
        return xmlDoc;
      }
    } catch (error) {
      console.warn("Lesson XML parse failed; falling back to HTML parsing.", error);
    }
    return new DOMParser().parseFromString(source, "text/html");
  }

  function parseLesson(source) {
    const warnings = [];
    // A new parse means a new lesson surface: forget previous atlas warnings so a
    // later malformed lesson can warn again without being silenced by an old code.
    visualAtlasWarnings.clear();
    const doc = parseLessonDocument(source);
    const lesson = doc.querySelector("jp-lesson");
    if (!lesson) throwValidation("Missing jp-lesson root.");

    const sections = [...lesson.querySelectorAll("jp-section")];
    if (!sections.length) throwValidation("Lesson must contain at least one jp-section.");

    const assets = parseAssets(lesson, warnings);
    const sentences = [];
    const paragraphs = [];
    const imageRefs = [];
    let tokenGlobalIndex = 0;
    let paragraphCounter = 0;

    sections.forEach((sectionEl, sectionIndex) => {
      const section = {
        id: internalId("section", sectionIndex, sectionEl),
        sourceId: readAttr(sectionEl, "id"),
        title: readAttr(sectionEl, "title"),
        index: sectionIndex
      };
      const directParagraphs = [...sectionEl.children].filter(el => el.localName === "jp-paragraph");
      if (directParagraphs.length) {
        // Preserve author order when section-level image anchors sit between paragraphs.
        [...sectionEl.children].forEach(child => {
          if (child.localName === "jp-image-ref") {
            imageRefs.push(parseImageRef(child, sentences.length, section.index, paragraphCounter));
          } else if (child.localName === "jp-paragraph") {
            walkContainer(child, section, paragraphCounter++);
          }
        });
      } else {
        walkContainer(sectionEl, section, paragraphCounter++);
      }
    });

    function walkContainer(container, section, paragraphIndex) {
      const paragraphId = internalId("paragraph", paragraphIndex, container);
      const paragraphSentenceIndexes = [];
      [...container.children].forEach(child => {
        if (child.localName === "jp-image-ref") {
          imageRefs.push(parseImageRef(child, sentences.length, section.index, paragraphIndex));
        }
        if (child.localName === "jp-sentence") {
          const sentence = parseSentence(child, sentences.length, section, paragraphId, paragraphIndex);
          sentences.push(sentence);
          paragraphSentenceIndexes.push(sentence.index);
          tokenGlobalIndex += sentence.tokens.length;
        }
      });
      if (paragraphSentenceIndexes.length) {
        paragraphs.push({ id: paragraphId, index: paragraphIndex, sectionIndex: section.index, sentenceIndexes: paragraphSentenceIndexes });
      }
    }

    function parseSentence(sentenceEl, sentenceIndex, section, paragraphId, paragraphIndex) {
      const tokens = [...sentenceEl.children].filter(el => el.localName === "jp-token").map((tokenEl, tokenIndex) => {
        const type = readAttr(tokenEl, "type");
        const text = readAttr(tokenEl, "text");
        const delay = readAttr(tokenEl, "delay") || "medium";
        const delayMsRaw = readAttr(tokenEl, "delay-ms");
        const details = [];
        if (!text) details.push("Token missing text.");
        if (!type) details.push("Token missing type.");
        if (delay && !VALID_DELAYS.has(delay)) details.push(`Invalid delay value "${delay}".`);
        if (delayMsRaw && !/^\d+$/.test(delayMsRaw)) details.push(`Invalid delay-ms "${delayMsRaw}".`);
        const isPunctuation = type === "punctuation";
        const romaji = readAttr(tokenEl, "romaji");
        if (!isPunctuation && !romaji) details.push(`Typed token "${text || "(empty)"}" is missing romaji.`);
        if (details.length) throwValidation("Invalid lesson token.", details);
        return {
          id: `sentence-${sentenceIndex}-token-${tokenIndex}`,
          sourceId: readAttr(tokenEl, "id") || readAttr(tokenEl, "source-id"),
          sentenceIndex,
          tokenIndex,
          globalIndex: tokenGlobalIndex + tokenIndex,
          text,
          reading: readAttr(tokenEl, "reading"),
          romaji,
          aliases: splitAliases(readAttr(tokenEl, "aliases")),
          meaning: readAttr(tokenEl, "meaning"),
          type,
          delay,
          delayMs: delayMsRaw ? Number(delayMsRaw) : null,
          tags: splitAliases(readAttr(tokenEl, "tags")),
          note: readAttr(tokenEl, "note"),
          // Optional reference to a sprite key in jp-visual-atlases. Resolved lazily
          // at render time so an unknown key never blocks parsing or practice.
          visual: readAttr(tokenEl, "visual")
        };
      });
      if (!tokens.length) throwValidation("Lesson sentence has no jp-token elements.");
      return {
        id: internalId("sentence", sentenceIndex, sentenceEl),
        sourceId: readAttr(sentenceEl, "id"),
        index: sentenceIndex,
        sectionIndex: section.index,
        sectionTitle: section.title,
        paragraphId,
        paragraphIndex,
        tokens,
        text: tokens.map(token => token.text).join("")
      };
    }

    if (!sentences.length) throwValidation("Lesson must contain at least one jp-sentence.");
    const tokens = sentences.flatMap(sentence => sentence.tokens);
    if (!tokens.length) throwValidation("Lesson must contain at least one jp-token.");

    const normalizedRefs = imageRefs.filter(ref => {
      if (!assets[ref.asset]) {
        warnings.push({ type: "missing-image-asset", asset: ref.asset });
        return false;
      }
      return true;
    });

    // Optional picture-hint atlases. Always soft-parsed: any problem warns once and
    // yields an empty sprite map, leaving the rest of the lesson fully usable.
    const visual = parseVisualAtlases(lesson, assets);

    return {
      warnings,
      article: {
        title: readAttr(lesson, "title") || "Untitled Article",
        lang: readAttr(lesson, "lang") || "ja",
        version: readAttr(lesson, "version") || "1.0",
        sections: sections.map((el, index) => ({ id: internalId("section", index, el), title: readAttr(el, "title"), index })),
        paragraphs,
        sentences,
        tokens,
        assets,
        imageRefs: normalizedRefs,
        visualAtlases: visual.visualAtlases,
        visualSprites: visual.visualSprites,
        plainText: buildPlainText(sentences, paragraphs)
      }
    };
  }

  function parseAssets(lesson, warnings) {
    const assets = {};
    const assetRoot = lesson.querySelector("jp-assets");
    if (!assetRoot) return assets;
    [...assetRoot.querySelectorAll("jp-image")].forEach(imageEl => {
      const asset = readAttr(imageEl, "asset") || readAttr(imageEl, "id");
      const mime = readAttr(imageEl, "mime");
      const alt = readAttr(imageEl, "alt");
      const title = readAttr(imageEl, "title");
      const data = readAttr(imageEl, "data") || (imageEl.querySelector("jp-image-data")?.textContent || "").trim();
      if (!asset || !mime || !alt) {
        warnings.push({ type: "invalid-image-asset", asset: asset || "(missing)", reason: "Missing asset, mime, or alt." });
        return;
      }
      if (assets[asset]) {
        warnings.push({ type: "duplicate-image-asset", asset });
        return;
      }
      if (!IMAGE_MIMES.has(mime) || !data.startsWith(`data:${mime};base64,`)) {
        warnings.push({ type: "invalid-image-data", asset, mime });
        return;
      }
      assets[asset] = { asset, mime, alt, title, data };
    });
    return assets;
  }

  // ---- Optional picture-hint atlas parsing -------------------------------------
  // Atlases are parsed defensively. Every failure mode warns once and is skipped;
  // nothing here ever throws, so an invalid atlas can only remove picture hints,
  // never break reading, typing, or navigation.

  function parseVisualAtlases(lesson, assets) {
    const visualAtlases = [];
    const visualSprites = new Map();
    const root = lesson.querySelector("jp-visual-atlases");
    if (!root) return { visualAtlases, visualSprites };
    // querySelectorAll (not .children) because the HTML parser nests self-closing
    // custom elements; descendant search finds every jp-visual-atlas regardless.
    [...root.querySelectorAll("jp-visual-atlas")].forEach(atlasEl => {
      const parsed = parseOneVisualAtlas(atlasEl, assets);
      if (!parsed) return;
      visualAtlases.push(parsed);
      parsed.sprites.forEach((sprite, key) => {
        if (visualSprites.has(key)) {
          warnVisualAtlasOnce(`dup-sprite:${key}`, `[visual-atlas] Duplicate sprite key ignored: ${key}`);
          return;
        }
        visualSprites.set(key, sprite);
      });
    });
    return { visualAtlases, visualSprites };
  }

  function parseOneVisualAtlas(atlasEl, assets) {
    const key = readAttr(atlasEl, "key");
    const assetKey = readAttr(atlasEl, "asset");
    if (!key) {
      warnVisualAtlasOnce("atlas-missing-key", "[visual-atlas] Atlas is missing a key attribute; skipped.");
      return null;
    }
    if (!assetKey) {
      warnVisualAtlasOnce(`atlas-missing-asset:${key}`, `[visual-atlas] Atlas "${key}" is missing an asset attribute; skipped.`);
      return null;
    }
    const asset = assets[assetKey];
    if (!asset || !asset.data || !/^data:image\/[a-z+]+;base64,/i.test(asset.data)) {
      warnVisualAtlasOnce(`atlas-missing-image:${assetKey}`, `[visual-atlas] Atlas "${key}" references missing or invalid image asset "${assetKey}"; skipped.`);
      return null;
    }
    const profile = VISUAL_ATLAS_PROFILE;
    const width = Number(readAttr(atlasEl, "width"));
    const height = Number(readAttr(atlasEl, "height"));
    const columns = Number(readAttr(atlasEl, "columns"));
    const rows = Number(readAttr(atlasEl, "rows"));
    const cellSize = Number(readAttr(atlasEl, "cell-size"));
    const geometryValid =
      [width, height, columns, rows, cellSize].every(Number.isFinite) &&
      width === profile.width && height === profile.height &&
      columns === profile.columns && rows === profile.rows && cellSize === profile.cellSize &&
      width / columns === cellSize && height / rows === cellSize;
    if (!geometryValid) {
      warnVisualAtlasOnce(`atlas-geometry:${key}`, `[visual-atlas] Atlas "${key}" geometry does not match the ${profile.profile} profile; skipped.`, { width, height, columns, rows, cellSize });
      return null;
    }
    const sprites = new Map();
    [...atlasEl.querySelectorAll("jp-sprite")].forEach(spriteEl => {
      const sprite = parseSprite(spriteEl, key, asset.data, width, height, cellSize, columns, rows);
      if (!sprite) return;
      if (sprites.has(sprite.key)) {
        warnVisualAtlasOnce(`dup-sprite-in-atlas:${sprite.key}`, `[visual-atlas] Duplicate sprite "${sprite.key}" within atlas "${key}" ignored.`);
        return;
      }
      sprites.set(sprite.key, sprite);
    });
    return {
      key,
      asset: assetKey,
      profile: readAttr(atlasEl, "profile") || profile.profile,
      title: readAttr(atlasEl, "title"),
      style: readAttr(atlasEl, "style"),
      width, height, columns, rows, cellSize,
      imageDataUrl: asset.data,
      sprites
    };
  }

  function parseSprite(spriteEl, atlasKey, imageDataUrl, atlasWidth, atlasHeight, cellSize, columns, rows) {
    const key = readAttr(spriteEl, "key");
    if (!key) {
      warnVisualAtlasOnce(`sprite-missing-key:${atlasKey}`, `[visual-atlas] A sprite in atlas "${atlasKey}" is missing a key; skipped.`);
      return null;
    }
    const cell = Number(readAttr(spriteEl, "cell"));
    const row = Number(readAttr(spriteEl, "row"));
    const col = Number(readAttr(spriteEl, "col"));
    const maxCell = columns * rows - 1;
    const coordsValid =
      Number.isInteger(cell) && Number.isInteger(row) && Number.isInteger(col) &&
      cell >= 0 && cell <= maxCell &&
      row >= 0 && row <= rows - 1 &&
      col >= 0 && col <= columns - 1 &&
      cell === row * columns + col;
    if (!coordsValid) {
      warnVisualAtlasOnce(`sprite-coords:${key}`, `[visual-atlas] Sprite "${key}" has invalid cell/row/col coordinates; skipped.`, { cell, row, col });
      return null;
    }
    // Denormalize all data the tooltip needs to crop the sprite without further
    // lookups: the image, the full atlas size, and this cell's top-left offset.
    return {
      key,
      atlasKey,
      text: readAttr(spriteEl, "text"),
      reading: readAttr(spriteEl, "reading"),
      meaning: readAttr(spriteEl, "meaning"),
      type: readAttr(spriteEl, "type"),
      conceptKind: readAttr(spriteEl, "concept-kind"),
      cell, row, col,
      x: col * cellSize,
      y: row * cellSize,
      size: cellSize,
      imageDataUrl,
      atlasWidth,
      atlasHeight
    };
  }

  function parseImageRef(el, sentenceIndex, sectionIndex, paragraphIndex) {
    return {
      asset: readAttr(el, "asset") || readAttr(el, "id"),
      placement: readAttr(el, "placement") || "side",
      scope: readAttr(el, "scope") || "paragraph",
      sentenceIndex,
      sectionIndex,
      paragraphIndex
    };
  }

  function throwValidation(message, details = []) {
    const error = new Error(message);
    error.details = details;
    throw error;
  }

  function readAttr(el, name) {
    return (el.getAttribute(name) || "").trim();
  }

  function splitAliases(value) {
    return value ? value.split(",").map(item => normalizeRomaji(item)).filter(Boolean) : [];
  }

  function internalId(kind, index, el) {
    return readAttr(el, "id") || `${kind}-${index}`;
  }

  function buildPlainText(sentences, paragraphs) {
    if (!paragraphs.length) return sentences.map(sentence => sentence.text).join("\n");
    return paragraphs.map(paragraph => paragraph.sentenceIndexes.map(index => sentences[index].text).join("\n")).join("\n\n");
  }

  function hashString(value) {
    let hash = 0;
    for (let index = 0; index < value.length; index += 1) {
      hash = ((hash << 5) - hash + value.charCodeAt(index)) | 0;
    }
    return `h${Math.abs(hash)}`;
  }

  function render() {
    if (runtime.rendering) return;
    runtime.rendering = true;
    applySettings();
    document.body.classList.toggle("has-article", Boolean(runtime.article));
    try {
      if (!runtime.article) {
        renderEmpty();
        return;
      }
      clampPosition();
      const article = runtime.article;
      const sentence = currentSentence();
      const progress = getProgress();
      els.title.textContent = article.title;
      els.subtitle.textContent = "Zen タイピング";
      els.emptyState.hidden = true;
      els.practiceScroll.hidden = false;
      els.practiceArea.hidden = false;
      els.bottomControls.hidden = false;
      els.sessionMeta.hidden = false;
      els.progressPercent.textContent = `${Math.round(progress.percent)}%`;
      els.progressFill.style.width = `${progress.percent}%`;
      els.progressFill.title = `Progress bar - ${Math.round(progress.percent)}% complete.`;
      els.timerValue.textContent = formatTime(runtime.state.activeElapsedMs);
      els.characterCount.textContent = `${progress.completedChars} / ${progress.totalChars}`;
      els.pauseButton.textContent = runtime.state.paused ? "▶　再開" : "▮▮　一時停止";
      els.pauseButton.title = runtime.state.paused
        ? "Resume - restart the timer and automatic token movement."
        : "Pause - stop the timer and automatic token movement.";
      els.typingInput.value = runtime.state.typedInput || "";
      // Re-rendered token spans replace the ones a hover hint was attached to; hide
      // a following (non-pinned) hint so it cannot point at a stale element. A
      // pinned (tapped) hint is independent of the token element and stays open.
      if (!visualHintState.pinned) hideVisualHint();
      renderImage();
      renderPrevious();
      renderActiveSentence(sentence);
      renderRemaining();
      renderSpeechButton();
      saveAll();
    } finally {
      runtime.rendering = false;
    }
  }

  function renderEmpty() {
    els.title.textContent = "Japanese Writing Practice";
    els.subtitle.textContent = "Zen タイピング";
    els.emptyState.hidden = false;
    els.practiceScroll.hidden = true;
    els.practiceArea.hidden = true;
    els.bottomControls.hidden = true;
    els.sessionMeta.hidden = true;
  }

  // Resolve a token's semantic role to a known type. Unknown types fall back to
  // "word" and log a one-time warning so guidance styling stays predictable.
  function resolveTokenType(token) {
    const type = token && token.type;
    if (type && TOKEN_TYPE_LABELS[type]) return type;
    if (type && !warnedTokenTypes.has(type)) {
      warnedTokenTypes.add(type);
      console.warn("Unknown token type, rendering as word", { type, text: token && token.text });
    }
    return "word";
  }

  // Build a lookup of tokens that deserve review attention from session stats.
  // Display priority is missed > skipped > slow (timed out).
  function buildReviewTokenMap() {
    const map = new Map();
    runtime.stats.records.forEach(record => {
      if (!record.tokenId) return;
      const current = map.get(record.tokenId) || {};
      if (record.missed) current.missed = true;
      if (record.skipped) current.skipped = true;
      if (record.timedOut) current.slow = true;
      map.set(record.tokenId, current);
    });
    return map;
  }

  // Only compute the review map when Review Highlights is the active guidance mode.
  function activeReviewMap() {
    return runtime.settings.wordGuidanceMode === "review" ? buildReviewTokenMap() : null;
  }

  // Attach semantic role metadata (and optional review state) to a token span.
  // Color is never the only cue: every token also carries a title and aria-label.
  function decorateTokenRole(span, token, sentenceIndex, reviewMap) {
    const type = resolveTokenType(token);
    span.classList.add("token");
    span.dataset.tokenType = type;
    span.dataset.tokenKey = `${sentenceIndex}:${token.tokenIndex}`;
    const label = TOKEN_TYPE_LABELS[type] || "Word";
    if (token.text) {
      span.title = `${label} - ${token.text}`;
      span.setAttribute("aria-label", `${token.text}, ${label}`);
    } else {
      span.title = label;
    }
    if (reviewMap) {
      const review = reviewMap.get(token.id);
      if (review && review.missed) span.classList.add("review-missed");
      else if (review && review.skipped) span.classList.add("review-skipped");
      else if (review && review.slow) span.classList.add("review-slow");
    }
  }

  // Build the magnified active token with its attached romaji (above) and
  // reading/meaning (below) hints. Hints live inside the token element so they
  // stay attached to the token even when the active sentence wraps.
  function decorateFocusToken(span, token) {
    span.classList.add("focus-token");
    if (runtime.settings.showRomaji && token.romaji) {
      const top = document.createElement("span");
      top.className = "focus-hint-top";
      top.textContent = token.romaji;
      span.append(top);
    }
    const tokenText = document.createElement("span");
    tokenText.className = "focus-token-text";
    tokenText.textContent = token.text;
    span.append(tokenText);
    const bottom = document.createElement("span");
    bottom.className = "focus-hint-bottom";
    if (runtime.settings.showReading && token.reading) {
      const reading = document.createElement("span");
      reading.className = "focus-reading";
      reading.textContent = token.reading;
      bottom.append(reading);
    }
    if (runtime.settings.showMeaning && token.meaning) {
      const meaning = document.createElement("span");
      meaning.className = "focus-meaning";
      meaning.textContent = token.meaning;
      bottom.append(meaning);
    }
    if (bottom.children.length) span.append(bottom);
  }

  // Render every token of a sentence into a container. When focusTokenIndex is
  // provided that token receives the active focus treatment; the rest render as
  // plain token spans. No real spaces are inserted between tokens.
  function appendSentenceTokens(container, sentence, focusTokenIndex, reviewMap) {
    sentence.tokens.forEach(token => {
      const span = document.createElement("span");
      decorateTokenRole(span, token, sentence.index, reviewMap);
      decorateTokenVisual(span, token);
      if (focusTokenIndex != null && token.tokenIndex === focusTokenIndex) {
        decorateFocusToken(span, token);
      } else {
        span.textContent = token.text;
      }
      container.append(span);
    });
  }

  // Mark a token that has a resolvable picture hint so the delegated tooltip
  // handlers and CSS can target it. Unknown sprite references are recorded (warn
  // once) and left undecorated; the token still renders and works normally.
  function decorateTokenVisual(span, token) {
    if (!token.visual) return;
    const sprites = runtime.article && runtime.article.visualSprites;
    const sprite = sprites && sprites.get(token.visual);
    if (!sprite) {
      span.dataset.visualMissing = token.visual;
      warnVisualAtlasOnce(`missing-sprite:${token.visual}`, `[visual-atlas] Token references unknown visual sprite "${token.visual}"; no picture hint shown.`);
      return;
    }
    span.dataset.visual = token.visual;
    span.classList.add("has-visual-hint");
  }

  function renderPrevious() {
    clearNode(els.previousSentence);
    const previous = runtime.article.sentences[runtime.state.sentenceIndex - 1];
    if (!previous) {
      els.previousSentence.classList.add("empty");
      const label = document.createElement("span");
      label.className = "zone-label";
      label.textContent = "前の文";
      label.title = "Previous sentence - shows one sentence before the active sentence for context.";
      els.previousSentence.append(label);
      return;
    }
    els.previousSentence.classList.remove("empty");
    const row = document.createElement("div");
    row.className = "sentence-zone-row";
    row.append(createSentenceSpeakButton(previous.index, "Speak previous sentence", "small"));
    const text = document.createElement("span");
    appendSentenceTokens(text, previous, null, activeReviewMap());
    row.append(text);
    els.previousSentence.append(row);
    const label = document.createElement("span");
    label.className = "zone-label";
    label.textContent = "前の文";
    label.title = "Previous sentence - shows one sentence before the active sentence for context.";
    els.previousSentence.append(label);
  }

  function renderActiveSentence(sentence) {
    clearNode(els.activeSentenceLine);
    els.activeMeaningLine.textContent = buildMeaningSentence(sentence);
    els.activeMeaningLine.hidden = !els.activeMeaningLine.textContent;
    els.activeSpeakButton.hidden = !canSpeakJapanese();
    const focusedToken = sentence.tokens.find(token => token.tokenIndex === runtime.state.tokenIndex);
    const hasBottomHint = Boolean(
      focusedToken &&
      ((runtime.settings.showReading && focusedToken.reading) || (runtime.settings.showMeaning && focusedToken.meaning))
    );
    els.activeSentence.classList.toggle("has-token-bottom-hint", hasBottomHint);
    appendSentenceTokens(els.activeSentenceLine, sentence, runtime.state.tokenIndex, activeReviewMap());
  }

  function renderRemaining() {
    clearNode(els.remainingText);
    const remaining = runtime.article.sentences.slice(runtime.state.sentenceIndex + 1);
    if (!remaining.length) return;
    const reviewMap = activeReviewMap();
    remaining.forEach(sentence => {
      const p = document.createElement("p");
      p.className = "remaining-sentence-row";
      p.append(createSentenceSpeakButton(sentence.index, "Speak this remaining sentence", "small"));
      const text = document.createElement("span");
      appendSentenceTokens(text, sentence, null, reviewMap);
      p.append(text);
      els.remainingText.append(p);
    });
  }

  function renderImage() {
    clearNode(els.articleArt);
    const ref = currentImageRef();
    if (!runtime.settings.showArticleImage || !ref) {
      els.articleArt.classList.add("empty");
      runtime.imageVisible = false;
      els.practiceArea.classList.add("no-article-image");
      return;
    }
    const asset = runtime.article.assets[ref.asset];
    if (!asset) {
      els.articleArt.classList.add("empty");
      runtime.imageVisible = false;
      els.practiceArea.classList.add("no-article-image");
      console.warn("Image reference has no usable asset", { asset: ref.asset });
      return;
    }
    els.articleArt.classList.remove("empty");
    runtime.imageVisible = true;
    els.practiceArea.classList.remove("no-article-image");
    const img = document.createElement("img");
    img.src = asset.data;
    img.alt = asset.alt;
    img.addEventListener("error", () => {
      console.warn("Article image failed to load", { asset: asset.asset, mime: asset.mime });
      els.articleArt.classList.add("empty");
      runtime.imageVisible = false;
      els.practiceArea.classList.add("no-article-image");
      clearNode(els.articleArt);
    });
    els.articleArt.append(img);
    if (asset.title) {
      const caption = document.createElement("div");
      caption.className = "art-caption";
      caption.textContent = asset.title;
      els.articleArt.append(caption);
    }
  }

  function currentImageRef() {
    if (!runtime.article.imageRefs.length) return null;
    const current = runtime.state.sentenceIndex;
    const candidates = runtime.article.imageRefs
      .filter(ref => ref.sentenceIndex <= current)
      .sort((a, b) => b.sentenceIndex - a.sentenceIndex);
    return candidates[0] || runtime.article.imageRefs.find(ref => ref.sentenceIndex >= current) || null;
  }

  function currentSentence() {
    return runtime.article.sentences[runtime.state.sentenceIndex];
  }

  function currentToken() {
    const sentence = currentSentence();
    return sentence && sentence.tokens[runtime.state.tokenIndex];
  }

  function getFlatTokens() {
    if (!runtime.article) return [];
    return runtime.article.sentences.flatMap(sentence =>
      sentence.tokens.map(token => ({
        sentenceIndex: sentence.index,
        tokenIndex: token.tokenIndex,
        globalIndex: token.globalIndex,
        token
      }))
    );
  }

  function isInteractiveToken(token) {
    if (!token) return false;
    if (!isPunctuation(token)) return true;
    return runtime.settings.punctuationPractice;
  }

  function findInteractivePosition(fromGlobalIndex, direction) {
    const flat = getFlatTokens();
    let index = flat.findIndex(item => item.globalIndex === fromGlobalIndex);
    if (index < 0) return null;
    index += direction;
    while (index >= 0 && index < flat.length) {
      if (isInteractiveToken(flat[index].token)) {
        return {
          sentenceIndex: flat[index].sentenceIndex,
          tokenIndex: flat[index].tokenIndex
        };
      }
      index += direction;
    }
    return null;
  }

  function firstInteractiveTokenInSentence(sentenceIndex) {
    const sentence = runtime.article && runtime.article.sentences[sentenceIndex];
    if (!sentence) return null;
    const token = sentence.tokens.find(isInteractiveToken);
    return token ? { sentenceIndex, tokenIndex: token.tokenIndex } : null;
  }

  function firstInteractivePosition() {
    const item = getFlatTokens().find(entry => isInteractiveToken(entry.token));
    return item ? { sentenceIndex: item.sentenceIndex, tokenIndex: item.tokenIndex } : null;
  }

  function ensureCurrentTokenInteractive(reason, direction = 1) {
    if (runtime.state.completed) return true;
    const token = currentToken();
    if (!token || isInteractiveToken(token)) return true;
    return setPracticePosition(
      findInteractivePosition(token.globalIndex, direction) ||
        findInteractivePosition(token.globalIndex, -direction) ||
        firstInteractivePosition(),
      reason
    );
  }

  function setPracticePosition(position, reason = "unknown") {
    if (!runtime.article || !position) return false;
    const sentence = runtime.article.sentences[position.sentenceIndex];
    if (!sentence || !sentence.tokens[position.tokenIndex]) return false;
    runtime.state.sentenceIndex = position.sentenceIndex;
    runtime.state.tokenIndex = position.tokenIndex;
    runtime.state.typedInput = "";
    runtime.state.completed = false;
    els.typingInput.classList.remove("invalid");
    resetTokenTimer();
    render();
    if (shouldFocusTyping()) focusTyping();
    if (!runtime.state.paused) smartScrollToPracticeFrame(reason);
    return true;
  }

  function clampPosition() {
    if (!runtime.article) return;
    runtime.state.sentenceIndex = clamp(runtime.state.sentenceIndex, 0, runtime.article.sentences.length - 1);
    const sentence = currentSentence();
    runtime.state.tokenIndex = clamp(runtime.state.tokenIndex, 0, sentence.tokens.length - 1);
  }

  function isPunctuation(token) {
    return PUNCTUATION_TYPES.has(token.type);
  }

  function isTypingBlocked() {
    const blockingStates = {
      blockBecaouseItIsNotArticle: !runtime.article,
      blockBecaouseModalOpen: runtime.modalOpen,
      blockBecaouseStateCompleted: runtime.state.completed,
    };
    // console.table(blockingStates);
    return Object.values(blockingStates).some(v => v == true);
  }

  function isPracticeRunning() {
    return Boolean(runtime.article && !runtime.modalOpen && !runtime.state.paused && runtime.state.timerStarted && !runtime.state.completed);
  }

  function handleTypingInput() {
    if (isTypingBlocked()) {
      els.typingInput.value = runtime.state.typedInput || "";
      return;
    }
    if (!runtime.state.timerStarted && runtime.settings.startTimer === "first-input") {
      runtime.state.timerStarted = true;
      runtime.lastTickAt = performance.now();
      resetTokenTimer();
    }
    const token = currentToken();
    const typed = els.typingInput.value;
    runtime.state.typedInput = typed;
    const accepted = acceptedInputs(token);
    const normalized = normalizeRomaji(typed);
    const prefixOk = accepted.some(item => item.startsWith(normalized));
    els.typingInput.classList.toggle("invalid", Boolean(normalized) && !prefixOk);
    if (accepted.includes(normalized)) {
      completeCurrentToken({ typed, missed: false });
    }
    saveAll();
  }

  function acceptedInputs(token) {
    if (!token) return [];
    const values = new Set();
    if (token.romaji) values.add(normalizeRomaji(token.romaji));
    token.aliases.forEach(alias => values.add(alias));
    if (runtime.settings.romajiAliases) {
      (COMMON_ALIASES[token.text] || []).forEach(alias => values.add(alias));
    }
    if (isPunctuation(token) && runtime.settings.punctuationPractice) values.add(token.text);
    return [...values].filter(Boolean);
  }

  function normalizeRomaji(value) {
    return String(value || "")
      .normalize("NFKC")
      .trim()
      .toLowerCase()
      .replace(/\s+/g, " ");
  }

  function completeCurrentToken(options = {}) {
    if (runtime.advancing) return;
    const token = currentToken();
    if (!token) return;
    runtime.advancing = true;
    try {
      const elapsed = Math.max(0, runtime.state.activeElapsedMs - runtime.tokenStartActiveMs);
      const expected = resolveDelay(token);
      const typed = options.typed ?? runtime.state.typedInput ?? "";
      const normalized = normalizeRomaji(typed);
      const skipped = Boolean(options.skipped);
      const missed = Boolean(options.missed) || (Boolean(options.timedOut) && Boolean(normalized)) || els.typingInput.classList.contains("invalid");
      if (!options.silent) {
        const record = {
          tokenId: token.id,
          text: token.text,
          romaji: token.romaji,
          typed,
          elapsed,
          expected,
          missed,
          skipped,
          timedOut: Boolean(options.timedOut),
          noInput: Boolean(options.noInput),
          manualSkip: Boolean(options.manualSkip),
          autoPunctuation: Boolean(options.autoPunctuation)
        };
        runtime.stats.records.push(record);
        if (skipped) runtime.stats.skipped.push(record);
        if (missed) runtime.stats.missed.push(record);
        if (!missed && !skipped && normalized) runtime.stats.correct += 1;
      }
      runtime.state.typedInput = "";
      els.typingInput.classList.remove("invalid");
      advanceToken();
    } finally {
      runtime.advancing = false;
    }
  }

  function advanceToken() {
    const token = currentToken();
    if (!token) return;
    const next = findInteractivePosition(token.globalIndex, 1);
    if (next) {
      setPracticePosition(next, "advance-token");
      return;
    }
    runtime.state.completed = true;
    runtime.state.paused = true;
    saveAll();
    render();
    openReportDialog(true);
  }

  function movePrevious(sentenceMode = false) {
    if (!runtime.article || runtime.modalOpen) return;
    if (!runtime.settings.manualNavigation) return;
    if (sentenceMode) {
      moveToPreviousSentence();
      return;
    }
    const token = currentToken();
    if (!token) return;
    setPracticePosition(findInteractivePosition(token.globalIndex, -1), "manual-previous");
  }

  function moveNext(sentenceMode = false) {
    if (!runtime.article || runtime.modalOpen) return;
    if (!runtime.settings.manualNavigation) return;
    const typed = runtime.state.typedInput;
    runtime.state.typedInput = "";
    els.typingInput.classList.remove("invalid");
    if (sentenceMode) {
      moveToNextSentence();
      return;
    } else {
      completeCurrentToken({ typed, skipped: true, manualSkip: true });
      return;
    }
  }

  function moveToPreviousSentence() {
    const targetSentenceIndex = Math.max(0, runtime.state.sentenceIndex - 1);
    const position = firstInteractiveTokenInSentence(targetSentenceIndex);
    setPracticePosition(position, "manual-previous-sentence");
  }

  function moveToNextSentence() {
    const targetSentenceIndex = Math.min(runtime.article.sentences.length - 1, runtime.state.sentenceIndex + 1);
    const position = firstInteractiveTokenInSentence(targetSentenceIndex);
    setPracticePosition(position, "manual-next-sentence");
  }

  function togglePause() {
    if (!runtime.article) return;
    runtime.state.paused = !runtime.state.paused;
    if (!runtime.state.paused) {
      runtime.state.timerStarted = true;
    }
    runtime.lastTickAt = performance.now();
    saveAll();
    render();
    if (!runtime.state.paused) {
      focusTyping();
      smartScrollToPracticeFrame("resume", true);
    }
  }

  function resumePracticeFromModal(reason) {
    closeModal();
    if (!runtime.article) return;
    runtime.state.paused = false;
    runtime.state.timerStarted = true;
    runtime.lastTickAt = performance.now();
    render();
    focusTyping();
    smartScrollToPracticeFrame(reason, true);
  }

  function restartSentence() {
    if (!runtime.article) return;
    setPracticePosition(firstInteractiveTokenInSentence(runtime.state.sentenceIndex), "restart-sentence");
  }

  function resetProgress() {
    if (!runtime.article) return;
    if (runtime.speechSupported) window.speechSynthesis.cancel();
    runtime.state = createFreshState();
    runtime.stats = createFreshStats();
    ensureCurrentTokenInteractive("reset-progress");
    resetTokenTimer();
    saveAll();
    render();
    focusTyping();
  }

  function tick() {
    const now = performance.now();
    if (isPracticeRunning()) {
      runtime.state.activeElapsedMs += now - runtime.lastTickAt;
      els.timerValue.textContent = formatTime(runtime.state.activeElapsedMs);
      if (shouldAutoAdvanceToken()) completeTimedOutToken();
    }
    runtime.lastTickAt = now;
  }

  function shouldAutoAdvanceToken() {
    if (!runtime.settings.automaticCaretMovement) return false;
    if (!isPracticeRunning()) return false;
    if (runtime.advancing || runtime.rendering) return false;
    const token = currentToken();
    if (!token) return false;
    return runtime.state.activeElapsedMs - runtime.tokenStartActiveMs >= resolveDelay(token);
  }

  function completeTimedOutToken() {
    const token = currentToken();
    if (!token) return;
    const typed = runtime.state.typedInput || "";
    const normalized = normalizeRomaji(typed);
    const correct = acceptedInputs(token).includes(normalized);
    completeCurrentToken({
      typed,
      missed: !correct && Boolean(normalized),
      skipped: false,
      timedOut: true,
      noInput: !normalized
    });
  }

  function resetTokenTimer() {
    runtime.tokenStartActiveMs = runtime.state.activeElapsedMs;
  }

  function smartScrollToPracticeFrame(reason = "unknown", force = false) {
    if (!runtime.article || runtime.modalOpen || runtime.state.completed) return;
    if (runtime.state.paused && !force) return;
    const target = runtime.state.sentenceIndex > 0 ? els.previousSentence : els.activeSentence;
    if (!target || !els.practiceScroll) return;
    requestAnimationFrame(() => {
      const scrollRect = els.practiceScroll.getBoundingClientRect();
      const targetRect = target.getBoundingClientRect();
      const outOfView = targetRect.top < scrollRect.top + 8 || targetRect.bottom > scrollRect.bottom - 24;
      if (!force && !outOfView) return;
      console.info("Smart scroll practice frame", { reason, sentenceIndex: runtime.state.sentenceIndex });
      target.scrollIntoView({
        block: "start",
        inline: "nearest",
        behavior: runtime.settings.caretAnimation === "off" ? "auto" : "smooth"
      });
    });
  }

  function resolveDelay(token) {
    if (token.delayMs != null) return token.delayMs;
    return runtime.settings.delays[token.delay || "medium"] || DEFAULT_SETTINGS.delays.medium;
  }

  function getProgress() {
    const totalTokens = runtime.article.tokens.length;
    const completedTokens = runtime.article.sentences
      .slice(0, runtime.state.sentenceIndex)
      .reduce((sum, sentence) => sum + sentence.tokens.length, 0) + runtime.state.tokenIndex;
    const totalChars = runtime.article.sentences.reduce((sum, sentence) => sum + sentence.text.length, 0);
    const completedChars = runtime.article.sentences
      .slice(0, runtime.state.sentenceIndex)
      .reduce((sum, sentence) => sum + sentence.text.length, 0) +
      currentSentence().tokens.slice(0, runtime.state.tokenIndex).reduce((sum, token) => sum + token.text.length, 0);
    return {
      totalTokens,
      completedTokens: runtime.state.completed ? totalTokens : completedTokens,
      percent: runtime.state.completed ? 100 : totalTokens ? (completedTokens / totalTokens) * 100 : 0,
      totalChars,
      completedChars: runtime.state.completed ? totalChars : completedChars
    };
  }

  function handleInputKeydown(event) {
    if (
      event.key === "Backspace" &&
      runtime.settings.backspaceBehavior === "lock-mistakes" &&
      els.typingInput.classList.contains("invalid")
    ) {
      event.preventDefault();
      return;
    }
    if (event.key === "Enter") {
      const token = currentToken();
      if (token && acceptedInputs(token).includes(normalizeRomaji(runtime.state.typedInput))) {
        completeCurrentToken({ typed: runtime.state.typedInput });
      }
    }
  }

  function handleGlobalKeydown(event) {
    if (event.target && ["INPUT", "TEXTAREA", "SELECT"].includes(event.target.tagName) && event.target !== els.typingInput) return;
    if (runtime.modalOpen && event.key === "Escape") {
      closeModal();
      return;
    }
    if (!runtime.article) return;
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      movePrevious(event.shiftKey);
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      moveNext(event.shiftKey);
    } else if (event.key === "Escape") {
      event.preventDefault();
      openMenu();
    } else if (event.key === " " && event.target !== els.typingInput) {
      event.preventDefault();
      togglePause();
    }
  }

  function handleDragEnter(event) {
    if (!hasFiles(event)) return;
    event.preventDefault();
    runtime.dropDepth += 1;
    updateDropOverlay(true);
  }

  function handleDragOver(event) {
    if (!hasFiles(event)) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = "copy";
  }

  function handleDragLeave(event) {
    if (!hasFiles(event)) return;
    runtime.dropDepth = Math.max(0, runtime.dropDepth - 1);
    if (runtime.dropDepth === 0) updateDropOverlay(false);
  }

  function handleDrop(event) {
    if (!hasFiles(event)) return;
    event.preventDefault();
    runtime.dropDepth = 0;
    updateDropOverlay(false);
    const file = event.dataTransfer.files && event.dataTransfer.files[0];
    if (file) importFile(file);
  }

  function hasFiles(event) {
    return event.dataTransfer && [...event.dataTransfer.types].includes("Files");
  }

  function updateDropOverlay(show) {
    els.dropOverlay.hidden = !show;
    if (!show) return;
    if (runtime.article) {
      els.dropTitle.textContent = "Drop article to replace current article";
      els.dropSubtitle.textContent = "You will be asked to confirm before progress is erased.";
    } else {
      els.dropTitle.textContent = "Drop article to begin";
      els.dropSubtitle.textContent = "";
    }
  }

  function openFilePicker() {
    els.fileInput.click();
  }

  function openUploadDialog() {
    openModal({
      title: "Import Article",
      message: runtime.article
        ? "Choose a lesson document or drop it here. The app will validate the article before replacing your current practice session."
        : "Choose a lesson document or drop it here to begin.",
      body: modalBody => {
        const dropBox = document.createElement("div");
        dropBox.className = "report-card";
        dropBox.textContent = "Drop a .jp-lesson.xml file here, or choose a file below.";
        dropBox.addEventListener("dragover", event => {
          event.preventDefault();
          event.dataTransfer.dropEffect = "copy";
        });
        dropBox.addEventListener("drop", event => {
          event.preventDefault();
          const file = event.dataTransfer.files && event.dataTransfer.files[0];
          closeModal();
          if (file) importFile(file);
        });
        modalBody.append(dropBox);
      },
      actions: [
        { label: "Cancel", kind: "quiet", onClick: closeModal },
        { label: "Choose File", kind: "primary", onClick: () => { closeModal(); openFilePicker(); } }
      ]
    });
  }

  function openMenu() {
    if (!runtime.article) {
      openUploadDialog();
      return;
    }
    render();
    openModal({
      title: runtime.article.title,
      message: "Session menu",
      size: "small",
      body: body => {
        const list = document.createElement("div");
        list.className = "menu-list";
        addMenuButton(list, "Resume", () => resumePracticeFromModal("menu-resume"));
        addMenuButton(list, "Restart Sentence", () => { closeModal(); restartSentence(); });
        addMenuButton(list, "Reset Current Article Progress", () => {
          closeModal();
          openConfirmDialog({
            title: "Reset current article progress?",
            message: "This keeps the current article but clears practice progress, timing, typed input, and session statistics.",
            confirmLabel: "Reset Progress",
            destructive: true,
            onConfirm: resetProgress
          });
        });
        addMenuButton(list, "Import Article", () => { closeModal(); openUploadDialog(); });
        addMenuButton(list, "Copy Article Text", () => copyArticleText());
        addMenuButton(list, "Export / Share with Tango", () => { closeModal(); openExportDialog(); });
        addMenuButton(list, "Clear Saved Article", () => {
          closeModal();
          openClearSavedArticleDialog();
        }, "Return to home page.");
        body.append(list);
        body.append(createFontSizeRow());
        body.append(createThemeRow());
        const list2 = document.createElement("div");
        list2.className = "menu-list";
        addMenuButton(list2, "Session Report", () => { closeModal(); openReportDialog(false); });
        addMenuButton(list2, "Settings", () => { closeModal(); openSettingsDialog(); });
        body.append(list2);
      },
      actions: [{ label: "Close", kind: "quiet", onClick: closePracticeModal }]
    });
  }

  function addMenuButton(parent, label, onClick, description = "") {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "quiet-button";
    const text = document.createElement("span");
    text.textContent = label;
    button.append(text);
    if (description) {
      const small = document.createElement("span");
      small.className = "menu-button-desc";
      small.textContent = description;
      button.append(small);
    }
    button.title = menuHint(label);
    button.addEventListener("click", onClick);
    parent.append(button);
  }

  function menuHint(label) {
    const hints = {
      Resume: "Resume - restart practice timing and automatic token movement.",
      "Restart Sentence": "Restart Sentence - return to the first token of the current sentence.",
      "Reset Current Article Progress": "Reset Current Article Progress - clear timing and token results for this article.",
      "Import Article": "Import Article - upload or replace the current lesson file.",
      "Copy Article Text": "Copy Article Text - copy only the Japanese article text to the clipboard.",
      "Export / Share with Tango": "Export / Share with Tango - create a Tango import URL from plain Japanese text.",
      "Clear Saved Article": "Clear Saved Article - remove the current article and progress, then return to the home page.",
      "Session Report": "Session Report - review progress, accuracy, slow tokens, and missed tokens.",
      Settings: "Settings - adjust timing, display, input, speech, and recovery options."
    };
    return hints[label] || `${label} - open this action.`;
  }

  function createFontSizeRow() {
    const row = createControlRow("Font Size", "Adjusts the reading and hint text.", "font-size-row");
    const controls = document.createElement("div");
    controls.className = "inline-controls";
    const minus = miniButton("-");
    const plus = miniButton("+");
    const select = document.createElement("select");
    select.title = "Font Size - choose how large Japanese reading text appears.";
    FONT_SIZES.forEach(size => select.add(new Option(size.label, size.value)));
    select.value = runtime.settings.fontSize;
    const updateDisabled = () => {
      const index = FONT_SIZES.findIndex(size => size.value === runtime.settings.fontSize);
      minus.disabled = index <= 0;
      plus.disabled = index >= FONT_SIZES.length - 1;
    };
    minus.addEventListener("click", () => shiftFontSize(-1, select, updateDisabled));
    plus.addEventListener("click", () => shiftFontSize(1, select, updateDisabled));
    select.addEventListener("change", () => {
      runtime.settings.fontSize = select.value;
      applySettings();
      saveSettings();
      updateDisabled();
    });
    controls.append(minus, select, plus);
    row.append(controls);
    updateDisabled();
    return row;
  }

  function shiftFontSize(delta, select, updateDisabled) {
    const index = FONT_SIZES.findIndex(size => size.value === runtime.settings.fontSize);
    const next = FONT_SIZES[clamp(index + delta, 0, FONT_SIZES.length - 1)];
    runtime.settings.fontSize = next.value;
    select.value = next.value;
    applySettings();
    saveSettings();
    updateDisabled();
  }

  function createThemeRow() {
    const row = createControlRow("Theme", "Changes the practice surface.", "theme-row");
    const controls = document.createElement("div");
    controls.className = "inline-controls";
    const select = document.createElement("select");
    select.title = "Theme - choose the light or dark practice surface.";
    select.add(new Option("Light", "light"));
    select.add(new Option("Dark", "dark"));
    select.value = runtime.settings.theme;
    select.addEventListener("change", () => {
      runtime.settings.theme = select.value;
      applySettings();
      saveSettings();
    });
    controls.append(select);
    row.append(controls);
    return row;
  }

  function createControlRow(title, desc, className) {
    const row = document.createElement("div");
    row.className = `menu-row ${className}`;
    const label = document.createElement("div");
    const strong = document.createElement("div");
    strong.className = "row-title";
    strong.textContent = title;
    strong.title = `${title} - ${desc}`;
    const small = document.createElement("div");
    small.className = "row-desc";
    small.textContent = desc;
    small.title = `${title} - ${desc}`;
    label.append(strong, small);
    row.append(label);
    return row;
  }

  function miniButton(label) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "mini-button";
    button.textContent = label;
    button.title = label === "+"
      ? "Increase - make this setting larger."
      : "Decrease - make this setting smaller.";
    return button;
  }

  // Guidance mode changes from the practice-screen control: apply immediately,
  // persist, and re-render so token highlighting updates across all zones.
  function handleGuidanceChange(value) {
    const mode = GUIDANCE_MODES.some(item => item.value === value) ? value : "focus";
    runtime.settings.wordGuidanceMode = mode;
    console.info("Guidance mode changed", { mode });
    applySettings();
    saveSettings();
    render();
  }

  // Compact legend explaining the Grammar Colors palette. Closing returns focus
  // to the practice flow.
  function openLegendDialog() {
    openModal({
      title: "Grammar Colors legend",
      message: "Each role keeps the same soft highlight used in the sentence.",
      size: "small",
      body: body => {
        const list = document.createElement("div");
        list.className = "legend-list";
        LEGEND_TYPES.forEach(type => {
          const item = document.createElement("div");
          item.className = "legend-item";
          const swatch = document.createElement("span");
          swatch.className = "legend-swatch";
          swatch.dataset.tokenType = type;
          swatch.setAttribute("aria-hidden", "true");
          const label = document.createElement("span");
          label.textContent = TOKEN_TYPE_LABELS[type] || "Word";
          item.append(swatch, label);
          list.append(item);
        });
        body.append(list);
      },
      actions: [{ label: "Close", kind: "primary", onClick: closePracticeModal }]
    });
  }

  function closePracticeModal() {
    closeModal();
    render();
    focusTyping();
  }

  function openSettingsDialog() {
    openModal({
      title: "Settings",
      message: "Changes save immediately.",
      body: body => {
        body.append(settingsPracticeGroup());
        body.append(settingsInputGroup());
        body.append(settingsDisplayGroup());
        body.append(settingsSpeechGroup());
        body.append(settingsRecoveryGroup());
      },
      actions: [
        { label: "Reset Settings to Defaults", kind: "danger", onClick: () => openConfirmDialog({
          title: "Reset settings to defaults?",
          message: "This returns settings to their defaults. Article progress is not cleared.",
          confirmLabel: "Reset Settings",
          destructive: true,
          onConfirm: () => {
            runtime.settings = clone(DEFAULT_SETTINGS);
            applySettings();
            saveSettings();
            closeModal();
            openSettingsDialog();
          }
        }) },
        { label: "Close", kind: "primary", onClick: closePracticeModal }
      ]
    });
  }

  function settingsPracticeGroup() {
    const section = settingsSection("Practice");
    section.append(numberSetting("Short delay", "Expected time for particles and punctuation.", runtime.settings.delays.short, value => runtime.settings.delays.short = value));
    section.append(numberSetting("Medium delay", "Expected time for normal words.", runtime.settings.delays.medium, value => runtime.settings.delays.medium = value));
    section.append(numberSetting("Long delay", "Expected time for names, dates, phrases, and long words.", runtime.settings.delays.long, value => runtime.settings.delays.long = value));
    section.append(selectSetting("Start timer", "Controls when active typing time begins.", runtime.settings.startTimer, [["first-input", "On first input"], ["manual", "Start manually"]], value => runtime.settings.startTimer = value));
    section.append(toggleSetting("Automatic caret movement", "Move to the next token automatically when the token delay expires.", runtime.settings.automaticCaretMovement, value => {
      runtime.settings.automaticCaretMovement = value;
    }));
    return section;
  }

  function settingsInputGroup() {
    const section = settingsSection("Input");
    section.append(toggleSetting("Romaji aliases", "Accept common alternate romaji forms such as si for shi.", runtime.settings.romajiAliases, value => runtime.settings.romajiAliases = value));
    section.append(toggleSetting("Punctuation practice", "Require punctuation typing instead of auto-advancing punctuation.", runtime.settings.punctuationPractice, value => {
      runtime.settings.punctuationPractice = value;
      if (!value) ensureCurrentTokenInteractive("punctuation-setting");
    }));
    section.append(selectSetting("Typing input", "Controls whether the romaji input box is shown and focused.", runtime.settings.typingInputMode, [["desktop-only", "Desktop only"], ["always", "Always show"], ["hidden", "Hidden"]], value => runtime.settings.typingInputMode = value));
    section.append(selectSetting("Backspace behavior", "Controls editing within the current token.", runtime.settings.backspaceBehavior, [["edit-current", "Allow editing current token"], ["lock-mistakes", "Lock mistakes"]], value => runtime.settings.backspaceBehavior = value));
    section.append(toggleSetting("Manual navigation", "Enable ArrowLeft and ArrowRight caret movement.", runtime.settings.manualNavigation, value => runtime.settings.manualNavigation = value));
    return section;
  }

  function settingsDisplayGroup() {
    const section = settingsSection("Display");
    section.append(toggleSetting("Show romaji", "Shows romaji above the active token.", runtime.settings.showRomaji, value => runtime.settings.showRomaji = value));
    section.append(toggleSetting("Show meaning", "Shows English meaning below the active token.", runtime.settings.showMeaning, value => runtime.settings.showMeaning = value));
    section.append(toggleSetting("Show reading", "Shows kana reading when available.", runtime.settings.showReading, value => runtime.settings.showReading = value));
    section.append(toggleSetting("Show article image", "Shows anchored article image when available.", runtime.settings.showArticleImage, value => runtime.settings.showArticleImage = value));
    section.append(toggleSetting("Picture hints", "Show a small picture when you hover, focus, or tap a token that has a visual.", runtime.settings.pictureHintsEnabled, value => { runtime.settings.pictureHintsEnabled = value; hideVisualHint(); }));
    section.append(selectSetting("Word guidance", "Controls token boundary and grammar role highlighting.", runtime.settings.wordGuidanceMode, GUIDANCE_MODES.map(mode => [mode.value, mode.label]), value => runtime.settings.wordGuidanceMode = value));
    section.append(selectSetting("Caret animation", "Controls how quickly the caret moves.", runtime.settings.caretAnimation, [["off", "Off"], ["short", "Short"], ["normal", "Normal"]], value => runtime.settings.caretAnimation = value));
    return section;
  }

  function settingsSpeechGroup() {
    const section = settingsSection("Speech");
    section.append(infoRow("Speech status", runtime.speechSupported ? "Available in this browser." : "Japanese speech is not available in this browser."));
    section.append(infoRow("Japanese voice status", runtime.japaneseVoice ? `Available: ${runtime.japaneseVoice.name}` : "No Japanese voice detected."));
    if (runtime.japaneseVoice) {
      const buttonRow = infoRow("Speak active sentence", "");
      const button = document.createElement("button");
      button.className = "secondary-button";
      button.type = "button";
      button.textContent = "Test";
      button.addEventListener("click", speakActiveSentence);
      buttonRow.append(button);
      section.append(buttonRow);
      section.append(selectSetting("Speech rate", "Controls browser speech speed.", String(runtime.settings.speechRate), [["0.85", "Slow"], ["1", "Normal"], ["1.15", "Fast"]], value => runtime.settings.speechRate = Number(value)));
    }
    return section;
  }

  function settingsRecoveryGroup() {
    const section = settingsSection("Recovery");
    section.append(infoRow("Recovery status", runtime.storageAvailable ? "localStorage recovery is available." : runtime.storageWarning || "Unavailable."));
    section.append(infoRow("Saved article", runtime.article ? runtime.article.title : "No saved article."));
    section.append(infoRow("Last saved", runtime.storageAvailable ? (localStorage.getItem(STORAGE_KEYS.lastSaved) || "Not saved yet.") : "Unavailable."));
    return section;
  }

  function openClearSavedArticleDialog() {
    openConfirmDialog({
      title: "Clear saved article?",
      message: "This removes the current article and its progress from this browser, then returns to the home page.",
      confirmLabel: "Clear Saved Article",
      destructive: true,
      onConfirm: () => {
        if (runtime.speechSupported) window.speechSynthesis.cancel();
        clearArticleStorage();
        runtime.article = null;
        runtime.source = "";
        runtime.hash = "";
        runtime.state = createFreshState();
        runtime.stats = createFreshStats();
        closeModal();
        render();
      }
    });
  }

  function settingsSection(title) {
    const section = document.createElement("section");
    section.className = "settings-section";
    const heading = document.createElement("h3");
    heading.textContent = title;
    heading.title = `${title} - settings group.`;
    section.append(heading);
    return section;
  }

  function numberSetting(title, desc, value, onChange) {
    const row = settingRow(title, desc);
    const input = document.createElement("input");
    input.type = "number";
    input.title = `${title} - ${desc}`;
    input.min = "200";
    input.max = "20000";
    input.step = "100";
    input.value = value;
    input.addEventListener("change", () => {
      onChange(clamp(Number(input.value) || value, 200, 20000));
      input.value = Number(input.value);
      saveSettings();
    });
    row.append(input);
    return row;
  }

  function toggleSetting(title, desc, value, onChange) {
    const row = settingRow(title, desc);
    const input = document.createElement("input");
    input.type = "checkbox";
    input.title = `${title} - ${desc}`;
    input.checked = Boolean(value);
    input.addEventListener("change", () => {
      onChange(input.checked);
      saveSettings();
      render();
    });
    row.append(input);
    return row;
  }

  function selectSetting(title, desc, value, options, onChange) {
    const row = settingRow(title, desc);
    const select = document.createElement("select");
    select.title = `${title} - ${desc}`;
    options.forEach(([optionValue, label]) => select.add(new Option(label, optionValue)));
    select.value = value;
    select.addEventListener("change", () => {
      onChange(select.value);
      applySettings();
      saveSettings();
      render();
    });
    row.append(select);
    return row;
  }

  function infoRow(title, desc) {
    return settingRow(title, desc);
  }

  function settingRow(title, desc) {
    const row = document.createElement("div");
    row.className = "setting-row";
    const label = document.createElement("div");
    const strong = document.createElement("div");
    strong.className = "row-title";
    strong.textContent = title;
    strong.title = `${title} - ${desc}`;
    const small = document.createElement("div");
    small.className = "row-desc";
    small.textContent = desc;
    small.title = `${title} - ${desc}`;
    label.append(strong, small);
    row.append(label);
    return row;
  }

  function openExportDialog() {
    if (!runtime.article) return;
    const tangoUrl = buildTangoUrl(runtime.article.plainText);
    openModal({
      title: "Export current article to Tango?",
      message: "This shares the plain Japanese article text. Progress, images, romaji, meanings, and settings are not included.",
      body: body => {
        const info = document.createElement("p");
        info.textContent = `${runtime.article.sentences.length} sentences will be exported.`;
        body.append(info);
      },
      actions: [
        { label: "Cancel", kind: "quiet", onClick: closeModal },
        { label: "Copy URL", kind: "secondary", onClick: () => copyTangoUrl(tangoUrl) },
        { label: "Open Tango", kind: "primary", onClick: () => {
          window.open(tangoUrl, "_blank", "noopener,noreferrer");
          closeModal();
        } }
      ]
    });
  }

  function buildTangoUrl(text) {
    const normalized = text.replace(/\r\n?/g, "\n");
    const bytes = new TextEncoder().encode(normalized);
    let binary = "";
    const chunkSize = 0x8000;
    for (let index = 0; index < bytes.length; index += chunkSize) {
      binary += String.fromCharCode(...bytes.slice(index, index + chunkSize));
    }
    return `https://tango-japanese.app/mine#import-japanese-text=BASE64:${btoa(binary)}]]];`;
  }

  async function copyArticleText() {
    if (!runtime.article) return;
    try {
      await navigator.clipboard.writeText(runtime.article.plainText);
      showToast("Article text copied.");
      closePracticeModal();
    } catch (error) {
      console.warn("Article text copy failed", error);
      openModal({
        title: "Copy article text",
        message: "Clipboard access was unavailable. Select and copy the plain Japanese text below.",
        body: body => {
          const textarea = document.createElement("textarea");
          textarea.className = "url-fallback";
          textarea.readOnly = true;
          textarea.value = runtime.article.plainText;
          body.append(textarea);
          requestAnimationFrame(() => {
            textarea.focus();
            textarea.select();
          });
        },
        actions: [{ label: "Close", kind: "primary", onClick: closePracticeModal }]
      });
    }
  }

  async function copyTangoUrl(url) {
    try {
      await navigator.clipboard.writeText(url);
      showToast("Tango URL copied.");
      closeModal();
    } catch (error) {
      console.warn("Clipboard copy failed", error);
      const body = document.querySelector(".modal-body");
      if (body && !body.querySelector(".url-fallback")) {
        const textarea = document.createElement("textarea");
        textarea.className = "url-fallback";
        textarea.readOnly = true;
        textarea.value = url;
        body.append(textarea);
        textarea.focus();
        textarea.select();
      }
    }
  }

  function openReportDialog(completed) {
    const report = buildReport();
    openModal({
      title: "Session Report",
      message: completed ? "Article complete." : "Current practice progress.",
      size: "report-modal",
      body: body => {
        const grid = document.createElement("div");
        grid.className = "report-grid";
        addReportCard(grid, "Active time", formatTime(runtime.state.activeElapsedMs));
        addReportCard(grid, "Progress", `${Math.round(getProgress().percent)}%`);
        addReportCard(grid, "Completed tokens", `${report.completedTokens} / ${report.totalTokens}`);
        addReportCard(grid, "Typed accuracy", report.typedAccuracy == null ? "No typed attempts" : `${report.typedAccuracy}%`);
        addReportCard(grid, "Auto-advanced", String(report.autoAdvancedTokens));
        addReportCard(grid, "Missed", String(report.missedCount));
        body.append(grid);
        body.append(tokenSection("Slow tokens", report.slowTokens));
        body.append(tokenSection("Missed tokens", report.missedTokens));
        body.append(tokenSection("Skipped tokens", report.skippedTokens));
        body.append(tokenSection("Review candidates", report.reviewCandidates));
      },
      actions: [
        { label: "Return to Practice", kind: "primary", onClick: () => resumePracticeFromModal("report-return") },
        { label: "Restart Article", kind: "danger", onClick: () => openConfirmDialog({
          title: "Reset current article progress?",
          message: "This keeps the current article but clears practice progress, timing, typed input, and session statistics.",
          confirmLabel: "Reset Progress",
          destructive: true,
          onConfirm: resetProgress
        }) },
        { label: "Export / Share with Tango", kind: "secondary", onClick: () => { closeModal(); openExportDialog(); } },
        { label: "Close", kind: "quiet", onClick: closeModal }
      ]
    });
  }

  function buildReport() {
    const progress = getProgress();
    const completedRecords = runtime.stats.records.filter(record => !record.autoPunctuation);
    const typedAttempts = completedRecords.filter(record => normalizeRomaji(record.typed));
    const typedCorrect = typedAttempts.filter(record => !record.missed && !record.skipped && !record.manualSkip && !record.timedOut).length;
    const autoAdvancedRecords = completedRecords.filter(record => record.timedOut && record.noInput);
    const slowTokens = completedRecords
      .filter(record => !record.noInput && record.elapsed > record.expected)
      .sort((a, b) => (b.elapsed - b.expected) - (a.elapsed - a.expected))
      .slice(0, 8);
    const missedTokens = completedRecords.filter(record => record.missed).slice(-8);
    const skippedTokens = completedRecords.filter(record => record.manualSkip || (record.skipped && !record.noInput)).slice(-8);
    const candidates = [...slowTokens, ...missedTokens, ...skippedTokens]
      .filter((item, index, arr) => arr.findIndex(candidate => candidate.tokenId === item.tokenId) === index)
      .slice(0, 8);
    const typedAccuracy = typedAttempts.length ? Math.round((typedCorrect / typedAttempts.length) * 100) : null;
    return {
      totalTokens: progress.totalTokens,
      completedTokens: progress.completedTokens,
      typedAccuracy,
      autoAdvancedTokens: autoAdvancedRecords.length,
      missedCount: missedTokens.length,
      slowTokens,
      missedTokens,
      skippedTokens,
      reviewCandidates: candidates
    };
  }

  function addReportCard(parent, label, value) {
    const card = document.createElement("div");
    card.className = "report-card";
    const span = document.createElement("span");
    span.textContent = label;
    span.title = `${label} - session summary metric.`;
    const strong = document.createElement("strong");
    strong.textContent = value;
    strong.title = `${label} - ${value}.`;
    card.append(span, strong);
    parent.append(card);
  }

  function tokenSection(title, rows) {
    const section = document.createElement("section");
    section.className = "settings-section";
    const heading = document.createElement("h3");
    heading.textContent = title;
    heading.title = `${title} - tokens to review from this session.`;
    section.append(heading);
    if (!rows.length) {
      const p = document.createElement("p");
      p.className = "row-desc";
      p.textContent = "None yet.";
      p.title = `${title} - no matching tokens yet.`;
      section.append(p);
      return section;
    }
    const table = document.createElement("table");
    table.className = "token-table";
    const thead = document.createElement("thead");
    const headRow = document.createElement("tr");
    ["Token", "Romaji", "Result", "Time", "Expected"].forEach(label => {
      const th = document.createElement("th");
      th.textContent = label;
      th.title = reportColumnHint(label);
      headRow.append(th);
    });
    thead.append(headRow);
    const tbody = document.createElement("tbody");
    rows.forEach(row => {
      const tr = document.createElement("tr");
      [
        row.text || "",
        row.romaji || "",
        tokenResultLabel(row),
        row.elapsed != null ? `${(row.elapsed / 1000).toFixed(1)}s` : "",
        row.expected != null ? `${(row.expected / 1000).toFixed(1)}s` : ""
      ].forEach(value => {
        const td = document.createElement("td");
        td.textContent = value;
        tr.append(td);
      });
      tbody.append(tr);
    });
    table.append(thead, tbody);
    section.append(table);
    return section;
  }

  function tokenResultLabel(record) {
    if (record.autoPunctuation) return "Punctuation";
    if (record.manualSkip) return "Skipped";
    if (record.timedOut && record.noInput) return "Auto-advanced";
    if (record.timedOut && record.skipped) return "Timed out";
    if (record.timedOut && record.missed) return "Timed out";
    if (record.missed) return "Missed";
    if (record.skipped) return "Skipped";
    return "Correct";
  }

  function reportColumnHint(label) {
    const hints = {
      Token: "Token - Japanese text practiced.",
      Romaji: "Romaji - expected romanized input.",
      Result: "Result - how the token was completed.",
      Time: "Time - actual time spent on the token.",
      Expected: "Expected - configured target time for the token."
    };
    return hints[label] || label;
  }

  function openMessageDialog(title, message) {
    openModal({
      title,
      message,
      size: "small",
      actions: [{ label: "Close", kind: "primary", onClick: closeModal }]
    });
  }

  function openConfirmDialog({ title, message, confirmLabel, destructive, onConfirm }) {
    openModal({
      title,
      message,
      size: "small",
      actions: [
        { label: "Cancel", kind: "quiet", onClick: closeModal },
        { label: confirmLabel, kind: destructive ? "danger" : "primary", onClick: () => { closeModal(); onConfirm(); } }
      ]
    });
  }

  function openModal({ title, message, body, actions = [], size = "" }) {
    closeModal(false);
    runtime.modalOpen = true;
    runtime.lastTickAt = performance.now();
    const backdrop = document.createElement("div");
    backdrop.className = "modal-backdrop";
    const modal = document.createElement("section");
    modal.className = `modal ${size}`.trim();
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    modal.tabIndex = -1;
    const header = document.createElement("header");
    header.className = "modal-header";
    const heading = document.createElement("h2");
    heading.textContent = title;
    heading.title = `${title} - dialog title.`;
    header.append(heading);
    if (message) {
      const p = document.createElement("p");
      p.textContent = message;
      p.title = message;
      header.append(p);
    }
    const modalBody = document.createElement("div");
    modalBody.className = "modal-body";
    if (body) body(modalBody);
    const actionBar = document.createElement("footer");
    actionBar.className = "modal-actions";
    actions.forEach(action => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = buttonClass(action.kind);
      button.textContent = action.label;
      button.title = `${action.label} - dialog action.`;
      button.addEventListener("click", action.onClick);
      actionBar.append(button);
    });
    modal.append(header, modalBody, actionBar);
    backdrop.append(modal);
    els.modalRoot.append(backdrop);
    const focusTarget = modal.querySelector("button, input, select, textarea") || modal;
    focusTarget.focus();
  }

  function buttonClass(kind) {
    if (kind === "primary") return "primary-button";
    if (kind === "danger") return "danger-button";
    if (kind === "secondary") return "secondary-button";
    return "quiet-button";
  }

  function closeModal(resumeTimer = true) {
    clearNode(els.modalRoot);
    if (runtime.modalOpen) {
      runtime.modalOpen = false;
      if (resumeTimer) {
        runtime.lastTickAt = performance.now();
        if (isPracticeRunning()) {
          smartScrollToPracticeFrame("modal-close");
        }
      }
    }
  }

  function showToast(message) {
    const toast = document.createElement("div");
    toast.className = "toast";
    toast.textContent = message;
    els.toastRegion.append(toast);
    setTimeout(() => toast.remove(), 2600);
  }

  function detectSpeechVoices() {
    if (!runtime.speechSupported) {
      runtime.japaneseVoice = null;
      renderSpeechButton();
      return;
    }
    const voices = window.speechSynthesis.getVoices();
    runtime.japaneseVoice = voices.find(voice => voice.lang && voice.lang.toLowerCase().startsWith("ja")) || null;
    console.info("Text-to-speech voice detection", {
      supported: runtime.speechSupported,
      japaneseVoice: runtime.japaneseVoice ? runtime.japaneseVoice.name : null
    });
    renderSpeechButton();
  }

  function renderSpeechButton() {
    const speechAvailable = Boolean(runtime.article && canSpeakJapanese());
    els.speakButton.hidden = !speechAvailable;
    document.querySelectorAll(".sentence-speak-button").forEach(button => {
      button.hidden = !speechAvailable;
    });
  }

  function buildMeaningSentence(sentence) {
    return sentence.tokens
      .map(token => token.meaning)
      .filter(Boolean)
      .join(" ");
  }

  function speakActiveSentence() {
    speakSentence(runtime.state.sentenceIndex);
  }

  function speakSentence(sentenceIndex) {
    if (!runtime.article || !canSpeakJapanese()) return;
    const sentence = runtime.article.sentences[sentenceIndex];
    if (!sentence) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(sentence.text);
      utterance.lang = "ja-JP";
      utterance.voice = runtime.japaneseVoice;
      utterance.rate = Number(runtime.settings.speechRate) || 1;
      window.speechSynthesis.speak(utterance);
    } catch (error) {
      console.warn("Text-to-speech failed", error);
      showToast("Japanese speech could not start.");
    }
  }

  function canSpeakJapanese() {
    return Boolean(runtime.speechSupported && runtime.japaneseVoice);
  }

  function createSentenceSpeakButton(sentenceIndex, label, size = "") {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `sentence-speak-button ${size}`.trim();
    button.textContent = "音";
    button.setAttribute("aria-label", label);
    button.title = `${label} - play browser Japanese text-to-speech for this sentence.`;
    button.hidden = !canSpeakJapanese();
    button.addEventListener("click", () => speakSentence(sentenceIndex));
    return button;
  }

  function applySettings() {
    document.documentElement.dataset.theme = runtime.settings.theme || "light";
    document.body.dataset.theme = runtime.settings.theme || "light";
    const font = FONT_SIZES.find(item => item.value === runtime.settings.fontSize) || FONT_SIZES[1];
    document.documentElement.style.setProperty("--font-scale", String(font.scale));
    document.documentElement.style.setProperty("--caret-duration", CARET_DURATIONS[runtime.settings.caretAnimation] || CARET_DURATIONS.normal);
    document.documentElement.classList.toggle("caret-off", runtime.settings.caretAnimation === "off");
    applyGuidanceMode();
    applyPictureHintsSetting();
    const showTypingInput = shouldShowTypingInput();
    document.body.classList.toggle("typing-input-hidden", !showTypingInput);
    document.body.classList.toggle("typing-input-visible", showTypingInput);
    els.typingInput.setAttribute("aria-hidden", showTypingInput ? "false" : "true");
    els.typingInput.tabIndex = showTypingInput ? 0 : -1;
    if (!showTypingInput && document.activeElement === els.typingInput) {
      els.typingInput.blur();
    }
    measureBottomControls();
  }

  // Normalize and apply the active guidance mode to the body dataset, keep the
  // practice-screen control in sync, and show the Legend button only for grammar.
  function applyGuidanceMode() {
    const mode = GUIDANCE_MODES.some(item => item.value === runtime.settings.wordGuidanceMode)
      ? runtime.settings.wordGuidanceMode
      : "focus";
    runtime.settings.wordGuidanceMode = mode;
    document.body.dataset.guidanceMode = mode;
    if (els.guidanceSelect && els.guidanceSelect.value !== mode) els.guidanceSelect.value = mode;
    if (els.legendButton) els.legendButton.hidden = mode !== "grammar";
  }

  // ---- Picture-hint setting + custom tooltip -----------------------------------

  // Apply the picture-hints preference: reflect it on the body, keep the toggle in
  // sync, and only expose the on-screen control when the current lesson actually
  // contains usable sprites. Old lessons without an atlas behave exactly as before.
  function applyPictureHintsSetting() {
    const enabled = runtime.settings.pictureHintsEnabled !== false;
    runtime.settings.pictureHintsEnabled = enabled;
    document.body.dataset.pictureHints = enabled ? "on" : "off";
    const hasSprites = lessonHasVisualSprites();
    if (els.pictureHintsControl) els.pictureHintsControl.hidden = !hasSprites;
    if (els.pictureHintsToggle) els.pictureHintsToggle.checked = enabled;
    if (!enabled || !hasSprites) hideVisualHint();
  }

  function lessonHasVisualSprites() {
    return Boolean(runtime.article && runtime.article.visualSprites && runtime.article.visualSprites.size);
  }

  function handlePictureHintsToggle() {
    runtime.settings.pictureHintsEnabled = els.pictureHintsToggle.checked;
    console.info("Picture hints toggled", { enabled: runtime.settings.pictureHintsEnabled });
    if (!runtime.settings.pictureHintsEnabled) hideVisualHint();
    saveSettings();
    applySettings();
  }

  function visualHintsAllowed() {
    return runtime.settings.pictureHintsEnabled !== false && lessonHasVisualSprites();
  }

  function isCoarsePointer() {
    return Boolean(window.matchMedia && window.matchMedia("(pointer: coarse)").matches);
  }

  function tokenSpriteFor(tokenEl) {
    if (!tokenEl) return null;
    const key = tokenEl.dataset && tokenEl.dataset.visual;
    if (!key) return null;
    const sprites = runtime.article && runtime.article.visualSprites;
    return (sprites && sprites.get(key)) || null;
  }

  function closestVisualToken(target) {
    return target && target.closest ? target.closest(".token[data-visual]") : null;
  }

  // Delegated picture-hint listeners. Delegation keeps the handlers attached even as
  // token spans are rebuilt on every render. Desktop uses hover/focus that follow
  // the pointer; coarse-pointer (touch) devices use a pinned tap-to-toggle hint.
  function bindVisualHintEvents() {
    const scroll = els.practiceScroll;
    if (!scroll) return;
    scroll.addEventListener("pointerover", onVisualPointerOver);
    scroll.addEventListener("pointermove", onVisualPointerMove);
    scroll.addEventListener("pointerout", onVisualPointerOut);
    scroll.addEventListener("click", onVisualClick);
    scroll.addEventListener("focusin", onVisualFocusIn);
    scroll.addEventListener("focusout", onVisualFocusOut);
    document.addEventListener("keydown", onVisualHintKeydown);
    document.addEventListener("pointerdown", onDocumentPointerDownForHint, true);
  }

  function onVisualPointerOver(event) {
    if (isCoarsePointer()) return;
    if (!visualHintsAllowed()) return;
    const tokenEl = closestVisualToken(event.target);
    if (!tokenEl) return;
    const sprite = tokenSpriteFor(tokenEl);
    if (!sprite) return;
    showVisualHintAtPointer(sprite, event.clientX, event.clientY);
  }

  function onVisualPointerMove(event) {
    if (!visualHintState.visible || visualHintState.pinned) return;
    if (!closestVisualToken(event.target)) return;
    moveVisualHint(event.clientX, event.clientY);
  }

  function onVisualPointerOut(event) {
    if (visualHintState.pinned) return;
    const tokenEl = closestVisualToken(event.target);
    if (!tokenEl) return;
    // Moving onto a child of the same token is not a real leave.
    if (event.relatedTarget && tokenEl.contains(event.relatedTarget)) return;
    hideVisualHint();
  }

  function onVisualClick(event) {
    if (!isCoarsePointer()) return;
    if (!visualHintsAllowed()) return;
    const tokenEl = closestVisualToken(event.target);
    if (!tokenEl) return;
    const sprite = tokenSpriteFor(tokenEl);
    if (!sprite) return;
    if (visualHintState.pinned && visualHintState.sprite === sprite) {
      hideVisualHint();
    } else {
      showVisualHintPinned(sprite);
    }
  }

  function onVisualFocusIn(event) {
    if (isCoarsePointer()) return;
    if (!visualHintsAllowed()) return;
    const tokenEl = closestVisualToken(event.target);
    if (!tokenEl) return;
    const sprite = tokenSpriteFor(tokenEl);
    if (!sprite) return;
    const rect = tokenEl.getBoundingClientRect();
    showVisualHintAtPointer(sprite, rect.left + rect.width / 2, rect.top);
  }

  function onVisualFocusOut() {
    if (!visualHintState.pinned) hideVisualHint();
  }

  function onVisualHintKeydown(event) {
    if (event.key === "Escape" && visualHintState.visible) hideVisualHint();
  }

  function onDocumentPointerDownForHint(event) {
    if (!visualHintState.pinned) return;
    const onTooltip = els.visualHintTooltip && els.visualHintTooltip.contains(event.target);
    const onToken = closestVisualToken(event.target);
    if (!onTooltip && !onToken) hideVisualHint();
  }

  // Render the cropped sprite into the tooltip by positioning a scaled copy of the
  // full atlas image behind a fixed-size window (CSS background, no canvas).
  function renderVisualHintSprite(sprite) {
    const tooltip = els.visualHintTooltip;
    if (!tooltip) return;
    const spriteEl = tooltip.querySelector(".visual-hint-sprite");
    if (!spriteEl) return;
    const displaySize = 132;
    const scale = displaySize / sprite.size;
    spriteEl.style.width = `${displaySize}px`;
    spriteEl.style.height = `${displaySize}px`;
    spriteEl.style.backgroundImage = `url("${sprite.imageDataUrl}")`;
    spriteEl.style.backgroundSize = `${sprite.atlasWidth * scale}px ${sprite.atlasHeight * scale}px`;
    spriteEl.style.backgroundPosition = `-${sprite.x * scale}px -${sprite.y * scale}px`;
    spriteEl.setAttribute("role", "img");
    const label = sprite.meaning || sprite.text || sprite.key;
    spriteEl.setAttribute("aria-label", `Picture hint: ${label}`);
  }

  function showVisualHintAtPointer(sprite, clientX, clientY) {
    const tooltip = els.visualHintTooltip;
    if (!tooltip) return;
    renderVisualHintSprite(sprite);
    tooltip.classList.remove("visual-hint-tooltip-mobile");
    tooltip.hidden = false;
    visualHintState.visible = true;
    visualHintState.pinned = false;
    visualHintState.sprite = sprite;
    moveVisualHint(clientX, clientY);
  }

  function showVisualHintPinned(sprite) {
    const tooltip = els.visualHintTooltip;
    if (!tooltip) return;
    renderVisualHintSprite(sprite);
    tooltip.classList.add("visual-hint-tooltip-mobile");
    tooltip.style.left = "";
    tooltip.style.top = "";
    tooltip.hidden = false;
    visualHintState.visible = true;
    visualHintState.pinned = true;
    visualHintState.sprite = sprite;
  }

  // Keep the hovering tooltip near the pointer but always inside the viewport.
  function moveVisualHint(clientX, clientY) {
    const tooltip = els.visualHintTooltip;
    if (!tooltip || tooltip.hidden) return;
    const margin = 14;
    const rect = tooltip.getBoundingClientRect();
    let left = clientX + 18;
    let top = clientY - rect.height - 16;
    if (left + rect.width + margin > window.innerWidth) left = clientX - rect.width - 18;
    if (left < margin) left = margin;
    if (top < margin) top = clientY + 22;
    if (top + rect.height + margin > window.innerHeight) top = window.innerHeight - rect.height - margin;
    tooltip.style.left = `${Math.round(left)}px`;
    tooltip.style.top = `${Math.round(top)}px`;
  }

  function hideVisualHint() {
    const tooltip = els.visualHintTooltip;
    visualHintState.visible = false;
    visualHintState.pinned = false;
    visualHintState.sprite = null;
    if (!tooltip) return;
    tooltip.hidden = true;
    tooltip.classList.remove("visual-hint-tooltip-mobile");
  }
  // the real height so the scroll area reserves enough space on mobile.
  function measureBottomControls() {
    requestAnimationFrame(() => {
      if (els.bottomControls && !els.bottomControls.hidden) {
        document.documentElement.style.setProperty("--bottom-controls-height", `${els.bottomControls.offsetHeight}px`);
      }
    });
  }

  function isMobileViewport() {
    return window.matchMedia("(max-width: 700px)").matches;
  }

  function shouldShowTypingInput() {
    const mode = runtime.settings.typingInputMode || "desktop-only";
    if (mode === "always") return true;
    if (mode === "hidden") return false;
    return !isMobileViewport();
  }

  function shouldFocusTyping() {
    return Boolean(
      !isTypingBlocked() &&
      shouldShowTypingInput()
    );
  }

  function formatTime(ms) {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }

  function focusTyping() {
    if (!shouldFocusTyping()) return;
    requestAnimationFrame(() => {
      if (shouldFocusTyping()) els.typingInput.focus();
    });
  }

  function clearNode(node) {
    while (node.firstChild) node.removeChild(node.firstChild);
  }

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, Number(value) || 0));
  }

  boot();
})();
