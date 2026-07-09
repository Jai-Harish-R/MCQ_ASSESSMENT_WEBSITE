import { useState, useEffect } from 'react';
import { supabase } from './utils/supabase';
import AuthGate from './components/AuthGate';
import TeacherDashboard from './components/TeacherDashboard';
import StudentPortal from './components/StudentPortal';

import { ErrorBoundary } from './components/ErrorBoundary';

interface UserState {
  id: string;
  email: string;
  role: 'teacher' | 'student';
}

export default function App() {
  const [user, setUser] = useState<UserState | null>(null);
  const [isDemo, setIsDemo] = useState(false);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    // 1. Check if user is already logged in on Supabase
    async function checkUser() {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        
        if (session?.user) {
          // Fetch role from profile table
          const { data: profile, error: profileErr } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', session.user.id)
            .single();

          if (profileErr) {
            console.warn("Could not find user profile in database. Provisioning session with metadata metadata role...");
            // Use metadata role if profiles sync failed
            const metadataRole = session.user.user_metadata?.role || 'student';
            setUser({
              id: session.user.id,
              email: session.user.email || '',
              role: metadataRole as 'teacher' | 'student'
            });
          } else {
            setUser({
              id: session.user.id,
              email: session.user.email || '',
              role: profile.role as 'teacher' | 'student'
            });
          }
        }
      } catch (err) {
        console.warn("Supabase auth session sync bypassed (development mode):", err);
      } finally {
        setInitializing(false);
      }
    }

    checkUser();

    // 2. Setup auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        try {
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', session.user.id)
            .single();

          const resolvedRole = profile?.role || session.user.user_metadata?.role || 'student';
          setUser({
            id: session.user.id,
            email: session.user.email || '',
            role: resolvedRole as 'teacher' | 'student'
          });
        } catch (e) {
          console.error("Auth state change sync role error", e);
        }
      } else {
        setUser(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleAuthSuccess = (authenticatedUser: UserState, demoMode: boolean) => {
    setUser(authenticatedUser);
    setIsDemo(demoMode);
  };

  const handleLogout = async () => {
    if (isDemo) {
      setUser(null);
      setIsDemo(false);
    } else {
      try {
        await supabase.auth.signOut();
        setUser(null);
      } catch (err) {
        console.error("Signout error:", err);
        setUser(null); // Force local reset anyway
      }
    }
  };

  if (initializing) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--color-background)',
        fontFamily: 'var(--font-headlines)',
        fontSize: '15px',
        fontWeight: '500',
        color: 'var(--color-primary)'
      }}>
        Initializing Academic Precision secure channel...
      </div>
    );
  }

  if (!user) {
    return <AuthGate onAuthSuccess={handleAuthSuccess} />;
  }

  return (
    <>
      {user.role === 'teacher' ? (
        <ErrorBoundary name="TeacherDashboard">
          <TeacherDashboard user={user} isDemo={isDemo} onLogout={handleLogout} />
        </ErrorBoundary>
      ) : (
        <ErrorBoundary name="StudentPortal">
          <StudentPortal user={user} isDemo={isDemo} onLogout={handleLogout} />
        </ErrorBoundary>
      )}
    </>
  );
}
