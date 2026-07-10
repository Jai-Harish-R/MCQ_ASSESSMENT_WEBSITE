const fs = require('fs');
let p = 'src/components/StudentPortal.tsx';
let lines = fs.readFileSync(p, 'utf8').split('\n');

// 1. Add interface
const typeIdx = lines.findIndex(l => l.includes("type?: 'test' | 'assignment' | 'quiz' | 'live_exam';"));
if (typeIdx !== -1 && !lines[typeIdx + 1].includes('allowed_emails')) {
  lines.splice(typeIdx + 1, 0, "  allowed_emails?: string[] | null;");
}

// 2. Demo Validation
const demoIdx = lines.findIndex((l, i) => i > 500 && l.includes("const localAttempts = JSON.parse(localStorage.getItem('demo_attempts')"));
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

// 3. Supabase Validation
const sbIdx = lines.findIndex((l, i) => i > 600 && l.includes("const { data: attemptData, error: attemptErr } = await supabase"));
if (sbIdx !== -1 && !lines[sbIdx - 1].includes('Strict Validation')) {
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
console.log('Validations injected');
