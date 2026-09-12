import { router } from "./core/router/index.js";
import { initializeDocumentContext } from "./core/context/index.js";
import { initializeTwid } from "./twid.js";

initializeDocumentContext();

const routes = router({
  outlet: ".router-outlet",
  prefix: "/reactive-vanilla",
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
