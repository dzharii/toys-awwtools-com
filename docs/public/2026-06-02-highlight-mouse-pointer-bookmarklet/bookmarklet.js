function highlightMousePointerBookmarklet() {
  const PROJECT_ID = "highlight-mouse-pointer-bookmarklet-v1";
  const CLASS_ENABLED = `${PROJECT_ID}-enabled`;
  const CLASS_TEXT_TARGET = `${PROJECT_ID}-text-target`;
  const STYLE_ID = `${PROJECT_ID}-style`;
  const OVERLAY_ID = `${PROJECT_ID}-overlay`;
  const stateKey = `__${PROJECT_ID}__`;

  const existingState = window[stateKey];

  if (existingState) {
    existingState.destroy();
    delete window[stateKey];
    return;
  }

  const SIZE = 34;
  const HOTSPOT_X = 10;
  const HOTSPOT_Y = 10;
  const ANIMATION_MS = 130;

  const FILL = "rgba(126, 185, 156, 0.48)";
  const STROKE = "rgba(88, 94, 90, 0.28)";
  const STROKE_WIDTH = 1.35;

  const clickableSelector = [
    "a[href]",
    "button",
    "summary",
    "label",
    "select",
    "option",
    "iframe",
    "[role='button']",
    "[role='link']",
    "[onclick]",
    "[tabindex]:not([tabindex='-1'])"
  ].join(",");

  const textSelector = [
    "input:not([type])",
    "input[type='text']",
    "input[type='search']",
    "input[type='email']",
    "input[type='url']",
    "input[type='tel']",
    "input[type='password']",
    "input[type='number']",
    "textarea",
    "[contenteditable='true']",
    "[contenteditable='plaintext-only']"
  ].join(",");

  const circlePoints = [
    [10.00, 0.00],
    [13.83, 0.76],
    [17.07, 2.93],
    [19.24, 6.17],
    [20.00, 10.00],
    [19.24, 13.83],
    [17.07, 17.07],
    [13.83, 19.24],
    [10.00, 20.00],
    [6.17, 19.24],
    [2.93, 17.07],
    [0.76, 13.83],
    [0.00, 10.00],
    [0.76, 6.17],
    [2.93, 2.93],
    [6.17, 0.76]
  ];

  const arrowPoints = [
    [0.80, 0.80],
    [17.80, 12.80],
    [10.80, 14.05],
    [15.25, 22.90],
    [11.75, 24.60],
    [7.35, 15.55],
    [2.55, 20.20],
    [0.80, 0.80],
    [0.80, 0.80],
    [0.80, 0.80],
    [0.80, 0.80],
    [0.80, 0.80],
    [0.80, 0.80],
    [0.80, 0.80],
    [0.80, 0.80],
    [0.80, 0.80]
  ];

  const style = document.createElement("style");

  style.id = STYLE_ID;
  style.textContent = `
    html.${CLASS_ENABLED},
    html.${CLASS_ENABLED} body,
    html.${CLASS_ENABLED} body * {
      cursor: none !important;
    }

    html.${CLASS_ENABLED}.${CLASS_TEXT_TARGET},
    html.${CLASS_ENABLED}.${CLASS_TEXT_TARGET} body,
    html.${CLASS_ENABLED}.${CLASS_TEXT_TARGET} body * {
      cursor: text !important;
    }

    #${OVERLAY_ID} {
      position: fixed !important;
      z-index: 2147483647 !important;
      left: 0 !important;
      top: 0 !important;
      width: ${SIZE}px !important;
      height: ${SIZE}px !important;
      pointer-events: none !important;
      transform: translate3d(-9999px, -9999px, 0) !important;
      will-change: transform !important;
      display: block !important;
      opacity: 1 !important;
      contain: layout style paint !important;
    }

    html.${CLASS_TEXT_TARGET} #${OVERLAY_ID} {
      opacity: 0 !important;
    }

    #${OVERLAY_ID} svg {
      display: block !important;
      width: ${SIZE}px !important;
      height: ${SIZE}px !important;
      overflow: visible !important;
    }
  `.trim();

  const overlay = document.createElement("div");
  overlay.id = OVERLAY_ID;
  overlay.setAttribute("aria-hidden", "true");

  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  const polygon = document.createElementNS("http://www.w3.org/2000/svg", "polygon");

  svg.setAttribute("viewBox", "0 0 34 34");
  svg.setAttribute("width", String(SIZE));
  svg.setAttribute("height", String(SIZE));

  polygon.setAttribute("fill", FILL);
  polygon.setAttribute("stroke", STROKE);
  polygon.setAttribute("stroke-width", String(STROKE_WIDTH));
  polygon.setAttribute("stroke-linejoin", "round");
  polygon.setAttribute("stroke-linecap", "round");
  polygon.setAttribute("vector-effect", "non-scaling-stroke");

  svg.append(polygon);
  overlay.append(svg);

  let lastX = -9999;
  let lastY = -9999;
  let positionFrame = 0;

  let morphValue = 0;
  let morphFrom = 0;
  let morphTarget = 0;
  let morphStartedAt = 0;
  let morphFrame = 0;

  const easeOutCubic = (value) => {
    return 1 - Math.pow(1 - value, 3);
  };

  const mix = (from, to, amount) => {
    return from + (to - from) * amount;
  };

  const getPoints = (amount) => {
    return circlePoints
      .map(([circleX, circleY], index) => {
        const [arrowX, arrowY] = arrowPoints[index];

        const x = mix(circleX, arrowX, amount) + 7;
        const y = mix(circleY, arrowY, amount) + 7;

        return `${x.toFixed(2)},${y.toFixed(2)}`;
      })
      .join(" ");
  };

  const renderMorph = () => {
    polygon.setAttribute("points", getPoints(morphValue));
  };

  const animateMorph = (now) => {
    const elapsed = now - morphStartedAt;
    const progress = Math.min(1, elapsed / ANIMATION_MS);
    const eased = easeOutCubic(progress);

    morphValue = mix(morphFrom, morphTarget, eased);
    renderMorph();

    if (progress < 1) {
      morphFrame = requestAnimationFrame(animateMorph);
    } else {
      morphFrame = 0;
      morphValue = morphTarget;
      renderMorph();
    }
  };

  const setMorphTarget = (target) => {
    if (target === morphTarget) {
      return;
    }

    morphFrom = morphValue;
    morphTarget = target;
    morphStartedAt = performance.now();

    if (morphFrame) {
      cancelAnimationFrame(morphFrame);
    }

    morphFrame = requestAnimationFrame(animateMorph);
  };

  const setOverlayPosition = () => {
    positionFrame = 0;

    overlay.style.setProperty(
      "transform",
      `translate3d(${lastX - HOTSPOT_X}px, ${lastY - HOTSPOT_Y}px, 0)`,
      "important"
    );
  };

  const scheduleOverlayPosition = (event) => {
    lastX = event.clientX;
    lastY = event.clientY;

    if (!positionFrame) {
      positionFrame = requestAnimationFrame(setOverlayPosition);
    }
  };

  const isElement = (value) => {
    return value instanceof Element;
  };

  const isClickableTarget = (target) => {
    return isElement(target) && Boolean(target.closest(clickableSelector));
  };

  const isTextTarget = (target) => {
    return isElement(target) && Boolean(target.closest(textSelector));
  };

  const updateInteractionMode = (event) => {
    const textTarget = isTextTarget(event.target);
    const clickableTarget = !textTarget && isClickableTarget(event.target);

    document.documentElement.classList.toggle(CLASS_TEXT_TARGET, textTarget);
    setMorphTarget(clickableTarget ? 1 : 0);
  };

  const handlePointerMove = (event) => {
    scheduleOverlayPosition(event);
    updateInteractionMode(event);
  };

  const handlePointerOver = (event) => {
    updateInteractionMode(event);
  };

  const handlePointerOut = (event) => {
    if (!event.relatedTarget) {
      lastX = -9999;
      lastY = -9999;
      setOverlayPosition();
      setMorphTarget(0);
      document.documentElement.classList.remove(CLASS_TEXT_TARGET);
    }
  };

  const handleBlur = () => {
    lastX = -9999;
    lastY = -9999;
    setOverlayPosition();
    setMorphTarget(0);
    document.documentElement.classList.remove(CLASS_TEXT_TARGET);
  };

  const destroy = () => {
    document.getElementById(STYLE_ID)?.remove();
    document.getElementById(OVERLAY_ID)?.remove();

    document.documentElement.classList.remove(
      CLASS_ENABLED,
      CLASS_TEXT_TARGET
    );

    window.removeEventListener("pointermove", handlePointerMove, true);
    window.removeEventListener("pointerover", handlePointerOver, true);
    window.removeEventListener("pointerout", handlePointerOut, true);
    window.removeEventListener("blur", handleBlur, true);

    if (positionFrame) {
      cancelAnimationFrame(positionFrame);
    }

    if (morphFrame) {
      cancelAnimationFrame(morphFrame);
    }
  };

  window[stateKey] = { destroy };

  renderMorph();

  (document.head || document.documentElement).append(style);
  document.documentElement.append(overlay);
  document.documentElement.classList.add(CLASS_ENABLED);

  window.addEventListener("pointermove", handlePointerMove, true);
  window.addEventListener("pointerover", handlePointerOver, true);
  window.addEventListener("pointerout", handlePointerOut, true);
  window.addEventListener("blur", handleBlur, true);
}
