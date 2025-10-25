// File: src/app/auth/confirm/route.ts

import { type EmailOtpType } from '@supabase/supabase-js';
import { type NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  
  // This is the robust part: we get BOTH possible parameters.
  // The 'code' is for Google login, 'token_hash' is for email confirmation.
  const code = searchParams.get('code');
  const token_hash = searchParams.get('token_hash');
  const type = searchParams.get('type') as EmailOtpType | null;

  // Define the success redirect URL.
  const redirectUrl = origin;

  // First, handle the email confirmation flow
  if (token_hash && type === 'signup') {
    const supabase = createRouteHandlerClient({ cookies });
    const { error } = await supabase.auth.verifyOtp({ type, token_hash });
    if (!error) {
      return NextResponse.redirect(redirectUrl);
    }
  }
  
  // As a fallback, handle the OAuth flow (though this is usually done on /auth/callback)
  if (code) {
    const supabase = createRouteHandlerClient({ cookies });
    await supabase.auth.exchangeCodeForSession(code);
    return NextResponse.redirect(redirectUrl);
  }

  // If neither flow succeeds, redirect to a proper error page.
  // This redirect is now using an ABSOLUTE URL.
  const errorRedirect = `${origin}/auth/auth-code-error`;
  return NextResponse.redirect(errorRedirect);
}