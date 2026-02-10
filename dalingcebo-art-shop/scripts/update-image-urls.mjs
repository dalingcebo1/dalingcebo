// Script to update artwork image URLs from Google Drive or other sources
// Run with: node scripts/update-image-urls.mjs

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

// Map artwork ID to Google Drive file ID or direct URL
// To get file ID from Google Drive link: https://drive.google.com/file/d/FILE_ID_HERE/view
const imageUrls = {
  7: 'https://lh3.googleusercontent.com/d/1aJa_bf6oKh_MIo70s0YuLm6BWrbD6U2l', // Strong Woman
  8: 'https://lh3.googleusercontent.com/d/1CcykEi9aU0lCA83r3NvDFe1Z4Ckg7NR9', // Barren
  9: 'https://lh3.googleusercontent.com/d/1NsgsY3C-6exYItdNDAu8JAaGWjjCBOfO', // 88 Paulshof
  10: 'https://lh3.googleusercontent.com/d/1kPuN7XIjhm_D0BAUgzBACuVH0rSoEhE5', // breaking bad
  11: 'https://lh3.googleusercontent.com/d/1ZpLRHqJCh1fPpgTaWB4Z9Zymcw6QvgVv', // All Music is evil
  // Add more mappings here as you get the image URLs
  // Format: artworkId: 'https://your-image-url.com/image.jpg',
}

async function updateImageUrls() {
  console.log('🖼️  Updating artwork image URLs...\n')

  try {
    let updated = 0
    const entries = Object.entries(imageUrls)

    for (const [artworkId, imageUrl] of entries) {
      const id = parseInt(artworkId)

      // Get artwork title for confirmation
      const { data: artwork } = await supabase
        .from('artworks')
        .select('title')
        .eq('id', id)
        .single()

      if (!artwork) {
        console.log(`⚠️  Artwork ID ${id} not found`)
        continue
      }

      // Update image URL
      const { error } = await supabase
        .from('artworks')
        .update({
          image: imageUrl,
          images: [imageUrl]
        })
        .eq('id', id)

      if (error) {
        console.log(`❌ Error updating ${artwork.title}:`, error.message)
        continue
      }

      updated++
      console.log(`✅ Updated: ${artwork.title} (ID: ${id})`)
    }

    console.log(`\n📊 Update Summary:`)
    console.log(`  • Artworks updated: ${updated}/${entries.length}`)

    if (updated < entries.length) {
      console.log(`  • Failed: ${entries.length - updated}`)
    }

    // Show remaining artworks without images
    const { data: remaining } = await supabase
      .from('artworks')
      .select('id, title, image')
      .like('image', '%placeholder%')
      .order('id')

    if (remaining && remaining.length > 0) {
      console.log(`\n⚠️  ${remaining.length} artworks still have placeholder images:`)
      remaining.forEach(a => {
        console.log(`  • ID ${a.id}: ${a.title}`)
      })
      console.log('\nAdd their image URLs to the imageUrls object in this script and run again.')
    } else {
      console.log('\n🎉 All artworks have real images!')
    }

  } catch (error) {
    console.error('❌ Update failed:', error)
  }
}

updateImageUrls()
