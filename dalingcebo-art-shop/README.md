This is a [Next.js](https://nextjs.org) project for Dalingcebo Art Shop - a contemporary art e-commerce platform with integrated payment solutions.

## Features

- 🎨 **Art Gallery**: Browse and view contemporary artworks
- 🛒 **Shopping Cart**: Add items, manage quantities, persistent storage
- 💳 **Payment Integration**: 
  - Stripe for international payments
  - Yoco for South African payments
- 📱 **Responsive Design**: Minimalist Yeezy-inspired aesthetic
- 🔒 **Secure Checkout**: Server-side payment processing
- 📦 **Order Management**: Checkout flow with shipping information

For detailed e-commerce feature documentation, see [ECOMMERCE.md](./ECOMMERCE.md).

## Prerequisites

- Node.js 20+ and npm
- A Supabase account and project ([supabase.com](https://supabase.com))
- (Optional) Stripe account for payment processing ([stripe.com](https://stripe.com))
- (Optional) Yoco account for South African payments ([yoco.com](https://www.yoco.com))

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment variables:**
   ```bash
   cp .env.example .env.local
   ```
   
   Then edit `.env.local` and fill in your actual credentials:
   - Get Supabase credentials from your [Supabase Project Settings > API](https://supabase.com/dashboard/project/_/settings/api)
   - Click "Legacy anon, service_role API keys" tab to get the keys
   - Update `NEXT_PUBLIC_SUPABASE_URL` with your project URL
   - Update `NEXT_PUBLIC_SUPABASE_ANON_KEY` with your anon key
   - Update `SUPABASE_SERVICE_KEY` with your service role key
   - (Optional) Add Stripe keys for payment processing
   - (Optional) Add Yoco keys for South African payments
   - Update other credentials as needed for your integrations

## Pages

- `/` - Home page with featured artworks
- `/large-paintings` - Large artwork collection
- `/small-paintings` - Small artwork collection
- `/about` - About the artist
- `/cart` - Shopping cart
- `/checkout` - Checkout and payment
- `/checkout/success` - Order confirmation

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
