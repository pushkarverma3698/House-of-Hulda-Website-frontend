const fs = require('fs');
const file = 'app/globals.css';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(
  "html,\nbody {\n  margin: 0;\n  padding: 0;\n  background: #0a0f17;\n  overflow-x: hidden;",
  "html,\nbody {\n  margin: 0;\n  padding: 0;\n  background: #0a0f17;\n  overflow: hidden;\n  height: 100dvh;\n  width: 100dvw;\n  position: fixed;\n  inset: 0;"
);

fs.writeFileSync(file, code);
