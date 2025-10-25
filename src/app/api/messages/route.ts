// File: src/app/api/messages/route.ts

import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  const { conversation_id, content, role } = await req.json();

  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Here, our Row Level Security policy is doing the hard work.
    // It will automatically prevent a user from inserting a message
    // into a conversation they do not own.
    const { data, error } = await supabase
      .from('messages')
      .insert({
        conversation_id,
        content,
        role,
        user_id: session.user.id, // We always set the user_id on the server
      });

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}