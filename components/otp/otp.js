import { create } from "../../core/create/index.js";
import { defineComponent } from "../../core/define-component/index.js";
import { effect } from "../../core/effect/index.js";
import { el } from "../../core/el/index.js";
import { signal } from "../../core/signal/index.js";

const createOtp = defineComponent(({ root, size = 6, name, oninput, oncomplete, filter }) => {
    const state = signal({
        value: '',
        selectionStart: 0,
        selectionEnd: 0,
        isFocused: false,
    });

    const $input = el('input', {
        maxLength: size,
        name: name ?? 'otp-field',
        class: {
            field: true
        },
        value: () => state.value,
        oninput: handleOnInput,
        onbeforeinput: handleBeforeInput,
        onfocus: () => state.isFocused = true,
        onblur: () => state.isFocused = false,
        onkeydown: handleKeyDown
    });
    const input = $input._raw;
    const fields = Array.from({ length: size }, (_, index) => index);
    const createField = (index) => create('span', {
        textContent: () => state.value[index] ?? '',
        class: {
            field: true,
            focused: () => Boolean(state.isFocused && state.selectionStart <= index && state.selectionEnd >= index)
        }
    });

    function handleBeforeInput(event) {
        const ignoreEvent = !event.data || !filter;
        if (ignoreEvent) return;

        const filtered = filter(event.data);
        const emptyValue = filtered === '';

        if (emptyValue) {
            event.preventDefault();
        }
    }

    function handleOnInput(event) {
        const value = filter ? filter(event.target.value) : event.target.value;
        state.value = value;
        oninput?.(event);

        const isFullFilled = value.length === size;
        if (isFullFilled) {
            oncomplete?.(value);
        }
    }

    function handleKeyDown(event) {
        const isDeleteKey = event.key === 'Backspace' || event.keyCode === 8;
        const isLeftArrow = event.key === 'ArrowLeft' || event.keyCode === 37;
        const input = event.target;

        if (isDeleteKey) {
            const onBeginSelection = input.selectionStart === 0 && input.selectionEnd === 0;
            if (onBeginSelection) {
                event.preventDefault();
                input.setRangeText("", 0, 1, "start");
                state.value = state.value.slice(1);
            }
        }

        if (isLeftArrow) {
            const isOnEnd = input.selectionStart === size;
            if (isOnEnd) {
                const selection = size - 1;
                input.setSelectionRange(
                    selection,
                    selection
                )
            }
        }
    }

    function handleSelectionChange() {
        if (document.activeElement !== input) return;

        const maxSelectionIndex = size - 1;
        state.selectionStart = Math.min(maxSelectionIndex, input.selectionStart);
        state.selectionEnd = Math.min(maxSelectionIndex, input.selectionEnd);
    }

    effect(() => {
        document.addEventListener('selectionchange', handleSelectionChange);

        return () => {
            document.removeEventListener('selectionchange', handleSelectionChange);
        }
    });

    el(root, {
        children: [
            $input,
            create('div', {
                class: {
                    ['otp-fields']: true
                },
                children: [
                    ...fields.map(createField)
                ]
            })
        ]
    });
});

export { createOtp };
