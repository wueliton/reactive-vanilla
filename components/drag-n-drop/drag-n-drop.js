const createDragNDrop = (element, options) => {
    const state = {
        status: 'idle',
        source: null,
        pointer: null,
        direction: null,
        offset: null,
        position: null,
        activeDropzone: null
    };
    const elements = {
        zones: [],
        dragLayer: null,
        preview: null
    };
    const elementsClassMap = {
        dataLayer: 'drag-layer',
        placeholder: 'placeholder',
        preview: 'preview',
        activeDropzone: 'active-dropzone'
    };
    const controller = new AbortController();

    setup();
    mount();

    function setup() {
        elements.dragLayer = createDragLayer();
    }

    function createDragLayer() {
        const dragLayer = document.createElement('div');
        dragLayer.classList.add(elementsClassMap.dataLayer);
        return dragLayer;
    }

    function addDragLayer() {
        document.body.append(elements.dragLayer);
    }

    function removeDragLayer() {
        elements.dragLayer.remove();
    }

    function mount() {
        const emptyContainer = !element;

        if (emptyContainer) return;

        element.addEventListener('pointerdown', handlePointerDown, {
            signal: controller.signal
        });
    }

    function collectDropzones() {
        elements.zones = Array.from(element.querySelectorAll('[data-dropzone]'))
            .map((element) => ({
                element,
                rect: element.getBoundingClientRect(),
            }));
    }

    function collectItens(zone) {
        const elements = Array.from(zone.querySelectorAll(`[data-draggable]`));
        const sourceIndex = elements.indexOf(state.source);

        return {
            sourceIndex,
            itens: elements
                .map((element) => ({
                    element,
                    rect: element.getBoundingClientRect(),
                }))
        }
    }

    function getItemIntersectioning(x, y) {
        return elements.zones.filter(({ element, rect }) => {
            return x >= rect.left &&
                x <= rect.right &&
                y >= rect.top &&
                y <= rect.bottom &&
                element !== state.source;
        });
    }

    function createPlaceholder() {
        elements.preview = state.source.cloneNode(true);
        const { width, height } = state.source.getBoundingClientRect();
        elements.preview.style.width = `${width}px`;
        elements.preview.style.height = `${height}px`;
        elements.preview.style.left = `${state.source.offsetLeft}px`;
        elements.preview.style.top = `${state.source.offsetTop}px`;
        elements.preview.style.position = 'absolute';
        elements.preview.classList.add(elementsClassMap.preview);
        state.source.classList.add(elementsClassMap.placeholder);
        elements.dragLayer.append(elements.preview);
    }

    function removePlaceholder() {
        state.source.classList.remove(elementsClassMap.placeholder);
        if (elements.preview) {
            elements.preview.remove();
            elements.preview = null;
        }
    }

    function handlePointerDown(event) {
        const item = event.target.closest('[data-draggable]');
        const ignoreEvent = !item || !element.contains(item);

        if (ignoreEvent) return;

        state.offset = {
            x: event.clientX,
            y: event.clientY
        }
        state.status = 'dragging';
        state.source = item;

        createPlaceholder();
        addDragLayer();
        collectDropzones();

        document.addEventListener('pointermove', handlePointerMove, {
            signal: controller.signal
        });
        document.addEventListener('pointerup', handlePointerUp, {
            signal: controller.signal
        });
    }

    function handlePointerUp() {
        drop();
        updateDropzone(null);
        removeDragLayer();
        document.removeEventListener('pointermove', handlePointerMove, {
            signal: controller.signal
        });
        document.removeEventListener('pointerup', handlePointerUp, {
            signal: controller.signal
        });
    }

    function handlePointerMove(event) {
        const previousPointer = state.pointer;
        state.pointer = {
            x: event.clientX,
            y: event.clientY
        };

        const candidates = getItemIntersectioning(event.clientX, event.clientY);
        const lastCandidate = candidates.at(-1);

        if (previousPointer) {
            state.direction = {
                x: Math.sign(previousPointer.x - state.pointer.x),
                y: Math.sign(previousPointer.y - state.pointer.y)
            };
        }

        updateDropzone(lastCandidate);
        const itemPosition = getItemPosition();
        updateItemPosition(itemPosition);
        update();
    }

    function getItemPosition() {
        const itens = state.activeDropzone?.itens ?? [];
        const index = itens
            .findIndex(({ rect }) =>
                state.pointer.x >= rect.left &&
                state.pointer.x <= rect.right &&
                state.pointer.y >= rect.top &&
                state.pointer.y <= rect.bottom
            );
        const notFoundedItem = index === -1;
        const movingUp = state.direction?.y > 0;
        const placement = movingUp ? 'before' : 'after';
        const fallbackIndex = movingUp ? 0 : 0;
        const fallbackItem = movingUp ? itens.at(0)?.element : null;

        return {
            index: notFoundedItem ? fallbackIndex : index,
            anchor: notFoundedItem ? fallbackItem : itens[index].element,
            placement
        }
    }

    function updateItemPosition(position) {
        const previousIndex = state.position?.index;
        const currentIndex = position.index;
        const samePosition = previousIndex === currentIndex;

        if (samePosition) return;

        state.position = position;
    }

    function resetItemPosition() {
        const itens = state.activeDropzone?.itens ?? [];

        itens.forEach(({ element }) => {
            element.style.translate = '';
        })
    }

    function updateDropzone(candidate) {
        const sameDropzone = candidate?.element === state.activeDropzone?.element;

        if (sameDropzone) return;

        resetItemPosition();

        if (state.activeDropzone) {
            state.activeDropzone.element.classList.remove(elementsClassMap.activeDropzone);
        }

        state.activeDropzone = candidate;
        state.position = null;
    }

    function update() {
        const { pointer, offset, status, activeDropzone } = state;

        const isDragging = status === 'dragging';

        if (isDragging) {
            const hasPosition = pointer && offset;
            if (hasPosition) {
                const x = pointer.x - offset.x;
                const y = pointer.y - offset.y;

                elements.preview.style.translate = `${x}px ${y}px`;
                elements.preview.style.transition = 'none';
            }

            if (activeDropzone) {
                activeDropzone.element.classList.add(elementsClassMap.activeDropzone);
                activeDropzone.element.appendChild(state.source);

                const { sourceIndex, itens } = collectItens(activeDropzone.element);

                activeDropzone.sourceIndex = sourceIndex;
                activeDropzone.itens = itens;
            }
        }
    }

    function dropItem() {
        const ignoreEvent = !state.activeDropzone || !state.position;

        if (ignoreEvent) return;

        const { anchor, placement } = state.position;
        const hasPlacement = placement && anchor;

        if (hasPlacement) {
            anchor[placement](state.source);
            return;
        }

        state.activeDropzone.element.appendChild(state.source);
    }

    function drop() {
        dropItem();
        removePlaceholder();
    }
}

export { createDragNDrop };