import { api } from './api.js'
import { authentication } from './auth.js'
import { addEvent } from './addevent.js'
import { alertInfo, alertError, alertSuccess } from './alert.js'

export async function renderDashboard() {
    const app = document.getElementById("app")
    const user = authentication.getUserLocal()
    
    if (!user) {
        location.hash = "#/login"
        return
    }

    try {
        const response = await api.get("/events")
        const events = response.success ? response.events : []

        app.innerHTML = `
        <section class="dashboard">
            <header class="dashboard-header">
                <div class="header-info">
                    <h2>Dashboard de Eventos</h2>
                    <p>Bienvenido, ${user.name} (${user.role === 'admin' ? 'Administrador' : 'Usuario'})</p>
                </div>
                <div class="header-actions">
                    ${user.role === "admin" ? `
                        <button id="add-event-btn" class="btn-success">➕ Agregar Evento</button>
                        <button id="upload-excel-btn" class="btn-primary">📊 Cargar Excel</button>
                        <button id="manage-users-btn" class="btn-info">👥 Gestionar Usuarios</button>
                    ` : ""}
                    <button id="my-registrations-btn" class="btn-info">📋 Mis Registros</button>
                    <button id="logout-btn" class="btn-danger">🚪 Cerrar Sesión</button>
                </div>
            </header>
            
            ${events.length === 0 ? `
                <div class="empty-state">
                    <h3>No hay eventos disponibles</h3>
                    <p>¡Pronto habrá eventos emocionantes aquí!</p>
                    ${user.role === "admin" ? `
                        <button class="btn-primary" onclick="location.hash='#/dashboard/events/create'">
                            Crear primer evento
                        </button>
                    ` : ""}
                </div>
            ` : `
                <div class="events-grid">
                    ${events.map(event => `
                    <div class="event-card" data-event-id="${event.id}">
                        <div class="event-header">
                            <h3>${event.name || 'Sin título'}</h3>
                            <span class="event-status status-${event.status || 'active'}">${event.status || 'activo'}</span>
                        </div>
                        <div class="event-details">
                            <p class="event-description">${event.description || 'Sin descripción'}</p>
                            <div class="event-meta">
                                <div class="meta-item">
                                    <span class="meta-label">📅 Fecha:</span>
                                    <span class="meta-value">${event.date ? new Date(event.date).toLocaleDateString('es-ES') : 'Sin fecha'}</span>
                                </div>
                                ${event.time ? `
                                <div class="meta-item">
                                    <span class="meta-label">🕒 Hora:</span>
                                    <span class="meta-value">${event.time}</span>
                                </div>
                                ` : ''}
                                ${event.location ? `
                                <div class="meta-item">
                                    <span class="meta-label">📍 Lugar:</span>
                                    <span class="meta-value">${event.location}</span>
                                </div>
                                ` : ''}
                                <div class="meta-item">
                                    <span class="meta-label">👥 Disponibles:</span>
                                    <span class="meta-value">${event.availableSlots || 0} / ${event.capacity || 0}</span>
                                </div>
                                ${event.price && event.price > 0 ? `
                                <div class="meta-item">
                                    <span class="meta-label">💰 Precio:</span>
                                    <span class="meta-value">$${parseFloat(event.price).toFixed(2)}</span>
                                </div>
                                ` : ''}
                                ${event.category ? `
                                <div class="meta-item">
                                    <span class="meta-label">🏷️ Categoría:</span>
                                    <span class="meta-value">${event.category}</span>
                                </div>
                                ` : ''}
                            </div>
                        </div>
                        <div class="event-actions">
                            ${user.role === "admin" ? `
                                <button class="edit-btn btn-warning" data-id="${event.id}">✏️ Editar</button>
                                <button class="delete-btn btn-danger" data-id="${event.id}">🗑️ Eliminar</button>
                            ` : `
                                <button class="enroll-btn btn-success" data-id="${event.id}" 
                                        ${(event.availableSlots || 0) <= 0 ? 'disabled' : ''}>
                                    ${(event.availableSlots || 0) <= 0 ? '❌ Agotado' : '✅ Inscribirse'}
                                </button>
                                <button class="leave-btn btn-warning" data-id="${event.id}">❌ Cancelar Registro</button>
                            `}
                        </div>
                    </div>`).join('')}
                </div>
            `}
        </section>
        
        <!-- Upload Excel Modal -->
        <div id="upload-modal" class="modal" style="display: none;">
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Cargar Archivo Excel</h3>
                    <span class="close-modal" id="close-upload-modal">&times;</span>
                </div>
                <div class="modal-body">
                    <form id="upload-form">
                        <div class="form-group">
                            <label for="excel-file">Seleccionar archivo Excel:</label>
                            <input type="file" id="excel-file" name="file" accept=".xlsx,.xls,.csv" required>
                        </div>
                        <div class="form-group">
                            <label for="table-name">Nombre de la tabla:</label>
                            <input type="text" id="table-name" name="tableName" placeholder="ej: eventos_2024" required>
                        </div>
                        <div class="form-group">
                            <label>
                                <input type="checkbox" id="create-as-event" name="createAsEvent" value="true">
                                Crear como eventos (intentar mapear columnas a eventos)
                            </label>
                        </div>
                        <div class="form-actions">
                            <button type="submit" class="btn-primary">📤 Cargar Archivo</button>
                            <button type="button" class="btn-secondary" id="cancel-upload">Cancelar</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>`

        // Event listeners for admin actions
        if (user.role === "admin") {
            setupAdminEventListeners()
        }

        // Event listeners for user actions
        if (user.role === "user" || user.role === "admin") {
            setupUserEventListeners()
        }

        // Common event listeners
        setupCommonEventListeners()

    } catch (error) {
        console.error("Error loading dashboard:", error)
        alertError("Error al cargar el dashboard: " + error.message)
    }
}

