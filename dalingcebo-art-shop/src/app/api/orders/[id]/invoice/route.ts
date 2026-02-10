import { NextRequest, NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/db/supabase'
import { generateInvoicePDF } from '@/lib/invoice-generator'

type RouteContext = {
  params: Promise<{ id: string }>
}

// GET /api/orders/[id]/invoice - Generate or retrieve invoice
export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params
    const searchParams = request.nextUrl.searchParams
    const regenerate = searchParams.get('regenerate') === 'true'

    const supabase = createServiceRoleClient()

    // Get order with items
    const { data: order, error: orderError } = await (supabase
      .from('orders') as any)
      .select('*')
      .eq('id', id)
      .single()

    if (orderError || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    const { data: items, error: itemsError } = await (supabase
      .from('order_items') as any)
      .select('*')
      .eq('order_id', id)

    if (itemsError) throw itemsError

    // Check for existing invoice
    const { data: existingInvoice } = await (supabase
      .from('order_invoices') as any)
      .select('*')
      .eq('order_id', id)
      .eq('invoice_type', 'final')
      .single()

    if (existingInvoice && !regenerate && existingInvoice.pdf_url) {
      // Return existing invoice URL
      return NextResponse.json({ 
        invoice: existingInvoice,
        url: existingInvoice.pdf_url 
      })
    }

    // Determine invoice type and amount
    let invoiceType: 'proforma' | 'final' | 'deposit' | 'balance' = 'final'
    let amount = order.total

    if (order.payment_type === 'deposit') {
      if (order.payment_status === 'deposit_paid' && order.balance_due && order.balance_due > 0) {
        invoiceType = 'balance'
        amount = order.balance_due
      } else if (order.payment_status === 'pending') {
        invoiceType = 'deposit'
        amount = order.deposit_amount || order.total
      }
    } else if (order.payment_type === 'invoice') {
      invoiceType = 'proforma'
    }

    // Generate invoice number if creating new
    const { data: invoiceNumberData } = await supabase
      .rpc('generate_invoice_number')

    const invoiceNumber = invoiceNumberData || `DCINV-${Date.now()}`

    // Generate PDF
    const pdfBlob = await generateInvoicePDF({
      order: order as any,
      items: items as any,
      invoice: {
        orderId: id,
        invoiceNumber,
        invoiceType,
        amount,
        currency: 'ZAR',
        issuedAt: new Date().toISOString(),
        dueDate: order.balance_due_by || undefined,
        paidAt: order.payment_status === 'paid' ? new Date().toISOString() : undefined
      },
      businessInfo: {
        name: 'Dalingcebo Art',
        address: 'Johannesburg, South Africa',
        phone: '+27 (0) 60 123 4567',
        email: 'info@dalingcebo.art',
        website: 'www.dalingcebo.art'
      }
    })

    // Convert blob to buffer
    const buffer = Buffer.from(await pdfBlob.arrayBuffer())

    // Upload to Supabase Storage
    const fileName = `${invoiceNumber}.pdf`
    const { data: uploadData, error: uploadError } = await supabase
      .storage
      .from('invoices')
      .upload(fileName, buffer, {
        contentType: 'application/pdf',
        upsert: true
      })

    if (uploadError) {
      console.error('Error uploading invoice:', uploadError)
      // Return PDF directly if upload fails
      return new NextResponse(buffer, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${fileName}"`
        }
      })
    }

    // Get public URL
    const { data: urlData } = supabase
      .storage
      .from('invoices')
      .getPublicUrl(fileName)

    const pdfUrl = urlData.publicUrl

    // Save invoice record
    const { data: invoiceRecord, error: invoiceError } = await (supabase
      .from('order_invoices') as any)
      .upsert({
        id: existingInvoice?.id,
        order_id: id,
        invoice_number: invoiceNumber,
        invoice_type: invoiceType,
        amount,
        currency: 'ZAR',
        pdf_url: pdfUrl,
        issued_at: new Date().toISOString(),
        due_date: order.balance_due_by,
        paid_at: order.payment_status === 'paid' ? new Date().toISOString() : null
      } as any)
      .select()
      .single()

    if (invoiceError) throw invoiceError

    return NextResponse.json({
      invoice: invoiceRecord,
      url: pdfUrl
    })
  } catch (error: unknown) {
    console.error('Error generating invoice:', error)
    return NextResponse.json(
      { error: 'Failed to generate invoice' },
      { status: 500 }
    )
  }
}
