javascript:(function () {
  const GLOBAL_KEY = "__visibleScreenshotCursorBookmarklet__";

  if (window[GLOBAL_KEY] && typeof window[GLOBAL_KEY].destroy === "function") {
    window[GLOBAL_KEY].destroy();
    return;
  }

  const state = {
    active: true,
    pointerX: window.innerWidth / 2,
    pointerY: window.innerHeight / 2,
    pointerDown: false,
    dragActive: false,
    dragStartX: 0,
    dragStartY: 0,
    dragCurrentX: 0,
    dragCurrentY: 0,
    persistentTrailVisible: false,
    clearTrailOnClick: false,
    rafScheduled: false,
    lastPointerType: "mouse"
  };

  const dragThreshold = 10;
  const cursorHotspotX = 6;
  const cursorHotspotY = 4;
  const zIndex = "2147483647";

  function createElement(tag, options) {
    const element = document.createElement(tag);

    if (options) {
      if (options.attributes) {
        for (const [name, value] of Object.entries(options.attributes)) {
          element.setAttribute(name, value);
        }
      }

      if (options.style) {
        Object.assign(element.style, options.style);
      }

      if (options.text != null) {
        element.textContent = options.text;
      }

      if (options.parent) {
        options.parent.appendChild(element);
      }
    }

    return element;
  }

  function createSvgElement(tag, options) {
    const element = document.createElementNS("http://www.w3.org/2000/svg", tag);

    if (options) {
      if (options.attributes) {
        for (const [name, value] of Object.entries(options.attributes)) {
          element.setAttribute(name, String(value));
        }
      }

      if (options.parent) {
        options.parent.appendChild(element);
      }
    }

    return element;
  }

  function distance(x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    return Math.hypot(dx, dy);
  }

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function scheduleRender() {
    if (state.rafScheduled) {
      return;
    }

    state.rafScheduled = true;
    window.requestAnimationFrame(render);
  }

  function clearPersistentTrail() {
    state.persistentTrailVisible = false;
    state.clearTrailOnClick = false;
    trailGroup.style.opacity = "0";
  }

  function showPersistentTrail() {
    state.persistentTrailVisible = true;
    trailGroup.style.opacity = "1";
  }

  function updateTrailGeometry(startX, startY, endX, endY) {
    const dx = endX - startX;
    const dy = endY - startY;
    const length = Math.hypot(dx, dy);
    const curve = clamp(length * 0.22, 18, 96);
    const direction = dx >= 0 ? 1 : -1;
    const c1x = startX + dx * 0.28;
    const c1y = startY;
    const c2x = startX + dx * 0.72;
    const c2y = endY - curve * direction * 0.1;
    const pathData = [
      "M", startX, startY,
      "C", c1x, c1y - curve, c2x, c2y + curve, endX, endY
    ].join(" ");

    trailGlow.setAttribute("d", pathData);
    trailMain.setAttribute("d", pathData);
    trailHighlight.setAttribute("d", pathData);

    startMarker.setAttribute("cx", startX);
    startMarker.setAttribute("cy", startY);

    midMarker.setAttribute("cx", startX + dx * 0.5);
    midMarker.setAttribute("cy", startY + dy * 0.5);

    endOuterMarker.setAttribute("cx", endX);
    endOuterMarker.setAttribute("cy", endY);

    endInnerMarker.setAttribute("cx", endX);
    endInnerMarker.setAttribute("cy", endY);

    const angle = Math.atan2(dy, dx);
    const arrowLength = 22;
    const arrowSpread = 0.6;
    const ax1 = endX - Math.cos(angle - arrowSpread) * arrowLength;
    const ay1 = endY - Math.sin(angle - arrowSpread) * arrowLength;
    const ax2 = endX - Math.cos(angle + arrowSpread) * arrowLength;
    const ay2 = endY - Math.sin(angle + arrowSpread) * arrowLength;

    endArrow.setAttribute("d", `M ${ax1} ${ay1} L ${endX} ${endY} L ${ax2} ${ay2}`);
  }

  function render() {
    state.rafScheduled = false;

    cursorLayer.style.transform = `translate(${Math.round(state.pointerX - cursorHotspotX)}px, ${Math.round(state.pointerY - cursorHotspotY)}px)`;

    if (state.dragActive || state.persistentTrailVisible) {
      updateTrailGeometry(
        state.dragStartX,
        state.dragStartY,
        state.dragCurrentX,
        state.dragCurrentY
      );
    }
  }

  function beginDragIfNeeded(x, y) {
    if (!state.pointerDown || state.dragActive === true) {
      return;
    }

    if (distance(state.dragStartX, state.dragStartY, x, y) >= dragThreshold) {
      state.dragActive = true;
      state.dragCurrentX = x;
      state.dragCurrentY = y;
      showPersistentTrail();
      scheduleRender();
    }
  }

  function handlePointerMove(event) {
    state.lastPointerType = event.pointerType || "mouse";
    state.pointerX = event.clientX;
    state.pointerY = event.clientY;

    if (state.pointerDown) {
      beginDragIfNeeded(event.clientX, event.clientY);

      if (state.dragActive) {
        state.dragCurrentX = event.clientX;
        state.dragCurrentY = event.clientY;
      }
    }

    scheduleRender();
  }

  function handlePointerDown(event) {
    state.lastPointerType = event.pointerType || "mouse";
    state.pointerDown = true;
    state.dragActive = false;
    state.dragStartX = event.clientX;
    state.dragStartY = event.clientY;
    state.dragCurrentX = event.clientX;
    state.dragCurrentY = event.clientY;
    state.pointerX = event.clientX;
    state.pointerY = event.clientY;
    scheduleRender();
  }

  function handlePointerUp(event) {
    state.lastPointerType = event.pointerType || "mouse";
    state.pointerX = event.clientX;
    state.pointerY = event.clientY;

    if (state.dragActive) {
      state.dragCurrentX = event.clientX;
      state.dragCurrentY = event.clientY;
      state.clearTrailOnClick = true;
      showPersistentTrail();
    }

    state.pointerDown = false;
    state.dragActive = false;
    scheduleRender();
  }

  function handlePointerCancel() {
    state.pointerDown = false;
    state.dragActive = false;
  }

  function handleClick() {
    if (state.clearTrailOnClick) {
      clearPersistentTrail();
      scheduleRender();
    }
  }

  function handleScroll() {
    scheduleRender();
  }

  function handleMouseLeaveWindow(event) {
    if (event.relatedTarget == null && event.toElement == null) {
      cursorLayer.style.opacity = "0";
    }
  }

  function handleMouseEnterWindow() {
    cursorLayer.style.opacity = "1";
    scheduleRender();
  }

  const host = createElement("div", {
    style: {
      position: "fixed",
      inset: "0",
      zIndex,
      pointerEvents: "none",
      all: "initial"
    }
  });

  const parentTarget = document.documentElement || document.body || document.head;
  parentTarget.appendChild(host);

  const shadowRoot = host.attachShadow({ mode: "open" });

  const style = createElement("style", { parent: shadowRoot });
  style.textContent = `
    :host {
      all: initial;
    }

    .overlay {
      position: fixed;
      inset: 0;
      pointer-events: none;
      overflow: hidden;
      z-index: ${zIndex};
      contain: strict;
    }

    .cursor-layer {
      position: absolute;
      left: 0;
      top: 0;
      width: 34px;
      height: 46px;
      pointer-events: none;
      transform: translate(0px, 0px);
      will-change: transform, opacity;
      transition: opacity 120ms ease;
      filter: drop-shadow(0 1px 1px rgba(0, 0, 0, 0.52)) drop-shadow(0 4px 10px rgba(0, 0, 0, 0.28));
    }

    .cursor-svg {
      display: block;
      width: 34px;
      height: 46px;
      overflow: visible;
    }

    .trail-svg {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      overflow: visible;
      pointer-events: none;
    }

    .trail-group {
      opacity: 0;
      transition: opacity 110ms ease;
    }
  `;

  const overlay = createElement("div", {
    parent: shadowRoot,
    attributes: {
      class: "overlay",
      "aria-hidden": "true"
    }
  });

  const trailSvg = createSvgElement("svg", {
    parent: overlay,
    attributes: {
      class: "trail-svg",
      viewBox: `0 0 ${Math.max(window.innerWidth, 1)} ${Math.max(window.innerHeight, 1)}`,
      preserveAspectRatio: "none"
    }
  });

  const defs = createSvgElement("defs", { parent: trailSvg });

  const glowFilter = createSvgElement("filter", {
    parent: defs,
    attributes: {
      id: "vscb-glow",
      x: "-40%",
      y: "-40%",
      width: "180%",
      height: "180%"
    }
  });

  createSvgElement("feGaussianBlur", {
    parent: glowFilter,
    attributes: {
      stdDeviation: "3.4",
      result: "blur"
    }
  });

  createSvgElement("feColorMatrix", {
    parent: glowFilter,
    attributes: {
      in: "blur",
      type: "matrix",
      values: "0 0 0 0 0.094 0 0 0 0 0.482 0 0 0 0 0.976 0 0 0 0.45 0"
    }
  });

  const trailGroup = createSvgElement("g", {
    parent: trailSvg,
    attributes: {
      class: "trail-group"
    }
  });

  const trailGlow = createSvgElement("path", {
    parent: trailGroup,
    attributes: {
      fill: "none",
      stroke: "rgba(24, 123, 249, 0.34)",
      "stroke-width": "20",
      "stroke-linecap": "round",
      "stroke-linejoin": "round",
      filter: "url(#vscb-glow)"
    }
  });

  const trailMain = createSvgElement("path", {
    parent: trailGroup,
    attributes: {
      fill: "none",
      stroke: "#1e78ff",
      "stroke-width": "7",
      "stroke-linecap": "round",
      "stroke-linejoin": "round"
    }
  });

  const trailHighlight = createSvgElement("path", {
    parent: trailGroup,
    attributes: {
      fill: "none",
      stroke: "rgba(255, 255, 255, 0.78)",
      "stroke-width": "2.5",
      "stroke-linecap": "round",
      "stroke-linejoin": "round"
    }
  });

  const startMarker = createSvgElement("circle", {
    parent: trailGroup,
    attributes: {
      r: "7",
      fill: "#ffffff",
      stroke: "#5ea4ff",
      "stroke-width": "4"
    }
  });

  const midMarker = createSvgElement("circle", {
    parent: trailGroup,
    attributes: {
      r: "5",
      fill: "rgba(255,255,255,0.88)",
      stroke: "#6aaeff",
      "stroke-width": "3"
    }
  });

  const endOuterMarker = createSvgElement("circle", {
    parent: trailGroup,
    attributes: {
      r: "14",
      fill: "rgba(34, 126, 255, 0.22)",
      stroke: "rgba(34, 126, 255, 0.45)",
      "stroke-width": "2"
    }
  });

  const endInnerMarker = createSvgElement("circle", {
    parent: trailGroup,
    attributes: {
      r: "8",
      fill: "#1677ff",
      stroke: "#73b2ff",
      "stroke-width": "4"
    }
  });

  const endArrow = createSvgElement("path", {
    parent: trailGroup,
    attributes: {
      fill: "none",
      stroke: "#1677ff",
      "stroke-width": "4.5",
      "stroke-linecap": "round",
      "stroke-linejoin": "round",
      opacity: "0.95"
    }
  });

  const cursorLayer = createElement("div", {
    parent: overlay,
    attributes: {
      class: "cursor-layer"
    }
  });

  const cursorSvg = createSvgElement("svg", {
    parent: cursorLayer,
    attributes: {
      class: "cursor-svg",
      viewBox: "0 0 34 46"
    }
  });

  createSvgElement("path", {
    parent: cursorSvg,
    attributes: {
      d: "M4 3 L24 22 L15 22 L20 40 L14.6 42 L9.4 24 L4 31 Z",
      fill: "rgba(0, 0, 0, 0.22)"
    }
  });

  createSvgElement("path", {
    parent: cursorSvg,
    attributes: {
      d: "M3 2 L23 21 L14.2 21.2 L19.2 39 L13.6 41 L8.8 23.2 L3 30 Z",
      fill: "#111111",
      stroke: "rgba(255,255,255,0.98)",
      "stroke-width": "2",
      "stroke-linejoin": "round"
    }
  });

  createSvgElement("path", {
    parent: cursorSvg,
    attributes: {
      d: "M8 8 L19.4 20.2 L12.4 20.2 L16.5 34.8 L14.5 35.6 L10.3 20.2 L8 26.2 Z",
      fill: "rgba(255,255,255,0.92)"
    }
  });

  function updateViewportSize() {
    trailSvg.setAttribute("viewBox", `0 0 ${Math.max(window.innerWidth, 1)} ${Math.max(window.innerHeight, 1)}`);
    scheduleRender();
  }

  const listeners = [
    [window, "pointermove", handlePointerMove, { capture: true, passive: true }],
    [window, "pointerdown", handlePointerDown, { capture: true, passive: true }],
    [window, "pointerup", handlePointerUp, { capture: true, passive: true }],
    [window, "pointercancel", handlePointerCancel, { capture: true, passive: true }],
    [window, "click", handleClick, { capture: true, passive: true }],
    [window, "scroll", handleScroll, { capture: true, passive: true }],
    [window, "resize", updateViewportSize, { passive: true }],
    [window, "mouseout", handleMouseLeaveWindow, { capture: true, passive: true }],
    [window, "mouseover", handleMouseEnterWindow, { capture: true, passive: true }]
  ];

  for (const [target, type, handler, options] of listeners) {
    target.addEventListener(type, handler, options);
  }

  function destroy() {
    for (const [target, type, handler, options] of listeners) {
      target.removeEventListener(type, handler, options);
    }

    if (host.isConnected) {
      host.remove();
    }

    delete window[GLOBAL_KEY];
  }

  function toBookmarkletSource() {
    const source = `(${bootstrap.toString()})();`;
    return `javascript:${source.replace(/\n+/g, " ").replace(/\s{2,}/g, " ").trim()}`;
  }

  function bootstrap() {
    const GLOBAL_KEY = "__visibleScreenshotCursorBookmarklet__";

    if (window[GLOBAL_KEY] && typeof window[GLOBAL_KEY].destroy === "function") {
      window[GLOBAL_KEY].destroy();
      return;
    }

    const state = {
      active: true,
      pointerX: window.innerWidth / 2,
      pointerY: window.innerHeight / 2,
      pointerDown: false,
      dragActive: false,
      dragStartX: 0,
      dragStartY: 0,
      dragCurrentX: 0,
      dragCurrentY: 0,
      persistentTrailVisible: false,
      clearTrailOnClick: false,
      rafScheduled: false,
      lastPointerType: "mouse"
    };

    const dragThreshold = 10;
    const cursorHotspotX = 6;
    const cursorHotspotY = 4;
    const zIndex = "2147483647";

    function createElement(tag, options) {
      const element = document.createElement(tag);

      if (options) {
        if (options.attributes) {
          for (const [name, value] of Object.entries(options.attributes)) {
            element.setAttribute(name, value);
          }
        }

        if (options.style) {
          Object.assign(element.style, options.style);
        }

        if (options.text != null) {
          element.textContent = options.text;
        }

        if (options.parent) {
          options.parent.appendChild(element);
        }
      }

      return element;
    }

    function createSvgElement(tag, options) {
      const element = document.createElementNS("http://www.w3.org/2000/svg", tag);

      if (options) {
        if (options.attributes) {
          for (const [name, value] of Object.entries(options.attributes)) {
            element.setAttribute(name, String(value));
          }
        }

        if (options.parent) {
          options.parent.appendChild(element);
        }
      }

      return element;
    }

    function distance(x1, y1, x2, y2) {
      const dx = x2 - x1;
      const dy = y2 - y1;
      return Math.hypot(dx, dy);
    }

    function clamp(value, min, max) {
      return Math.min(max, Math.max(min, value));
    }

    function scheduleRender() {
      if (state.rafScheduled) {
        return;
      }

      state.rafScheduled = true;
      window.requestAnimationFrame(render);
    }

    function clearPersistentTrail() {
      state.persistentTrailVisible = false;
      state.clearTrailOnClick = false;
      trailGroup.style.opacity = "0";
    }

    function showPersistentTrail() {
      state.persistentTrailVisible = true;
      trailGroup.style.opacity = "1";
    }

    function updateTrailGeometry(startX, startY, endX, endY) {
      const dx = endX - startX;
      const dy = endY - startY;
      const length = Math.hypot(dx, dy);
      const curve = clamp(length * 0.22, 18, 96);
      const direction = dx >= 0 ? 1 : -1;
      const c1x = startX + dx * 0.28;
      const c1y = startY;
      const c2x = startX + dx * 0.72;
      const c2y = endY - curve * direction * 0.1;
      const pathData = [
        "M", startX, startY,
        "C", c1x, c1y - curve, c2x, c2y + curve, endX, endY
      ].join(" ");

      trailGlow.setAttribute("d", pathData);
      trailMain.setAttribute("d", pathData);
      trailHighlight.setAttribute("d", pathData);

      startMarker.setAttribute("cx", startX);
      startMarker.setAttribute("cy", startY);

      midMarker.setAttribute("cx", startX + dx * 0.5);
      midMarker.setAttribute("cy", startY + dy * 0.5);

      endOuterMarker.setAttribute("cx", endX);
      endOuterMarker.setAttribute("cy", endY);

      endInnerMarker.setAttribute("cx", endX);
      endInnerMarker.setAttribute("cy", endY);

      const angle = Math.atan2(dy, dx);
      const arrowLength = 22;
      const arrowSpread = 0.6;
      const ax1 = endX - Math.cos(angle - arrowSpread) * arrowLength;
      const ay1 = endY - Math.sin(angle - arrowSpread) * arrowLength;
      const ax2 = endX - Math.cos(angle + arrowSpread) * arrowLength;
      const ay2 = endY - Math.sin(angle + arrowSpread) * arrowLength;

      endArrow.setAttribute("d", `M ${ax1} ${ay1} L ${endX} ${endY} L ${ax2} ${ay2}`);
    }

    function render() {
      state.rafScheduled = false;

      cursorLayer.style.transform = `translate(${Math.round(state.pointerX - cursorHotspotX)}px, ${Math.round(state.pointerY - cursorHotspotY)}px)`;

      if (state.dragActive || state.persistentTrailVisible) {
        updateTrailGeometry(
          state.dragStartX,
          state.dragStartY,
          state.dragCurrentX,
          state.dragCurrentY
        );
      }
    }

    function beginDragIfNeeded(x, y) {
      if (!state.pointerDown || state.dragActive === true) {
        return;
      }

      if (distance(state.dragStartX, state.dragStartY, x, y) >= dragThreshold) {
        state.dragActive = true;
        state.dragCurrentX = x;
        state.dragCurrentY = y;
        showPersistentTrail();
        scheduleRender();
      }
    }

    function handlePointerMove(event) {
      state.lastPointerType = event.pointerType || "mouse";
      state.pointerX = event.clientX;
      state.pointerY = event.clientY;

      if (state.pointerDown) {
        beginDragIfNeeded(event.clientX, event.clientY);

        if (state.dragActive) {
          state.dragCurrentX = event.clientX;
          state.dragCurrentY = event.clientY;
        }
      }

      scheduleRender();
    }

    function handlePointerDown(event) {
      state.lastPointerType = event.pointerType || "mouse";
      state.pointerDown = true;
      state.dragActive = false;
      state.dragStartX = event.clientX;
      state.dragStartY = event.clientY;
      state.dragCurrentX = event.clientX;
      state.dragCurrentY = event.clientY;
      state.pointerX = event.clientX;
      state.pointerY = event.clientY;
      scheduleRender();
    }

    function handlePointerUp(event) {
      state.lastPointerType = event.pointerType || "mouse";
      state.pointerX = event.clientX;
      state.pointerY = event.clientY;

      if (state.dragActive) {
        state.dragCurrentX = event.clientX;
        state.dragCurrentY = event.clientY;
        state.clearTrailOnClick = true;
        showPersistentTrail();
      }

      state.pointerDown = false;
      state.dragActive = false;
      scheduleRender();
    }

    function handlePointerCancel() {
      state.pointerDown = false;
      state.dragActive = false;
    }

    function handleClick() {
      if (state.clearTrailOnClick) {
        clearPersistentTrail();
        scheduleRender();
      }
    }

    function handleScroll() {
      scheduleRender();
    }

    function handleMouseLeaveWindow(event) {
      if (event.relatedTarget == null && event.toElement == null) {
        cursorLayer.style.opacity = "0";
      }
    }

    function handleMouseEnterWindow() {
      cursorLayer.style.opacity = "1";
      scheduleRender();
    }

    const host = createElement("div", {
      style: {
        position: "fixed",
        inset: "0",
        zIndex,
        pointerEvents: "none",
        all: "initial"
      }
    });

    const parentTarget = document.documentElement || document.body || document.head;
    parentTarget.appendChild(host);

    const shadowRoot = host.attachShadow({ mode: "open" });

    const style = createElement("style", { parent: shadowRoot });
    style.textContent = `
      :host {
        all: initial;
      }

      .overlay {
        position: fixed;
        inset: 0;
        pointer-events: none;
        overflow: hidden;
        z-index: ${zIndex};
        contain: strict;
      }

      .cursor-layer {
        position: absolute;
        left: 0;
        top: 0;
        width: 34px;
        height: 46px;
        pointer-events: none;
        transform: translate(0px, 0px);
        will-change: transform, opacity;
        transition: opacity 120ms ease;
        filter: drop-shadow(0 1px 1px rgba(0, 0, 0, 0.52)) drop-shadow(0 4px 10px rgba(0, 0, 0, 0.28));
      }

      .cursor-svg {
        display: block;
        width: 34px;
        height: 46px;
        overflow: visible;
      }

      .trail-svg {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        overflow: visible;
        pointer-events: none;
      }

      .trail-group {
        opacity: 0;
        transition: opacity 110ms ease;
      }
    `;

    const overlay = createElement("div", {
      parent: shadowRoot,
      attributes: {
        class: "overlay",
        "aria-hidden": "true"
      }
    });

    const trailSvg = createSvgElement("svg", {
      parent: overlay,
      attributes: {
        class: "trail-svg",
        viewBox: `0 0 ${Math.max(window.innerWidth, 1)} ${Math.max(window.innerHeight, 1)}`,
        preserveAspectRatio: "none"
      }
    });

    const defs = createSvgElement("defs", { parent: trailSvg });

    const glowFilter = createSvgElement("filter", {
      parent: defs,
      attributes: {
        id: "vscb-glow",
        x: "-40%",
        y: "-40%",
        width: "180%",
        height: "180%"
      }
    });

    createSvgElement("feGaussianBlur", {
      parent: glowFilter,
      attributes: {
        stdDeviation: "3.4",
        result: "blur"
      }
    });

    createSvgElement("feColorMatrix", {
      parent: glowFilter,
      attributes: {
        in: "blur",
        type: "matrix",
        values: "0 0 0 0 0.094 0 0 0 0 0.482 0 0 0 0 0.976 0 0 0 0.45 0"
      }
    });

    const trailGroup = createSvgElement("g", {
      parent: trailSvg,
      attributes: {
        class: "trail-group"
      }
    });

    const trailGlow = createSvgElement("path", {
      parent: trailGroup,
      attributes: {
        fill: "none",
        stroke: "rgba(24, 123, 249, 0.34)",
        "stroke-width": "20",
        "stroke-linecap": "round",
        "stroke-linejoin": "round",
        filter: "url(#vscb-glow)"
      }
    });

    const trailMain = createSvgElement("path", {
      parent: trailGroup,
      attributes: {
        fill: "none",
        stroke: "#1e78ff",
        "stroke-width": "7",
        "stroke-linecap": "round",
        "stroke-linejoin": "round"
      }
    });

    const trailHighlight = createSvgElement("path", {
      parent: trailGroup,
      attributes: {
        fill: "none",
        stroke: "rgba(255, 255, 255, 0.78)",
        "stroke-width": "2.5",
        "stroke-linecap": "round",
        "stroke-linejoin": "round"
      }
    });

    const startMarker = createSvgElement("circle", {
      parent: trailGroup,
      attributes: {
        r: "7",
        fill: "#ffffff",
        stroke: "#5ea4ff",
        "stroke-width": "4"
      }
    });

    const midMarker = createSvgElement("circle", {
      parent: trailGroup,
      attributes: {
        r: "5",
        fill: "rgba(255,255,255,0.88)",
        stroke: "#6aaeff",
        "stroke-width": "3"
      }
    });

    const endOuterMarker = createSvgElement("circle", {
      parent: trailGroup,
      attributes: {
        r: "14",
        fill: "rgba(34, 126, 255, 0.22)",
        stroke: "rgba(34, 126, 255, 0.45)",
        "stroke-width": "2"
      }
    });

    const endInnerMarker = createSvgElement("circle", {
      parent: trailGroup,
      attributes: {
        r: "8",
        fill: "#1677ff",
        stroke: "#73b2ff",
        "stroke-width": "4"
      }
    });

    const endArrow = createSvgElement("path", {
      parent: trailGroup,
      attributes: {
        fill: "none",
        stroke: "#1677ff",
        "stroke-width": "4.5",
        "stroke-linecap": "round",
        "stroke-linejoin": "round",
        opacity: "0.95"
      }
    });

    const cursorLayer = createElement("div", {
      parent: overlay,
      attributes: {
        class: "cursor-layer"
      }
    });

    const cursorSvg = createSvgElement("svg", {
      parent: cursorLayer,
      attributes: {
        class: "cursor-svg",
        viewBox: "0 0 34 46"
      }
    });

    createSvgElement("path", {
      parent: cursorSvg,
      attributes: {
        d: "M4 3 L24 22 L15 22 L20 40 L14.6 42 L9.4 24 L4 31 Z",
        fill: "rgba(0, 0, 0, 0.22)"
      }
    });

    createSvgElement("path", {
      parent: cursorSvg,
      attributes: {
        d: "M3 2 L23 21 L14.2 21.2 L19.2 39 L13.6 41 L8.8 23.2 L3 30 Z",
        fill: "#111111",
        stroke: "rgba(255,255,255,0.98)",
        "stroke-width": "2",
        "stroke-linejoin": "round"
      }
    });

    createSvgElement("path", {
      parent: cursorSvg,
      attributes: {
        d: "M8 8 L19.4 20.2 L12.4 20.2 L16.5 34.8 L14.5 35.6 L10.3 20.2 L8 26.2 Z",
        fill: "rgba(255,255,255,0.92)"
      }
    });

    function updateViewportSize() {
      trailSvg.setAttribute("viewBox", `0 0 ${Math.max(window.innerWidth, 1)} ${Math.max(window.innerHeight, 1)}`);
      scheduleRender();
    }

    const listeners = [
      [window, "pointermove", handlePointerMove, { capture: true, passive: true }],
      [window, "pointerdown", handlePointerDown, { capture: true, passive: true }],
      [window, "pointerup", handlePointerUp, { capture: true, passive: true }],
      [window, "pointercancel", handlePointerCancel, { capture: true, passive: true }],
      [window, "click", handleClick, { capture: true, passive: true }],
      [window, "scroll", handleScroll, { capture: true, passive: true }],
      [window, "resize", updateViewportSize, { passive: true }],
      [window, "mouseout", handleMouseLeaveWindow, { capture: true, passive: true }],
      [window, "mouseover", handleMouseEnterWindow, { capture: true, passive: true }]
    ];

    for (const [target, type, handler, options] of listeners) {
      target.addEventListener(type, handler, options);
    }

    function destroy() {
      for (const [target, type, handler, options] of listeners) {
        target.removeEventListener(type, handler, options);
      }

      if (host.isConnected) {
        host.remove();
      }

      delete window[GLOBAL_KEY];
    }

    window[GLOBAL_KEY] = { destroy };
    scheduleRender();
  }

  window[GLOBAL_KEY] = {
    destroy,
    bookmarklet: toBookmarkletSource
  };

  scheduleRender();
})();