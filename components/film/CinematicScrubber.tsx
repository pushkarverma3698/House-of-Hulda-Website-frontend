'use client';

import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import { useNight } from '@/lib/store/night';

gsap.registerPlugin(ScrollTrigger);

interface CinematicScrubberProps {
  desktopSrc: string;
  mobileSrc?: string;
}

export function CinematicScrubber({ desktopSrc, mobileSrc }: CinematicScrubberProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoSrc, setVideoSrc] = useState<string>(desktopSrc);

  // Dynamic Asset Selection: Load 9:16 portrait on mobile, 16:9 on desktop
  useEffect(() => {
    if (mobileSrc) {
      const mediaQuery = window.matchMedia('(max-width: 768px)');
      const updateSource = (e: MediaQueryListEvent | MediaQueryList) => {
        setVideoSrc(e.matches ? mobileSrc : desktopSrc);
      };
      updateSource(mediaQuery);
      mediaQuery.addEventListener('change', updateSource);
      return () => mediaQuery.removeEventListener('change', updateSource);
    }
  }, [desktopSrc, mobileSrc]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let ctx = gsap.context(() => {
      // Global Night / HUD / Atmosphere sync
      ScrollTrigger.create({
        trigger: document.body,
        start: 'top top',
        end: 'bottom bottom',
        onUpdate: (self) => {
          useNight.setState({ t: self.progress });
        },
      });

      const onLoadedMetadata = () => {
        video.pause();
        video.currentTime = 0;

        const sections = document.querySelectorAll('.cine-section');
        
        sections.forEach((section) => {
          const tStart = parseFloat(section.getAttribute('data-time-start') || '0');
          const tEnd = parseFloat(section.getAttribute('data-time-end') || '0');

          ScrollTrigger.create({
            trigger: section,
            start: 'top top',
            end: 'bottom top',
            scrub: 0.3, // Ultra-responsive, viscous scrubbing
            onUpdate: (self) => {
              if (video.duration && !isNaN(video.duration)) {
                const targetTime = gsap.utils.interpolate(tStart, tEnd, self.progress);
                const clamped = Math.max(0, Math.min(targetTime, video.duration - 0.02));
                
                // Hardware-accelerated direct seek (Instantaneous on all-I-frame video)
                video.currentTime = clamped;
              }
            },
          });
        });
      };

      video.addEventListener('loadedmetadata', onLoadedMetadata);
      if (video.readyState >= 1) onLoadedMetadata();

      return () => {
        video.removeEventListener('loadedmetadata', onLoadedMetadata);
      };
    });

    return () => ctx.revert();
  }, [videoSrc]);

  return (
    <div className="fixed inset-0 z-0 bg-black overflow-hidden pointer-events-none select-none">
      <video
        ref={videoRef}
        key={videoSrc}
        src={videoSrc}
        className="w-full h-full object-cover opacity-85"
        playsInline
        muted
        autoPlay={false}
        preload="auto"
      />
      {/* Cinematic vignette & tonal contrast scrim */}
      <div className="absolute inset-0 z-10 bg-gradient-to-b from-black/40 via-transparent to-black/60 pointer-events-none" />
      <div className="absolute inset-0 z-10 bg-black/25 pointer-events-none mix-blend-multiply" />
    </div>
  );
}
