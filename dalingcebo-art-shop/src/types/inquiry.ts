export type InquiryStatus = 'new' | 'contacted'
export type InquiryKind = 'artwork' | 'general'

export interface InquiryRecord {
  id: string
  kind: InquiryKind
  name: string
  email: string
  phone?: string
  message: string
  artworkId?: number
  artworkTitle?: string
  createdAt: string
  status: InquiryStatus
}

export interface InquiryInput {
  kind: InquiryKind
  name: string
  email: string
  phone?: string
  message: string
  artworkId?: number
  artworkTitle?: string
}

export type OrderStatus = 'new' | 'processing' | 'archived'

export interface OrderItemSummary {
  id: number
  title: string
  price: number
  quantity: number
}

export interface OrderRecord {
  id: string
  name: string
  email: string
  phone?: string
  address: string
  notes?: string
  items: OrderItemSummary[]
  total: number
  createdAt: string
  status: OrderStatus
}

export interface OrderInput {
  name: string
  email: string
  phone?: string
  address: string
  notes?: string
  items: OrderItemSummary[]
  total: number
}
