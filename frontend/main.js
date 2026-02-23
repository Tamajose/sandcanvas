import * as THREE from "three";
import { initScene } from "./src/canvas/scene";
import { startLoop } from "./src/canvas/loop";
import { SandSystem } from "./src/canvas/sandSystem";
import GUI from "lil-gui";

const canvas = document.getElementById("sand-canvas");

const { scene, camera, renderer } = initScene(canvas);

const themeToggle = document.getElementById("themeToggle");
const moonIcon = document.getElementById("moonIcon");
const sunIcon = document.getElementById("sunIcon");

const applyTheme = (theme) => {
  if (theme === "light") {
    document.body.classList.add("light-mode");
    scene.background = new THREE.Color(0xd3d3cf);
    moonIcon.style.display = "none";
    sunIcon.style.display = "block";
  } else {
    document.body.classList.remove("light-mode");
    scene.background = new THREE.Color(0x2a2a2a);
    moonIcon.style.display = "block";
    sunIcon.style.display = "none";
  }
};

const savedTheme = localStorage.getItem("theme") || "dark";
applyTheme(savedTheme);

themeToggle.addEventListener("click", () => {
  const currentTheme = document.body.classList.contains("light-mode")
    ? "dark"
    : "light";
  localStorage.setItem("theme", currentTheme);
  applyTheme(currentTheme);
});

const sandSystem = new SandSystem(scene);

let isPouring = false;
let mouseX = 0;
let mouseY = 0;

canvas.addEventListener("mousedown", () => {
  isPouring = true;
});

canvas.addEventListener("mouseup", () => {
  isPouring = false;
});

canvas.addEventListener("mouseleave", () => {
  isPouring = false;
});

canvas.addEventListener("mousemove", (event) => {
  const rect = canvas.getBoundingClientRect();

  mouseX = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  mouseY = -(((event.clientY - rect.top) / rect.height) * 2 - 1);
});

const guiParams = {
  color: "#ffff33",
};

const gui = new GUI({ container: document.body });
gui.addColor(guiParams, "color").name("Sand Color");
const guiDom = gui.domElement;
guiDom.style.position = "absolute";
guiDom.style.display = "none";
guiDom.style.zIndex = "1000";

canvas.addEventListener("contextmenu", (e) => {
  e.preventDefault();
  guiDom.style.left = `${e.clientX}px`;
  guiDom.style.top = `${e.clientY}px`;
  guiDom.style.display = guiDom.style.display === "none" ? "block" : "none";
});

canvas.addEventListener("mousedown", (e) => {
  if (e.button === 0) {
    guiDom.style.display = "none";
    isPouring = true;
  }
});

startLoop(scene, camera, renderer, sandSystem, () => {
  if (isPouring) {
    for (let i = 0; i < 5; i++) {
      const radius = 0.02;
      const angle = Math.random() * Math.PI * 2;
      const r = Math.random() * radius;
      const spawnX = mouseX + Math.cos(angle) * r;
      const spawnY = mouseY + Math.sin(angle) * r;

      const hexColor = parseInt(guiParams.color.replace("#", "0x"));
      sandSystem.addSand(spawnX, spawnY, hexColor);
    }
  }

  sandSystem.updatePhysics();
  sandSystem.update();
});

const resetBtn = document.getElementById("reset-btn");
const resetModal = document.getElementById("reset-modal");
const confirmBtn = document.getElementById("confirm-reset");
const cancelBtn = document.getElementById("cancel-reset");

resetBtn.addEventListener("click", () => {
  resetModal.style.display = "flex";
  isPouring = false;
});

cancelBtn.addEventListener("click", () => {
  resetModal.style.display = "none";
});

confirmBtn.addEventListener("click", () => {
  sandSystem.reset();
  resetModal.style.display = "none";
});

const saveBtn = document.getElementById("save-btn");

saveBtn.addEventListener("click", () => {
  canvas.toBlob(async (blob) => {
    const formData = new FormData();
    formData.append("image", blob, "creation.png");

    const token = localStorage.getItem("token");

    if (!token) {
      alert("No token found!");
      return;
    }

    try {
      const response = await fetch("http://localhost:3000/api/creations", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        alert("Creation Saved!");
      } else {
        console.error("Failed to save");
        alert("Failed to save");
      }
    } catch (error) {
      console.error("Error saving: ", error);
      alert("Error saving");
    }
  });
});

resetModal.addEventListener("click", (e) => {
  if (e.target === resetModal) {
    resetModal.style.display = "none";
  }
});
