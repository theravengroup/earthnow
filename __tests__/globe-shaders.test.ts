import { describe, it, expect } from "vitest";
import { nightLightsVertexShader, nightLightsFragmentShader } from "@/lib/globe-shaders";

describe("globe-shaders", () => {
  it("vertex shader contains gl_Position", () => {
    expect(nightLightsVertexShader).toContain("gl_Position");
  });

  it("vertex shader passes vUv and vNormal varyings", () => {
    expect(nightLightsVertexShader).toContain("varying vec2 vUv");
    expect(nightLightsVertexShader).toContain("varying vec3 vNormal");
  });

  it("fragment shader contains gl_FragColor", () => {
    expect(nightLightsFragmentShader).toContain("gl_FragColor");
  });

  it("fragment shader uses dayMap and nightMap textures", () => {
    expect(nightLightsFragmentShader).toContain("uniform sampler2D dayMap");
    expect(nightLightsFragmentShader).toContain("uniform sampler2D nightMap");
  });

  it("fragment shader uses lightDir uniform", () => {
    expect(nightLightsFragmentShader).toContain("uniform vec3 lightDir");
  });

  it("fragment shader uses smoothstep for day/night blending", () => {
    expect(nightLightsFragmentShader).toContain("smoothstep");
  });
});
