import { router } from "./core/router/index.js";

import { } from "./twid.js";

const routes = router({
    outlet: '.router-outlet',
    routes: {
        '/': {
            html: './index.html',
            script: () => import('./home.js')
        },
        '/examples': {
            html: './examples/index.html',
            script: () => import('./examples/index.js')
        },
        '/examples/otp': {
            html: './examples/otp/index.html',
            script: () => import('./examples/otp/index.js')
        },
    }
});

routes.start();
