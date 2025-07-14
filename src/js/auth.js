
import { api } from './api.js';
// Authentication module to handle user login, registration, and session management

export const authentication = {
    loginUser: async (email, password) => {
        // Find user by email and validate password
        const users = await api.get(`/users?email=${email}`);
        if (users.length === 0 || users[0].password !== password) {
            throw new Error("Credenciales inválidas");
        }

        // Store user in localStorage for session persistence
        const user = users[0];
        localStorage.setItem("user", JSON.stringify(user));
    },

    registerUser: async (username, email, phone, password) => {
        // Check if email already exists
        const valideUser = await api.get(`/users?email=${email}`);
        if (valideUser.length > 0) {
            throw new Error("El email ya existe");
        }

        // Create new user with default "cliente" role
        const newUser = {
            username,
            email,
            password,
            role: "visitante", 
        };

        await api.post(`/users`, newUser);
    },

    logOut: () => {
        localStorage.removeItem("user");
    },

    // Check if user is logged in by verifying localStorage
    isAuthenticated: () => {
        return !!localStorage.getItem("user");
    },

    // Get current user data from localStorage
    getUserLocal: () => {
        const user = localStorage.getItem("user");
        return user ? JSON.parse(user) : null;
    }
}