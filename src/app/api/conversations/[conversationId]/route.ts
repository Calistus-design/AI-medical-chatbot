// File: src/app/api/conversations/[conversationId]/route.ts

import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { unstable_noStore as noStore } from 'next/cache'; // <-- IMPORT THIS

// DELETE the 'export const dynamic...' line

export async function GET(req: Request, { params }: { params: { conversationId: string } }) {
  noStore(); // <-- ADD THIS AT THE TOP OF THE FUNCTION
  const supabase = createRouteHandlerClient({ cookies });
  const { conversationId } = params;
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { data: messages, error } = await supabase
      .from('messages')
      .select('role, content')
      .eq('conversation_id', conversationId)
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: true });
    if (error) throw error;
    if (!messages) {
      return NextResponse.json({ error: 'Conversation not found.' }, { status: 404 });
    }
    return NextResponse.json(messages);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { conversationId: string } }) {
  noStore(); // <-- ADD THIS AT THE TOP OF THE FUNCTION
  const supabase = createRouteHandlerClient({ cookies });
  const { conversationId } = params;
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { error } = await supabase
      .from('conversations')
      .delete()
      .eq('id', conversationId)
      .eq('user_id', session.user.id);
    if (error) {
      console.error('Error from Supabase on delete:', error);
      throw error;
    }
    return NextResponse.json({ success: true, message: 'Conversation deleted.' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}