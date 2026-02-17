# Font Standardization - Visual Examples

## Current Font Setup

### Typography Hierarchy

#### 1. Main Logo / Hero Titles (Audiowide)
```
Font: Audiowide, 400 weight, 0.15em letter-spacing
Example: "DALINGCEBO"
Distinctive, wide-spaced, geometric display font
```

#### 2. Section Headings (Audiowide)
```
Font: Audiowide, 400 weight, 0.05em letter-spacing
Example: "EXPLORE THE COLLECTION"
Bold, futuristic, eye-catching
```

#### 3. Sub Headers (Exo 2 Bold)
```
Font: Exo 2, 700 weight, 0.08em letter-spacing
Example: "NEW ARRIVALS"
Strong emphasis, clear hierarchy
```

#### 4. Body Text (Exo 2 Light)
```
Font: Exo 2, 300 weight, 0.02em letter-spacing
Example: "Discover contemporary art by Dalingcebo..."
Thin, readable, modern aesthetic
```

#### 5. Navigation Links (Exo 2 Medium)
```
Font: Exo 2, 500 weight, 0.12em letter-spacing
Example: "HOME • SHOP • ABOUT • CONTACT"
Clear, balanced, professional
```

#### 6. Buttons (Exo 2 Bold)
```
Font: Exo 2, 700 weight, 0.12em letter-spacing
Example: "ADD TO CART"
Strong call-to-action, clear emphasis
```

#### 7. Prices (Exo 2 Semi-Bold)
```
Font: Exo 2, 600 weight, 0.06em letter-spacing
Example: "R 15,000.00"
Prominent but not overwhelming
```

## Key Visual Differences

### Font Pairing
- **Audiowide**: Display font for titles - distinctive, geometric, tech-inspired
- **Exo 2**: Text font for everything else - modern, versatile, 18 weights

### Letter Spacing
- Titles (Audiowide): Wide spacing (0.15em for logo, 0.05em for headings)
- Sub headers (Exo 2): Moderate spacing (0.08em)
- Body text (Exo 2): Minimal spacing (0.02em)
- UI elements (Exo 2): Balanced spacing (0.06em - 0.12em)

### Font Weight Strategy
- **Titles**: Single weight (Audiowide 400)
- **Sub headers**: Bold (Exo 2 700)
- **Body text**: Light/Thin (Exo 2 300)
- **Navigation**: Medium (Exo 2 500)
- **Prices**: Semi-Bold (Exo 2 600)
- **Buttons**: Bold (Exo 2 700)

### Brand Impact
- **Distinctive hierarchy**: Clear separation between titles and content
- **Professional appearance**: Text font optimized for readability
- **Flexible system**: 18 Exo 2 weights available for future needs
- **Modern aesthetic**: Contemporary design with tech-forward feel

## Pages Showcasing Font Changes

### High-Impact Pages
1. **Homepage (/)** - Hero with large logo, navigation
2. **Shop (/shop)** - Product titles, prices, filters
3. **Product Detail (/artwork/[id])** - Large titles, descriptions
4. **Checkout (/checkout)** - Forms, buttons, summary
5. **About (/about)** - Long-form text content

### All Typography Classes Affected
```css
.yeezy-main-logo      → Logo and main titles (Audiowide 400)
.yeezy-heading        → Section headings (Audiowide 400)
.yeezy-subheading     → Subsection headings (Exo 2 Bold 700)
.yeezy-body           → Body text (Exo 2 Light 300)
.yeezy-price          → Product prices (Exo 2 Semi-Bold 600)
.yeezy-title          → Small titles (Exo 2 Semi-Bold 600)
.yeezy-nav-link       → Navigation items (Exo 2 Medium 500)
.btn-yeezy            → Outline buttons (Exo 2 Bold 700)
.btn-yeezy-primary    → Filled buttons (Exo 2 Bold 700)
body                  → Default body text (Exo 2 Regular 400)
```

## Technical Implementation

### Font Loading
```css
/* Audiowide for titles */
@import url('https://fonts.googleapis.com/css2?family=Audiowide&display=swap');

/* Exo 2 for sub headers and body text (all weights 100-900) */
@import url('https://fonts.googleapis.com/css2?family=Exo+2:wght@100;200;300;400;500;600;700;800;900&display=swap');
```

### Example Class Updates
```css
/* Title - Audiowide */
.yeezy-heading {
  font-family: 'Audiowide', sans-serif;
  font-weight: 400;
  letter-spacing: 0.05em;
}

/* Sub header - Exo 2 Bold */
.yeezy-subheading {
  font-family: 'Exo 2', sans-serif;
  font-weight: 700;
  letter-spacing: 0.08em;
}

/* Body text - Exo 2 Light */
.yeezy-body {
  font-family: 'Exo 2', sans-serif;
  font-weight: 300;
  letter-spacing: 0.02em;
  line-height: 1.4;
}
```

## Performance Impact

### Font Loading
- 2 font families (Audiowide + Exo 2)
- Audiowide: 1 weight (400) - ~20KB
- Exo 2: All 18 weights loaded (100-900) - ~180KB total
- **Total: ~200KB font data**

### Optimization Notes
- Both fonts loaded from Google Fonts CDN with optimal compression
- `display=swap` ensures text remains visible during font loading
- Could optimize by loading only required Exo 2 weights if size is a concern
- Currently loading all weights for maximum design flexibility

## Accessibility Considerations

### Maintained
- ✅ High contrast ratios preserved
- ✅ Letter spacing optimized for each font
- ✅ Line height adjusted for optimal readability
- ✅ Responsive sizing maintained

### Improved
- ✅ Clear visual hierarchy through font pairing
- ✅ Readable body text with Exo 2 Light (300)
- ✅ Strong emphasis with Exo 2 Bold (700)
- ✅ Flexible weight system for varied emphasis

## Browser Compatibility

Audiowide/Neuropol font implementation:
- ✅ All modern browsers (Chrome, Firefox, Safari, Edge)
- ✅ WOFF2 format for optimal compression
- ✅ WOFF fallback for older browsers
- ✅ System font stack fallback
- ✅ `font-display: swap` for optimal loading

## Summary

This font standardization:
- ✅ Creates clear typographic hierarchy with font pairing
- ✅ Uses Audiowide for distinctive title styling
- ✅ Uses Exo 2 with 18 weights for flexible sub headers and body text
- ✅ Implements both thin (300) and bold (700) Exo 2 variants as recommended
- ✅ Maintains professional, modern aesthetic
- ✅ Provides design flexibility with multiple font weights
- ✅ Ensures accessibility standards
