import { effect } from "../effect/index.js";

function bindClass(element, classes) {
  let previous = null;

  return effect(() => {
    const value = resolveClass(classes).join(" ");
    const sameValue = previous === value;
    if (sameValue) return;
    element.className = value;
    previous = value;
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
