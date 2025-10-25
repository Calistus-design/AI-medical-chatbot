// File: src/app/api/conversations/route.ts

import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { unstable_noStore as noStore } from 'next/cache'; // <-- IMPORT THIS

// DELETE the 'export const dynamic...' line

export async function GET() {
  noStore(); // <-- ADD THIS AT THE TOP OF THE FUNCTION
  const supabase = createRouteHandlerClient({ cookies });
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json([]); // Return empty array if not logged in
    }
    const { data: conversations, error } = await supabase
      .from('conversations')
      .select('id, title')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return NextResponse.json(conversations);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  noStore(); // <-- ADD THIS AT THE TOP OF THE FUNCTION
  const supabase = createRouteHandlerClient({ cookies });
  const { title } = await req.json();
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { data, error } = await supabase
      .from('conversations')
      .insert({ title: title, user_id: session.user.id })
      .select()
      .single();
    if (error) throw error;
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}