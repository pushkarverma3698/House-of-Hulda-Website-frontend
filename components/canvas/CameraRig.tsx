'use client';

import { useFrame, useThree } from '@react-three/fiber';
import { Vector3, PerspectiveCamera } from 'three';
import { scrollState } from '@/hooks/useScrollRig';
import { cameraPath } from '@/lib/cameraPath';

const pos = new Vector3();
const look = new Vector3();

/**
 * CameraRig: Drives the Three.js camera along the choreographed cameraPath
 * as a pure function of scrollState.progress.
 * Applies frame-rate independent exponential decay for smooth cinematic feel on 60Hz and 120Hz displays.
 */
export function CameraRig() {
  const camera = useThree((s) => s.camera);

  useFrame((_, delta) => {
    const t = scrollState.progress;
    const targetFov = cameraPath(t, pos, look);
    const k = 1 - Math.exp(-4 * delta);

    camera.position.lerp(pos, k);
    camera.lookAt(look);

    if (camera instanceof PerspectiveCamera) {
      if (Math.abs(camera.fov - targetFov) > 0.05) {
        camera.fov += (targetFov - camera.fov) * k;
        camera.updateProjectionMatrix();
      }
    }
  });

  return null;
}
