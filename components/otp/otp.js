import { create } from "../../core/create/index.js";
import { defineComponent } from "../../core/define-component/index.js";
import { effect } from "../../core/effect/index.js";
import { el } from "../../core/el/index.js";
import { signal } from "../../core/signal/index.js";

const createOtp = defineComponent(({ root, size = 6, name, oninput, oncomplete, filter }) => {
  const state = signal({
    value: "",
    selectionStart: 0,
    selectionEnd: 0,
    isFocused: false,
  });

  const $input = el("input", {
    maxLength: size,
    name: name ?? "otp-field",
    class: ["hidden-input"],
    value: () => state.value(),
    oninput: handleOnInput,
    onbeforeinput: handleBeforeInput,
    onfocus: () => state.isFocused.set(true),
    onblur: () => state.isFocused.set(false),
    onkeydown: handleKeyDown,
  });
  const input = $input;
  const fields = Array.from({ length: size }, (_, index) => index);
  const createField = (index) =>
    create("span", {
      textContent: () => state.value()[index] ?? "",
      class: [
        "h-xl w-xl bg-gray-800 border border-gray-700 rounded-md flex items-center justify-center data-active:border-blue-500 transition-colors",
      ],
      attr: {
        ["data-active"]: () =>
          Boolean(
            state.isFocused() && state.selectionStart() <= index && state.selectionEnd() >= index,
          ),
        ["data-empty"]: () => !Boolean(state.value()[index]),
      },
    });

  function handleBeforeInput(event) {
    const ignoreEvent = !event.data || !filter;
    if (ignoreEvent) return;

    const filtered = filter(event.data);
    const emptyValue = filtered === "";

    if (emptyValue) {
      event.preventDefault();
    }
  }

  function handleOnInput(event) {
    const value = filter ? filter(event.target.value) : event.target.value;
    state.value.set(value);
    oninput?.(event);

    const isFullFilled = value.length === size;
    if (isFullFilled) {
      oncomplete?.(value);
    }
  }

  function handleKeyDown(event) {
    const isDeleteKey = event.key === "Backspace" || event.keyCode === 8;
    const isLeftArrow = event.key === "ArrowLeft" || event.keyCode === 37;
    const input = event.target;

    if (isDeleteKey) {
      const onBeginSelection = input.selectionStart === 0 && input.selectionEnd === 0;
      if (onBeginSelection) {
        event.preventDefault();
        input.setRangeText("", 0, 1, "start");
        state.value.update((value) => value.slice(1));
      }
    }

    if (isLeftArrow) {
      const isOnEnd = input.selectionStart === size;
      if (isOnEnd) {
        const selection = size - 1;
        input.setSelectionRange(selection, selection);
      }
    }
  }

  function handleSelectionChange() {
    if (document.activeElement !== input) return;

    const maxSelectionIndex = size - 1;
    state.selectionStart.set(Math.min(maxSelectionIndex, input.selectionStart));
    state.selectionEnd.set(Math.min(maxSelectionIndex, input.selectionEnd));
  }

  effect(() => {
    document.addEventListener("selectionchange", handleSelectionChange);

    return () => {
      document.removeEventListener("selectionchange", handleSelectionChange);
    };
  });

  el(root, {
    class: ["relative"],
    children: [
      $input,
      create("div", {
        class: ["flex gap-xs"],
        children: fields.map(createField),
      }),
    ],
  });
});

export { createOtp };
