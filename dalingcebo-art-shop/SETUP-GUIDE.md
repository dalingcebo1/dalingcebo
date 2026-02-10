# Setup Guide for Dalingcebo Art Shop

This guide will help you set up the application locally and avoid common issues.

## Prerequisites

- Node.js 18 or higher
- npm, yarn, or pnpm
- A Supabase account (free tier is fine)
- A Stripe account (optional, for payments)

## Step-by-Step Setup

### 1. Clone the Repository

```bash
git clone https://github.com/dalingcebo1/dalingcebo.git
cd dalingcebo/dalingcebo-art-shop
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

This is the most critical step. The application **requires** environment variables to be configured before it can run.

#### Create your local environment file:

```bash
cp .env.example .env.local
```

#### Edit `.env.local` with your credentials:

**REQUIRED Variables:**

- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anonymous key
- `NEXTAUTH_SECRET` - Generate with: `openssl rand -base64 32`

**Getting Supabase Credentials:**

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project (or create a new one)
3. Navigate to **Settings** > **API**
4. Copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon/public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role key** → `SUPABASE_SERVICE_KEY` (optional, for admin operations)

**Example `.env.local` file:**

```env
# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_BASE_URL=http://localhost:3000
NODE_ENV=development

# Supabase - REQUIRED
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# NextAuth - REQUIRED
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-generated-secret-here

# Other variables...
# See .env.example for the complete list
```

### 4. Set Up Supabase Database

Apply the database migrations to create the necessary tables:

#### Option A: Using Supabase CLI (Recommended)

```bash
# Install Supabase CLI if you haven't
npm install -g supabase

# Link to your project
supabase link --project-ref your-project-ref

# Apply migrations
supabase db push
```

#### Option B: Using the Supabase Dashboard

1. Go to your Supabase Dashboard
2. Navigate to **SQL Editor**
3. Run each migration file in `supabase/migrations/` in order:
   - Start with `001_initial_schema.sql`
   - Then `002_...sql`, `003_...sql`, etc.

### 5. Test Supabase Connection (Optional but Recommended)

Before running the app, verify your Supabase connection:

```bash
node test-supabase.mjs
```

You should see:
```
✅ Success! Found X artwork(s)
✅ artworks: OK
✅ orders: OK
✅ customers: OK
✅ inquiries: OK
```

### 6. Run the Development Server

```bash
npm run dev
```

The application should now be running at [http://localhost:3000](http://localhost:3000).

## Common Issues and Solutions

### Issue 1: "Invalid supabaseUrl: Must be a valid HTTP or HTTPS URL"

**Cause:** The environment variables are not loaded or are set to empty strings.

**Solution:**
1. Ensure `.env.local` exists in the `dalingcebo-art-shop` directory (not in a parent directory)
2. Verify the `NEXT_PUBLIC_SUPABASE_URL` is a valid HTTPS URL
3. Restart the development server completely (stop and run `npm run dev` again)
4. Check there are no typos in variable names (they are case-sensitive)

### Issue 2: Multiple Lockfiles Warning

**Error message:**
```
⚠ Warning: Next.js inferred your workspace root, but it may not be correct.
```

**Cause:** The repository has a nested structure with multiple `package-lock.json` files.

**Solution:**
Add to your `next.config.ts`:

```typescript
const nextConfig: NextConfig = {
  // ... other config
  experimental: {
    turbopack: {
      root: process.cwd(),
    },
  },
};
```

Or add a `turbopack.root` configuration.

### Issue 3: Environment Variables Not Loading

**Cause:** Next.js only loads `.env.local` files from the project root.

**Solution:**
1. Make sure you're in the `dalingcebo-art-shop` directory when running commands
2. The `.env.local` file must be in the same directory as `package.json`
3. Environment variable names starting with `NEXT_PUBLIC_` are exposed to the browser
4. After changing environment variables, always restart the dev server

### Issue 4: Database Tables Not Found

**Cause:** Migrations haven't been applied.

**Solution:**
Apply the migrations as described in Step 4 above.

## Environment Variables Reference

See `.env.example` for a complete list of all supported environment variables.

**Required for basic functionality:**
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXTAUTH_SECRET`

**Required for payments:**
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`

**Optional:**
- Google OAuth credentials
- Yoco payment provider (South African alternative to Stripe)
- Email service credentials
- Analytics and monitoring tools

## Next Steps

1. **Customize the application** - Update branding, colors, and content
2. **Add artwork data** - Use the admin panel at `/admin` to add artworks
3. **Set up Stripe** - Configure payment processing
4. **Configure email** - Set up Resend or another email service
5. **Deploy** - Follow the [DEPLOYMENT.md](./DEPLOYMENT.md) guide

## Getting Help

- Check the [README.md](./README.md) for general information
- Review [DEPLOYMENT.md](./DEPLOYMENT.md) for deployment instructions
- Read [SECURITY.md](./SECURITY.md) for security best practices

## Troubleshooting Checklist

Before asking for help, verify:

- [ ] `.env.local` file exists in the `dalingcebo-art-shop` directory
- [ ] All required environment variables are set
- [ ] The Supabase URL is a valid HTTPS URL
- [ ] The Supabase credentials are correct (test with `node test-supabase.mjs`)
- [ ] Database migrations have been applied
- [ ] Dependencies are installed (`npm install`)
- [ ] Development server was restarted after changing environment variables
- [ ] You're running commands from the `dalingcebo-art-shop` directory
