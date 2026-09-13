import { defineComponent, signal, el, create, component } from "./dist/reactive.js";

export function page() {
  const Counter = defineComponent(() => {
    const counter = signal(0);

    el("[data-counter-display]", {
      textContent: () => counter(),
    });

    el("[data-counter-increment]", {
      onclick: () => counter.update((value) => ++value),
      textContent: () => `Clicked ${counter()} times`,
    });
  });

  const Tabs = defineComponent(() => {
    const selectedTab = signal(1);

    const tabs = document.querySelectorAll("[data-tab]");
    const tabsContent = document.querySelectorAll("[data-tab-content]");

    tabs.forEach((tab) => {
      el(tab, {
        onclick: () => selectedTab.set(tab.dataset.tab),
        attr: {
          ["data-active"]: () => selectedTab() == tab.dataset.tab,
        },
      });
    });

    tabsContent.forEach((tabContent) => {
      el(tabContent, {
        hidden: () => selectedTab() != tabContent.dataset.tabContent,
      });
    });
  });

  const TodoList = defineComponent(() => {
    const todoInput = signal("");
    const todos = signal(["signals", "effects"]);

    el("input", {
      value: () => todoInput(),
      oninput: (e) => todoInput.set(e.target.value),
    });

    el("button", {
      onclick: () => {
        const newTodo = todoInput();
        if (newTodo !== "") {
          todos.update((value) => [...value, newTodo]);
          todoInput.set("");
        }
      },
    });

    el("form", {
      onsubmit: (e) => e.preventDefault(),
    });

    el("[data-items]", {
      children: () =>
        todos().map(
          (item) =>
            create("div", {
              class: "flex gap-sm bg-gray-800 p-xs px-sm rounded-md w-full border border-gray-700",
              children: [
                create("span", {
                  children: [
                    create("span", {
                      textContent: "∟",
                      class: "mr-xs align-top text-sm text-blue-400",
                    }),
                    item,
                  ],
                }),
                create("button", {
                  class: "ml-auto hover:text-red-400 transition-all",
                  innerHTML:
                    '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4" aria-hidden="true"><path d="M18 6 6 18"></path><path d="m6 6 12 12"></path></svg>',
                  onclick: () =>
                    todos.update((items) => items.filter((prevItem) => prevItem !== item)),
                }),
              ],
            })._raw,
        ),
    });
  });

  const Form = defineComponent(() => {
    const name = signal("");

    el("input", {
      oninput: (e) => name.set(e.target.value),
    });

    el("p > span", {
      textContent: () => name() || "there",
    });
  });

  component("[data-counter]", Counter());
  component("[data-tabs]", Tabs());
  component("[data-form]", Form());
  component("[data-todo-list]", TodoList());
}
