import { api } from "./api";
import { authentication } from "./auth";

export async function addEvent() {
    const app = document.getElementById("app");
    const user = authentication.getUserLocal();

    if (user.role !== "admin") {
        app.innerHTML = `<p>Acceso denegado. Solo los administradores pueden agregar eventos.</p>`;
        return;
    }

    app.innerHTML = `
        <section class="add-event">
            <h2>Agregar Evento</h2>
            <form id="add-event-form">
                <div class="form-group">
                    <label for="event-name">Nombre del Evento</label>
                    <input type="text" id="event-name" placeholder="Nombre del evento" required />
                </div>     
                <div class="form-group">
                    <label for="event-description">Descripción</label>
                    <textarea id="event-description" placeholder="Descripción del evento" required></textarea>
                </div>
                <div class="form-group">
                    <label for="event-capacity">Capacidad</label>
                    <input type="number" id="event-capacity" placeholder="Capacidad del evento" required />
                </div>
                <div class="form-group">
                    <label for="event-date">Fecha</label>
                    <input type="date" id="event-date" required />
                </div>
                <button type="submit">Agregar Evento</button>
            </form>
        </section>`;
    document.getElementById("add-event-form").onsubmit = async event => {
        event.preventDefault();
        const newEvent = {
            name: document.getElementById("event-name").value,
            description: document.getElementById("event-description").value,
            capacity: document.getElementById("event-capacity").value,
            date: document.getElementById("event-date").value
        };
        try {
            await api.post("/events", newEvent); 
            console.log("Evento agregado exitosamente!");
            location.hash = "#/dashboard"; 
        } catch (error) {
            console.error("Error al agregar el evento:", error);
        }
    }
    document.getElementById("logout-btn").addEventListener("click", () => {
        authentication.logoutUser();
        location.hash = "#/login";
    }
    );
    document.getElementById("add-event-btn").addEventListener("click", () => {
        location.hash = "#/dashboard/events/create";
    }
    );
    document.getElementById("go-to-login").addEventListener("click", () => {
        location.hash = "#/login";
        console.log("Login successful");
        router();
    }
    );
    document.getElementById("go-to-register").addEventListener("click", () => {
        location.hash = "#/register";
        console.log("Register successful");
        router();
    }
    );
}