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

        ScrollTrigger.create({
          trigger: document.body,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 1, // Smoothing
          onUpdate: (self) => {
            if (video.duration) {
              gsap.to(video, {
                currentTime: self.progress * video.duration,
                duration: 0.1,
                overwrite: true,
                ease: "none"
              });
            }
          },
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
