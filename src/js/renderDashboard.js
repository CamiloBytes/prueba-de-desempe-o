import { api } from './api.js'
import { authentication } from './auth.js'

export async function renderDashboard() {
    const app = document.getElementById("app")
    const user = authentication.getUserLocal()
    const events = await api.get("/events")

    app.innerHTML = `
    <section id="dashboard">
        <aside class="sidebar">
            <div class="profile">
                
                <h3>${user.name}</h3>
                <p>${user.role}</p>
            </div>
            <nav>
                <button id="events-btn">Events</button>
                <button id="logout-btn">Logout</button>
            </nav>
        </aside>
        <main class="dashboard-main">
            <header class="dashboard-header">
                <h2>Events</h2>
                ${user.role === "admin" ? `<button id="add-event-btn">Add New Event</button>` : ""}
            </header>
            <table class="events-table">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Description</th>
                        <th>Capacity</th>
                        <th>Date</th>
                        <th>Actions</th>
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
                                <button class="edit-btn" data-id="${event.id}">✏️</button>
                                <button class="delete-btn" data-id="${event.id}">🗑️</button>
                            ` : `
                                <button class="enroll-btn" data-id="${event.id}">Inscribirse</button>
                                <button class="leave-btn" data-id="${event.id}">Salir</button>
                            `}
                        </td>
                    </tr>`).join('')}
                </tbody>
            </table>
        </main>
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
        })
    }

    // Event listeners for user actions
    if (user.role === "visitor") {
        document.querySelectorAll(".enroll-btn").forEach(button => {
            button.addEventListener("click", async () => {
                const eventId = button.dataset.id
                try {
                    const event = await api.get(`/events/${eventId}`)
                    if (event.capacity > 0) {
                        event.capacity -= 1
                        await api.put(`/events/${eventId}`, event)
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
                try {
                    const event = await api.get(`/events/${eventId}`)
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

    // Handle navigation to create event view
    if (path === "#/dashboard/events/create") {
        renderCreateEvent()
        return
    }
}