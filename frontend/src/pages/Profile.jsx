import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import ThemeToggle from "../components/ThemeToggle";
import "../../styles/profile.css";
import {
  getAlbums,
  createAlbum,
  deleteAlbum,
  renameAlbum,
  addImageToAlbum,
  removeImageFromAlbum,
} from "../api/album";
import { updateUserProfile } from "../api/auth";
import {
  getAllCreations,
  toggleLikeCreation,
  updateCreation,
  toggleCreationPrivacy,
} from "../api/creations";
import Comments from "../components/Comments";

// Public creations state for the Home page
const Profile = () => {
  const [activeSection, setActiveSection] = useState("home");
  const [user, setUser] = useState(null);
  const [creations, setCreations] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [newAlbumName, setNewAlbumName] = useState("");
  const [editingAlbumId, setEditingAlbumId] = useState(null);
  const [newAlbumNameEdit, setNewAlbumNameEdit] = useState("");
  const [expandedCreation, setExpandedCreation] = useState(null);
  const [isPicModalOpen, setIsPicModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedAlbumId, setSelectedAlbumId] = useState(null);
  const [viewingAlbum, setViewingAlbum] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState("");
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [newBio, setNewBio] = useState("");
  const [publicCreations, setPublicCreations] = useState([]);
  const [isEditingCreation, setIsEditingCreation] = useState(false);
  const [editCreationName, setEditCreationName] = useState("");
  const [editCreationDesc, setEditCreationDesc] = useState("");

  const navigate = useNavigate();

  const API_URL = import.meta.env.VITE_API_URL;

  const checkAuth = () => {
    const token = localStorage.getItem("token");
    if (!token || token === "undefined" || token === "null") {
      navigate("/signin");
      return false;
    }
    return true;
  };

  useEffect(() => {
    if (!checkAuth()) return;

    fetchUserProfile();
    fetchCreations();

    if (activeSection === "home") fetchPublicCreations();
    if (activeSection === "albums") fetchAlbums();
  }, [activeSection, viewingAlbum]);

  useEffect(() => {
    setViewingAlbum(null);
  }, [activeSection]);

  const fetchUserProfile = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`${API_URL}/api/auth/info`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const userData = await response.json();
      setUser(userData);
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  const fetchCreations = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`${API_URL}/api/creations`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.status === 401) {
        localStorage.removeItem("token");
        navigate("/signin");
        return;
      }
      const data = await response.json();
      setCreations(data);
    } catch (error) {
      console.error("Error fetching creations:", error);
    }
  };

  const fetchAlbums = async () => {
    try {
      const data = await getAlbums();
      setAlbums(data);
    } catch (error) {
      console.error("Error Fetching albums: ", error);
    }
  };

  const fetchPublicCreations = async () => {
    try {
      const data = await getAllCreations();
      setPublicCreations(data);
    } catch (error) {
      console.error("Error fetching public creations:", error);
    }
  };

  const handleLike = async (e, artId) => {
    e.stopPropagation();

    const userId = user?._id;
    if (!userId) return;

    const toggleLikes = (likes) => {
      const isLiked = likes?.some((id) => id.toString() === userId.toString());
      let newLikes = likes ? [...likes] : [];
      if (isLiked) {
        newLikes = newLikes.filter((id) => id.toString() !== userId.toString());
      } else {
        newLikes.push(userId);
      }
      return newLikes;
    };

    // 1. Update public gallery
    setPublicCreations((prev) =>
      prev.map((creation) =>
        creation._id.toString() === artId.toString()
          ? { ...creation, likes: toggleLikes(creation.likes) }
          : creation,
      ),
    );

    // 2. Update personal creations
    setCreations((prev) =>
      prev.map((creation) =>
        creation._id.toString() === artId.toString()
          ? { ...creation, likes: toggleLikes(creation.likes) }
          : creation,
      ),
    );

    // 3. Update viewing album view (if active)
    if (viewingAlbum) {
      setViewingAlbum((prev) => ({
        ...prev,
        images: prev.images.map((img) =>
          img._id.toString() === artId.toString()
            ? { ...img, likes: toggleLikes(img.likes) }
            : img,
        ),
      }));
    }

    try {
      await toggleLikeCreation(artId);
    } catch (error) {
      console.error("Failed to toggle like:", error);
      fetchPublicCreations();
    }
  };

  const handleTogglePrivacy = async (e, artId) => {
    e.stopPropagation();
    try {
      const { isPublic } = await toggleCreationPrivacy(artId);

      const applyUpdate = (list) =>
        list.map((c) =>
          c._id.toString() === artId.toString()
            ? { ...c, isPublic: isPublic }
            : c,
        );

      setPublicCreations((prev) => {
        if (isPublic) {
          const exists = prev.find(
            (c) => c._id.toString() === artId.toString(),
          );
          if (exists) {
            return prev.map((c) =>
              c._id.toString() === artId.toString() ? { ...c, isPublic } : c,
            );
          } else if (expandedCreation) {
            return [{ ...expandedCreation, isPublic }, ...prev];
          }
          return prev;
        } else {
          return prev.filter((c) => c._id.toString() !== artId.toString());
        }
      });

      setCreations((prev) => applyUpdate(prev));
      if (viewingAlbum && viewingAlbum.images) {
        setViewingAlbum((prev) => ({
          ...prev,
          images: applyUpdate(prev.images),
        }));
      }

      if (
        expandedCreation &&
        expandedCreation._id.toString() === artId.toString()
      ) {
        setExpandedCreation((prev) => ({
          ...prev,
          isPublic: isPublic,
        }));
      }

      fetchPublicCreations();
    } catch (error) {
      console.error("Failed to toggle privacy:", error);
    }
  };

  // Auto-sync expanded modal if any creation list updates
  useEffect(() => {
    if (expandedCreation) {
      const targetId = expandedCreation._id?.toString();
      const foundInPublic = publicCreations.find(
        (c) => c._id?.toString() === targetId,
      );
      if (foundInPublic) {
        setExpandedCreation(foundInPublic);
        return;
      }
      const foundInOwn = creations.find((c) => c._id?.toString() === targetId);
      if (foundInOwn) {
        setExpandedCreation(foundInOwn);
        return;
      }
      if (viewingAlbum && viewingAlbum.images) {
        const foundInAlbum = viewingAlbum.images.find(
          (c) => c._id?.toString() === targetId,
        );
        if (foundInAlbum) {
          setExpandedCreation(foundInAlbum);
        }
      }
    }
  }, [publicCreations, creations, viewingAlbum]);

  const handleSignOut = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const handleDeleteCreation = async (id) => {
    if (!window.confirm("Are you sure you want to delete this creation?"))
      return;
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API_URL}/api/creations/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setCreations(creations.filter((c) => c._id !== id));
      }
    } catch (error) {
      alert("Error deleting creation");
    }
  };

  const handleProfilePicChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("image", file);
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API_URL}/api/user/profile-picture`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (res.ok) {
        const data = await res.json();
        setUser({ ...user, profileImage: data.user.profileImage });
        setIsPicModalOpen(false);
      }
    } catch (err) {
      alert("Upload failed");
    }
  };

  const handleDeleteProfilePic = async () => {
    if (!window.confirm("Remove profile picture?")) return;
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API_URL}/api/user/profile-picture`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setUser({ ...user, profileImage: null });
        setIsPicModalOpen(false);
      }
    } catch (err) {
      alert("Delete failed");
    }
  };

  const handleUpdateName = async () => {
    if (!newName.trim()) return;
    try {
      const data = await updateUserProfile({ name: newName });
      setUser(data.user);
      setIsEditingName(false);
    } catch (error) {
      alert("Name update failed");
    }
  };

  const handleUpdateBio = async () => {
    try {
      const data = await updateUserProfile({ bio: newBio });
      setUser(data.user);
      setIsEditingBio(false);
    } catch (error) {
      alert("Bio update failed");
    }
  };

  const handleUpdateCreation = async () => {
    if (!editCreationName.trim() || !expandedCreation) return;
    try {
      const updatedData = await updateCreation(expandedCreation._id, {
        name: editCreationName,
        description: editCreationDesc,
      });
      const newCreation = updatedData.creation;

      const applyUpdate = (list) =>
        list.map((c) =>
          c._id.toString() === expandedCreation._id.toString()
            ? {
                ...c,
                name: newCreation.name,
                description: newCreation.description,
              }
            : c,
        );

      setPublicCreations((prev) => applyUpdate(prev));
      setCreations((prev) => applyUpdate(prev));
      if (viewingAlbum && viewingAlbum.images) {
        setViewingAlbum((prev) => ({
          ...prev,
          images: applyUpdate(prev.images),
        }));
      }

      setExpandedCreation((prev) => ({
        ...prev,
        name: newCreation.name,
        description: newCreation.description,
      }));
      setIsEditingCreation(false);
    } catch (error) {
      alert("Failed to update creation");
    }
  };

  const handleCreateAlbum = async () => {
    if (!newAlbumName.trim()) return;

    try {
      await createAlbum(newAlbumName);
      setNewAlbumName("");
      setIsCreateModalOpen(false);
      fetchAlbums();
    } catch (error) {
      alert("Failed to create album: ", error);
    }
  };

  const handleRenameAlbum = async (albumId) => {
    if (!newAlbumNameEdit.trim()) return;

    try {
      await renameAlbum(albumId, newAlbumNameEdit);
      setEditingAlbumId(null);
      setNewAlbumNameEdit("");
      fetchAlbums();
    } catch (error) {
      alert("Failed to rename album: ", error);
    }
  };

  const handleAddImage = async (albumId, sandId) => {
    try {
      await addImageToAlbum(albumId, sandId);
      fetchAlbums();
      if (viewingAlbum && viewingAlbum._id === albumId) {
        const updatedAlbums = await getAlbums();
        const updatedAlbum = updatedAlbums.find((a) => a._id === albumId);
        setViewingAlbum(updatedAlbum);
      }
    } catch (err) {
      alert("Failed to add image: ", err);
    }
  };

  const handleRemoveImage = async (albumId, sandId) => {
    try {
      await removeImageFromAlbum(albumId, sandId);
      fetchAlbums();
      if (viewingAlbum && viewingAlbum._id === albumId) {
        const updatedAlbums = await getAlbums();
        const updatedAlbum = updatedAlbums.find((a) => a._id === albumId);
        setViewingAlbum(updatedAlbum);
      }
    } catch (error) {
      alert("Failed to remove image: ", error);
    }
  };

  return (
    <div
      style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}
    >
      <nav className="top-navbar">
        <div className="navbar-left">
          <h1 className="navbar-title">SandCanvas</h1>
        </div>
        <div className="navbar-right">
          <ThemeToggle style={{ position: "static", marginRight: "15px" }} />
          <button className="btn-signout" onClick={handleSignOut}>
            <span>Sign Out</span>
          </button>
        </div>
      </nav>

      <div className="main-container">
        <Sidebar
          activeSection={activeSection}
          setActiveSection={setActiveSection}
        />

        <main className="main-content">
          {activeSection === "home" && (
            <Gallery 
              publicCreations={publicCreations} 
              user={user} 
              setExpandedCreation={setExpandedCreation} 
              handleLike={handleLike} 
            />
          )}

          {activeSection === "creations" && (
            <Creations 
              creations={creations} 
              setExpandedCreation={setExpandedCreation} 
            />
          )}

          {activeSection === "albums" && (
            <Albums 
              albums={albums}
              viewingAlbum={viewingAlbum}
              setViewingAlbum={setViewingAlbum}
              editingAlbumId={editingAlbumId}
              setEditingAlbumId={setEditingAlbumId}
              newAlbumNameEdit={newAlbumNameEdit}
              setNewAlbumNameEdit={setNewAlbumNameEdit}
              setIsCreateModalOpen={setIsCreateModalOpen}
              handleRenameAlbum={handleRenameAlbum}
              fetchAlbums={fetchAlbums}
              setSelectedAlbumId={setSelectedAlbumId}
              setIsAddModalOpen={setIsAddModalOpen}
              setExpandedCreation={setExpandedCreation}
              handleRemoveImage={handleRemoveImage}
            />
          )}
          {activeSection === "profile" && user && (
            <section id="profile-section" className="content-section">
              <div className="profile-container">
                <div className="profile-header-new">
                  <div
                    className="avatar-wrapper"
                    onClick={() => setIsPicModalOpen(true)}
                  >
                    {user.profileImage ? (
                      <img src={user.profileImage.url} alt="Profile" />
                    ) : (
                      <div className="placeholder-svg">
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                          <circle cx="12" cy="7" r="4" />
                        </svg>
                      </div>
                    )}
                    <div className="avatar-overlay">Change</div>
                  </div>

                  <div className="profile-info-main">
                    {isEditingName ? (
                      <div className="edit-name-container">
                        <input
                          type="text"
                          className="album-input"
                          value={newName}
                          onChange={(e) => setNewName(e.target.value)}
                          autoFocus
                          onKeyPress={(e) =>
                            e.key === "Enter" && handleUpdateName()
                          }
                        />
                        <button
                          className="btn-album"
                          onClick={handleUpdateName}
                        >
                          Save
                        </button>
                        <button
                          className="btn-album btn-album-secondary"
                          onClick={() => setIsEditingName(false)}
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="name-display-container">
                        <h2 className="profile-user-name">{user.name}</h2>
                        <button
                          className="edit-profile-btn"
                          onClick={() => {
                            setIsEditingName(true);
                            setNewName(user.name);
                          }}
                        >
                          Edit
                        </button>
                      </div>
                    )}

                    {isEditingBio ? (
                      <div className="edit-bio-container">
                        <textarea
                          className="album-input bio-textarea"
                          value={newBio}
                          onChange={(e) => setNewBio(e.target.value)}
                          autoFocus
                          placeholder="Tell us about yourself"
                        />
                        <div className="edit-actions">
                          <button
                            className="btn-album"
                            onClick={handleUpdateBio}
                          >
                            Save Bio
                          </button>
                          <button
                            className="btn-album btn-album-secondary"
                            onClick={() => setIsEditingBio(false)}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="bio-display-container">
                        <p className="profile-bio">{user.bio || ""}</p>
                        <button
                          className="edit-bio-btn"
                          onClick={() => {
                            setIsEditingBio(true);
                            setNewBio(user.bio || "");
                          }}
                        >
                          {user.bio ? "Edit Bio" : "Add Bio"}
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="profile-details-section">
                  <div className="mini-detail">
                    <span className="mini-label">Creations</span>
                    <span className="mini-value">{creations.length} Total</span>
                  </div>
                  <div className="mini-detail">
                    <span className="mini-label">Email</span>
                    <span className="mini-value">{user.email}</span>
                  </div>
                  <div className="mini-detail">
                    <span className="mini-label">Joined</span>
                    <span className="mini-value">
                      {new Date(user.createdAt).toLocaleDateString("en-GB")}
                    </span>
                  </div>
                </div>
              </div>
            </section>
          )}
        </main>
      </div>

      <CreationModal
        expandedCreation={expandedCreation}
        setExpandedCreation={setExpandedCreation}
        isEditingCreation={isEditingCreation}
        setIsEditingCreation={setIsEditingCreation}
        editCreationName={editCreationName}
        setEditCreationName={setEditCreationName}
        editCreationDesc={editCreationDesc}
        setEditCreationDesc={setEditCreationDesc}
        user={user}
        handleLike={handleLike}
        handleTogglePrivacy={handleTogglePrivacy}
        handleDeleteCreation={handleDeleteCreation}
        handleUpdateCreation={handleUpdateCreation}
      />
      {isPicModalOpen && (
        <div
          className="modal-backdrop"
          style={{ display: "flex" }}
          onClick={(e) =>
            e.target === e.currentTarget && setIsPicModalOpen(false)
          }
        >
          <div className="options-modal">
            <h3>Profile Picture</h3>
            <button
              className="modal-btn"
              onClick={() =>
                document.getElementById("hidden-file-input").click()
              }
              style={{ color: "#f5deb3" }}
            >
              Change Picture
            </button>
            <button
              className="modal-btn"
              onClick={handleDeleteProfilePic}
              style={{ color: "#ff4444" }}
            >
              Remove Current
            </button>
            <button
              className="modal-btn"
              onClick={() => setIsPicModalOpen(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {isCreateModalOpen && (
        <div
          className="modal-backdrop"
          style={{ display: "flex" }}
          onClick={(e) =>
            e.target === e.currentTarget && setIsCreateModalOpen(false)
          }
        >
          <div className="options-modal">
            <h3>Create New Album</h3>
            <div className="album-input-group" style={{ marginBottom: "20px" }}>
              <input
                type="text"
                className="album-input"
                placeholder="Album Name"
                value={newAlbumName}
                onChange={(e) => setNewAlbumName(e.target.value)}
                autoFocus
                onKeyPress={(e) => e.key === "Enter" && handleCreateAlbum()}
              />
            </div>
            <div style={{ display: "flex", gap: "10px" }}>
              <button
                className="btn-album"
                style={{ flex: 1 }}
                onClick={handleCreateAlbum}
              >
                Create
              </button>
              <button
                className="btn-album btn-album-secondary"
                style={{ flex: 1 }}
                onClick={() => setIsCreateModalOpen(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {isAddModalOpen && (
        <div
          className="modal-backdrop"
          style={{ display: "flex" }}
          onClick={(e) =>
            e.target === e.currentTarget && setIsAddModalOpen(false)
          }
        >
          <div className="options-modal" style={{ maxWidth: "600px" }}>
            <h3>Select Images</h3>

            {creations.length === 0 ? (
              <p>No creations available</p>
            ) : (
              <div className="mini-grid">
                {creations.map((c) => (
                  <img
                    key={c._id}
                    src={
                      c.imagePath?.startsWith("http")
                        ? c.imagePath
                        : `${API_URL}${c.imagePath}`
                    }
                    alt="creation"
                    onClick={async () => {
                      await handleAddImage(selectedAlbumId, c._id);
                    }}
                    style={{
                      width: "80px",
                      height: "80px",
                      margin: "5px",
                      cursor: "pointer",
                      borderRadius: "6px",
                    }}
                  />
                ))}
              </div>
            )}

            <button
              className="btn-album"
              style={{ width: "100%", marginTop: "20px" }}
              onClick={() => setIsAddModalOpen(false)}
            >
              Done
            </button>
          </div>
        </div>
      )}

      <input
        type="file"
        id="hidden-file-input"
        style={{ display: "none" }}
        accept="image/*"
        onChange={handleProfilePicChange}
      />

      <Link to="/canvas" className="fab">
        <span>Start Sandscaping</span>
      </Link>
    </div>
  );
};

export default Profile;
import Gallery from "../components/Gallery";
import Creations from "../components/Creations";
import Albums from "../components/Albums";
import CreationModal from "../components/CreationModal";
