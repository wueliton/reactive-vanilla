function router({ outlet, routes, prefix }) {
  const root = document.querySelector(outlet);

  const routing = {
    current: null,
    getBaseURL() {
      return prefix.replace(/\/$/, "");
    },
    createURL(path) {
      const url = new URL(path, location.origin);
      const normalizedPath = routing.normalizePathname(url.pathname);
      const baseURL = routing.getBaseURL();

      url.pathname = `${baseURL}${normalizedPath || "/"}`.replace(/\/+/g, "/");

      return url;
    },
    load: async function (path) {
      const route = routes[path];
      const notFoundRoute = !route;

      if (notFoundRoute) {
        throw new Error(`Route not found: ${route}`);
      }

      const url = new URL(`${routing.getBaseURL()}/`, location.origin);
      url.pathname = `${url.pathname}${route.html.replace(/^\.\//, "")}`;

      const response = await fetch(url);
      const failedResponse = !response.ok;

      if (failedResponse) {
        throw new Error(`Failed to load route: ${path}`);
      }

      return {
        html: await response.text(),
        script: route.script,
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

      const emptyPageMethod = typeof module.page !== "function";
      if (emptyPageMethod) {
        throw new Error("Route module must export page()");
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

      const emptyPageMethod = typeof module.page !== "function";
      if (emptyPageMethod) {
        throw new Error("Route module must export a page() function");
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
    async navigate(url, { replace = false } = {}) {
      url = routing.createURL(url);

      const isActiveRoute = location.pathname === url.pathname && !url.hash;

      if (isActiveRoute) return;

      const isSameRoute = location.pathname === url.pathname;

      if (replace) {
        history.replaceState({}, "", url);
      } else {
        history.pushState({}, "", url);
      }

      if (isSameRoute) {
        return new Promise((resolve) => {
          routing.handleScrollToHash(url.hash);
          resolve();
        });
      }

      return await routing.transition(routing.normalizePathname(url.pathname)).then((res) => {
        routing.handleScrollToHash(url.hash);
        return res;
      });
    },
    handleScrollToHash(hash) {
      const emptyHash = !hash;
      if (emptyHash) {
        window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
        return;
      }

      document.querySelector(hash).scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    },
    async handlePopState() {
      await routing.transition(routing.normalizePathname(location.pathname));
      routing.handleScrollToHash(location.hash);
    },
    async handleClick(event) {
      if (event.defaultPrevented) return;

      const hasPressedKey =
        event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey;
      if (hasPressedKey) return;

      const link = event.target.closest("a");
      const emptyLink = !link;

      if (emptyLink) return;

      const ignoreLink =
        link.target || link.hasAttribute("download") || link.origin !== location.origin;

      if (ignoreLink) return;

      const url = routing.createURL(link.href);
      const routePath = routing.normalizePathname(url.pathname);
      const emptyRoute = !routes[routePath];

      if (emptyRoute) return;

      event.preventDefault();

      routing.navigate(url);
    },
    async start() {
      document.addEventListener("click", routing.handleClick);
      window.addEventListener("popstate", routing.handlePopState);

      const path = routing.normalizePathname(location.pathname);
      const route = routes[path];

      const emptyRoute = !route;
      if (emptyRoute) return;

      await routing.loadScript(route);
    },
    stop() {
      document.removeEventListener("click", routing.handleClick);

      window.removeEventListener("popstate", routing.handlePopState);

      routing.current?.destroy?.();
      routing.current = null;
    },
    normalizePathname(pathname) {
      pathname = pathname.replace("index.html", "").replace(routing.getBaseURL(), "");

      if (!pathname) return "/";

      if (pathname.endsWith("/") && pathname.length > 1) return pathname.slice(0, -1);

      return pathname;
    },
  };

  return routing;
}

export { router };
