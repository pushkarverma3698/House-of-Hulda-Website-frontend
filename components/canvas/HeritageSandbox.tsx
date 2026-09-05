'use client';

import { useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { PresentationControls, useTexture } from '@react-three/drei';
import * as THREE from 'three';

function KathKuniModel() {
  const [woodTex, stoneTex] = useTexture([
    '/textures/kathkuni_wood_albedo.jpg',
    '/textures/slate_stone_albedo.jpg',
  ]);

  woodTex.wrapS = THREE.RepeatWrapping;
  woodTex.wrapT = THREE.RepeatWrapping;
  woodTex.repeat.set(2, 1);

  stoneTex.wrapS = THREE.RepeatWrapping;
  stoneTex.wrapT = THREE.RepeatWrapping;
  stoneTex.repeat.set(1.5, 1.5);

  const groupRef = useRef<THREE.Group>(null);

  // Subtle continuous ambient hover rotation
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.8) * 0.08;
    }
  });

  return (
    <group ref={groupRef} scale={[1.1, 1.1, 1.1]}>
      {/* Course 1: Bottom Timber Beams (X-Axis) */}
      <mesh position={[0, -1.2, 0]}>
        <boxGeometry args={[4.2, 0.45, 0.65]} />
        <meshStandardMaterial map={woodTex} roughness={0.75} metalness={0.1} />
      </mesh>

      {/* Course 1: Cross Timber Beams (Z-Axis interlocking corner) */}
      <mesh position={[1.75, -1.2, 0]}>
        <boxGeometry args={[0.65, 0.45, 3.2]} />
        <meshStandardMaterial map={woodTex} roughness={0.75} metalness={0.1} />
      </mesh>
      <mesh position={[-1.75, -1.2, 0]}>
        <boxGeometry args={[0.65, 0.45, 3.2]} />
        <meshStandardMaterial map={woodTex} roughness={0.75} metalness={0.1} />
      </mesh>

      {/* Infill 1: Dry-stacked slate stone masonry core */}
      <mesh position={[0, -0.65, 0]}>
        <boxGeometry args={[2.8, 0.65, 2.0]} />
        <meshStandardMaterial map={stoneTex} roughness={0.9} metalness={0.05} />
      </mesh>

      {/* Course 2: Mid Timber Lap Joint Beams (Z-Axis) */}
      <mesh position={[0, -0.1, 0]}>
        <boxGeometry args={[4.2, 0.45, 0.65]} />
        <meshStandardMaterial map={woodTex} roughness={0.75} metalness={0.1} />
      </mesh>
      <mesh position={[1.75, -0.1, 0]}>
        <boxGeometry args={[0.65, 0.45, 3.2]} />
        <meshStandardMaterial map={woodTex} roughness={0.75} metalness={0.1} />
      </mesh>
      <mesh position={[-1.75, -0.1, 0]}>
        <boxGeometry args={[0.65, 0.45, 3.2]} />
        <meshStandardMaterial map={woodTex} roughness={0.75} metalness={0.1} />
      </mesh>

      {/* Infill 2: Upper slate stone masonry core */}
      <mesh position={[0, 0.45, 0]}>
        <boxGeometry args={[2.8, 0.65, 2.0]} />
        <meshStandardMaterial map={stoneTex} roughness={0.9} metalness={0.05} />
      </mesh>

      {/* Course 3: Crown Timber Tie Beam (Cantilevered Balcony Joist) */}
      <mesh position={[0, 1.0, 0]}>
        <boxGeometry args={[4.8, 0.45, 0.7]} />
        <meshStandardMaterial map={woodTex} roughness={0.7} metalness={0.12} />
      </mesh>
      <mesh position={[1.75, 1.0, 0]}>
        <boxGeometry args={[0.7, 0.45, 3.8]} />
        <meshStandardMaterial map={woodTex} roughness={0.7} metalness={0.12} />
      </mesh>
    </group>
  );
}

