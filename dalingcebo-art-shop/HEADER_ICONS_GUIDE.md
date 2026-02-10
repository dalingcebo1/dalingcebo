# Header Icons Guide

## Current Implementation

The header navigation icons are currently **hardcoded as inline SVG elements** in the `Header` component (`src/components/Header.tsx`). They include:

1. **Large Paintings Icon** - Grid icon linking to `/large-paintings`
2. **Small Paintings Icon** - Smaller grid icon linking to `/small-paintings`  
3. **About Icon** - Info circle linking to `/about`
4. **Cart Icon** - Shopping cart linking to `/cart`

## Visibility

### Desktop View
- Icons are visible on screens **> 768px width**
- Located in the center of the header navigation bar
- Styled with black stroke color that changes to gray on hover

### Mobile View
- Icons are **hidden** on screens **< 768px width** (via CSS: `.yeezy-nav-links { display: none }`)
- Instead, a hamburger menu button appears
- When menu is opened, icons appear in a horizontal row

## CSS Styling

The icons are styled via:
- `.yeezy-nav-link` class for container
- `.yeezy-nav-link svg` for the SVG elements
- Icons have `stroke: #000000` and `fill: none`
- Size: `w-6 h-6` (24px × 24px)

## Common Issues & Solutions

### Issue 1: Icons not visible on desktop
**Possible causes:**
- Browser zoom level too low
- CSS not loading properly
- Ad blocker interfering with SVG rendering

**Solution:**
- Check browser console for CSS errors
- Verify the page is being viewed on a screen > 768px wide
- Try disabling ad blockers

### Issue 2: Icons not visible at all
**Possible causes:**
- Server-side rendering issues
- JavaScript not loading
- Missing Supabase connection (app won't fully render)

**Solution:**
- Ensure Supabase environment variables are set in `.env.local`
- Check browser console for JavaScript errors
- Verify the Next.js development server is running without errors

## Making Icons Configurable via Supabase

If you want to make the header icons **dynamic and configurable** via Supabase:

### Step 1: Create Supabase Table
```sql
CREATE TABLE navigation_items (
  id SERIAL PRIMARY KEY,
  label TEXT NOT NULL,
  href TEXT NOT NULL,
  icon_name TEXT NOT NULL,
  order_index INTEGER NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Step 2: Update Header Component
Modify `src/components/Header.tsx` to fetch navigation items from Supabase instead of using hardcoded `navIconLinks`.

### Step 3: Create Icon Library
Create a mapping of icon names to SVG components so you can reference them dynamically.

## Current Header Structure

The header has 3 main sections:
1. **Left**: Zoom toggle (or back button)
2. **Center**: Navigation icon links (desktop only)
3. **Right**: Account button + mobile menu toggle

## Related Files
- Component: `src/components/Header.tsx`
- Styles: `src/app/globals.css` (`.yeezy-nav-*` classes)
- Mobile menu: Hamburger in `Header.tsx` (lines 160-172, 175-248)
