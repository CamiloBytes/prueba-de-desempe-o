const BASE_URL = "http://localhost:3000"; // Cambia esto si tu servidor está en otro puerto o dominio

export const api = {
    async get(endpoint) {
        try {
            const response = await fetch(`${BASE_URL}${endpoint}`);
            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }
            return await response.json();
        } catch (error) {
            console.error("Error en la petición GET:", error);
            throw error;
        }
    },
    async post(endpoint, data) {
        try {
            const response = await fetch(`${BASE_URL}${endpoint}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }
            return await response.json();
        } catch (error) {
            console.error("Error en la petición POST:", error);
            throw error;
        }
    },
    async put(endpoint, data) {
        try {
            const response = await fetch(`${BASE_URL}${endpoint}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }
            return await response.json();
        } catch (error) {
            console.error("Error en la petición PUT:", error);
            throw error;
        }
    },
    async delete(endpoint) {
        try {
            const response = await fetch(`${BASE_URL}${endpoint}`, {
                method: "DELETE",
            });
            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }
            return await response.json();
        } catch (error) {
            console.error("Error en la petición DELETE:", error);
            throw error;
        }
    }
};