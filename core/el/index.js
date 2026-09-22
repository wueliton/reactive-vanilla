import { effect } from "../effect/index.js";
import { getCurrentContext } from "../context/index.js";
import { appendChildren } from "./append-children.js";
import { bindAttribute } from "./bind-attribute.js";
import { bindClass } from "./bind-class.js";
import { bindStyle } from "./bind-style.js";
import { getElementState } from "./element-state.js";

function el(selector, bindings) {
  const isElement = typeof selector !== "string";
  const context = getCurrentContext();
  const element = isElement ? selector : context.root.querySelector(selector);

  setProperties(element, bindings);

  return element;
}

function setProperty(element, property, value) {
  const { effects, events, context } = getElementState(element);

  for (const [effectProperty, reactiveEffect] of effects) {
    const replacesProperty =
      effectProperty === property || effectProperty.startsWith(`${property}:`);

    if (!replacesProperty) continue;

    reactiveEffect.stop();
    effects.delete(effectProperty);
  }

  const isEvent = property.startsWith("on");
  const isReactive = typeof value === "function" && !isEvent;

  if (isEvent) {
    events.add(property);
    context.cleanups.add(getElementState(element).cleanupEvents);
  }

  if (property === "children") {
    registerEffect(element, property, () => appendChildren(element, value));
    return element;
  }

  if (property === "class") {
    registerEffect(element, property, () => bindClass(element, value));
    return element;
  }

  if (property === "attr") {
    bindAttribute(element, value, (name, createEffect) => {
      registerEffect(element, `attr:${name}`, createEffect);
    });
    return element;
  }

  if (property === "style") {
    bindStyle(element, value, (name, createEffect) => {
      registerEffect(element, `style:${name}`, createEffect);
    });
    return element;
  }

  if (isReactive) {
    const reactiveEffect = effect(() => {
      element[property] = value();
    });

    effects.set(property, reactiveEffect);
    return element;
  }

  element[property] = value;
  return element;
}

function registerEffect(element, property, createEffect) {
  const state = getElementState(element);
  const previousEffect = state.effects.get(property);

  previousEffect?.stop();

  const reactiveEffect = createEffect();
  state.effects.set(property, reactiveEffect);
  return reactiveEffect;
}

function setProperties(element, bindings) {
  for (const [property, value] of Object.entries(bindings)) {
    setProperty(element, property, value);
  }

  return element;
}

export { el, setProperties, setProperty };
