const API_URL = import.meta.env.VITE_API_URL;

export const getCommentsByCreation = async (creationId) => {
    try {
        const response = await fetch(`${API_URL}/api/comments/${creationId}`);
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || "Failed to fetch comments");
        }
        return data;
    } catch (error) {
        console.error("Fetch Comments Error:", error);
        throw error;
    }
};

export const addComment = async (creationId, text) => {
    const token = localStorage.getItem("token");
    try {
        const response = await fetch(`${API_URL}/api/comments/${creationId}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ text }),
        });
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || "Failed to add comment");
        }
        return data;
    } catch (error) {
        console.error("Add Comment Error:", error);
        throw error;
    }
};

export const updateComment = async (id, text) => {
    const token = localStorage.getItem("token");
    try {
        const response = await fetch(`${API_URL}/api/comments/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ text }),
        });
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || "Failed to update comment");
        }
        return data;
    } catch (error) {
        console.error("Update Comment Error:", error);
        throw error;
    }
};

export const deleteComment = async (id) => {
    const token = localStorage.getItem("token");
    try {
        const response = await fetch(`${API_URL}/api/comments/${id}`, {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || "Failed to delete comment");
        }
        return data;
    } catch (error) {
        console.error("Delete Comment Error:", error);
        throw error;
    }
};
