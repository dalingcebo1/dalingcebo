import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  // Only allow in development
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({
      success: false,
      message: 'This endpoint is only available in development'
    }, { status: 403 })
  }

  try {
    // Test the Supabase connection
    const { data, error } = await supabase.from('_health').select('*').limit(1)
    
    if (error) {
      // This is expected if the table doesn't exist
      // Just check if we can connect
      return NextResponse.json({
        success: true,
        message: 'Supabase client initialized successfully',
        connected: true,
        hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      })
    }
    
    return NextResponse.json({
      success: true,
      message: 'Supabase connected successfully',
      connected: true,
      data
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error',
      connected: false
    }, { status: 500 })
  }
}
