import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import ThemeToggle from "../components/ThemeToggle";
import "../../styles/profile.css";
import { getAlbums, createAlbum, deleteAlbum } from "../api/album"

const Profile = () => {
  const [activeSection, setActiveSection] = useState("home");
  const [user, setUser] = useState(null);
  const [creations, setCreations] = useState([]);
  const [isPicModalOpen, setIsPicModalOpen] = useState(false);
  const [expandedImage, setExpandedImage] = useState(null);
  const [albums, setAlbums] = useState([]);
  const [newAlbumName, setNewAlbumName] = useState("");

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
    if (!checkAuth())
      return;

    fetchUserProfile();
    if(activeSection === "creations")
      fetchCreations();

    if(activeSection === "albums")
      fetchAlbums();
    
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
    try{
      const data = await getAlbums();
      setAlbums(data);
    } catch(error){
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

  const handleCreateAlbum = async () => {
    if(!newAlbumName.trim())
      return;

    try{
      await createAlbum(newAlbumName);
      setNewAlbumName("");
      fetchAlbums();
    } catch(error){
      alert("Failed to create album");
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
              <h2>Your Albums</h2>

              <div style={{ marginBottom: "20px" }}>
                <input
                  type="text"
                  placeholder="New album name"
                  value={newAlbumName}
                  onChange={(e) => setNewAlbumName(e.target.value)}
                />
                <button onClick={handleCreateAlbum}>
                  Create Album
                </button>
              </div>

              {albums.length === 0 ? (
                <p>No albums yet</p>
              ) : (
                <div className="albums-grid">
                  {albums.map((album) => (
                    <div key={album._id} className="album-card">
                      <h3>{album.name}</h3>
                      <p>{album.images.length} images</p>

                      <button
                        onClick={() => deleteAlbum(album._id).then(fetchAlbums)}
                      >
                        Delete
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {activeSection === "profile" && user && (
            <section id="profile-section" className="content-section">
              <div className="profile-container">
                <div className="profile-header">
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
                  <h2 className="profile-user-name">{user.name}</h2>
                </div>
                <div className="profile-details-card">
                  <div className="detail-item">
                    <span className="detail-label">Email</span>
                    <span className="detail-value">{user.email}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Joined</span>
                    <span className="detail-value">
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
