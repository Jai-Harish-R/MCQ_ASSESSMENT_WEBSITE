const fs = require('fs');
let p = 'src/components/StudentPortal.tsx';
let lines = fs.readFileSync(p, 'utf8').split('\n');

// Find the block
let startIdx = lines.findIndex(l => l.includes('const assessmentsOverview = React.useMemo('));
let endIdx = lines.findIndex(l => l.includes('}, [myAttempts]);'));

if (startIdx !== -1 && endIdx !== -1) {
  // Extract the block
  let block = lines.splice(startIdx, (endIdx - startIdx) + 1);
  
  // Find insertion point
  let insertIdx = lines.findIndex(l => l.includes('// Active Exam View hides sidebar'));
  if (insertIdx !== -1) {
    // Insert
    lines.splice(insertIdx, 0, ...block, '');
    fs.writeFileSync(p, lines.join('\n'));
    console.log('Successfully moved hooks!');
  } else {
    console.error('Could not find insert point.');
  }
} else {
  console.error('Could not find block to extract.');
}
