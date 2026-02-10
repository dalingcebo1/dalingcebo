// Script to upload images to Supabase Storage and update artwork records
// Run with: node scripts/upload-images.mjs

import { createClient } from '@supabase/supabase-js'
import { readFileSync, readdirSync, statSync } from 'fs'
import { join, extname, basename } from 'path'
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

// Image directory - place your images here
const IMAGES_DIR = join(process.cwd(), 'public', 'images', 'artworks')

async function uploadImages() {
  console.log('📸 Uploading artwork images to Supabase Storage...\n')

  try {
    // Get all artworks from database
    const { data: artworks, error: fetchError } = await supabase
      .from('artworks')
      .select('id, title')
      .order('id')

    if (fetchError) {
      console.error('❌ Error fetching artworks:', fetchError.message)
      return
    }

    console.log(`Found ${artworks.length} artworks in database\n`)

    // Check if images directory exists
    try {
      const files = readdirSync(IMAGES_DIR)
      const imageFiles = files.filter(f => {
        const ext = extname(f).toLowerCase()
        return ['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(ext)
      })

      console.log(`Found ${imageFiles.length} image files in ${IMAGES_DIR}\n`)

      if (imageFiles.length === 0) {
        console.log('⚠️  No images found to upload.')
        console.log('\nPlease place your artwork images in:')
        console.log(`  ${IMAGES_DIR}`)
        console.log('\nName them like: artwork-1.jpg, artwork-2.jpg, etc.')
        console.log('or: strong-woman.jpg, barren.jpg, etc.')
        return
      }

      let uploaded = 0
      let updated = 0

      for (const file of imageFiles) {
        const filePath = join(IMAGES_DIR, file)
        const fileBuffer = readFileSync(filePath)
        const fileName = basename(file)
        
        // Try to match file to artwork by ID or title
        const idMatch = fileName.match(/artwork[_-]?(\d+)/i)
        let artwork = null
        
        if (idMatch) {
          const artworkId = parseInt(idMatch[1])
          artwork = artworks.find(a => a.id === artworkId)
        } else {
          // Try to match by title (fuzzy)
          const nameWithoutExt = fileName.replace(extname(fileName), '')
          const cleanName = nameWithoutExt.toLowerCase().replace(/[-_]/g, ' ')
          artwork = artworks.find(a => 
            a.title.toLowerCase().includes(cleanName) ||
            cleanName.includes(a.title.toLowerCase().split(' ')[0])
          )
        }

        if (!artwork) {
          console.log(`⚠️  Skipping ${fileName} - couldn't match to artwork`)
          continue
        }

        // Upload image to Supabase Storage
        const storagePath = `${artwork.id}-${fileName}`
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('artworks')
          .upload(storagePath, fileBuffer, {
            contentType: `image/${extname(fileName).slice(1)}`,
            upsert: true
          })

        if (uploadError) {
          console.log(`❌ Error uploading ${fileName}:`, uploadError.message)
          continue
        }

        uploaded++

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('artworks')
          .getPublicUrl(storagePath)

        // Update artwork record with image URL
        const { error: updateError } = await supabase
          .from('artworks')
          .update({
            image: publicUrl,
            images: [publicUrl]
          })
          .eq('id', artwork.id)

        if (updateError) {
          console.log(`❌ Error updating artwork ${artwork.id}:`, updateError.message)
          continue
        }

        updated++
        console.log(`✅ Uploaded and linked: ${fileName} → ${artwork.title} (ID: ${artwork.id})`)
      }

      console.log(`\n📊 Upload Summary:`)
      console.log(`  • Files uploaded: ${uploaded}`)
      console.log(`  • Artworks updated: ${updated}`)
      console.log(`  • Skipped: ${imageFiles.length - uploaded}`)

    } catch (dirError) {
      console.log('⚠️  Images directory not found.')
      console.log('\nTo upload images:')
      console.log(`1. Create directory: mkdir -p ${IMAGES_DIR}`)
      console.log('2. Place your artwork images there')
      console.log('3. Name them: artwork-1.jpg, artwork-2.jpg, etc.')
      console.log('4. Run this script again')
      console.log('\nOr upload manually via Supabase Dashboard:')
      console.log(`${supabaseUrl.replace('.supabase.co', '.supabase.co/project/')}/storage/buckets/artworks`)
    }

  } catch (error) {
    console.error('❌ Upload failed:', error)
  }
}

uploadImages()
