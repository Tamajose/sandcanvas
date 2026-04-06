import React from "react";
import { deleteAlbum } from "../api/album";

const API_URL = import.meta.env.VITE_API_URL;

const Albums = ({
  albums,
  viewingAlbum,
  setViewingAlbum,
  editingAlbumId,
  setEditingAlbumId,
  newAlbumNameEdit,
  setNewAlbumNameEdit,
  setIsCreateModalOpen,
  handleRenameAlbum,
  fetchAlbums,
  setSelectedAlbumId,
  setIsAddModalOpen,
  setExpandedCreation,
  handleRemoveImage,
}) => {
  return (
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
                          display: "flex",
                          flexDirection: "column",
                          gap: "8px",
                        }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <input
                          type="text"
                          className="album-input"
                          value={newAlbumNameEdit}
                          onChange={(e) => setNewAlbumNameEdit(e.target.value)}
                          autoFocus
                          style={{ width: "100%" }}
                        />
                        <div
                          style={{ display: "flex", gap: "5px", width: "100%" }}
                        >
                          <button
                            className="btn-album"
                            style={{
                              flex: 1,
                              padding: "6px 10px",
                              fontSize: "12px",
                            }}
                            onClick={() => handleRenameAlbum(album._id)}
                          >
                            Save
                          </button>
                          <button
                            className="btn-album btn-album-secondary"
                            style={{
                              flex: 1,
                              padding: "6px 10px",
                              fontSize: "12px",
                            }}
                            onClick={() => setEditingAlbumId(null)}
                          >
                            Cancel
                          </button>
                        </div>
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
                          src={
                            img.imagePath?.startsWith("http")
                              ? img.imagePath
                              : `${API_URL}${img.imagePath}`
                          }
                          alt="album preview"
                        />
                      </div>
                    ))}
                    {[...Array(Math.max(0, 4 - album.images.length))].map(
                      (_, i) => (
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
                            <rect x="3" y="3" width="18" height="18" rx="2" />
                            <circle cx="8.5" cy="8.5" r="1.5" />
                            <path d="M21 15l-5-5L5 21" />
                          </svg>
                        </div>
                      ),
                    )}
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
                    src={
                      img.imagePath?.startsWith("http")
                        ? img.imagePath
                        : `${API_URL}${img.imagePath}`
                    }
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
  );
};

export default Albums;
