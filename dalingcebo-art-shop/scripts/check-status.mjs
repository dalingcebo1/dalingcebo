
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load env 
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkImage(url) {
  console.log(`Checking image: ${url}`);
  try {
    const res = await fetch(url, { method: 'HEAD' });
    console.log(`Status: ${res.status} ${res.statusText}`);
    console.log(`Headers:`, res.headers.get('content-type'));
    if (res.status !== 200) {
        console.error("Image not accessible. Likely 403/Forbidden (Permissions) or 404.");
    }
  } catch (e) {
    console.error('Fetch failed:', e.message);
  }
}

async function run() {
  console.log('--- Checking Database Schema ---');
  // Check if artworks exists
  const { data: artworks, error: artError } = await supabase.from('artworks').select('id, image').limit(1);
  if (artError) {
    console.error('Error accessing artworks:', artError);
  } else {
    console.log(`Artworks table accessible. Rows: ${artworks?.length || 0}`);
    if (artworks && artworks.length > 0) {
        // Check the first image url
        const testUrl = artworks[0].image;
        console.log(`Sample image URL from DB: ${testUrl}`);
        
        // Normalize logic duplicate
        let finalUrl = testUrl;
        if (testUrl && testUrl.includes('drive.google.com') && testUrl.includes('/file/d/')) {
            const id = testUrl.split('/file/d/')[1].split('/')[0];
            finalUrl = `https://drive.google.com/uc?export=view&id=${id}`;
            console.log(`Normalized URL would be: ${finalUrl}`);
        }
        
        await checkImage(finalUrl);
    }
  }

  // Check if artwork_variants exists
  const { data: variants, error: varError } = await supabase.from('artwork_variants').select('*').limit(1);
  if (varError) {
    console.error('Error accessing artwork_variants:', varError.message);
    if (varError.code === '42P01') {
        console.error("CRITICAL: Table 'artwork_variants' DOES NOT EXIST.");
    }
  } else {
    console.log('artwork_variants table accessible.');
  }
}

run();
