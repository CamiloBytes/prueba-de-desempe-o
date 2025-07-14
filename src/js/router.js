const routes = {
    '#/': renderLanding,
    '#/login': renderLogin,
    '#/register': renderRegister,
    '#/dashboard': renderDashboard
}

export function router() {
    const path = Location.hash || '#/'
    console.log("Ruta actual: ", path)
    const user = Authentication.getUserLocal()

    if (path.startsWith('#/dashboard') && !authentication.isAuthenticated()) {
        location.hash = '#/login'
        return
    }

    if (path.startsWith('#/login') && !authentication.isAuthenticated()) {
        location.hash = '#/dashboard'
        return
    }

    if (path.startsWith('#/dashboard/courses/edit/')) {
        showEditCourse()
        return
    }

    const view = routes[path]
    if (view) {
        view()
    }
}