// File: src/app/auth/callback/route.ts

import { createClient } from '@/lib/supabase/server'; // <-- IMPORT OUR NEW SERVER CLIENT
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  if (code) {
    // Use our new async client creator
    const supabase = await createClient(); 
    
    // Exchange the authorization code for a user session
    await supabase.auth.exchangeCodeForSession(code);
  }

  // URL to redirect to after the sign-in process completes
  return NextResponse.redirect(requestUrl.origin);
}