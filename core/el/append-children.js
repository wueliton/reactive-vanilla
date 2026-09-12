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
    const next = new Set();

    collectChildren(parent, value, current, next);

    for (const child of current) {
      const canRemove = !next.has(child);

      if (canRemove) {
        child.remove();
      }
    }

    current = next;
  });
}

function collectChildren(parent, children, current, next) {
  const invalidChildren = children === null || children === false;

  if (invalidChildren) return;

  if (Array.isArray(children)) {
    for (const child of children) {
      collectChildren(parent, child, current, next);
    }

    return;
  }

  const child = children?._raw ?? children;

  next.add(child);

  const canAddChild = !current.has(child);
  if (canAddChild) {
    parent.append(child);
  }
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
