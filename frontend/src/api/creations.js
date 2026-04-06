const API_URL = import.meta.env.VITE_API_URL;

export const getAllCreations = async () => {
    try {
        const response = await fetch(`${API_URL}/api/creations/all`);
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || "Failed to fetch creations");
        }
        return data;
    } catch (error) {
        console.error("Fetch Creations Error:", error);
        throw error;
    }
};

export const saveCreation = async (formData) => {
    const token = localStorage.getItem("token");
    try {
        const response = await fetch(`${API_URL}/api/creations`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
            },
            body: formData,
        });
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || "Failed to save creation");
        }
        return data;
    } catch (error) {
        console.error("Save Creation Error:", error);
        throw error;
    }
};

export const toggleLikeCreation = async (id) => {
    const token = localStorage.getItem("token");
    try {
        const response = await fetch(`${API_URL}/api/creations/${id}/like`, {
            method: "PUT",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || "Failed to toggle like");
        }
        return data;
    } catch (error) {
        console.error("Toggle Like Error:", error);
        throw error;
    }
};

export const updateCreation = async (id, data) => {
    const token = localStorage.getItem("token");
    try {
        const response = await fetch(`${API_URL}/api/creations/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(data),
        });
        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.message || "Failed to update creation");
        }
        return result;
    } catch (error) {
        console.error("Update Creation Error:", error);
        throw error;
    }
};

export const toggleCreationPrivacy = async (id) => {
    const token = localStorage.getItem("token");
    try {
        const response = await fetch(`${API_URL}/api/creations/${id}/privacy`, {
            method: "PUT",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || "Failed to toggle privacy");
        }
        return data;
    } catch (error) {
        console.error("Toggle Privacy Error:", error);
        throw error;
    }
};
