/**
 * Error Monitoring Setup
 * 
 * This file provides configuration for error monitoring services like Sentry
 * 
 * To enable Sentry error tracking:
 * 1. Install Sentry: npm install @sentry/nextjs
 * 2. Add NEXT_PUBLIC_SENTRY_DSN to your .env file
 * 3. Uncomment the code below
 * 4. Run: npx @sentry/wizard@latest -i nextjs
 */

// Uncomment when ready to use Sentry:
/*
import * as Sentry from '@sentry/nextjs'

if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    
    // Set tracesSampleRate to 1.0 to capture 100% of transactions for performance monitoring.
    // We recommend adjusting this value in production
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    
    // Capture Replay for 10% of all sessions,
    // plus for 100% of sessions with an error
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,

    environment: process.env.NODE_ENV,
    
    // Filter out sensitive data
    beforeSend(event) {
      // Remove sensitive headers
      if (event.request?.headers) {
        delete event.request.headers['authorization']
        delete event.request.headers['cookie']
      }
      return event
    },

    // Ignore certain errors
    ignoreErrors: [
      // Browser extensions
      'top.GLOBALS',
      // Random plugins/extensions
      'originalCreateNotification',
      'canvas.contentDocument',
      'MyApp_RemoveAllHighlights',
      // Network errors
      'NetworkError',
      'Network request failed',
    ],
  })
}

export default Sentry
*/

// Placeholder export for when Sentry is not configured
export const captureException = (error: Error) => {
  if (process.env.NODE_ENV === 'development') {
    console.error('Error captured:', error)
  }
}

export const captureMessage = (message: string) => {
  if (process.env.NODE_ENV === 'development') {
    console.log('Message captured:', message)
  }
}
