import * as THREE from "three";

export class SandSystem {
  constructor(scene) {
    this.geometry = new THREE.BufferGeometry();
    this.material = new THREE.PointsMaterial({
      size: 5,
      vertexColors: true,
    });

    this.positions = [];
    this.colors = [];
    this.velocities = [];

    this.gridSize = 200;
    this.grid = Array(this.gridSize)
      .fill(0)
      .map(() => Array(this.gridSize).fill(false));

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

  worldToGrid(x, y) {
    const i = Math.floor(((x + 1) / 2) * (this.gridSize - 1));
    const j = Math.floor(((y + 1) / 2) * (this.gridSize - 1));
    return [i, j];
  }

  gridToWorld(i, j) {
    const x = (i / (this.gridSize - 1)) * 2 - 1;
    const y = (j / (this.gridSize - 1)) * 2 - 1;
    return [x, y];
  }

  updatePhysics() {
    const gravity = -0.005;

    for (let p = 0; p < this.positions.length; p += 3) {
      const gravity = 0.01;

      let x = this.positions[p];
      let y = this.positions[p + 1];

      let [i, j] = this.worldToGrid(x, y);

      if (j <= 0) {
        y = -1;
        this.grid[i][0] = true;
        this.positions[p + 1] = y;
        continue;
      }

      if (j > 0 && !this.grid[i][j - 1]) {
        y -= gravity;
        j -= 1;
      } else {
        let moved = false;
        if (i > 0 && !this.grid[i - 1][j - 1]) {
          i -= 1;
          j -= 1;
          y -= gravity;
          moved = true;
        } else if (i < this.gridSize - 1 && !this.grid[i + 1][j - 1]) {
          i += 1;
          j -= 1;
          y -= gravity;
          moved = true;
        }
        if (!moved) {
          this.grid[i][j] = true;
          continue;
        }
      }
      this.positions[p] = x;
      this.positions[p + 1] = y;
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
