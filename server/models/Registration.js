import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Registration = sequelize.define('Registration', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    eventId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'events',
            key: 'id'
        }
    },
    registrationDate: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    status: {
        type: DataTypes.ENUM('confirmed', 'cancelled', 'attended'),
        defaultValue: 'confirmed'
    },
    paymentStatus: {
        type: DataTypes.ENUM('pending', 'paid', 'refunded'),
        defaultValue: 'pending'
    },
    notes: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    tableName: 'registrations',
    timestamps: true,
    indexes: [
        {
            unique: true,
            fields: ['userId', 'eventId']
        }
    ]
});

export default Registration;