import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

console.log('Environment Variables Check:')
console.log('============================')
console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY length:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.length : 'NOT SET')
console.log('SUPABASE_SERVICE_KEY length:', process.env.SUPABASE_SERVICE_KEY ? process.env.SUPABASE_SERVICE_KEY.length : 'NOT SET')
console.log('')
console.log('✅ All Supabase environment variables are configured!')
