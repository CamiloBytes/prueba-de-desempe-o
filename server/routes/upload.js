import express from 'express';
import multer from 'multer';
import xlsx from 'xlsx';
import { Event, User } from '../models/index.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import sequelize from '../config/database.js';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = [
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'text/csv'
        ];
        
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Solo se permiten archivos Excel (.xlsx, .xls) y CSV'), false);
        }
    }
});

// Helper function to normalize column names
function normalizeColumnName(name) {
    if (!name) return 'columna_sin_nombre';
    
    return name
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '_')
        .replace(/[^a-z0-9_]/g, '')
        .replace(/^(\d)/, 'col_$1') // Add prefix if starts with number
        .substring(0, 64); // Limit length for MySQL
}

// Helper function to normalize data values
function normalizeValue(value) {
    if (value === null || value === undefined || value === '') {
        return null;
    }
    
    if (typeof value === 'string') {
        value = value.trim();
        if (value === '') return null;
        
        // Try to parse as number
        const numValue = parseFloat(value);
        if (!isNaN(numValue) && isFinite(numValue)) {
            return numValue;
        }
        
        // Try to parse as date
        const dateValue = new Date(value);
        if (!isNaN(dateValue.getTime())) {
            return dateValue;
        }
        
        return value;
    }
    
    return value;
}

// Helper function to detect data type
function detectDataType(values) {
    const nonNullValues = values.filter(v => v !== null && v !== undefined && v !== '');
    
    if (nonNullValues.length === 0) {
        return 'TEXT';
    }
    
    const allNumbers = nonNullValues.every(v => {
        const num = parseFloat(v);
        return !isNaN(num) && isFinite(num);
    });
    
    if (allNumbers) {
        const hasDecimals = nonNullValues.some(v => {
            const num = parseFloat(v);
            return num % 1 !== 0;
        });
        return hasDecimals ? 'DECIMAL(10,2)' : 'INT';
    }
    
    const allDates = nonNullValues.every(v => {
        const date = new Date(v);
        return !isNaN(date.getTime());
    });
    
    if (allDates) {
        return 'DATETIME';
    }
    
    const maxLength = Math.max(...nonNullValues.map(v => String(v).length));
    
    if (maxLength <= 255) {
        return 'VARCHAR(255)';
    } else {
        return 'TEXT';
    }
}

// Upload and process Excel file
router.post('/excel', authenticateToken, requireAdmin, upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No se ha enviado ningún archivo'
            });
        }
        
        const { tableName, createAsEvent = false } = req.body;
        
        if (!tableName) {
            return res.status(400).json({
                success: false,
                message: 'Nombre de tabla es requerido'
            });
        }
        
        // Parse Excel file
        const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        // Convert to JSON with header row
        const rawData = xlsx.utils.sheet_to_json(worksheet, { 
            raw: false,
            defval: null
        });
        
        if (rawData.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'El archivo Excel está vacío o no tiene datos válidos'
            });
        }
        
        // Get headers and normalize them
        const originalHeaders = Object.keys(rawData[0]);
        const headerMapping = {};
        const normalizedHeaders = originalHeaders.map(header => {
            const normalized = normalizeColumnName(header);
            headerMapping[header] = normalized;
            return normalized;
        });
        
        // Check for duplicate headers
        const duplicates = normalizedHeaders.filter((item, index) => 
            normalizedHeaders.indexOf(item) !== index
        );
        
        if (duplicates.length > 0) {
            return res.status(400).json({
                success: false,
                message: `Nombres de columna duplicados después de normalización: ${duplicates.join(', ')}`
            });
        }
        
        // Normalize data
        const normalizedData = rawData.map(row => {
            const normalizedRow = {};
            for (const [original, normalized] of Object.entries(headerMapping)) {
                normalizedRow[normalized] = normalizeValue(row[original]);
            }
            return normalizedRow;
        });
        
        // Detect data types for each column
        const columnTypes = {};
        for (const header of normalizedHeaders) {
            const columnValues = normalizedData.map(row => row[header]);
            columnTypes[header] = detectDataType(columnValues);
        }
        
        // Create table name (normalized)
        const normalizedTableName = normalizeColumnName(tableName);
        
        if (createAsEvent === 'true') {
            // Process as events data
            const eventsCreated = await processAsEvents(normalizedData, req.user.id);
            
            res.json({
                success: true,
                message: `${eventsCreated.length} eventos creados exitosamente`,
                data: {
                    tableName: 'events',
                    recordsProcessed: normalizedData.length,
                    eventsCreated: eventsCreated.length,
                    events: eventsCreated
                }
            });
        } else {
            // Create custom table
            await createCustomTable(normalizedTableName, columnTypes, normalizedData);
            
            res.json({
                success: true,
                message: `Tabla '${normalizedTableName}' creada exitosamente`,
                data: {
                    tableName: normalizedTableName,
                    columns: columnTypes,
                    recordsInserted: normalizedData.length,
                    headerMapping,
                    sample: normalizedData.slice(0, 5) // First 5 rows as sample
                }
            });
        }
        
    } catch (error) {
        console.error('Error procesando archivo Excel:', error);
        res.status(500).json({
            success: false,
            message: 'Error procesando archivo Excel',
            error: error.message
        });
    }
});

