// Quick test to verify Supabase connection
// Run with: node test-supabase.mjs

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testConnection() {
  console.log('🔌 Testing Supabase connection...\n')
  
  try {
    // Test 1: Fetch artworks
    console.log('1️⃣ Fetching artworks...')
    const { data: artworks, error: artworksError } = await supabase
      .from('artworks')
      .select('*')
      .limit(5)
    
    if (artworksError) {
      console.error('   ❌ Error:', artworksError.message)
    } else {
      console.log(`   ✅ Success! Found ${artworks.length} artwork(s)`)
      artworks.forEach(art => {
        console.log(`      - ${art.title} by ${art.artist} (R${art.price})`)
      })
    }
    
    // Test 2: Check tables exist
    console.log('\n2️⃣ Checking database tables...')
    const tables = ['artworks', 'orders', 'customers', 'inquiries']
    
    for (const table of tables) {
      const { error } = await supabase
        .from(table)
        .select('count')
        .limit(1)
      
      if (error) {
        console.log(`   ❌ ${table}: Not found or no access`)
      } else {
        console.log(`   ✅ ${table}: OK`)
      }
    }
    
    console.log('\n✨ Supabase connection test complete!')
    
  } catch (error) {
    console.error('❌ Connection failed:', error)
  }
}

testConnection()
