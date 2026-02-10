# Supabase Setup Guide

This guide will help you set up Supabase for the Dalingcebo Art Shop.

## Prerequisites

1. A Supabase account (sign up at [supabase.com](https://supabase.com))
2. A Supabase project created

## Setup Steps

### 1. Get Your Supabase Credentials

1. Go to your Supabase project dashboard
2. Click on **Settings** (gear icon) → **API**
3. Copy the following values:
   - **Project URL** (looks like `https://xxxxx.supabase.co`)
   - **anon/public key** (under "Project API keys")
   - **service_role key** (under "Project API keys" - keep this secret!)

### 2. Configure Environment Variables

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Update the following variables in `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   SUPABASE_SERVICE_KEY=your-service-role-key-here
   ```

### 3. Set Up the Database

1. In your Supabase dashboard, go to the **SQL Editor**
2. Open the file `supabase-schema.sql` from this project
3. Copy the entire SQL content
4. Paste it into the Supabase SQL Editor
5. Click **Run** to execute the schema

This will:
- Create the `artworks` table
- Set up Row Level Security (RLS) policies
- Insert sample artwork data

### 4. Verify the Setup

1. Go to **Table Editor** in Supabase dashboard
2. You should see the `artworks` table with 8 sample artworks
3. Run the development server:
   ```bash
   npm run dev
   ```
4. Visit `http://localhost:3000` - you should see the artworks loaded from Supabase

## Features

### Grid Items
- **Clickable**: Each artwork in the grid is now clickable (currently logs to console)
- **Filterable**: Artworks can be filtered by size (small, large, all)
- **Dynamic**: Data is fetched from Supabase in real-time

### Pages
- `/` - Home page with all artworks
- `/large-paintings` - Filtered view of large paintings
- `/small-paintings` - Filtered view of small paintings

### Fallback Behavior
If Supabase is not configured or fails to connect, the app will fall back to using hardcoded sample data, ensuring the site remains functional.

## Database Schema

### Artworks Table

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key (auto-generated) |
| `title` | TEXT | Artwork title |
| `price` | DECIMAL | Price in dollars |
| `category` | TEXT | Category (painting, mixed-media, etc.) |
| `size` | TEXT | Physical dimensions (e.g., "24×36") |
| `year` | TEXT | Year created |
| `image_url` | TEXT | Optional URL to artwork image |
| `description` | TEXT | Optional description |
| `available` | BOOLEAN | Whether artwork is available for sale |
| `size_category` | TEXT | Filter category: 'small', 'large', or 'all' |
| `created_at` | TIMESTAMP | Record creation time |
| `updated_at` | TIMESTAMP | Record update time |

## Adding New Artworks

You can add artworks via:

1. **Supabase Dashboard**:
   - Go to Table Editor → artworks
   - Click "Insert row"
   - Fill in the details

2. **SQL**:
   ```sql
   INSERT INTO artworks (title, price, category, size, year, size_category)
   VALUES ('New Artwork', 999.00, 'painting', '20×30', '2024', 'large');
   ```

## Security

- **Read Access**: Public (anyone can view artworks)
- **Write Access**: Authenticated users only
- Service role key should never be exposed to the client
- Always use the `NEXT_PUBLIC_SUPABASE_ANON_KEY` in client-side code

## Troubleshooting

### Artworks not loading?
1. Check browser console for errors
2. Verify environment variables in `.env.local`
3. Ensure the SQL schema was executed successfully
4. Check Supabase logs in the dashboard

### RLS Errors?
- Make sure Row Level Security policies are set up correctly
- The SQL schema includes the necessary policies

## Next Steps

Consider implementing:
- Image upload functionality
- Admin dashboard for managing artworks
- Shopping cart and checkout
- User authentication
- Artwork detail pages
