function defineComponent(callback) {
    return (props) => ({ root }) => callback({ root, ...props });
}

export { defineComponent }