function DynamicLighting() {
  const lightRef = useRef<THREE.PointLight>(null);

  useFrame(({ pointer }) => {
    if (lightRef.current) {
      // Light follows mouse cursor to cast dynamic shadows over wood & stone textures
      lightRef.current.position.x = pointer.x * 6;
      lightRef.current.position.y = pointer.y * 4 + 2;
      lightRef.current.position.z = 5;
    }
  });

  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[-4, 8, 4]} intensity={1.2} color="#fff6e8" />
      <pointLight ref={lightRef} intensity={1.8} distance={15} color="#ffaa44" />
    </>
  );
}

interface HeritageSandboxProps {
  isOpen: boolean;
  onClose: () => void;
}

export function HeritageSandbox({ isOpen, onClose }: HeritageSandboxProps) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Kath-Kuni 3D Heritage Explorer"
      className="fixed inset-0 z-50 flex flex-col justify-between bg-black/95 text-cream backdrop-blur-2xl animate-in fade-in duration-500 select-none"
    >
      {/* Top Architectural Header */}
      <header className="relative z-10 flex items-center justify-between px-8 py-6 border-b border-white/10">
        <div>
          <span className="hud-mono text-amber tracking-widest text-[10px] uppercase flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber animate-ping" />
            Tactile Heritage Explorer · 3D Sandbox
          </span>
          <h2 className="font-display text-2xl text-cream mt-0.5">
            Kath-Kuni Architectural Joint
          </h2>
        </div>

        <button
          onClick={onClose}
          className="flex items-center justify-center w-10 h-10 rounded-full border border-white/20 hover:border-amber hover:bg-amber/10 text-cream/70 hover:text-white transition-all text-xs font-mono"
          aria-label="Close Sandbox"
        >
          ✕
        </button>
      </header>

      {/* 3D Viewport with Presentation Controls (Drag & Orbit) */}
      <div className="relative flex-1 cursor-grab active:cursor-grabbing overflow-hidden">
        <Canvas
          camera={{ position: [0, 1.5, 6.5], fov: 42 }}
          gl={{ antialias: true, powerPreference: 'high-performance' }}
          style={{ width: '100%', height: '100%' }}
        >
          <PresentationControls
            global
            snap={true}
            rotation={[0.3, -0.4, 0]}
            polar={[-Math.PI / 4, Math.PI / 4]}
            azimuth={[-Math.PI, Math.PI]}
          >
            <KathKuniModel />
          </PresentationControls>
          <DynamicLighting />
        </Canvas>

        {/* Orbit Instruction Hint */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 pointer-events-none hud-mono text-[10px] text-cream/50 tracking-widest uppercase bg-black/50 px-4 py-2 rounded-full border border-white/10 backdrop-blur-md flex items-center gap-2">
          <span>✦</span> Click & Drag to Rotate 3D Model · Move Cursor for Lighting <span>✦</span>
        </div>
      </div>

      {/* Technical Spec Telemetry Grid */}
      <footer className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-6 px-8 py-6 border-t border-white/10 bg-ink/50 backdrop-blur-md">
        <div className="space-y-1">
          <p className="hud-mono text-[9px] text-amber uppercase tracking-widest">Engineering Principle</p>
          <p className="font-display text-sm text-cream/90">Mortarless Elastic Flexibility</p>
          <p className="text-xs text-cream/60 leading-relaxed font-light">
            Alternating courses of dressed mountain schist and hand-hewn cedar beams tighten with frost and dissipate earthquake tremors harmlessly.
          </p>
        </div>
        <div className="space-y-1">
          <p className="hud-mono text-[9px] text-amber uppercase tracking-widest">Woodcraft & Material</p>
          <p className="font-display text-sm text-cream/90">Aged Mountain Deodar (Cedrus deodara)</p>
          <p className="text-xs text-cream/60 leading-relaxed font-light">
            High natural resin content shields against decay, rot, and high-altitude moisture without chemical paints or sealants.
          </p>
        </div>
        <div className="space-y-1">
          <p className="hud-mono text-[9px] text-amber uppercase tracking-widest">Heritage Lineage</p>
          <p className="font-display text-sm text-cream/90">500+ Years in Naggar Valley</p>
          <p className="text-xs text-cream/60 leading-relaxed font-light">
            House of Hulda preserves this ancient joinery across every floor, ceiling joist, and cantilevered attic café balcony.
          </p>
        </div>
      </footer>
    </div>
  );
}
