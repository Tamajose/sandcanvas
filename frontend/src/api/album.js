const API_URL = import.meta.env.VITE_API_URL;

const getToken = () => localStorage.getItem("token");

export const createAlbum = async (name) => {
    const res = await fetch(`${API_URL}/api/albums`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ name }),
    });

    return res.json();
};

export const getAlbums = async () => {
    const res = await fetch(`${API_URL}/api/albums`, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${getToken()}`,
        },
    });

    return res.json();
};

export const addImageToAlbum = async (albumId, sandId) => {
    const res = await fetch(`${API_URL}/api/albums/add-image`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ albumId, sandId }),
    });

    return res.json();
};

export const removeImageFromAlbum = async (albumId, sandId) => {
    const res = await fetch(`${API_URL}/api/albums/remove-image`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ albumId, sandId }),
    });

    return res.json();
};

export const renameAlbum = async (albumId, newName) => {
    const res = await fetch(`${API_URL}/api/albums/${albumId}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ name: newName }),
    });

    return res.json();
};

export const deleteAlbum = async (id) => {
    const res = await fetch(`${API_URL}/api/albums/${id}`, {
        method: "DELETE",
        headers: {
            Authorization: `Bearer ${getToken()}`,
        },
    });

    return res.json();
};