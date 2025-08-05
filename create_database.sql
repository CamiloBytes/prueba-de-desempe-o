-- ==========================================
-- 🎯 SISTEMA DE GESTIÓN DE EVENTOS
-- Query simplificado para crear base de datos
-- ==========================================

-- 1. CREAR BASE DE DATOS
CREATE DATABASE IF NOT EXISTS eventos_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE eventos_db;

-- 2. TABLA USUARIOS
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'user') DEFAULT 'user',
    isActive BOOLEAN DEFAULT TRUE,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 3. TABLA EVENTOS
CREATE TABLE events (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    date DATE NOT NULL,
    time TIME,
    location VARCHAR(300),
    capacity INT NOT NULL DEFAULT 100,
    availableSlots INT NOT NULL DEFAULT 100,
    price DECIMAL(10,2) DEFAULT 0.00,
    category VARCHAR(100),
    status ENUM('active', 'cancelled', 'completed') DEFAULT 'active',
    createdBy INT NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (createdBy) REFERENCES users(id)
);

-- 4. TABLA REGISTROS
CREATE TABLE registrations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    userId INT NOT NULL,
    eventId INT NOT NULL,
    registrationDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('confirmed', 'cancelled', 'attended') DEFAULT 'confirmed',
    paymentStatus ENUM('pending', 'paid', 'refunded') DEFAULT 'pending',
    notes TEXT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (eventId) REFERENCES events(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_event (userId, eventId)
);

-- 5. INSERTAR USUARIO ADMINISTRADOR
-- Contraseña: admin123 (hasheada con bcrypt)
INSERT INTO users (name, email, password, role) VALUES 
('Administrador', 'admin@eventos.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin');

-- 6. INSERTAR USUARIOS DE EJEMPLO
-- Contraseña para todos: password123
INSERT INTO users (name, email, password, role) VALUES 
('Juan Pérez', 'juan@email.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'user'),
('María García', 'maria@email.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'user'),
('Carlos Admin', 'carlos@eventos.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin');

-- 7. INSERTAR EVENTOS DE EJEMPLO
INSERT INTO events (name, description, date, time, location, capacity, availableSlots, price, category, createdBy) VALUES 
('Conferencia Tech 2024', 'Conferencia sobre tecnología y desarrollo', '2024-06-15', '09:00:00', 'Centro de Convenciones', 200, 200, 50000, 'Tecnología', 1),
('Workshop JavaScript', 'Taller práctico de JavaScript moderno', '2024-06-20', '14:00:00', 'Universidad Nacional', 50, 50, 25000, 'Educación', 1),
('Festival de Música', 'Noche de música en vivo', '2024-07-05', '20:00:00', 'Parque Central', 500, 500, 75000, 'Música', 1),
('Feria Empresarial', 'Networking y emprendimiento', '2024-07-12', '10:00:00', 'Centro Empresarial', 150, 150, 0, 'Negocios', 4),
('Curso de Cocina', 'Aprende cocina internacional', '2024-06-25', '16:00:00', 'Instituto Culinario', 30, 30, 120000, 'Gastronomía', 4);

-- 8. INSERTAR ALGUNAS INSCRIPCIONES
INSERT INTO registrations (userId, eventId, status, paymentStatus) VALUES 
(2, 1, 'confirmed', 'paid'),
(2, 2, 'confirmed', 'pending'),
(3, 1, 'confirmed', 'paid'),
(3, 3, 'confirmed', 'paid');

-- 9. ACTUALIZAR CUPOS DISPONIBLES
UPDATE events SET availableSlots = availableSlots - 2 WHERE id = 1;
UPDATE events SET availableSlots = availableSlots - 1 WHERE id = 2;
UPDATE events SET availableSlots = availableSlots - 1 WHERE id = 3;

-- 10. VERIFICAR INSTALACIÓN
SELECT 'Base de datos creada exitosamente!' as resultado;
SELECT COUNT(*) as total_usuarios FROM users;
SELECT COUNT(*) as total_eventos FROM events;
SELECT COUNT(*) as total_registros FROM registrations;