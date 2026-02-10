export type OrderStatus = 
  | 'pending_payment'
  | 'deposit_paid'
  | 'paid'
  | 'reserved'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded';

export type PaymentStatus = 
  | 'pending'
  | 'deposit_paid'
  | 'paid'
  | 'failed'
  | 'refunded';

export type PaymentType = 'full' | 'deposit' | 'invoice';
export type PaymentMethod = 'yoco' | 'stripe' | 'bank_transfer' | 'none';

export interface OrderItem {
  id: string;
  orderId: string;
  artworkId?: number;
  title: string;
  artist: string;
  price: number;
  quantity: number;
  image?: string;
  variantSelections?: {
    frameVariantId?: string;
    canvasVariantId?: string;
    frameVariantName?: string;
    canvasVariantName?: string;
  };
  variantPriceAdjustment?: number;
  processingDays?: number;
  createdAt: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId?: string;
  customerEmail: string;
  customerName: string;
  customerPhone?: string;
  
  // Shipping
  shippingName: string;
  shippingPhone?: string;
  shippingAddress: string;
  shippingCity: string;
  shippingProvince: string;
  shippingPostalCode: string;
  shippingCountry: string;
  
  // Financial
  subtotal: number;
  shippingCost: number;
  taxAmount: number;
  total: number;
  
  // Payment
  paymentType: PaymentType;
  paymentMethod?: PaymentMethod;
  paymentStatus: PaymentStatus;
  
  // Deposit
  depositAmount?: number;
  depositPercentage?: number;
  balanceDue?: number;
  balanceDueBy?: string;
  
  // Status
  status: OrderStatus;
  
  // Processing & Fulfillment
  estimatedProcessingDays?: number;
  estimatedShipDate?: string;
  estimatedDeliveryDate?: string;
  actualProcessingDays?: number;
  processingStartedAt?: string;
  processingCompletedAt?: string;
  trackingNumber?: string;
  shippedAt?: string;
  deliveredAt?: string;
  
  // Notes
  notes?: string;
  adminNotes?: string;
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
  cancelledAt?: string;
  reservationExpiresAt?: string;
  
  // Relations
  items?: OrderItem[];
  invoices?: OrderInvoice[];
  statusHistory?: OrderStatusHistory[];
  updates?: OrderUpdate[];
}

export type InvoiceType = 'proforma' | 'final' | 'deposit' | 'balance';

export interface OrderInvoice {
  id: string;
  orderId: string;
  invoiceNumber: string;
  invoiceType: InvoiceType;
  amount: number;
  currency: string;
  pdfUrl?: string;
  issuedAt: string;
  dueDate?: string;
  paidAt?: string;
  createdAt: string;
}

export interface OrderStatusHistory {
  id: string;
  orderId: string;
  status: string;
  paymentStatus?: string;
  note?: string;
  createdBy: string; // 'system' or admin email
  createdAt: string;
}

export type OrderUpdateType = 'payment' | 'shipping' | 'production' | 'general';

export interface OrderUpdate {
  id: string;
  orderId: string;
  updateType: OrderUpdateType;
  title: string;
  message: string;
  isCustomerVisible: boolean;
  createdAt: string;
}
