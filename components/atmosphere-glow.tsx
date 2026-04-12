/**
 * Fresnel-effect atmospheric glow for globe meshes.
 * Renders on the FrontSide of a slightly larger sphere.
 * Fragments with low alpha are discarded to avoid canvas-corner bleed.
 */
import { useMemo } from "react";
import * as THREE from "three";

const vertexShader = `
  varying vec3 vNormal;
  varying vec3 vPosition;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = `
  uniform vec3 glowColor;
  uniform float intensity;
  uniform float power;
  varying vec3 vNormal;
  varying vec3 vPosition;
  void main() {
    vec3 viewDir = normalize(-vPosition);
    float fresnel = 1.0 - abs(dot(viewDir, vNormal));
    fresnel = pow(fresnel, power);
    float alpha = fresnel * intensity;
    if (alpha < 0.01) discard;
    gl_FragColor = vec4(glowColor, alpha);
  }
`;

interface AtmosphereGlowProps {
  radius?: number;
  color?: string;
  intensity?: number;
  power?: number;
}

export function AtmosphereGlow({
  radius = 2.15,
  color = "#4da6ff",
  intensity = 1.5,
  power = 3.0,
}: AtmosphereGlowProps) {
  const uniforms = useMemo(
    () => ({
      glowColor: { value: new THREE.Color(color) },
      intensity: { value: intensity },
      power: { value: power },
    }),
    [color, intensity, power]
  );

  return (
    <mesh>
      <sphereGeometry args={[radius, 64, 64]} />
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        side={THREE.FrontSide}
        transparent
        depthWrite={false}
      />
    </mesh>
  );
}
