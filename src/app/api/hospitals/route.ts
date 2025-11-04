// File: src/app/api/hospitals/route.ts

import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

// This line helps prevent caching issues with POST requests in Next.js
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const supabase = await createClient();
  // Get all possible parameters from the request body
  const { latitude, longitude, searchTerm } = await req.json();

  try {
    // Basic validation: we always need the user's location.
    if (!latitude || !longitude) {
      return NextResponse.json(
        { error: 'Latitude and longitude are required.' },
        { status: 400 }
      );
    }
    
    // Call our single, unified database function.
    // If searchTerm is not provided by the frontend, it will be undefined, 
    // and we pass `null` to the database function, which is exactly what we want.
    const { data, error } = await supabase.rpc('get_hospitals', {
      user_lat: latitude,
      user_lon: longitude,
      search_term: searchTerm || null,
    });

    if (error) {
      // If there's a database error, log it for debugging and throw it.
      console.error('Supabase RPC Error:', error);
      throw error;
    }

    return NextResponse.json(data);

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}