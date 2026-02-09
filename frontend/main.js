import { initScene } from "./src/canvas/scene";
import { startLoop } from "./src/canvas/loop";
import { SandSystem } from "./src/canvas/sandSystem";

const canvas = document.getElementById("sand-canvas");

const { scene, camera, renderer } = initScene(canvas);

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

let currentColor = 1;
const MAX_COLOR = 7;

canvas.addEventListener("wheel", (e) => {
  e.preventDefault();

  if (e.deltaY > 0) {
    currentColor++;
  } else {
    currentColor--;
  }

  if (currentColor < 1) currentColor = MAX_COLOR;
  if (currentColor > MAX_COLOR) currentColor = 1;
});

startLoop(scene, camera, renderer, sandSystem, () => {
  if (isPouring) {
    for (let i = 0; i < 5; i++) {
      const radius = 0.02;
      const angle = Math.random() * Math.PI * 2;
      const r = Math.random() * radius;
      const spawnX = mouseX + Math.cos(angle) * r;
      const spawnY = mouseY + Math.sin(angle) * r;
      sandSystem.addSand(spawnX, spawnY, currentColor);
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

resetModal.addEventListener("click", (e) => {
  if (e.target === resetModal) {
    resetModal.style.display = "none";
  }
});
