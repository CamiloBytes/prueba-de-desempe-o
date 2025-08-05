const BASE_URL = "http://localhost:3001/api"; 

export const api = {
    // Helper to get auth token
    getAuthToken() {
        const user = JSON.parse(localStorage.getItem("user") || '{}');
        return user.token || null;
    },

    // Helper to get auth headers
    getHeaders(includeAuth = true) {
        const headers = { "Content-Type": "application/json" };
        if (includeAuth) {
            const token = this.getAuthToken();
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }
        }
        return headers;
    },

    async get(endpoint, includeAuth = true) {
        try {
            const response = await fetch(`${BASE_URL}${endpoint}`, {
                method: "GET",
                headers: this.getHeaders(includeAuth)
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
            }
            return await response.json();
        } catch (error) {
            console.error("Error en la petición GET:", error);
            throw error;
        }
    },

    async post(endpoint, data, includeAuth = true) {
        try {
            const response = await fetch(`${BASE_URL}${endpoint}`, {
                method: "POST",
                headers: this.getHeaders(includeAuth),
                body: JSON.stringify(data),
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
            }
            return await response.json();
        } catch (error) {
            console.error("Error en la petición POST:", error);
            throw error;
        }
    },

    async put(endpoint, data, includeAuth = true) {
        try {
            const response = await fetch(`${BASE_URL}${endpoint}`, {
                method: "PUT",
                headers: this.getHeaders(includeAuth),
                body: JSON.stringify(data),
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
            }
            return await response.json();
        } catch (error) {
            console.error("Error en la petición PUT:", error);
            throw error;
        }
    },

    async delete(endpoint, includeAuth = true) {
        try {
            const response = await fetch(`${BASE_URL}${endpoint}`, {
                method: "DELETE",
                headers: this.getHeaders(includeAuth)
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
            }
            return await response.json();
        } catch (error) {
            console.error("Error en la petición DELETE:", error);
            throw error;
        }
    },

    // Upload file with FormData
    async uploadFile(endpoint, formData, includeAuth = true) {
        try {
            const headers = {};
            if (includeAuth) {
                const token = this.getAuthToken();
                if (token) {
                    headers['Authorization'] = `Bearer ${token}`;
                }
            }

            const response = await fetch(`${BASE_URL}${endpoint}`, {
                method: "POST",
                headers: headers,
                body: formData // Don't set Content-Type for FormData
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
            }
            return await response.json();
        } catch (error) {
            console.error("Error en la carga de archivo:", error);
            throw error;
        }
    }
};