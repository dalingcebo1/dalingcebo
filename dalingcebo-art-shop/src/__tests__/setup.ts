import { vi } from 'vitest'

// Mock Next.js server components
vi.mock('next/server', async () => {
  const actual = await vi.importActual('next/server')
  return {
    ...actual,
    NextResponse: {
      json: (data: any, init?: ResponseInit) => {
        return {
          status: init?.status || 200,
          json: async () => data,
          data,
        }
      },
    },
  }
})

// Mock environment variables
process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://localhost:54321'
process.env.SUPABASE_SERVICE_KEY = 'test-service-key'
