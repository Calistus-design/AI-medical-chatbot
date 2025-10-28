// File: src/app/api/conversations/[conversationId]/route.ts

import { createClient } from '@/lib/supabase/server'; // <-- Use our new server client
import { NextResponse } from 'next/server';

// No 'noStore' or 'force-dynamic' is needed now.

export async function GET(
  req: Request,
  { params }: { params: { conversationId: string } }
) {
  const supabase = await createClient(); // <-- Must now be awaited
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

    if (error) {
      throw error;
    }

    if (!messages) {
      return NextResponse.json({ error: 'Conversation not found.' }, { status: 404 });
    }

    return NextResponse.json(messages);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { conversationId: string } }
) {
  const supabase = await createClient(); // <-- Must now be awaited
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
      throw error;
    }

    return NextResponse.json({ success: true, message: 'Conversation deleted.' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}



// --- ADD THIS NEW PATCH FUNCTION ---
export async function PATCH(
  req: Request,
  { params }: { params: { conversationId: string } }
) {
  const supabase = await createClient();
  const { conversationId } = params;
  const { title } = await req.json(); // Get the new title from the request body

  // Basic validation
  if (!title) {
    return NextResponse.json({ error: 'Title is required.' }, { status: 400 });
  }

  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Update the conversation row.
    // Just like with DELETE, we use a double 'eq' check for security.
    // This ensures a user can ONLY update the title of THEIR OWN conversation.
    const { data, error } = await supabase
      .from('conversations')
      .update({ title: title }) // Set the new title
      .eq('id', conversationId)
      .eq('user_id', session.user.id) // CRITICAL security check
      .select()
      .single(); // Return the updated conversation object

    if (error) {
      // This will handle cases where the conversation doesn't exist or doesn't belong to the user
      console.error('Error updating conversation:', error);
      throw error;
    }

    return NextResponse.json(data); // Return the updated conversation

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}