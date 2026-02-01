/**
 * MIDDLE FINGER BOY - Application Logic
 *
 * Features:
 * - URL parameter parsing and persistence (msg, mf)
 * - Dynamic speech bubble sizing and text wrapping
 * - Middle finger extension control with joint-based animation
 * - Cloud parallax animation with proper transform composition
 * - Share URL generation that ALWAYS preserves mf parameter
 *
 * Security: All user input is sanitized via textContent (never innerHTML)
 */

// ============================================
// CONFIGURATION
// ============================================

const CONFIG = {
  DEFAULT_MESSAGE: "Hey there!",
  DEFAULT_MF: 100,
  MAX_MESSAGE_LENGTH: 200,

  // Bubble layout settings
  BUBBLE_ANCHOR_X: 80,
  BUBBLE_ANCHOR_Y: 200,
  BUBBLE_MAX_WIDTH: 280,
  BUBBLE_PADDING_X: 24,
  BUBBLE_PADDING_Y: 20,
  BUBBLE_CORNER_RADIUS: 20,
  BUBBLE_FONT_SIZE: 32,
  BUBBLE_LINE_HEIGHT: 1.2,

  // Character anchor point for bubble tail (mouth area)
  CHARACTER_MOUTH_X: 365,
  CHARACTER_MOUTH_Y: 370,

  // Cloud animation base duration (seconds)
  CLOUD_BASE_DURATION: 40,

  // Finger joint coordinates (in hand-right local space)
  FINGER_JOINTS: {
    MCP: { x: 42, y: 0 },    // Base joint (metacarpophalangeal)
    PIP: { x: 42, y: -55 },  // Middle joint (proximal interphalangeal)
    DIP: { x: 42, y: -105 }  // Top joint (distal interphalangeal)
  },

  // Finger fold angles (degrees) for mf=0
  FINGER_FOLD_ANGLES: {
    PROX: -90,
    MID: -90,
    DIST: -45
  }
};

// ============================================
// DOM ELEMENT REFERENCES
// ============================================

const els = {
  svg: null,
  messageInput: null,
  mfRange: null,
  mfOutput: null,
  controls: null,
  btnCopyLink: null,
  btnReset: null,
  btnAnimate: null,
  hudText: null,
  bubbleShape: null,
  bubbleTail: null,
  bubbleTailFill: null,
  bubbleText: null,
  middleProx: null,
  middleMid: null,
  middleDist: null
};

