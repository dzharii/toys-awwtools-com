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
    romajiAliases: true,
    punctuationPractice: false,
    backspaceBehavior: "edit-current",
    manualNavigation: true,
    showRomaji: true,
    showMeaning: true,
    showReading: false,
    showArticleImage: true,
    caretAnimation: "normal",
    speechRate: 1
  };

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
  }

  function bindEvents() {
    els.emptyUploadButton.addEventListener("click", () => openFilePicker());
    els.fileInput.addEventListener("change", () => {
      const file = els.fileInput.files && els.fileInput.files[0];
      els.fileInput.value = "";
      if (file) importFile(file);
    });
    els.menuButton.addEventListener("click", () => openMenu());
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
    resetTokenTimer();
    saveAll();
    render();
    focusTyping();
    smartScrollToPracticeFrame("article-import", true);
  }

  function parseLesson(source) {
    const warnings = [];
    const doc = new DOMParser().parseFromString(source, "text/html");
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
          note: readAttr(tokenEl, "note")
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
      renderImage();
      renderPrevious();
      renderActiveSentence(sentence);
      renderRemaining();
      renderSpeechButton();
      saveAll();
      requestAnimationFrame(skipOptionalPunctuation);
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
    text.textContent = previous.text;
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
    sentence.tokens.forEach(token => {
      const span = document.createElement("span");
      span.className = "token";
      span.textContent = token.text;
      if (token.tokenIndex === runtime.state.tokenIndex) {
        span.classList.add("focus-token");
        if (runtime.settings.showRomaji && token.romaji) {
          const top = document.createElement("span");
          top.className = "focus-hint-top";
          top.textContent = token.romaji;
          span.append(top);
        }
        const bottom = document.createElement("span");
        bottom.className = "focus-hint-bottom";
        if (runtime.settings.showReading && token.reading) {
          const reading = document.createElement("span");
          reading.textContent = token.reading;
          bottom.append(reading);
        }
        if (runtime.settings.showMeaning && token.meaning) {
          const meaning = document.createElement("span");
          meaning.textContent = token.meaning;
          bottom.append(meaning);
        }
        if (bottom.children.length) span.append(bottom);
      }
      els.activeSentenceLine.append(span);
    });
  }

  function renderRemaining() {
    clearNode(els.remainingText);
    const remaining = runtime.article.sentences.slice(runtime.state.sentenceIndex + 1);
    if (!remaining.length) return;
    remaining.forEach(sentence => {
      const p = document.createElement("p");
      p.className = "remaining-sentence-row";
      p.append(createSentenceSpeakButton(sentence.index, "Speak this remaining sentence", "small"));
      const text = document.createElement("span");
      text.textContent = sentence.text;
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

  function clampPosition() {
    if (!runtime.article) return;
    runtime.state.sentenceIndex = clamp(runtime.state.sentenceIndex, 0, runtime.article.sentences.length - 1);
    const sentence = currentSentence();
    runtime.state.tokenIndex = clamp(runtime.state.tokenIndex, 0, sentence.tokens.length - 1);
  }

  function skipOptionalPunctuation() {
    if (!runtime.article || runtime.settings.punctuationPractice || runtime.state.completed || runtime.advancing || runtime.rendering) return;
    let token = currentToken();
    let guard = 0;
    while (token && isPunctuation(token) && guard < 100) {
      completeCurrentToken({ typed: "", skipped: false, autoPunctuation: true, silent: true });
      token = currentToken();
      guard += 1;
    }
  }

  function isPunctuation(token) {
    return PUNCTUATION_TYPES.has(token.type);
  }

  function handleTypingInput() {
    if (!runtime.article || runtime.modalOpen || runtime.state.paused || runtime.state.completed) {
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
      const skipped = Boolean(options.skipped) || (Boolean(options.timedOut) && !normalized);
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
          manualSkip: Boolean(options.manualSkip),
          autoPunctuation: Boolean(options.autoPunctuation)
        };
        runtime.stats.records.push(record);
        if (skipped) runtime.stats.skipped.push(record);
        if (missed) runtime.stats.missed.push(record);
        if (!missed && !skipped) runtime.stats.correct += 1;
      }
      runtime.state.typedInput = "";
      els.typingInput.classList.remove("invalid");
      advanceToken();
    } finally {
      runtime.advancing = false;
    }
  }

  function advanceToken() {
    const sentence = currentSentence();
    if (runtime.state.tokenIndex < sentence.tokens.length - 1) {
      runtime.state.tokenIndex += 1;
      resetTokenTimer();
      render();
      focusTyping();
      return;
    }
    if (runtime.state.sentenceIndex < runtime.article.sentences.length - 1) {
      runtime.state.sentenceIndex += 1;
      runtime.state.tokenIndex = 0;
      resetTokenTimer();
      render();
      focusTyping();
      smartScrollToPracticeFrame("sentence-advance");
      return;
    }
    runtime.state.completed = true;
    runtime.state.paused = true;
    saveAll();
    render();
    openReportDialog(true);
  }

  function movePrevious(sentenceMode = false) {
    if (!runtime.article || (runtime.modalOpen && !sentenceMode)) return;
    if (!runtime.settings.manualNavigation) return;
    runtime.state.typedInput = "";
    els.typingInput.classList.remove("invalid");
    if (sentenceMode) {
      runtime.state.sentenceIndex = Math.max(0, runtime.state.sentenceIndex - 1);
      runtime.state.tokenIndex = 0;
    } else if (runtime.state.tokenIndex > 0) {
      runtime.state.tokenIndex -= 1;
    } else if (runtime.state.sentenceIndex > 0) {
      runtime.state.sentenceIndex -= 1;
      runtime.state.tokenIndex = runtime.article.sentences[runtime.state.sentenceIndex].tokens.length - 1;
    }
    runtime.state.completed = false;
    resetTokenTimer();
    render();
    focusTyping();
    if (!runtime.state.paused) smartScrollToPracticeFrame("manual-previous");
  }

  function moveNext(sentenceMode = false) {
    if (!runtime.article || (runtime.modalOpen && !sentenceMode)) return;
    if (!runtime.settings.manualNavigation) return;
    const typed = runtime.state.typedInput;
    runtime.state.typedInput = "";
    els.typingInput.classList.remove("invalid");
    if (sentenceMode) {
      runtime.state.sentenceIndex = Math.min(runtime.article.sentences.length - 1, runtime.state.sentenceIndex + 1);
      runtime.state.tokenIndex = 0;
    } else {
      completeCurrentToken({ typed, skipped: true, manualSkip: true });
      return;
    }
    runtime.state.completed = false;
    resetTokenTimer();
    render();
    focusTyping();
    if (!runtime.state.paused) smartScrollToPracticeFrame("manual-next");
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
    runtime.state.tokenIndex = 0;
    runtime.state.typedInput = "";
    runtime.state.completed = false;
    resetTokenTimer();
    render();
    focusTyping();
  }

  function resetProgress() {
    if (!runtime.article) return;
    if (runtime.speechSupported) window.speechSynthesis.cancel();
    runtime.state = createFreshState();
    runtime.stats = createFreshStats();
    resetTokenTimer();
    saveAll();
    render();
    focusTyping();
  }

  function tick() {
    const now = performance.now();
    if (runtime.article && !runtime.modalOpen && !runtime.state.paused && runtime.state.timerStarted && !runtime.state.completed) {
      runtime.state.activeElapsedMs += now - runtime.lastTickAt;
      els.timerValue.textContent = formatTime(runtime.state.activeElapsedMs);
      if (shouldAutoAdvanceToken()) completeTimedOutToken();
    }
    runtime.lastTickAt = now;
  }

  function shouldAutoAdvanceToken() {
    if (!runtime.article || runtime.modalOpen || runtime.state.paused || !runtime.state.timerStarted || runtime.state.completed) return false;
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
      skipped: !normalized,
      timedOut: true
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
      runtime.state.paused = true;
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
        dropBox.textContent = "Drop a .jp-lesson.html file here, or choose a file below.";
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
    runtime.state.paused = true;
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
        addMenuButton(list, "Export / Share with Tango", () => { closeModal(); openExportDialog(); });
        body.append(list);
        body.append(createFontSizeRow());
        body.append(createThemeRow());
        const list2 = document.createElement("div");
        list2.className = "menu-list";
        addMenuButton(list2, "Session Report", () => { closeModal(); openReportDialog(false); });
        addMenuButton(list2, "Settings", () => { closeModal(); openSettingsDialog(); });
        body.append(list2);
      },
      actions: [{ label: "Close", kind: "quiet", onClick: closeModal }]
    });
  }

  function addMenuButton(parent, label, onClick) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "quiet-button";
    button.textContent = label;
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
      "Export / Share with Tango": "Export / Share with Tango - create a Tango import URL from plain Japanese text.",
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
        { label: "Close", kind: "primary", onClick: () => { closeModal(); render(); } }
      ]
    });
  }

  function settingsPracticeGroup() {
    const section = settingsSection("Practice");
    section.append(numberSetting("Short delay", "Expected time for particles and punctuation.", runtime.settings.delays.short, value => runtime.settings.delays.short = value));
    section.append(numberSetting("Medium delay", "Expected time for normal words.", runtime.settings.delays.medium, value => runtime.settings.delays.medium = value));
    section.append(numberSetting("Long delay", "Expected time for names, dates, phrases, and long words.", runtime.settings.delays.long, value => runtime.settings.delays.long = value));
    section.append(selectSetting("Start timer", "Controls when active typing time begins.", runtime.settings.startTimer, [["first-input", "On first input"], ["manual", "Start manually"]], value => runtime.settings.startTimer = value));
    return section;
  }

  function settingsInputGroup() {
    const section = settingsSection("Input");
    section.append(toggleSetting("Romaji aliases", "Accept common alternate romaji forms such as si for shi.", runtime.settings.romajiAliases, value => runtime.settings.romajiAliases = value));
    section.append(toggleSetting("Punctuation practice", "Require punctuation typing instead of auto-advancing punctuation.", runtime.settings.punctuationPractice, value => runtime.settings.punctuationPractice = value));
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
    const clearRow = infoRow("Clear saved article", "Removes the current article and progress from this browser.");
    const button = document.createElement("button");
    button.className = "danger-button";
    button.type = "button";
    button.textContent = "Clear Saved Article";
    button.addEventListener("click", () => openConfirmDialog({
      title: "Clear saved article?",
      message: "This removes the current article and its progress from this browser.",
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
    }));
    clearRow.append(button);
    section.append(clearRow);
    return section;
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
        addReportCard(grid, "Accuracy", `${report.accuracy}%`);
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
    const slowTokens = completedRecords
      .filter(record => record.elapsed > record.expected)
      .sort((a, b) => (b.elapsed - b.expected) - (a.elapsed - a.expected))
      .slice(0, 8);
    const missedTokens = completedRecords.filter(record => record.missed).slice(-8);
    const skippedTokens = completedRecords.filter(record => record.skipped || record.manualSkip).slice(-8);
    const candidates = [...slowTokens, ...missedTokens, ...skippedTokens]
      .filter((item, index, arr) => arr.findIndex(candidate => candidate.tokenId === item.tokenId) === index)
      .slice(0, 8);
    const attempted = completedRecords.length || 0;
    const accuracy = attempted ? Math.round((runtime.stats.correct / attempted) * 100) : 100;
    return {
      totalTokens: progress.totalTokens,
      completedTokens: progress.completedTokens,
      accuracy,
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
        if (runtime.article && !runtime.state.paused && runtime.state.timerStarted) {
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
  }

  function formatTime(ms) {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }

  function focusTyping() {
    if (runtime.article && !runtime.modalOpen && !runtime.state.paused) {
      requestAnimationFrame(() => els.typingInput.focus());
    }
  }

  function clearNode(node) {
    while (node.firstChild) node.removeChild(node.firstChild);
  }

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, Number(value) || 0));
  }

  boot();
})();
