-- ==========================================
-- 🎯 SISTEMA DE GESTIÓN DE EVENTOS
-- Script completo de creación de base de datos
-- ==========================================

-- Crear base de datos
CREATE DATABASE IF NOT EXISTS eventos_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE eventos_db;

-- ==========================================
-- TABLA: users
-- Gestión de usuarios del sistema
-- ==========================================
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL COMMENT 'Nombre completo del usuario',
    email VARCHAR(150) NOT NULL UNIQUE COMMENT 'Email único del usuario',
    password VARCHAR(255) NOT NULL COMMENT 'Contraseña hasheada',
    role ENUM('admin', 'user') DEFAULT 'user' NOT NULL COMMENT 'Rol del usuario',
    isActive BOOLEAN DEFAULT TRUE COMMENT 'Estado activo del usuario',
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de creación',
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Fecha de actualización',
    
    INDEX idx_email (email),
    INDEX idx_role (role),
    INDEX idx_active (isActive)
) ENGINE=InnoDB COMMENT='Tabla de usuarios del sistema';

-- ==========================================
-- TABLA: events
-- Gestión de eventos
-- ==========================================
CREATE TABLE IF NOT EXISTS events (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(200) NOT NULL COMMENT 'Nombre del evento',
    description TEXT COMMENT 'Descripción detallada del evento',
    date DATE NOT NULL COMMENT 'Fecha del evento',
    time TIME COMMENT 'Hora del evento',
    location VARCHAR(300) COMMENT 'Ubicación del evento',
    capacity INT NOT NULL DEFAULT 100 COMMENT 'Capacidad máxima',
    availableSlots INT NOT NULL DEFAULT 100 COMMENT 'Cupos disponibles',
    price DECIMAL(10,2) DEFAULT 0.00 COMMENT 'Precio del evento',
    category VARCHAR(100) COMMENT 'Categoría del evento',
    status ENUM('active', 'cancelled', 'completed') DEFAULT 'active' COMMENT 'Estado del evento',
    createdBy INT NOT NULL COMMENT 'ID del usuario que creó el evento',
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de creación',
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Fecha de actualización',
    
    FOREIGN KEY (createdBy) REFERENCES users(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    INDEX idx_date (date),
    INDEX idx_category (category),
    INDEX idx_status (status),
    INDEX idx_created_by (createdBy),
    CONSTRAINT chk_capacity_positive CHECK (capacity > 0),
    CONSTRAINT chk_available_slots_non_negative CHECK (availableSlots >= 0),
    CONSTRAINT chk_price_non_negative CHECK (price >= 0)
) ENGINE=InnoDB COMMENT='Tabla de eventos';

-- ==========================================
-- TABLA: registrations
-- Gestión de inscripciones a eventos
-- ==========================================
CREATE TABLE IF NOT EXISTS registrations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    userId INT NOT NULL COMMENT 'ID del usuario registrado',
    eventId INT NOT NULL COMMENT 'ID del evento',
    registrationDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de registro',
    status ENUM('confirmed', 'cancelled', 'attended') DEFAULT 'confirmed' COMMENT 'Estado del registro',
    paymentStatus ENUM('pending', 'paid', 'refunded') DEFAULT 'pending' COMMENT 'Estado del pago',
    notes TEXT COMMENT 'Notas adicionales',
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de creación',
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Fecha de actualización',
    
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (eventId) REFERENCES events(id) ON DELETE CASCADE ON UPDATE CASCADE,
    UNIQUE KEY unique_user_event (userId, eventId) COMMENT 'Un usuario solo puede registrarse una vez por evento',
    INDEX idx_user_id (userId),
    INDEX idx_event_id (eventId),
    INDEX idx_status (status),
    INDEX idx_payment_status (paymentStatus)
) ENGINE=InnoDB COMMENT='Tabla de registros de usuarios a eventos';

-- ==========================================
-- TRIGGERS: Gestión automática de cupos
-- ==========================================

-- Trigger para decrementar cupos al registrarse
DELIMITER //
CREATE TRIGGER tr_decrease_slots_on_registration
    AFTER INSERT ON registrations
    FOR EACH ROW
BEGIN
    IF NEW.status = 'confirmed' THEN
        UPDATE events 
        SET availableSlots = availableSlots - 1 
        WHERE id = NEW.eventId AND availableSlots > 0;
    END IF;
END//

-- Trigger para incrementar cupos al cancelar registro
CREATE TRIGGER tr_increase_slots_on_cancellation
    AFTER UPDATE ON registrations
    FOR EACH ROW
