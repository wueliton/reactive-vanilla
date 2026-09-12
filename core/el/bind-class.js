import { effect } from "../effect/index.js";

function bindClass(element, classes) {
  effect(() => {
    element.className = resolveClass(classes).join(" ");
  });
}

function resolveClass(value) {
  const emptyClass = value === null || value === false;

  if (emptyClass) return [];

  if (typeof value === "function") {
    return resolveClass(value());
  }

  if (typeof value === "string") {
    return value.split(/\s+/).filter(Boolean);
  }

  if (Array.isArray(value)) {
    return value.flatMap(resolveClass);
  }

  return [];
}

export { bindClass };
