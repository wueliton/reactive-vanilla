import { effect } from "../effect/index.js";

function bindStyle(element, styles, registerEffect) {
  for (const [property, value] of Object.entries(styles)) {
    const isFn = typeof value === "function";

    if (isFn) {
      registerEffect(property, () => effect(() => (element.style[property] = value())));
    } else {
      element.style[property] = value;
    }
  }
}

export { bindStyle };
