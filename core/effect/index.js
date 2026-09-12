import { getCurrentContext } from "../context/index.js";

function effect(fn) {
  const context = getCurrentContext();

  const reactiveEffect = {
    cleanup: null,
    stopped: false,
    run() {
      if (this.stopped) return;

      if (this.cleanup) {
        this.cleanup();
        this.cleanup = null;
      }

      const previousContext = window.currentContext;
      const previousEffect = context.activeEffect;

      window.currentContext = context;
      context.activeEffect = this;

      try {
        this.cleanup = fn();
      } finally {
        context.activeEffect = previousEffect;
        window.currentContext = previousContext;
      }
    },
    stop() {
      if (this.stopped) return;

      this.stopped = true;

      if (this.cleanup) {
        this.cleanup();
        this.cleanup = null;
      }

      context.effects.delete(this);
    },
  };

  context.effects.add(reactiveEffect);

  reactiveEffect.run();

  return reactiveEffect;
}

export { effect };
