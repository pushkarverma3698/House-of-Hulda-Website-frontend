const fs = require('fs');
const file = 'components/film/CinematicExperience.tsx';
let code = fs.readFileSync(file, 'utf8');

// Remove TimeRail import and component
code = code.replace(/import \{ TimeRail \} from ".\/TimeRail"\n/g, "");
code = code.replace(/<TimeRail \/>\n/g, "");

// Fix GSAP ScrollTrigger to use wrapper and scrub
code = code.replace(
  /              duration: 1.2,\n              ease: 'power4.out',\n              scrollTrigger: {\n                trigger: section,\n                start: 'top 70%',\n                end: 'bottom 30%',\n                toggleActions: 'play reverse play reverse',\n                fastScrollEnd: true,\n              }/g,
  `              scrollTrigger: {
                trigger: section,
                scroller: document.getElementById('scroll-wrapper') || window,
                start: 'top 70%',
                end: 'bottom 30%',
                scrub: 1,
              }`
);

fs.writeFileSync(file, code);
