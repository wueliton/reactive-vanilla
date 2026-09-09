import { effect } from "../effect/index.js";

function bindAttribute(element, attributes) {
    for (const [name, value] of Object.entries(attributes)) {
        const apply = () => {
            const result = typeof value === 'function' ? value() : value;

            if (result == null || result === false) {
                element.removeAttribute(name);
            } else {
                element.setAttribute(name, String(result));
            }
        }

        if (typeof value === 'function') {
            effect(apply);
        } else {
            apply();
        }
    }
}

export { bindAttribute }