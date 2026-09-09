function signal(target) {
    const context = window.currentContext;
    const subscribers = new Map();

    return new Proxy(target, {
        get(target, property, receiver) {
            const effect = context?.activeEffect;

            if (effect) {
                let effects = subscribers.get(property);

                if (!effects) {
                    effects = new Set();
                    subscribers.set(property, effects);
                }

                effects.add(effect);
            }

            return Reflect.get(target, property, receiver);
        },

        set(target, property, value, receiver) {
            const oldValue = target[property];

            if (Object.is(oldValue, value)) {
                return true;
            }

            const result = Reflect.set(
                target,
                property,
                value,
                receiver
            );

            const effects = subscribers.get(property);

            if (effects) {
                effects.forEach(effect => effect.run());
            }

            return result;
        }
    });
}

export { signal };