export function startLoop(scene, camera, renderer, sandSystem) {
  function animate() {
    requestAnimationFrame(animate);

    sandSystem.updatePhysics();
    sandSystem.update();

    renderer.render(scene, camera);
  }
  animate();
}
