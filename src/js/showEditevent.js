import { alertInfo, alertError } from './alert.js'
import { api } from './api.js'
import { authentication } from './auth.js'
import { router } from './router.js'

// Function to fetch event data
async function fetchEventData(eventId) {
    try {
        const event = await api.get(`/events/${eventId}`)
        return event
    } catch (error) {
        console.error('Error fetching event data:', error)
        throw error
    }
}

// Function to render the edit event view
export async function showEditevent(eventId) {
    const app = document.getElementById("app")

    if (!eventId) {
        alertInfo("ID de evento no proporcionado")
        return;
    }

    let event
    try {
        event = await fetchEventData(eventId)
    } catch {
        alertInfo("Evento no encontrado")
        return
    }

    if (!event || !event.name || !event.description || !event.capacity || !event.date) {
        alertInfo("Faltan datos del evento. Por favor, completa todos los campos.")
        return;
    }

    app.innerHTML = `
        <section class="edit-event">
            <h2>Editar Evento</h2>
            <form id="edit-event-form">
                <div class="form-group">
                    <label for="event-name">Nombre del Evento</label>
                    <input type="text" id="event-name" value="${event.name}" required />
                </div>
                <div class="form-group">
                    <label for="event-description">Descripción</label>
                    <textarea id="event-description" required>${event.description}</textarea>
                </div>
                <div class="form-group">
                    <label for="event-capacity">Capacidad</label>  
                    <input type="number" id="event-capacity" value="${event.capacity}" required />
                </div>
                <div class="form-group">
                    <label for="event-date">Fecha</label>
                    <input type="date" id="event-date" value="${event.date}" required />
                </div>
                <button type="submit">Actualizar Evento</button>
            </form>
        </section>`
        
    document.getElementById("edit-event-form").onsubmit = async e => {
        e.preventDefault();
        const updatedEvent = {
            name: document.getElementById("event-name").value,
            description: document.getElementById("event-description").value,
            capacity: document.getElementById("event-capacity").value,
            date: document.getElementById("event-date").value
        };
        
        try {
            await api.put(`/events/${eventId}`, updatedEvent);
            alertInfo("Evento actualizado exitosamente!");
            location.hash = "#/dashboard"; // Redirect to dashboard after update
        } catch (error) {
            console.error("Error al actualizar el evento:", error);
            alertError("Error al actualizar el evento");
        }
    }

    document.getElementById("logout-btn").addEventListener("click", () => {
        authentication.logout();
        location.hash = "#/login";
    });

    document.getElementById("add-event-btn").addEventListener("click", () => {
        location.hash = "#/dashboard/events/create";
    });

    document.getElementById("go-to-login").addEventListener("click", () => {
        location.hash = "#/login";
        console.log("Login successful");
        router();
    });
}

