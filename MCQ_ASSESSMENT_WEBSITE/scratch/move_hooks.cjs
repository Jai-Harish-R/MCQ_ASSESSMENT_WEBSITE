const fs = require('fs');
let p = 'src/components/StudentPortal.tsx';
let c = fs.readFileSync(p, 'utf8');

// The hooks block to move
const hooksRegex = /\n\s*\/\/ STANDARD PORTAL WITH SIDEBAR[\s\S]*?(?=\n\s*return \(\n\s*<div className="edu-app-frame")/m;

const match = c.match(hooksRegex);
if (match) {
  const hooksCode = match[0];
  // Remove from old location
  c = c.replace(hooksRegex, '');
  
  // Insert before the early return
  const earlyReturnRegex = /\n\s*\/\/ Active Exam View hides sidebar\n\s*if \(viewState === 'exam' \|\| viewState === 'result'\) \{/m;
  
  if (c.match(earlyReturnRegex)) {
    c = c.replace(earlyReturnRegex, hooksCode + '\n' + '$&');
    fs.writeFileSync(p, c);
    console.log('Hooks moved successfully!');
  } else {
    console.error('Could not find early return to insert before.');
  }
} else {
  console.error('Could not find hooks block to move.');
}
