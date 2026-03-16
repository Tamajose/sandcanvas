import React, { useRef, useEffect } from "react";
import p5 from "p5";
import GUI from "lil-gui";

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

const SandCanvas = ({ isLightMode, onResetRef }) => {
  const containerRef = useRef(null);
  const p5Ref = useRef(null);

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

      const handlePour = () => {
        if (!isPouring) return;

        let mouseCol = p.floor(p.mouseX / w);
        let mouseRow = p.floor(p.mouseY / w);

        let matrix = 2;
        let extent = p.floor(matrix / 2);

        let c = p.color(guiParams.color);
        let r_val = p.red(c);
        let g_val = p.green(c);
        let b_val = p.blue(c);
        let sandState =
          ((r_val << 16) | (g_val << 8) | b_val | 0xff000000) >>> 0;

        for (let i = -extent; i <= extent; i++) {
          for (let j = -extent; j <= extent; j++) {
            if (p.random(1) < 0.75) {
              let col = mouseCol + i;
              let row = mouseRow + j;

              if (col >= 0 && col < cols && row >= 0 && row < rows) {
                let index = col + row * cols;
                if (grid[index] === 0) {
                  grid[index] = sandState;
                }
              }
            }
          }
        }
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
          if (p.key.toLowerCase() === "w") {
            isWindSelecting = !isWindSelecting;
          }
        };

        p.mousePressed = () => {
          if (isWindSelecting) {
            if (p.mouseX < p.width / 2) {
              windOffset = 1.5;
            } else {
              windOffset = -1.5;
            }
            isWindSelecting = false;
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

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      <div className="controls-info">
        <div className="control-item">
          <div className="control-icon">
            <WindIcon />
          </div>
          <div className="control-label">W Key</div>
        </div>
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
