'use client';
import { useGSAP } from '@gsap/react';
import { gsap, ScrollTrigger } from '../lib/gsap';

// Scroll-driven background color transitions between altitude zones.
// Renders nothing — purely drives body.style.backgroundColor via GSAP.
export default function ColorMorphProvider() {
  useGSAP(() => {
    // Wait one tick so section refs are in the DOM
    const init = () => {
      const about = document.querySelector('#about');
      const rooms = document.querySelector('#rooms');
      const gallery = document.querySelector('#gallery');

      if (about) {
        // Sky → Hearth: hero fades into warm cream as About enters
        gsap.to(document.body, {
          backgroundColor: '#F5F0E8',
          scrollTrigger: {
            trigger: about,
            start: 'top 80%',
            end: 'top 20%',
            scrub: true,
          },
        });
      }

      if (rooms) {
        // Hearth → Mountain: warm cream morphs to deep forest as Rooms enters
        gsap.to(document.body, {
          backgroundColor: '#1A2E1A',
          scrollTrigger: {
            trigger: rooms,
            start: 'top 90%',
            end: 'top 30%',
            scrub: true,
          },
        });
      }

      if (gallery) {
        // Mountain → Hearth: back to warm cream for Gallery + Booking
        gsap.to(document.body, {
          backgroundColor: '#F5F0E8',
          scrollTrigger: {
            trigger: gallery,
            start: 'top 90%',
            end: 'top 30%',
            scrub: true,
          },
        });
      }
    };

    // Small delay to ensure DOM is painted
    const timer = setTimeout(init, 100);
    return () => clearTimeout(timer);
  }, []);

  return null;
}
