import express from 'express';
import { Event, Registration, User } from '../models/index.js';
import { authenticateToken, requireAdmin, requireUser } from '../middleware/auth.js';
import { Op } from 'sequelize';

const router = express.Router();

// Get all events (public access)
router.get('/', async (req, res) => {
    try {
        const { page = 1, limit = 10, status = 'active', category } = req.query;
        
        const whereClause = { status };
        if (category) {
            whereClause.category = category;
        }
        
        const events = await Event.findAndCountAll({
            where: whereClause,
            include: [{
                model: User,
                as: 'creator',
                attributes: ['id', 'name', 'email']
            }],
            limit: parseInt(limit),
            offset: (parseInt(page) - 1) * parseInt(limit),
            order: [['date', 'ASC']]
        });
        
        res.json({
            success: true,
            events: events.rows,
            pagination: {
                total: events.count,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(events.count / parseInt(limit))
            }
        });
        
    } catch (error) {
        console.error('Error al obtener eventos:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
});

// Get single event by ID
router.get('/:id', async (req, res) => {
    try {
        const event = await Event.findByPk(req.params.id, {
            include: [
                {
                    model: User,
                    as: 'creator',
                    attributes: ['id', 'name', 'email']
                },
                {
                    model: Registration,
                    as: 'registrations',
                    include: [{
                        model: User,
                        as: 'user',
                        attributes: ['id', 'name', 'email']
                    }]
                }
            ]
        });
        
        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Evento no encontrado'
            });
        }
        
        res.json({
            success: true,
            event
        });
        
    } catch (error) {
        console.error('Error al obtener evento:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
});

// Create new event (Admin only)
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const {
            name,
            description,
            date,
            time,
            location,
            capacity,
            price,
            category
        } = req.body;
        
        // Validate required fields
        if (!name || !date || !capacity) {
            return res.status(400).json({
                success: false,
                message: 'Nombre, fecha y capacidad son requeridos'
            });
        }
        
        // Validate future date
        if (new Date(date) <= new Date()) {
            return res.status(400).json({
                success: false,
                message: 'La fecha del evento debe ser futura'
            });
        }
        
        const event = await Event.create({
            name,
            description,
            date,
            time,
            location,
            capacity: parseInt(capacity),
            availableSlots: parseInt(capacity),
            price: parseFloat(price) || 0,
            category,
            createdBy: req.user.id
        });
        
        const eventWithCreator = await Event.findByPk(event.id, {
            include: [{
                model: User,
                as: 'creator',
                attributes: ['id', 'name', 'email']
            }]
        });
        
        res.status(201).json({
            success: true,
            message: 'Evento creado exitosamente',
            event: eventWithCreator
        });
        
    } catch (error) {
        console.error('Error al crear evento:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        });
    }
});

// Update event (Admin only)
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const event = await Event.findByPk(req.params.id);
        
        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Evento no encontrado'
            });
        }
        
        const {
            name,
            description,
            date,
            time,
            location,
            capacity,
            price,
            category,
            status
        } = req.body;
        
        // Validate future date if date is being updated
        if (date && new Date(date) <= new Date()) {
            return res.status(400).json({
                success: false,
                message: 'La fecha del evento debe ser futura'
            });
        }
        
        // Update event
        await event.update({
            name: name || event.name,
            description: description !== undefined ? description : event.description,
            date: date || event.date,
            time: time !== undefined ? time : event.time,
            location: location !== undefined ? location : event.location,
            capacity: capacity ? parseInt(capacity) : event.capacity,
            price: price !== undefined ? parseFloat(price) : event.price,
            category: category !== undefined ? category : event.category,
            status: status || event.status
        });
        
        const updatedEvent = await Event.findByPk(event.id, {
            include: [{
                model: User,
                as: 'creator',
                attributes: ['id', 'name', 'email']
            }]
        });
        
        res.json({
            success: true,
            message: 'Evento actualizado exitosamente',
            event: updatedEvent
        });
        
    } catch (error) {
        console.error('Error al actualizar evento:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        });
    }
});

// Delete event (Admin only)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const event = await Event.findByPk(req.params.id);
        
        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Evento no encontrado'
            });
        }
        
        // Delete associated registrations first
        await Registration.destroy({
            where: { eventId: req.params.id }
        });
        
        // Delete event
        await event.destroy();
        
        res.json({
            success: true,
            message: 'Evento eliminado exitosamente'
        });
        
    } catch (error) {
        console.error('Error al eliminar evento:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
});

// Register for event (Users only)
router.post('/:id/register', authenticateToken, requireUser, async (req, res) => {
    try {
        const eventId = req.params.id;
        const userId = req.user.id;
        
        // Check if event exists
        const event = await Event.findByPk(eventId);
        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Evento no encontrado'
            });
        }
        
        // Check if event is active
        if (event.status !== 'active') {
            return res.status(400).json({
                success: false,
                message: 'El evento no está disponible para registro'
            });
        }
        
        // Check if user already registered
        const existingRegistration = await Registration.findOne({
            where: { userId, eventId }
        });
        
        if (existingRegistration) {
            return res.status(400).json({
                success: false,
                message: 'Ya estás registrado en este evento'
            });
        }
        
        // Check available slots
        if (event.availableSlots <= 0) {
            return res.status(400).json({
                success: false,
                message: 'No hay cupos disponibles'
            });
        }
        
        // Create registration
        const registration = await Registration.create({
            userId,
            eventId,
            status: 'confirmed'
        });
        
        // Update available slots
        await event.update({
            availableSlots: event.availableSlots - 1
        });
        
        res.status(201).json({
            success: true,
            message: 'Registro exitoso',
            registration
        });
        
    } catch (error) {
        console.error('Error al registrar en evento:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
});

// Unregister from event (Users only)
router.delete('/:id/register', authenticateToken, requireUser, async (req, res) => {
    try {
        const eventId = req.params.id;
        const userId = req.user.id;
        
        // Find registration
        const registration = await Registration.findOne({
            where: { userId, eventId }
        });
        
        if (!registration) {
            return res.status(404).json({
                success: false,
                message: 'No estás registrado en este evento'
            });
        }
        
        // Find event
        const event = await Event.findByPk(eventId);
        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Evento no encontrado'
            });
        }
        
        // Delete registration
        await registration.destroy();
        
        // Update available slots
        await event.update({
            availableSlots: event.availableSlots + 1
        });
        
        res.json({
            success: true,
            message: 'Registro cancelado exitosamente'
        });
        
    } catch (error) {
        console.error('Error al cancelar registro:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
});

// Get user's registered events
router.get('/user/registrations', authenticateToken, requireUser, async (req, res) => {
    try {
        const registrations = await Registration.findAll({
            where: { userId: req.user.id },
            include: [{
                model: Event,
                as: 'event',
                include: [{
                    model: User,
                    as: 'creator',
                    attributes: ['id', 'name', 'email']
                }]
            }],
            order: [['createdAt', 'DESC']]
        });
        
        res.json({
            success: true,
            registrations
        });
        
    } catch (error) {
        console.error('Error al obtener registros del usuario:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
});

export default router;