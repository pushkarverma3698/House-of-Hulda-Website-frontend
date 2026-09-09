const fs = require('fs');
const file = 'components/film/Soundscape.tsx';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(
  /'bg-\[#25D366\] border-transparent shadow-\[0_0_25px_rgba\(37,211,102,0\.4\)\]'/g,
  "'bg-amber-400 border-transparent shadow-[0_0_25px_rgba(245,158,11,0.4)]'"
);
code = code.replace(
  /'border-white\/10 bg-black\/20 hover:scale-\[1\.06\] hover:bg-\[#25D366\] hover:border-transparent'/g,
  "'border-white/10 bg-black/20 hover:scale-[1.06] hover:bg-amber-400 hover:border-transparent'"
);

fs.writeFileSync(file, code);
