const listeners = new Map();

const state = {
  mode: "normal",
  greetings: ["Hi", "Hello"],
  idleTimeoutMs: 30_000,
  slideshowIntervalMs: 4_000,
};

export function getState() {
  return state;
}

export function setState(key, value) {
  state[key] = value;
  emit(`state:${key}`, value);
}

export function on(eventName, handler) {
  if (!listeners.has(eventName)) {
    listeners.set(eventName, new Set());
  }
  listeners.get(eventName).add(handler);
  return () => listeners.get(eventName)?.delete(handler);
}

export function emit(eventName, payload) {
  const handlers = listeners.get(eventName);
  if (!handlers) {
    return;
  }
  handlers.forEach((handler) => handler(payload));
}