// Helper function to process data as events
async function processAsEvents(data, createdBy) {
    const eventsCreated = [];
    
    for (const row of data) {
        try {
            // Map common column names to event fields
            const eventData = {
                name: row.nombre || row.name || row.titulo || row.title || row.evento || `Evento ${Date.now()}`,
                description: row.descripcion || row.description || row.detalle || row.details || null,
                date: null,
                time: row.hora || row.time || null,
                location: row.ubicacion || row.location || row.lugar || row.direccion || null,
                capacity: parseInt(row.capacidad || row.capacity || row.cupos || 100),
                price: parseFloat(row.precio || row.price || row.costo || 0),
                category: row.categoria || row.category || row.tipo || row.type || null,
                createdBy
            };
            
            // Try to parse date from various possible column names
            const dateValue = row.fecha || row.date || row.when || row.cuando;
            if (dateValue) {
                const parsedDate = new Date(dateValue);
                if (!isNaN(parsedDate.getTime()) && parsedDate > new Date()) {
                    eventData.date = parsedDate;
                } else {
                    // Skip events with invalid or past dates
                    continue;
                }
            } else {
                // Skip events without date
                continue;
            }
            
            // Validate required fields
            if (!eventData.name || !eventData.date || !eventData.capacity) {
                continue;
            }
            
            const event = await Event.create(eventData);
            eventsCreated.push(event);
            
        } catch (error) {
            console.error('Error creando evento:', error);
            // Continue with next row
        }
    }
    
    return eventsCreated;
}

// Helper function to create custom table
async function createCustomTable(tableName, columnTypes, data) {
    const transaction = await sequelize.transaction();
    
    try {
        // Create table SQL
        const columnDefinitions = Object.entries(columnTypes)
            .map(([name, type]) => `\`${name}\` ${type}`)
            .join(', ');
        
        const createTableSQL = `
            CREATE TABLE IF NOT EXISTS \`${tableName}\` (
                id INT AUTO_INCREMENT PRIMARY KEY,
                ${columnDefinitions},
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `;
        
        await sequelize.query(createTableSQL, { transaction });
        
        // Insert data
        if (data.length > 0) {
            const columns = Object.keys(columnTypes);
            const placeholders = columns.map(() => '?').join(', ');
            const columnNames = columns.map(col => `\`${col}\``).join(', ');
            
            const insertSQL = `INSERT INTO \`${tableName}\` (${columnNames}) VALUES (${placeholders})`;
            
            for (const row of data) {
                const values = columns.map(col => row[col]);
                await sequelize.query(insertSQL, {
                    replacements: values,
                    transaction
                });
            }
        }
        
        await transaction.commit();
        
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
}

// Get list of custom tables
router.get('/tables', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const [results] = await sequelize.query(`
            SELECT TABLE_NAME as tableName, TABLE_COMMENT as comment
            FROM information_schema.TABLES 
            WHERE TABLE_SCHEMA = '${process.env.DB_NAME || 'eventos_db'}'
            AND TABLE_NAME NOT IN ('users', 'events', 'registrations', 'SequelizeMeta')
        `);
        
        res.json({
            success: true,
            tables: results
        });
        
    } catch (error) {
        console.error('Error obteniendo tablas:', error);
        res.status(500).json({
            success: false,
            message: 'Error obteniendo lista de tablas'
        });
    }
});

// Get data from custom table
router.get('/tables/:tableName', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { tableName } = req.params;
        const { page = 1, limit = 50 } = req.query;
        
        // Validate table name to prevent SQL injection
        if (!/^[a-zA-Z0-9_]+$/.test(tableName)) {
            return res.status(400).json({
                success: false,
                message: 'Nombre de tabla inválido'
            });
        }
        
        const offset = (parseInt(page) - 1) * parseInt(limit);
        
        // Get total count
        const [countResult] = await sequelize.query(`SELECT COUNT(*) as total FROM \`${tableName}\``);
        const total = countResult[0].total;
        
        // Get data
        const [data] = await sequelize.query(`
            SELECT * FROM \`${tableName}\` 
            LIMIT ${parseInt(limit)} OFFSET ${offset}
        `);
        
        res.json({
            success: true,
            data,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(total / parseInt(limit))
            }
        });
        
    } catch (error) {
        console.error('Error obteniendo datos de tabla:', error);
        res.status(500).json({
            success: false,
            message: 'Error obteniendo datos de la tabla'
        });
    }
});

// Delete custom table
router.delete('/tables/:tableName', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { tableName } = req.params;
        
        // Validate table name and prevent deletion of system tables
        if (!/^[a-zA-Z0-9_]+$/.test(tableName)) {
            return res.status(400).json({
                success: false,
                message: 'Nombre de tabla inválido'
            });
        }
        
        const systemTables = ['users', 'events', 'registrations', 'SequelizeMeta'];
        if (systemTables.includes(tableName)) {
            return res.status(403).json({
                success: false,
                message: 'No se pueden eliminar tablas del sistema'
            });
        }
        
        await sequelize.query(`DROP TABLE IF EXISTS \`${tableName}\``);
        
        res.json({
            success: true,
            message: `Tabla '${tableName}' eliminada exitosamente`
        });
        
    } catch (error) {
        console.error('Error eliminando tabla:', error);
        res.status(500).json({
            success: false,
            message: 'Error eliminando tabla'
        });
    }
});

export default router;