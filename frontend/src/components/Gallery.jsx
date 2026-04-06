import React from "react";

const API_URL = import.meta.env.VITE_API_URL;

const Gallery = ({
  publicCreations,
  user,
  setExpandedCreation,
  handleLike,
}) => {
  return (
    <section id="home-section" className="content-section">
      <div className="hero-section">
        <h2 className="hero-title">Explore Sand Creations by Other Users</h2>
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
              <div
                className="art-info"
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div className="art-creator">
                  <div
                    style={{
                      fontWeight: "bold",
                      fontSize: "15px",
                      marginBottom: "5px",
                    }}
                  >
                    {art.name || "Untitled Creation"}
                  </div>
                  <div
                    style={{
                      fontSize: "11px",
                      color: "rgba(255, 255, 255, 0.6)",
                    }}
                  >
                    {art.userID?.name || art.creator || "Unknown"}
                  </div>
                </div>
                <div
                  className="art-stats"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "15px",
                  }}
                >
                  <button
                    className="btn-like"
                    onClick={(e) => handleLike(e, art._id)}
                    style={{
                      background: "none",
                      border: "none",
                      color: art.likes?.includes(user?._id)
                        ? "#ff4b4b"
                        : "rgba(255, 255, 255, 0.5)",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "5px",
                      fontSize: "14px",
                      padding: 0,
                    }}
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill={
                        art.likes?.some(
                          (id) => id.toString() === user?._id?.toString(),
                        )
                          ? "#ff4b4b"
                          : "none"
                      }
                      stroke={
                        art.likes?.some(
                          (id) => id.toString() === user?._id?.toString(),
                        )
                          ? "#ff4b4b"
                          : "currentColor"
                      }
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
  );
};

export default Gallery;
