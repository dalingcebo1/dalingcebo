This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Dalingcebo Art Shop

A minimal, production-ready e-commerce platform for contemporary art, inspired by the clean aesthetics of yeezy.com. Built with Next.js, Supabase, and Stripe.

## Features

- 🎨 Minimal, yeezy-inspired design
- 💳 Stripe payment integration
- 📧 Automated email notifications
- 🔐 Supabase authentication and database
- 📱 Fully responsive mobile experience
- 🛡️ Production-ready security headers
- ⚡ Optimized performance
- 🎯 Rate limiting on API routes

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Database**: Supabase (PostgreSQL)
- **Payments**: Stripe
- **Styling**: Tailwind CSS
- **Email**: Resend
- **Deployment**: Vercel (recommended)

## Getting Started

⚠️ **Important:** Before running the application, you must set up your environment variables. See the detailed [SETUP-GUIDE.md](./SETUP-GUIDE.md) for step-by-step instructions.

### Quick Start

1. Clone the repository:
```bash
git clone https://github.com/dalingcebo1/dalingcebo.git
cd dalingcebo/dalingcebo-art-shop
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
# Edit .env.local with your Supabase credentials and other keys
# See SETUP-GUIDE.md for detailed instructions
```

**Required environment variables:**
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anonymous key
- `NEXTAUTH_SECRET` - Generate with: `openssl rand -base64 32`

4. Test your Supabase connection (optional but recommended):
```bash
node test-supabase.mjs
```

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Troubleshooting

If you encounter errors like "Invalid supabaseUrl", see the [SETUP-GUIDE.md](./SETUP-GUIDE.md) for common issues and solutions.

## Project Structure

```
src/
├── app/              # Next.js app router pages
├── components/       # React components
├── contexts/         # React context providers
├── hooks/           # Custom React hooks
├── lib/             # Utility functions and integrations
│   ├── payments/    # Stripe/Yoco payment logic
│   ├── email.ts     # Email templates and sending
│   └── supabase/    # Supabase client setup
└── types/           # TypeScript type definitions

supabase/
└── migrations/      # Database migrations
```

## Key Pages

- `/` - Homepage with featured artworks
- `/shop` - Full artwork gallery
- `/artwork/[id]` - Individual artwork details
- `/cart` - Shopping cart
- `/account` - User account management
- `/admin` - Admin panel (protected)

## Database Setup

Apply Supabase migrations in order:

```bash
supabase migration up
```

Or manually run SQL files in the Supabase SQL editor.

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

### Quick Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/dalingcebo1/dalingcebo)

After deployment, configure environment variables in Vercel dashboard.

## Environment Variables

See `.env.example` for all required variables:

- Supabase configuration
- Stripe API keys
- Email service (Resend)
- Application settings

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run catalogs:sync` - Sync catalog data

## Security

- Production security headers configured
- Rate limiting on payment endpoints
- Row Level Security (RLS) in Supabase
- Webhook signature verification
- Environment variable validation

## Design Philosophy

The design follows yeezy.com's minimal aesthetic:

- Clean, white backgrounds
- Minimal navigation
- Focus on content (artworks)
- Typography-driven layout
- Subtle animations
- Easy access to all sections

## Contributing

This is a private art shop. For issues or questions, contact info@dalingcebo.art

## License

Private - All rights reserved

---

Built with ❤️ by Dalingcebo

## Supabase migrations

Run the latest SQL before shipping new features:

- `supabase/migrations/005_video_content.sql` – creates `artwork_videos` and `standalone_videos` plus supporting metadata.
- `supabase/migrations/008_catalogs.sql` – adds the downloadable catalogs table used by the new `/catalogs` page.

Apply them in the Supabase SQL editor or with the CLI:

```bash
supabase migration up
```

(`supabase migration up` applies every pending migration; run it after pulling the latest repository changes.)

## Catalog automation

Populate `data/catalogs.json` with Drive (or Supabase Storage) URLs, then run:

```bash
npm run catalogs:sync
```

The script normalizes Google Drive links into direct downloads and upserts each row into the `catalogs` table. The `/catalogs` route and `/api/catalogs` endpoint consume the same data.

## Video ingestion

- Upload artwork-specific clips to Supabase Storage or YouTube, then insert rows into `artwork_videos`.
- Standalone content (studio tours, interviews, etc.) goes into `standalone_videos` and can be queried via `/api/videos`.
- The artwork detail page automatically surfaces any linked videos with a full-screen modal player.
