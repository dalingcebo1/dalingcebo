# Google Sheets Integration Guide

## Overview
Use Google Sheets as your product database instead of JSON files or Supabase.

## Setup Steps

### 1. Create Your Google Sheet

Create a sheet with these columns:
- id (number)
- title (text)
- artist (text)  
- price (number)
- category (text)
- scale (large or small)
- size (text, e.g., "24×36")
- year (number)
- medium (text)
- description (text)
- details (text)
- inStock (TRUE/FALSE)
- inventory (number)
- edition (text)
- image (URL)
- images (comma-separated URLs)
- tags (comma-separated)

### 2. Get Google Sheets API Key

1. Go to https://console.cloud.google.com
2. Create a new project "Dalingcebo Art Shop"
3. Enable "Google Sheets API"
4. Create credentials → API Key
5. Restrict key to "Google Sheets API" only
6. Add to .env.local:
   ```
   GOOGLE_SHEETS_API_KEY=your-api-key
   GOOGLE_SHEET_ID=your-sheet-id
   ```

### 3. Make Sheet Public (Read-Only)

Share your sheet:
- Click "Share" button
- Change to "Anyone with the link can view"
- Get the Sheet ID from URL: 
  `https://docs.google.com/spreadsheets/d/{SHEET_ID}/edit`

## Pros
✅ Easy to edit in spreadsheet
✅ Visual inventory management
✅ Free forever
✅ No database setup

## Cons
❌ Slower than database (2-3 sec load time)
❌ API rate limits (100 req/100sec)
❌ Manual inventory updates after sales
❌ No automatic payment tracking
❌ No customer accounts
❌ Can't handle concurrent transactions safely

## When to Use This
- Very low traffic (< 100 visitors/day)
- Few products (< 50 artworks)
- Prefer manual control
- Don't need customer accounts
- Comfortable with spreadsheet editing

## When to Use Supabase Instead
- Growing business
- Want automatic inventory
- Need payment tracking
- Want customer accounts
- Regular traffic spikes
- Professional appearance (no 2-3 sec delays)

## Code Changes Required
Would need to replace:
- `src/hooks/useArtworks.tsx` - Fetch from Sheets API instead of /api/artworks
- `src/app/api/artworks/route.ts` - Read from Sheets, not JSON
- `src/lib/artworkStore.ts` - Not needed anymore

## Estimated Setup Time
~1-2 hours to integrate Google Sheets API
