import { el } from "../el/index.js";

function create(element, bindings) {
  const context = window.currentContext;
  const isTextNode = element === "string";
  const node = isTextNode ? document.createTextNode() : document.createElement(element);

  const createdElement = el(node, bindings);

  if (context) {
    context.children.add(createdElement);
  }

  return createdElement;
}

export { create };
