'use client';

import { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { scrollState } from '@/hooks/useScrollRig';

const vertexShader = /* glsl */ `
  uniform sampler2D uDepthMap;
  uniform float uDisplacementScale;
  uniform vec2 uMouse;
  uniform float uMouseStrength;
  
  varying vec2 vUv;
  varying float vDepth;

  void main() {
    vUv = uv;
    
    // Sample depth from red channel (0.0 = far, 1.0 = near)
    float depth = texture2D(uDepthMap, uv).r;
    vDepth = depth;

    vec3 newPosition = position;
    
    // Displace along Z based on depth value
    newPosition.z += (depth - 0.5) * uDisplacementScale;

    // Interactive mouse parallax scaled inversely with depth
    // Foreground objects move more than background mountains
    newPosition.x += (uv.x - 0.5 + uMouse.x * 0.1) * uMouseStrength * (depth * 0.8 + 0.2);
    newPosition.y += (uv.y - 0.5 + uMouse.y * 0.1) * uMouseStrength * (depth * 0.8 + 0.2);

    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  uniform sampler2D uTexture;
  uniform float uVelocity;
  uniform float uOpacity;
  uniform float uTime;
  
  varying vec2 vUv;
  varying float vDepth;

  void main() {
    // Dynamic chromatic aberration driven by scroll velocity
    float vel = clamp(abs(uVelocity) * 0.003, 0.0, 0.02);
    vec2 offset = vec2(0.0, vel * (1.0 - vDepth));

    float r = texture2D(uTexture, vUv + offset).r;
    float g = texture2D(uTexture, vUv).g;
    float b = texture2D(uTexture, vUv - offset).b;
    vec3 color = vec3(r, g, b);

    // Subtle edge feathering to blend into atmospheric background
    vec2 edge = smoothstep(0.0, 0.08, vUv) * smoothstep(1.0, 0.92, vUv);
    float vignette = edge.x * edge.y;

    gl_FragColor = vec4(color, uOpacity * vignette);
  }
`;

interface DisplacementPlaneProps {
  imageSrc: string;
  depthMapSrc: string;
  position?: [number, number, number];
  scale?: [number, number, number];
  displacementScale?: number;
  activeRange: [number, number]; // [tStart, tEnd]
  mouseStrength?: number;
}

export function DisplacementPlane({
  imageSrc,
  depthMapSrc,
  position = [0, 1.2, 0],
  scale = [9.6, 5.4, 1],
  displacementScale = 1.8,
  activeRange,
  mouseStrength = 0.25,
}: DisplacementPlaneProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const { pointer } = useThree();

  const [texture, depthMap] = useTexture([imageSrc, depthMapSrc]);

  // Set texture filtering for maximum fidelity
  texture.generateMipmaps = true;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  depthMap.generateMipmaps = true;
  depthMap.minFilter = THREE.LinearMipmapLinearFilter;

  const uniforms = useMemo(
    () => ({
      uTexture: { value: texture },
      uDepthMap: { value: depthMap },
      uDisplacementScale: { value: displacementScale },
      uMouse: { value: new THREE.Vector2(0, 0) },
      uMouseStrength: { value: mouseStrength },
      uVelocity: { value: 0 },
      uOpacity: { value: 0 },
      uTime: { value: 0 },
    }),
    [texture, depthMap, displacementScale, mouseStrength]
  );

  useFrame((state, delta) => {
    if (!materialRef.current) return;

    const t = scrollState.progress;
    const [tStart, tEnd] = activeRange;
    const fadeBand = 0.06;

    // Calculate smooth opacity envelope
    let opacity = 0;
    if (t >= tStart && t <= tEnd) {
      const enter = THREE.MathUtils.smoothstep(t, tStart, tStart + fadeBand);
      const exit = 1.0 - THREE.MathUtils.smoothstep(t, tEnd - fadeBand, tEnd);
      opacity = Math.min(enter, exit);
    }

    // Skip drawing if invisible
    if (meshRef.current) {
      meshRef.current.visible = opacity > 0.001;
    }
    if (opacity <= 0.001) return;

    materialRef.current.uniforms.uOpacity.value = opacity;
    materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    
    // Smooth pointer damping
    const targetMouseX = pointer.x;
    const targetMouseY = pointer.y;
    const k = 1 - Math.exp(-6 * delta);
    materialRef.current.uniforms.uMouse.value.x +=
      (targetMouseX - materialRef.current.uniforms.uMouse.value.x) * k;
    materialRef.current.uniforms.uMouse.value.y +=
      (targetMouseY - materialRef.current.uniforms.uMouse.value.y) * k;

    // Velocity uniform for dispersion effect
    materialRef.current.uniforms.uVelocity.value = scrollState.velocity;
  });

  return (
    <mesh ref={meshRef} position={position} scale={scale}>
      {/* 128x128 segment grid for smooth geometric displacement without performance hit */}
      <planeGeometry args={[1, 1, 128, 128]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
      />
    </mesh>
  );
}
