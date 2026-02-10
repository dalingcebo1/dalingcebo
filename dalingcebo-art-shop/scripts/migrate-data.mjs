// Migration script to import existing JSON data into Supabase
// Run with: node --loader ts-node/esm migrate-data.mjs

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import path from 'path'

// Load environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env.local')
  console.error('Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function migrateArtworks() {
  console.log('🎨 Migrating artworks from JSON to Supabase...')
  
  try {
    // Read artworks from JSON file
    const artworksPath = path.join(process.cwd(), 'data', 'artworks.json')
    const artworksJson = readFileSync(artworksPath, 'utf8')
    const artworks = JSON.parse(artworksJson)

    console.log(`Found ${artworks.length} artworks to migrate`)

    // Insert artworks into Supabase
    const { data, error } = await supabase
      .from('artworks')
      .insert(artworks.map(artwork => ({
        // Keep the original ID if it exists, otherwise let Postgres generate one
        ...(artwork.id ? { id: artwork.id } : {}),
        title: artwork.title,
        artist: artwork.artist,
        price: artwork.price,
        category: artwork.category,
        scale: artwork.scale,
        size: artwork.size,
        year: artwork.year,
        medium: artwork.medium,
        description: artwork.description,
        details: artwork.details || null,
        in_stock: artwork.inStock ?? true,
        inventory: artwork.inventory ?? 1,
        edition: artwork.edition || 'Original',
        image: artwork.image,
        images: artwork.images || [],
        tags: artwork.tags || [],
      })))
      .select()

    if (error) {
      console.error('❌ Error migrating artworks:', error.message)
      return
    }

    console.log(`✅ Successfully migrated ${data.length} artworks!`)
    
    // Display migrated artworks
    data.forEach(artwork => {
      console.log(`  - ${artwork.title} by ${artwork.artist} (ID: ${artwork.id})`)
    })

  } catch (error) {
    console.error('❌ Migration failed:', error)
  }
}

async function migrateInquiries() {
  console.log('\n📧 Migrating inquiries from JSON to Supabase...')
  
  try {
    const inquiriesPath = path.join(process.cwd(), 'data', 'inquiries.json')
    const inquiriesJson = readFileSync(inquiriesPath, 'utf8')
    const inquiries = JSON.parse(inquiriesJson)

    if (inquiries.length === 0) {
      console.log('No inquiries to migrate')
      return
    }

    const { data, error } = await supabase
      .from('inquiries')
      .insert(inquiries.map(inquiry => ({
        id: inquiry.id,
        kind: inquiry.kind,
        name: inquiry.name,
        email: inquiry.email,
        phone: inquiry.phone || null,
        message: inquiry.message,
        artwork_id: inquiry.artworkId || null,
        artwork_title: inquiry.artworkTitle || null,
        status: inquiry.status || 'new',
        created_at: inquiry.createdAt,
      })))
      .select()

    if (error) {
      console.error('❌ Error migrating inquiries:', error.message)
      return
    }

    console.log(`✅ Successfully migrated ${data.length} inquiries!`)

  } catch (error) {
    console.error('Note: No inquiries file or migration skipped')
  }
}

async function migrateOrders() {
  console.log('\n📦 Migrating orders from JSON to Supabase...')
  
  try {
    const ordersPath = path.join(process.cwd(), 'data', 'orders.json')
    const ordersJson = readFileSync(ordersPath, 'utf8')
    const orders = JSON.parse(ordersJson)

    if (orders.length === 0) {
      console.log('No orders to migrate')
      return
    }

    // Note: This is simplified - you may need to adjust based on your actual order structure
    for (const order of orders) {
      // Insert order
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          id: order.id,
          customer_email: order.email,
          customer_name: order.name,
          customer_phone: order.phone || null,
          shipping_name: order.name,
          shipping_address: order.address,
          shipping_city: 'N/A', // You'll need to update these manually
          shipping_province: 'N/A',
          shipping_postal_code: 'N/A',
          shipping_country: 'South Africa',
          subtotal: order.total || 0,
          total: order.total || 0,
          payment_type: 'invoice', // Old orders were invoice-based
          payment_method: 'none',
          status: order.status || 'pending_payment',
          notes: order.notes || null,
          created_at: order.createdAt,
        })
        .select()
        .single()

      if (orderError) {
        console.error(`❌ Error migrating order ${order.id}:`, orderError.message)
        continue
      }

      // Insert order items
      if (order.items && Array.isArray(order.items)) {
        const { error: itemsError } = await supabase
          .from('order_items')
          .insert(order.items.map(item => ({
            order_id: orderData.id,
            artwork_id: item.id || null,
            title: item.title,
            artist: item.artist || 'Unknown',
            price: item.price,
            quantity: item.quantity || 1,
            image: item.image || null,
          })))

        if (itemsError) {
          console.error(`❌ Error migrating order items for ${order.id}:`, itemsError.message)
        }
      }

      console.log(`  - Migrated order ${order.id}`)
    }

    console.log(`✅ Successfully migrated ${orders.length} orders!`)

  } catch (error) {
    console.error('Note: No orders file or migration skipped')
  }
}

// Run migrations
async function main() {
  console.log('🚀 Starting data migration to Supabase...\n')
  console.log('⚠️  WARNING: This will insert data into your Supabase database.')
  console.log('   Make sure you have run the SQL migrations first!\n')
  
  await migrateArtworks()
  await migrateInquiries()
  await migrateOrders()
  
  console.log('\n✅ Migration complete!')
  console.log('\n📝 Next steps:')
  console.log('   1. Go to your Supabase dashboard')
  console.log('   2. Check the "Table Editor" to verify your data')
  console.log('   3. Update any missing fields (addresses, etc.)')
}

main().catch(console.error)
