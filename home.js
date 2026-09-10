import { component } from "./core/component/index.js";
import { el } from "./core/el/index.js";
import { signal } from "./core/signal/index.js";

export function page() {
    component('.counter', () => {
        const state = signal({
            count: 1
        });

        el('.counter-display', {
            textContent: () => state.count
        });

        el('.increment', {
            onclick: () => state.count++
        });

        el('.decrement', {
            onclick: () => state.count--
        });
    });

    component('[data-tabs]', ({ root }) => {
        const state = signal({
            activeTab: 0
        });
        const tabs = root.querySelectorAll('[data-tab]');
        const tabContent = root.querySelectorAll('[data-tab-content]');

        tabs.forEach((tab, index) => {
            el(tab, {
                onclick: () => state.activeTab = index,
                attr: {
                    'data-active': () => state.activeTab === index
                }
            });

            el(tabContent[index], {
                attr: {
                    hidden: () => state.activeTab !== index
                }
            });
        });
    });
}