'use client';

import { useRef, useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { scrollState } from '@/hooks/useScrollRig';

interface AtmosphericVideoPlaneProps {
  videoSrc: string;
  position?: [number, number, number];
  scale?: [number, number, number];
  activeRange: [number, number];
  maxOpacity?: number;
  tint?: string;
}

const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  uniform sampler2D uVideo;
  uniform float uOpacity;
  uniform vec3 uColor;
  varying vec2 vUv;

  void main() {
    vec4 tex = texture2D(uVideo, vUv);
    
    // Soft radial & edge feathering to eliminate seam lines and corner artifacts
    float edgeX = smoothstep(0.0, 0.12, vUv.x) * smoothstep(1.0, 0.88, vUv.x);
    float edgeY = smoothstep(0.0, 0.12, vUv.y) * smoothstep(1.0, 0.88, vUv.y);
    float edgeMask = edgeX * edgeY;

    // Additive illumination
    vec3 col = tex.rgb * uColor;
    float alpha = max(max(col.r, col.g), col.b) * edgeMask * uOpacity;
    
    gl_FragColor = vec4(col * edgeMask * uOpacity, alpha);
  }
`;

export function AtmosphericVideoPlane({
  videoSrc,
  position = [0, 0, 0.5],
  scale = [16, 9, 1],
  activeRange,
  maxOpacity = 0.7,
  tint = '#ffffff',
}: AtmosphericVideoPlaneProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const videoTexture = useMemo(() => {
    if (typeof window === 'undefined') return null;
    const video = document.createElement('video');
    video.src = videoSrc;
    video.crossOrigin = 'anonymous';
    video.loop = true;
    video.muted = true;
    video.playsInline = true;
    video.preload = 'auto';
    videoRef.current = video;

    const texture = new THREE.VideoTexture(video);
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.format = THREE.RGBAFormat;
    return texture;
  }, [videoSrc]);

  const uniforms = useMemo(
    () => ({
      uVideo: { value: videoTexture },
      uOpacity: { value: 0 },
      uColor: { value: new THREE.Color(tint) },
    }),
    [videoTexture, tint]
  );

  useEffect(() => {
    return () => {
      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.removeAttribute('src');
        videoRef.current.load();
        videoRef.current = null;
      }
      if (videoTexture) {
        videoTexture.dispose();
      }
    };
  }, [videoTexture]);

  useFrame(() => {
    if (!materialRef.current) return;

    const t = scrollState.progress;
    const [start, end] = activeRange;

    let targetOpacity = 0;
    const fadeDuration = 0.08;

    if (t >= start && t <= end) {
      const fadeIn = THREE.MathUtils.smoothstep(t, start, start + fadeDuration);
      const fadeOut = 1.0 - THREE.MathUtils.smoothstep(t, end - fadeDuration, end);
      targetOpacity = Math.min(fadeIn, fadeOut) * maxOpacity;
    }

    materialRef.current.uniforms.uOpacity.value = targetOpacity;

    // Power optimization: only play video when within active view
    if (videoRef.current) {
      if (targetOpacity > 0.01) {
        if (videoRef.current.paused) {
          videoRef.current.play().catch(() => {});
        }
      } else {
        if (!videoRef.current.paused) {
          videoRef.current.pause();
        }
      }
    }

    if (meshRef.current) {
      meshRef.current.visible = targetOpacity > 0.005;
    }
  });

  if (!videoTexture) return null;

  return (
    <mesh ref={meshRef} position={position} scale={scale}>
      <planeGeometry args={[1, 1]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}
