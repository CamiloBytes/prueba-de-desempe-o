-- ==========================================
-- 🎯 SISTEMA DE GESTIÓN DE EVENTOS
-- Archivo SQL completo para crear la base de datos
-- ==========================================

-- Eliminar base de datos si existe (opcional - descomenta si quieres empezar desde cero)
-- DROP DATABASE IF EXISTS eventos_db;

-- 1. CREAR BASE DE DATOS
CREATE DATABASE IF NOT EXISTS eventos_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE eventos_db;

-- ==========================================
-- CREACIÓN DE TABLAS
-- ==========================================

-- 2. TABLA: users (Usuarios del sistema)
DROP TABLE IF EXISTS users;
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL COMMENT 'Nombre completo del usuario',
    email VARCHAR(150) NOT NULL UNIQUE COMMENT 'Email único del usuario',
    password VARCHAR(255) NOT NULL COMMENT 'Contraseña hasheada con bcrypt',
    role ENUM('admin', 'user') DEFAULT 'user' NOT NULL COMMENT 'Rol del usuario: admin o user',
    isActive BOOLEAN DEFAULT TRUE COMMENT 'Estado activo del usuario',
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de creación',
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Fecha de actualización',
    
    -- Índices para optimizar consultas
    INDEX idx_email (email),
    INDEX idx_role (role),
    INDEX idx_active (isActive)
) ENGINE=InnoDB COMMENT='Tabla de usuarios del sistema';

-- 3. TABLA: events (Eventos)
DROP TABLE IF EXISTS events;
CREATE TABLE events (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(200) NOT NULL COMMENT 'Nombre del evento',
    description TEXT COMMENT 'Descripción detallada del evento',
    date DATE NOT NULL COMMENT 'Fecha del evento',
    time TIME COMMENT 'Hora del evento',
    location VARCHAR(300) COMMENT 'Ubicación del evento',
    capacity INT NOT NULL DEFAULT 100 COMMENT 'Capacidad máxima del evento',
    availableSlots INT NOT NULL DEFAULT 100 COMMENT 'Cupos disponibles',
    price DECIMAL(10,2) DEFAULT 0.00 COMMENT 'Precio del evento en pesos',
    category VARCHAR(100) COMMENT 'Categoría del evento',
    status ENUM('active', 'cancelled', 'completed') DEFAULT 'active' COMMENT 'Estado del evento',
    createdBy INT NOT NULL COMMENT 'ID del usuario que creó el evento',
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de creación',
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Fecha de actualización',
    
    -- Claves foráneas
    FOREIGN KEY (createdBy) REFERENCES users(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    
    -- Índices para optimizar consultas
    INDEX idx_date (date),
    INDEX idx_category (category),
    INDEX idx_status (status),
    INDEX idx_created_by (createdBy),
    INDEX idx_date_status (date, status),
    
    -- Restricciones de integridad
    CONSTRAINT chk_capacity_positive CHECK (capacity > 0),
    CONSTRAINT chk_available_slots_non_negative CHECK (availableSlots >= 0),
    CONSTRAINT chk_price_non_negative CHECK (price >= 0),
    CONSTRAINT chk_available_slots_max CHECK (availableSlots <= capacity)
) ENGINE=InnoDB COMMENT='Tabla de eventos';

-- 4. TABLA: registrations (Inscripciones a eventos)
DROP TABLE IF EXISTS registrations;
CREATE TABLE registrations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    userId INT NOT NULL COMMENT 'ID del usuario registrado',
    eventId INT NOT NULL COMMENT 'ID del evento',
    registrationDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de registro',
    status ENUM('confirmed', 'cancelled', 'attended') DEFAULT 'confirmed' COMMENT 'Estado del registro',
    paymentStatus ENUM('pending', 'paid', 'refunded') DEFAULT 'pending' COMMENT 'Estado del pago',
    notes TEXT COMMENT 'Notas adicionales del registro',
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de creación',
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Fecha de actualización',
    
    -- Claves foráneas
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (eventId) REFERENCES events(id) ON DELETE CASCADE ON UPDATE CASCADE,
    
    -- Restricciones únicas
    UNIQUE KEY unique_user_event (userId, eventId) COMMENT 'Un usuario solo puede registrarse una vez por evento',
    
    -- Índices para optimizar consultas
    INDEX idx_user_id (userId),
    INDEX idx_event_id (eventId),
    INDEX idx_status (status),
    INDEX idx_payment_status (paymentStatus),
    INDEX idx_registration_date (registrationDate)
) ENGINE=InnoDB COMMENT='Tabla de inscripciones de usuarios a eventos';

