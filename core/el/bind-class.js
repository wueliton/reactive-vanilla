import { effect } from "../effect/index.js";

function bindClass(element, classes) {
    for (const [name, value] of Object.entries(classes)) {
        const isFn = typeof value === 'function';

        if (isFn) {
            effect(() => {
                element.classList.toggle(name, Boolean(value()))
            });
        } else {
            element.classList.toggle(name, Boolean(value));
        }
    }
}

export { bindClass };