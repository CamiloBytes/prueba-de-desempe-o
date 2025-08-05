import User from './User.js';
import Event from './Event.js';
import Registration from './Registration.js';
import sequelize from '../config/database.js';

// Define associations
User.hasMany(Event, { foreignKey: 'createdBy', as: 'createdEvents' });
Event.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });

User.hasMany(Registration, { foreignKey: 'userId', as: 'registrations' });
Registration.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Event.hasMany(Registration, { foreignKey: 'eventId', as: 'registrations' });
Registration.belongsTo(Event, { foreignKey: 'eventId', as: 'event' });

// Many-to-many relationship through Registration
User.belongsToMany(Event, { 
    through: Registration, 
    foreignKey: 'userId', 
    otherKey: 'eventId',
    as: 'registeredEvents'
});

Event.belongsToMany(User, { 
    through: Registration, 
    foreignKey: 'eventId', 
    otherKey: 'userId',
    as: 'registeredUsers'
});

// Create tables and seed admin user
export async function createTables() {
    try {
        await sequelize.sync({ force: false });
        console.log('✅ Tablas sincronizadas correctamente.');
        
        // Create default admin user
        await createDefaultAdmin();
        
    } catch (error) {
        console.error('❌ Error al sincronizar tablas:', error);
        throw error;
    }
}

async function createDefaultAdmin() {
    try {
        const adminExists = await User.findOne({ 
            where: { 
                email: process.env.ADMIN_EMAIL || 'admin@eventos.com' 
            } 
        });
        
        if (!adminExists) {
            await User.create({
                name: 'Administrador',
                email: process.env.ADMIN_EMAIL || 'admin@eventos.com',
                password: process.env.ADMIN_PASSWORD || 'admin123',
                role: 'admin'
            });
            console.log('✅ Usuario administrador creado:', process.env.ADMIN_EMAIL || 'admin@eventos.com');
        }
    } catch (error) {
        console.error('❌ Error al crear usuario administrador:', error);
    }
}

export { User, Event, Registration, sequelize };
export default { User, Event, Registration, sequelize, createTables };