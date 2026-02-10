# Image Upload Guide

This guide explains how to add images to your artwork database.

## Current Status

✅ **27 paintings added to database**
✅ **5 paintings have Google Drive images** (IDs 7-11: Strong Woman through All Music is evil)
⚠️ **22 paintings need images** (IDs 12-33)

**Progress: 5/27 artworks (18.5%) have images**

## Option 1: Upload to Supabase Storage (Recommended)

### Step 1: Set up Storage Buckets
```bash
node scripts/setup-storage.mjs
```

This creates:
- `artworks` bucket for images (10MB limit)
- `videos` bucket for videos (100MB limit)

### Step 2: Prepare Your Images

Create the images directory:
```bash
mkdir -p public/images/artworks
```

Place your images there and name them:
- `artwork-1.jpg` for Artwork ID 1 (Strong Woman)
- `artwork-2.jpg` for Artwork ID 2 (Barren)
- etc.

Or use descriptive names:
- `strong-woman.jpg`
- `barren.jpg`
- The script will try to match them automatically

### Step 3: Upload Images
```bash
node scripts/upload-images.mjs
```

This will:
1. Find all images in `public/images/artworks/`
2. Upload them to Supabase Storage
3. Update the database with the new URLs

## Option 2: Use Google Drive Images

If your images are already on Google Drive:

### Step 1: Make Files Public
For each Google Drive file:
1. Right-click → Share
2. Change to "Anyone with the link"
3. Copy the file ID from the URL

### Step 2: Update the Script

Edit `scripts/update-image-urls.mjs` and add your mappings:
```javascript
const imageUrls = {
  1: 'https://lh3.googleusercontent.com/d/YOUR_FILE_ID_1',
  2: 'https://lh3.googleusercontent.com/d/YOUR_FILE_ID_2',
  // ... add all 27
}
```

### Step 3: Run the Update
```bash
node scripts/update-image-urls.mjs
```

## Option 3: Manual Upload via Dashboard

1. Go to your Supabase Dashboard
2. Navigate to Storage → artworks bucket
3. Click "Upload File"
4. Upload your images
5. Copy the public URLs
6. Update the artwork records in the database

## Image Specifications

### Recommended:
- **Format**: JPEG or WebP
- **Size**: 1200-2000px on longest side
- **Quality**: 80-90% compression
- **Aspect Ratio**: Match painting dimensions (110×80cm = 1.375:1)

### Limits:
- Max file size: 10MB per image
- Supported formats: JPEG, PNG, WebP, GIF

## Video Upload

For the landing page video and process videos:

```bash
# 1. Create videos directory
mkdir -p public/videos

# 2. Place your video file there (e.g., landing-loop.mp4)

# 3. Upload to Supabase Storage manually via dashboard
# Or add to the upload script
```

## Artwork IDs Reference

Current artwork IDs in database:
```
7  - Strong Woman ✅ (has image)
8  - Barren ✅ (has image)
9  - 88 Paulshof ✅ (has image)
10 - breaking bad ✅ (has image)
11 - All Music is evil ✅ (has image)
12 - Music 2
13 - Music 3
14 - Music 1
15 - We love you
16 - Women of the Village ? (SOLD)
17 - Clapping Figures (SOLD)
18 - sun-kissed
19 - Ponta
20 - Worth
21 - Glory
22 - Tropical crush
23 - Paulshof, 2024
24 - Beautiful People
25 - Thank You
26 - Romance
27 - Me you and Yellow Duck
28 - You and your sisters
29 - Snowparty and unicorns
30 - Shy Cheerleaders
31 - Grief, yikes! (SOLD)
32 - Working girls
33 - there is no word for a parent who loses a child
```

## Verification

After uploading, verify images are working:

```bash
# Check database
node -e "
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
const { data } = await supabase.from('artworks').select('id, title, image').order('id');
data.forEach(a => console.log(\`\${a.id}: \${a.title} - \${a.image}\`));
"

# Or visit your app
npm run dev
# Navigate to http://localhost:3000/shop
```

## Troubleshooting

### Images not loading from Google Drive
- Make sure files are set to "Anyone with the link can view"
- Use the lh3.googleusercontent.com URL format
- Test the URL directly in a browser first

### Upload script not finding images
- Check the directory path: `public/images/artworks/`
- Verify file extensions are: .jpg, .jpeg, .png, .webp, or .gif
- Check file naming matches the patterns

### Storage bucket not created
- Verify your Supabase service key has admin privileges
- Check the Supabase Dashboard manually to create buckets

## Need Help?

Run any script with `node scripts/SCRIPT_NAME.mjs` to see detailed output and error messages.
