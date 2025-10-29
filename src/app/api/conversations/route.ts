// File: src/app/api/conversations/route.ts

import { createClient } from '@/lib/supabase/server'; // <-- Use our new server client
import { NextResponse } from 'next/server';

// No 'noStore' or 'force-dynamic' is needed now. The new library handles this.

export async function GET() {
  const supabase = await createClient(); // <-- Must now be awaited
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json([]); // Return an empty array, not an error
    }
    
    const { data: conversations, error } = await supabase
      .from('conversations')
      .select('id, title')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return NextResponse.json(conversations);

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
}
}

export async function POST(req: Request) {
  const supabase = await createClient(); // <-- Must now be awaited
  const { title } = await req.json();

  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data, error } = await supabase
      .from('conversations')
      .insert({ title: title, user_id: session.user.id })
      .select()
      .single();

    if (error) {
      throw error;
    }
    
    return NextResponse.json(data);

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
}
}