function setupAdminEventListeners() {
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
                if (!confirm("¿Estás seguro de que quieres eliminar este evento?")) {
                    return 
                }
                
                const response = await api.delete(`/events/${eventId}`)
                if (response.success) {
                    alertSuccess("Evento eliminado exitosamente")
                    renderDashboard() // Refresh the dashboard
                } else {
                    alertError(response.message || "Error al eliminar evento")
                }
            } catch (error) {
                console.error("Error deleting event:", error)
                alertError("Error al eliminar evento: " + error.message)
            }
        })
    })

    document.getElementById("add-event-btn")?.addEventListener("click", () => {
        location.hash = "#/dashboard/events/create"
    })

    document.getElementById("upload-excel-btn")?.addEventListener("click", () => {
        document.getElementById("upload-modal").style.display = "block"
    })

    document.getElementById("manage-users-btn")?.addEventListener("click", () => {
        location.hash = "#/dashboard/users"
    })

    // Upload modal event listeners
    document.getElementById("close-upload-modal")?.addEventListener("click", () => {
        document.getElementById("upload-modal").style.display = "none"
    })

    document.getElementById("cancel-upload")?.addEventListener("click", () => {
        document.getElementById("upload-modal").style.display = "none"
    })

    document.getElementById("upload-form")?.addEventListener("submit", async (e) => {
        e.preventDefault()
        
        const formData = new FormData()
        const fileInput = document.getElementById("excel-file")
        const tableNameInput = document.getElementById("table-name")
        const createAsEventInput = document.getElementById("create-as-event")
        
        if (!fileInput.files[0]) {
            alertError("Por favor selecciona un archivo")
            return
        }
        
        formData.append("file", fileInput.files[0])
        formData.append("tableName", tableNameInput.value)
        formData.append("createAsEvent", createAsEventInput.checked)
        
        try {
            const response = await api.uploadFile("/upload/excel", formData)
            if (response.success) {
                alertSuccess(response.message)
                document.getElementById("upload-modal").style.display = "none"
                document.getElementById("upload-form").reset()
                renderDashboard() // Refresh to show new events if created
            } else {
                alertError(response.message || "Error al cargar archivo")
            }
        } catch (error) {
            console.error("Error uploading file:", error)
            alertError("Error al cargar archivo: " + error.message)
        }
    })
}

function setupUserEventListeners() {
    document.querySelectorAll(".enroll-btn").forEach(button => {
        button.addEventListener("click", async () => {
            const eventId = button.dataset.id
            try {
                const response = await api.post(`/events/${eventId}/register`)
                if (response.success) {
                    alertSuccess("¡Registro exitoso!")
                    renderDashboard() // Refresh the dashboard
                } else {
                    alertError(response.message || "Error al registrarse")
                }
            } catch (error) {
                console.error("Error al inscribirse:", error)
                alertError("Error al inscribirse: " + error.message)
            }
        })
    })

    document.querySelectorAll(".leave-btn").forEach(button => {
        button.addEventListener("click", async () => {
            const eventId = button.dataset.id
            try {
                if (!confirm("¿Estás seguro de que quieres cancelar tu registro?")) {
                    return
                }
                
                const response = await api.delete(`/events/${eventId}/register`)
                if (response.success) {
                    alertSuccess("Registro cancelado exitosamente")
                    renderDashboard() // Refresh the dashboard
                } else {
                    alertError(response.message || "Error al cancelar registro")
                }
            } catch (error) {
                console.error("Error al cancelar registro:", error)
                alertError("Error al cancelar registro: " + error.message)
            }
        })
    })

    document.getElementById("my-registrations-btn")?.addEventListener("click", () => {
        location.hash = "#/dashboard/registrations"
    })
}

function setupCommonEventListeners() {
    // Logout functionality
    document.getElementById("logout-btn")?.addEventListener("click", async () => {
        try {
            await authentication.logout()
            location.hash = "#/login"
        } catch (error) {
            console.error("Error during logout:", error)
            // Force logout even if server call fails
            localStorage.removeItem("user")
            location.hash = "#/login"
        }
    })

    // Close modal when clicking outside
    window.addEventListener("click", (e) => {
        const modal = document.getElementById("upload-modal")
        if (e.target === modal) {
            modal.style.display = "none"
        }
    })
}