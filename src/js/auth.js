import { api } from './api.js';

export const authentication = {
    async loginUser(email, password) {
        try {
            const response = await api.post('/auth/login', { email, password }, false);
            
            if (response.success) {
                // Store user data with token
                const userData = {
                    ...response.user,
                    token: response.token
                };
                localStorage.setItem("user", JSON.stringify(userData));
                return userData;
            } else {
                throw new Error(response.message || "Error en el login");
            }
        } catch (error) {
            console.error("Error al iniciar sesión:", error);
            throw error;
        }
    },

    async registerUser(name, email, password) {
        try {
            const response = await api.post("/auth/register", { name, email, password }, false);
            
            if (response.success) {
                // Store user data with token
                const userData = {
                    ...response.user,
                    token: response.token
                };
                localStorage.setItem("user", JSON.stringify(userData));
                return userData;
            } else {
                throw new Error(response.message || "Error en el registro");
            }
        } catch (error) {
            console.error("Error al registrar usuario:", error);
            throw error;
        }
    },

    async getCurrentUser() {
        try {
            const response = await api.get('/auth/profile');
            if (response.success) {
                // Update stored user data but keep the token
                const currentUser = this.getUserLocal();
                const updatedUser = {
                    ...response.user,
                    token: currentUser.token
                };
                localStorage.setItem("user", JSON.stringify(updatedUser));
                return updatedUser;
            }
            return null;
        } catch (error) {
            console.error("Error al obtener perfil:", error);
            // If token is invalid, logout user
            this.logout();
            return null;
        }
    },

    isAuthenticated() {
        const user = this.getUserLocal();
        return !!(user && user.token);
    },

    getUserLocal() {
        try {
            const userData = localStorage.getItem("user");
            return userData ? JSON.parse(userData) : null;
        } catch (error) {
            console.error("Error parsing user data:", error);
            return null;
        }
    },

    isAdmin() {
        const user = this.getUserLocal();
        return user && user.role === 'admin';
    },

    isUser() {
        const user = this.getUserLocal();
        return user && (user.role === 'user' || user.role === 'admin');
    },

    async logout() {
        try {
            // Call logout endpoint to potentially invalidate token on server
            await api.post('/auth/logout');
        } catch (error) {
            console.error("Error en logout:", error);
        } finally {
            // Always clear local storage
            localStorage.removeItem("user");
        }
    }
};