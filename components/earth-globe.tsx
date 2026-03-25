"use client";

import { useRef, useState, useEffect, Suspense } from "react";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";

function Earth() {
  const meshRef = useRef<THREE.Mesh>(null);
  
  // Load texture with error handling
  const texture = useLoader(
    THREE.TextureLoader,
    "https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg",
    undefined,
    () => {
      // On error, texture will be undefined
    }
  );

  // Rotate every frame - this ALWAYS runs
  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.002;
    }
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[2, 64, 64]} />
      <meshStandardMaterial
        map={texture}
        color={texture ? undefined : "#1a3a5c"}
      />
    </mesh>
  );
}

function Scene() {
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 3, 5]} intensity={1.2} />
      <Suspense fallback={
        <mesh>
          <sphereGeometry args={[2, 64, 64]} />
          <meshStandardMaterial color="#1a3a5c" />
        </mesh>
      }>
        <Earth />
      </Suspense>
      <OrbitControls
        enableZoom={false}
        enablePan={false}
        enableRotate={false}
      />
    </>
  );
}

export default function EarthGlobe() {
  const [size, setSize] = useState(700);

  useEffect(() => {
    const updateSize = () => {
      const isMobile = window.innerWidth < 768;
      setSize(isMobile ? 400 : 650);
    };

    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  return (
    <div 
      className="globe-spin flex items-center justify-center"
      style={{ width: size, height: size, overflow: 'hidden', borderRadius: '50%' }}
    >
      <Canvas
        camera={{ position: [0, 0, 5], fov: 45 }}
        style={{ background: "rgba(0,0,0,0)" }}
        gl={{ alpha: true, antialias: true }}
      >
        <Scene />
      </Canvas>
    </div>
  );
}
