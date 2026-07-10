const fs = require('fs');
let p = 'src/components/StudentPortal.tsx';
let c = fs.readFileSync(p, 'utf8');

// Replace Search bar block
const searchRegex = /\{\/\* Search Bar \*\/\}[\s\S]*?\{\/\* Notifications \*\/\}/g;
c = c.replace(searchRegex, '{/* Notifications */}');

// Replace Notifications block
const notifRegex = /\{\/\* Notifications \*\/\}[\s\S]*?\{\/\* Header Avatar \*\/\}/g;
c = c.replace(notifRegex, '{/* Header Avatar */}');

// Replace Dashboard Legend block
const legendRegex = /\{\/\* Legend \*\/\}[\s\S]*?<div style=\{\{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: '600', color: '#475569' \}\}>\s*<Bell size=\{14\} color="#f59e0b" \/> Reminder\s*<\/div>\s*<\/div>/g;
c = c.replace(legendRegex, '');

fs.writeFileSync(p, c);
console.log('Removed unrequired elements with Regex');
