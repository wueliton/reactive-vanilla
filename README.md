# Reactive DOM Studies

An ongoing technical study of reactive interfaces built with vanilla JavaScript, directly on the DOM, without templates, a virtual DOM, or a build step.

This repository is a work in progress for exploring how a small reactive runtime can be designed from the ground up using browser-native APIs.

## Features

- Reactive state with `signal()`
- Readable and writable signals with `signal()` and `.set()`
- Reactive object properties
- Reactive effects with `effect()`
- Reactive DOM property bindings
- Reactive classes and styles
- Event bindings
- Reusable components
- Component lifecycle and cleanup
- Dynamic DOM creation
- No JSX
- No templates
- No virtual DOM
- No build step

## Example

```js
import { signal } from "./core/signal/index.js";
import { el } from "./core/el/index.js";

const state = signal({
  count: 0,
});

el(".counter", {
  textContent: () => state.count(),
});

el(".increment", {
  onclick: () => state.count.set(state.count() + 1),
});
```

Signals are functions when read. Primitive signals expose `.set()` and `.update()`;
object signals expose one signal per property:

```js
const count = signal(0);
count();
count.set(1);
count.update((value) => value + 1);

const state = signal({ count: 0 });
state.count();
state.count.set(1);
```

Bindings whose value is a function are updated reactively. Event bindings remain
regular DOM event handlers:

```js
el(".status", {
  textContent: () => (state.count() > 0 ? "Active" : "Idle"),
  class: {
    active: () => state.count() > 0,
  },
  style: {
    color: () => (state.count() > 0 ? "green" : "gray"),
  },
  onclick: (event) => console.log(event.type),
});
```

HTML stays HTML, while JavaScript binds behavior to existing elements:

```html
<div class="counter">0</div>

<button class="increment">Increment</button>
```

## Philosophy

Reactive DOM keeps the Web Platform at the center.

- HTML defines structure.
- The DOM is the rendering layer.
- JavaScript defines behavior.
- Signals provide reactivity.
- Components provide composition.
- Lifecycle manages resources.

```text
state -> signal -> effect -> DOM
```

## Project Status

🚧 Ongoing technical studies.

The API is experimental and evolving. The ideas are being validated through practical components such as OTP inputs, forms, drag and drop interactions, and dynamic DOM behavior.
