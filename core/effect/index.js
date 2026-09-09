function effect(fn) {
    const context = window.currentContext;

    const reactiveEffect = {
        cleanup: null,
        stopped: false,
        run() {
            if (this.stopped) return;

            if (this.cleanup) {
                this.cleanup();
                this.cleanup = null;
            }

            const previousEffect = context.activeEffect;

            context.activeEffect = this;

            try {
                this.cleanup = fn();
            } finally {
                context.activeEffect = previousEffect;
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
        }
    };

    context.effects.add(reactiveEffect);

    reactiveEffect.run();

    return reactiveEffect;
}

export { effect };