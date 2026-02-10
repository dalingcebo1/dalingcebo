import { createBrowserClient } from '@supabase/ssr'
import { Database } from '@/lib/db/schema'
import { validateSupabaseConfig } from './validation'

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // Validate environment variables with helpful error messages
  // After validation, we can safely assert these are strings
  validateSupabaseConfig(supabaseUrl, supabaseAnonKey)

  return createBrowserClient<Database>(
    supabaseUrl!,
    supabaseAnonKey!
  )
}
