import { getCurrentContext } from "../context/index.js";

function signal(initialValue) {
  const isObject = (value) => value !== null && typeof value === "object" && !Array.isArray(value);

  const createSignal = (initialValue) => {
    let value = initialValue;
    const subscribers = new Set();

    const read = () => {
      const context = getCurrentContext();
      const activeEffect = context.activeEffect;

      if (activeEffect) {
        subscribers.add(activeEffect);
        activeEffect.dependencies.add(subscribers);
      }
      return value;
    };

    read.set = (nextValue) => {
      if (Object.is(value, nextValue)) return;

      value = nextValue;

      subscribers.forEach((effect) => effect.schedule());
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
          signals.set(property, createSignal(target[property]));
        }

        return signals.get(property);
      },
      set(target, property, value) {
        target[property] = value;

        if (!signals.has(property)) {
          signals.set(property, createSignal(value));
        } else {
          signals.get(property).set(value);
        }

        return true;
      },
    });
  };

  return isObject(initialValue) ? createReactiveSignal(initialValue) : createSignal(initialValue);
}

export { signal };
