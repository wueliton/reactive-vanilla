function createContext(root) {
  return {
    root,
    activeEffect: null,
    effects: new Set(),
    cleanups: new Set(),
    children: new Set(),
  };
}

function getCurrentContext() {
  return window.currentContext || initializeDocumentContext();
}

(function initializeDocumentContext() {
  if (!window.documentContext) {
    window.documentContext = createContext(document);
  }

  if (!window.currentContext) {
    window.currentContext = window.documentContext;
  }

  return window.documentContext;
})();

export { createContext, getCurrentContext };
