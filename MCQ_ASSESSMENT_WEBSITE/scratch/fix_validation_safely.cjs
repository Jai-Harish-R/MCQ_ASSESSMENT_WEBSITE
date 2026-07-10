const fs = require('fs');
let p = 'src/components/StudentPortal.tsx';
let lines = fs.readFileSync(p, 'utf8').split('\n');

const demoIdx = lines.findIndex(l => l.includes("const localAttempts = JSON.parse(localStorage.getItem('demo_attempts')"));
if (demoIdx !== -1 && !lines[demoIdx - 1].includes('Strict Validation')) {
  lines.splice(demoIdx, 0, 
    '          // Strict Validation (Demo)',
    '          if (test.allowed_emails !== null && test.allowed_emails !== undefined) {',
    '            const isAllowed = test.allowed_emails.some((e: string) => e.toLowerCase() === user.email.toLowerCase());',
    '            if (!isAllowed) {',
    '              setErrorMsg("Access Denied: Your email address is not authorized to take this test.");',
    '              setLoading(false);',
    '              return;',
    '            }',
    '          }'
  );
}

const sbIdx = lines.findIndex((l, i) => i > 600 && l.includes("const { data: attemptData, error: attemptErr } = await supabase"));
if (sbIdx !== -1 && !lines[sbIdx - 1].includes('Strict Validation')) {
  // Find the exact line above `if (test) {`
  let insertIdx = sbIdx;
  while (insertIdx > 0 && !lines[insertIdx].includes('if (test) {')) {
    insertIdx--;
  }
  if (insertIdx > 0) {
    lines.splice(insertIdx, 0,
      '        // Strict Validation (Supabase)',
      '        if (test && test.allowed_emails !== null && test.allowed_emails !== undefined) {',
      '          const isAllowed = test.allowed_emails.some((e: string) => e.toLowerCase() === user.email.toLowerCase());',
      '          if (!isAllowed) {',
      '            setErrorMsg("Access Denied: Your email address is not authorized to take this test.");',
      '            setLoading(false);',
      '            return;',
      '          }',
      '        }',
      ''
    );
  }
}

fs.writeFileSync(p, lines.join('\n'));
console.log('Successfully injected validations safely via line index splicing.');
