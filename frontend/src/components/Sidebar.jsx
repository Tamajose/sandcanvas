import React from "react";

const Sidebar = ({ activeSection, setActiveSection }) => {
  return (
    <aside className="sidebar">
      <nav className="sidebar-nav">
        <button
          className={`sidebar-item ${activeSection === "home" ? "active" : ""}`}
          onClick={() => setActiveSection("home")}
        >
          <svg className="sidebar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
          <span>Home</span>
        </button>
        <button
          className={`sidebar-item ${activeSection === "creations" ? "active" : ""}`}
          onClick={() => setActiveSection("creations")}
        >
          <svg className="sidebar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="7" height="7" />
            <rect x="14" y="3" width="7" height="7" />
            <rect x="14" y="14" width="7" height="7" />
            <rect x="3" y="14" width="7" height="7" />
          </svg>
          <span>Creations</span>
        </button>
        <button
          className={`sidebar-item ${activeSection === "albums" ? "active" : ""}`}
          onClick={() => setActiveSection("albums")}
        >
          <svg
            className="sidebar-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <rect x="3" y="4" width="18" height="16" rx="2" />
            <path d="M3 10h18" />
          </svg>
          <span>Albums</span>
        </button>
        <button
          className={`sidebar-item ${activeSection === "profile" ? "active" : ""}`}
          onClick={() => setActiveSection("profile")}
        >
          <svg className="sidebar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
          <span>Profile</span>
        </button>
      </nav>
    </aside>
  );
};

export default Sidebar;
