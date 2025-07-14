export const api = {
    baseUrl:"http://localhost:3000/users",

    get: async (endpoint) => {
        try {
            const response = await fetch(`${api.baseUrl}${endpoint}`);
            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error en la petición GET:', error);
            throw error;
        }
    },
    post:async (endpoint, data) => {
        try {
            const response = await fetch(`${api.baseUrl}${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error en la petición POST:', error);
            throw error;
        }
    },
    // PATCH request handler for partial updates
    patch: async (endpoint, data) => {
        try {
            const response = await fetch(`${api.baseURL}${endpoint}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error en la petición PATCH:', error);
            throw error;
        }
    },
    // DELETE request handler
    delete: async (endpoint) => {
        try {
            const response = await fetch(`${api.baseURL}${endpoint}`, {
                method: 'DELETE'
            });
            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error en la petición DELETE:', error);
            throw error;
        }
    }
}