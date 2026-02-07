import * as THREE from "three";

export class SandSystem {
  constructor(scene) {
    this.geometry = new THREE.BufferGeometry();
    this.material = new THREE.PointsMaterial({
      size: 2 / this.gridSize,
      vertexColors: true,
    });

    this.positions = [];
    this.colors = [];

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
    const stepsPerFrame = 6;

    for (let step = 0; step < stepsPerFrame; step++) {
      for (let p = 0; p < this.positions.length; p += 3) {
        const gravity = 0.01;

        let x = this.positions[p];
        let y = this.positions[p + 1];

        let [i, j] = this.worldToGrid(x, y);

        if (j <= 0) {
          y = -1;
          this.grid[i][0] = true;
          const [, wy] = this.gridToWorld(i, 0);
          this.positions[p + 1] = wy;
          continue;
        }

        if (!this.grid[i][j - 1]) {
          const [, wy] = this.gridToWorld(i, j - 1);
          this.positions[p + 1] = wy;
          continue;
        }

        const dirs = Math.random() < 0.5 ? [-1, 1] : [1, -1];
        let moved = false;

        for (const d of dirs) {
          const ni = i + d;
          if (ni >= 0 && ni < this.gridSize && !this.grid[ni][j - 1]) {
            const [wx, wy] = this.gridToWorld(ni, j - 1);
            this.positions[p] = wx;
            this.positions[p + 1] = wy;
            moved = true;
            break;
          }
        }
        if (!moved) {
          this.grid[i][j] = true;
          continue;
        }
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
