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
