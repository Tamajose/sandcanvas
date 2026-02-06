import { initScene } from "./src/canvas/scene";
import { startLoop } from "./src/canvas/loop";

const canvas = document.getElementById("sand-canvas");

const { scene, camera, renderer } = initScene(canvas);

startLoop(scene, camera, renderer);
