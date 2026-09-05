const fs = require('fs');
const file = 'app/page.tsx';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(/import \{ SmoothScroll \} from "@\/components\/film\/SmoothScroll";\n/g, "");
code = code.replace(/<SmoothScroll>\n/g, "");
code = code.replace(/<\/SmoothScroll>\n/g, "");
code = code.replace(/<CinematicExperience \/>/g, "<CinematicExperience />\n");

fs.writeFileSync(file, code);
