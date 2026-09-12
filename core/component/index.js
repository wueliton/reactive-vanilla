import { createContext, getCurrentContext } from "../context/index.js";

function component(selector, setup) {
  const root = typeof selector === "string" ? document.querySelector(selector) : selector;

  const context = createContext(root);

  let element;
  const previousContext = getCurrentContext();
  window.currentContext = context;

  try {
    element = setup({ root });
  } finally {
    window.currentContext = previousContext;
  }

  return {
    ...element,
    destroy() {
      for (const effect of [...context.effects]) {
        effect.stop();
      }

      for (const child of [...context.children]) {
        child.remove();
      }

      for (const cleanup of [...context.cleanups]) {
        cleanup();
      }

      context.children.clear();
      context.effects.clear();
      context.cleanups.clear();
      context.activeEffect = null;
    },
  };
}

export { component };
