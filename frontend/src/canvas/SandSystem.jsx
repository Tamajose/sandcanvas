import React, { useRef, useEffect } from "react";
import p5 from "p5";
import GUI from "lil-gui";

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

      const handlePour = (e) => {
        if (!isPouring) return;

        const rect = p.canvas.getBoundingClientRect();
        const clientX = e.clientX ?? (e.touches && e.touches[0].clientX);
        const clientY = e.clientY ?? (e.touches && e.touches[0].clientY);

        if (clientX === undefined) return;

        let mouseX = clientX - rect.left;
        let mouseY = clientY - rect.top;

        let mouseCol = p.floor(mouseX / w);
        let mouseRow = p.floor(mouseY / w);

        let matrix = 7;
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
            isPouring = true;
            if (gui && gui.domElement) gui.domElement.style.display = "none";
            handlePour(e);
          }
        });

        window.addEventListener("mouseup", () => {
          isPouring = false;
        });

        canvasEl.addEventListener("mousemove", (e) => {
          handlePour(e);
        });

        p.resetCanvas = () => {
          grid = new Uint32Array(cols * rows);
        };
      };

      p.draw = () => {
        isLight = document.body.classList.contains("light-mode");

        // Logic Update Phase
        let nextGrid = new Uint32Array(cols * rows);

        for (let i = 0; i < cols; i++) {
          for (let j = rows - 1; j >= 0; j--) {
            let index = i + j * cols;
            let state = grid[index];

            if (state > 0) {
              let below = i + (j + 1) * cols;
              let dir = p.random(1) < 0.5 ? 1 : -1;
              let belowA = i + dir + (j + 1) * cols;
              let belowB = i - dir + (j + 1) * cols;

              if (j === rows - 1) {
                nextGrid[index] = state;
              } else if (nextGrid[below] === 0 && grid[below] === 0) {
                nextGrid[below] = state;
              } else if (
                i + dir >= 0 &&
                i + dir < cols &&
                nextGrid[belowA] === 0 &&
                grid[belowA] === 0
              ) {
                nextGrid[belowA] = state;
              } else if (
                i - dir >= 0 &&
                i - dir < cols &&
                nextGrid[belowB] === 0 &&
                grid[belowB] === 0
              ) {
                nextGrid[belowB] = state;
              } else {
                nextGrid[index] = state;
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

  return <div ref={containerRef} />;
};

export default SandCanvas;
