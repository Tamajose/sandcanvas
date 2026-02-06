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

    this.points = new THREE.Points(this.geometry, this.material);
    this.points.frustumCulled = false;
    scene.add(this.points);
  }

  addParticle(x, y, color) {
    console.log("Adding particle at", x, y);
    this.positions.push(x, y, 0);
    this.colors.push(color.r, color.g, color.b);
    this.update();
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
