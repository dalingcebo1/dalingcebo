// Checkout calculation utilities

export interface CheckoutCalculation {
  subtotal: number
  shipping: number
  tax: number
  total: number
}

export interface DepositCalculation extends CheckoutCalculation {
  depositPercentage: 30 | 40 | 50
  depositAmount: number
  balanceDue: number
  balanceDueBy: Date
  reservationExpiresAt: Date
}

/**
 * Calculate shipping cost based on subtotal and destination
 */
export function calculateShipping(subtotal: number, country: string = 'South Africa'): number {
  const FREE_SHIPPING_THRESHOLD = parseFloat(process.env.FREE_SHIPPING_THRESHOLD || '5000')
  const FLAT_SHIPPING_RATE = parseFloat(process.env.FLAT_SHIPPING_RATE || '150')
  const INTERNATIONAL_SHIPPING_RATE = parseFloat(process.env.INTERNATIONAL_SHIPPING_RATE || '500')

  // Free shipping over threshold
  if (subtotal >= FREE_SHIPPING_THRESHOLD) {
    return 0
  }

  // International shipping
  if (country !== 'South Africa') {
    return INTERNATIONAL_SHIPPING_RATE
  }

  // Domestic flat rate
  return FLAT_SHIPPING_RATE
}

/**
 * Calculate VAT (South African tax)
 */
export function calculateVAT(amount: number): number {
  const VAT_RATE = parseFloat(process.env.VAT_RATE || '0.15')
  return Math.round(amount * VAT_RATE * 100) / 100
}

/**
 * Calculate full checkout total
 */
export function calculateCheckoutTotal(
  subtotal: number,
  country: string = 'South Africa'
): CheckoutCalculation {
  const shipping = calculateShipping(subtotal, country)
  const tax = calculateVAT(subtotal + shipping)
  const total = subtotal + shipping + tax

  return {
    subtotal: Math.round(subtotal * 100) / 100,
    shipping: Math.round(shipping * 100) / 100,
    tax: Math.round(tax * 100) / 100,
    total: Math.round(total * 100) / 100,
  }
}

/**
 * Calculate deposit payment details
 */
export function calculateDeposit(
  subtotal: number,
  depositPercentage: 30 | 40 | 50,
  country: string = 'South Africa'
): DepositCalculation {
  const shipping = calculateShipping(subtotal, country)
  const baseAmount = subtotal + shipping
  const tax = calculateVAT(baseAmount)
  const total = baseAmount + tax

  const depositAmount = Math.round((total * depositPercentage) / 100 * 100) / 100
  const balanceDue = Math.round((total - depositAmount) * 100) / 100

  // Calculate due date (14 days from now, configurable)
  const reservationDays = parseInt(process.env.DEPOSIT_RESERVATION_DAYS || '14')
  const balanceDueBy = new Date()
  balanceDueBy.setDate(balanceDueBy.getDate() + reservationDays)

  const reservationExpiresAt = new Date(balanceDueBy)

  return {
    subtotal: Math.round(subtotal * 100) / 100,
    shipping: Math.round(shipping * 100) / 100,
    tax: Math.round(tax * 100) / 100,
    total: Math.round(total * 100) / 100,
    depositPercentage,
    depositAmount,
    balanceDue,
    balanceDueBy,
    reservationExpiresAt,
  }
}

/**
 * Format currency (ZAR)
 */
export function formatCurrency(amount: number, currency: string = 'ZAR'): string {
  return new Intl.NumberFormat('en-ZA', {
    style: 'currency',
    currency,
  }).format(amount)
}

/**
 * Validate deposit percentage
 */
export function isValidDepositPercentage(percentage: number): percentage is 30 | 40 | 50 {
  return [30, 40, 50].includes(percentage)
}
