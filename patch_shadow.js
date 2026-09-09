const fs = require('fs');
const file = 'components/film/CinematicExperience.tsx';
let code = fs.readFileSync(file, 'utf8');

// Remove drop-shadow-2xl from all story-scrim elements
code = code.replace(/className="story-scrim relative space-y-4 md:space-y-6 max-w-2xl pointer-events-auto drop-shadow-2xl"/g, 'className="story-scrim relative space-y-4 md:space-y-6 max-w-2xl pointer-events-auto"');
code = code.replace(/className="story-scrim relative space-y-4 md:space-y-6 max-w-lg pointer-events-auto drop-shadow-2xl"/g, 'className="story-scrim relative space-y-4 md:space-y-6 max-w-lg pointer-events-auto"');
code = code.replace(/className="story-scrim relative space-y-4 md:space-y-6 pointer-events-auto drop-shadow-2xl"/g, 'className="story-scrim relative space-y-4 md:space-y-6 pointer-events-auto"');
code = code.replace(/className="story-scrim relative space-y-6 md:space-y-8 max-w-xl pointer-events-auto drop-shadow-2xl"/g, 'className="story-scrim relative space-y-6 md:space-y-8 max-w-xl pointer-events-auto"');

fs.writeFileSync(file, code);