function initElements() {
  els.svg = document.getElementById("artSvg");
  els.messageInput = document.getElementById("messageInput");
  els.mfRange = document.getElementById("mfRange");
  els.mfOutput = document.getElementById("mfOutput");
  els.controls = document.getElementById("controls");
  els.btnCopyLink = document.getElementById("btnCopyLink");
  els.btnReset = document.getElementById("btnReset");
  els.btnAnimate = document.getElementById("btnAnimate");
  els.hudText = document.getElementById("hudText");
  els.bubbleShape = document.getElementById("bubble-shape");
  els.bubbleTail = document.getElementById("bubble-tail");
  els.bubbleTailFill = document.getElementById("bubble-tail-fill");
  els.bubbleText = document.getElementById("bubble-text-node");
  els.middleProx = document.getElementById("middle-prox");
  els.middleMid = document.getElementById("middle-mid");
  els.middleDist = document.getElementById("middle-dist");
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

const SVG_NS = "http://www.w3.org/2000/svg";

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function safeDecodeParam(raw) {
  if (typeof raw !== "string") return "";
  try {
    return decodeURIComponent(raw.replace(/\+/g, "%20"));
  } catch (e) {
    // If malformed URI, return safe fallback
    return raw.replace(/[^\x20-\x7E]/g, "");
  }
}

// ============================================
// URL PARAMETER HANDLING
// ============================================

function parseParams() {
  const usp = new URLSearchParams(window.location.search);

  // Parse message
  const rawMsg = usp.get("msg");
  const msg = rawMsg !== null
    ? safeDecodeParam(rawMsg).slice(0, CONFIG.MAX_MESSAGE_LENGTH)
    : CONFIG.DEFAULT_MESSAGE;

  // Parse middle finger extension
  const rawMf = usp.get("mf");
  let mf = CONFIG.DEFAULT_MF;
  if (rawMf !== null) {
    const parsed = parseInt(rawMf, 10);
    if (Number.isFinite(parsed)) {
      mf = clamp(parsed, 0, 100);
    }
  }

  return { msg: msg || CONFIG.DEFAULT_MESSAGE, mf };
}

/**
 * Update URL in browser address bar
 * CRITICAL: Always includes mf parameter to ensure shareable URLs work correctly
 */
function updateUrl(state) {
  const usp = new URLSearchParams();

  // Always include msg if not default
  if (state.msg && state.msg !== CONFIG.DEFAULT_MESSAGE) {
    usp.set("msg", state.msg);
  }

  // ALWAYS include mf to ensure the share URL preserves finger state
  // This fixes the bug where mf=100 was being omitted
  usp.set("mf", String(Math.round(state.mf)));

  const queryString = usp.toString();
  const newUrl = `${window.location.pathname}${queryString ? `?${queryString}` : ""}${window.location.hash || ""}`;

  window.history.replaceState(null, "", newUrl);
}

/**
 * Build a shareable URL
 * Always includes mf parameter for reproducibility
 */
function buildShareUrl(state) {
  const url = new URL(window.location.href);
  const usp = new URLSearchParams();

  // Include message if not default
  if (state.msg && state.msg !== CONFIG.DEFAULT_MESSAGE) {
    usp.set("msg", state.msg);
  }

  // ALWAYS include mf in share URLs
  usp.set("mf", String(Math.round(state.mf)));

  url.search = usp.toString();
  return url.toString();
}

// ============================================
// CLOUD ANIMATION
// ============================================

function initCloudAnimation() {
  const cloudInners = els.svg.querySelectorAll(".cloud-inner");

  cloudInners.forEach(cloud => {
    const speed = parseFloat(cloud.dataset.speed) || 1;
    // Slower speed = longer duration
    const duration = clamp(CONFIG.CLOUD_BASE_DURATION / speed, 15, 120);
    cloud.style.animationDuration = `${duration}s`;

    // Randomize starting position for variety
    const randomDelay = Math.random() * duration;
    cloud.style.animationDelay = `-${randomDelay}s`;
  });
}

function setMotionEnabled(enabled) {
  document.body.classList.toggle("motion-off", !enabled);
}

// ============================================
// SPEECH BUBBLE LAYOUT ENGINE
// ============================================

/**
 * Create SVG tspan element
 */
function createTspan(textEl, x, y) {
  const tspan = document.createElementNS(SVG_NS, "tspan");
  tspan.setAttribute("x", String(x));
  tspan.setAttribute("y", String(y));
  tspan.textContent = "";
  textEl.appendChild(tspan);
  return tspan;
}

/**
 * Wrap text into SVG tspans with proper line breaking
 * Returns the computed dimensions
 */
function wrapSvgText(textEl, text, maxWidth, x, y) {
  // Clear existing content
  while (textEl.firstChild) {
    textEl.removeChild(textEl.firstChild);
  }

  const fontSize = CONFIG.BUBBLE_FONT_SIZE;
  const lineHeight = Math.round(fontSize * CONFIG.BUBBLE_LINE_HEIGHT);

  // Set base coordinates
  textEl.setAttribute("x", String(x));
  textEl.setAttribute("y", String(y));

  const words = String(text).split(/\s+/).filter(Boolean);
  if (words.length === 0) {
    words.push("...");
  }

  let lineNumber = 0;
  let currentLine = [];
  let tspan = createTspan(textEl, x, y);

  /**
   * Soft-break a long word character by character
   */
  const softBreakWord = (word) => {
    const chars = [...word];
    let current = "";

    for (const char of chars) {
      const candidate = current + char;
      tspan.textContent = candidate;

      if (tspan.getComputedTextLength() > maxWidth && current.length > 0) {
        // Commit current text and start new line
        tspan.textContent = current;
        lineNumber++;
        tspan = createTspan(textEl, x, y + lineNumber * lineHeight);
        current = char;
      } else {
        current = candidate;
      }
    }
    tspan.textContent = current;
  };

  // Process each word
  for (const word of words) {
    const testLine = currentLine.length > 0
      ? currentLine.join(" ") + " " + word
      : word;

    tspan.textContent = testLine;

    if (tspan.getComputedTextLength() <= maxWidth) {
      // Word fits on current line
      currentLine.push(word);
    } else {
      // Word doesn't fit
      if (currentLine.length > 0) {
        // Commit current line, start new one
        tspan.textContent = currentLine.join(" ");
        lineNumber++;
        tspan = createTspan(textEl, x, y + lineNumber * lineHeight);
        currentLine = [];
      }

      // Check if word alone fits
      tspan.textContent = word;
      if (tspan.getComputedTextLength() <= maxWidth) {
        currentLine.push(word);
      } else {
        // Word is too long, need to soft-break
        softBreakWord(word);
        lineNumber++;
        tspan = createTspan(textEl, x, y + lineNumber * lineHeight);
        currentLine = [];
      }
    }
  }

  // Commit final line
  if (currentLine.length > 0) {
    tspan.textContent = currentLine.join(" ");
  }

  // Remove empty trailing tspan
  const lastTspan = textEl.lastChild;
  if (lastTspan && lastTspan.textContent === "") {
    textEl.removeChild(lastTspan);
  }

  // Return line count
  return {
    lineCount: Math.max(1, textEl.childNodes.length),
    lineHeight
  };
}

/**
 * Generate rounded rectangle SVG path
 */
function roundedRectPath(x, y, w, h, r) {
  const radius = clamp(r, 0, Math.min(w, h) / 2);

  return [
    `M ${x + radius} ${y}`,
    `H ${x + w - radius}`,
    `Q ${x + w} ${y} ${x + w} ${y + radius}`,
    `V ${y + h - radius}`,
    `Q ${x + w} ${y + h} ${x + w - radius} ${y + h}`,
    `H ${x + radius}`,
    `Q ${x} ${y + h} ${x} ${y + h - radius}`,
    `V ${y + radius}`,
    `Q ${x} ${y} ${x + radius} ${y}`,
    "Z"
  ].join(" ");
}

/**
 * Update speech bubble with new message
 */
function updateBubble(message) {
  const padX = CONFIG.BUBBLE_PADDING_X;
  const padY = CONFIG.BUBBLE_PADDING_Y;
  const maxTextWidth = CONFIG.BUBBLE_MAX_WIDTH;
  const cornerRadius = CONFIG.BUBBLE_CORNER_RADIUS;

  // Initial text position for measurement
  const textStartX = CONFIG.BUBBLE_ANCHOR_X + padX;
  const textStartY = CONFIG.BUBBLE_ANCHOR_Y + padY + CONFIG.BUBBLE_FONT_SIZE;

  // Wrap text and measure
  const { lineCount, lineHeight } = wrapSvgText(
    els.bubbleText,
    message,
    maxTextWidth,
    textStartX,
    textStartY
  );

  // Calculate bubble dimensions
  const bbox = els.bubbleText.getBBox();
  const bubbleW = Math.ceil(Math.max(bbox.width + padX * 2, 100));
  const bubbleH = Math.ceil(bbox.height + padY * 2 + 10);

  const bx = CONFIG.BUBBLE_ANCHOR_X;
  const by = CONFIG.BUBBLE_ANCHOR_Y;

  // Generate bubble shape path
  const shapePath = roundedRectPath(bx, by, bubbleW, bubbleH, cornerRadius);
  els.bubbleShape.setAttribute("d", shapePath);

  // Calculate tail pointing toward character mouth
  const tailBaseX = bx + bubbleW - 60;
  const tailBaseY = by + bubbleH;
  const tailWidth = 40;
  const tailTipX = CONFIG.CHARACTER_MOUTH_X;
  const tailTipY = CONFIG.CHARACTER_MOUTH_Y;

  // Tail triangle path
  const tailPath = [
    `M ${tailBaseX} ${tailBaseY}`,
    `L ${tailBaseX + tailWidth} ${tailBaseY}`,
    `L ${tailTipX} ${tailTipY}`,
    "Z"
  ].join(" ");

  els.bubbleTail.setAttribute("d", tailPath);

  // Fill patch to cover stroke intersection
  const fillPath = [
    `M ${tailBaseX + 3} ${tailBaseY - 2}`,
    `L ${tailBaseX + tailWidth - 3} ${tailBaseY - 2}`,
    `L ${tailBaseX + tailWidth / 2} ${tailBaseY + 15}`,
    "Z"
  ].join(" ");

  els.bubbleTailFill.setAttribute("d", fillPath);
}

// ============================================
// MIDDLE FINGER EXTENSION CONTROL
// ============================================

/**
 * Set middle finger extension percentage
 * mf=0 = fully folded (hidden)
 * mf=100 = fully extended (giving the finger)
 *
 * Uses rotation transforms around joint pivot points
 */
function setMiddleFingerExtension(percent) {
  const t = clamp(percent / 100, 0, 1);

  const { MCP, PIP, DIP } = CONFIG.FINGER_JOINTS;
  const { PROX, MID, DIST } = CONFIG.FINGER_FOLD_ANGLES;

  // Calculate rotation angles
  // At t=0 (folded): use FOLD_ANGLES
  // At t=1 (extended): angle = 0
  const proxAngle = lerp(PROX, 0, t);
  const midAngle = lerp(MID, 0, t);
  const distAngle = lerp(DIST, 0, t);

  // Apply transforms
  // Each segment rotates around its joint pivot point

  // Proximal segment: rotates around MCP (base of finger)
  els.middleProx.setAttribute(
    "transform",
    `rotate(${proxAngle.toFixed(2)} ${MCP.x} ${MCP.y})`
  );

  // Middle segment: rotates around PIP, but must account for parent rotation
  // We compound the transforms by also applying the prox rotation context
  els.middleMid.setAttribute(
    "transform",
    [
      `rotate(${proxAngle.toFixed(2)} ${MCP.x} ${MCP.y})`,
      `rotate(${midAngle.toFixed(2)} ${PIP.x} ${PIP.y})`
    ].join(" ")
  );

  // Distal segment: rotates around DIP, compound all parent rotations
  els.middleDist.setAttribute(
    "transform",
    [
      `rotate(${proxAngle.toFixed(2)} ${MCP.x} ${MCP.y})`,
      `rotate(${midAngle.toFixed(2)} ${PIP.x} ${PIP.y})`,
      `rotate(${distAngle.toFixed(2)} ${DIP.x} ${DIP.y})`
    ].join(" ")
  );

  // Update HUD display
  els.hudText.textContent = `mf=${Math.round(percent)}%`;
}

// ============================================
// STATE MANAGEMENT
// ============================================

function syncUiFromState(state) {
  els.messageInput.value = state.msg;
  els.mfRange.value = String(state.mf);
  els.mfOutput.textContent = String(state.mf);
}

function applyState(state) {
  updateBubble(state.msg);
  setMiddleFingerExtension(state.mf);
  updateUrl(state);
}

function getCurrentState() {
  return {
    msg: String(els.messageInput.value || "").slice(0, CONFIG.MAX_MESSAGE_LENGTH) || CONFIG.DEFAULT_MESSAGE,
    mf: clamp(parseInt(els.mfRange.value, 10) || CONFIG.DEFAULT_MF, 0, 100)
  };
}

// ============================================
// CLIPBOARD OPERATIONS
// ============================================

async function copyToClipboard(text) {
  // Try modern Clipboard API first
  if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
    await navigator.clipboard.writeText(text);
    return;
  }

  // Fallback for older browsers
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "true");
  textarea.style.cssText = "position:fixed;left:-9999px;top:0;";
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand("copy");
  document.body.removeChild(textarea);
}

