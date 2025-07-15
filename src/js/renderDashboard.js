import { api } from './api.js'
import { authentication } from './auth.js'
import { addEvent } from './addevent.js'
import { alertInfo } from './alert.js'

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
                    if (!eventId) {
                        alertInfo("ID de evento no proporcionado")
                        return
                    }
                    const event = await api.get(`/events?=${eventId}`)
                    if (!event) {
                        alertInfo("Evento no encontrado")
                        return
                    }
                    if (!confirm("¿Estás seguro de que quieres eliminar este evento?")) {
                        return 
                    }
                    await api.delete(`/events/${eventId}`)
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
                    // Fetch registrations and events again to get fresh data
                    const registrations = await api.get("/registrations")
                    const events = await api.get("/events")
                    const user = authentication.getUserLocal()

                    // Check if user already registered for this event
                    const userRegistration = registrations.find(r => r.eventId === eventId && r.userId === user.id)
                    if (userRegistration) {
                        alertInfo("Ya estás inscrito en este evento")
                        return
                    }
                    // Count registrations for this event
                    const eventRegistrations = registrations.filter(r => r.eventId === eventId)
                    const event = events.find(e => e.id === eventId)
                    if (!event) {
                        alertError("Evento no encontrado")
                        return
                    }
                    const capacity = parseInt(event.capacity, 10) || 0
                    if (eventRegistrations.length >= capacity) {
                        alertInfo("Capacidad máxima alcanzada")
                        return
                    }
                    // Add registration
                    await api.post("/registrations", { userId: user.id, eventId })
                    // Decrement event capacity
                    const updatedEvent = { ...event, capacity: (capacity - 1).toString() }
                    await api.put(`/events/${eventId}`, updatedEvent)
                    alertInfo("Inscripción exitosa")
                    renderDashboard() // Refresh the dashboard
                } catch (error) {
                    console.error("Error al inscribirse:", error)
                    alertError("Error al inscribirse en el evento")
                }
            })
        })

        document.querySelectorAll(".leave-btn").forEach(button => {
            button.addEventListener("click", async () => {
                const eventId = button.dataset.id
                const capacity = parseInt(button.closest('tr').querySelector('td:nth-child(3)').textContent, 10) || 0
                try {
                    if (capacity <= 0) {
                        alertError("No puedes salir de un evento sin inscribirte primero")
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
                    await api.put(`/events/${eventId}`, event)
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