// File: src/app/api/messages/route.ts

import { createClient } from '@/lib/supabase/server'; // <-- IMPORT OUR NEW SERVER CLIENT
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const supabase = await createClient(); // <-- USE OUR NEW ASYNC CLIENT
  const { conversation_id, content, role } = await req.json();

  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // The logic remains the same, but now it uses the new, correctly authenticated client.
    const { data, error } = await supabase
      .from('messages')
      .insert({
        conversation_id,
        content,
        role,
        user_id: session.user.id, // We always set the user_id on the server
      });

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}