// editCourse.js
import { api } from './api.js';

// Function to fetch course data
async function fetchCourseData(eventId) {
    try {
        const response = await
        api.get(`/events/${eventId}`);
        return response;
    } catch (error) {
        console.error('Error fetching course data:', error);
        throw error;
    }
}

// Function to render the edit event view
export async function showEditevent(eventId) {    
    const app = document.getElementById("app");
    try {
        const event = await fetchCourseData(eventId); // Cambia 'course' por 'event' para mayor claridad
        app.innerHTML = `
        <section id="edit-event">
            <h2>Edit Event: ${event.name}</h2>
            <form id="edit-event-form">
                <input type="text" id="event-name" value="${event.name}" required />
                <textarea id="event-description">${event.description}</textarea>
                <input type="number" id="event-capacity" value="${event.capacity}" required />
                <input type="date" id="event-date" value="${event.date}" required />
                <button type="submit">Save Changes</button>
            </form>
        </section>`;

        // Handle form submission
        document.getElementById("edit-event-form").onsubmit = async event => {
            event.preventDefault();
            const updatedEvent = {
                name: document.getElementById("event-name").value,
                description: document.getElementById("event-description").value,
                capacity: document.getElementById("event-capacity").value,
                date: document.getElementById("event-date").value
            };
            try {
                await api.put(`/events/${eventId}`, updatedEvent); // Actualiza el evento en la API
                console.log("Event updated successfully!");
                location.hash = "#/dashboard"; // Redirige al dashboard
            } catch (error) {
                console.error("Error updating event:", error);
            }
        };
    } catch (error) {
        console.error('Error rendering edit event view:', error);
    }
}