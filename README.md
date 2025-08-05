# 🎯 Sistema de Gestión de Eventos

Un sistema completo de gestión de eventos con roles de usuario, carga de archivos Excel, y funcionalidades CRUD. Construido con Express.js, MySQL y Vanilla JavaScript.

## ✨ Características Principales

### 👨‍💼 Para Administradores
- 📊 **Carga de archivos Excel**: Normaliza datos automáticamente y crea tablas en la base de datos
- ✏️ **CRUD completo de eventos**: Crear, leer, actualizar y eliminar eventos
- 👥 **Gestión de usuarios**: Administrar usuarios del sistema
- 📈 **Dashboard administrativo**: Vista completa de estadísticas y gestión
- 🔄 **Conversión automática**: Convierte datos de Excel a eventos automáticamente

### 👤 Para Usuarios
- 👀 **Visualización de eventos**: Ver todos los eventos disponibles
- ✅ **Registro en eventos**: Inscribirse en eventos de interés
- ❌ **Cancelación de registros**: Cancelar inscripciones cuando sea necesario
- 📋 **Mis registros**: Ver historial de eventos registrados

### 🔐 Sistema de Autenticación
- 🔑 **JWT Tokens**: Autenticación segura con tokens
- 🛡️ **Roles de usuario**: Admin y Usuario con permisos específicos
- 🔒 **Middleware de protección**: Rutas protegidas por rol

## 🚀 Instalación y Configuración

### Prerrequisitos
- Node.js (v16 o superior)
- MySQL/MariaDB
- Git

### 1. Clonar y preparar el proyecto
```bash
# Clonar el repositorio
git clone <tu-repositorio>
cd evento-management-system

# Instalar dependencias
npm install
```

### 2. Configurar la base de datos
```bash
# Crear base de datos en MySQL
mysql -u root -p
CREATE DATABASE eventos_db;
EXIT;
```

### 3. Configurar variables de entorno
Edita el archivo `.env` con tus configuraciones:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_NAME=eventos_db
DB_USER=root
DB_PASSWORD=tu_password_mysql

# JWT Configuration
JWT_SECRET=tu_clave_secreta_muy_segura_aqui
JWT_EXPIRE=7d

# Server Configuration
PORT=3001
NODE_ENV=development

# Admin Default User
ADMIN_EMAIL=admin@eventos.com
ADMIN_PASSWORD=admin123
```

### 4. Iniciar el proyecto
```bash
# Desarrollo (inicia backend y frontend simultáneamente)
npm run dev

# Solo backend
npm run server

# Solo frontend
npm run client
```

## 🌐 Acceso al Sistema

### URLs
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001/api
- **Health Check**: http://localhost:3001/api/health

### Credenciales por defecto
- **Email**: admin@eventos.com
- **Contraseña**: admin123
- **Rol**: Administrador

## 📁 Estructura del Proyecto

```
/
├── server/                 # Backend Express.js
│   ├── config/            # Configuración de base de datos
│   ├── models/            # Modelos Sequelize
│   ├── routes/            # Rutas API
│   ├── middleware/        # Middlewares de autenticación
│   └── index.js           # Servidor principal
├── src/                   # Frontend
│   ├── js/                # Lógica JavaScript
│   │   ├── api.js         # Cliente API
│   │   ├── auth.js        # Autenticación
│   │   ├── renderDashboard.js # Dashboard principal
│   │   └── views.js       # Vistas de la aplicación
│   └── css/               # Estilos CSS
├── public/                # Archivos estáticos
├── .env                   # Variables de entorno
└── package.json          # Dependencias y scripts
```

## 🔄 API Endpoints

### Autenticación
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/register` - Registrar usuario
- `GET /api/auth/profile` - Obtener perfil actual
- `POST /api/auth/logout` - Cerrar sesión

### Eventos
- `GET /api/events` - Listar eventos
- `GET /api/events/:id` - Obtener evento específico
- `POST /api/events` - Crear evento (Admin)
- `PUT /api/events/:id` - Actualizar evento (Admin)
- `DELETE /api/events/:id` - Eliminar evento (Admin)
- `POST /api/events/:id/register` - Registrarse en evento
- `DELETE /api/events/:id/register` - Cancelar registro

### Usuarios (Admin)
- `GET /api/users` - Listar usuarios
- `GET /api/users/:id` - Obtener usuario específico
- `PUT /api/users/:id` - Actualizar usuario
- `DELETE /api/users/:id` - Eliminar usuario
- `GET /api/users/stats/overview` - Estadísticas

### Carga de archivos (Admin)
- `POST /api/upload/excel` - Cargar archivo Excel
- `GET /api/upload/tables` - Listar tablas personalizadas
- `GET /api/upload/tables/:tableName` - Obtener datos de tabla
- `DELETE /api/upload/tables/:tableName` - Eliminar tabla

## 📊 Carga de Archivos Excel

### Formatos Soportados
- `.xlsx` (Excel 2007+)
- `.xls` (Excel 97-2003)
- `.csv` (Valores separados por comas)

### Proceso de Normalización
1. **Lectura**: El sistema lee el archivo Excel
2. **Normalización de headers**: Convierte nombres de columnas a formato válido
3. **Detección de tipos**: Identifica automáticamente tipos de datos
4. **Validación**: Verifica datos y estructura
5. **Creación**: Genera tablas en base de datos

### Mapeo Automático a Eventos
Si seleccionas "Crear como eventos", el sistema intentará mapear:
- `nombre/name/titulo/title` → Nombre del evento
- `descripcion/description` → Descripción
- `fecha/date` → Fecha del evento
- `capacidad/capacity` → Capacidad máxima
- `precio/price` → Precio del evento
- `categoria/category` → Categoría

## 🛡️ Seguridad

### Medidas Implementadas
- **Hash de contraseñas**: bcryptjs con salt
- **JWT Tokens**: Autenticación stateless
- **Validación de entrada**: Sanitización de datos
- **Roles y permisos**: Control de acceso basado en roles
- **SQL Injection**: Protección con Sequelize ORM
- **CORS**: Configurado para desarrollo

### Consideraciones de Producción
- Cambiar `JWT_SECRET` por uno más seguro
- Configurar CORS para dominios específicos
- Usar HTTPS
- Implementar rate limiting
- Configurar logs de seguridad

## 🐛 Solución de Problemas

### Error de conexión a base de datos
```bash
# Verificar que MySQL esté corriendo
sudo service mysql start

# Verificar credenciales en .env
# Crear base de datos si no existe
```

### Puerto en uso
```bash
# Cambiar puerto en .env
PORT=3002

# O detener proceso en puerto
sudo lsof -ti:3001 | xargs kill -9
```

### Dependencias faltantes
```bash
# Reinstalar dependencias
rm -rf node_modules package-lock.json
npm install
```

## 🔄 Desarrollo

### Scripts disponibles
```bash
npm run dev      # Desarrollo completo
npm run server   # Solo backend
npm run client   # Solo frontend
npm run build    # Build para producción
```

### Base de datos
El sistema crea automáticamente:
- Tablas necesarias al iniciar
- Usuario administrador por defecto
- Relaciones entre entidades

## 📝 Contribución

1. Fork el proyecto
2. Crear rama para feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit cambios (`git commit -am 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crear Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver archivo `LICENSE` para más detalles.

## 🤝 Soporte

Para soporte técnico o reportar bugs:
- Crear un issue en GitHub
- Contactar al equipo de desarrollo

---

**¡Disfruta gestionando tus eventos! 🎉**
