// File: src/app/api/chat/route.ts

import { NextResponse } from 'next/server';
// We will need this in the next step to add conversational memory
// import { createClient } from '@/lib/supabase/server'; 

export async function POST(req: Request) {
  try {
    // 1. Extract the user's message from the incoming request.
    const { message, history } = await req.json(); // We'll use 'history' soon

    // 2. Get the AI server's address and the secret key from our environment variables.
    const aiApiEndpoint = process.env.NEXT_PUBLIC_AI_API_ENDPOINT;
    const aiApiKey = process.env.AI_API_SECRET_KEY;

    // 3. Basic validation to make sure our environment is configured.
    if (!aiApiEndpoint || !aiApiKey) {
      throw new Error("AI API endpoint or key is not configured.");
    }

    if (!message) {
      return NextResponse.json({ error: 'Message is required.' }, { status: 400 });
    }

    console.log(`Forwarding message to AI: "${message}"`);

    // 4. Make the actual API call to your Python server.
    const aiResponse = await fetch(aiApiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // 'Authorization': `Bearer ${aiApiKey}` // We will add this security header later
      },
      // The body must match the 'QueryRequest' Pydantic model in your Python app.
      body: JSON.stringify({
        query: message,
        history: history || [], // Pass the history, or an empty array
      }),
    });

    // 5. Handle a failed response from the AI server.
    if (!aiResponse.ok) {
      const errorBody = await aiResponse.json();
      console.error("Error from Python AI server:", errorBody);
      throw new Error(`AI server responded with status ${aiResponse.status}`);
    }

    // 6. Extract the JSON response from the AI server.
    const aiData = await aiResponse.json();

    // 7. Send the AI's answer back to the frontend.
    // We also include a 'low' severity for now to maintain the same data structure.
    // This is the new, correct return statement

// aiData is the object we get back from the Python server,
// which already contains { answer: "...", show_hospital_modal: true/false }
// We just need to pass it through directly.
return NextResponse.json(aiData);

  } catch (error: unknown) { // Use 'unknown' instead of 'any'
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    console.error("--- ERROR IN /api/chat ROUTE ---", errorMessage);
    return NextResponse.json(
      { error: "Failed to get a response from the AI assistant." },
      { status: 500 }
    );
  }
}