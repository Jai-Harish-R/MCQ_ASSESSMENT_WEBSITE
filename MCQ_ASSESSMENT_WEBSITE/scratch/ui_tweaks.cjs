const fs = require('fs');

// 1. AuthGate: "I am from" -> "Select Organization Type"
let pAuth = 'src/components/AuthGate.tsx';
let cAuth = fs.readFileSync(pAuth, 'utf8');
cAuth = cAuth.replace('<label style={{ display: \'block\', fontSize: \'13px\', fontWeight: \'600\', color: \'#475569\', marginBottom: \'8px\' }}>I am from</label>', '<label style={{ display: \'block\', fontSize: \'13px\', fontWeight: \'600\', color: \'#475569\', marginBottom: \'8px\' }}>Select Organization Type</label>');
fs.writeFileSync(pAuth, cAuth);

// 2. TeacherDashboard Updates
let pDash = 'src/components/TeacherDashboard.tsx';
let cDash = fs.readFileSync(pDash, 'utf8');

// A. Add dynamic dashboard titles
const dynamicTitleCode = `  let dashboardTitle = 'Organization Dashboard';
  let dashboardSubtitle = 'Create and manage assessments, monitor participant performance, and generate detailed reports.';
  
  if (profession === 'School') {
    dashboardTitle = 'School Dashboard';
    dashboardSubtitle = 'Manage school assessments, monitor class performance, and track student progress.';
  } else if (profession === 'College / University') {
    dashboardTitle = 'College Dashboard';
    dashboardSubtitle = 'Create academic assessments, evaluate student performance, and monitor departmental results.';
  } else if (profession === 'Company') {
    dashboardTitle = 'Company Dashboard';
    dashboardSubtitle = 'Conduct employee assessments, evaluate workforce performance, and monitor training progress.';
  }

  // Effect to load initial data`;

cDash = cDash.replace(`  // Effect to load initial data`, dynamicTitleCode);

// B. Replace Header Title/Subtitle UI
const headerTarget = `        <div className="workspace-header">
          <div>
            <h1 className="header-title">Teacher Dashboard</h1>
            <p className="header-subtitle">Overview of active assessments and student outcomes.</p>
          </div>`;

const headerReplace = `        <div className="workspace-header">
          <div>
            <h1 className="header-title">{dashboardTitle}</h1>
            <p className="header-subtitle">{dashboardSubtitle}</p>
          </div>`;
cDash = cDash.replace(headerTarget, headerReplace);

// C. Remove "CodersFun Administrator Panel" from the sidebar
// In the sidebar header, it says "CodersFun Administrator Panel" next to the ShieldCheck.
const adminPanelTarget = `<ShieldCheck size={18} style={{ color: '#ea580c' }} />
              CodersFun Administrator Panel
            </span>`;
// I will just remove the text, keep the shield or remove the whole block.
// The user says "CodersFun Administrator Panel REMOVE THIS". I will just remove the text and the shield.
const adminPanelReplace = `</span>`;
cDash = cDash.replace(adminPanelTarget, adminPanelReplace);

fs.writeFileSync(pDash, cDash);
console.log('UI updates applied successfully.');
