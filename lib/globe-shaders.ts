// Shared GLSL shaders for globe components (earth-globe, intro-globe)

export const nightLightsVertexShader = `
  varying vec2 vUv;
  varying vec3 vNormal;
  void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const nightLightsFragmentShader = `
  uniform sampler2D dayMap;
  uniform sampler2D nightMap;
  uniform vec3 lightDir;
  varying vec2 vUv;
  varying vec3 vNormal;

  void main() {
    vec3 nDir = normalize(lightDir);
    float intensity = dot(vNormal, nDir);

    vec4 dayColor = texture2D(dayMap, vUv);
    vec4 nightColor = texture2D(nightMap, vUv);

    float blend = smoothstep(-0.1, 0.2, intensity);

    vec3 finalColor = mix(
      dayColor.rgb + nightColor.rgb * 1.4,
      dayColor.rgb,
      blend
    );

    gl_FragColor = vec4(finalColor, 1.0);
  }
`;
