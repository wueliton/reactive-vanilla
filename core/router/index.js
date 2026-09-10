function router({ outlet, routes }) {
    const root = document.querySelector(outlet);

    const routing = {
        current: null,
        load: async function (path) {
            const route = routes[path];
            const notFoundRoute = !route;

            if (notFoundRoute) {
                throw new Error(`Route not found: ${route}`);
            }

            const response = await fetch(route.html);
            const failedResponse = !response.ok;

            if (failedResponse) {
                throw new Error(`Failed to load route: ${path}`);
            }

            return {
                html: await response.text(),
                script: route.script
            };
        },
        parse(html) {
            const template = document.createElement("template");

            template.innerHTML = html;

            return template.content;
        },
        async loadScript(route) {
            const emptyScript = !route.script;
            if (emptyScript) return;

            const module = await route.script();

            const emptyPageMethod = typeof module.page !== 'function';
            if (emptyPageMethod) {
                throw new Error('Route module must export page()');
            }

            return module.page();
        },
        async render(path) {
            const { html, script } = await routing.load(path);
            const fragment = routing.parse(html);
            const nextOutlet = fragment.querySelector(outlet);
            const module = await script();

            const emptyOutlet = !nextOutlet;

            if (emptyOutlet) {
                throw new Error(`Route ${path} does not contain an outlet`);
            }

            const emptyPageMethod = typeof module.page !== 'function';
            if (emptyPageMethod) {
                throw new Error('Route module must export a page() function');
            }

            if (routing.current) {
                routing.current.destroy?.();
                routing.current = null;
            }

            root.replaceChildren(...nextOutlet.childNodes);
            module.page();
        },
        async transition(path) {
            if (!document.startViewTransition) {
                return routing.render(path);
            }

            return document.startViewTransition(() => {
                return routing.render(path);
            }).finished;
        },
        async navigate(path, {
            replace = false
        } = {}) {
            const isActiveRoute = location.pathname === path;

            if (isActiveRoute) return;

            if (replace) {
                history.replaceState({}, "", path);
            } else {
                history.pushState({}, "", path);
            }

            await routing.transition(path);
        },
        handlePopState() {
            routing.render(location.pathname);
        },
        handleClick(event) {
            if (event.defaultPrevented) return;

            const hasPressedKey = event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey;
            if (hasPressedKey) return;

            const link = event.target.closest("a");
            const emptyLink = !link;

            if (emptyLink) return;

            const ignoreLink = link.target || link.hasAttribute("download") || link.origin !== location.origin;

            if (ignoreLink) return;

            const url = new URL(link.href, location.href);
            const emptyRoute = !routes[url.pathname];

            if (emptyRoute) return;

            event.preventDefault();

            routing.navigate(url.pathname);
        },
        async start() {
            document.addEventListener('click', routing.handleClick);
            window.addEventListener('popstate', routing.handlePopState);

            const path = location.pathname.replace(/[^/]+\/$/, '');
            const route = routes[path];

            const emptyRoute = !route;
            if (emptyRoute) return;

            await routing.loadScript(route);
        },
        stop() {
            document.removeEventListener('click', routing.handleClick);

            window.removeEventListener('popstate', routing.handlePopState);

            routing.current?.destroy?.();
            routing.current = null;
        }
    }

    return routing;
}

export { router }