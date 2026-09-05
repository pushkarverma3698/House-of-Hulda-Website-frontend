const fs = require('fs');
const file = 'components/film/CinematicExperience.tsx';
let code = fs.readFileSync(file, 'utf8');

// Replace the fromTo with a timeline
code = code.replace(
  /          gsap\.fromTo\(textWrapper,[\s\S]*?\}\n          \)/g,
  `          gsap.set(textWrapper, { opacity: 0, y: 40, scale: 0.98 });
          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: section,
              scroller: document.getElementById('scroll-wrapper') || window,
              start: 'top 75%',
              end: 'bottom 25%',
              scrub: 1,
            }
          });
          
          tl.to(textWrapper, { opacity: 1, y: 0, scale: 1, duration: 0.15, ease: 'power2.out' })
            .to({}, { duration: 0.7 }) // hold visibility
            .to(textWrapper, { opacity: 0, y: -40, scale: 0.98, duration: 0.15, ease: 'power2.in' });`
);

fs.writeFileSync(file, code);
