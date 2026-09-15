import { effect } from "../effect/index.js";

function appendChildren(parent, children) {
  const isStaticChildren = typeof children !== "function";

  if (isStaticChildren) {
    append(parent, children);
    return;
  }

  let current = new Set();

  effect(() => {
    const value = children();
    const nextList = [];

    collectChildrenList(value, nextList);

    const nextSet = new Set(nextList);

    for (let i = 0; i < nextList.length; i++) {
      const child = nextList[i];
      const currentChildAtPosition = parent.children[i];

      if (currentChildAtPosition !== child) {
        parent.insertBefore(child, currentChildAtPosition || null);
      }
    }

    for (const child of current) {
      if (!nextSet.has(child)) {
        child.remove();
      }
    }

    current = nextSet;
  });
}

function collectChildrenList(children, nextList) {
  const invalidChildren = children === null || children === false;

  if (invalidChildren) return;

  if (Array.isArray(children)) {
    for (const child of children) {
      collectChildrenList(child, nextList);
    }
    return;
  }

  const child = children?._raw ?? children;
  nextList.push(child);
}

function append(parent, children) {
  const invalidChildren = children === null || children === false;

  if (invalidChildren) return;

  if (Array.isArray(children)) {
    for (const child of children) {
      append(parent, child);
    }
    return;
  }

  parent.append(children?._raw ?? children);
}

export { appendChildren };
