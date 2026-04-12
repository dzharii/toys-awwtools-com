const POPUP_NAME = "huge-page-object-recorder-popup";
const DEFAULT_POPUP_GEOMETRY = {
  width: 980,
  height: 760,
  left: 80,
  top: 60,
};

function safeGeometry(input = {}) {
  return {
    width: Math.max(520, Number(input.width ?? DEFAULT_POPUP_GEOMETRY.width)),
    height: Math.max(420, Number(input.height ?? DEFAULT_POPUP_GEOMETRY.height)),
    left: Math.max(0, Number(input.left ?? DEFAULT_POPUP_GEOMETRY.left)),
    top: Math.max(0, Number(input.top ?? DEFAULT_POPUP_GEOMETRY.top)),
  };
}

function popupFeatures(geometry) {
  return [
    "popup=yes",
    "resizable=yes",
    "scrollbars=yes",
    `width=${geometry.width}`,
    `height=${geometry.height}`,
    `left=${geometry.left}`,
    `top=${geometry.top}`,
  ].join(",");
}

export function isPopupAlive(popupWindow) {
  return Boolean(popupWindow && popupWindow.closed === false);
}

export function openRecorderPopup(openerWindow, options = {}) {
  const title = String(options.title ?? "Page Object Recorder");

  if (isPopupAlive(options.currentPopup)) {
    options.currentPopup.focus?.();
    return {
      blocked: false,
      reused: true,
      popupWindow: options.currentPopup,
    };
  }

  const geometry = safeGeometry(options.geometry);
  const popupWindow = openerWindow.open("", POPUP_NAME, popupFeatures(geometry));
  if (!isPopupAlive(popupWindow)) {
    return {
      blocked: true,
      reused: false,
      popupWindow: null,
    };
  }

  try {
    popupWindow.document.title = title;
  } catch {
    // ignore cross-window title failures
  }

  return {
    blocked: false,
    reused: false,
    popupWindow,
  };
}

export function monitorPopupClosed(popupWindow, onClosed, intervalMs = 450) {
  if (!isPopupAlive(popupWindow)) {
    return { stop() {} };
  }

  const timer = setInterval(() => {
    if (popupWindow.closed) {
      clearInterval(timer);
      onClosed?.();
    }
  }, Math.max(200, Number(intervalMs || 0)));

  return {
    stop() {
      clearInterval(timer);
    },
  };
}

export function closePopupWindow(popupWindow) {
  if (!isPopupAlive(popupWindow)) {
    return;
  }

  try {
    popupWindow.close();
  } catch {
    // ignore close failures
  }
}

export function capturePopupGeometry(popupWindow) {
  if (!isPopupAlive(popupWindow)) {
    return null;
  }

  return safeGeometry({
    width: popupWindow.outerWidth,
    height: popupWindow.outerHeight,
    left: popupWindow.screenX,
    top: popupWindow.screenY,
  });
}
