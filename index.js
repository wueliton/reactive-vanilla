import { router } from "./router/index.js";
import { initializeTwid } from "./twid.js";

const isLocal = ["localhost", "127.0.0.1"].includes(location.hostname);

const routes = router({
  outlet: ".router-outlet",
  prefix: location.hostname.endsWith("github.io") ? "/reactive-vanilla" : "",
  routes: {
    "/": {
      html: "./index.html",
      script: () => import("./home.js"),
    },
    "/examples": {
      html: "./examples/index.html",
      script: () => import("./examples/index.js"),
    },
    "/examples/otp": {
      html: "./examples/otp/index.html",
      script: () => import("./examples/otp/index.js"),
    },
  },
});

routes.start();

(() => {
  if (isLocal) {
    initializeTwid();
  }
})();
