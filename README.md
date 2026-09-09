# Reactive DOM Studies

An ongoing technical study of reactive interfaces built with vanilla JavaScript, directly on the DOM, without templates, a virtual DOM, or a build step.

This repository is a work in progress for exploring how a small reactive runtime can be designed from the ground up using browser-native APIs.

## Features

- Reactive state with `signal()`
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
    count: 0
});

el(".counter", {
    textContent: () => state.count
});

el(".increment", {
    onclick: () => state.count++
});
```

HTML stays HTML:

```html
<div class="counter">0</div>

<button class="increment">
    Increment
</button>
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
