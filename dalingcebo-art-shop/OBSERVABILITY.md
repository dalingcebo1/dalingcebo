# Observability & Operational Readiness Guide

This document explains the observability features built into the Dalingcebo Art Shop to help you monitor, debug, and maintain the application in production.

## Overview

The application includes:
- **Structured Logging**: Consistent, searchable logs for critical operations
- **Health Endpoint**: Simple endpoint for uptime monitoring
- **Error Boundaries**: Graceful error handling for client components

## Structured Logging

### What is Logged

Structured logs are generated for all critical write operations:

1. **Artwork Endpoints** (`/api/artworks`)
   - POST: Creating new artworks
   - PUT: Updating existing artworks
   - DELETE: Deleting artworks

2. **Payment Webhooks**
   - Stripe webhook events (`/api/payments/stripe/webhook`)
   - Yoco webhook events (`/api/payments/yoco/webhook`)
   - Payment successes, failures, and refunds

### Log Format

All logs are output as JSON with the following structure:

```json
{
  "timestamp": "2024-02-13T07:15:30.123Z",
  "level": "info",
  "message": "Artwork created",
  "method": "POST",
  "route": "/api/artworks",
  "artworkId": 123,
  "status": 201,
  "duration": 145
}
```

### Log Levels

- **info**: Successful operations
- **warn**: Non-critical issues (e.g., payment failures, missing metadata)
- **error**: Critical failures requiring attention

### Security

The logging utility automatically sanitizes sensitive data:
- API keys
- Passwords
- Tokens
- Webhook secrets
- Authorization headers

**Never** log user credentials, payment card details, or other sensitive information.

## Viewing Logs

### In Vercel

1. Go to your project in the [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your deployment
3. Click on the "Logs" tab
4. Use the search/filter features to find specific events:
   - Search for `"level":"error"` to find errors
   - Search for `"route":"/api/artworks"` to see artwork operations
   - Search for `"orderId":"<order-id>"` to trace payment flows

### In GitHub Codespaces

When running locally or in Codespaces:

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Logs appear in the terminal as JSON:
   ```
   {"timestamp":"2024-02-13T07:15:30.123Z","level":"info",...}
   ```

3. To format logs for easier reading, pipe through `jq`:
   ```bash
   npm run dev | jq
   ```

4. To filter specific logs:
   ```bash
   # Show only errors
   npm run dev 2>&1 | grep '"level":"error"'
   
   # Show artwork operations
   npm run dev 2>&1 | grep '/api/artworks'
   ```

## Health Endpoint

### Purpose

The health endpoint (`/api/health`) provides a simple way to check if the application is running.

### Endpoint Details

- **URL**: `GET /api/health`
- **Response**: Always returns 200 OK (unless app is completely down)
- **Format**:
  ```json
  {
    "ok": true,
    "time": "2024-02-13T07:15:30.123Z",
    "version": "0.1.0"
  }
  ```

### Use Cases

1. **Uptime Monitoring**
   - Configure services like UptimeRobot, Pingdom, or BetterUptime to ping `/api/health`
   - Alert if endpoint returns non-200 status

2. **Load Balancer Health Checks**
   - Use in AWS ELB, Google Cloud Load Balancer, etc.
   - Ensures traffic only routes to healthy instances

3. **Deployment Verification**
   - Check endpoint after deployment to verify app is running
   - Include in CI/CD pipelines

### Example Usage

```bash
# Check health
curl https://your-domain.com/api/health

# Expected response:
# {"ok":true,"time":"2024-02-13T07:15:30.123Z","version":"0.1.0"}

# In a monitoring script
if curl -s https://your-domain.com/api/health | grep -q '"ok":true'; then
  echo "App is healthy"
else
  echo "App is down!"
  # Send alert
fi
```

## Error Boundaries

### What They Do

Error boundaries catch JavaScript errors in React components and display a fallback UI instead of crashing the entire page.

### Where They're Used

- Artwork detail page (`/artwork/[id]`)
- Wraps the main content to prevent white-screen errors

### User Experience

When an error occurs:
1. User sees a friendly error message
2. Options to "Try Again" or "Return Home"
3. In development, error details are shown for debugging

### Custom Error Boundaries

To add error boundaries to other components:

```tsx
import { ErrorBoundary } from '@/components/ErrorBoundary'

export default function MyComponent() {
  return (
    <ErrorBoundary>
      {/* Your component code */}
    </ErrorBoundary>
  )
}
```

## Debugging Common Issues

### Payment Webhook Not Received

1. Check logs for webhook events:
   ```
   # Vercel Dashboard
   Search: "route":"/api/payments"
   ```

2. Look for signature verification errors:
   ```
   Search: "Invalid signature"
   ```

3. Verify webhook secrets are correctly configured in environment variables

### Artwork Operations Failing

1. Check logs for the specific operation:
   ```
   # Search for the artwork ID
   Search: "artworkId":"123"
   ```

2. Look for authorization errors:
   ```
   Search: "error":"unauthorized"
   ```

3. Verify admin credentials and headers

### High Error Rates

1. Filter logs to errors only:
   ```
   Search: "level":"error"
   ```

2. Group by `route` to identify problematic endpoints

3. Check `duration` fields to identify slow operations (>1000ms)

## Best Practices

### For Developers

1. **Use the logger utility** for all server-side logging:
   ```typescript
   import { logger } from '@/lib/logger'
   
   logger.info('Operation succeeded', { userId: 123, action: 'update' })
   logger.error('Operation failed', { error: error.message })
   ```

2. **Include context** in log messages:
   - Operation being performed
   - Resource IDs (artwork, order, user)
   - Duration for performance tracking

3. **Never log secrets**:
   - The logger sanitizes common secret keys
   - But always review what you're logging

### For Operations

1. **Set up monitoring alerts**:
   - Health endpoint returns non-200
   - Error rate > 5%
   - Critical payment webhook failures

2. **Regular log review**:
   - Check error logs daily
   - Investigate unusual patterns
   - Monitor payment processing rates

3. **Keep logs for compliance**:
   - Payment logs may be required for audits
   - Check your data retention policies

## Troubleshooting

### Logs Not Appearing

1. Ensure you're looking at the right deployment/environment
2. Check if filtering is too restrictive
3. Verify the logger is imported and called correctly

### Health Endpoint Returns 404

1. Verify the route file exists: `src/app/api/health/route.ts`
2. Check Next.js build output for route registration
3. Clear `.next` cache and rebuild: `rm -rf .next && npm run build`

### Error Boundary Not Catching Errors

1. Error boundaries only catch errors in child components
2. They don't catch errors in:
   - Event handlers (use try/catch)
   - Async code (use try/catch)
   - Server-side rendering
3. Check browser console for uncaught errors

## Additional Resources

- [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- [Error Boundaries in React](https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary)
- [Vercel Logs Documentation](https://vercel.com/docs/observability/logs-overview)
- [Structured Logging Best Practices](https://www.loggly.com/ultimate-guide/structured-logging/)
