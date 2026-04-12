import React, { useRef, useEffect, useState } from "react";
import p5 from "p5";
import GUI from "lil-gui";
import "../../styles/controls.css";

const WindIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 19.5 12H2"></path>
  </svg>
);

const ColorIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10"></circle>
    <path d="M12 2v20"></path>
    <path d="M2 12h20"></path>
    <path d="m19.07 4.93-14.14 14.14"></path>
    <path d="m4.93 4.93 14.14 14.14"></path>
  </svg>
);

const EraserIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="m7 21-4.3-4.3c-1-1-1-2.5 0-3.4l9.6-9.6c1-1 2.5-1 3.4 0l5.6 5.6c1 1 1 2.5 0 3.4L13 21"></path>
    <path d="m22 21H7"></path>
    <path d="m5 11 9 9"></path>
  </svg>
);

const ShovelIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M2 22v-5l5-5 5 5v5H2z"></path>
    <path d="M9.5 14.5L16 8"></path>
    <path d="m17 2 5 5"></path>
  </svg>
);

const StructureIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="2" y="14" width="20" height="8" rx="2"></rect>
    <rect x="2" y="2" width="20" height="8" rx="2"></rect>
  </svg>
);

const SpigotIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M7 12h10"></path>
    <path d="M12 7v10"></path>
    <circle cx="12" cy="12" r="10"></circle>
  </svg>
);

