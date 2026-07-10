const fs = require('fs');
let p = 'src/components/StudentPortal.tsx';
let c = fs.readFileSync(p, 'utf8');

// Remove Search Bar & Notifications from Header
const headerTarget = `        {/* Top Header Bar */}
        <header style={{ 
          display: 'flex', alignItems: 'center', justifyContent: 'flex-end', 
          padding: '24px 40px', gap: '24px', backgroundColor: 'transparent'
        }}>
          {/* Search Bar */}
          <div style={{ position: 'relative', width: '280px' }}>
            <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: '16px' }}>🔍</span>
            <input 
              type="text" 
              placeholder="Search anything..." 
              style={{
                width: '100%', padding: '12px 16px 12px 42px', borderRadius: '24px', border: '1px solid #e2e8f0',
                backgroundColor: '#ffffff', fontSize: '14px', outline: 'none', color: '#0f172a'
              }} 
            />
          </div>

          {/* Notifications */}
          <div style={{ position: 'relative', cursor: 'pointer' }}>
            <Bell size={24} color="#64748b" />
            <span style={{ 
              position: 'absolute', top: '-4px', right: '-4px', backgroundColor: '#ef4444', 
              color: 'white', fontSize: '10px', fontWeight: 'bold', width: '16px', height: '16px', 
              borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: '2px solid #ffffff'
            }}>3</span>
          </div>

          {/* Header Avatar */}
          <img src={studentAvatar as any} alt="User" style={{ width: '40px', height: '40px', borderRadius: '50%', cursor: 'pointer', border: '2px solid #ffffff', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }} />
        </header>`;

const headerReplacement = `        {/* Top Header Bar */}
        <header style={{ 
          display: 'flex', alignItems: 'center', justifyContent: 'flex-end', 
          padding: '24px 40px', gap: '24px', backgroundColor: 'transparent'
        }}>
          {/* Header Avatar */}
          <img src={studentAvatar as any} alt="User" style={{ width: '40px', height: '40px', borderRadius: '50%', cursor: 'pointer', border: '2px solid #ffffff', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }} />
        </header>`;

c = c.replace(headerTarget, headerReplacement);

// Remove Legend from Review Attempts Tab
const legendTarget = `                    {/* Legend */}
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #f1f5f9' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: '600', color: '#475569' }}><FileText size={14} color="#3b82f6" /> Test</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: '600', color: '#475569' }}><ClipboardEdit size={14} color="#ea580c" /> Assignment</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: '600', color: '#475569' }}><Trophy size={14} color="#a855f7" /> Quiz</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: '600', color: '#475569' }}><Target size={14} color="#22c55e" /> Result</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: '600', color: '#475569' }}><BookOpen size={14} color="#ef4444" /> Live Exam</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: '600', color: '#475569' }}><Bell size={14} color="#f59e0b" /> Reminder</div>
                    </div>`;

c = c.replace(legendTarget, '');

fs.writeFileSync(p, c);
console.log('Removed unrequired elements');
