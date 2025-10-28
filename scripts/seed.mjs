// File: scripts/seed.mjs
// this script is deprecated use the seed-csv.mjs script instead

import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

// --- CONFIGURATION ---
const hospitals = [
  {
    name: 'Aga Khan University Hospital',
    address: '3rd Parklands Ave, Nairobi, Kenya',
    phone: '+254 20 3662000',
    website: 'https://hospitals.aku.edu/nairobi/pages/default.aspx',
    // NOTE: Supabase PostGIS format is 'POINT(Longitude Latitude)'
    location: 'POINT(36.815 -1.263)',
  },
  {
    name: 'The Nairobi Hospital',
    address: 'Argwings Kodhek Rd, Nairobi, Kenya',
    phone: '+254 703 082000',
    website: 'https://thenairobihosp.org/',
    location: 'POINT(36.801 -1.291)',
  },
  {
    name: 'Kenyatta National Hospital',
    address: 'Hospital Rd, Nairobi, Kenya',
    phone: '+254 20 2726300',
    website: 'https://knh.or.ke/',
    location: 'POINT(36.806 -1.300)',
  },
  {
    name: 'M.P. Shah Hospital',
    address: 'Shivachi Rd, Nairobi, Kenya',
    phone: '+254 733 606165',
    website: 'https://mpshahhospital.org/',
    location: 'POINT(36.808 -1.267)',
  },
];

// --- SCRIPT LOGIC ---
async function seedDatabase() {
  // Check if the environment variables are set
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('🔴 Error: Supabase URL or Service Role Key is not set in your .env.local file.');
    return;
  }

  // Create a Supabase client with admin privileges
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
  console.log('✅ Supabase client created.');

  try {
    // Clear existing data from the hospitals table
    const { error: deleteError } = await supabaseAdmin.from('hospitals').delete().neq('id', 0);
    if (deleteError) throw deleteError;
    console.log('🧹 Emptied the hospitals table.');

    // Insert the new hospital data
    const { data, error: insertError } = await supabaseAdmin.from('hospitals').insert(hospitals);
    if (insertError) throw insertError;

    console.log(`🌱 Seeded ${hospitals.length} hospitals successfully!`);
    console.log('✅ Database seeding completed!');

  } catch (err) {
    console.error('🔴 An error occurred during seeding:', err);
  }
}

// Run the function
seedDatabase();