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
import { getAllCreations, toggleLikeCreation, updateCreation, toggleCreationPrivacy } from "../api/creations";
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
    if(!userId) return;

    const toggleLikes = (likes) => {
        const isLiked = likes?.some(id => id.toString() === userId.toString());
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
      prev.map((creation) => creation._id.toString() === artId.toString() ? { ...creation, likes: toggleLikes(creation.likes) } : creation)
    );

    // 2. Update personal creations
    setCreations((prev) =>
      prev.map((creation) => creation._id.toString() === artId.toString() ? { ...creation, likes: toggleLikes(creation.likes) } : creation)
    );

    // 3. Update viewing album view (if active)
    if (viewingAlbum) {
      setViewingAlbum((prev) => ({
        ...prev,
        images: prev.images.map((img) => img._id.toString() === artId.toString() ? { ...img, likes: toggleLikes(img.likes) } : img)
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
            : c
        );

      setPublicCreations((prev) => {
        if (isPublic) {
          const exists = prev.find(c => c._id.toString() === artId.toString());
          if (exists) {
            return prev.map(c => c._id.toString() === artId.toString() ? { ...c, isPublic } : c);
          } else if (expandedCreation) {
             return [{...expandedCreation, isPublic}, ...prev];
          }
          return prev;
        } else {
          return prev.filter(c => c._id.toString() !== artId.toString());
        }
      });

      setCreations((prev) => applyUpdate(prev));
      if (viewingAlbum && viewingAlbum.images) {
        setViewingAlbum((prev) => ({
          ...prev,
          images: applyUpdate(prev.images),
        }));
      }

      if (expandedCreation && expandedCreation._id.toString() === artId.toString()) {
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
      const foundInPublic = publicCreations.find(c => c._id?.toString() === targetId);
      if (foundInPublic) {
        setExpandedCreation(foundInPublic);
        return;
      }
      const foundInOwn = creations.find(c => c._id?.toString() === targetId);
      if (foundInOwn) {
        setExpandedCreation(foundInOwn);
        return;
      }
      if (viewingAlbum && viewingAlbum.images) {
        const foundInAlbum = viewingAlbum.images.find(c => c._id?.toString() === targetId);
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
            ? { ...c, name: newCreation.name, description: newCreation.description }
            : c
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
            <section id="home-section" className="content-section">
              <div className="hero-section">
                <h2 className="hero-title">
                  Explore Sand Creations by Other Users
                </h2>
              </div>
              <div id="home-grid" className="art-grid">
                {publicCreations
                  .filter((art) => (art.userID?._id || art.userID) !== user?._id)
                  .map((art) => (
                  <div
                    key={art._id}
                    className="art-item"
                    onClick={() => setExpandedCreation(art)}
                    style={{ cursor: "pointer" }}
                  >
                    <div className="art-thumbnail-wrapper">
                      <img
                        src={
                          art.imagePath?.startsWith("http")
                            ? art.imagePath
                            : `${API_URL}${art.imagePath}`
                        }
                        alt="Sandscape"
                      />
                    </div>
                    <div className="art-info">
                      <div className="art-creator">
                        {art.userID?.name || art.creator || "Unknown"}
                      </div>
                      <div className="art-stats" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <span
                          style={{
                            fontSize: "12px",
                            color: "rgba(255, 255, 255, 0.5)",
                          }}
                        >
                          {new Date(art.createdAt).toLocaleDateString("en-GB")}
                        </span>
                        
                        <button
                          className="btn-like"
                          onClick={(e) => handleLike(e, art._id)}
                          style={{
                            background: "none",
                            border: "none",
                            color: art.likes?.includes(user?._id) ? "#ff4b4b" : "rgba(255, 255, 255, 0.5)",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: "5px",
                            fontSize: "14px",
                            padding: 0
                          }}
                        >
                          <svg
                            viewBox="0 0 24 24"
                            fill={art.likes?.some(id => id.toString() === user?._id?.toString()) ? "#ff4b4b" : "none"}
                            stroke={art.likes?.some(id => id.toString() === user?._id?.toString()) ? "#ff4b4b" : "currentColor"}
                            strokeWidth="2"
                            style={{ width: "16px", height: "16px" }}
                          >
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                          </svg>
                          <span>{art.likes?.length || 0}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
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
                      onClick={() => setExpandedCreation(creation)}
                    >
                      <img
                        src={creation.imagePath?.startsWith("http") ? creation.imagePath : `${API_URL}${creation.imagePath}`}
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
                                  src={img.imagePath?.startsWith("http") ? img.imagePath : `${API_URL}${img.imagePath}`}
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
                          onClick={() => setExpandedCreation(img)}
                        >
                          <img
                            src={img.imagePath?.startsWith("http") ? img.imagePath : `${API_URL}${img.imagePath}`}
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

      {expandedCreation && (
        <div
          className="modal-backdrop"
          style={{ display: "flex" }}
          onClick={() => {
            setExpandedCreation(null);
            setIsEditingCreation(false);
          }}
        >
          <span className="close-modal">&times;</span>
          <div className="expanded-modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="expanded-image-wrapper">
              <img
                className="expanded-img"
                src={
                  expandedCreation.imagePath?.startsWith("http")
                    ? expandedCreation.imagePath
                    : `${API_URL}${expandedCreation.imagePath}`
                }
                alt="Expanded"
              />
            </div>
            
            <div className="expanded-info-panel">
              <div className="expanded-header">
                {isEditingCreation ? (
                   <input
                     type="text"
                     className="album-input"
                     value={editCreationName}
                     onChange={(e) => setEditCreationName(e.target.value)}
                     style={{ fontSize: "20px", marginBottom: "0", maxWidth: "70%" }}
                     autoFocus
                   />
                ) : (
                   <h2 className="expanded-title">{expandedCreation.name || "Untitled Creation"}</h2>
                )}
                <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                  <button
                    className="modal-like-btn"
                    onClick={(e) => handleLike(e, expandedCreation._id)}
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill={expandedCreation.likes?.some(id => id.toString() === user?._id?.toString()) ? "#ff4b4b" : "none"}
                      stroke={expandedCreation.likes?.some(id => id.toString() === user?._id?.toString()) ? "#ff4b4b" : "currentColor"}
                      strokeWidth="2"
                    >
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                    </svg>
                    <span>{expandedCreation.likes?.length || 0}</span>
                  </button>
                </div>
              </div>

              <div className="expanded-creator" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "25px" }}>
                <span style={{ color: "rgba(255, 255, 255, 0.6)", fontSize: "15px", fontWeight: "500" }}>by {expandedCreation.userID?.name || user?.name || "Unknown Artist"}</span>
                
                {(expandedCreation.userID?._id === user?._id || expandedCreation.userID === user?._id) && (
                  isEditingCreation ? (
                    <div className="edit-actions" style={{ marginLeft: "auto" }}>
                      <button className="btn-album" onClick={handleUpdateCreation}>Save</button>
                      <button className="btn-album btn-album-secondary" onClick={() => setIsEditingCreation(false)}>Cancel</button>
                    </div>
                  ) : (
                    <div style={{ marginLeft: "auto", display: "flex", gap: "10px", alignItems: "center", position: "relative", zIndex: 10 }}>
                      <button
                        className="btn-album btn-album-secondary"
                        onClick={(e) => handleTogglePrivacy(e, expandedCreation._id)}
                      >
                        {expandedCreation.isPublic !== false ? "Make Private" : "Make Public"}
                      </button>
                      <button
                        className="edit-profile-btn"
                        onClick={() => {
                          setEditCreationName(expandedCreation.name || "");
                          setEditCreationDesc(expandedCreation.description || "");
                          setIsEditingCreation(true);
                        }}
                      >
                        Edit 
                      </button>
                    </div>
                  )
                )}
              </div>

              {isEditingCreation ? (
                 <textarea
                   className="album-input bio-textarea"
                   value={editCreationDesc}
                   onChange={(e) => setEditCreationDesc(e.target.value)}
                   placeholder="Creation description..."
                   style={{ marginTop: "0", marginBottom: "30px", width: "100%" }}
                 />
              ) : (
                 expandedCreation.description && (
                    <p className="expanded-desc">{expandedCreation.description}</p>
                 )
              )}
              {expandedCreation.tags && expandedCreation.tags.length > 0 && (
                  <div className="expanded-tags">
                      {expandedCreation.tags.map((tag, idx) => (
                          <span key={idx} className="expanded-tag">
                              #{tag}
                          </span>
                      ))}
                  </div>
              )}
              <div className="expanded-meta">
                {expandedCreation.createdAt && (
                  <span>Created: {new Date(expandedCreation.createdAt).toLocaleDateString("en-GB")}</span>
                )}
              </div>
              
              <Comments creationId={expandedCreation._id} currentUser={user} />
            </div>
          </div>
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
