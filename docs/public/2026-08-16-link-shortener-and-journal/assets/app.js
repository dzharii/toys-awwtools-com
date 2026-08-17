import { PAGE_TURN_MS, PAN_THRESHOLD_PX } from "../shared/constants.js";
import { JournalData } from "./data.js";

const viewport = document.querySelector("#viewport");
const sceneSpace = document.querySelector("#scene-space");
const scene = document.querySelector("#journal-scene");
const pages = document.querySelector("#pages");
const turnLayer = document.querySelector("#turn-layer");
const previous = document.querySelector("#previous-page");
const next = document.querySelector("#next-page");
const data = new JournalData();
const state = { page: 0, mode: "spread", baseScale: 1, panX: 0, panY: 0, turning: false, pointer: null, suppressClick: false, touch: null, hiddenAt: 0 };

start();

async function start() {
  installInteractions();
  updateGeometry(true);
  renderJournalMessage("Opening the journal…", "loading");
  try {
    await data.loadManifest();
    renderCurrent();
  } catch (error) {
    const diagnostic = error.diagnostic;
    const missing = diagnostic?.context?.["HTTP status"] === 404;
    const invalid = diagnostic?.stage === "manifest validation";
    renderJournalMessage(invalid ? `I'm sorry, the journal data is invalid and cannot be loaded safely.\n\n${diagnostic.reason}` : missing ? "Sorry, I couldn't load the journal.\n\nThe published link manifest is missing." : "Sorry, I couldn't load the journal.\n\nThe link list could not be retrieved.", "error");
  }
}

function renderCurrent() {
  if (!data.manifest.length) {
    const emptyPage = createPage(0, [], true);
    pages.replaceChildren(...(state.mode === "spread" ? [emptyPage, createBlankPage()] : [emptyPage]));
    state.page = 0;
    updateNavigation();
    updateGeometry();
    return;
  }
  const visible = state.mode === "spread" ? [state.page, state.page + 1] : [state.page];
  const fragment = document.createDocumentFragment();
  for (const pageIndex of visible) fragment.append(pageIndex < data.pageCount ? createPage(pageIndex, data.getPage(pageIndex)) : createBlankPage());
  pages.replaceChildren(fragment);
  updateNavigation();
  updateGeometry();
  const prefetch = state.mode === "spread" ? [state.page - 1, state.page + 2] : [state.page - 1, state.page + 1];
  data.prefetch(prefetch);
}

function createPage(pageIndex, slots, empty = false) {
  const page = document.createElement("section");
  page.className = "journal-page";
  page.dataset.page = String(pageIndex);
  page.setAttribute("aria-label", `Journal page ${pageIndex + 1}`);
  const header = document.createElement("header");
  header.className = "page-header";
  const title = document.createElement("h1"); title.textContent = "LINK JOURNAL";
  const number = document.createElement("div"); number.className = "page-number"; number.textContent = `Page ${pageIndex + 1}`;
  header.append(title, ornament(), number);
  const grid = document.createElement("div"); grid.className = "entry-grid";
  if (empty) {
    const message = document.createElement("p"); message.className = "empty-message"; message.textContent = "The journal is empty."; grid.append(message);
  } else {
    for (let index = 0; index < 6; index += 1) {
      const slot = slots[index];
      if (!slot) { const blank = document.createElement("div"); blank.className = "entry-slot empty-slot"; grid.append(blank); continue; }
      const card = loadingCard(slot.id);
      grid.append(card);
      slot.promise.then((entry) => card.replaceWith(entry.status === "error" ? errorCard(entry, slot) : entryCard(entry)));
    }
  }
  page.append(header, grid);
  return page;
}

function ornament() {
  const element = document.createElement("div"); element.className = "ornament"; element.setAttribute("aria-hidden", "true"); element.innerHTML = "<span></span><i>◆</i><span></span>"; return element;
}

function loadingCard(id) {
  const article = document.createElement("article"); article.className = "entry-card is-loading"; article.dataset.id = id;
  article.innerHTML = '<div class="preview-placeholder"></div><div class="loading-line long"></div><div class="loading-line"></div><div class="loading-line short"></div>';
  return article;
}

