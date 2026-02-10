/**
 * Simple in-memory rate limiter for API routes
 * For production, consider using Redis or a dedicated rate limiting service
 */

interface RateLimitStore {
  [key: string]: {
    count: number
    resetTime: number
  }
}

const store: RateLimitStore = {}

// Cleanup old entries every 5 minutes
setInterval(() => {
  const now = Date.now()
  Object.keys(store).forEach(key => {
    if (store[key].resetTime < now) {
      delete store[key]
    }
  })
}, 5 * 60 * 1000)

export interface RateLimitOptions {
  maxRequests?: number // Maximum number of requests
  windowMs?: number // Time window in milliseconds
}

export function rateLimit(
  identifier: string,
  options: RateLimitOptions = {}
): { success: boolean; limit: number; remaining: number; reset: number } {
  const { maxRequests = 100, windowMs = 60000 } = options
  
  const now = Date.now()
  const key = identifier
  
  // Get or create entry
  if (!store[key] || store[key].resetTime < now) {
    store[key] = {
      count: 1,
      resetTime: now + windowMs
    }
    
    return {
      success: true,
      limit: maxRequests,
      remaining: maxRequests - 1,
      reset: store[key].resetTime
    }
  }
  
  // Increment count
  store[key].count++
  
  const remaining = Math.max(0, maxRequests - store[key].count)
  const success = store[key].count <= maxRequests
  
  return {
    success,
    limit: maxRequests,
    remaining,
    reset: store[key].resetTime
  }
}

/**
 * Get client IP address from request headers
 */
export function getClientIp(request: Request): string {
  // Check common headers for IP address
  const headers = request.headers
  
  const forwardedFor = headers.get('x-forwarded-for')
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim()
  }
  
  const realIp = headers.get('x-real-ip')
  if (realIp) {
    return realIp
  }
  
  const cfConnectingIp = headers.get('cf-connecting-ip')
  if (cfConnectingIp) {
    return cfConnectingIp
  }
  
  // Fallback
  return 'unknown'
}
