import React from "react";

const ResetModal = ({ onConfirm, onCancel }) => {
  return (
    <div
      className="modal-backdrop"
      onClick={(e) => e.target === e.currentTarget && onCancel()}
    >
      <div className="modal-content">
        <h2>Clear Canvas?</h2>
        <p>This will remove all your sand art. This action cannot be undone.</p>
        <div className="modal-actions">
          <button onClick={onConfirm} className="btn-danger">
            Clear
          </button>
          <button onClick={onCancel} className="btn-text">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResetModal;
