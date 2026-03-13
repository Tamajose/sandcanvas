import React, { useRef, useEffect } from "react";
import * as THREE from "three";
import { initScene } from "../canvas/scene";
import { startLoop } from "../canvas/loop";
import { SandSystem } from "../canvas/sandSystem";
import GUI from "lil-gui";

const SandCanvas = ({ isLightMode, onResetRef }) => {
  const canvasRef = useRef(null);
  const sandSystemRef = useRef(null);
  const guiRef = useRef(null);
  const isPouringRef = useRef(false);
  const mouseRef = useRef({ x: 0, y: 0 });
  const guiParams = useRef({ color: "#d8d896" });

  useEffect(() => {
    const canvas = canvasRef.current;
    const { scene, camera, renderer } = initScene(canvas);
    const sandSystem = new SandSystem(scene);
    sandSystemRef.current = sandSystem;

    // GUI Setup
    const gui = new GUI({ container: document.body });
    gui.addColor(guiParams.current, "color").name("Sand Color");
    const guiDom = gui.domElement;
    guiDom.style.position = "absolute";
    guiDom.style.display = "none";
    guiDom.style.zIndex = "1000";
    guiRef.current = gui;

    const handleMouseDown = (e) => {
      if (e.button === 0) {
        guiDom.style.display = "none";
        isPouringRef.current = true;
      }
    };

    const handleMouseUp = () => (isPouringRef.current = false);
    const handleMouseLeave = () => (isPouringRef.current = false);
    const handleMouseMove = (event) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouseRef.current.y = -(
        ((event.clientY - rect.top) / rect.height) * 2 -
        1
      );
    };
    const handleContextMenu = (e) => {
      e.preventDefault();
      guiDom.style.left = `${e.clientX}px`;
      guiDom.style.top = `${e.clientY}px`;
      guiDom.style.display = guiDom.style.display === "none" ? "block" : "none";
    };

    canvas.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);
    canvas.addEventListener("mouseleave", handleMouseLeave);
    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("contextmenu", handleContextMenu);

    startLoop(scene, camera, renderer, sandSystem, () => {
      if (isPouringRef.current) {
        for (let i = 0; i < 50; i++) {
          const radius = 0.05;
          const angle = Math.random() * Math.PI * 10;
          const r = Math.random() * radius;
          const spawnX = mouseRef.current.x + Math.cos(angle) * r;
          const spawnY = mouseRef.current.y + Math.sin(angle) * r;
          const hexColor = parseInt(guiParams.current.color.replace("#", "0x"));
          sandSystem.addSand(spawnX, spawnY, hexColor);
        }
      }
      sandSystem.updatePhysics();
      sandSystem.update();
    });

    onResetRef.current = () => sandSystem.reset();

    return () => {
      canvas.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
      canvas.removeEventListener("mouseleave", handleMouseLeave);
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("contextmenu", handleContextMenu);
      gui.destroy();
    };
  }, []);

  useEffect(() => {
    if (sandSystemRef.current) {
      sandSystemRef.current.isLightMode = isLightMode;
    }
  }, [isLightMode]);

  return <canvas ref={canvasRef} id="sand-canvas" />;
};

export default SandCanvas;
