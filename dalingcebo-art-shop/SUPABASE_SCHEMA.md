# Supabase Schema Alignment Documentation

## Overview

This document explains the alignment between the TypeScript `Artwork` interface and the Supabase `artworks` table schema.

## Supabase Table Schema

The `artworks` table in Supabase has the following structure:

```sql
CREATE TABLE artworks (
  id INTEGER PRIMARY KEY,
  title TEXT NOT NULL,
  artist TEXT NOT NULL,
  price NUMERIC NOT NULL,
  category TEXT NOT NULL,
  scale TEXT NOT NULL,
  size TEXT NOT NULL,
  year INTEGER NOT NULL,
  medium TEXT NOT NULL,
  description TEXT NOT NULL,
  details TEXT,
  in_stock BOOLEAN DEFAULT true,
  inventory INTEGER DEFAULT 1,
  edition TEXT DEFAULT 'Original',
  image TEXT NOT NULL,
  images TEXT[] DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  base_processing_days INTEGER DEFAULT 7,
  processing_notes TEXT
);
```

## TypeScript Interface

The corresponding TypeScript interface (`src/types/database.ts`):

```typescript
export interface Artwork {
  id: number
  title: string
  artist: string
  price: number
  category: string
  scale: string
  size: string
  year: number
  medium: string
  description: string
  details: string | null
  in_stock: boolean
  inventory: number
  edition: string
  image: string
  images: string[]
  tags: string[]
  created_at: string
  updated_at: string
  base_processing_days: number
  processing_notes: string | null
}
```

## Field Mappings

| TypeScript Field | Supabase Column | Type | Notes |
|-----------------|-----------------|------|-------|
| `id` | `id` | number | Auto-incrementing integer |
| `title` | `title` | string | Artwork title |
| `artist` | `artist` | string | Artist name |
| `price` | `price` | number | Price in ZAR |
| `category` | `category` | string | Artwork category (e.g., "painting", "mixed-media") |
| `scale` | `scale` | string | Size scale ("small", "large") |
| `size` | `size` | string | Physical dimensions (e.g., "24×36") |
| `year` | `year` | number | Year created |
| `medium` | `medium` | string | Art medium (e.g., "Acrylic on Canvas") |
| `description` | `description` | string | Short description |
| `details` | `details` | string \| null | Detailed information (optional) |
| `in_stock` | `in_stock` | boolean | Availability status |
| `inventory` | `inventory` | number | Number of items in stock |
| `edition` | `edition` | string | Edition type (default: "Original") |
| `image` | `image` | string | Primary image URL |
| `images` | `images` | string[] | Additional image URLs |
| `tags` | `tags` | string[] | Search/category tags |
| `created_at` | `created_at` | string | ISO timestamp |
| `updated_at` | `updated_at` | string | ISO timestamp |
| `base_processing_days` | `base_processing_days` | number | Default processing time |
| `processing_notes` | `processing_notes` | string \| null | Processing notes (optional) |

## Key Changes from Previous Version

### ID Type
- **Before**: `id: string`
- **After**: `id: number`
- **Reason**: Supabase uses INTEGER for the id column

### Availability Field
- **Before**: `available: boolean`
- **After**: `in_stock: boolean`
- **Reason**: Matches Supabase column name

### Image Fields
- **Before**: `image_url?: string` (optional)
- **After**: `image: string` (required) + `images: string[]`
- **Reason**: Supabase has separate `image` (primary) and `images` (array) fields

### Size Category
- **Before**: `size_category: 'small' | 'large' | 'all'`
- **After**: `scale: string`
- **Reason**: Supabase uses `scale` column name

### Year Type
- **Before**: `year: string`
- **After**: `year: number`
- **Reason**: Supabase uses INTEGER type

### New Required Fields
Added fields that were missing:
- `artist`: string
- `medium`: string
- `edition`: string
- `inventory`: number
- `base_processing_days`: number
- `details`: string | null
- `images`: string[]
- `tags`: string[]
- `processing_notes`: string | null

## Usage Examples

### Querying Artworks

```typescript
// Fetch all in-stock artworks
const { data, error } = await supabase
  .from('artworks')
  .select('*')
  .eq('in_stock', true)
  .order('created_at', { ascending: false })

// Filter by scale
const { data, error } = await supabase
  .from('artworks')
  .select('*')
  .eq('in_stock', true)
  .eq('scale', 'large')
```

### Displaying Images

```typescript
// Use primary image
<Image src={artwork.image} alt={artwork.title} />

// Use first available image (primary or from array)
const imageUrl = artwork.image || artwork.images?.[0] || '/placeholder.png'
<Image src={imageUrl} alt={artwork.title} />
```

### Cart Operations

```typescript
// Cart now uses number IDs
const removeFromCart = (artworkId: number) => {
  // Remove item with numeric ID
}

const updateQuantity = (artworkId: number, quantity: number) => {
  // Update using numeric ID
}
```

## Migration Notes

If you have existing data in localStorage (cart items), it will continue to work as the cart context handles the data structure internally. However, if you need to clear caches:

```javascript
// Clear cart from localStorage if needed
localStorage.removeItem('cart')
```

## Testing

To verify the schema alignment:

1. Ensure your Supabase project has artworks data
2. Check that images display correctly
3. Verify cart operations work with the new ID type
4. Test checkout flow with Stripe/Yoco

## Related Files

- `src/types/database.ts` - Type definitions
- `src/components/ArtGallery.tsx` - Main gallery component
- `src/context/CartContext.tsx` - Cart state management
- `src/app/cart/page.tsx` - Cart page
- `src/app/api/checkout/stripe/route.ts` - Stripe integration
- `src/app/api/checkout/yoco/route.ts` - Yoco integration
