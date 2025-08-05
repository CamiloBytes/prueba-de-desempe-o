#!/bin/bash

# ==========================================
# 🎯 SCRIPT DE INSTALACIÓN AUTOMÁTICA
# Sistema de Gestión de Eventos
# ==========================================

echo "🚀 Iniciando instalación de la base de datos..."
echo "=============================================="

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para imprimir mensajes coloridos
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Verificar si MySQL está instalado
check_mysql() {
    if command -v mysql &> /dev/null; then
        print_status "MySQL encontrado"
        return 0
    else
        print_error "MySQL no está instalado"
        print_info "Por favor instala MySQL primero:"
        echo "  Ubuntu/Debian: sudo apt install mysql-server"
        echo "  macOS: brew install mysql"
        echo "  Windows: Descargar desde https://dev.mysql.com/downloads/mysql/"
        return 1
    fi
}

# Verificar si MySQL está corriendo
check_mysql_running() {
    if mysqladmin ping &> /dev/null; then
        print_status "MySQL está corriendo"
        return 0
    else
        print_warning "MySQL no está corriendo. Intentando iniciar..."
        
        # Intentar iniciar MySQL
        if command -v systemctl &> /dev/null; then
            sudo systemctl start mysql
        elif command -v service &> /dev/null; then
            sudo service mysql start
        elif command -v brew &> /dev/null; then
            brew services start mysql
        fi
        
        sleep 3
        
        if mysqladmin ping &> /dev/null; then
            print_status "MySQL iniciado correctamente"
            return 0
        else
            print_error "No se pudo iniciar MySQL"
            return 1
        fi
    fi
}

# Función para crear la base de datos
create_database() {
    print_info "Creando base de datos 'eventos_db'..."
    
    # Pedir credenciales de MySQL
    echo -n "Usuario de MySQL (default: root): "
    read mysql_user
    mysql_user=${mysql_user:-root}
    
    echo -n "Contraseña de MySQL: "
    read -s mysql_password
    echo
    
    # Verificar conexión
    if mysql -u"$mysql_user" -p"$mysql_password" -e "SELECT 1;" &> /dev/null; then
        print_status "Conexión a MySQL exitosa"
    else
        print_error "No se pudo conectar a MySQL. Verifica las credenciales."
        return 1
    fi
    
    # Ejecutar script SQL
    print_info "Ejecutando script SQL..."
    
    if mysql -u"$mysql_user" -p"$mysql_password" < eventos_database.sql; then
        print_status "Base de datos creada exitosamente"
        echo
        echo "🎉 ¡INSTALACIÓN COMPLETADA!"
        echo "========================="
        echo "📋 Credenciales de acceso:"
        echo "   📧 Email: admin@eventos.com"
        echo "   🔑 Contraseña: admin123"
        echo
        echo "🔧 Configurar .env:"
        echo "   DB_HOST=localhost"
        echo "   DB_USER=$mysql_user"
        echo "   DB_PASSWORD=$mysql_password"
        echo "   DB_NAME=eventos_db"
        echo
        echo "🚀 Ejecutar aplicación:"
        echo "   npm run dev"
        echo
        return 0
    else
        print_error "Error al ejecutar el script SQL"
        return 1
    fi
}

# Función principal
main() {
    echo "🎯 Sistema de Gestión de Eventos - Instalador DB"
    echo "================================================"
    echo
    
    # Verificar MySQL
    if ! check_mysql; then
        exit 1
    fi
    
    # Verificar que MySQL esté corriendo
    if ! check_mysql_running; then
        exit 1
    fi
    
    # Verificar que el archivo SQL existe
    if [ ! -f "eventos_database.sql" ]; then
        print_error "Archivo eventos_database.sql no encontrado"
        print_info "Asegúrate de ejecutar este script desde el directorio del proyecto"
        exit 1
    fi
    
    # Crear base de datos
    if create_database; then
        print_status "Instalación completada exitosamente"
        echo
        print_info "Próximos pasos:"
        echo "1. Configurar archivo .env"
        echo "2. Ejecutar: npm install"
        echo "3. Ejecutar: npm run dev"
        echo "4. Abrir: http://localhost:5173"
    else
        print_error "La instalación falló"
        exit 1
    fi
}

# Ejecutar función principal
main "$@"