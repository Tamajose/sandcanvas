import * as THREE from "three";

export class SandSystem {
  constructor(scene) {
    this.gridSize = 400;

    this.grid = Array(this.gridSize)
      .fill(0)
      .map(() => Array(this.gridSize).fill(0));

    this.geometry = new THREE.BufferGeometry();
    this.material = new THREE.PointsMaterial({
      size: (2 / this.gridSize) * 1.3,
      vertexColors: true,
    });

    this.palette = {
      1: new THREE.Color(1.0, 0.85, 0.6), // yellow
      2: new THREE.Color(0.9, 0.3, 0.3), // red
      3: new THREE.Color(0.3, 0.6, 1.0), // blue
      4: new THREE.Color(0.5, 0.9, 0.5), // green
      5: new THREE.Color(0.9, 0.9, 0.9), // white
      6: new THREE.Color(0.6, 0.4, 0.25), // brown
      7: new THREE.Color(1, 0.2, 1), // gray
    };

    this.positions = [];
    this.colors = [];

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

  jitterColor(color, amount = 0.12) {
    return {
      r: THREE.MathUtils.clamp(color.r + (Math.random() - 0.5) * amount, 0, 1),
      g: THREE.MathUtils.clamp(color.g + (Math.random() - 0.5) * amount, 0, 1),
      b: THREE.MathUtils.clamp(color.b + (Math.random() - 0.5) * amount, 0, 1),
    };
  }

  addSand(x, y, colorId = 1) {
    const [gx, gy] = this.worldToGrid(x, y);
    if (gx < 0 || gx >= this.gridSize) return;
    if (gy < 0 || gy >= this.gridSize) return;

    if (this.grid[gy][gx] === 0) this.grid[gy][gx] = colorId;
  }

  updatePhysics() {
    for (let y = 1; y < this.gridSize; y++) {
      for (let x = 0; x < this.gridSize; x++) {
        const sandType = this.grid[y][x];
        if (sandType === 0) continue;

        if (this.grid[y - 1][x] === 0) {
          this.grid[y][x] = 0;
          this.grid[y - 1][x] = sandType;
        } else {
          const dir = Math.random() < 0.5 ? -1 : 1;
          const nx = x + dir;

          if (nx >= 0 && nx < this.gridSize && this.grid[y - 1][nx] === 0) {
            this.grid[y][x] = 0;
            this.grid[y - 1][nx] = sandType;
          }
        }
      }
    }
  }

  update() {
    this.positions.length = 0;
    this.colors.length = 0;

    for (let y = 0; y < this.gridSize; y++) {
      for (let x = 0; x < this.gridSize; x++) {
        const sandType = this.grid[y][x];

        if (sandType !== 0) {
          const [wx, wy] = this.gridToWorld(x, y);
          this.positions.push(wx, wy, 0);

          const base = this.palette[sandType];
          const c = this.jitterColor(base);

          this.colors.push(c.r, c.g, c.b);
        }
      }
    }

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

  reset() {
    this.grid = Array(this.gridSize)
      .fill(0)
      .map(() => Array(this.gridSize).fill(0));

    this.positions = [];
    this.colors = [];

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
