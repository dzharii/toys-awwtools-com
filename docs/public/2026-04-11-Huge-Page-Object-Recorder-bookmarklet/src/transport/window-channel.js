export const WINDOW_CHANNEL_PROTOCOL = "huge-por-v1";

export function createChannelEnvelope(sessionId, type, payload = {}) {
  return {
    protocol: WINDOW_CHANNEL_PROTOCOL,
    sessionId,
    type,
    payload,
  };
}

export function isValidChannelEnvelope(message, options = {}) {
  if (!message || typeof message !== "object") {
    return false;
  }
  if (message.protocol !== WINDOW_CHANNEL_PROTOCOL) {
    return false;
  }
  if (typeof message.type !== "string" || !message.type) {
    return false;
  }
  if (options.sessionId && message.sessionId !== options.sessionId) {
    return false;
  }
  return true;
}

export function postChannelMessage(targetWindow, targetOrigin, envelope) {
  if (!targetWindow || typeof targetWindow.postMessage !== "function") {
    return false;
  }
  if (!targetOrigin || targetOrigin === "*") {
    return false;
  }
  targetWindow.postMessage(envelope, targetOrigin);
  return true;
}

export function bindWindowChannel(windowObject, options = {}) {
  const expectedOrigin = options.origin ?? windowObject.location.origin;
  const expectedSessionId = options.sessionId;
  const onMessage = options.onMessage;

  function handleMessage(event) {
    if (event.origin !== expectedOrigin) {
      return;
    }

    if (!isValidChannelEnvelope(event.data, { sessionId: expectedSessionId })) {
      return;
    }

    onMessage?.(event.data, event);
  }

  windowObject.addEventListener("message", handleMessage);

  return {
    unbind() {
      windowObject.removeEventListener("message", handleMessage);
    },
  };
}
