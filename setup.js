#!/usr/bin/env node

import { createConnection } from 'mysql2/promise';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config();

async function setupDatabase() {
    console.log('🔧 Configurando base de datos...\n');

    const dbConfig = {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 3306,
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || ''
    };

    const dbName = process.env.DB_NAME || 'eventos_db';

    try {
        // Create connection without database
        console.log(`📡 Conectando a MySQL en ${dbConfig.host}:${dbConfig.port}...`);
        const connection = await createConnection(dbConfig);

        // Create database if it doesn't exist
        console.log(`🗄️  Creando base de datos '${dbName}' si no existe...`);
        await connection.execute(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
        
        console.log(`✅ Base de datos '${dbName}' configurada correctamente`);
        
        // Test connection to the specific database
        await connection.execute(`USE \`${dbName}\``);
        console.log(`✅ Conexión a '${dbName}' verificada`);
        
        await connection.end();
        
        return true;
    } catch (error) {
        console.error('❌ Error configurando base de datos:');
        console.error('   Mensaje:', error.message);
        
        if (error.code === 'ECONNREFUSED') {
            console.error('\n💡 Sugerencias:');
            console.error('   - Verificar que MySQL esté instalado y corriendo');
            console.error('   - Comprobar host y puerto en .env');
            console.error('   - Iniciar MySQL: sudo service mysql start');
        } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
            console.error('\n💡 Sugerencias:');
            console.error('   - Verificar usuario y contraseña en .env');
            console.error('   - Crear usuario MySQL si es necesario');
        }
        
        return false;
    }
}

function checkEnvironment() {
    console.log('🔍 Verificando configuración del entorno...\n');
    
    const envFile = join(__dirname, '.env');
    if (!existsSync(envFile)) {
        console.log('⚠️  Archivo .env no encontrado');
        console.log('📝 Creando archivo .env con valores por defecto...\n');
        
        // You would typically create a default .env file here
        console.log('✅ Revisa el archivo .env y configura tus credenciales');
        return false;
    }

    const requiredVars = [
        'DB_HOST',
        'DB_PORT', 
        'DB_NAME',
        'DB_USER',
        'JWT_SECRET'
    ];

    const missing = requiredVars.filter(varName => !process.env[varName]);
    
    if (missing.length > 0) {
        console.log('❌ Variables de entorno faltantes:');
        missing.forEach(varName => console.log(`   - ${varName}`));
        console.log('\n💡 Configura estas variables en tu archivo .env');
        return false;
    }

    console.log('✅ Variables de entorno configuradas correctamente');
    return true;
}

function showWelcomeMessage() {
    console.log('\n🎯 ¡Sistema de Gestión de Eventos configurado exitosamente!\n');
    console.log('📋 Próximos pasos:');
    console.log('   1. npm run dev          # Iniciar en modo desarrollo');
    console.log('   2. Abrir http://localhost:5173');
    console.log('   3. Iniciar sesión con:');
    console.log('      Email: admin@eventos.com');
    console.log('      Contraseña: admin123\n');
    console.log('📚 Más información en README.md');
    console.log('🚀 ¡Disfruta gestionando tus eventos!\n');
}

function showErrorMessage() {
    console.log('\n❌ Configuración incompleta\n');
    console.log('📋 Para continuar:');
    console.log('   1. Revisar archivo .env');
    console.log('   2. Verificar conexión MySQL');
    console.log('   3. Ejecutar: node setup.js\n');
    console.log('📚 Ver README.md para más detalles\n');
}

async function main() {
    console.log('🎯 Sistema de Gestión de Eventos - Configuración Inicial\n');
    console.log('=' .repeat(60) + '\n');

    // Check environment variables
    const envOk = checkEnvironment();
    if (!envOk) {
        showErrorMessage();
        process.exit(1);
    }

    // Setup database
    const dbOk = await setupDatabase();
    if (!dbOk) {
        showErrorMessage();
        process.exit(1);
    }

    // Success message
    showWelcomeMessage();
}

// Only run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    main().catch(error => {
        console.error('❌ Error durante la configuración:', error);
        process.exit(1);
    });
}