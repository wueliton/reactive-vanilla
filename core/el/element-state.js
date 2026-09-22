import { getCurrentContext } from "../context/index.js";

const elementStates = new WeakMap();

function getElementState(element) {
  let state = elementStates.get(element);

  if (state) return state;

  const context = getCurrentContext();
  const events = new Set();
  const cleanupEvents = () => {
    for (const property of events) {
      element[property] = null;
    }

    events.clear();
    context.cleanups.delete(cleanupEvents);
  };

  state = {
    effects: new Map(),
    events,
    context,
    cleanupEvents,
  };

  elementStates.set(element, state);
  return state;
}

function destroyElement(element) {
  const elements = [element, ...element.querySelectorAll("*")];

  for (const currentElement of elements) {
    const state = elementStates.get(currentElement);

    if (!state) continue;

    for (const reactiveEffect of state.effects.values()) {
      reactiveEffect.stop();
    }

    state.effects.clear();
    state.cleanupEvents();
    state.context.children.delete(currentElement);
    elementStates.delete(currentElement);
  }
}

export { destroyElement, getElementState };
