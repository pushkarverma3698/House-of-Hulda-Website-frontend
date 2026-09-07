'use client';

import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';

const GALLERY_SLIDES = [
  {
    title: 'The Deodar Master Suite',
    caption: 'Low timber seating, handwoven Kullu blankets, and valley views at 2,000m.',
    src: '/images/deodar_suite_interior.jpg',
  },
  {
    title: 'Kath-Kuni Ridge Exterior',
    caption: 'Centuries-old interlocking deodar cedar and stone masonry emerging from mountain mist.',
    src: '/images/arrival-golden-hour.jpg',
  },
  {
    title: 'The Cast-Iron Woodstove Hearth',
    caption: 'Fresh siddu over wild walnut stuffing, steamed hot beside burning deodar rootwood.',
    src: '/images/himachali_culinary_hearth.jpg',
  },
  {
    title: 'The Naggar Balcony Vista',
    caption: 'Glacial meltwater streams flowing below private balconies overlooking snow-capped peaks.',
    src: '/images/naggar-valley.jpg',
  },
];

const liquidVertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const liquidFragmentShader = /* glsl */ `
  uniform sampler2D uTextureCurrent;
  uniform sampler2D uTextureNext;
  uniform sampler2D uDisplacement;
  uniform float uProgress;
  uniform float uIntensity;
  
  varying vec2 vUv;

  void main() {
    // Sample high-contrast organic liquid distortion map
    vec4 disp = texture2D(uDisplacement, vUv);
    
    // Liquid ripple offsets
    float dispFactor = disp.r * uIntensity;
    vec2 uv1 = vec2(vUv.x + uProgress * dispFactor, vUv.y + uProgress * dispFactor * 0.5);
    vec2 uv2 = vec2(vUv.x - (1.0 - uProgress) * dispFactor, vUv.y - (1.0 - uProgress) * dispFactor * 0.5);

    vec4 color1 = texture2D(uTextureCurrent, clamp(uv1, 0.0, 1.0));
    vec4 color2 = texture2D(uTextureNext, clamp(uv2, 0.0, 1.0));

    // Smooth chromatic cross-dissolve with fluid ripple distortion
    gl_FragColor = mix(color1, color2, smoothstep(0.0, 1.0, uProgress));
  }
`;

