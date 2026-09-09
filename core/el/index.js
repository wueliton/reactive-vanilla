import { effect } from "../effect/index.js";
import { appendChildren } from "./append-children.js";
import { bindClass } from "./bind-class.js";
import { bindStyle } from "./bind-style.js";

function el(selector, bindings) {
    const effects = new Map();
    const context = window.currentContext;
    const isElement = typeof selector !== 'string';
    const el = isElement ? selector : context.root.querySelector(selector);

    const element = new Proxy(el, {
        get(target, property, receiver) {
            const isRawProp = property === '_raw';

            if (isRawProp) {
                return target;
            }

            const value = Reflect.get(target, property, receiver);

            if (typeof value === 'function') {
                return value.bind(target);
            }

            return value;
        },
        set(target, property, value) {
            const isRawProp = property === '_raw';
            if (isRawProp) return false;

            const previousEffect = effects.get(property);

            if (previousEffect) {
                previousEffect.stop();
                effects.delete(property);
            }

            const isEvent = property.startsWith('on');
            const isReactive = typeof value === 'function' && !isEvent;

            if (property === 'children') {
                appendChildren(el, value);
                return true;
            }

            if (property === 'class') {
                bindClass(el, value);
                return true;
            }

            if (property === 'style') {
                bindStyle(el, value);
                return true;
            }

            if (isReactive) {
                const reactiveEffect = effect(() => {
                    target[property] = value()
                });

                effects.set(property, reactiveEffect);

                return true;
            }

            return Reflect.set(target, property, value, target);
        }
    });

    for (const [property, value] of Object.entries(bindings)) {
        element[property] = value;
    }

    return element;
}

export { el };