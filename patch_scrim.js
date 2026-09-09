const fs = require('fs');
const file = 'app/globals.css';
let code = fs.readFileSync(file, 'utf8');

// Find and wipe out all story-scrim related styles
code = code.replace(/\.story-scrim \{[\s\S]*?\n\}/g, '');
code = code.replace(/\.story-scrim > \* \{[\s\S]*?\n\}/g, '');
code = code.replace(/\.story-scrim::before \{[\s\S]*?\n\}/g, '');
code = code.replace(/\.story-scrim-right \{[\s\S]*?\n\}/g, '');
code = code.replace(/\.story-scrim-left \{[\s\S]*?\n\}/g, '');
code = code.replace(/\[data-film-fit='aperture'\] \.story-scrim \{[\s\S]*?\n\}/g, '');
code = code.replace(/\[data-film-fit='aperture'\] \.story-scrim::before \{[\s\S]*?\n\}/g, '');

fs.writeFileSync(file, code);
