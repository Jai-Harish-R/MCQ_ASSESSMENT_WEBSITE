const fs = require('fs');
let p = 'src/components/StudentPortal.tsx';
let c = fs.readFileSync(p, 'utf8');

// 1. Remove the incorrectly placed testTitleColors (if it's still there)
const badTarget = `// Generate distinct colors based on test titles
  const testTitleColors = React.useMemo(() => {
    const palette = [
      '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16', '#22c55e', '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9',
      '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899', '#f43f5e', '#dc2626', '#ea580c', '#d97706',
      '#ca8a04', '#65a30d', '#16a34a', '#059669', '#0d9488', '#0891b2', '#0284c7', '#2563eb', '#4f46e5', '#7c3aed', '#c026d3'
    ];
    const uniqueTitles = Array.from(new Set(myAttempts.map(a => a.test_title || 'Unknown Test')));
    const colorMap: Record<string, string> = {};
    uniqueTitles.forEach((title, i) => {
      colorMap[title] = palette[i % palette.length];
    });
    return colorMap;
  }, [myAttempts]);`;

if (c.includes(badTarget)) {
  c = c.replace(badTarget, '');
}

// 2. Insert testTitleColors immediately before the main return statement.
// The main return is:
//     return (
//       <div style={{ backgroundColor: viewState === 'exam' ...

c = c.replace(/    return \(\s*<div style=\{\{ backgroundColor/g, badTarget + '\\n\\n    return (\\n      <div style={{ backgroundColor');

fs.writeFileSync(p, c);
console.log('Moved testTitleColors successfully');