-- ==========================================
-- TRIGGERS PARA GESTIÓN AUTOMÁTICA DE CUPOS
-- ==========================================

-- Trigger: Decrementar cupos al confirmar registro
DELIMITER //
DROP TRIGGER IF EXISTS tr_decrease_slots_on_registration//
CREATE TRIGGER tr_decrease_slots_on_registration
    AFTER INSERT ON registrations
    FOR EACH ROW
BEGIN
    IF NEW.status = 'confirmed' THEN
        UPDATE events 
        SET availableSlots = GREATEST(0, availableSlots - 1)
        WHERE id = NEW.eventId;
    END IF;
END//

-- Trigger: Gestionar cupos al actualizar registro
DROP TRIGGER IF EXISTS tr_manage_slots_on_update//
CREATE TRIGGER tr_manage_slots_on_update
    AFTER UPDATE ON registrations
    FOR EACH ROW
BEGIN
    -- Si cambió de confirmed a cancelled: incrementar cupos
    IF OLD.status = 'confirmed' AND NEW.status = 'cancelled' THEN
        UPDATE events 
        SET availableSlots = LEAST(capacity, availableSlots + 1)
        WHERE id = NEW.eventId;
    END IF;
    
    -- Si cambió de cancelled a confirmed: decrementar cupos
    IF OLD.status = 'cancelled' AND NEW.status = 'confirmed' THEN
        UPDATE events 
        SET availableSlots = GREATEST(0, availableSlots - 1)
        WHERE id = NEW.eventId;
    END IF;
END//

-- Trigger: Incrementar cupos al eliminar registro confirmado
DROP TRIGGER IF EXISTS tr_increase_slots_on_deletion//
CREATE TRIGGER tr_increase_slots_on_deletion
    AFTER DELETE ON registrations
    FOR EACH ROW
BEGIN
    IF OLD.status = 'confirmed' THEN
        UPDATE events 
        SET availableSlots = LEAST(capacity, availableSlots + 1)
        WHERE id = OLD.eventId;
    END IF;
END//
DELIMITER ;

-- ==========================================
-- INSERCIÓN DE DATOS INICIALES
-- ==========================================

-- 5. USUARIOS INICIALES
-- IMPORTANTE: Las contraseñas están hasheadas con bcrypt
-- admin@eventos.com = admin123
-- Otros usuarios = password123

