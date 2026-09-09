const fs = require('fs');
const file = 'app/layout.tsx';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(
  "{children}\n          {booking}",
  `<main id="scroll-wrapper" className="h-[100dvh] w-[100dvw] overflow-y-auto overflow-x-hidden relative">
            <div id="scroll-content">
              {children}
              {booking}
            </div>
          </main>`
);

fs.writeFileSync(file, code);
