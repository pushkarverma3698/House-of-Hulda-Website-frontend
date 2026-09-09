const fs = require('fs');
const file = 'hooks/useScrollRig.ts';
let code = fs.readFileSync(file, 'utf8');

// Add ScrollTrigger.defaults
code = code.replace(
  "const lenis = new Lenis({",
  `if (wrapper) {
      ScrollTrigger.defaults({ scroller: wrapper });
    }
    const lenis = new Lenis({`
);

fs.writeFileSync(file, code);
