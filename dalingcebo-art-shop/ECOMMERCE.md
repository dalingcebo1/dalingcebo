# E-commerce Features Documentation

This document describes the e-commerce features implemented in the Dalingcebo Art Shop.

## Features Overview

### 1. About Page
- **URL**: `/about`
- Provides information about the artist, philosophy, and collection
- Includes contact information
- Follows the minimalist Yeezy-inspired design aesthetic

### 2. Shopping Cart
- **Cart Context**: Global state management for cart items
- **Persistent Storage**: Cart is saved to localStorage
- **Cart Badge**: Displays item count in the header
- **Features**:
  - Add items to cart from gallery
  - View cart items with images
  - Update quantities
  - Remove items
  - View subtotal and total

### 3. Checkout Process
- **URL**: `/checkout`
- **Features**:
  - Shipping information form
  - Payment method selection (Stripe or Yoco)
  - Order summary
  - Real-time total calculation
- **Payment Methods**:
  - **Stripe**: International credit/debit card payments
  - **Yoco**: South African payment gateway

### 4. Payment Integration

#### Stripe Integration
- **API Route**: `/api/checkout/stripe`
- **Features**:
  - ZAR currency support
  - Shipping address collection
  - Order metadata tracking
  - Automatic redirect to Stripe Checkout
  - Success/cancel URLs configured

#### Yoco Integration
- **API Route**: `/api/checkout/yoco`
- **Features**:
  - ZAR payment processing
  - Order metadata tracking
  - Success/failure/cancel URL handling
  - South African market focused

### 5. Success Page
- **URL**: `/checkout/success`
- Displays order confirmation
- Clears cart after successful payment
- Shows order ID (for Stripe)
- Provides next steps and contact information

## Setup Instructions

### Environment Variables

Create a `.env.local` file with the following variables:

```bash
# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Supabase (Required)
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-key

# Stripe (Optional - for credit card payments)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_key
STRIPE_SECRET_KEY=sk_test_your_key

# Yoco (Optional - for South African payments)
NEXT_PUBLIC_YOCO_PUBLIC_KEY=pk_test_your_key
YOCO_SECRET_KEY=sk_test_your_key
```

### Getting Payment Keys

#### Stripe
1. Sign up at [stripe.com](https://stripe.com)
2. Navigate to Developers > API keys
3. Copy the Publishable key and Secret key
4. Add them to `.env.local`

#### Yoco
1. Sign up at [portal.yoco.com](https://portal.yoco.com)
2. Navigate to Settings > API Keys
3. Copy the Public key and Secret key
4. Add them to `.env.local`

## Usage Flow

1. **Browse**: Users browse artworks on the home page or category pages
2. **Add to Cart**: Click "Add to Cart" on any artwork in the gallery
3. **View Cart**: Click the cart icon in the header to view cart
4. **Checkout**: Click "Proceed to Checkout" from the cart
5. **Enter Details**: Fill in shipping information
6. **Select Payment**: Choose Stripe or Yoco
7. **Pay**: Click "Pay with [Provider]" to complete payment
8. **Confirmation**: Redirected to success page after payment

## Technical Details

### Cart Context
- Location: `src/context/CartContext.tsx`
- Provides: `addToCart`, `removeFromCart`, `updateQuantity`, `clearCart`, `totalItems`, `totalPrice`
- Storage: localStorage for persistence across sessions

### API Routes
- `POST /api/checkout/stripe`: Creates Stripe checkout session
- `POST /api/checkout/yoco`: Creates Yoco checkout

### Components
- `Header`: Shows cart badge with item count
- `ArtGallery`: Includes "Add to Cart" buttons
- `Toast`: Displays confirmation when items are added

### Pages
- `/cart`: Cart management page
- `/checkout`: Checkout and payment page
- `/checkout/success`: Order confirmation page
- `/about`: About the artist page

## Security Considerations

1. **Environment Variables**: All API keys are stored in environment variables
2. **Server-Side Processing**: Payment processing happens server-side
3. **No Sensitive Data**: No payment details stored in the application
4. **Stripe Security**: Uses Stripe's secure checkout flow
5. **Yoco Security**: Uses Yoco's secure API

## Future Enhancements

- Order history tracking
- Email confirmations
- Inventory management
- Customer accounts
- Wishlist functionality
- Multiple shipping options
- Tax calculation
- Discount codes

## Support

For issues or questions:
- Email: info@dalingcebo.com
- Repository: [GitHub Issues](https://github.com/dalingcebo1/dalingcebo/issues)
