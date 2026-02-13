# Production Deployment Guide

This guide will help you deploy the Dalingcebo Art Shop to production.

## Prerequisites

Before deploying, ensure you have:

1. **Supabase Account** - Database and authentication
2. **Stripe Account** - Payment processing
3. **Resend Account** (or similar) - Email delivery
4. **Domain Name** - Your production domain

## Environment Variables

Copy `.env.example` to `.env.local` and fill in all values:

```bash
cp .env.example .env.local
```

### Required Variables

#### Supabase
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anonymous key

#### Stripe
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Stripe publishable key
- `STRIPE_SECRET_KEY` - Stripe secret key
- `STRIPE_WEBHOOK_SECRET` - Stripe webhook signing secret

#### Email (Resend)
- `RESEND_API_KEY` - Your Resend API key
- `EMAIL_FROM` - Sender email (e.g., `Dalingcebo Art <orders@dalingcebo.art>`)

#### Application
- `NEXT_PUBLIC_BASE_URL` - Your production URL (e.g., `https://dalingcebo.art`)
- `ADMIN_KEY` - Secret key for admin API access (server-only, never exposed to client)

#### Optional
- `NEXT_PUBLIC_YOCO_PUBLIC_KEY` - For South African payments
- `YOCO_SECRET_KEY` - Yoco secret key
- `NEXT_PUBLIC_GOOGLE_CLIENT_ID` - For Google OAuth

## Deployment Steps

### 1. Database Setup (Supabase)

1. Create a new Supabase project or use existing
2. Run all migrations in order:
   ```bash
   # Navigate to migrations folder
   cd supabase/migrations
   
   # Apply each migration in the Supabase SQL editor
   # Or use Supabase CLI:
   supabase migration up
   ```

3. Set up Row Level Security (RLS) policies as needed
4. Configure authentication providers in Supabase dashboard

### 2. Stripe Setup

1. Get your Stripe API keys from the Stripe Dashboard
2. Set up webhooks:
   - Go to Stripe Dashboard > Developers > Webhooks
   - Add endpoint: `https://yourdomain.com/api/payments/stripe/webhook`
   - Select events:
     - `payment_intent.succeeded`
     - `payment_intent.payment_failed`
     - `charge.refunded`
   - Copy the webhook signing secret to `STRIPE_WEBHOOK_SECRET`

### 3. Email Setup (Resend)

1. Sign up for Resend (or alternative email service)
2. Verify your sending domain
3. Create an API key
4. Add API key to `RESEND_API_KEY`

### 4. Deploy to Vercel (Recommended)

1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Navigate to project directory:
   ```bash
   cd dalingcebo-art-shop
   ```

3. Deploy:
   ```bash
   vercel
   ```

4. Add environment variables in Vercel Dashboard:
   - Go to Project Settings > Environment Variables
   - Add all variables from `.env.example`

5. Redeploy after adding environment variables:
   ```bash
   vercel --prod
   ```

### Alternative: Deploy to Other Platforms

#### Netlify
```bash
npm run build
# Upload .next folder to Netlify
```

#### Self-hosted
```bash
# Build the application
npm run build

# Start production server
npm start
```

For self-hosted deployments, ensure:
- Node.js 18+ is installed
- PM2 or similar process manager
- Nginx or Apache for reverse proxy
- SSL certificate (Let's Encrypt recommended)

## Post-Deployment Checklist

- [ ] Test all payment flows (Stripe/Yoco)
- [ ] Verify email delivery
- [ ] Test user authentication
- [ ] Check all pages load correctly
- [ ] Test mobile responsiveness
- [ ] Verify images load properly
- [ ] Test admin panel access
- [ ] Set up monitoring (Sentry, LogRocket, etc.)
- [ ] Configure analytics (Google Analytics, Plausible, etc.)
- [ ] Test order tracking
- [ ] Verify webhook endpoints are accessible
- [ ] Check SEO meta tags
- [ ] Test contact forms
- [ ] Verify catalog downloads work

## Security Considerations

1. **Environment Variables**: Never commit `.env` files
2. **API Keys**: Rotate keys periodically
3. **Admin Access**: Change default admin key
4. **Rate Limiting**: Monitor API usage
5. **HTTPS**: Ensure all traffic uses SSL
6. **Headers**: Security headers are configured in `next.config.ts`

## Monitoring

Set up monitoring for:
- Application errors (Sentry)
- Performance metrics (Vercel Analytics)
- Uptime monitoring (UptimeRobot, Pingdom)
- Payment webhooks (Stripe Dashboard)

## Maintenance

Regular maintenance tasks:
- Review and update dependencies monthly
- Check security advisories: `npm audit`
- Monitor database size and performance
- Review error logs weekly
- Backup database regularly
- Test disaster recovery procedures

## Troubleshooting

### Build Fails
- Check Node.js version (18+)
- Clear `.next` folder and rebuild
- Verify all dependencies are installed

### Payments Not Working
- Verify Stripe keys are correct
- Check webhook endpoints are accessible
- Review Stripe Dashboard logs

### Emails Not Sending
- Verify Resend API key
- Check sending domain is verified
- Review Resend logs

### Images Not Loading
- Verify Supabase Storage is configured
- Check image URLs in database
- Review `next.config.ts` remote patterns

## Support

For issues or questions:
- Email: info@dalingcebo.art
- Check documentation in `/docs` folder
- Review Supabase/Stripe documentation

## Performance Optimization

After deployment:
1. Enable caching in CDN
2. Optimize images (WebP format)
3. Monitor Core Web Vitals
4. Set up incremental static regeneration for catalog pages
5. Use Vercel Analytics for performance insights

## Scaling Considerations

As traffic grows:
1. Upgrade Supabase plan as needed
2. Consider Redis for rate limiting
3. Implement CDN for static assets
4. Use database connection pooling
5. Monitor and optimize slow queries
