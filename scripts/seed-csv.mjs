// File: scripts/seed-csv.mjs
// run-> node scripts/seed-csv.mjs

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';
import 'dotenv/config';

// --- CONFIGURATION ---
// 1. Point this to the exact name of your CSV file in this 'scripts' folder.
const CSV_FILE_NAME = 'Hospital_Data.csv'; 

// --- SCRIPT LOGIC ---
async function seedFromCsv() {
  console.log('🌱 Starting CSV seeding process...');

  // --- 1. Check for Supabase credentials ---
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('🔴 Error: Supabase URL or Service Role Key is not set. Check your .env.local file.');
    return;
  }
  
  // --- 2. Read and parse the CSV file ---
  const csvFilePath = path.join(process.cwd(), 'scripts', CSV_FILE_NAME);
  if (!fs.existsSync(csvFilePath)) {
    console.error(`🔴 Error: CSV file not found at ${csvFilePath}`);
    return;
  }
  
  const csvFile = fs.readFileSync(csvFilePath, 'utf8');
  const parsedCsv = Papa.parse(csvFile, {
    header: true, // Use the first row as object keys
    skipEmptyLines: true,
  });

  const sourceData = parsedCsv.data;
  console.log(`📄 Found ${sourceData.length} rows in the CSV file.`);

  // --- 3. Transform the data for our database schema ---
  const transformedData = sourceData.map(row => {
    // Basic validation for required fields
    if (!row.hospital_name || !row.longitude || !row.latitude) {
      console.warn('⚠️ Skipping row due to missing required data:', row);
      return null;
    }
    
    return {
      name: row.hospital_name,
      address: row.address || null, // Use the address or default to null
      phone: row.contact || null, // Use the contact or default to null
      // CRITICAL: Combine latitude and longitude into the PostGIS POINT format.
      // The format is 'POINT(Longitude Latitude)'
      location: `POINT(${row.longitude} ${row.latitude})`,
      // We don't have a website, so we don't include it. Supabase will use the default (null).
    };
  }).filter(Boolean); // Filter out any null rows that were skipped

  console.log(`✅ Transformed ${transformedData.length} valid rows for insertion.`);

  if (transformedData.length === 0) {         
    console.log('No valid data to insert. Exiting.');  
    return;
  }

  // --- 4. Connect to Supabase and insert the data ---
  try {
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
    console.log('✅ Connected to Supabase.');

    // Clear existing data from the hospitals table
    console.log('🧹 Clearing existing hospital data...');
    const { error: deleteError } = await supabaseAdmin.from('hospitals').delete().neq('id', 0);
    if (deleteError) throw deleteError;
    console.log('✅ Hospitals table cleared.');

    // Insert the new, transformed data
    console.log(`🚀 Inserting ${transformedData.length} new hospital records...`);
    const { error: insertError } = await supabaseAdmin.from('hospitals').insert(transformedData);
    if (insertError) throw insertError;
    
    console.log('🎉 Seeding complete! The hospitals table has been updated from your CSV file.');

  } catch (err) {
    console.error('🔴 An error occurred during the Supabase operation:', err);
  }
}

// Run the main function
seedFromCsv();