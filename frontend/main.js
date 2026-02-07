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

window.addEventListener("keydown", (e) => {
  if (e.key === "1") currentColor = 1;
  if (e.key === "2") currentColor = 2;
  if (e.key === "3") currentColor = 3;
});

startLoop(scene, camera, renderer, sandSystem, () => {
  if (isPouring) {
    for (let i = 0; i < 5; i++) {
      sandSystem.addSand(mouseX, mouseY, currentColor);
    }
  }

  sandSystem.updatePhysics();
  sandSystem.update();
});