function entryCard(entry) {
  const wrapper = document.createElement("article");
  wrapper.className = "entry-record"; wrapper.dataset.id = entry.id;
  const link = document.createElement("a");
  link.className = "entry-card"; link.href = entry.targetUrl; link.target = "_blank"; link.draggable = false; link.dataset.id = entry.id; link.rel = "noopener noreferrer";
  const frame = document.createElement("div"); frame.className = "preview-frame";
  const image = document.createElement("img"); image.src = entry.previewUrl; image.alt = ""; image.draggable = false; image.loading = "lazy";
  image.addEventListener("error", () => {
    image.remove(); const failed = document.createElement("span"); failed.className = "preview-failed"; failed.textContent = "Preview unavailable"; frame.append(failed);
    console.warn(`[WARN] [journal] Preview image failed to load\n\nID:\n  ${entry.id}\n\nPreview:\n  ${entry.previewUrl}\n\nEntry remains usable:\n  yes\n\nError code:\n  JOURNAL_PREVIEW_LOAD_FAILED`);
  }, { once: true });
  frame.append(image);
  const title = document.createElement("h2"); title.textContent = entry.title;
  const description = document.createElement("p"); description.className = "entry-description"; description.textContent = entry.description;
  const host = document.createElement("div"); host.className = "entry-host"; host.textContent = new URL(entry.targetUrl).hostname.replace(/^www\./, "");
  const date = document.createElement("time"); date.dateTime = entry.createdAt; date.textContent = `Added ${formatDate(entry.createdAt)}`;
  link.append(frame, title);
  if (entry.description !== "(no description)") link.append(description);
  else link.classList.add("has-no-description");
  link.append(host, date);
  if (entry.status === "stale") { const badge = document.createElement("span"); badge.className = "cached-badge"; badge.textContent = "Cached"; link.append(badge); }
  const copy = document.createElement("button");
  copy.className = "copy-short-url"; copy.type = "button"; copy.textContent = "Copy short URL"; copy.setAttribute("aria-live", "polite");
  copy.addEventListener("click", () => copyShortUrl(copy, entry));
  wrapper.append(link, copy);
  return wrapper;
}

async function copyShortUrl(button, entry) {
  if (button.dataset.copying === "true") return;
  button.dataset.copying = "true";
  clearTimeout(button.copyResetTimer);
  try {
    await writeClipboard(entry.shortUrl);
    button.textContent = "Copied";
    button.dataset.copyState = "success";
  } catch (error) {
    button.textContent = "Copy failed";
    button.dataset.copyState = "error";
    console.warn(`[WARN] [journal] Short URL could not be copied\n\nID:\n  ${entry.id}\n\nReason:\n  ${error.name || "Clipboard error"}\n\nEntry remains usable:\n  yes\n\nError code:\n  JOURNAL_CLIPBOARD_WRITE_FAILED`);
  } finally {
    delete button.dataset.copying;
    button.copyResetTimer = setTimeout(() => {
      button.textContent = "Copy short URL";
      delete button.dataset.copyState;
    }, 1600);
  }
}

async function writeClipboard(value) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(value);
    return;
  }
  const temporary = document.createElement("textarea");
  temporary.value = value; temporary.readOnly = true; temporary.setAttribute("aria-hidden", "true");
  temporary.style.cssText = "position:fixed;inset:auto auto 0 -9999px;opacity:0";
  document.body.append(temporary); temporary.select();
  try {
    if (!document.execCommand("copy")) throw new Error("Clipboard fallback was rejected.");
  } finally {
    temporary.remove();
  }
}

function errorCard(entry, slot) {
  const article = document.createElement("article"); article.className = "entry-card is-error"; article.dataset.id = entry.id;
  const heading = document.createElement("h2"); heading.textContent = "Sorry, this link couldn't be loaded.";
  const reason = document.createElement("p"); reason.textContent = "The journal record is unavailable.";
  const retry = document.createElement("button"); retry.type = "button"; retry.textContent = "Retry";
  retry.addEventListener("click", async () => { article.replaceWith(loadingCard(entry.id)); const fresh = await data.getEntry(entry.id).catch((error) => ({ id: entry.id, status: "error", diagnostic: error.diagnostic })); document.querySelector(`.entry-card[data-id="${entry.id}"]`)?.replaceWith(fresh.status === "error" ? errorCard(fresh, slot) : entryCard(fresh)); });
  article.append(heading, reason, retry); return article;
}

