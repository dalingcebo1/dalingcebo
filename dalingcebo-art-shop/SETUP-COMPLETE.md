# Database Setup Complete ✅

## Summary of Completed Work

### 1. ✅ Supabase Connection Fixed
- Linked Supabase project successfully
- All 10 migrations applied to database
- Made migrations idempotent (can be re-run safely)

### 2. ✅ Database Populated with 27 Artworks
All paintings from your catalog are now in the database:
- **24 Large paintings** (110×80cm and larger)
- **3 Small paintings** (Music series)
- **24 Available** for purchase
- **3 Marked as SOLD**
- All with proper prices, descriptions, and metadata

### 3. ✅ About Page Updated
- Added Dalingcebo Ngubane's complete biography
- Birth info and location (Kwa-Ngwanase → Johannesburg)
- Artist statement and practice description
- Exhibition history (CHAOS, A THEORY at Candice Berman Gallery)
- Updated philosophy and process sections

### 4. ✅ Storage Infrastructure Ready
- Created Supabase Storage buckets:
  - `artworks` bucket for images
  - `videos` bucket for videos
- Set up local directories for image organization
- Created placeholder image for artworks

### 5. ✅ Image Management Scripts Created
Four utility scripts to help manage artwork images:

#### `setup-storage.mjs`
Sets up Supabase Storage buckets (already run)

#### `upload-images.mjs`
Uploads images from `public/images/artworks/` to Supabase Storage
- Auto-matches images to artworks by filename
- Updates database with new URLs

#### `update-image-urls.mjs`
Updates artwork records with Google Drive or external URLs
- Already updated 5 paintings with Google Drive images

#### `update-artworks.mjs`
Replaces all artworks in database (used during initial setup)

### 6. ✅ Documentation Created
- **IMAGE-UPLOAD-GUIDE.md**: Complete guide for adding images
- Instructions for 3 different upload methods
- Artwork ID reference list
- Troubleshooting tips

---

## Current Status

### Images: 5/27 Complete (18.5%)

✅ **Artworks with images:**
- ID 7: Strong Woman (Google Drive)
- ID 8: Barren (Google Drive)
- ID 9: 88 Paulshof (Google Drive)
- ID 10: breaking bad (Google Drive)
- ID 11: All Music is evil (Google Drive)

⚠️ **22 artworks still need images** (IDs 12-33)

---

## Next Steps

### Option A: Upload Remaining Images to Supabase Storage (Recommended)

1. **Prepare your images:**
   ```bash
   # Images should be in: public/images/artworks/
   ```

2. **Name them for easy matching:**
   - `artwork-12.jpg` for Music 2
   - `artwork-13.jpg` for Music 3
   - etc.
   Or use descriptive names like `music-2.jpg`

3. **Upload all at once:**
   ```bash
   node scripts/upload-images.mjs
   ```

### Option B: Add Google Drive URLs

1. **Make remaining files public on Google Drive**
2. **Get the file IDs from the URLs**
3. **Edit `scripts/update-image-urls.mjs`:**
   ```javascript
   const imageUrls = {
     // ... existing 7-11
     12: 'https://lh3.googleusercontent.com/d/YOUR_FILE_ID',
     13: 'https://lh3.googleusercontent.com/d/YOUR_FILE_ID',
     // ... etc
   }
   ```
4. **Run the script:**
   ```bash
   node scripts/update-image-urls.mjs
   ```

### Option C: Manual Upload via Dashboard

1. Go to: https://yiwixcedbzznzxqantlo.supabase.co/project/_/storage/buckets/artworks
2. Upload images manually
3. Copy public URLs
4. Update database records

---

## Video Setup

For the landing page video:

1. **Upload to Supabase Storage:**
   - Go to videos bucket in dashboard
   - Upload your video file
   - Copy the public URL

2. **Update the reference in code:**
   The video is currently referenced at `/videos/landing-loop.mp4`
   - Either place it in `public/videos/landing-loop.mp4`
   - Or update the URL in components that use it

---

## Testing Your Changes

1. **Start the dev server:**
   ```bash
   npm run dev
   ```

2. **Check these pages:**
   - Homepage: http://localhost:3000
   - Shop: http://localhost:3000/shop
   - Large Paintings: http://localhost:3000/large-paintings
   - Small Paintings: http://localhost:3000/small-paintings
   - About: http://localhost:3000/about

3. **Verify database:**
   ```bash
   # Check what's in the database
   node -e "
   import { createClient } from '@supabase/supabase-js';
   import dotenv from 'dotenv';
   dotenv.config({ path: '.env.local' });
   const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
   const { data } = await supabase.from('artworks').select('id, title, price, in_stock').order('id');
   console.log('Total artworks:', data.length);
   console.log('Available:', data.filter(a => a.in_stock).length);
   console.log('Sold:', data.filter(a => !a.in_stock).length);
   "
   ```

---

## Image Specifications for Best Quality

### Recommended Settings:
- **Format**: JPEG (.jpg) or WebP
- **Dimensions**: 1200-2000px on longest side
- **Aspect Ratio**: Match painting dimensions
  - 110×80cm paintings = 1.375:1 (e.g., 1375×1000px)
  - 146×106cm = 1.38:1 (e.g., 1380×1000px)
- **Quality**: 80-90% compression
- **File Size**: Under 500KB per image (after compression)

### Quick Resize Commands:
```bash
# Install ImageMagick if needed
# sudo apt-get install imagemagick

# Resize and optimize all images
for img in *.jpg; do
  convert "$img" -resize 1500x1500\> -quality 85 "optimized-$img"
done
```

---

## Files Created

New scripts:
- `/scripts/setup-storage.mjs` ✅
- `/scripts/upload-images.mjs` ✅
- `/scripts/update-image-urls.mjs` ✅
- `/scripts/update-artworks.mjs` ✅

Documentation:
- `/IMAGE-UPLOAD-GUIDE.md` ✅

Assets:
- `/public/images/artwork-placeholder.svg` ✅

Directories:
- `/public/images/artworks/` ✅
- `/public/videos/` ✅

---

## Supabase Storage URLs

Your public storage endpoints:
- **Images**: https://yiwixcedbzznzxqantlo.supabase.co/storage/v1/object/public/artworks/
- **Videos**: https://yiwixcedbzznzxqantlo.supabase.co/storage/v1/object/public/videos/

---

## Need Help?

- Review **IMAGE-UPLOAD-GUIDE.md** for detailed instructions
- Run any script to see detailed output and instructions
- Check the Supabase Dashboard for bucket contents
- Test image URLs directly in browser to verify accessibility

---

## What's Working Now

✅ App connects to Supabase
✅ All 27 paintings in database
✅ 5 paintings display correctly (with Google Drive images)
✅ Sold items marked as unavailable
✅ Prices and descriptions show properly
✅ About page has full artist bio
✅ Storage buckets ready for remaining images

## What Needs Images

22 paintings (IDs 12-33) are using placeholder images and need real photos uploaded.
