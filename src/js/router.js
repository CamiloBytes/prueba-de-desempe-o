import { renderLanding, renderLogin, renderRegister } from './views.js'
import { renderDashboard } from './renderDashboard.js'
import { showEditevent } from './showEditevent.js'
import { addEvent } from './addevent.js'
import { authentication } from './auth.js'

const routes = {
    "/": renderLanding,
    "/login": renderLogin,
    "/register": renderRegister,
    "/dashboard": renderDashboard,
    "/dashboard/events/create": addEvent,
    "/dashboard/events/edit/:id": showEditevent,
};

function requireAuth() {
    if (!authentication.isAuthenticated()) {
        console.log('Usuario no autenticado, redirigiendo a login');
        location.hash = "#/login";
        return false;
    }
    return true;
}

function requireAdmin() {
    const user = authentication.getUserLocal();
    if (!user || user.role !== 'admin') {
        console.log('Acceso de admin requerido');
        location.hash = "#/dashboard";
        return false;
    }
    return true;
}

export function router() {
    const hash = location.hash.replace("#", "") || "/";
    console.log('Navegando a:', hash);

    try {
        // Handle protected routes
        if (hash.startsWith("/dashboard")) {
            if (!requireAuth()) return;
            
            // Admin-only routes
            if (hash === "/dashboard/events/create") {
                if (!requireAdmin()) return;
                addEvent();
                return;
            }
            
            // Edit event route
            if (hash.startsWith("/dashboard/events/edit/")) {
                if (!requireAdmin()) return;
                const eventId = hash.split("/").pop();
                if (eventId && eventId !== 'edit') {
                    showEditevent(eventId);
                } else {
                    console.error('ID de evento no válido');
                    location.hash = "#/dashboard";
                }
                return;
            }
            
            // Dashboard route
            if (hash === "/dashboard") {
                renderDashboard();
                return;
            }
        }

        // Handle public routes
        const routeFunction = routes[hash];
        if (routeFunction) {
            routeFunction();
        } else {
            console.log('Ruta no encontrada:', hash);
            renderLanding();
        }
        
    } catch (error) {
        console.error('Error en el router:', error);
        renderLanding();
    }
}

// Initialize router
window.addEventListener('load', () => {
    router();
});

window.addEventListener('hashchange', () => {
    router();
});
