"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

export function Hero3DBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const sceneCanvas = canvasRef.current;
    if (!sceneCanvas) return;
    const activeCanvas: HTMLCanvasElement = sceneCanvas;

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      canvas: activeCanvas,
      powerPreference: "high-performance",
      preserveDrawingBuffer: true,
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.8));
    renderer.setClearColor(0x020713, 0);

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x020713, 0.028);

    const camera = new THREE.PerspectiveCamera(58, 1, 0.1, 140);
    camera.position.set(0, 7, 18);

    const root = new THREE.Group();
    scene.add(root);

    const floor = new THREE.GridHelper(90, 70, 0x14d8ff, 0x1d3e6e);
    floor.position.y = -5.2;
    floor.material.opacity = 0.34;
    floor.material.transparent = true;
    root.add(floor);

    const farGrid = new THREE.GridHelper(110, 28, 0x8b5cf6, 0x123458);
    farGrid.position.set(0, 10, -36);
    farGrid.rotation.x = Math.PI / 2.5;
    farGrid.material.opacity = 0.13;
    farGrid.material.transparent = true;
    root.add(farGrid);

    const particleCount = 460;
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const cyan = new THREE.Color("#67e8f9");
    const violet = new THREE.Color("#a78bfa");
    const blue = new THREE.Color("#60a5fa");

    for (let index = 0; index < particleCount; index += 1) {
      const stride = index * 3;
      positions[stride] = (Math.random() - 0.5) * 84;
      positions[stride + 1] = Math.random() * 34 - 6;
      positions[stride + 2] = Math.random() * -76 + 12;

      const color = index % 3 === 0 ? cyan : index % 3 === 1 ? violet : blue;
      colors[stride] = color.r;
      colors[stride + 1] = color.g;
      colors[stride + 2] = color.b;
    }

    const particlesGeometry = new THREE.BufferGeometry();
    particlesGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    particlesGeometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    const particles = new THREE.Points(
      particlesGeometry,
      new THREE.PointsMaterial({
        size: 0.08,
        sizeAttenuation: true,
        transparent: true,
        opacity: 0.78,
        vertexColors: true,
      }),
    );
    root.add(particles);

    const ringGroup = new THREE.Group();
    ringGroup.position.set(8, 1.6, -18);
    root.add(ringGroup);

    const ringMaterial = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.18,
      wireframe: true,
    });
    const ringOne = new THREE.Mesh(new THREE.TorusGeometry(4.8, 0.035, 8, 160), ringMaterial);
    const ringTwo = new THREE.Mesh(new THREE.TorusGeometry(6.2, 0.028, 8, 160), ringMaterial.clone());
    ringTwo.rotation.x = Math.PI / 2.8;
    ringTwo.rotation.y = Math.PI / 4;
    ringGroup.add(ringOne, ringTwo);

    const beamMaterial = new THREE.LineBasicMaterial({
      color: 0x22d3ee,
      transparent: true,
      opacity: 0.18,
    });
    for (let index = 0; index < 10; index += 1) {
      const x = -38 + index * 8.5;
      const geometry = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(x, -6, -12 - index * 2),
        new THREE.Vector3(x + 12, 20, -42 - index * 3),
      ]);
      root.add(new THREE.Line(geometry, beamMaterial));
    }

    const pointer = { x: 0, y: 0 };
    const target = { x: 0, y: 0 };

    function handlePointerMove(event: PointerEvent) {
      target.x = (event.clientX / window.innerWidth - 0.5) * 2;
      target.y = (event.clientY / window.innerHeight - 0.5) * 2;
    }

    function handleResize() {
      const width = activeCanvas.clientWidth;
      const height = activeCanvas.clientHeight;
      renderer.setSize(width, height, false);
      camera.aspect = width / Math.max(height, 1);
      camera.updateProjectionMatrix();
    }

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("resize", handleResize);
    handleResize();

    let frameId = 0;
    const clock = new THREE.Clock();

    function animate() {
      const elapsed = clock.getElapsedTime();
      pointer.x += (target.x - pointer.x) * 0.045;
      pointer.y += (target.y - pointer.y) * 0.045;

      root.rotation.y = pointer.x * 0.085;
      root.rotation.x = -pointer.y * 0.035;
      camera.position.x += (pointer.x * 2.2 - camera.position.x) * 0.035;
      camera.position.y += (7 - pointer.y * 0.9 - camera.position.y) * 0.035;
      camera.lookAt(pointer.x * 1.7, -1.2 - pointer.y * 0.7, -18);

      floor.position.z = (elapsed * 4.2) % 2.6;
      farGrid.rotation.z = elapsed * 0.012;
      particles.rotation.y = elapsed * 0.018;
      particles.position.y = Math.sin(elapsed * 0.45) * 0.35;
      ringGroup.rotation.x = elapsed * 0.13;
      ringGroup.rotation.y = elapsed * 0.19 + pointer.x * 0.3;

      renderer.render(scene, camera);
      frameId = window.requestAnimationFrame(animate);
    }

    animate();

    return () => {
      window.cancelAnimationFrame(frameId);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("resize", handleResize);
      renderer.dispose();
      particlesGeometry.dispose();
      ringOne.geometry.dispose();
      ringTwo.geometry.dispose();
      ringMaterial.dispose();
      beamMaterial.dispose();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="absolute inset-0 h-full w-full"
      style={{ pointerEvents: "none", zIndex: 0 }}
    />
  );
}
