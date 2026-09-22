import { effect } from "../effect/index.js";
import { getCurrentContext } from "../context/index.js";
import { signal } from "../signal/index.js";

function computed(derive) {
  const context = getCurrentContext();
  const result = signal();
  let currentValue;
  let initialized = false;

  const computation = effect(() => {
    const nextValue = derive();
    const ignoreValue = initialized && Object.is(currentValue, nextValue);

    if (ignoreValue) return;

    currentValue = nextValue;
    initialized = true;
    result.set(nextValue);
  });

  result.stop = () => {
    computation.stop();
  };

  context.cleanups.add(result.stop);

  return result;
}

export { computed };
