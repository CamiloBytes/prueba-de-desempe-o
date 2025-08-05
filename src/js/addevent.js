import { api } from "./api.js";
import { authentication } from "./auth.js";
import { alertSuccess, alertError } from "./alert.js";

export async function addEvent() {
    const app = document.getElementById("app");
    const user = authentication.getUserLocal();

    if (!user || user.role !== "admin") {
        app.innerHTML = `
            <div class="error-container">
                <h3>❌ Acceso Denegado</h3>
                <p>Solo los administradores pueden agregar eventos.</p>
                <button onclick="location.hash='#/dashboard'" class="btn-primary">Volver al Dashboard</button>
            </div>`;
        return;
    }

    app.innerHTML = `
        <section class="add-event">
            <div class="form-container">
                <header class="form-header">
                    <h2>➕ Agregar Nuevo Evento</h2>
                    <button onclick="location.hash='#/dashboard'" class="btn-secondary">← Volver</button>
                </header>
                
                <form id="add-event-form" class="event-form">
                    <div class="form-row">
                        <div class="form-group">
                            <label for="event-name">Nombre del Evento *</label>
                            <input type="text" id="event-name" placeholder="Ej: Conferencia de Tecnología 2024" required />
                        </div>
                        <div class="form-group">
                            <label for="event-category">Categoría</label>
                            <select id="event-category">
                                <option value="">Seleccionar categoría</option>
                                <option value="Tecnología">Tecnología</option>
                                <option value="Educación">Educación</option>
                                <option value="Música">Música</option>
                                <option value="Negocios">Negocios</option>
                                <option value="Deportes">Deportes</option>
                                <option value="Arte">Arte</option>
                                <option value="Gastronomía">Gastronomía</option>
                                <option value="Salud">Salud</option>
                                <option value="Ciencia">Ciencia</option>
                                <option value="Cultura">Cultura</option>
                            </select>
                        </div>
                    </div>

                    <div class="form-group">
                        <label for="event-description">Descripción *</label>
                        <textarea id="event-description" rows="4" placeholder="Describe el evento, qué incluye, objetivos, etc." required></textarea>
                    </div>

                    <div class="form-row">
                        <div class="form-group">
                            <label for="event-date">Fecha *</label>
                            <input type="date" id="event-date" required />
                        </div>
                        <div class="form-group">
                            <label for="event-time">Hora</label>
                            <input type="time" id="event-time" />
                        </div>
                    </div>

                    <div class="form-group">
                        <label for="event-location">Ubicación</label>
                        <input type="text" id="event-location" placeholder="Ej: Centro de Convenciones, Bogotá" />
                    </div>

                    <div class="form-row">
                        <div class="form-group">
                            <label for="event-capacity">Capacidad *</label>
                            <input type="number" id="event-capacity" min="1" max="10000" placeholder="100" required />
                        </div>
                        <div class="form-group">
                            <label for="event-price">Precio (COP)</label>
                            <input type="number" id="event-price" min="0" step="0.01" placeholder="0.00" />
                        </div>
                    </div>

                    <div class="form-actions">
                        <button type="button" onclick="location.hash='#/dashboard'" class="btn-secondary">Cancelar</button>
                        <button type="submit" class="btn-success">✅ Crear Evento</button>
                    </div>
                </form>
            </div>
        </section>`;

    // Set minimum date to today
    const today = new Date().toISOString().split('T')[0];
    document.getElementById("event-date").min = today;

    // Form submission handler
    document.getElementById("add-event-form").onsubmit = async (event) => {
        event.preventDefault();
        
        const submitButton = event.target.querySelector('button[type="submit"]');
        const originalText = submitButton.innerHTML;
        
        try {
            // Disable submit button and show loading
            submitButton.disabled = true;
            submitButton.innerHTML = '<span class="loading"></span> Creando...';
            
            const newEvent = {
                name: document.getElementById("event-name").value.trim(),
                description: document.getElementById("event-description").value.trim(),
                date: document.getElementById("event-date").value,
                time: document.getElementById("event-time").value || null,
                location: document.getElementById("event-location").value.trim() || null,
                capacity: parseInt(document.getElementById("event-capacity").value),
                price: parseFloat(document.getElementById("event-price").value) || 0,
                category: document.getElementById("event-category").value || null
            };

            // Validate required fields
            if (!newEvent.name || !newEvent.description || !newEvent.date || !newEvent.capacity) {
                alertError("Por favor, completa todos los campos obligatorios (*)");
                return;
            }

            // Validate date is in the future
            const eventDate = new Date(newEvent.date);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            if (eventDate <= today) {
                alertError("La fecha del evento debe ser futura");
                return;
            }

            // Make API call
            const response = await api.post("/events", newEvent);
            
            if (response.success) {
                alertSuccess("🎉 Evento creado exitosamente!");
                setTimeout(() => {
                    location.hash = "#/dashboard";
                }, 1500);
            } else {
                alertError(response.message || "Error al crear el evento");
            }
            
        } catch (error) {
            console.error("Error al agregar el evento:", error);
            alertError("Error al crear el evento: " + error.message);
        } finally {
            // Re-enable submit button
            submitButton.disabled = false;
            submitButton.innerHTML = originalText;
        }
    };
}

