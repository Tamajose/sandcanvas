import React, { useState } from "react";

const SaveModal = ({ onConfirm, onCancel }) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const handleSave = () => {
    if (!name.trim()) {
      alert("Creation Name is mandatory!");
      return;
    }
    onConfirm(name, description);
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
        <div className="modal-actions">
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
