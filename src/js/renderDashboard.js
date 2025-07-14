import { api } from './api.js'
import { authentication } from './auth.js'
import { addEvent } from './addevent.js'

export async function renderDashboard() {
    const app = document.getElementById("app")
    const user = authentication.getUserLocal()
    const events = await api.get("/events")

    app.innerHTML = `
    <section class="dashboard">
        <header class="dashboard-header">
            <h2>Eventos</h2>
            ${user.role === "admin" ? `<button id="add-event-btn" class="btn-success">Agregar Evento</button>` : ""}
            <button id="logout-btn" class="btn-danger">Cerrar Sesión</button>
        </header>
        <table class="events-table">
            <thead>
                <tr>
                    <th>Nombre</th>
                    <th>Descripción</th>
                    <th>Capacidad</th>
                    <th>Fecha</th>
                    <th>Acciones</th>
                </tr>
            </thead>
            <tbody>
                ${events.map(event => `
                <tr>
                    <td>${event.name || 'Sin título'}</td>
                    <td>${event.description || 'Sin descripción'}</td>
                    <td>${event.capacity || 0}</td>
                    <td>${event.date || 'Sin fecha'}</td>
                    <td>
                        ${user.role === "admin" ? `
                            <button class="edit-btn btn-warning" data-id="${event.id}">✏️</button>
                            <button class="delete-btn btn-danger" data-id="${event.id}">🗑️</button>
                        ` : `
                            <button class="enroll-btn btn-success" data-id="${event.id}">Inscribirse</button>
                            <button class="leave-btn btn-warning" data-id="${event.id}">Salir</button>
                        `}
                    </td>
                </tr>`).join('')}
            </tbody>
        </table>
    </section>`

    // Event listeners for admin actions
    if (user.role === "admin") {
        document.querySelectorAll(".edit-btn").forEach(button => {
            button.addEventListener("click", async () => {
                const eventId = button.dataset.id
                location.hash = `#/dashboard/events/edit/${eventId}`
            })
        })

        document.querySelectorAll(".delete-btn").forEach(button => {
            button.addEventListener("click", async () => {
                const eventId = button.dataset.id
                try {
                    await api.delete(`/events?=${eventId}`)
                    console.log("Event deleted successfully!")
                    renderDashboard() // Refresh the dashboard
                } catch (error) {
                    console.error("Error deleting event:", error)
                }
            })
        })

        document.getElementById("add-event-btn").addEventListener("click", () => {
            location.hash = "#/dashboard/events/create"
            addEvent()
        })
    }

    // Event listeners for user actions
    if (user.role === "visitor") {
        document.querySelectorAll(".enroll-btn").forEach(button => {
            button.addEventListener("click", async () => {
                const eventId = button.dataset.id
                try {
                    const event = await api.get(`/events?=${eventId}`)
                    if (event.capacity > 0 && event.capacity !== undefined) {
                        event.capacity -= 1
                        await api.put(`/events?=${eventId}`, event)
                        console.log("Inscripción exitosa!")
                        renderDashboard() // Refresh the dashboard
                    } else {
                        alert("Capacidad máxima alcanzada")
                    }
                } catch (error) {
                    console.error("Error al inscribirse:", error)
                }
            })
        })

        document.querySelectorAll(".leave-btn").forEach(button => {
            button.addEventListener("click", async () => {
                const eventId = button.dataset.id
                const capacity = parseInt(button.closest('tr').querySelector('td:nth-child(3)').textContent, 10) || 0
                try {
                    if (capacity <= 0) {
                        alert("No puedes salir de un evento sin inscribirte primero")
                        return
                    }
                    if (!eventId) {
                        console.error("Event ID is not defined")
                        return
                    }

                    if (isNaN(capacity)) {
                        console.error("Invalid capacity value:", capacity)
                        return
                    }
                    const event = await api.get(`/events?=${eventId}`)
                    event.capacity += 1
                    await api.put(`/events?=${eventId}`, event)
                    console.log("Saliste del evento exitosamente!")
                    renderDashboard() // Refresh the dashboard
                } catch (error) {
                    console.error("Error al salir del evento:", error)
                }
            })
        })
    }

    // Logout functionality
    document.getElementById("logout-btn").addEventListener("click", () => {
        authentication.logout()
        location.hash = "#/login"
    })

}