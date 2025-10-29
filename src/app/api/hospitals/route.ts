// File: src/app/api/hospitals/route.ts

import { createClient } from '@/lib/supabase/server'; // <-- IMPORT OUR NEW, CORRECT SERVER CLIENT
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const supabase = await createClient(); // <-- USE THE NEW ASYNC CLIENT
  const body = await req.json();

  try {
    // SCENARIO 1: Search by Geolocation
    if (body.latitude && body.longitude) {
      const { latitude, longitude } = body;
      const { data, error } = await supabase.rpc('find_nearest_hospitals', {
        target_lat: latitude,
        target_lon: longitude,
      });

      if (error) throw error;
      return NextResponse.json(data);
    }

    // SCENARIO 2: Search by Name
    else if (body.searchTerm) {
      const { searchTerm } = body;
      const { data, error } = await supabase.rpc('search_hospitals_by_name', {
        search_term: searchTerm,
      });

      if (error) throw error;
      return NextResponse.json(data);
    }

    // SCENARIO 3: Invalid Request
    else {
      return NextResponse.json(
        { error: 'Invalid request. Provide either location or a search term.' },
        { status: 400 }
      );
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}