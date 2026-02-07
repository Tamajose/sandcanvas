import * as THREE from "three";

export class SandSystem {
  constructor(scene) {
    this.gridSize = 200;

    this.grid = Array(this.gridSize)
      .fill(0)
      .map(() => Array(this.gridSize).fill(0));

    this.geometry = new THREE.BufferGeometry();
    this.material = new THREE.PointsMaterial({
      size: 2 / this.gridSize,
      color: 0x2596be,
    });

    this.positions = [];

    this.points = new THREE.Points(this.geometry, this.material);
    this.points.frustumCulled = false;
    scene.add(this.points);
  }

  worldToGrid(x, y) {
    const gx = Math.floor(((x + 1) / 2) * (this.gridSize - 1));
    const gy = Math.floor(((y + 1) / 2) * (this.gridSize - 1));
    return [gx, gy];
  }

  gridToWorld(x, y) {
    const wx = (x / (this.gridSize - 1)) * 2 - 1;
    const wy = (y / (this.gridSize - 1)) * 2 - 1;
    return [wx, wy];
  }

  addSand(x, y) {
    const [gx, gy] = this.worldToGrid(x, y);
    if (gx < 0 || gx >= this.gridSize) return;
    if (gy < 0 || gy >= this.gridSize) return;

    this.grid[gy][gx] = 1;
  }

  updatePhysics() {
    for (let y = 1; y < this.gridSize; y++) {
      for (let x = 0; x < this.gridSize; x++) {
        if (this.grid[y][x] !== 1) continue;

        if (this.grid[y - 1][x] === 0) {
          this.grid[y][x] = 0;
          this.grid[y - 1][x] = 1;
        } else {
          const dir = Math.random() < 0.5 ? -1 : 1;
          const nx = x + dir;

          if (nx >= 0 && nx < this.gridSize && this.grid[y - 1][nx] === 0) {
            this.grid[y][x] = 0;
            this.grid[y - 1][nx] = 1;
          }
        }
      }
    }
  }

  update() {
    this.positions.length = 0;

    for (let y = 0; y < this.gridSize; y++) {
      for (let x = 0; x < this.gridSize; x++) {
        if (this.grid[y][x] === 1) {
          const [wx, wy] = this.gridToWorld(x, y);
          this.positions.push(wx, wy, 0);
        }
      }
    }

    this.geometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(this.positions, 3),
    );
    this.geometry.computeBoundingSphere();
  }
}
