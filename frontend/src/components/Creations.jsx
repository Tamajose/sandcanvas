import React from "react";

const API_URL = import.meta.env.VITE_API_URL;

const Creations = ({ creations, setExpandedCreation }) => {
  return (
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
                src={
                  creation.imagePath?.startsWith("http")
                    ? creation.imagePath
                    : `${API_URL}${creation.imagePath}`
                }
                alt="Sand Creation"
              />
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default Creations;
