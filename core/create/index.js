import { el } from "../el/index.js";

function create(element, bindings) {
    const context = window.currentContext;
    const isTextNode = element === 'string';
    const node = isTextNode ? document.createTextNode() : document.createElement(element);

    const proxyEl = el(node, bindings);

    context.children.add(proxyEl);

    return proxyEl;
};

export { create };