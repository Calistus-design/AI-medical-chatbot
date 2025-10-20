// File: src/app/api/hospitals/route.ts

import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// This endpoint will receive a POST request containing the user's coordinates.

export async function POST(req: Request) {
  try {
    // Initialize the Supabase client using the secure environment variables.
    // This client has admin privileges to talk to our database.
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Get the latitude and longitude from the body of the request.
    const { latitude, longitude } = await req.json();

    // A simple validation to make sure we received the coordinates.
    if (!latitude || !longitude) {
      return NextResponse.json({ error: 'Latitude and longitude are required.' }, { status: 400 });
    }

    // This is the key part: we are calling a special database function.
    // 'rpc' stands for Remote Procedure Call. We are calling the function
    // named 'find_nearest_hospitals' that we will create in the next part.
    const { data, error } = await supabase.rpc('find_nearest_hospitals', {
      target_lat: latitude,
      target_lon: longitude
    });

    // If the database function returns an error, we'll send it back.
    if (error) {
      throw error;
    }

    // If successful, send the list of hospitals back to the frontend.
    return NextResponse.json(data);

  } catch (error: any) {   
    // If any part of the process fails, log the error on the server
    // and send a generic failure message to the frontend.
    console.error("Error fetching nearest hospitals:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}