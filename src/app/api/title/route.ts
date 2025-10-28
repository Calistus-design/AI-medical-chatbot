// File: src/app/api/title/route.ts

import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const supabase = await createClient();
  
  try {
    // 1. Get the conversation ID and the user's first message from the request
    const { conversationId, message } = await req.json();

    // 2. Basic validation
    if (!conversationId || !message) {
      return NextResponse.json({ error: 'conversationId and message are required.' }, { status: 400 });
    }

    // 3. Get the AI server's address (we'll need to create a new one for the title endpoint)
    // We assume your ngrok URL is the base, and we append the new path.
    const baseApiEndpoint = process.env.NEXT_PUBLIC_AI_API_ENDPOINT?.replace('/ask', '');
    const titleApiEndpoint = `${baseApiEndpoint}/generate-title`;

    // 4. Call the Python AI server's /generate-title endpoint
    const aiResponse = await fetch(titleApiEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: message }), // The Python API expects a 'query' field
    });

    if (!aiResponse.ok) {
      throw new Error('AI server failed to generate a title.');
    }

    const aiData = await aiResponse.json();
    const newTitle = aiData.title;

    if (!newTitle) {
      throw new Error('AI server returned an empty title.');
    }

    // 5. Update the conversation in the Supabase database with the new title
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { error: updateError } = await supabase
      .from('conversations')
      .update({ title: newTitle })
      .eq('id', conversationId)
      .eq('user_id', session.user.id); // Security check

    if (updateError) {
      throw updateError;
    }

    // 6. Return a success response
    return NextResponse.json({ success: true, title: newTitle });

  } catch (error: any) {
    console.error("--- ERROR IN /api/title ROUTE ---", error);
    return NextResponse.json(
      { error: "Failed to generate title." },
      { status: 500 }
    );
  }
}