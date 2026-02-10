import jsPDF from 'jspdf'
import { Order, OrderItem, OrderInvoice } from '@/types/order'

interface InvoiceData {
  order: Order
  items: OrderItem[]
  invoice: Omit<OrderInvoice, 'id' | 'pdfUrl' | 'createdAt'>
  businessInfo: {
    name: string
    address: string
    phone: string
    email: string
    website: string
    vatNumber?: string
  }
}

export async function generateInvoicePDF(data: InvoiceData): Promise<Blob> {
  const { order, items, invoice, businessInfo } = data

  // Create PDF document
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  })

  const pageWidth = doc.internal.pageSize.width
  const pageHeight = doc.internal.pageSize.height
  const margin = 20

  // Header - Business Name
  doc.setFontSize(24)
  doc.setFont('helvetica', 'bold')
  doc.text(businessInfo.name.toUpperCase(), margin, margin)

  // Header - Business Details
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.text(businessInfo.address, margin, margin + 8)
  doc.text(`${businessInfo.phone} | ${businessInfo.email}`, margin, margin + 12)
  doc.text(businessInfo.website, margin, margin + 16)
  if (businessInfo.vatNumber) {
    doc.text(`VAT: ${businessInfo.vatNumber}`, margin, margin + 20)
  }

  // Invoice Title and Number
  doc.setFontSize(28)
  doc.setFont('helvetica', 'bold')
  doc.text('INVOICE', pageWidth - margin, margin, { align: 'right' })

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text(invoice.invoiceNumber, pageWidth - margin, margin + 10, { align: 'right' })
  doc.text(
    new Date(invoice.issuedAt).toLocaleDateString('en-ZA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }),
    pageWidth - margin,
    margin + 15,
    { align: 'right' }
  )

  // Invoice Type Badge
  let yPos = margin + 25
  doc.setFillColor(0, 0, 0)
  doc.rect(pageWidth - margin - 40, yPos - 5, 40, 8, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(8)
  doc.text(invoice.invoiceType.toUpperCase(), pageWidth - margin - 20, yPos, { align: 'center' })
  doc.setTextColor(0, 0, 0)

  // Customer Information
  yPos = margin + 45
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.text('BILL TO:', margin, yPos)

  doc.setFont('helvetica', 'normal')
  yPos += 6
  doc.text(order.customerName, margin, yPos)
  yPos += 5
  doc.text(order.customerEmail, margin, yPos)
  if (order.customerPhone) {
    yPos += 5
    doc.text(order.customerPhone, margin, yPos)
  }

  // Shipping Address
  yPos += 8
  doc.setFont('helvetica', 'bold')
  doc.text('SHIP TO:', margin, yPos)

  doc.setFont('helvetica', 'normal')
  yPos += 6
  doc.text(order.shippingName, margin, yPos)
  yPos += 5
  doc.text(order.shippingAddress, margin, yPos)
  yPos += 5
  doc.text(`${order.shippingCity}, ${order.shippingProvince} ${order.shippingPostalCode}`, margin, yPos)
  yPos += 5
  doc.text(order.shippingCountry, margin, yPos)

  // Order Information (Right Column)
  let rightYPos = margin + 45
  doc.setFont('helvetica', 'bold')
  doc.text('ORDER NUMBER:', pageWidth - margin - 50, rightYPos)
  doc.setFont('helvetica', 'normal')
  doc.text(order.orderNumber, pageWidth - margin, rightYPos, { align: 'right' })

  rightYPos += 6
  doc.setFont('helvetica', 'bold')
  doc.text('ORDER DATE:', pageWidth - margin - 50, rightYPos)
  doc.setFont('helvetica', 'normal')
  doc.text(
    new Date(order.createdAt).toLocaleDateString('en-ZA'),
    pageWidth - margin,
    rightYPos,
    { align: 'right' }
  )

  if (invoice.dueDate) {
    rightYPos += 6
    doc.setFont('helvetica', 'bold')
    doc.text('DUE DATE:', pageWidth - margin - 50, rightYPos)
    doc.setFont('helvetica', 'normal')
    doc.text(
      new Date(invoice.dueDate).toLocaleDateString('en-ZA'),
      pageWidth - margin,
      rightYPos,
      { align: 'right' }
    )
  }

  // Items Table
  yPos = Math.max(yPos, rightYPos) + 15

  // Table Header
  doc.setFillColor(0, 0, 0)
  doc.rect(margin, yPos, pageWidth - 2 * margin, 8, 'F')

  doc.setTextColor(255, 255, 255)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  doc.text('ITEM', margin + 2, yPos + 5.5)
  doc.text('QTY', pageWidth - margin - 60, yPos + 5.5, { align: 'right' })
  doc.text('PRICE', pageWidth - margin - 35, yPos + 5.5, { align: 'right' })
  doc.text('TOTAL', pageWidth - margin - 2, yPos + 5.5, { align: 'right' })

  doc.setTextColor(0, 0, 0)
  doc.setFont('helvetica', 'normal')

  // Table Rows
  yPos += 12
  items.forEach((item, index) => {
    if (yPos > pageHeight - 80) {
      doc.addPage()
      yPos = margin
    }

    // Item name and artist
    doc.setFont('helvetica', 'bold')
    doc.text(item.title, margin + 2, yPos)
    yPos += 4
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    doc.text(`by ${item.artist}`, margin + 2, yPos)

    // Variant selections
    if (item.variantSelections) {
      if (item.variantSelections.frameVariantName) {
        yPos += 4
        doc.text(`Frame: ${item.variantSelections.frameVariantName}`, margin + 2, yPos)
      }
      if (item.variantSelections.canvasVariantName) {
        yPos += 4
        doc.text(`Canvas: ${item.variantSelections.canvasVariantName}`, margin + 2, yPos)
      }
    }

    doc.setFontSize(9)

    // Quantity
    const rowTop = yPos - 8
    doc.text(item.quantity.toString(), pageWidth - margin - 60, rowTop, { align: 'right' })

    // Price
    doc.text(`R${item.price.toFixed(2)}`, pageWidth - margin - 35, rowTop, { align: 'right' })

    // Total
    doc.text(
      `R${(item.price * item.quantity).toFixed(2)}`,
      pageWidth - margin - 2,
      rowTop,
      { align: 'right' }
    )

    yPos += 8
    doc.setDrawColor(220, 220, 220)
    doc.line(margin, yPos, pageWidth - margin, yPos)
    yPos += 5
  })

  // Summary Section
  yPos += 10
  const summaryX = pageWidth - margin - 70

  doc.setFont('helvetica', 'normal')
  doc.text('Subtotal:', summaryX, yPos)
  doc.text(`R${order.subtotal.toFixed(2)}`, pageWidth - margin - 2, yPos, { align: 'right' })

  yPos += 6
  doc.text('Shipping:', summaryX, yPos)
  doc.text(`R${order.shippingCost.toFixed(2)}`, pageWidth - margin - 2, yPos, { align: 'right' })

  yPos += 6
  doc.text('VAT (15%):', summaryX, yPos)
  doc.text(`R${order.taxAmount.toFixed(2)}`, pageWidth - margin - 2, yPos, { align: 'right' })

  // Total
  yPos += 8
  doc.setDrawColor(0, 0, 0)
  doc.line(summaryX, yPos - 2, pageWidth - margin, yPos - 2)

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.text('TOTAL:', summaryX, yPos + 4)
  doc.text(`R${invoice.amount.toFixed(2)}`, pageWidth - margin - 2, yPos + 4, { align: 'right' })

  // Payment Information
  if (order.paymentType === 'deposit' && order.depositAmount) {
    yPos += 12
    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    doc.text('Deposit Paid:', summaryX, yPos)
    doc.text(`R${order.depositAmount.toFixed(2)}`, pageWidth - margin - 2, yPos, { align: 'right' })

    if (order.balanceDue && order.balanceDue > 0) {
      yPos += 6
      doc.setFont('helvetica', 'bold')
      doc.text('Balance Due:', summaryX, yPos)
      doc.text(`R${order.balanceDue.toFixed(2)}`, pageWidth - margin - 2, yPos, { align: 'right' })
    }
  }

  // Footer
  const footerY = pageHeight - 20
  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(128, 128, 128)
  doc.text(
    'Thank you for your purchase. For any queries, please contact us.',
    pageWidth / 2,
    footerY,
    { align: 'center' }
  )

  // Convert to Blob
  return doc.output('blob')
}
