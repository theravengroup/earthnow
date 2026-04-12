"use client";

import { useRef, useMemo, Suspense } from "react";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import * as THREE from "three";
import { nightLightsVertexShader, nightLightsFragmentShader } from "@/lib/globe-shaders";

function Earth() {
  const meshRef = useRef<THREE.Mesh>(null);

  const dayTexture = useLoader(
    THREE.TextureLoader,
    "/earth-day.jpg"
  );
  const nightTexture = useLoader(
    THREE.TextureLoader,
    "/earth-night.jpg"
  );

  const uniforms = useMemo(
    () => ({
      dayMap: { value: dayTexture },
      nightMap: { value: nightTexture },
      lightDir: { value: new THREE.Vector3(5, 3, 5).normalize() },
    }),
    [dayTexture, nightTexture]
  );

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.001;
    }
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[2, 64, 64]} />
      <shaderMaterial
        vertexShader={nightLightsVertexShader}
        fragmentShader={nightLightsFragmentShader}
        uniforms={uniforms}
      />
    </mesh>
  );
}

function Clouds() {
  const meshRef = useRef<THREE.Mesh>(null);

  const cloudTexture = useLoader(
    THREE.TextureLoader,
    "/earth-clouds.png"
  );

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.0013;
    }
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[2.01, 64, 64]} />
      <meshStandardMaterial
        alphaMap={cloudTexture}
        transparent
        opacity={0.45}
        color="#ffffff"
        depthWrite={false}
      />
    </mesh>
  );
}

function Scene() {
  return (
    <>
      <ambientLight intensity={0.8} />
      <directionalLight position={[5, 3, 5]} intensity={1.5} />
      <directionalLight position={[-3, -1, -3]} intensity={0.3} />
      <Suspense
        fallback={
          <mesh>
            <sphereGeometry args={[2, 64, 64]} />
            <meshStandardMaterial color="#1a5a8c" />
          </mesh>
        }
      >
        <Earth />
        <Clouds />
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
        overflow: "visible",
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
