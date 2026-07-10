const fs = require('fs');

let p = 'src/App.tsx';
let c = fs.readFileSync(p, 'utf8');

c = c.replace(
  "const [isDemo, setIsDemo] = useState(false);",
  ""
);

c = c.replace(
  "  const handleAuthSuccess = (authenticatedUser: UserState, demoMode: boolean) => {\n    setUser(authenticatedUser);\n    setIsDemo(demoMode);\n  };",
  "  const handleAuthSuccess = (authenticatedUser: UserState) => {\n    setUser(authenticatedUser);\n  };"
);

const logoutTarget = `  const handleLogout = async () => {
    if (isDemo) {
      setUser(null);
      setIsDemo(false);
    } else {
      try {
        await supabase.auth.signOut();
        setUser(null);
      } catch (err) {
        console.error('Logout error', err);
      }
    }
  };`;

const logoutReplace = `  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
    } catch (err) {
      console.error('Logout error', err);
    }
  };`;

c = c.replace(logoutTarget, logoutReplace);

c = c.replace(
  "<TeacherDashboard user={user} isDemo={isDemo} onLogout={handleLogout} />",
  "<TeacherDashboard user={user} onLogout={handleLogout} />"
);

c = c.replace(
  "<StudentPortal user={user} isDemo={isDemo} onLogout={handleLogout} />",
  "<StudentPortal user={user} onLogout={handleLogout} />"
);

fs.writeFileSync(p, c);
console.log('App.tsx demo mode removed.');
