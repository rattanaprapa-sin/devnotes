import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../config/supabase';

const AuthContext = createContext({});

const INACTIVITY_TIMEOUT_MS = 30 * 24 * 60 * 60 * 1000; // 30 days
const LAST_ACTIVITY_KEY = 'devnotes_last_activity';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkInactivity = async (currentSession) => {
    if (!currentSession) return;
    
    const lastActivityStr = localStorage.getItem(LAST_ACTIVITY_KEY);
    const now = Date.now();
    
    if (lastActivityStr) {
      const lastActivity = parseInt(lastActivityStr, 10);
      if (now - lastActivity > INACTIVITY_TIMEOUT_MS) {
        // Inactive for too long
        console.log('Session expired due to inactivity');
        await supabase.auth.signOut();
        localStorage.removeItem(LAST_ACTIVITY_KEY);
        return;
      }
    }
    
    // Update last activity to now
    localStorage.setItem(LAST_ACTIVITY_KEY, now.toString());
  };

  useEffect(() => {
    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      checkInactivity(session);
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for changes on auth state (logged in, signed out, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (_event === 'SIGNED_IN' || _event === 'TOKEN_REFRESHED') {
        localStorage.setItem(LAST_ACTIVITY_KEY, Date.now().toString());
      } else if (_event === 'SIGNED_OUT') {
        localStorage.removeItem(LAST_ACTIVITY_KEY);
      }
      
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const value = {
    session,
    user,
    loading,
    signOut: () => supabase.auth.signOut(),
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
