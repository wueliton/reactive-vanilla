import { install, stringify } from "https://esm.sh/@twind/core@1";
import presetTailwind from "https://esm.sh/@twind/preset-tailwind@1";
import presetAutoprefix from "https://esm.sh/@twind/preset-autoprefix@1";
import { create } from "./core/create/index.js";

function initializeTwid() {
  const tw = install({
    presets: [presetTailwind(), presetAutoprefix()],
    hash: false,
    theme: {
      fontFamily: {
        serif: ["Geist", "sans-serif"],
        sans: ["Geist", "sans-serif"],
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

  const $button = create("button", {
    class: "fixed bottom-md right-md z-100 bg-blue-600 p-xs px-sm rounded-md",
    textContent: "Copiar CSS",
    onclick: async () => {
      const css = stringify(tw.target);
      await navigator.clipboard.writeText(css);
    },
  });

  document.body.append($button._raw);
}

export { initializeTwid };
