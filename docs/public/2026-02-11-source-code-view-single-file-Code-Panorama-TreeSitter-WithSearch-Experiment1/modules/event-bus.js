export function createEventBus() {
  const listenersByEvent = new Map();

  function on(eventName, handler) {
    if (!eventName || typeof handler !== "function") return () => {};
    const listeners = listenersByEvent.get(eventName) || new Set();
    listeners.add(handler);
    listenersByEvent.set(eventName, listeners);
    return () => {
      const current = listenersByEvent.get(eventName);
      if (!current) return;
      current.delete(handler);
      if (current.size === 0) listenersByEvent.delete(eventName);
    };
  }

  function emit(eventName, payload) {
    const listeners = listenersByEvent.get(eventName);
    if (!listeners || listeners.size === 0) return;
    [...listeners].forEach(listener => {
      listener(payload);
    });
  }

  return {
    on,
    emit
  };
}
