# Font Standardization Summary

## Overview
All fonts across the Dalingcebo Art Shop website have been standardized to use **Audiowide** (Google Fonts) as a temporary substitute for **Neuropol by Typodermic**.

## What Changed

### Before
The website used multiple fonts:
- **Inter** (200-900 weights) - Body text, navigation, buttons
- **Orbitron** (400, 700, 900 weights) - Logo and titles

### After
The website now uses a single font family:
- **Audiowide** (400 weight) - ALL text elements across the entire site
  - This serves as a temporary substitute with similar futuristic/geometric aesthetic
  - When Neuropol font files are available, they can be easily swapped in

## Files Modified

### 1. `src/app/globals.css` (Main Changes)
- **Removed**: Google Fonts imports for Inter and Orbitron
- **Added**: Audiowide import and @font-face declarations for future Neuropol fonts
- **Updated 10 CSS typography classes**:
  - `.yeezy-heading` - Large section headings
  - `.yeezy-main-logo` - Logo/main titles (e.g., "DALINGCEBO")
  - `.yeezy-subheading` - Secondary headings
  - `.yeezy-body` - Body text
  - `.yeezy-price` - Product prices
  - `.yeezy-title` - Small titles
  - `.yeezy-nav-link` - Navigation items
  - `.btn-yeezy` - Outline buttons
  - `.btn-yeezy-primary` - Primary buttons
  - `body` - Base body font

### 2. `src/app/checkout/page.tsx`
- Updated Stripe payment element appearance configuration
- Changed `fontFamily: 'Inter, system-ui, sans-serif'` to `fontFamily: 'Audiowide, system-ui, sans-serif'`

### 3. `public/fonts/README.md` (New File)
- Created instructions for adding actual Neuropol font files
- Documented licensing information
- Provided setup guide for converting to Neuropol when available

## Typography Classes Details

### Large Text (Neuropol X - Wide Variant)
Used for titles and larger text elements:
- `.yeezy-main-logo` - Letter spacing: 0.15em
- `.yeezy-heading` - Letter spacing: 0.05em

### Standard Text (Neuropol Regular)
Used for body text and UI elements:
- `.yeezy-subheading` - Letter spacing: 0.08em
- `.yeezy-body` - Letter spacing: 0.02em
- `.yeezy-nav-link` - Letter spacing: 0.12em
- `.btn-yeezy` / `.btn-yeezy-primary` - Letter spacing: 0.12em

## How to Activate Neuropol Fonts

When you have the Neuropol font files:

1. Place font files in `/public/fonts/`:
   - `Neuropol-Regular.woff2` and `.woff`
   - `NeuropolX-Regular.woff2` and `.woff`

2. Edit `src/app/globals.css`:
   - Remove the Audiowide import line (line 18)
   - Uncomment the @font-face declarations (lines 20-36)
   - Replace `'Audiowide'` with `'Neuropol'` or `'Neuropol X'` in the CSS classes

3. Rebuild the application:
   ```bash
   npm run build
   ```

## Impact

### Pages Affected (All 25+ pages)
- Home page (`/`)
- Shop pages (`/shop`, `/large-paintings`, `/small-paintings`)
- Product pages (`/artwork/[id]`)
- Checkout flow (`/cart`, `/checkout`, `/checkout/success`)
- Info pages (`/about`, `/contact`, `/faq`, `/press`)
- Legal pages (`/terms`, `/privacy`, `/returns`, `/shipping`, `/care`)
- Account pages (`/account`, `/admin`)
- Tracking (`/orders/track`)
- Catalogs (`/catalogs`)

### Components Using Fonts
- Header navigation
- Footer
- Hero sections
- Buttons (all variants)
- Gallery titles and prices
- Form elements
- Modals (Auth, Inquiry, Checkout)
- All typography elements

## Visual Changes

The font change from Inter (sans-serif) and Orbitron (display) to Audiowide/Neuropol provides:
- **More consistent brand identity** - Single font family across entire site
- **Futuristic aesthetic** - Matches the modern art gallery theme
- **Better readability** - Consistent spacing and weight
- **Unique character** - Distinctive from generic sans-serif fonts

## Testing

### Build Status
✅ Build completed successfully with no errors
- All 34 pages compiled
- Static generation completed
- No font-related errors

### Verification Steps Completed
1. ✅ Removed all Inter and Orbitron references from CSS
2. ✅ Updated all typography classes
3. ✅ Updated inline styles (Stripe config)
4. ✅ Verified build completes without errors
5. ✅ Ensured email templates use system fonts (for compatibility)

## Notes

- Email templates intentionally kept with system fonts for email client compatibility
- The Audiowide font is a free Google Font that provides a similar aesthetic to Neuropol
- Letter spacing has been adjusted slightly compared to original values for better readability with Audiowide
- When switching to actual Neuropol, you may need to fine-tune letter-spacing values based on the font's characteristics
