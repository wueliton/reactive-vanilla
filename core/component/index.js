function component(selector, setup) {
    const root = document.querySelector(selector);
    const context = {
        root,
        activeEffect: null,
        effects: new Set(),
        cleanups: new Set(),
        children: new Set()
    };

    let element;
    const previousContext = window.currentContext;
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
        }
    };
}

export { component };