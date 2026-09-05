'use client';

import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function CinematicScrubber({ videoSrc }: { videoSrc: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let ctx = gsap.context(() => {
      const onLoadedMetadata = () => {
        video.pause();

        const sections = document.querySelectorAll('.cine-section');
        
        sections.forEach((section) => {
          const tStart = parseFloat(section.getAttribute('data-time-start') || '0');
          const tEnd = parseFloat(section.getAttribute('data-time-end') || '0');

          ScrollTrigger.create({
            trigger: section,
            start: 'top top',
            end: 'bottom top',
            scrub: 0.5, // Crisp, tight scrubbing
            onUpdate: (self) => {
              if (video.duration) {
                const targetTime = gsap.utils.interpolate(tStart, tEnd, self.progress);
                // Ensure we don't exceed video bounds
                const clampedTime = Math.max(0, Math.min(targetTime, video.duration - 0.01));
                
                gsap.to(video, {
                  currentTime: clampedTime,
                  duration: 0.1,
                  overwrite: true,
                  ease: "none"
                });
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
  }, []);

  return (
    <div className="fixed inset-0 z-0 bg-black overflow-hidden pointer-events-none">
      <video
        ref={videoRef}
        src={videoSrc}
        className="w-full h-full object-cover opacity-80"
        playsInline
        muted
        preload="auto"
      />
      <div className="absolute inset-0 z-10 bg-black/40 pointer-events-none mix-blend-overlay" />
    </div>
  );
}
