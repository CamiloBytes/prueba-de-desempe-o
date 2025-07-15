# Event Center

This project is a web application for event management and participation. It allows administrators to create, edit, and delete events, and visiting users to register and deregister for available events.

## Features

- User registration and login with roles (admin and visitor).
- Event management by administrators (create, edit, delete).
- Event registration and deregistration by visitors.
- Maximum event capacity control to prevent overregistration.
- Management of separate registration records to maintain data integrity.

## Project Structure

- `src/js/`: Main JavaScript code, including:
- `renderDashboard.js`: Logic for displaying events and handling registrations.
- `addevent.js`: Form for adding events (admin only).
- `api.js`: Functions for interacting with the REST API.
- `auth.js`: Authentication and user management.
- `views.js`: Rendering views such as login, registration, and landing pages.
- `public/db.json`: Mock JSON database with users, events, and registration records.

## How to run

1. Make sure you have a server serving the static files and API (e.g., json-server for `db.json`).
2. Run the server and open `index.html` in a browser.
3. Register or log in as a visitor or administrator.
4. Manage events or register for them based on your role.

## Notes

- The maximum event capacity is controlled by the registration count in the `registrations` collection.
- The registration logic prevents a user from registering for the same event more than once.
- A clear message is displayed when the maximum capacity is reached.

## Coder

- Camilo Andres Parra Luna
- Clan: Cienaga
- C.C: 1043136986
