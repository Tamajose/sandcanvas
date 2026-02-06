import * as THREE from "three";

export class SandSystem {
  constructor(scene) {
    this.geometry = new THREE.BufferGeometry();
    this.material = new THREE.PointsMaterial({
      size: 0.1,
      vertexColors: true,
    });

    this.positions = [];
    this.colors = [];
    this.velocities = [];

    this.points = new THREE.Points(this.geometry, this.material);
    this.points.frustumCulled = false;
    scene.add(this.points);
  }

  addParticle(x, y, color) {
    console.log("Adding particle at", x, y);
    this.positions.push(x, y, 0);
    this.colors.push(color.r, color.g, color.b);
    this.velocities.push(0, 0, 0);
    this.update();
  }

  updatePhysics() {
    const gravity = -0.005;

    for (let i = 0; i < this.positions.length; i += 3) {
      this.velocities[i + 1] += gravity;
      this.positions[i + 1] += this.velocities[i + 1];
      if (this.positions[i + 1] < -1) {
        this.positions[i + 1] = -1;
        this.velocities[i + 1] = 0;
      }
    }
  }

  update() {
    this.geometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(this.positions, 3),
    );
    this.geometry.setAttribute(
      "color",
      new THREE.Float32BufferAttribute(this.colors, 3),
    );
    this.geometry.computeBoundingSphere();
  }
}
