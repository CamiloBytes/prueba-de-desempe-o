import express from 'express';
import { User, Registration, Event } from '../models/index.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import { Op } from 'sequelize';

const router = express.Router();

// Get all users (Admin only)
router.get('/', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { page = 1, limit = 10, role, isActive } = req.query;
        
        const whereClause = {};
        if (role) whereClause.role = role;
        if (isActive !== undefined) whereClause.isActive = isActive === 'true';
        
        const users = await User.findAndCountAll({
            where: whereClause,
            attributes: { exclude: ['password'] },
            include: [{
                model: Registration,
                as: 'registrations',
                include: [{
                    model: Event,
                    as: 'event',
                    attributes: ['id', 'name', 'date']
                }]
            }],
            limit: parseInt(limit),
            offset: (parseInt(page) - 1) * parseInt(limit),
            order: [['createdAt', 'DESC']]
        });
        
        res.json({
            success: true,
            users: users.rows,
            pagination: {
                total: users.count,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(users.count / parseInt(limit))
            }
        });
        
    } catch (error) {
        console.error('Error al obtener usuarios:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
});

// Get single user by ID (Admin only)
router.get('/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id, {
            attributes: { exclude: ['password'] },
            include: [{
                model: Registration,
                as: 'registrations',
                include: [{
                    model: Event,
                    as: 'event'
                }]
            }, {
                model: Event,
                as: 'createdEvents'
            }]
        });
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }
        
        res.json({
            success: true,
            user
        });
        
    } catch (error) {
        console.error('Error al obtener usuario:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
});

// Update user (Admin only)
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }
        
        const { name, email, role, isActive } = req.body;
        
        // Check if email is already taken by another user
        if (email && email !== user.email) {
            const existingUser = await User.findOne({ where: { email } });
            if (existingUser) {
                return res.status(400).json({
                    success: false,
                    message: 'El email ya está en uso por otro usuario'
                });
            }
        }
        
        // Update user
        await user.update({
            name: name || user.name,
            email: email || user.email,
            role: role || user.role,
            isActive: isActive !== undefined ? isActive : user.isActive
        });
        
        res.json({
            success: true,
            message: 'Usuario actualizado exitosamente',
            user: user.toSafeObject()
        });
        
    } catch (error) {
        console.error('Error al actualizar usuario:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
});

// Delete user (Admin only)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }
        
        // Prevent deleting the last admin
        if (user.role === 'admin') {
            const adminCount = await User.count({ where: { role: 'admin' } });
            if (adminCount <= 1) {
                return res.status(400).json({
                    success: false,
                    message: 'No se puede eliminar el último administrador'
                });
            }
        }
        
        // Delete user's registrations first
        await Registration.destroy({
            where: { userId: req.params.id }
        });
        
        // Update events created by this user to maintain referential integrity
        await Event.update(
            { createdBy: req.user.id }, // Assign to current admin
            { where: { createdBy: req.params.id } }
        );
        
        // Delete user
        await user.destroy();
        
        res.json({
            success: true,
            message: 'Usuario eliminado exitosamente'
        });
        
    } catch (error) {
        console.error('Error al eliminar usuario:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
});

// Get user statistics (Admin only)
router.get('/stats/overview', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const totalUsers = await User.count();
        const activeUsers = await User.count({ where: { isActive: true } });
        const adminUsers = await User.count({ where: { role: 'admin' } });
        const regularUsers = await User.count({ where: { role: 'user' } });
        
        const totalRegistrations = await Registration.count();
        const recentRegistrations = await Registration.count({
            where: {
                createdAt: {
                    [Op.gte]: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
                }
            }
        });
        
        res.json({
            success: true,
            stats: {
                users: {
                    total: totalUsers,
                    active: activeUsers,
                    inactive: totalUsers - activeUsers,
                    admins: adminUsers,
                    regular: regularUsers
                },
                registrations: {
                    total: totalRegistrations,
                    recent: recentRegistrations
                }
            }
        });
        
    } catch (error) {
        console.error('Error al obtener estadísticas:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
});

export default router;