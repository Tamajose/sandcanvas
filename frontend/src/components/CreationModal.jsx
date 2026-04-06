import React from "react";
import Comments from "./Comments";

const API_URL = import.meta.env.VITE_API_URL;

const CreationModal = ({
  expandedCreation,
  setExpandedCreation,
  isEditingCreation,
  setIsEditingCreation,
  editCreationName,
  setEditCreationName,
  editCreationDesc,
  setEditCreationDesc,
  user,
  handleLike,
  handleTogglePrivacy,
  handleDeleteCreation,
  handleUpdateCreation,
}) => {
  if (!expandedCreation) return null;

  return (
    <div
      className="modal-backdrop"
      style={{ display: "flex" }}
      onClick={() => {
        setExpandedCreation(null);
        setIsEditingCreation(false);
      }}
    >
      <span className="close-modal">&times;</span>
      <div
        className="expanded-modal-container"
        onClick={(e) => e.stopPropagation()}
      >
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
          <div
            className="expanded-header"
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              marginBottom: "15px",
            }}
          >
            <div style={{ flex: 1, paddingRight: "15px" }}>
              {isEditingCreation ? (
                <input
                  type="text"
                  className="album-input"
                  value={editCreationName}
                  onChange={(e) => setEditCreationName(e.target.value)}
                  style={{
                    fontSize: "20px",
                    marginBottom: "5px",
                    width: "100%",
                  }}
                  autoFocus
                />
              ) : (
                <h2 className="expanded-title">
                  {expandedCreation.name || "Untitled Creation"}
                </h2>
              )}

              <div className="expanded-creator">
                <span>
                  {expandedCreation.userID?.name ||
                    user?.name ||
                    "Unknown Artist"}
                </span>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "15px",
                alignItems: "center",
              }}
            >
              <button
                className="modal-action-icon"
                onClick={(e) => handleLike(e, expandedCreation._id)}
                title="Like Creation"
                style={{
                  color: expandedCreation.likes?.some(
                    (id) => id.toString() === user?._id?.toString(),
                  )
                    ? "#ff4b4b"
                    : "",
                }}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill={
                    expandedCreation.likes?.some(
                      (id) => id.toString() === user?._id?.toString(),
                    )
                      ? "#ff4b4b"
                      : "none"
                  }
                  stroke={
                    expandedCreation.likes?.some(
                      (id) => id.toString() === user?._id?.toString(),
                    )
                      ? "#ff4b4b"
                      : "currentColor"
                  }
                  strokeWidth="2"
                >
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
                <span
                  style={{
                    fontSize: "14px",
                    fontWeight: "600",
                    marginTop: "2px",
                  }}
                >
                  {expandedCreation.likes?.length || 0}
                </span>
              </button>

              {(expandedCreation.userID?._id === user?._id ||
                expandedCreation.userID === user?._id) && (
                <>
                  <button
                    className="modal-action-icon"
                    onClick={() => {
                      if (!isEditingCreation) {
                        setEditCreationName(expandedCreation.name || "");
                        setEditCreationDesc(
                          expandedCreation.description || "",
                        );
                      }
                      setIsEditingCreation(!isEditingCreation);
                    }}
                    title="Edit Creation"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                  </button>

                  <button
                    className="modal-action-icon"
                    onClick={(e) =>
                      handleTogglePrivacy(e, expandedCreation._id)
                    }
                    title={
                      expandedCreation.isPublic !== false
                        ? "Make Private"
                        : "Make Public"
                    }
                  >
                    {expandedCreation.isPublic !== false ? (
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                      </svg>
                    ) : (
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                        <line x1="1" y1="1" x2="23" y2="23"></line>
                      </svg>
                    )}
                  </button>

                  <button
                    className="modal-action-icon delete"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteCreation(expandedCreation._id);
                      setExpandedCreation(null);
                    }}
                    title="Delete Creation"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="3 6 5 6 21 6"></polyline>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                  </button>
                </>
              )}
            </div>
          </div>

          {isEditingCreation ? (
            <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
              <textarea
                className="album-input bio-textarea"
                value={editCreationDesc}
                onChange={(e) => setEditCreationDesc(e.target.value)}
                placeholder="Creation description..."
                style={{
                  marginTop: "0",
                  marginBottom: "10px",
                  width: "100%",
                }}
              />
              <div style={{ display: "flex", gap: "10px", marginBottom: "30px" }}>
                <button
                  className="btn-album"
                  style={{ flex: 1 }}
                  onClick={handleUpdateCreation}
                >
                  Save Changes
                </button>
                <button
                  className="btn-album btn-album-secondary"
                  style={{ flex: 1 }}
                  onClick={() => setIsEditingCreation(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            expandedCreation.description && (
              <p className="expanded-desc">
                {expandedCreation.description}
              </p>
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
              <span>
                Created:{" "}
                {new Date(expandedCreation.createdAt).toLocaleDateString(
                  "en-GB",
                )}
              </span>
            )}
          </div>

          <Comments creationId={expandedCreation._id} currentUser={user} />
        </div>
      </div>
    </div>
  );
};

export default CreationModal;
