import { router } from "./core/router/index.js";

const routes = router({
    outlet: '.router-outlet',
    routes: {
        '/': {
            html: './index.html',
            script: () => import('./home.js')
        },
        '/otp': {
            html: './otp/index.html',
            script: () => import('./otp/otp.js')
        }
    }
});

routes.start();
