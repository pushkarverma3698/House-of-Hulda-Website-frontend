'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { scrollState } from '@/hooks/useScrollRig';

const skyboxVertexShader = /* glsl */ `
  varying vec3 vWorldPosition;
  void main() {
    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPosition.xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const skyboxFragmentShader = /* glsl */ `
  uniform sampler2D uDayMap;
  uniform sampler2D uNightMap;
  uniform sampler2D uDawnMap;
  uniform float uBlendDayNight; // 0.0 = day, 1.0 = night
  uniform float uBlendNightDawn; // 0.0 = night, 1.0 = dawn
  uniform float uOverallOpacity;
  
  varying vec3 vWorldPosition;

  #define PI 3.141592653589793

  void main() {
    vec3 n = normalize(vWorldPosition);
    
    // Equirectangular mapping coordinates
    float u = atan(n.z, n.x) / (2.0 * PI) + 0.5;
    float v = asin(clamp(n.y, -1.0, 1.0)) / PI + 0.5;
    vec2 uv = vec2(u, v);

    vec3 dayColor = texture2D(uDayMap, uv).rgb;
    vec3 nightColor = texture2D(uNightMap, uv).rgb;
    vec3 dawnColor = texture2D(uDawnMap, uv).rgb;

    // Blend between Day -> Night -> Dawn
    vec3 col = mix(dayColor, nightColor, uBlendDayNight);
    col = mix(col, dawnColor, uBlendNightDawn);

    gl_FragColor = vec4(col, uOverallOpacity);
  }
`;

export function EnvironmentCrossfader() {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const dirLightRef = useRef<THREE.DirectionalLight>(null);
  const ambLightRef = useRef<THREE.AmbientLight>(null);

  const [dayMap, nightMap, dawnMap] = useTexture([
    '/skyboxes/skybox_himalayan_day.jpg',
    '/images/skybox_himalayan_night.jpg',
    '/skyboxes/skybox_himalayan_dawn.jpg',
  ]);

  dayMap.mapping = THREE.EquirectangularReflectionMapping;
  nightMap.mapping = THREE.EquirectangularReflectionMapping;
  dawnMap.mapping = THREE.EquirectangularReflectionMapping;

  useFrame(() => {
    if (!materialRef.current) return;

    const t = scrollState.progress;

    // Transition Day -> Night: 0.35 to 0.65
    const blendDayNight = THREE.MathUtils.smoothstep(t, 0.35, 0.65);
    // Transition Night -> Dawn: 0.80 to 0.95
    const blendNightDawn = THREE.MathUtils.smoothstep(t, 0.80, 0.95);

    materialRef.current.uniforms.uBlendDayNight.value = blendDayNight;
    materialRef.current.uniforms.uBlendNightDawn.value = blendNightDawn;
    materialRef.current.uniforms.uOverallOpacity.value = 1.0;

    // Dynamic solar lighting update
    if (dirLightRef.current && ambLightRef.current) {
      if (t < 0.4) {
        // Crisp day sun
        dirLightRef.current.color.set('#fff8ee');
        dirLightRef.current.intensity = 1.4;
        ambLightRef.current.color.set('#d8ecf8');
        ambLightRef.current.intensity = 0.6;
      } else if (t < 0.75) {
        // Hearth twilight / Night starlight
        const factor = (t - 0.4) / 0.35;
        dirLightRef.current.color.lerpColors(
          new THREE.Color('#ff8a38'),
          new THREE.Color('#384e72'),
          factor
        );
        dirLightRef.current.intensity = THREE.MathUtils.lerp(1.2, 0.3, factor);
        ambLightRef.current.color.set('#0a101d');
        ambLightRef.current.intensity = 0.25;
      } else {
        // Golden hour sunrise
        const factor = (t - 0.75) / 0.25;
        dirLightRef.current.color.lerpColors(
          new THREE.Color('#384e72'),
          new THREE.Color('#ffae42'),
          factor
        );
        dirLightRef.current.intensity = THREE.MathUtils.lerp(0.3, 1.3, factor);
        ambLightRef.current.color.set('#fde2b8');
        ambLightRef.current.intensity = 0.5;
      }
    }
  });

  return (
    <>
      <ambientLight ref={ambLightRef} intensity={0.5} />
      <directionalLight
        ref={dirLightRef}
        position={[5, 12, 8]}
        intensity={1.2}
        castShadow={false}
      />
      
      {/* 360-degree panoramic skybox sphere with inverted normals */}
      <mesh ref={meshRef} scale={[-1, 1, 1]}>
        <sphereGeometry args={[100, 64, 32]} />
        <shaderMaterial
          ref={materialRef}
          vertexShader={skyboxVertexShader}
          fragmentShader={skyboxFragmentShader}
          uniforms={{
            uDayMap: { value: dayMap },
            uNightMap: { value: nightMap },
            uDawnMap: { value: dawnMap },
            uBlendDayNight: { value: 0 },
            uBlendNightDawn: { value: 0 },
            uOverallOpacity: { value: 1.0 },
          }}
          side={THREE.BackSide}
          depthWrite={false}
        />
      </mesh>
    </>
  );
}
