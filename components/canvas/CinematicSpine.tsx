'use client';

import { Suspense } from 'react';
import { DisplacementPlane } from './DisplacementPlane';
import { EnvironmentCrossfader } from './EnvironmentCrossfader';
import { Embers } from './Embers';
import { StarField } from './StarField';
import { Atmosphere } from './Atmosphere';

/**
 * CinematicSpine: Master 3D narrative scene orchestrator.
 * Renders the 8-Act narrative cycle across normalized scroll t ∈ [0, 1].
 * Calibrated dimensions match 16:9 full-bleed viewport at distance z=0 to z=-2.
 */
export function CinematicSpine() {
  return (
    <group>
      {/* 360° Environment Lighting & Skybox Cycle */}
      <Suspense fallback={null}>
        <EnvironmentCrossfader />
      </Suspense>

      {/* ACT 1 & 2: The Arrival (Golden Hour Homestay in Valley) */}
      <Suspense fallback={null}>
        <DisplacementPlane
          imageSrc="/images/arrival-golden-hour.jpg"
          depthMapSrc="/depth/arrival_depth.jpg"
          position={[0, 0.2, 0]}
          scale={[14.4, 8.1, 1]}
          displacementScale={0.5}
          activeRange={[0.0, 0.38]}
          mouseStrength={0.15}
        />
      </Suspense>

      {/* ACT 3: The Sanctuary (Deodar Woodcraft & Suite Interior) */}
      <Suspense fallback={null}>
        <DisplacementPlane
          imageSrc="/images/deodar_suite_interior.jpg"
          depthMapSrc="/depth/deodar_suite_depth.jpg"
          position={[0, 0.4, -2.0]}
          scale={[13.6, 7.65, 1]}
          displacementScale={0.45}
          activeRange={[0.34, 0.70]}
          mouseStrength={0.18}
        />
      </Suspense>

      {/* ACT 4 & 5: Embers & Stardust (Night Celestial Vault) */}
      <Suspense fallback={null}>
        <Embers />
        <StarField />
        <Atmosphere />
      </Suspense>

      {/* ACT 6: The Dawn Climax (Panoramic Naggar Valley at First Light) */}
      <Suspense fallback={null}>
        <DisplacementPlane
          imageSrc="/images/naggar-valley.jpg"
          depthMapSrc="/depth/naggar_valley_depth.jpg"
          position={[0, 0.3, -1.0]}
          scale={[14.4, 8.1, 1]}
          displacementScale={0.5}
          activeRange={[0.74, 1.0]}
          mouseStrength={0.15}
        />
      </Suspense>
    </group>
  );
}