const SandCanvas = ({ isLightMode, onResetRef }) => {
  const containerRef = useRef(null);
  const p5Ref = useRef(null);
  const [activeTool, setActiveTool] = useState(null);
  const [isSpigotActiveState, setIsSpigotActiveState] = useState(false);

  useEffect(() => {
    let p5Instance;

    const sketch = (p) => {
      let grid;
      let cols, rows;
      let w = 4;
      let gui;
      let guiParams = { color: "#d8d896" };
      let isLight = isLightMode;

      let isPouring = false;
      let windOffset = 0;
      let isWindSelecting = false;
      let isSpigotActive = false;
      let spigotPos = { x: 0, y: 0 };
      let currentActiveTool = null;
      const SOLID_STATE = 0xff888888;

      const pourAt = (px, py, type = "sand") => {
        let mouseCol = p.floor(px / w);
        let mouseRow = p.floor(py / w);

        let matrix = type === "eraser" || type === "shovel" ? 6 : 2;
        let extent = p.floor(matrix / 2);

        let sandState = 0;
        if (type === "sand") {
          let c = p.color(guiParams.color);
          let r_val = p.red(c);
          let g_val = p.green(c);
          let b_val = p.blue(c);
          sandState = ((r_val << 16) | (g_val << 8) | b_val | 0xff000000) >>> 0;
        } else if (type === "structure") {
          sandState = SOLID_STATE;
        }

        for (let i = -extent; i <= extent; i++) {
          for (let j = -extent; j <= extent; j++) {
            if (
              p.random(1) <
              (type === "eraser" || type === "structure" ? 1 : 0.75)
            ) {
              let col = mouseCol + i;
              let row = mouseRow + j;

              if (col >= 0 && col < cols && row >= 0 && row < rows) {
                let index = col + row * cols;
                if (type === "eraser") {
                  grid[index] = 0;
                } else if (type === "shovel") {
                  // Shovel logic handled in draw loop update phase
                } else if (grid[index] === 0) {
                  grid[index] = sandState;
                }
              }
            }
          }
        }
      };

      const handlePour = () => {
        if (!isPouring || p.frameCount % 2 !== 0) return;
        pourAt(p.mouseX, p.mouseY, currentActiveTool || "sand");
      };

      p.setup = () => {
        let cnv = p.createCanvas(window.innerWidth, window.innerHeight);
        cnv.id("sand-canvas");
        p.pixelDensity(1);

        cols = p.floor(p.width / w);
        rows = p.floor(p.height / w);

        grid = new Uint32Array(cols * rows);

        gui = new GUI({ container: document.body });
        gui.addColor(guiParams, "color").name("Sand Color");
        const guiDom = gui.domElement;
        guiDom.style.position = "absolute";
        guiDom.style.display = "none";
        guiDom.style.zIndex = "1000";

        const canvasEl = cnv.elt;

        canvasEl.addEventListener("contextmenu", (e) => {
          e.preventDefault();
          guiDom.style.left = `${e.clientX}px`;
          guiDom.style.top = `${e.clientY}px`;
          guiDom.style.display =
            guiDom.style.display === "none" ? "block" : "none";
        });

        canvasEl.addEventListener("mousedown", (e) => {
          if (e.button === 0) {
            if (isWindSelecting) return;
            isPouring = true;
            if (gui && gui.domElement) gui.domElement.style.display = "none";
          }
        });

        window.addEventListener("mouseup", () => {
          isPouring = false;
        });

        canvasEl.addEventListener("mousemove", (e) => {});

        p.resetCanvas = () => {
          grid = new Uint32Array(cols * rows);
        };

        p.keyPressed = () => {
          const key = p.key.toLowerCase();
          if (key === "w") {
            isWindSelecting = !isWindSelecting;
            currentActiveTool = isWindSelecting ? "wind" : null;
          } else if (key === "d") {
            if (isSpigotActive || currentActiveTool === "spigot") {
              isSpigotActive = false;
              setIsSpigotActiveState(false);
              currentActiveTool = null;
            } else {
              currentActiveTool = "spigot";
            }
            isWindSelecting = false;
          } else if (key === "e") {
            currentActiveTool =
              currentActiveTool === "eraser" ? null : "eraser";
            isWindSelecting = false;
          } else if (key === "s") {
            currentActiveTool =
              currentActiveTool === "shovel" ? null : "shovel";
            isWindSelecting = false;
          } else if (key === "o") {
            currentActiveTool =
              currentActiveTool === "structure" ? null : "structure";
            isWindSelecting = false;
          }
          setActiveTool(currentActiveTool);
        };

        p.mousePressed = () => {
          if (currentActiveTool === "wind") {
            if (p.mouseX < p.width / 3) {
              windOffset = 1.5;
            } else if (p.mouseX > (2 * p.width) / 3) {
              windOffset = -1.5;
            } else {
              windOffset = 0;
            }
            isWindSelecting = false;
            currentActiveTool = null;
            setActiveTool(null);
            return false;
          }

          if (currentActiveTool === "spigot") {
            spigotPos = { x: p.mouseX, y: p.mouseY };
            isSpigotActive = true;
            setIsSpigotActiveState(true);
            currentActiveTool = null;
            setActiveTool(null);
            return false;
          }
        };
      };

      p.draw = () => {
        isLight = document.body.classList.contains("light-mode");

        if (isWindSelecting) {
          p.cursor("crosshair");
        } else {
          p.cursor("default");
        }

        if (isPouring) {
          handlePour();
        }

        if (isSpigotActive) {
          pourAt(spigotPos.x, spigotPos.y, "sand");
        }

        // Logic Update Phase
        let nextGrid = new Uint32Array(cols * rows);

        let currentWindOffset = 0;
        if (windOffset !== 0) {
          let magnitude = p.frameCount % 2 === 0 ? 1 : 2;
          currentWindOffset = Math.sign(windOffset) * magnitude;
        }

        for (let i = 0; i < cols; i++) {
          for (let j = rows - 1; j >= 0; j--) {
            let index = i + j * cols;
            let state = grid[index];

            if (state > 0) {
              if (state === SOLID_STATE) {
                nextGrid[index] = state;
                continue;
              }

              // Shovel (Bulldozer) logic - Pushing
              if (currentActiveTool === "shovel" && isPouring) {
                let dx = (p.mouseX - p.pmouseX) * 2;
                let dy = (p.mouseY - p.pmouseY) * 2;
                let mouseCol = p.floor(p.mouseX / w);
                let mouseRow = p.floor(p.mouseY / w);
                let dist = p.dist(i, j, mouseCol, mouseRow);

                if (dist < 8) {
                  let targetI = p.floor(i + dx / w);
                  let targetJ = p.floor(j + dy / w);
                  if (
                    targetI >= 0 &&
                    targetI < cols &&
                    targetJ >= 0 &&
                    targetJ < rows
                  ) {
                    let targetIndex = targetI + targetJ * cols;
                    if (nextGrid[targetIndex] === 0) {
                      nextGrid[targetIndex] = state;
                      continue;
                    }
                  }
                }
              }

              if (j === rows - 1) {
                nextGrid[index] = state;
                continue;
              }

              // Displace horizontal position by currentWindOffset
              let targetI = i + currentWindOffset;

              // Standard sand movement but centered around targetI
              let below = targetI + (j + 1) * cols;
              let dir = p.random(1) < 0.5 ? 1 : -1;
              let belowA = targetI + dir + (j + 1) * cols;
              let belowB = targetI - dir + (j + 1) * cols;

              if (
                targetI >= 0 &&
                targetI < cols &&
                nextGrid[below] === 0 &&
                grid[below] === 0
              ) {
                nextGrid[below] = state;
              } else if (
                targetI + dir >= 0 &&
                targetI + dir < cols &&
                nextGrid[belowA] === 0 &&
                grid[belowA] === 0
              ) {
                nextGrid[belowA] = state;
              } else if (
                targetI - dir >= 0 &&
                targetI - dir < cols &&
                nextGrid[belowB] === 0 &&
                grid[belowB] === 0
              ) {
                nextGrid[belowB] = state;
              } else {
                let straightBelow = i + (j + 1) * cols;
                if (
                  nextGrid[straightBelow] === 0 &&
                  grid[straightBelow] === 0
                ) {
                  nextGrid[straightBelow] = state;
                } else {
                  nextGrid[index] = state;
                }
              }
            }
          }
        }
        grid = nextGrid;

        // Render Phase
        p.background(isLight ? "#fff7e0" : "#2a2a2a");
        p.noStroke();
        for (let i = 0; i < cols; i++) {
          for (let j = 0; j < rows; j++) {
            let state = grid[i + j * cols];
            if (state > 0) {
              let r = (state >>> 16) & 255;
              let g = (state >>> 8) & 255;
              let b = state & 255;
              p.fill(r, g, b);
              p.square(i * w, j * w, w);
            }
          }
        }
      };

      p.windowResized = () => {
        p.resizeCanvas(window.innerWidth, window.innerHeight);
        cols = p.floor(p.width / w);
        rows = p.floor(p.height / w);
        grid = new Uint32Array(cols * rows);
      };
    };

    p5Instance = new p5(sketch, containerRef.current);
    p5Ref.current = p5Instance;

    if (onResetRef) {
      onResetRef.current = () => {
        if (p5Ref.current && p5Ref.current.resetCanvas) {
          p5Ref.current.resetCanvas();
        }
      };
    }

    return () => {
      p5Instance.remove();
      const guis = document.querySelectorAll(".lil-gui");
      guis.forEach((gui) => gui.remove());
    };
  }, []);

  const isAnyToolActive = activeTool !== null;

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      <div className="controls-info">
        <div
          className={`control-item ${activeTool === "wind" ? "active" : ""} ${isAnyToolActive && activeTool !== "wind" ? "inactive" : ""}`}
        >
          <div className="control-icon">
            <WindIcon />
          </div>
          <div className="control-label">W</div>
        </div>
        <div
          className={`control-item ${activeTool === "eraser" ? "active" : ""} ${isAnyToolActive && activeTool !== "eraser" ? "inactive" : ""}`}
        >
          <div className="control-icon">
            <EraserIcon />
          </div>
          <div className="control-label">E</div>
        </div>
        <div
          className={`control-item ${activeTool === "shovel" ? "active" : ""} ${isAnyToolActive && activeTool !== "shovel" ? "inactive" : ""}`}
        >
          <div className="control-icon">
            <ShovelIcon />
          </div>
          <div className="control-label">S</div>
        </div>
        <div
          className={`control-item ${activeTool === "structure" ? "active" : ""} ${isAnyToolActive && activeTool !== "structure" ? "inactive" : ""}`}
        >
          <div className="control-icon">
            <StructureIcon />
          </div>
          <div className="control-label">O</div>
        </div>
        <div
          className={`control-item ${activeTool === "spigot" || isSpigotActiveState ? "active" : ""} ${isAnyToolActive && activeTool !== "spigot" ? "inactive" : ""}`}
        >
          <div className="control-icon">
            <SpigotIcon />
          </div>
          <div className="control-label">D</div>
        </div>
        <div className="control-divider" />
        <div className="control-item">
          <div className="control-icon">
            <ColorIcon />
          </div>
          <div className="control-label">Right Click</div>
        </div>
      </div>
      <div ref={containerRef} />
    </div>
  );
};

export default SandCanvas;
