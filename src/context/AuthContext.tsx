// File: src/context/AuthContext.tsx

'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Session, SupabaseClient } from '@supabase/supabase-js';

// Define the shape of our context data
interface AuthContextType {
  supabase: SupabaseClient;
  session: Session | null;
}

// Create the context with a default undefined value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Create the AuthProvider component
export function AuthProvider({ children }: { children: ReactNode }) {
  // IMPORTANT: This creates a Supabase client that is safe to use in the browser.
  // It uses the public environment variables.
  const supabase = createClientComponentClient();
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    // This effect runs once to get the initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    // This is the key part: Supabase's onAuthStateChange listener.
    // It fires an event every time the user logs in, logs out, or their session changes.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    // When the component unmounts, we unsubscribe from the listener
    return () => subscription.unsubscribe();
  }, [supabase]);

  const value = { supabase, session };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Create a custom hook to easily access the context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