// ============================================
// EVENT HANDLERS
// ============================================

function setupEventListeners() {
  // Live slider output update
  els.mfRange.addEventListener("input", () => {
    els.mfOutput.textContent = els.mfRange.value;
  });

  // Form submission (Apply button)
  els.controls.addEventListener("submit", (event) => {
    event.preventDefault();
    const state = getCurrentState();
    applyState(state);
  });

  // Reset button
  els.btnReset.addEventListener("click", () => {
    const defaultState = {
      msg: CONFIG.DEFAULT_MESSAGE,
      mf: CONFIG.DEFAULT_MF
    };
    syncUiFromState(defaultState);
    applyState(defaultState);
  });

  // Copy share link button
  els.btnCopyLink.addEventListener("click", async () => {
    const state = getCurrentState();
    const shareUrl = buildShareUrl(state);

    try {
      await copyToClipboard(shareUrl);
      els.btnCopyLink.textContent = "✓ Copied!";
      setTimeout(() => {
        els.btnCopyLink.textContent = "Copy Share Link";
      }, 1500);
    } catch (error) {
      els.btnCopyLink.textContent = "Copy failed";
      setTimeout(() => {
        els.btnCopyLink.textContent = "Copy Share Link";
      }, 1500);
    }
  });

  // Toggle cloud animation
  let motionEnabled = true;
  els.btnAnimate.addEventListener("click", () => {
    motionEnabled = !motionEnabled;
    setMotionEnabled(motionEnabled);
    els.btnAnimate.textContent = motionEnabled ? "Pause Clouds" : "Resume Clouds";
  });

  // Handle browser back/forward navigation
  window.addEventListener("popstate", () => {
    const state = parseParams();
    syncUiFromState(state);
    updateBubble(state.msg);
    setMiddleFingerExtension(state.mf);
  });
}

// ============================================
// INITIALIZATION
// ============================================

function init() {
  initElements();
  initCloudAnimation();

  // Parse URL parameters and apply initial state
  const initialState = parseParams();
  syncUiFromState(initialState);
  applyState(initialState);

  // Set up event listeners
  setupEventListeners();

  console.log("Middle Finger Boy initialized. Share URLs always include mf parameter.");
}

// Run when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
