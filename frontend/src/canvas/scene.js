import * as THREE from "three";

export function initScene(canvas) {
  const scene = new THREE.Scene();

  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
  camera.position.z = 1;

  const renderer = new THREE.WebGLRenderer({ canvas });
  renderer.setSize(window.innerWidth, window.innerHeight);

  window.addEventListener("resize", () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  renderer.outputColorSpace = THREE.SRGBColorSpace;

  return { scene, camera, renderer };
}
