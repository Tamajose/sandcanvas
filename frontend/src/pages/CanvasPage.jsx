import React, { useState, useRef, useEffect } from "react";
import SandCanvas from "../canvas/SandSystem.jsx";
import { saveCreation } from "../api/creations";
import Controls from "../components/Controls";
import ResetModal from "../components/ResetModal";
import SaveModal from "../components/SaveModal";
import ThemeToggle from "../components/ThemeToggle";

const CanvasPage = () => {
  const [isLightMode, setIsLightMode] = useState(
    localStorage.getItem("theme") === "light",
  );
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const onResetRef = useRef(null);

  useEffect(() => {
    const handleThemeChange = () => {
      const mode = localStorage.getItem("theme") === "light";
      setIsLightMode(mode);
    };
    window.addEventListener("themeChange", handleThemeChange);
    return () => window.removeEventListener("themeChange", handleThemeChange);
  }, []);

  const handleSave = async (name, description, isPublic) => {
    const canvas = document.getElementById("sand-canvas");
    canvas.toBlob(async (blob) => {
      const formData = new FormData();
      formData.append("image", blob, "creation.png");
      formData.append("name", name);
      if (description) formData.append("description", description);
      formData.append("isPublic", isPublic);
      
      const token = localStorage.getItem("token");
      if (!token) return alert("No token found!");

      try {
        await saveCreation(formData);
        alert("Creation Saved!");
        setIsSaveModalOpen(false);
      } catch (error) {
        alert(error.message || "Error saving");
      }
    });
  };

  return (
    <>
      <SandCanvas isLightMode={isLightMode} onResetRef={onResetRef} />
      <Controls
        isLightMode={isLightMode}
        onOpenModal={() => setIsResetModalOpen(true)}
        onSave={() => setIsSaveModalOpen(true)}
      />
      {isResetModalOpen && (
        <ResetModal
          onConfirm={() => {
            onResetRef.current();
            setIsResetModalOpen(false);
          }}
          onCancel={() => setIsResetModalOpen(false)}
        />
      )}
      {isSaveModalOpen && (
        <SaveModal
          onConfirm={handleSave}
          onCancel={() => setIsSaveModalOpen(false)}
        />
      )}
    </>
  );
};

export default CanvasPage;
