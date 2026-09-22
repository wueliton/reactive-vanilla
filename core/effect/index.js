import { getCurrentContext } from "../context/index.js";

const effectState = {
  flushScheduled: false,
  pendingEffects: new Set(),
};

function schedule(effect) {
  effectState.pendingEffects.add(effect);

  if (effectState.flushScheduled) return;

  effectState.flushScheduled = true;

  requestAnimationFrame(() => {
    effectState.flushScheduled = false;

    const effects = [...effectState.pendingEffects];
    effectState.pendingEffects.clear();

    for (const effect of effects) {
      if (!effect.stopped) effect.run();
    }
  });
}

function cleanupDependencies(effect) {
  for (const subscribers of effect.dependencies) {
    subscribers.delete(effect);
  }

  effect.dependencies.clear();
}

function effect(fn) {
  const context = getCurrentContext();

  const reactiveEffect = {
    cleanup: null,
    stopped: false,
    dependencies: new Set(),
    run() {
      if (this.stopped) return;

      cleanupDependencies(this);

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
    schedule() {
      schedule(this);
    },
    stop() {
      if (this.stopped) return;

      this.stopped = true;
      cleanupDependencies(this);

      effectState.pendingEffects.delete(this);

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
