#!/bin/bash
# Quick verification script to check database setup

echo "🔍 Verifying Dalingcebo Art Shop Database Setup..."
echo ""

cd /workspaces/dalingcebo/dalingcebo-art-shop

# Check if .env.local exists
if [ ! -f .env.local ]; then
  echo "❌ .env.local not found!"
  exit 1
fi

echo "✅ Environment file exists"

# Check database connection and count artworks
node << 'EOF'
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

async function verify() {
  try {
    // Test connection
    const { data, error } = await supabase
      .from('artworks')
      .select('id, title, price, in_stock, image')
      .order('id')

    if (error) throw error

    console.log('✅ Database connection working')
    console.log(`✅ Total artworks: ${data.length}`)
    
    const available = data.filter(a => a.in_stock).length
    const sold = data.filter(a => !a.in_stock).length
    const withImages = data.filter(a => !a.image.includes('placeholder')).length
    
    console.log(`✅ Available for purchase: ${available}`)
    console.log(`✅ Sold: ${sold}`)
    console.log(`✅ With real images: ${withImages}`)
    console.log(`⚠️  Need images: ${data.length - withImages}`)
    
    // Show pricing range
    const prices = data.filter(a => a.in_stock && a.price > 0).map(a => a.price)
    const minPrice = Math.min(...prices)
    const maxPrice = Math.max(...prices)
    
    console.log(`\n💰 Price range: R${minPrice.toLocaleString()} - R${maxPrice.toLocaleString()}`)
    
    // Sample artworks
    console.log('\n📸 Artworks with images:')
    data.filter(a => !a.image.includes('placeholder')).forEach(a => {
      console.log(`   ${a.id}: ${a.title}`)
    })
    
    console.log('\n📝 Recent additions (last 5):')
    data.slice(-5).forEach(a => {
      const status = a.in_stock ? `R${a.price.toLocaleString()}` : 'SOLD'
      console.log(`   ${a.id}: ${a.title} - ${status}`)
    })
    
    console.log('\n✨ Setup verification complete!')
    console.log('\n💡 Next step: Upload remaining 22 artwork images')
    console.log('   See IMAGE-UPLOAD-GUIDE.md for instructions')
    
  } catch (error) {
    console.error('❌ Verification failed:', error.message)
    process.exit(1)
  }
}

verify()
EOF
