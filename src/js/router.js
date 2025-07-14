import { renderLanding, renderLogin, renderRegister } from './views.js';
import { authentication } from './auth.js';
import { showEditevent } from './showEditevent.js';
import { renderDashboard } from './renderDashboard.js';

// Router module to handle navigation and rendering of views based on URL hash
const routes = {
    '#/': renderLanding,
    '#/login': renderLogin,
    '#/register': renderRegister,
    '#/dashboard': renderDashboard,
    '#/dashboard/events/edit': showEditevent,
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