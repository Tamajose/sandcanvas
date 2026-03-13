import React, { useState, useRef, useEffect } from "react";
import SandCanvas from "../canvas/SandSystem.jsx";
import Controls from "../components/Controls";
import ResetModal from "../components/ResetModal";
import ThemeToggle from "../components/ThemeToggle";

const CanvasPage = () => {
  const [isLightMode, setIsLightMode] = useState(
    localStorage.getItem("theme") === "light",
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const onResetRef = useRef(null);

  useEffect(() => {
    const handleThemeChange = () => {
      const mode = localStorage.getItem("theme") === "light";
      setIsLightMode(mode);
    };
    window.addEventListener("themeChange", handleThemeChange);
    return () => window.removeEventListener("themeChange", handleThemeChange);
  }, []);

  const handleSave = async () => {
    const canvas = document.getElementById("sand-canvas");
    canvas.toBlob(async (blob) => {
      const formData = new FormData();
      formData.append("image", blob, "creation.png");
      const token = localStorage.getItem("token");
      if (!token) return alert("No token found!");

      try {
        const response = await fetch("http://localhost:3000/api/creations", {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });
        if (response.ok) alert("Creation Saved!");
        else alert("Failed to save");
      } catch (error) {
        alert("Error saving");
      }
    });
  };

  return (
    <>
      <SandCanvas isLightMode={isLightMode} onResetRef={onResetRef} />
      <Controls
        isLightMode={isLightMode}
        onOpenModal={() => setIsModalOpen(true)}
        onSave={handleSave}
      />
      {isModalOpen && (
        <ResetModal
          onConfirm={() => {
            onResetRef.current();
            setIsModalOpen(false);
          }}
          onCancel={() => setIsModalOpen(false)}
        />
      )}
    </>
  );
};

export default CanvasPage;
