export function startLoop(scene, camera, renderer, sandSystem, onFrame) {
  function animate() {
    requestAnimationFrame(animate);

    if (onFrame) onFrame();
    sandSystem.updatePhysics();
    sandSystem.update();

    renderer.render(scene, camera);
  }
  animate();
}
