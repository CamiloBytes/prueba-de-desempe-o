import { renderLanding, renderLogin, renderRegister, renderDashboard } from './views.js';
import { authentication } from './auth.js';
import { showEditevent } from './showEditevent.js';
// Router module to handle navigation and rendering of views based on URL hash
const routes = {
    '#/': renderLanding,
    '#/login': renderLogin,
    '#/register': renderRegister,
    '#/dashboard': renderDashboard
}

export function router() {
    const path = location.hash || '#/';
    console.log("Ruta actual: ", path)
    const user = authentication.getUserLocal()

    if (path.startsWith('#/dashboard') && !authentication.isAuthenticated()) {
        location.hash = '#/login';
        return;
    }

    if ((path === '#/login' || path === '#/register') && authentication.isAuthenticated()) {
        location.hash = '#/dashboard'
        return;
    }

    if (path.startsWith('#/dashboard/events/edit/')) {
        showEditevent()
        return
    }

    const view = routes[path]
    if (view) {
        view()
    }
}