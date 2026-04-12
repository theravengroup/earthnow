"use client";

import { useRef, useMemo, Suspense } from "react";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
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
      meshRef.current.rotation.y += 0.002;
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

  // Rotate clouds slightly faster than earth for realism
  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.0025;
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

function SatelliteDot({
  orbitRadius,
  tilt,
  rotationAxis,
  speed,
  startAngle,
}: {
  orbitRadius: number;
  tilt: number;
  rotationAxis: "x" | "z";
  speed: number;
  startAngle: number;
}) {
  const dotRef = useRef<THREE.Mesh>(null);
  const angleRef = useRef(startAngle);

  useFrame(() => {
    angleRef.current += speed;
    if (dotRef.current) {
      dotRef.current.position.x = Math.cos(angleRef.current) * orbitRadius;
      dotRef.current.position.z = Math.sin(angleRef.current) * orbitRadius;
    }
  });

  return (
    <group rotation={[rotationAxis === "x" ? tilt : 0, 0, rotationAxis === "z" ? tilt : 0]}>
      <mesh ref={dotRef}>
        <sphereGeometry args={[0.03, 8, 8]} />
        <meshBasicMaterial color="#5eead4" />
      </mesh>
    </group>
  );
}

function SatelliteRing({
  radius,
  tilt,
  rotationAxis,
  speed,
  opacity,
}: {
  radius: number;
  tilt: number;
  rotationAxis: "x" | "z";
  speed: number;
  opacity: number;
}) {
  const ringRef = useRef<THREE.Group>(null);

  const lineObj = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    const segments = 128;
    for (let i = 0; i <= segments; i++) {
      const angle = (i / segments) * Math.PI * 2;
      pts.push(new THREE.Vector3(Math.cos(angle) * radius, 0, Math.sin(angle) * radius));
    }
    const geo = new THREE.BufferGeometry().setFromPoints(pts);
    const mat = new THREE.LineBasicMaterial({ color: "#14b8a6", transparent: true, opacity });
    return new THREE.Line(geo, mat);
  }, [radius, opacity]);

  useFrame(() => {
    if (ringRef.current) {
      ringRef.current.rotation.y += speed;
    }
  });

  return (
    <group ref={ringRef} rotation={[rotationAxis === "x" ? tilt : 0, 0, rotationAxis === "z" ? tilt : 0]}>
      <primitive object={lineObj} />
    </group>
  );
}

function Scene() {
  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 3, 5]} intensity={1.2} />
      <Suspense
        fallback={
          <mesh>
            <sphereGeometry args={[2, 64, 64]} />
            <meshStandardMaterial color="#1a3a5c" />
          </mesh>
        }
      >
        <Earth />
        <Clouds />
      </Suspense>

      {/* Satellite orbital rings — kept tight to globe so they're visible within the clip */}
      <SatelliteRing radius={2.25} tilt={0.4} rotationAxis="x" speed={0.001} opacity={0.18} />
      <SatelliteRing radius={2.35} tilt={-0.3} rotationAxis="z" speed={-0.0008} opacity={0.12} />
      <SatelliteRing radius={2.15} tilt={0.8} rotationAxis="x" speed={0.0012} opacity={0.15} />

      {/* Satellite dots */}
      <SatelliteDot orbitRadius={2.25} tilt={0.4} rotationAxis="x" speed={0.008} startAngle={0} />
      <SatelliteDot orbitRadius={2.25} tilt={0.4} rotationAxis="x" speed={0.008} startAngle={Math.PI} />
      <SatelliteDot orbitRadius={2.35} tilt={-0.3} rotationAxis="z" speed={-0.006} startAngle={1.2} />
      <SatelliteDot orbitRadius={2.15} tilt={0.8} rotationAxis="x" speed={0.01} startAngle={2.5} />

      <OrbitControls enableZoom={false} enablePan={false} enableRotate={false} />
    </>
  );
}

export default function EarthGlobe() {
  return (
    <div
      className="globe-spin"
      style={{
        width: "min(650px, 85vw)",
        aspectRatio: "1 / 1",
        borderRadius: "50%",
        overflow: "hidden",
      }}
    >
      <Canvas
        camera={{ position: [0, 0, 4.8], fov: 45 }}
        style={{ background: "transparent", display: "block" }}
        gl={{ alpha: true, antialias: true }}
      >
        <Scene />
      </Canvas>
    </div>
  );
}
