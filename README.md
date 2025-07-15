# Event Center

Este proyecto es una aplicación web para la gestión y participación en eventos. Permite a los administradores crear, editar y eliminar eventos, y a los usuarios visitantes inscribirse y salir de los eventos disponibles.

## Características

- Registro e inicio de sesión de usuarios con roles (admin y visitante).
- Gestión de eventos por parte de administradores (crear, editar, eliminar).
- Inscripción y salida de eventos por parte de visitantes.
- Control de capacidad máxima de eventos para evitar sobreinscripciones.
- Manejo de registros de inscripción separados para mantener integridad de datos.

## Estructura del proyecto

- `src/js/`: Código JavaScript principal, incluyendo:
  - `renderDashboard.js`: Lógica para mostrar eventos y manejar inscripciones.
  - `addevent.js`: Formulario para agregar eventos (solo admin).
  - `api.js`: Funciones para interactuar con la API REST.
  - `auth.js`: Autenticación y manejo de usuarios.
  - `views.js`: Renderizado de vistas como login, registro y landing.
- `public/db.json`: Base de datos JSON simulada con usuarios, eventos y registros de inscripción.

## Cómo ejecutar

1. Asegúrate de tener un servidor que sirva los archivos estáticos y la API  (por ejemplo, json-server para `db.json`).
2. Ejecuta el servidor y abre `index.html` en un navegador.
3. Regístrate o inicia sesión como usuario visitante o administrador.
4. Administra eventos o inscríbete en ellos según tu rol.

## Notas

- La capacidad máxima de eventos se controla mediante el conteo de inscripciones en la colección `registrations`.
- La lógica de inscripción evita que un usuario se inscriba más de una vez en el mismo evento.
- Se muestra un mensaje claro cuando la capacidad máxima es alcanzada.

## Coder

- Camilo andres parra luna 
- Clan: Cienaga
- C.C: 1043136986