function GalleryMesh({
  currentIdx,
  nextIdx,
  progress,
}: {
  currentIdx: number;
  nextIdx: number;
  progress: number;
}) {
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const textures = useTexture(GALLERY_SLIDES.map((s) => s.src));
  const [dispMap] = useTexture(['/textures/distortion_liquid.jpg']);

  dispMap.wrapS = THREE.RepeatWrapping;
  dispMap.wrapT = THREE.RepeatWrapping;

  const uniforms = useMemo(
    () => ({
      uTextureCurrent: { value: textures[currentIdx] },
      uTextureNext: { value: textures[nextIdx] },
      uDisplacement: { value: dispMap },
      uProgress: { value: 0 },
      uIntensity: { value: 0.35 },
    }),
    [textures, dispMap, currentIdx, nextIdx]
  );

  useFrame((_, delta) => {
    if (!materialRef.current) return;
    materialRef.current.uniforms.uTextureCurrent.value = textures[currentIdx];
    materialRef.current.uniforms.uTextureNext.value = textures[nextIdx];
    
    // Smooth frame-rate independent transition towards target progress
    const k = 1 - Math.exp(-12 * delta);
    materialRef.current.uniforms.uProgress.value +=
      (progress - materialRef.current.uniforms.uProgress.value) * k;
  });

  return (
    <mesh position={[0, 0, 0]} scale={[16, 9, 1]}>
      <planeGeometry args={[1, 1, 32, 32]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={liquidVertexShader}
        fragmentShader={liquidFragmentShader}
        uniforms={uniforms}
      />
    </mesh>
  );
}

interface WebGLGalleryProps {
  isOpen: boolean;
  onClose: () => void;
}

export function WebGLGallery({ isOpen, onClose }: WebGLGalleryProps) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [nextIdx, setNextIdx] = useState(1);
  const [transitionProgress, setTransitionProgress] = useState(1); // 1 = fully settled
  const dragStartX = useRef<number | null>(null);

  const goTo = useCallback(
    (targetIdx: number) => {
      if (targetIdx === currentIdx || transitionProgress < 0.95) return;
      setNextIdx(targetIdx);
      setTransitionProgress(0);

      // Settle transition after 650ms
      setTimeout(() => {
        setCurrentIdx(targetIdx);
        setTransitionProgress(1);
      }, 650);
    },
    [currentIdx, transitionProgress]
  );

  const nextSlide = useCallback(() => {
    const next = (currentIdx + 1) % GALLERY_SLIDES.length;
    goTo(next);
  }, [currentIdx, goTo]);

  const prevSlide = useCallback(() => {
    const prev = (currentIdx - 1 + GALLERY_SLIDES.length) % GALLERY_SLIDES.length;
    goTo(prev);
  }, [currentIdx, goTo]);

  // Keyboard navigation & modal lifecycle
  useEffect(() => {
    if (!isOpen) return;
    window.dispatchEvent(new CustomEvent('app-modal-open'));
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') nextSlide();
      if (e.key === 'ArrowLeft') prevSlide();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.dispatchEvent(new CustomEvent('app-modal-close'));
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose, nextSlide, prevSlide]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Liquid WebGL Gallery"
      className="fixed inset-0 z-50 flex flex-col justify-between bg-[#06080d]/95 text-cream backdrop-blur-2xl animate-in fade-in duration-500 select-none"
    >
      {/* Top Header Bar */}
      <header className="relative z-10 flex items-center justify-between px-6 md:px-10 py-5 border-b border-white/10 bg-black/40 backdrop-blur-md">
        <div>
          <span className="hud-mono text-amber-400 tracking-widest text-[10px] uppercase flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            House of Hulda · Tactile Sanctuary Gallery
          </span>
          <h2 className="font-display text-xl sm:text-2xl text-cream mt-0.5">
            Living Spaces & Deodar Architecture
          </h2>
        </div>

        <div className="flex items-center gap-4">
          <span className="hud-mono text-xs text-amber-400/80 tracking-widest bg-white/5 px-3 py-1 rounded-full border border-white/10">
            {String(currentIdx + 1).padStart(2, '0')} / {String(GALLERY_SLIDES.length).padStart(2, '0')}
          </span>
          <button
            onClick={onClose}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/20 hover:border-amber-400 hover:bg-amber-400/10 text-cream/80 hover:text-white transition-all text-xs font-mono group"
            aria-label="Close Gallery"
          >
            <span>✕</span>
            <span className="hidden sm:inline-block text-[9px] text-amber-300/80 bg-white/5 px-1.5 py-0.5 rounded border border-white/10 group-hover:border-amber-400/40">ESC</span>
          </button>
        </div>
      </header>

      {/* Main 3D WebGL Canvas Layer with Touch / Drag scrub */}
      <div
        className="relative flex-1 cursor-grab active:cursor-grabbing overflow-hidden"
        onPointerDown={(e) => {
          dragStartX.current = e.clientX;
        }}
        onPointerUp={(e) => {
          if (dragStartX.current === null) return;
          const deltaX = e.clientX - dragStartX.current;
          if (deltaX < -50) nextSlide();
          if (deltaX > 50) prevSlide();
          dragStartX.current = null;
        }}
      >
        <Canvas
          camera={{ position: [0, 0, 7.8], fov: 45 }}
          gl={{ antialias: true, powerPreference: 'high-performance' }}
          style={{ width: '100%', height: '100%' }}
        >
          <ambientLight intensity={1.2} />
          <GalleryMesh
            currentIdx={currentIdx}
            nextIdx={nextIdx}
            progress={transitionProgress}
          />
        </Canvas>

        {/* Drag Hint Overlay */}
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 pointer-events-none hud-mono text-[10px] text-cream/60 tracking-widest uppercase bg-black/60 px-4 py-2 rounded-full border border-white/10 backdrop-blur-md shadow-md flex items-center gap-2">
          <span className="text-amber-400">←</span> Drag or Swipe to Distort <span className="text-amber-400">→</span>
        </div>
      </div>

      {/* Bottom Unified Monograph Controls */}
      <footer className="relative z-10 flex flex-col md:flex-row items-center justify-between px-6 md:px-10 py-5 border-t border-white/10 bg-black/60 backdrop-blur-xl gap-4">
        <div className="space-y-1 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-2.5">
            <span className="hud-mono text-xs text-amber-400 font-semibold tracking-wider">
              PLATE #{String(currentIdx + 1).padStart(2, '0')}
            </span>
            <span className="text-cream/30 text-xs">·</span>
            <h3 className="font-display text-base sm:text-lg text-cream font-medium">
              {GALLERY_SLIDES[currentIdx].title}
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-cream/70 font-light max-w-xl leading-relaxed">
            {GALLERY_SLIDES[currentIdx].caption}
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {/* Mobile slide indicator dots */}
          <div className="flex sm:hidden items-center gap-1.5 mr-2">
            {GALLERY_SLIDES.map((_, i) => (
              <span
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === currentIdx ? 'w-4 bg-amber-400' : 'w-1.5 bg-white/20'
                }`}
              />
            ))}
          </div>

          <button
            onClick={prevSlide}
            className="px-5 py-2.5 rounded-full border border-white/20 hover:border-amber-400 hover:bg-amber-400/10 text-cream/90 hover:text-white hud-mono text-xs tracking-widest uppercase transition-all"
          >
            ← Prev
          </button>
          <button
            onClick={nextSlide}
            className="px-6 py-2.5 rounded-full border border-amber-400/50 bg-amber-400/15 hover:bg-amber-400 hover:text-black text-amber-300 hud-mono text-xs tracking-widest uppercase transition-all shadow-[0_0_20px_rgba(245,158,11,0.25)] hover:shadow-[0_0_25px_rgba(245,158,11,0.5)]"
          >
            Next →
          </button>
        </div>
      </footer>
    </div>
  );
}
