import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { Database } from '@/lib/db/schema'

export async function createClient() {
  const cookieStore = await cookies()

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

  return createServerClient<Database>(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}
