import { renderLanding, renderLogin, renderRegister } from './views.js'
import { renderDashboard } from './renderDashboard.js'
import { showEditevent } from './showEditevent.js'

const routes = {
    "/": renderLanding,
    "/login": renderLogin,
    "/register": renderRegister,
    "/dashboard": renderDashboard,
    "/dashboard/events/edit/:id": showEditevent,
    // other routes...
};

export function router() {
    const hash = location.hash.replace("#", "");
    // Handle dynamic route for edit event
    if (hash.startsWith("/dashboard/events/edit/")) {
        const eventId = hash.split("/").pop();
        showEditevent(eventId);
        return;
    }
    const routeFunction = routes[hash];
    if (routeFunction) {
        routeFunction();
    } else {
        renderLanding();
    }
}
