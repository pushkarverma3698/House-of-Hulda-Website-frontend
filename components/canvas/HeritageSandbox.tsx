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
    window.dispatchEvent(new CustomEvent('app-modal-open'));
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.dispatchEvent(new CustomEvent('app-modal-close'));
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Kath-Kuni 3D Heritage Explorer"
      className="fixed inset-0 z-50 flex flex-col justify-between bg-[#070a0f]/95 text-cream backdrop-blur-2xl animate-in fade-in duration-500 select-none"
    >
      {/* Top Architectural Header */}
      <header className="relative z-10 flex items-center justify-between px-6 md:px-10 py-5 border-b border-white/10 bg-black/40 backdrop-blur-md">
        <div>
          <span className="hud-mono text-amber-400 tracking-widest text-[10px] uppercase flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            Tactile Heritage Explorer · 3D Sandbox
          </span>
          <h2 className="font-display text-xl sm:text-2xl text-cream mt-0.5">
            Kath-Kuni Architectural Joint
          </h2>
        </div>

        <button
          onClick={onClose}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/20 hover:border-amber-400 hover:bg-amber-400/10 text-cream/80 hover:text-white transition-all text-xs font-mono group"
          aria-label="Close Sandbox"
        >
          <span>✕</span>
          <span className="hidden sm:inline-block text-[9px] text-amber-300/80 bg-white/5 px-1.5 py-0.5 rounded border border-white/10 group-hover:border-amber-400/40">ESC</span>
        </button>
      </header>

      {/* 3D Viewport with Presentation Controls (Drag & Orbit) & Ambient Studio Spotlight */}
      <div className="relative flex-1 cursor-grab active:cursor-grabbing overflow-hidden bg-[radial-gradient(circle_at_center,_rgba(45,34,22,0.65)_0%,_#06080d_75%)]">
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
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 pointer-events-none hud-mono text-[10px] text-cream/60 tracking-widest uppercase bg-black/60 px-5 py-2.5 rounded-full border border-white/15 backdrop-blur-md flex items-center gap-2 shadow-lg">
          <span className="text-amber-400">✦</span> Click & Drag to Rotate Joint · Move Cursor for Mountain Sunlight <span className="text-amber-400">✦</span>
        </div>
      </div>

      {/* Technical Spec Telemetry Grid with Frosted Card Plates */}
      <footer className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-4 px-6 md:px-10 py-5 border-t border-white/10 bg-black/60 backdrop-blur-xl">
        <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] hover:border-amber-400/30 transition-all space-y-1.5 shadow-sm">
          <p className="hud-mono text-[9px] text-amber-400 uppercase tracking-widest">Engineering Principle</p>
          <p className="font-display text-sm text-cream font-medium">Mortarless Elastic Flexibility</p>
          <p className="text-xs text-cream/70 leading-relaxed font-light">
            Alternating courses of dressed mountain schist and hand-hewn cedar beams tighten with frost and dissipate earthquake tremors harmlessly.
          </p>
        </div>
        <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] hover:border-amber-400/30 transition-all space-y-1.5 shadow-sm">
          <p className="hud-mono text-[9px] text-amber-400 uppercase tracking-widest">Woodcraft & Material</p>
          <p className="font-display text-sm text-cream font-medium">Aged Mountain Deodar (Cedrus deodara)</p>
          <p className="text-xs text-cream/70 leading-relaxed font-light">
            High natural resin content shields against decay, rot, and high-altitude moisture without chemical paints or sealants.
          </p>
        </div>
        <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] hover:border-amber-400/30 transition-all space-y-1.5 shadow-sm">
          <p className="hud-mono text-[9px] text-amber-400 uppercase tracking-widest">Heritage Lineage</p>
          <p className="font-display text-sm text-cream font-medium">500+ Years in Naggar Valley</p>
          <p className="text-xs text-cream/70 leading-relaxed font-light">
            House of Hulda preserves this ancient joinery across every floor, ceiling joist, and cantilevered attic café balcony.
          </p>
        </div>
      </footer>
    </div>
  );
}
