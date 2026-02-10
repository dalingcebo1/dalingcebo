import { createServiceRoleClient } from '@/lib/db/supabase'
import { Database } from '@/lib/db/schema'
import {
  InquiryInput,
  InquiryRecord,
  InquiryStatus,
  OrderInput,
  OrderRecord,
  OrderStatus,
} from '@/types/inquiry'

// Helper to map DB inquiry to InquiryRecord
function mapDbInquiryToRecord(dbInquiry: any): InquiryRecord {
  return {
    id: dbInquiry.id,
    kind: dbInquiry.kind,
    name: dbInquiry.name,
    email: dbInquiry.email,
    phone: dbInquiry.phone,
    message: dbInquiry.message,
    artworkId: dbInquiry.artwork_id,
    artworkTitle: dbInquiry.artwork_title,
    createdAt: dbInquiry.created_at,
    status: dbInquiry.status
  }
}

export async function listInquiries(): Promise<InquiryRecord[]> {
  const supabase = createServiceRoleClient()
  
  const { data, error } = await supabase
    .from('inquiries')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching inquiries:', error)
    return []
  }

  return data.map(mapDbInquiryToRecord)
}

export async function recordInquiry(input: InquiryInput): Promise<InquiryRecord> {
  const supabase = createServiceRoleClient()

  const { data, error } = await supabase
    .from('inquiries')
    .insert({
      kind: input.kind,
      name: input.name,
      email: input.email,
      phone: input.phone || null,
      message: input.message,
      artwork_id: input.artworkId || null,
      artwork_title: input.artworkTitle || null,
      status: 'new'
    })
    .select()
    .single()

  if (error) throw new Error(error.message)
  return mapDbInquiryToRecord(data)
}

// Helper to map DB order to OrderRecord
function mapDbOrderToRecord(dbOrder: any): OrderRecord {
  let status: OrderStatus = 'new'
  if (['processing', 'paid', 'deposit_paid'].includes(dbOrder.status)) status = 'processing'
  if (['shipped', 'delivered', 'cancelled'].includes(dbOrder.status)) status = 'archived'

  return {
    id: dbOrder.id,
    name: dbOrder.customer_name,
    email: dbOrder.customer_email,
    phone: dbOrder.customer_phone,
    address: dbOrder.shipping_address,
    notes: dbOrder.notes,
    items: dbOrder.items?.map((item: any) => ({
      id: item.artwork_id || 0,
      title: item.title,
      price: Number(item.price),
      quantity: item.quantity
    })) || [],
    total: Number(dbOrder.total),
    createdAt: dbOrder.created_at,
    status
  }
}

export async function listOrders(): Promise<OrderRecord[]> {
  const supabase = createServiceRoleClient()
  
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      items:order_items(*)
    `)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching orders:', error)
    return []
  }

  return data.map(mapDbOrderToRecord)
}

export async function recordOrder(input: OrderInput): Promise<OrderRecord> {
  const supabase = createServiceRoleClient()
  
  // Try to link to existing customer
  const { data: customer } = await supabase
    .from('customers')
    .select('id')
    .eq('email', input.email)
    .single()

  // Generate a friendly order number
  const orderNumber = `ORD-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 1000)}`
  
  // Prepare order data matching schema constraints
  const orderData = {
    order_number: orderNumber,
    customer_id: customer?.id || null,
    customer_email: input.email,
    customer_name: input.name,
    customer_phone: input.phone || null,
    
    // Using default placeholders for address fields not currently collected individually
    shipping_name: input.name,
    shipping_address: input.address,
    shipping_city: 'Not Provided',
    shipping_province: 'Not Provided',
    shipping_postal_code: '0000',
    
    subtotal: input.total,
    total: input.total,
    payment_type: 'full' as const,
    status: 'pending_payment' as const,
    notes: input.notes
  }

  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert(orderData)
    .select()
    .single()

  if (orderError) throw new Error(`Order creation failed: ${orderError.message}`)

  // Insert items
  if (input.items.length > 0) {
    const itemsData = input.items.map(item => ({
      order_id: order.id,
      artwork_id: item.id, // Assuming item.id matches artwork_id
      title: item.title,
      artist: 'Dalingcebo', // Default or fetch if known
      price: item.price,
      quantity: item.quantity
    }))

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(itemsData)

    if (itemsError) console.error('Error saving items:', itemsError)
  }

  // Fetch complete record with items
  const { data: completeOrder } = await supabase
    .from('orders')
    .select('*, items:order_items(*)')
    .eq('id', order.id)
    .single()

  return mapDbOrderToRecord(completeOrder || order)
}

export async function updateInquiryStatus(id: string, status: InquiryStatus): Promise<InquiryRecord> {
  const supabase = createServiceRoleClient()

  const { data, error } = await supabase
    .from('inquiries')
    .update({ status })
    .eq('id', id)
    .select()
    .single()

  if (error) throw new Error(error.message)
  return mapDbInquiryToRecord(data)
}

export async function updateOrderStatus(id: string, status: OrderStatus): Promise<OrderRecord> {
  const supabase = createServiceRoleClient()
  
  // Map simple status to DB status
  let dbStatus: Database['public']['Tables']['orders']['Update']['status'] = 'pending_payment'
  if (status === 'processing') dbStatus = 'processing'
  if (status === 'archived') dbStatus = 'paid' // 'archived' maps to 'paid'/'delivered' in DB for now

  const { data, error } = await supabase
    .from('orders')
    .update({ status: dbStatus })
    .eq('id', id)
    .select('*, items:order_items(*)')
    .single()

  if (error) throw new Error(error.message)
  return mapDbOrderToRecord(data)
}