BEGIN
    -- Si el estado cambió de confirmed a cancelled
    IF OLD.status = 'confirmed' AND NEW.status = 'cancelled' THEN
        UPDATE events 
        SET availableSlots = availableSlots + 1 
        WHERE id = NEW.eventId AND availableSlots < capacity;
    END IF;
    -- Si el estado cambió de cancelled a confirmed
    IF OLD.status = 'cancelled' AND NEW.status = 'confirmed' THEN
        UPDATE events 
        SET availableSlots = availableSlots - 1 
        WHERE id = NEW.eventId AND availableSlots > 0;
    END IF;
END//

-- Trigger para incrementar cupos al eliminar registro
CREATE TRIGGER tr_increase_slots_on_deletion
    AFTER DELETE ON registrations
    FOR EACH ROW
BEGIN
    IF OLD.status = 'confirmed' THEN
        UPDATE events 
        SET availableSlots = availableSlots + 1 
        WHERE id = OLD.eventId AND availableSlots < capacity;
    END IF;
END//
DELIMITER ;

-- ==========================================
-- DATOS INICIALES
-- ==========================================

-- Insertar usuario administrador por defecto
INSERT INTO users (name, email, password, role) VALUES 
(
    'Administrador del Sistema',
    'admin@eventos.com',
    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- admin123
    'admin'
);

-- Insertar algunos usuarios de ejemplo
INSERT INTO users (name, email, password, role) VALUES 
(
    'Juan Pérez',
    'juan.perez@email.com',
    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- password
    'user'
),
(
    'María González',
    'maria.gonzalez@email.com',
    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- password
    'user'
),
(
    'Carlos Admin',
    'carlos.admin@eventos.com',
    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- password
    'admin'
);

-- Insertar eventos de ejemplo
INSERT INTO events (name, description, date, time, location, capacity, availableSlots, price, category, createdBy) VALUES 
(
    'Conferencia de Tecnología 2024',
    'Una conferencia sobre las últimas tendencias en tecnología y desarrollo de software.',
    '2024-06-15',
    '09:00:00',
    'Centro de Convenciones TechHub',
    200,
    200,
    25000.00,
    'Tecnología',
    1
),
(
    'Workshop de JavaScript Avanzado',
    'Taller práctico para desarrolladores que quieren profundizar en JavaScript moderno.',
    '2024-06-20',
    '14:00:00',
    'Aula Magna Universidad Nacional',
    50,
    50,
    15000.00,
    'Educación',
    1
),
(
    'Festival de Música Latina',
    'Una noche inolvidable con los mejores artistas de música latina.',
    '2024-07-05',
    '20:00:00',
    'Teatro Principal',
    300,
    300,
    45000.00,
    'Música',
    1
),
(
    'Feria de Emprendimiento Digital',
    'Conecta con emprendedores, inversionistas y expertos en startups.',
    '2024-07-12',
    '10:00:00',
    'Centro de Convenciones Empresarial',
    150,
    150,
    0.00,
    'Negocios',
    4
),
(
    'Curso de Cocina Internacional',
    'Aprende técnicas culinarias de diferentes culturas del mundo.',
    '2024-06-25',
    '16:00:00',
    'Instituto Culinario Gourmet',
    25,
    25,
    85000.00,
    'Gastronomía',
    4
);

-- Insertar algunas inscripciones de ejemplo
INSERT INTO registrations (userId, eventId, status, paymentStatus) VALUES 
(2, 1, 'confirmed', 'paid'),
(2, 2, 'confirmed', 'paid'),
(3, 1, 'confirmed', 'pending'),
(3, 3, 'confirmed', 'paid');

-- ==========================================
-- VISTAS ÚTILES
-- ==========================================

-- Vista de eventos con información del creador
CREATE VIEW v_events_with_creator AS
SELECT 
    e.id,
    e.name,
    e.description,
    e.date,
    e.time,
    e.location,
    e.capacity,
    e.availableSlots,
    e.price,
    e.category,
    e.status,
    u.name as creator_name,
    u.email as creator_email,
    e.createdAt,
    e.updatedAt
FROM events e
INNER JOIN users u ON e.createdBy = u.id;

-- Vista de inscripciones con detalles
CREATE VIEW v_registrations_detailed AS
SELECT 
    r.id,
    u.name as user_name,
    u.email as user_email,
    e.name as event_name,
    e.date as event_date,
    e.location as event_location,
    r.registrationDate,
    r.status,
    r.paymentStatus,
    e.price as event_price
FROM registrations r
INNER JOIN users u ON r.userId = u.id
INNER JOIN events e ON r.eventId = e.id;

