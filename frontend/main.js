import { initScene } from "./src/canvas/scene";
import { startLoop } from "./src/canvas/loop";
import { SandSystem } from "./src/canvas/sandSystem";

const canvas = document.getElementById("sand-canvas");

const { scene, camera, renderer } = initScene(canvas);

const sandSystem = new SandSystem(scene);

let isPouring = false;
let mouseX = 0;
let mouseY = 0;

canvas.addEventListener("click", (event) => {
  const rect = canvas.getBoundingClientRect();

  const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  const y = -(((event.clientY - rect.top) / rect.height) * 2 - 1);

  sandSystem.addParticle(x, y, { r: 1, g: 0, b: 0 });
});

startLoop(scene, camera, renderer, sandSystem);
