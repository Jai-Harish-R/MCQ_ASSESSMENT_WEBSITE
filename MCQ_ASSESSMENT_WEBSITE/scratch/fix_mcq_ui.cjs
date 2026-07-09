const fs = require('fs');
let p = 'src/components/StudentPortal.tsx';
let c = fs.readFileSync(p, 'utf8');

// Layout changes for Exam view
c = c.replace(/maxWidth: '800px'/g, "maxWidth: viewState === 'exam' ? '1200px' : '800px'");
c = c.replace(/backgroundColor: 'var\(--color-background\)'/g, "backgroundColor: viewState === 'exam' ? '#fdfbf7' : 'var(--color-background)'");

// Wrap the main exam content and the navigator in a grid
const gridStartStr = `{viewState === 'exam' && activeTest && (!activeTest.questions || activeTest.questions.length === 0 || !activeTest.questions[currentQIdx])`;
const gridStartTarget = `{viewState === 'exam' && activeTest && activeTest.questions && activeTest.questions.length > 0 && activeTest.questions[currentQIdx] && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>`;
const gridStartReplacement = `{viewState === 'exam' && activeTest && activeTest.questions && activeTest.questions.length > 0 && activeTest.questions[currentQIdx] && (
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '32px', alignItems: 'start' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>`;
c = c.replace(gridStartTarget, gridStartReplacement);

// Before navigator, close the left div and start the right div
const navigatorStr = `{/* Navigator */}
              <div className="card">`;
const navigatorReplacement = `</div> {/* End left column */}
              
              {/* Navigator - Right column */}
              <div className="card" style={{ position: 'sticky', top: '24px' }}>`;
c = c.replace(navigatorStr, navigatorReplacement);

// Button styling
const prevBtnTarget = `className="btn btn-secondary" disabled={currentQIdx === 0}`;
const prevBtnReplacement = `style={{ border: '1px solid #ea580c', color: '#ea580c', backgroundColor: 'transparent', display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 24px', borderRadius: '8px', fontWeight: '600', cursor: currentQIdx === 0 ? 'not-allowed' : 'pointer', opacity: currentQIdx === 0 ? 0.5 : 1 }} disabled={currentQIdx === 0}`;
c = c.replace(prevBtnTarget, prevBtnReplacement);

const nextBtnTarget = `className="btn btn-secondary">
                      Next <ArrowRight`;
const nextBtnReplacement = `style={{ border: '1px solid #ea580c', color: '#ea580c', backgroundColor: 'transparent', display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 24px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>
                      Next <ArrowRight`;
c = c.replace(nextBtnTarget, nextBtnReplacement);

// Flag triangle
const navBoxRegex = /<button key=\{q\.id\} onClick=\{.*?\).*?\} className=\{\`nav-box \$\{styleClass\} \$\{isActive \? 'nav-box-active' : ''\}\`\}>\s*\{idx \+ 1\}\s*<\/button>/;
const navBoxReplacement = `<button key={q.id} onClick={() => setCurrentQIdx(idx)} className={\`nav-box \${styleClass} \${isActive ? 'nav-box-active' : ''}\`} style={{ position: 'relative', overflow: 'hidden' }}>
                        {idx + 1}
                        {isFlagged && <div style={{ position: 'absolute', top: '-10px', right: '-10px', width: '20px', height: '20px', backgroundColor: '#ea580c', transform: 'rotate(45deg)' }}></div>}
                      </button>`;
c = c.replace(navBoxRegex, navBoxReplacement);

fs.writeFileSync(p, c);
console.log('Exam layout updated');
