function appendChildren(parent, children) {
    for (const child of children) {
        if (child === null) continue;

        if (Array.isArray(child)) {
            appendChildren(parent, child);
            continue;
        }

        parent.append(
            child?._raw ?? child
        );
    }
}

export { appendChildren };