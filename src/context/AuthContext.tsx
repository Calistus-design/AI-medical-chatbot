// File: src/context/AuthContext.tsx

'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Session, SupabaseClient } from '@supabase/supabase-js';

// Define the shape of our context data - NOW CORRECT
interface AuthContextType {
  supabase: SupabaseClient;
  session: Session | null;
  isSidebarOpen: boolean;         // <-- ADDED THIS LINE
  toggleSidebar: () => void;      // <-- ADDED THIS LINE
}

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Create the AuthProvider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const supabase = createClientComponentClient();
  const [session, setSession] = useState<Session | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // This useEffect is crucial for keeping the session up-to-date in real-time
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  const toggleSidebar = () => {
    setIsSidebarOpen(prev => !prev);
  };

  // The value now matches the AuthContextType interface
  const value = {
    supabase,
    session,
    isSidebarOpen,
    toggleSidebar,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom hook remains the same
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}