function renderJournalMessage(message, kind) {
  const page = document.createElement("section"); page.className = `journal-page journal-message ${kind}`;
  const text = document.createElement("p"); text.textContent = message; page.append(text); pages.replaceChildren(page);
  if (state.mode === "spread") pages.append(createBlankPage());
}

function createBlankPage() { const page = document.createElement("section"); page.className = "journal-page blank-page"; page.setAttribute("aria-hidden", "true"); return page; }

function formatDate(value) { return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" }).format(new Date(value)); }

function updateNavigation() {
  previous.disabled = state.page <= 0 || state.turning;
  const lastVisible = state.mode === "spread" ? state.page + 1 : state.page;
  next.disabled = lastVisible >= data.pageCount - 1 || state.turning;
}

async function turn(direction) {
  if (state.turning || !data.pageCount) return;
  const step = state.mode === "spread" ? 2 : 1;
  const target = Math.max(0, Math.min(state.page + direction * step, Math.max(0, data.pageCount - 1)));
  const normalized = state.mode === "spread" ? target - target % 2 : target;
  if (normalized === state.page) return;
  state.turning = true; updateNavigation();
  const sourceSelector = direction > 0 ? ".journal-page:last-child" : ".journal-page:first-child";
  const source = pages.querySelector(sourceSelector);
  const clone = source?.cloneNode(true);
  if (clone) { clone.querySelectorAll("a,button").forEach((e) => e.removeAttribute("href")); clone.classList.add("turning-sheet", direction > 0 ? "turn-forward" : "turn-back"); turnLayer.replaceChildren(clone); }
  state.page = normalized;
  renderCurrent();
  if (matchMedia("(prefers-reduced-motion: reduce)").matches || !clone) {
    turnLayer.replaceChildren(); state.turning = false; updateNavigation(); return;
  }
  await new Promise((resolve) => setTimeout(resolve, PAGE_TURN_MS + 40));
  turnLayer.replaceChildren(); state.turning = false; updateNavigation();
}

function updateGeometry(initial = false) {
  const wide = innerWidth >= 1060;
  const mode = wide ? "spread" : "single";
  if (mode !== state.mode && !initial) {
    const anchorPage = state.page;
    state.mode = mode;
    state.page = mode === "spread" ? anchorPage - anchorPage % 2 : anchorPage;
    renderCurrent();
    return;
  }
  state.mode = mode;
  document.documentElement.dataset.mode = mode;
  const designWidth = mode === "spread" ? 1272 : 518;
  const available = Math.max(1, innerWidth - (mode === "spread" ? 72 : 24));
  state.baseScale = Math.max(mode === "spread" ? 0.76 : 0.72, Math.min(1, available / designWidth));
  const scale = state.baseScale;
  const designHeight = 900;
  sceneSpace.style.setProperty("--scene-width", `${Math.max(innerWidth, designWidth * scale + (mode === "spread" ? 72 : 24))}px`);
  sceneSpace.style.setProperty("--scene-height", `${designHeight * scale + 150}px`);
  scene.style.setProperty("--camera-scale", scale);
  scene.style.setProperty("--pan-x", `${state.panX}px`);
  scene.style.setProperty("--pan-y", `${state.panY}px`);
  clampPan();
  requestAnimationFrame(() => {
    if (initial || mode === "single") viewport.scrollLeft = Math.max(0, (viewport.scrollWidth - viewport.clientWidth) / 2);
  });
}

function clampPan() {
  const scaledWidth = (state.mode === "spread" ? 1272 : 518) * state.baseScale;
  const scaledHeight = 900 * state.baseScale;
  const maxX = Math.max(40, (scaledWidth - innerWidth) / 2 + innerWidth * 0.35);
  const maxY = Math.max(50, (scaledHeight - innerHeight) / 2 + innerHeight * 0.3);
  state.panX = Math.max(-maxX, Math.min(maxX, state.panX));
  state.panY = Math.max(-maxY, Math.min(maxY, state.panY));
  scene.style.setProperty("--pan-x", `${state.panX}px`); scene.style.setProperty("--pan-y", `${state.panY}px`);
}

function installInteractions() {
  previous.addEventListener("click", () => turn(-1)); next.addEventListener("click", () => turn(1));
  addEventListener("keydown", (event) => {
    if (event.target.matches("input,textarea,select")) return;
    if (event.key === "ArrowRight" || event.key === "PageDown") { event.preventDefault(); turn(1); }
    if (event.key === "ArrowLeft" || event.key === "PageUp") { event.preventDefault(); turn(-1); }
  });
  viewport.addEventListener("click", (event) => {
    if (!state.suppressClick || event.detail === 0 || !event.target.closest("a.entry-card")) return;
    state.suppressClick = false;
    event.preventDefault();
    event.stopImmediatePropagation();
  }, true);
  viewport.addEventListener("dragstart", (event) => {
    if (state.pointer) event.preventDefault();
  });
  viewport.addEventListener("pointerdown", (event) => {
    if (event.pointerType === "touch" || event.button !== 0 || event.target.closest("button")) return;
    state.suppressClick = false;
    state.pointer = { id: event.pointerId, x: event.clientX, y: event.clientY, panX: state.panX, panY: state.panY, moved: false };
    viewport.classList.add("is-pan-armed");
  });
  viewport.addEventListener("pointermove", (event) => {
    const pointer = state.pointer; if (!pointer || pointer.id !== event.pointerId) return;
    const dx = event.clientX - pointer.x, dy = event.clientY - pointer.y;
    if (!pointer.moved && Math.hypot(dx, dy) < PAN_THRESHOLD_PX) return;
    pointer.moved = true; viewport.setPointerCapture(event.pointerId); viewport.classList.add("is-panning");
    event.preventDefault();
    document.getSelection()?.removeAllRanges();
    state.panX = pointer.panX + dx; state.panY = pointer.panY + dy; clampPan();
  });
  const finishPointer = (event) => {
    if (!state.pointer || state.pointer.id !== event.pointerId) return;
    state.suppressClick = event.type === "pointerup" && state.pointer.moved;
    if (state.suppressClick) setTimeout(() => { state.suppressClick = false; }, 100);
    state.pointer = null; viewport.classList.remove("is-pan-armed", "is-panning");
  };
  viewport.addEventListener("pointerup", finishPointer);
  viewport.addEventListener("pointercancel", finishPointer);
  viewport.addEventListener("lostpointercapture", finishPointer);
  viewport.addEventListener("touchstart", onTouchStart, { passive: true });
  viewport.addEventListener("touchmove", onTouchMove, { passive: false });
  viewport.addEventListener("touchend", onTouchEnd, { passive: true });
  addEventListener("resize", () => updateGeometry());
  document.addEventListener("visibilitychange", async () => {
    if (document.hidden) { state.hiddenAt = Date.now(); return; }
    if (state.hiddenAt && Date.now() - state.hiddenAt >= 3_600_000) {
      const anchor = data.manifest[state.page * 6]; const refresh = await data.loadManifest().catch(() => null);
      if (refresh?.changed) { const index = data.manifest.indexOf(anchor); if (index >= 0) state.page = Math.floor(index / 6); renderCurrent(); }
    }
  });
}

function onTouchStart(event) {
  if (event.target.closest("button")) { state.touch = null; return; }
  if (event.touches.length === 1) state.touch = { mode: "pending", x: event.touches[0].clientX, y: event.touches[0].clientY, lastX: event.touches[0].clientX, lastY: event.touches[0].clientY, time: Date.now(), edgeIntent: event.touches[0].clientX < 44 || event.touches[0].clientX > innerWidth - 44 };
  else state.touch = null;
}
function onTouchMove(event) {
  if (!state.touch) return;
  if (event.touches.length !== 1) { state.touch = null; return; }
  const touch = event.touches[0], dx = touch.clientX - state.touch.x, dy = touch.clientY - state.touch.y;
  if (state.touch.mode === "pending" && Math.hypot(dx, dy) > 10) state.touch.mode = Math.abs(dx) > Math.abs(dy) * 1.35 ? "horizontal" : "vertical";
  if (state.touch.mode === "horizontal") event.preventDefault();
  state.touch.lastX = touch.clientX; state.touch.lastY = touch.clientY;
}
function onTouchEnd() {
  if (state.touch?.mode === "horizontal") {
    const dx = state.touch.lastX - state.touch.x;
    if (Math.abs(dx) > 55 && Date.now() - state.touch.time < 800) turn(dx < 0 ? 1 : -1);
  }
  state.touch = null;
}
