import { component } from "./core/component/index.js";
import { el } from "./core/el/index.js";
import { signal } from "./core/signal/index.js";

export function page() {
    component("[data-counter]", () => {
        const state = signal({
            count: 1,
        });

        el("[data-counter-display]", {
            textContent: () => state.count,
        });

        el("[data-counter-increment]", {
            onclick: () => state.count++,
            textContent: () => `Clicked ${state.count} times`,
        });
    });
}
