import { createBrowserClient } from '@supabase/ssr'
import { Database } from '@/lib/db/schema'

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.trim() === '' || supabaseAnonKey.trim() === '') {
    throw new Error(
      'Missing or invalid Supabase environment variables.\n' +
      'Please ensure you have created a .env.local file with valid values:\n' +
      '1. Copy .env.example to .env.local: cp .env.example .env.local\n' +
      '2. Add your Supabase URL and anon key from https://supabase.com/dashboard/project/_/settings/api\n' +
      '3. Restart the development server: npm run dev\n' +
      `Currently: NEXT_PUBLIC_SUPABASE_URL=${supabaseUrl ? 'is set but may be invalid' : 'is not set'}`
    )
  }

  return createBrowserClient<Database>(
    supabaseUrl,
    supabaseAnonKey
  )
}
