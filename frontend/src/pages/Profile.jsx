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

const Profile = () => {
  const [activeSection, setActiveSection] = useState("home");
  const [user, setUser] = useState(null);
  const [creations, setCreations] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [newAlbumName, setNewAlbumName] = useState("");
  const [editingAlbumId, setEditingAlbumId] = useState(null);
  const [newAlbumNameEdit, setNewAlbumNameEdit] = useState("");
  const [expandedImage, setExpandedImage] = useState(null);
  const [isPicModalOpen, setIsPicModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedAlbumId, setSelectedAlbumId] = useState(null);
  const [viewingAlbum, setViewingAlbum] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState("");

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
    if (activeSection === "creations" || activeSection === "albums")
      fetchCreations();

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
      setUser({ ...user, name: data.user.name });
      setIsEditingName(false);
    } catch (error) {
      alert("Failed to update name");
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
            <section id="home-section" className="content-section">
              <div className="hero-section">
                <h2 className="hero-title">Explore Sand Creations</h2>
              </div>
              <div id="home-grid" className="art-grid">
                {/* Home Gallery logic */}
              </div>
            </section>
          )}

          {activeSection === "creations" && (
            <section id="creations-section" className="content-section">
              {creations.length === 0 ? (
                <div className="empty-state">
                  <svg
                    className="empty-icon"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1"
                  >
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                    <line x1="3" y1="9" x2="21" y2="9" />
                    <line x1="9" y1="21" x2="9" y2="9" />
                  </svg>
                  <p className="empty-message">No creations yet</p>
                  <p className="empty-subtitle">
                    Start by creating something in the canvas!
                  </p>
                </div>
              ) : (
                <div className="creations-grid">
                  {creations.map((creation) => (
                    <div
                      key={creation._id}
                      className="creation-item"
                      onClick={() => setExpandedImage(creation.imagePath)}
                    >
                      <img
                        src={`${API_URL}${creation.imagePath}`}
                        alt="Sand Creation"
                      />
                      <button
                        className="delete-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteCreation(creation._id);
                        }}
                      >
                        &times;
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {activeSection === "albums" && (
            <section className="content-section">
              {!viewingAlbum ? (
                <>
                  <div className="section-header">
                    <h2 className="section-title">Your Albums</h2>
                    <button
                      className="add-album-btn"
                      onClick={() => setIsCreateModalOpen(true)}
                      title="Create New Album"
                    >
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                      >
                        <line x1="12" y1="5" x2="12" y2="19" />
                        <line x1="5" y1="12" x2="19" y2="12" />
                      </svg>
                    </button>
                  </div>

                  {albums.length === 0 ? (
                    <div className="empty-state">
                      <svg
                        className="empty-icon"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1"
                      >
                        <rect x="3" y="4" width="18" height="16" rx="2" />
                        <path d="M3 10h18" />
                      </svg>
                      <p className="empty-message">No albums yet</p>
                      <p className="empty-subtitle">
                        Organize your creations into themed collections.
                      </p>
                    </div>
                  ) : (
                    <div className="albums-grid">
                      {albums.map((album) => (
                        <div
                          key={album._id}
                          className="album-card"
                          onClick={() => setViewingAlbum(album)}
                          style={{ cursor: "pointer" }}
                        >
                          <div className="album-header">
                            {editingAlbumId === album._id ? (
                              <div
                                className="album-input-group"
                                style={{
                                  marginBottom: 0,
                                  width: "100%",
                                  zIndex: 10,
                                }}
                                onClick={(e) => e.stopPropagation()}
                              >
                                <input
                                  type="text"
                                  className="album-input"
                                  value={newAlbumNameEdit}
                                  onChange={(e) =>
                                    setNewAlbumNameEdit(e.target.value)
                                  }
                                  autoFocus
                                />
                                <button
                                  className="btn-album"
                                  onClick={() => handleRenameAlbum(album._id)}
                                >
                                  Save
                                </button>
                                <button
                                  className="btn-album btn-album-secondary"
                                  onClick={() => setEditingAlbumId(null)}
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <>
                                <div>
                                  <h3 className="album-title">{album.name}</h3>
                                  <span className="album-count">
                                    {album.images.length} images
                                  </span>
                                </div>
                                <div className="album-actions">
                                  <button
                                    className="btn-album btn-album-secondary"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setEditingAlbumId(album._id);
                                      setNewAlbumNameEdit(album.name);
                                    }}
                                    style={{
                                      padding: "6px 12px",
                                      fontSize: "10px",
                                      minWidth: "auto",
                                    }}
                                  >
                                    Rename
                                  </button>
                                  <button
                                    className="btn-album btn-album-danger"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      deleteAlbum(album._id).then(fetchAlbums);
                                    }}
                                    style={{
                                      padding: "6px 12px",
                                      fontSize: "10px",
                                      minWidth: "auto",
                                    }}
                                  >
                                    Delete
                                  </button>
                                </div>
                              </>
                            )}
                          </div>

                          <div className="album-images">
                            {album.images.slice(0, 4).map((img) => (
                              <div key={img._id} className="album-image-item">
                                <img
                                  src={`${API_URL}${img.imagePath}`}
                                  alt="album preview"
                                />
                              </div>
                            ))}
                            {[
                              ...Array(Math.max(0, 4 - album.images.length)),
                            ].map((_, i) => (
                              <div
                                key={`empty-${i}`}
                                className="album-image-item"
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  opacity: 0.3,
                                }}
                              >
                                <svg
                                  width="24"
                                  height="24"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="1"
                                >
                                  <rect
                                    x="3"
                                    y="3"
                                    width="18"
                                    height="18"
                                    rx="2"
                                  />
                                  <circle cx="8.5" cy="8.5" r="1.5" />
                                  <path d="M21 15l-5-5L5 21" />
                                </svg>
                              </div>
                            ))}
                          </div>

                          <button
                            className="btn-album"
                            style={{ width: "100%", marginTop: "10px" }}
                            onClick={(e) => {
                              e.stopPropagation();
                              setViewingAlbum(album);
                            }}
                          >
                            Explore Album
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className="album-detail-view">
                  <header className="album-detail-header">
                    <button
                      className="album-back-btn"
                      onClick={() => setViewingAlbum(null)}
                    >
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M19 12H5M12 19l-7-7 7-7" />
                      </svg>
                      <span>Back to Albums</span>
                    </button>
                    <h2 className="album-detail-title">{viewingAlbum.name}</h2>
                    <button
                      className="btn-album"
                      onClick={() => {
                        setSelectedAlbumId(viewingAlbum._id);
                        setIsAddModalOpen(true);
                      }}
                    >
                      Add Creations
                    </button>
                  </header>

                  {viewingAlbum.images.length === 0 ? (
                    <div className="empty-state">
                      <p className="empty-message">This album is empty</p>
                      <button
                        className="btn-album"
                        onClick={() => {
                          setSelectedAlbumId(viewingAlbum._id);
                          setIsAddModalOpen(true);
                        }}
                      >
                        Add your first creation
                      </button>
                    </div>
                  ) : (
                    <div className="creations-grid">
                      {viewingAlbum.images.map((img) => (
                        <div
                          key={img._id}
                          className="creation-item"
                          onClick={() => setExpandedImage(img.imagePath)}
                        >
                          <img
                            src={`${API_URL}${img.imagePath}`}
                            alt="Sand Creation"
                          />
                          <button
                            className="delete-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveImage(viewingAlbum._id, img._id);
                            }}
                            title="Remove from album"
                          >
                            &times;
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </section>
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
                  </div>
                </div>

                <div className="profile-details-section">
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

      {expandedImage && (
        <div
          className="modal-backdrop"
          style={{ display: "flex" }}
          onClick={() => setExpandedImage(null)}
        >
          <span className="close-modal">&times;</span>
          <img
            className="modal-content-img"
            src={`${API_URL}${expandedImage}`}
            alt="Expanded"
          />
        </div>
      )}

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
                    src={`${API_URL}${c.imagePath}`}
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
