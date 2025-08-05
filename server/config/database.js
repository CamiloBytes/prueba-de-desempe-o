import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const sequelize = new Sequelize({
    dialect: 'mysql',
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    database: process.env.DB_NAME || 'eventos_db',
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    }
});

export async function connectDB() {
    try {
        await sequelize.authenticate();
        console.log('✅ Conexión a la base de datos establecida correctamente.');
        
        // Create database if it doesn't exist
        await sequelize.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME || 'eventos_db'}\``);
        console.log(`✅ Base de datos '${process.env.DB_NAME || 'eventos_db'}' verificada/creada.`);
        
    } catch (error) {
        console.error('❌ No se pudo conectar a la base de datos:', error);
        throw error;
    }
}

export default sequelize;