INSERT INTO users (name, email, password, role) VALUES 
('Administrador del Sistema', 'admin@eventos.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin'),
('Juan Pérez González', 'juan@email.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'user'),
('María García López', 'maria@email.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'user'),
('Carlos Rodríguez Admin', 'carlos@eventos.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin'),
('Ana Martínez Silva', 'ana@email.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'user');

-- 6. EVENTOS DE EJEMPLO
INSERT INTO events (name, description, date, time, location, capacity, availableSlots, price, category, createdBy) VALUES 
(
    'Conferencia Internacional de Tecnología 2024',
    'La conferencia más importante de tecnología en Latinoamérica. Incluye talleres de IA, desarrollo web, y networking con expertos internacionales.',
    '2024-06-15',
    '09:00:00',
    'Centro de Convenciones Bogotá Plaza, Bogotá',
    250,
    250,
    150000.00,
    'Tecnología',
    1
),
(
    'Workshop Intensivo de JavaScript Moderno',
    'Aprende las últimas características de JavaScript ES6+, React, Node.js y desarrollo full-stack en 3 días intensivos.',
    '2024-06-20',
    '14:00:00',
    'Universidad Nacional de Colombia, Aula Magna',
    40,
    40,
    75000.00,
    'Educación',
    1
),
(
    'Festival de Música Latina 2024',
    'Una noche mágica con los mejores exponentes de la música latina. Artistas de Colombia, México, Argentina y más.',
    '2024-07-05',
    '20:00:00',
    'Parque Metropolitano Simón Bolívar, Bogotá',
    1000,
    1000,
    85000.00,
    'Música',
    4
),
(
    'Cumbre de Emprendimiento Digital',
    'Conecta con emprendedores exitosos, inversionistas y mentores. Incluye pitch sessions y networking premium.',
    '2024-07-12',
    '10:00:00',
    'Centro Empresarial Chapinero, Bogotá',
    120,
    120,
    0.00,
    'Negocios',
    4
),
(
    'Curso Magistral de Cocina Internacional',
    'Chef Michelin enseña técnicas de cocina francesa, italiana y asiática. Incluye degustación y certificado.',
    '2024-06-25',
    '16:00:00',
    'Instituto Culinario Mariano Moreno, Bogotá',
    25,
    25,
    320000.00,
    'Gastronomía',
    1
),
(
    'Maratón Benéfica "Corramos por la Educación"',
    'Carrera de 21K para recaudar fondos para becas universitarias. Incluye kit deportivo y medalla.',
    '2024-08-10',
    '06:00:00',
    'Parque Nacional Enrique Olaya Herrera, Bogotá',
    500,
    500,
    45000.00,
    'Deportes',
    4
),
(
    'Exposición de Arte Digital Inmersivo',
    'Experiencia única que combina arte tradicional con realidad virtual y aumentada. Para toda la familia.',
    '2024-07-20',
    '18:00:00',
    'Museo Nacional de Colombia, Bogotá',
    150,
    150,
    25000.00,
    'Arte',
    1
),
(
    'Congreso de Marketing Digital y E-commerce',
    'Las últimas tendencias en marketing online, redes sociales, SEO, y comercio electrónico. Speakers internacionales.',
    '2024-08-15',
    '09:00:00',
    'Hotel JW Marriott, Bogotá',
    200,
    200,
    180000.00,
    'Negocios',
    4
);

-- 7. INSCRIPCIONES DE EJEMPLO
INSERT INTO registrations (userId, eventId, status, paymentStatus, notes) VALUES 
(2, 1, 'confirmed', 'paid', 'Registro temprano con descuento'),
(2, 2, 'confirmed', 'pending', 'Esperando confirmación de pago'),
(3, 1, 'confirmed', 'paid', 'Participante VIP'),
(3, 3, 'confirmed', 'paid', 'Mesa preferencial solicitada'),
(5, 2, 'confirmed', 'paid', 'Estudiante con beca parcial'),
(5, 5, 'confirmed', 'pending', 'Lista de espera');

-- ==========================================
-- VISTAS ÚTILES PARA CONSULTAS
-- ==========================================

-- Vista: Eventos con información del creador
CREATE OR REPLACE VIEW v_events_detailed AS
SELECT 
    e.id,
    e.name,
    e.description,
    e.date,
    e.time,
    e.location,
    e.capacity,
    e.availableSlots,
    CONCAT('$', FORMAT(e.price, 0)) as formatted_price,
    e.price,
    e.category,
    e.status,
    u.name as creator_name,
    u.email as creator_email,
    e.createdAt,
    e.updatedAt,
    (e.capacity - e.availableSlots) as registered_count,
    ROUND(((e.capacity - e.availableSlots) / e.capacity) * 100, 1) as occupancy_percentage
FROM events e
INNER JOIN users u ON e.createdBy = u.id;

-- Vista: Inscripciones con detalles completos
CREATE OR REPLACE VIEW v_registrations_detailed AS
SELECT 
    r.id,
    u.name as user_name,
    u.email as user_email,
    e.name as event_name,
    e.date as event_date,
    e.time as event_time,
    e.location as event_location,
    r.registrationDate,
    r.status as registration_status,
    r.paymentStatus as payment_status,
    CONCAT('$', FORMAT(e.price, 0)) as event_price_formatted,
    e.price as event_price,
    r.notes
FROM registrations r
INNER JOIN users u ON r.userId = u.id
INNER JOIN events e ON r.eventId = e.id;

-- Vista: Estadísticas por evento
CREATE OR REPLACE VIEW v_event_statistics AS
SELECT 
    e.id,
    e.name,
    e.category,
    e.capacity,
    e.availableSlots,
    (e.capacity - e.availableSlots) as total_registered,
    ROUND(((e.capacity - e.availableSlots) / e.capacity) * 100, 1) as occupancy_percentage,
    COUNT(r.id) as total_registrations,
    SUM(CASE WHEN r.status = 'confirmed' THEN 1 ELSE 0 END) as confirmed_registrations,
    SUM(CASE WHEN r.status = 'cancelled' THEN 1 ELSE 0 END) as cancelled_registrations,
    SUM(CASE WHEN r.paymentStatus = 'paid' THEN e.price ELSE 0 END) as total_revenue,
    CONCAT('$', FORMAT(SUM(CASE WHEN r.paymentStatus = 'paid' THEN e.price ELSE 0 END), 0)) as revenue_formatted
FROM events e
LEFT JOIN registrations r ON e.id = r.eventId
GROUP BY e.id, e.name, e.category, e.capacity, e.availableSlots, e.price;

-- ==========================================
-- PROCEDIMIENTOS ALMACENADOS ÚTILES
-- ==========================================

-- Procedimiento: Obtener eventos disponibles
DELIMITER //
DROP PROCEDURE IF EXISTS sp_get_available_events//
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
        CONCAT('$', FORMAT(e.price, 0)) as price_formatted,
        e.price,
        e.category,
        u.name as creator_name
    FROM events e
    INNER JOIN users u ON e.createdBy = u.id
    WHERE e.status = 'active' 
      AND e.date >= CURDATE()
      AND e.availableSlots > 0
    ORDER BY e.date ASC, e.time ASC;
END//

-- Procedimiento: Estadísticas generales del sistema
DROP PROCEDURE IF EXISTS sp_system_stats//
CREATE PROCEDURE sp_system_stats()
BEGIN
    SELECT 
        (SELECT COUNT(*) FROM users WHERE isActive = TRUE) as active_users,
        (SELECT COUNT(*) FROM users WHERE role = 'admin') as admin_users,
        (SELECT COUNT(*) FROM events WHERE status = 'active') as active_events,
        (SELECT COUNT(*) FROM registrations WHERE status = 'confirmed') as confirmed_registrations,
        (SELECT SUM(price) FROM events e 
         INNER JOIN registrations r ON e.id = r.eventId 
         WHERE r.paymentStatus = 'paid') as total_revenue,
        (SELECT COUNT(*) FROM events WHERE date >= CURDATE()) as upcoming_events;
END//
DELIMITER ;

-- ==========================================
-- ÍNDICES ADICIONALES PARA OPTIMIZACIÓN
-- ==========================================

-- Índices compuestos para consultas frecuentes
CREATE INDEX idx_events_date_status ON events(date, status);
CREATE INDEX idx_events_category_status ON events(category, status);
CREATE INDEX idx_registrations_status_date ON registrations(status, registrationDate);
CREATE INDEX idx_registrations_payment_status ON registrations(paymentStatus, createdAt);

-- ==========================================
-- VERIFICACIÓN DE LA INSTALACIÓN
-- ==========================================

-- Mostrar información de las tablas creadas
SELECT 'TABLAS CREADAS EXITOSAMENTE' as mensaje;

SHOW TABLES;

-- Mostrar estructura de tablas principales
DESCRIBE users;
DESCRIBE events;
DESCRIBE registrations;

-- Contar registros en cada tabla
SELECT 
    'users' as tabla, 
    COUNT(*) as total_registros,
    COUNT(CASE WHEN role = 'admin' THEN 1 END) as admins,
    COUNT(CASE WHEN role = 'user' THEN 1 END) as usuarios
FROM users

UNION ALL

SELECT 
    'events' as tabla, 
    COUNT(*) as total_registros,
    COUNT(CASE WHEN status = 'active' THEN 1 END) as activos,
    COUNT(CASE WHEN date >= CURDATE() THEN 1 END) as futuros
FROM events

UNION ALL

SELECT 
    'registrations' as tabla, 
    COUNT(*) as total_registros,
    COUNT(CASE WHEN status = 'confirmed' THEN 1 END) as confirmados,
    COUNT(CASE WHEN paymentStatus = 'paid' THEN 1 END) as pagados
FROM registrations;

-- Mostrar algunos datos de ejemplo
SELECT 'DATOS DE EJEMPLO' as mensaje;

SELECT 'USUARIOS:' as seccion;
SELECT id, name, email, role FROM users LIMIT 5;

SELECT 'EVENTOS:' as seccion;
SELECT id, name, date, capacity, availableSlots, category FROM events LIMIT 5;

SELECT 'INSCRIPCIONES:' as seccion;
SELECT * FROM v_registrations_detailed LIMIT 5;

-- ==========================================
-- CREDENCIALES DE ACCESO
-- ==========================================

SELECT '========================================' as '';
SELECT '🎯 BASE DE DATOS CREADA EXITOSAMENTE!' as mensaje;
SELECT '========================================' as '';
SELECT '' as '';
SELECT '📋 CREDENCIALES DE ACCESO:' as '';
SELECT '👤 Email: admin@eventos.com' as '';
SELECT '🔑 Contraseña: admin123' as '';
SELECT '🛡️  Rol: Administrador' as '';
SELECT '' as '';
SELECT '📊 ESTADÍSTICAS:' as '';

CALL sp_system_stats();

SELECT '' as '';
SELECT '✅ ¡Sistema listo para usar!' as mensaje;
SELECT '🌐 Conecta tu aplicación a esta base de datos' as instruccion;