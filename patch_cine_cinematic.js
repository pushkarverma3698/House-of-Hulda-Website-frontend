const fs = require('fs');
const file = 'components/film/CinematicExperience.tsx';
let code = fs.readFileSync(file, 'utf8');

const oldGSAP = `          gsap.set(textWrapper, { opacity: 0, y: 40, scale: 0.98 });
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
            .to(textWrapper, { opacity: 0, y: -40, scale: 0.98, duration: 0.15, ease: 'power2.in' });`;

const newGSAP = `          const elements = Array.from(textWrapper.children);
          gsap.set(elements, { opacity: 0, y: 60, filter: 'blur(16px)', scale: 0.95 });
          
          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: section,
              scroller: document.getElementById('scroll-wrapper') || window,
              start: 'top 85%',
              end: 'bottom 15%',
              scrub: 1.2,
            }
          });
          
          tl.to(elements, { 
            opacity: 1, 
            y: 15, 
            filter: 'blur(0px)', 
            scale: 1, 
            duration: 0.25, 
            ease: 'power3.out',
            stagger: 0.05
          })
          .to(elements, {
            y: -15,
            duration: 0.5,
            ease: 'none'
          })
          .to(elements, { 
            opacity: 0, 
            y: -60, 
            filter: 'blur(16px)', 
            scale: 1.05, 
            duration: 0.25, 
            ease: 'power3.in',
            stagger: 0.03
          }, ">-0.1");`;

if (code.includes('gsap.set(textWrapper, { opacity: 0, y: 40, scale: 0.98 });')) {
  code = code.replace(oldGSAP, newGSAP);
  fs.writeFileSync(file, code);
  console.log("Patched successfully.");
} else {
  console.log("Could not find the target code to replace.");
}