-- Vista de estadísticas por evento
CREATE VIEW v_event_statistics AS
SELECT 
    e.id,
    e.name,
    e.capacity,
    e.availableSlots,
    (e.capacity - e.availableSlots) as registered_count,
    ROUND(((e.capacity - e.availableSlots) / e.capacity) * 100, 2) as occupancy_percentage,
    COUNT(r.id) as total_registrations,
    SUM(CASE WHEN r.status = 'confirmed' THEN 1 ELSE 0 END) as confirmed_registrations,
    SUM(CASE WHEN r.paymentStatus = 'paid' THEN e.price ELSE 0 END) as total_revenue
FROM events e
LEFT JOIN registrations r ON e.id = r.eventId
GROUP BY e.id, e.name, e.capacity, e.availableSlots, e.price;

-- ==========================================
-- PROCEDIMIENTOS ALMACENADOS
-- ==========================================

-- Procedimiento para obtener eventos disponibles
DELIMITER //
CREATE PROCEDURE sp_get_available_events()
BEGIN
    SELECT 
        e.id,
        e.name,
        e.description,
        e.date,
        e.time,
        e.location,
        e.availableSlots,
        e.capacity,
        e.price,
        e.category
    FROM events e
    WHERE e.status = 'active' 
      AND e.date >= CURDATE()
      AND e.availableSlots > 0
    ORDER BY e.date ASC;
END//

-- Procedimiento para registrar usuario en evento
CREATE PROCEDURE sp_register_user_to_event(
    IN p_user_id INT,
    IN p_event_id INT,
    OUT p_result VARCHAR(100)
)
BEGIN
    DECLARE v_available_slots INT;
    DECLARE v_existing_registration INT DEFAULT 0;
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SET p_result = 'Error: No se pudo completar el registro';
    END;
    
    START TRANSACTION;
    
    -- Verificar si ya está registrado
    SELECT COUNT(*) INTO v_existing_registration
    FROM registrations 
    WHERE userId = p_user_id AND eventId = p_event_id AND status = 'confirmed';
    
    IF v_existing_registration > 0 THEN
        SET p_result = 'Error: Usuario ya registrado en este evento';
        ROLLBACK;
    ELSE
        -- Verificar cupos disponibles
        SELECT availableSlots INTO v_available_slots
        FROM events 
        WHERE id = p_event_id AND status = 'active';
        
        IF v_available_slots > 0 THEN
            -- Insertar registro
            INSERT INTO registrations (userId, eventId, status, paymentStatus)
            VALUES (p_user_id, p_event_id, 'confirmed', 'pending');
            
            SET p_result = 'Éxito: Usuario registrado correctamente';
            COMMIT;
        ELSE
            SET p_result = 'Error: No hay cupos disponibles';
            ROLLBACK;
        END IF;
    END IF;
END//
DELIMITER ;

-- ==========================================
-- ÍNDICES ADICIONALES PARA OPTIMIZACIÓN
-- ==========================================

-- Índices compuestos para consultas frecuentes
CREATE INDEX idx_events_date_status ON events(date, status);
CREATE INDEX idx_events_category_status ON events(category, status);
CREATE INDEX idx_registrations_status_date ON registrations(status, registrationDate);

-- ==========================================
-- CONFIGURACIÓN DE SEGURIDAD
-- ==========================================

-- Crear usuario específico para la aplicación (opcional)
-- CREATE USER 'eventos_app'@'localhost' IDENTIFIED BY 'secure_password_here';
-- GRANT SELECT, INSERT, UPDATE, DELETE ON eventos_db.* TO 'eventos_app'@'localhost';
-- FLUSH PRIVILEGES;

-- ==========================================
-- VERIFICACIÓN DE LA INSTALACIÓN
-- ==========================================

-- Mostrar tablas creadas
SHOW TABLES;

-- Mostrar estructura de tablas principales
DESCRIBE users;
DESCRIBE events;
DESCRIBE registrations;

-- Contar registros iniciales
SELECT 'users' as tabla, COUNT(*) as registros FROM users
UNION ALL
SELECT 'events' as tabla, COUNT(*) as registros FROM events
UNION ALL
SELECT 'registrations' as tabla, COUNT(*) as registros FROM registrations;

-- ==========================================
-- ¡INSTALACIÓN COMPLETADA!
-- ==========================================

SELECT '¡Base de datos eventos_db configurada exitosamente!' as mensaje;
SELECT 'Usuario admin: admin@eventos.com | Contraseña: admin123' as credenciales;