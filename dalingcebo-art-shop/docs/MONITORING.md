# Monitoring & Analytics Setup Guide

This document explains how to set up monitoring and analytics for the Dalingcebo Art Shop.

## Analytics

### Google Analytics

1. Create a Google Analytics 4 property
2. Get your Measurement ID (starts with G-)
3. Add to `.env.local`:
   ```
   NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
   ```

### Plausible Analytics (Privacy-Friendly Alternative)

1. Sign up at [plausible.io](https://plausible.io)
2. Add your domain
3. Add to `.env.local`:
   ```
   NEXT_PUBLIC_PLAUSIBLE_DOMAIN=yourdomain.com
   ```

## Error Monitoring

### Sentry Setup

1. Install Sentry:
   ```bash
   npm install @sentry/nextjs
   ```

2. Run the Sentry wizard:
   ```bash
   npx @sentry/wizard@latest -i nextjs
   ```

3. Add your DSN to `.env.local`:
   ```
   NEXT_PUBLIC_SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
   ```

4. Uncomment the Sentry code in `src/lib/monitoring.ts`

### Alternative: Custom Error Logging

You can also send errors to a custom endpoint by implementing the `captureException` and `captureMessage` functions in `src/lib/monitoring.ts`.

## Performance Monitoring

### Web Vitals

The app automatically tracks Core Web Vitals (LCP, FID, CLS, etc.) when in production mode.

To send metrics to a custom endpoint:

1. Add to `.env.local`:
   ```
   NEXT_PUBLIC_VITALS_ENDPOINT=https://your-api.com/vitals
   ```

2. The endpoint will receive POST requests with the following structure:
   ```json
   {
     "name": "LCP",
     "value": 2500,
     "id": "v3-1234567890",
     "delta": 2500
   }
   ```

### Vercel Analytics

If deploying to Vercel:

1. Enable Analytics in your Vercel dashboard
2. No additional configuration needed

## Uptime Monitoring

Recommended services:

1. **UptimeRobot** (Free tier available)
   - Monitor your homepage and key API endpoints
   - Set up email alerts

2. **Pingdom**
   - More detailed uptime tracking
   - Performance monitoring

3. **BetterUptime**
   - Status pages
   - Incident management

## Setting Up Alerts

### Critical Alerts

Set up alerts for:
- Site downtime
- Payment processing failures
- Database connection issues
- High error rates

### Recommended Thresholds

- **Response Time**: Alert if > 3 seconds
- **Error Rate**: Alert if > 5% of requests fail
- **Uptime**: Alert if < 99.9%

## Dashboard Setup

### Google Analytics Dashboard

Create custom reports for:
- Page views by artwork
- Conversion funnel (view → cart → checkout)
- Traffic sources
- User demographics

### Custom Dashboard

Consider building a custom admin dashboard that shows:
- Real-time sales
- Top-selling artworks
- Recent inquiries
- Payment status
- Inventory levels

## Privacy Considerations

- Analytics data should be anonymized
- Comply with GDPR/POPIA regulations
- Have a clear privacy policy
- Allow users to opt-out of tracking

## Testing Monitoring

Before going live:

1. **Test Error Tracking**:
   ```javascript
   throw new Error('Test error for monitoring')
   ```

2. **Test Analytics**:
   - Navigate through pages
   - Check if pageviews are recorded
   - Verify event tracking

3. **Test Performance**:
   - Run Lighthouse audits
   - Check Core Web Vitals in production

## Maintenance

- Review analytics weekly
- Check error logs daily
- Update monitoring thresholds monthly
- Audit privacy compliance quarterly
