# Testing Guide

This document outlines the testing strategy for the Dalingcebo Art Shop.

## Current Status

The application currently does not have automated tests. This guide provides a roadmap for implementing comprehensive testing.

## Testing Strategy

### 1. Unit Tests

Test individual functions and components in isolation.

**Tools**: Jest + React Testing Library

**Setup**:
```bash
npm install --save-dev jest @testing-library/react @testing-library/jest-dom @testing-library/user-event jest-environment-jsdom
```

**Example Test** (`src/lib/__tests__/media.test.ts`):
```typescript
import { getArtworkAspectRatio } from '../media'

describe('getArtworkAspectRatio', () => {
  it('returns correct ratio for square artworks', () => {
    expect(getArtworkAspectRatio('100x100cm')).toBe('1/1')
  })
  
  it('returns correct ratio for portrait artworks', () => {
    expect(getArtworkAspectRatio('60x80cm')).toBe('3/4')
  })
})
```

### 2. Integration Tests

Test how components work together.

**Example** (`src/components/__tests__/CheckoutModal.test.tsx`):
```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import CheckoutModal from '../CheckoutModal'

describe('CheckoutModal', () => {
  it('validates required fields', async () => {
    render(<CheckoutModal isOpen={true} onClose={() => {}} items={[]} total={0} />)
    
    const submitButton = screen.getByText('Place Order')
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText(/name is required/i)).toBeInTheDocument()
    })
  })
})
```

### 3. End-to-End Tests

Test complete user flows.

**Tools**: Playwright or Cypress

**Setup (Playwright)**:
```bash
npm install --save-dev @playwright/test
npx playwright install
```

**Example** (`e2e/checkout.spec.ts`):
```typescript
import { test, expect } from '@playwright/test'

test('complete checkout flow', async ({ page }) => {
  // Navigate to shop
  await page.goto('/shop')
  
  // Click on an artwork
  await page.click('article:first-child')
  
  // Add to cart
  await page.click('button:has-text("Add to Cart")')
  
  // Go to cart
  await page.click('a[href="/cart"]')
  
  // Verify item in cart
  await expect(page.locator('text=1 item')).toBeVisible()
  
  // Proceed to checkout
  await page.click('button:has-text("Checkout")')
  
  // Fill checkout form
  await page.fill('input[name="name"]', 'Test User')
  await page.fill('input[name="email"]', 'test@example.com')
  await page.fill('input[name="address"]', '123 Test St, City, 12345')
  
  // Submit order
  await page.click('button:has-text("Place Order")')
  
  // Verify success
  await expect(page.locator('text=Order Confirmed')).toBeVisible()
})
```

### 4. API Tests

Test API endpoints.

**Example** (`src/app/api/__tests__/artworks.test.ts`):
```typescript
import { GET } from '../artworks/route'

describe('GET /api/artworks', () => {
  it('returns list of artworks', async () => {
    const response = await GET()
    const data = await response.json()
    
    expect(response.status).toBe(200)
    expect(Array.isArray(data)).toBe(true)
  })
})
```

## Test Coverage Goals

- **Unit Tests**: 80%+ coverage
- **Integration Tests**: All critical user flows
- **E2E Tests**: Happy paths for main features
- **API Tests**: All endpoints

## Critical Tests to Implement

### High Priority

1. **Checkout Flow**
   - Add to cart
   - Update quantities
   - Apply shipping info
   - Process payment
   - Generate invoice

2. **Authentication**
   - Sign up
   - Login
   - Logout
   - Password reset

3. **Admin Features**
   - Create artwork
   - Update artwork
   - Delete artwork
   - Manage orders

### Medium Priority

1. **Search & Filter**
   - Search artworks
   - Filter by category
   - Filter by price

2. **Email Notifications**
   - Order confirmation
   - Shipping notification
   - Refund notification

3. **Form Validation**
   - Contact form
   - Inquiry form
   - Newsletter signup

### Low Priority

1. **UI Components**
   - Header navigation
   - Footer links
   - Modal dialogs

2. **Error Handling**
   - 404 pages
   - Error boundaries
   - API errors

## Jest Configuration

Create `jest.config.js`:
```javascript
const nextJest = require('next/jest')

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files
  dir: './',
})

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{js,jsx,ts,tsx}',
    '!src/**/__tests__/**',
  ],
}

module.exports = createJestConfig(customJestConfig)
```

Create `jest.setup.js`:
```javascript
import '@testing-library/jest-dom'
```

## Playwright Configuration

Create `playwright.config.ts`:
```typescript
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 13'] },
    },
  ],

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
})
```

## Running Tests

Add to `package.json`:
```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui"
  }
}
```

## Continuous Integration

### GitHub Actions

Create `.github/workflows/test.yml`:
```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Run unit tests
        run: npm test
        
      - name: Run E2E tests
        run: npm run test:e2e
        
      - name: Upload coverage
        uses: codecov/codecov-action@v3
```

## Mocking

### Mock Supabase

```typescript
jest.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        data: [{ id: 1, title: 'Test Artwork' }],
        error: null,
      })),
    })),
  }),
}))
```

### Mock Stripe

```typescript
jest.mock('stripe', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    paymentIntents: {
      create: jest.fn(() => ({
        id: 'pi_test123',
        client_secret: 'secret_test',
      })),
    },
  })),
}))
```

## Best Practices

1. **Write tests before fixing bugs**
2. **Keep tests simple and focused**
3. **Use descriptive test names**
4. **Don't test implementation details**
5. **Mock external dependencies**
6. **Run tests in CI/CD**
7. **Maintain test coverage above 80%**

## Resources

- [Jest Documentation](https://jestjs.io/)
- [React Testing Library](https://testing-library.com/react)
- [Playwright Documentation](https://playwright.dev/)
- [Next.js Testing](https://nextjs.org/docs/testing)
