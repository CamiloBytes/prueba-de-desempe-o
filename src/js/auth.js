import { api } from './api.js';
// Authentication module to handle user login, registration, and session management

export const authentication = {
    async loginUser(email, password) {
        try {
            const response = await api.get(`/users?email=${email}&password=${password}`);
            if (response.length === 0) {
                throw new Error("Credenciales inválidas");
            }
            const user = response[0];
            localStorage.setItem("user", JSON.stringify(user)); // Guarda la sesión
            return user;
        } catch (error) {
            console.error("Error al iniciar sesión:", error);
            throw error;
        }
    },
    async registerUser(name, email, password) {
        try {
            const user = { name, email, password, role: "visitor" }; // Ajusta el rol según sea necesario
            return await api.post("/users", user); // Asegúrate de que "/users" exista en db.json
        } catch (error) {
            console.error("Error al registrar usuario:", error);
            throw error;
        }
    },
    isAuthenticated() {
        return !!localStorage.getItem("user");
    },
    getUserLocal() {
        return JSON.parse(localStorage.getItem("user"));
    },
    logout() {
        localStorage.removeItem("user");
    }
};