// File: src/app/api/chat/route.ts

import { NextResponse } from "next/server";

// A helper function to simulate network delay
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function POST(req: Request) {
  try {
    const { message } = await req.json();
    await sleep(1000); // Simulate AI thinking time

    let severity: 'low' | 'medium' | 'critical' = 'low';
    let answer = "This is a simulated response for a low-severity query.";

    // --- This is our new "intelligence" logic ---
    // We'll check if the user's message contains keywords that
    // suggest a critical emergency. This is a simple but effective simulation.
    const lowerCaseMessage = message.toLowerCase();
    if (lowerCaseMessage.includes('chest pain') || lowerCaseMessage.includes('can\'t breathe') || lowerCaseMessage.includes('stroke') || lowerCaseMessage.includes('severe bleeding')) {
      severity = 'critical';
      answer = "Based on your description, this could be a critical emergency. It is important to seek professional medical help immediately. While you wait for help to arrive, I will provide some initial guidance.";
    } else if (lowerCaseMessage.includes('cut') || lowerCaseMessage.includes('burn') || lowerCaseMessage.includes('sprain')) {
      severity = 'medium';
      answer = "This is a simulated response for a medium-severity query like a cut or sprain. Here are some first-aid steps you can take.";
    }
    // --- End of intelligence logic ---


    // We now send back a structured JSON object.
    return NextResponse.json({
      answer: answer,
      severity: severity,
    });

  } catch (error) {
    console.error("--- SIMULATED API ERROR ---");
    console.error(error);
    console.log("----------------------------");

    return NextResponse.json(
      { error: "Failed to generate simulated response." },
      { status: 500 }
    );
  }
}