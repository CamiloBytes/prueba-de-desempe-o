import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Event = sequelize.define('Event', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING(200),
        allowNull: false,
        validate: {
            notEmpty: true,
            len: [3, 200]
        }
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    date: {
        type: DataTypes.DATE,
        allowNull: false,
        validate: {
            isDate: true,
            isAfter: new Date().toISOString().split('T')[0] // Must be future date
        }
    },
    time: {
        type: DataTypes.TIME,
        allowNull: true
    },
    location: {
        type: DataTypes.STRING(300),
        allowNull: true
    },
    capacity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 100,
        validate: {
            min: 1,
            max: 10000
        }
    },
    availableSlots: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 100
    },
    price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        defaultValue: 0.00,
        validate: {
            min: 0
        }
    },
    category: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    status: {
        type: DataTypes.ENUM('active', 'cancelled', 'completed'),
        defaultValue: 'active'
    },
    createdBy: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        }
    }
}, {
    tableName: 'events',
    timestamps: true,
    hooks: {
        beforeCreate: (event) => {
            event.availableSlots = event.capacity;
        },
        beforeUpdate: (event) => {
            if (event.changed('capacity')) {
                // Adjust available slots if capacity changes
                const currentRegistrations = event.capacity - event.availableSlots;
                event.availableSlots = Math.max(0, event.capacity - currentRegistrations);
            }
        }
    }
});

export default Event;