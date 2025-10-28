// File: src/context/AuthContext.tsx

'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { createClient } from '@/lib/supabase/client'; // <-- IMPORT THE NEW CLIENT-SIDE HELPER
import type { SupabaseClient, Session } from '@supabase/supabase-js';

// Define the shape of our context data
interface AuthContextType {
  supabase: SupabaseClient;
  session: Session | null;
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
}

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Create the AuthProvider component
export function AuthProvider({ children }: { children: ReactNode }) {
  // Use the new client-side helper to create the Supabase client
  const supabase = createClient();
  const [session, setSession] = useState<Session | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    // This effect runs once to get the initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    // This listener fires on LOGIN, LOGOUT, and other auth events
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    // Cleanup the subscription when the component unmounts
    return () => subscription.unsubscribe();
  }, [supabase]);

  const toggleSidebar = () => {
    setIsSidebarOpen(prev => !prev);
  };

  const value = {
    supabase,
    session,
    isSidebarOpen,
    toggleSidebar,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom hook to easily access the context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}