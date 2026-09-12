import { getCurrentContext } from "../context/index.js";

function signal(initialValue) {
  const isObject = (value) => value !== null && typeof value === "object" && !Array.isArray(value);

  const createSignal = (initialValue) => {
    let value = initialValue;
    const context = getCurrentContext();
    const subscribers = new Set();

    const read = () => {
      if (context.activeEffect) subscribers.add(context.activeEffect);
      return value;
    };

    read.set = (nextValue) => {
      if (Object.is(value, nextValue)) return;

      value = nextValue;

      subscribers.forEach((effect) => effect.run());
    };

    read.update = (updater) => {
      read.set(updater(value));
    };

    return read;
  };

  const createReactiveSignal = (object) => {
    const signals = new Map();

    return new Proxy(object, {
      get(target, property) {
        if (!signals.has(property)) {
          signals.set(property, signal(target[property]));
        }

        return signals.get(property);
      },
      set(target, property, value) {
        if (!signals.has(property)) {
          signals.set(property, signal(target[property]));
        }

        signals.get(property).set(value);

        return true;
      },
    });
  };

  return isObject(initialValue) ? createReactiveSignal(initialValue) : createSignal(initialValue);
}

export { signal };
