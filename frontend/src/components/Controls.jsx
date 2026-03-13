import React from "react";
import ThemeToggle from "./ThemeToggle";

const Controls = ({ isLightMode, onOpenModal, onSave }) => {
  return (
    <div id="ui-layer">
      <div className="ui-left">
        <a href="/profile" className="btn-icon">
          Back
        </a>
        <button onClick={onOpenModal} className="btn-icon">
          Reset
        </button>
        <button onClick={onSave} className="btn-icon">
          Save
        </button>
      </div>
      <div className="ui-right">
        <ThemeToggle />
      </div>
    </div>
  );
};

export default Controls;
