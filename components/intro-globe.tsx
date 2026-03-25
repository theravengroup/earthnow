"use client";

import { useRef, Suspense } from "react";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import * as THREE from "three";

function Earth() {
  const meshRef = useRef<THREE.Mesh>(null);
  
  // Load the bright blue marble texture
  const texture = useLoader(
    THREE.TextureLoader,
    "//unpkg.com/three-globe/example/img/earth-blue-marble.jpg",
    undefined,
    () => {
      // On error, texture will be undefined
    }
  );

  // Slow rotation
  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.001;
    }
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[2, 64, 64]} />
      <meshStandardMaterial
        map={texture}
        color={texture ? undefined : "#1a5a8c"}
        emissive={texture ? "#112233" : "#0a2a4a"}
        emissiveIntensity={0.15}
      />
    </mesh>
  );
}

function Scene() {
  return (
    <>
      {/* Bright ambient light for overall visibility */}
      <ambientLight intensity={1.0} />
      {/* Strong directional light for definition - positioned as specified */}
      <directionalLight position={[5, 3, 5]} intensity={1.5} />
      {/* Additional fill light from opposite side */}
      <directionalLight position={[-3, -1, -3]} intensity={0.4} />
      <Suspense fallback={
        <mesh>
          <sphereGeometry args={[2, 64, 64]} />
          <meshStandardMaterial color="#1a5a8c" />
        </mesh>
      }>
        <Earth />
      </Suspense>
    </>
  );
}

export default function IntroGlobe() {
  return (
    <div 
      style={{ 
        width: 280, 
        height: 280, 
        overflow: 'visible',
      }}
    >
      <Canvas
        camera={{ position: [0, 0, 5], fov: 45 }}
        style={{ background: "transparent" }}
        gl={{ alpha: true, antialias: true }}
      >
        <Scene />
      </Canvas>
    </div>
  );
}
