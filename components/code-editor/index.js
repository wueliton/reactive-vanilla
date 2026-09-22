import { signal } from "../../core/signal/index.js";
import { defineComponent, el, effect } from "../../dist/reactive.js";
import { hightlight } from "../../utils/highlight.js";

const createCodeEditor = defineComponent(async ({ root }) => {
  const code = signal("");
  const scroll = signal({
    scrollTop: 0,
    scrollLeft: 0,
  });

  const $textarea = el("textarea", {
    oninput: (e) => code.set(e.target.value),
    onscroll: (e) => {
      const el = e.target;
      scroll.scrollTop.set(el.scrollTop);
      scroll.scrollLeft.set(el.scrollLeft);
    },
  });

  el("code", {
    innerHTML: () => hightlight(code()),
    scrollTop: () => scroll.scrollTop(),
    scrollLeft: () => scroll.scrollLeft(),
  });

  el("iframe", {
    class: ["w-full h-full"],
    srcdoc: () => `<!doctype html>
      <html class="w-full h-full bg-gray-900">
      <body class="text-white flex items-center justify-center h-full w-full">
      <script type="module">
      import { install } from "https://esm.sh/@twind/core@1";
      import presetTailwind from "https://esm.sh/@twind/preset-tailwind@1";
      import presetAutoprefix from "https://esm.sh/@twind/preset-autoprefix@1";

      const tw = install({
        presets: [presetTailwind(), presetAutoprefix()],
        hash: false,
        theme: {
          fontFamily: {
            serif: ["Geist", "sans-serif"],
            sans: ["Geist", "sans-serif"],
            mono: [
              "ui-monospace",
              "SFMono-Regular",
              "Menlo",
              "Monaco",
              "Consolas",
              "Liberation Mono",
              "monospace",
            ],
          },
          container: {
            center: true,
          },
          extend: {
            spacing: {
              xxs: "0.25rem", // 4px
              xs: "0.5rem", // 8px
              sm: "1rem", // 16px
              md: "1.5rem", // 24px
              lg: "2rem", // 32px
              xl: "3rem", // 48px
              xxl: "4rem", // 64px
            },
          },
        },
      });
      </script>
      ${code()}
      </body>
    </html>`,
  });

  effect(() => {
    code.set($textarea.value);
  });
});

export { createCodeEditor };
