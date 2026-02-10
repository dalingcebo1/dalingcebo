// Script to set up Supabase Storage bucket for artwork images
// Run with: node scripts/setup-storage.mjs

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config({ path: path.join(__dirname, '..', '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function setupStorage() {
  console.log('🪣 Setting up Supabase Storage...\n')

  try {
    // Check if bucket exists
    const { data: buckets } = await supabase.storage.listBuckets()
    const bucketExists = buckets?.some(b => b.name === 'artworks')

    if (bucketExists) {
      console.log('✅ Bucket "artworks" already exists')
    } else {
      // Create public bucket for artwork images
      const { data, error } = await supabase.storage.createBucket('artworks', {
        public: true,
        fileSizeLimit: 10485760, // 10MB
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
      })

      if (error) {
        console.error('❌ Error creating bucket:', error.message)
        return
      }

      console.log('✅ Created public bucket "artworks"')
    }

    // Check for videos bucket
    const videosBucketExists = buckets?.some(b => b.name === 'videos')

    if (videosBucketExists) {
      console.log('✅ Bucket "videos" already exists')
    } else {
      // Create public bucket for videos (without file size limit to avoid error)
      const { data, error } = await supabase.storage.createBucket('videos', {
        public: true
      })

      if (error) {
        console.error('❌ Error creating videos bucket:', error.message)
        console.log('  You can create it manually in the Supabase Dashboard')
      } else {
        console.log('✅ Created public bucket "videos"')
      }
    }

    console.log('\n📝 Storage setup complete!')
    console.log('\nYou can now:')
    console.log('1. Upload images using the Supabase Dashboard')
    console.log('2. Use the upload-images.mjs script (when images are ready)')
    console.log('\nBucket URLs:')
    console.log(`  Images: ${supabaseUrl}/storage/v1/object/public/artworks/`)
    console.log(`  Videos: ${supabaseUrl}/storage/v1/object/public/videos/`)

  } catch (error) {
    console.error('❌ Setup failed:', error)
  }
}

setupStorage()
