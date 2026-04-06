import React, { useState } from "react";

const SaveModal = ({ onConfirm, onCancel }) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isPublic, setIsPublic] = useState(true);

  const handleSave = () => {
    if (!name.trim()) {
      alert("Creation Name is mandatory!");
      return;
    }
    onConfirm(name, description, isPublic);
  };

  return (
    <div
      className="modal-backdrop"
      onClick={(e) => e.target === e.currentTarget && onCancel()}
    >
      <div className="modal-content">
        <h2>Save Creation</h2>
        <div className="modal-form-group">
          <label>Creation Name *</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Name your creation"
            required
            className="modal-input"
            autoFocus
          />
        </div>
        <div className="modal-form-group">
          <label>Description (Optional)</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add a description"
            className="modal-input"
            rows="3"
          />
        </div>
        <div className="modal-form-group" style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "15px" }}>
          <input
            type="checkbox"
            id="isPublic"
            checked={isPublic}
            onChange={(e) => setIsPublic(e.target.checked)}
            style={{ width: "18px", height: "18px", cursor: "pointer" }}
          />
          <label htmlFor="isPublic" style={{ cursor: "pointer", margin: 0, fontSize: "14px" }}>
            Make Creation Public
          </label>
        </div>
        <div className="modal-actions" style={{ marginTop: "20px" }}>
          <button onClick={handleSave} className="btn-primary">
            Save
          </button>
          <button onClick={onCancel} className="btn-text">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default SaveModal;
