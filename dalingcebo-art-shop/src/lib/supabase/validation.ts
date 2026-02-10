/**
 * Validates Supabase environment variables
 * Throws descriptive errors if variables are missing, invalid, or contain placeholder values
 */
export function validateSupabaseConfig(url: string | undefined, anonKey: string | undefined): void {
  // Check for missing or empty environment variables
  if (!url || !anonKey || url?.trim() === '' || anonKey?.trim() === '') {
    throw new Error(
      'Missing or invalid Supabase environment variables.\n' +
      'Please ensure you have created a .env.local file with valid values:\n' +
      '1. Copy .env.example to .env.local: cp .env.example .env.local\n' +
      '2. Add your Supabase URL and anon key from https://supabase.com/dashboard/project/_/settings/api\n' +
      '3. Restart the development server: npm run dev\n' +
      `Currently: NEXT_PUBLIC_SUPABASE_URL=${url ? 'is set but may be invalid' : 'is not set'}`
    )
  }

  // Check if URL is valid and not a placeholder
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    throw new Error(
      'Invalid Supabase URL format. The NEXT_PUBLIC_SUPABASE_URL must start with http:// or https://\n' +
      `Current value: "${url}"\n\n` +
      'Please:\n' +
      '1. Go to https://supabase.com/dashboard/project/_/settings/api\n' +
      '2. Copy your Project URL (should look like: https://xxxxxxxxxxxxx.supabase.co)\n' +
      '3. Update NEXT_PUBLIC_SUPABASE_URL in your .env.local file\n' +
      '4. Restart the development server: npm run dev'
    )
  }

  // Check if it's still using placeholder values
  if (url.includes('your_supabase') || anonKey.includes('your_supabase')) {
    throw new Error(
      'Placeholder values detected in environment variables.\n' +
      'You are using the example placeholders instead of real Supabase credentials.\n\n' +
      'Please:\n' +
      '1. Go to https://supabase.com/dashboard/project/_/settings/api\n' +
      '2. Copy your Project URL and anon key\n' +
      '3. Replace the placeholder values in your .env.local file\n' +
      '4. Restart the development server: npm run dev'
    )
  }
}
