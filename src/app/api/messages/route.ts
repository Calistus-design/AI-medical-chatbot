// File: src/app/api/messages/route.ts

import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const supabase = await createClient();
  const body = await req.json();
  const { conversation_id, content, role, is_emergency_prompt } = body;

  console.log("🟢 Received Request Body:", body);
  console.log("🔵 Coerced Boolean:", Boolean(is_emergency_prompt));

  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      console.log("❌ Unauthorized - No session found");
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const insertData = {
      conversation_id,
      content,
      role,
      user_id: session.user.id,
      is_emergency_prompt: Boolean(is_emergency_prompt),
    };

    console.log("🟣 Inserting into Supabase:", insertData);

    const { error } = await supabase.from('messages').insert(insertData);

    if (error) {
      console.error("🔥 Supabase Insert Error:", error);
      throw error;
    }

    console.log("✅ Message inserted successfully!");
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    console.error("💥 Route Error:", errorMessage);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
