/**
 * Validates Supabase environment variables
 * Throws descriptive errors if variables are missing, invalid, or contain placeholder values
 * @param url - The Supabase URL from environment variables
 * @param anonKey - The Supabase anonymous key from environment variables
 * @throws {Error} If validation fails
 */
export function validateSupabaseConfig(url: string | undefined, anonKey: string | undefined): asserts url is string {
  // Check for missing or empty environment variables
  if (!url || !anonKey || url.trim() === '' || anonKey.trim() === '') {
    throw new Error(
      '❌ Missing Supabase Environment Variables\n\n' +
      'The application cannot start without valid Supabase credentials.\n\n' +
      '📋 Quick Setup Steps:\n' +
      '1. Create .env.local file:\n' +
      '   → Run: cp .env.example .env.local\n\n' +
      '2. Get your Supabase credentials:\n' +
      '   → Visit: https://supabase.com/dashboard\n' +
      '   → Select your project (or create one)\n' +
      '   → Go to Settings > API\n' +
      '   → Copy "Project URL" and "anon public" key\n\n' +
      '3. Update .env.local with your credentials:\n' +
      '   NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co\n' +
      '   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...\n\n' +
      '4. Restart the development server:\n' +
      '   → Stop the server (Ctrl+C)\n' +
      '   → Run: npm run dev\n\n' +
      '📖 For detailed instructions, see: SETUP-GUIDE.md\n\n' +
      `Current status: NEXT_PUBLIC_SUPABASE_URL=${url ? 'set but empty/invalid' : 'NOT SET'}, ` +
      `NEXT_PUBLIC_SUPABASE_ANON_KEY=${anonKey ? 'set but empty/invalid' : 'NOT SET'}`
    )
  }

  // Check if URL is valid and not a placeholder
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    throw new Error(
      '❌ Invalid Supabase URL Format\n\n' +
      'The NEXT_PUBLIC_SUPABASE_URL must be a valid HTTP or HTTPS URL.\n\n' +
      `Current value: "${url}"\n\n` +
      '📋 Fix this issue:\n' +
      '1. Visit: https://supabase.com/dashboard\n' +
      '2. Select your project > Settings > API\n' +
      '3. Copy your "Project URL" (format: https://xxxxx.supabase.co)\n' +
      '4. Update NEXT_PUBLIC_SUPABASE_URL in .env.local\n' +
      '5. Restart the server: npm run dev\n\n' +
      '📖 See SETUP-GUIDE.md for detailed instructions'
    )
  }

  // Check if it's still using placeholder values
  if (url.includes('your_supabase') || anonKey.includes('your_supabase')) {
    throw new Error(
      '❌ Placeholder Values Detected\n\n' +
      'You are using example placeholder values instead of real Supabase credentials.\n\n' +
      '📋 Replace placeholders with real values:\n' +
      '1. Visit: https://supabase.com/dashboard\n' +
      '2. Select your project > Settings > API\n' +
      '3. Copy your "Project URL" and "anon public" key\n' +
      '4. Update these in your .env.local file:\n' +
      '   NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co\n' +
      '   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...\n' +
      '5. Restart the server: npm run dev\n\n' +
      '📖 See SETUP-GUIDE.md for detailed instructions'
    )
  }
}
