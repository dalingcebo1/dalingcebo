// Email utility for sending transactional emails
// Uses Resend API - set RESEND_API_KEY in environment variables

import { Order, OrderItem } from '@/types/order'
import { Artwork } from '@/types/artwork'

interface EmailOptions {
  to: string
  subject: string
  html: string
}

export async function sendEmail({ to, subject, html }: EmailOptions) {
  const resendApiKey = process.env.RESEND_API_KEY

  if (!resendApiKey) {
    console.warn('RESEND_API_KEY not set, email not sent:', { to, subject })
    return { success: false, error: 'Email service not configured' }
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${resendApiKey}`
      },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM || 'Dalingcebo Art <orders@dalingcebo.art>',
        to,
        subject,
        html
      })
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || 'Failed to send email')
    }

    console.log('Email sent successfully:', { to, subject, id: data.id })
    return { success: true, id: data.id }
  } catch (error: any) {
    console.error('Error sending email:', error)
    return { success: false, error: error.message }
  }
}

// Email Templates

export function orderConfirmationEmail(order: Order, items: OrderItem[]) {
  const itemsHtml = items.map(item => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">
        <strong>${item.title}</strong><br/>
        <span style="color: #6b7280; font-size: 14px;">by ${item.artist}</span>
        ${item.variantSelections ? `
          <br/>
          <span style="color: #6b7280; font-size: 13px;">
            ${item.variantSelections.frameVariantName ? `Frame: ${item.variantSelections.frameVariantName}` : ''}
            ${item.variantSelections.canvasVariantName ? ` • Canvas: ${item.variantSelections.canvasVariantName}` : ''}
          </span>
        ` : ''}
      </td>
      <td style="padding: 12px; text-align: center; border-bottom: 1px solid #e5e7eb;">${item.quantity}</td>
      <td style="padding: 12px; text-align: right; border-bottom: 1px solid #e5e7eb;">R${(item.price * item.quantity).toFixed(2)}</td>
    </tr>
  `).join('')

  return {
    subject: `Order Confirmation - ${order.orderNumber}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif; line-height: 1.6; color: #1f2937; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 32px;">
          <h1 style="font-size: 32px; font-weight: bold; letter-spacing: 2px; margin: 0;">DALINGCEBO</h1>
          <p style="color: #6b7280; margin-top: 8px;">Contemporary Art Gallery</p>
        </div>

        <div style="background-color: #000; color: #fff; padding: 24px; text-align: center; margin-bottom: 32px;">
          <h2 style="margin: 0; font-size: 24px; letter-spacing: 1px;">ORDER CONFIRMED</h2>
          <p style="margin-top: 8px; opacity: 0.9;">Order ${order.orderNumber}</p>
        </div>

        <p>Dear ${order.customerName},</p>

        <p>Thank you for your order! We've received your ${order.paymentType === 'deposit' ? 'deposit payment' : 'payment'} and your artwork is being prepared.</p>

        ${order.estimatedShipDate ? `
          <div style="background-color: #f3f4f6; padding: 16px; margin: 24px 0; border-left: 4px solid #000;">
            <strong>Estimated Ship Date:</strong> ${new Date(order.estimatedShipDate).toLocaleDateString('en-ZA', { year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
        ` : ''}

        <h3 style="margin-top: 32px;">Order Details</h3>

        <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
          <thead>
            <tr style="background-color: #f9fafb;">
              <th style="padding: 12px; text-align: left; border-bottom: 2px solid #e5e7eb;">Item</th>
              <th style="padding: 12px; text-align: center; border-bottom: 2px solid #e5e7eb;">Qty</th>
              <th style="padding: 12px; text-align: right; border-bottom: 2px solid #e5e7eb;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>

        <table style="width: 100%; margin-top: 24px;">
          <tr>
            <td style="padding: 8px; text-align: right;">Subtotal:</td>
            <td style="padding: 8px; text-align: right; width: 100px;">R${order.subtotal.toFixed(2)}</td>
          </tr>
          <tr>
            <td style="padding: 8px; text-align: right;">Shipping:</td>
            <td style="padding: 8px; text-align: right;">R${order.shippingCost.toFixed(2)}</td>
          </tr>
          <tr>
            <td style="padding: 8px; text-align: right;">VAT (15%):</td>
            <td style="padding: 8px; text-align: right;">R${order.taxAmount.toFixed(2)}</td>
          </tr>
          <tr style="border-top: 2px solid #000;">
            <td style="padding: 12px; text-align: right; font-weight: bold; font-size: 18px;">TOTAL:</td>
            <td style="padding: 12px; text-align: right; font-weight: bold; font-size: 18px;">R${order.total.toFixed(2)}</td>
          </tr>
          ${order.paymentType === 'deposit' && order.depositAmount ? `
            <tr>
              <td style="padding: 8px; text-align: right; color: #059669;">Deposit Paid:</td>
              <td style="padding: 8px; text-align: right; color: #059669;">R${order.depositAmount.toFixed(2)}</td>
            </tr>
            ${order.balanceDue && order.balanceDue > 0 ? `
              <tr>
                <td style="padding: 8px; text-align: right; font-weight: bold;">Balance Due:</td>
                <td style="padding: 8px; text-align: right; font-weight: bold;">R${order.balanceDue.toFixed(2)}</td>
              </tr>
            ` : ''}
          ` : ''}
        </table>

        <h3 style="margin-top: 32px;">Shipping Address</h3>
        <p>
          ${order.shippingName}<br/>
          ${order.shippingAddress}<br/>
          ${order.shippingCity}, ${order.shippingProvince} ${order.shippingPostalCode}<br/>
          ${order.shippingCountry}
        </p>

        <div style="margin-top: 40px; padding-top: 24px; border-top: 1px solid #e5e7eb; text-align: center; color: #6b7280; font-size: 14px;">
          <p>Track your order: <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'https://dalingcebo.art'}/orders/track?email=${encodeURIComponent(order.customerEmail)}&orderNumber=${order.orderNumber}" style="color: #000;">Click here</a></p>
          <p>Questions? Reply to this email or contact us at info@dalingcebo.art</p>
        </div>
      </body>
      </html>
    `
  }
}

export function orderShippedEmail(order: Order, trackingNumber?: string) {
  return {
    subject: `Your Order Has Shipped - ${order.orderNumber}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif; line-height: 1.6; color: #1f2937; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 32px;">
          <h1 style="font-size: 32px; font-weight: bold; letter-spacing: 2px; margin: 0;">DALINGCEBO</h1>
        </div>

        <div style="background-color: #10b981; color: #fff; padding: 24px; text-align: center; margin-bottom: 32px;">
          <div style="font-size: 48px; margin-bottom: 8px;">📦</div>
          <h2 style="margin: 0; font-size: 24px;">YOUR ORDER HAS SHIPPED!</h2>
        </div>

        <p>Dear ${order.customerName},</p>

        <p>Great news! Your order <strong>${order.orderNumber}</strong> has been shipped and is on its way to you.</p>

        ${trackingNumber ? `
          <div style="background-color: #f3f4f6; padding: 16px; margin: 24px 0; text-align: center;">
            <p style="margin: 0; color: #6b7280; font-size: 14px;">TRACKING NUMBER</p>
            <p style="margin: 8px 0 0 0; font-family: 'Courier New', monospace; font-size: 18px; font-weight: bold;">${trackingNumber}</p>
          </div>
        ` : ''}

        ${order.estimatedDeliveryDate ? `
          <p><strong>Estimated Delivery:</strong> ${new Date(order.estimatedDeliveryDate).toLocaleDateString('en-ZA', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        ` : ''}

        <p>Your artwork has been carefully packaged to ensure it arrives in perfect condition.</p>

        <div style="margin-top: 40px; padding-top: 24px; border-top: 1px solid #e5e7eb; text-align: center; color: #6b7280; font-size: 14px;">
          <p>Thank you for supporting Dalingcebo Art!</p>
        </div>
      </body>
      </html>
    `
  }
}

export function balanceDueReminderEmail(order: Order) {
  return {
    subject: `Balance Payment Due - ${order.orderNumber}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif; line-height: 1.6; color: #1f2937; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 32px;">
          <h1 style="font-size: 32px; font-weight: bold; letter-spacing: 2px; margin: 0;">DALINGCEBO</h1>
        </div>

        <div style="background-color: #f59e0b; color: #fff; padding: 24px; text-align: center; margin-bottom: 32px;">
          <h2 style="margin: 0; font-size: 24px;">BALANCE PAYMENT REMINDER</h2>
          <p style="margin-top: 8px;">Order ${order.orderNumber}</p>
        </div>

        <p>Dear ${order.customerName},</p>

        <p>This is a reminder that the balance payment for your order is due${order.balanceDueBy ? ` by ${new Date(order.balanceDueBy).toLocaleDateString('en-ZA', { year: 'numeric', month: 'long', day: 'numeric' })}` : ''}.</p>

        <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; margin: 24px 0;">
          <p style="margin: 0; font-size: 14px; color: #92400e;"><strong>Amount Due:</strong></p>
          <p style="margin: 8px 0 0 0; font-size: 28px; font-weight: bold; color: #000;">R${order.balanceDue?.toFixed(2)}</p>
        </div>

        <p>Once we receive your payment, we'll complete the preparation and ship your artwork.</p>

        <p>Please contact us if you need to arrange alternative payment terms.</p>

        <div style="margin-top: 40px; padding-top: 24px; border-top: 1px solid #e5e7eb; text-align: center; color: #6b7280; font-size: 14px;">
          <p>Questions? Contact us at info@dalingcebo.art</p>
        </div>
      </body>
      </html>
    `
  }
}

// Inquiry Email Templates

export function sendEnquiryReceived(customerEmail: string, customerName: string, artworkTitle?: string) {
  return sendEmail({
    to: customerEmail,
    subject: artworkTitle ? `Inquiry Received - ${artworkTitle}` : 'Inquiry Received',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif; line-height: 1.6; color: #1f2937; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 32px;">
          <h1 style="font-size: 32px; font-weight: bold; letter-spacing: 2px; margin: 0;">DALINGCEBO</h1>
          <p style="color: #6b7280; margin-top: 8px;">Contemporary Art Gallery</p>
        </div>

        <div style="background-color: #000; color: #fff; padding: 24px; text-align: center; margin-bottom: 32px;">
          <h2 style="margin: 0; font-size: 24px; letter-spacing: 1px;">INQUIRY RECEIVED</h2>
        </div>

        <p>Dear ${customerName},</p>

        <p>Thank you for your inquiry${artworkTitle ? ` about <strong>"${artworkTitle}"</strong>` : ''}. We have received your message and will respond within 48 hours.</p>

        <p>Our team is reviewing your request and will get back to you shortly with the information you need.</p>

        <div style="margin-top: 40px; padding-top: 24px; border-top: 1px solid #e5e7eb; text-align: center; color: #6b7280; font-size: 14px;">
          <p>Questions? Reply to this email or contact us at info@dalingcebo.art</p>
        </div>
      </body>
      </html>
    `
  })
}

export function sendPreorderConfirmation(artwork: Artwork, customerEmail: string, customerName: string) {
  const reservedUntil = artwork.reservedUntil 
    ? new Date(artwork.reservedUntil).toLocaleDateString('en-ZA', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })
    : '48 hours'

  return sendEmail({
    to: customerEmail,
    subject: `Reservation Confirmed - ${artwork.title}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif; line-height: 1.6; color: #1f2937; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 32px;">
          <h1 style="font-size: 32px; font-weight: bold; letter-spacing: 2px; margin: 0;">DALINGCEBO</h1>
          <p style="color: #6b7280; margin-top: 8px;">Contemporary Art Gallery</p>
        </div>

        <div style="background-color: #10b981; color: #fff; padding: 24px; text-align: center; margin-bottom: 32px;">
          <div style="font-size: 48px; margin-bottom: 8px;">✓</div>
          <h2 style="margin: 0; font-size: 24px;">RESERVATION CONFIRMED</h2>
        </div>

        <p>Dear ${customerName},</p>

        <p>Great news! We have successfully reserved <strong>"${artwork.title}"</strong> for you.</p>

        <div style="background-color: #f3f4f6; padding: 20px; margin: 24px 0; border-left: 4px solid #10b981;">
          <h3 style="margin: 0 0 12px 0; font-size: 16px;">Artwork Details</h3>
          <p style="margin: 4px 0;"><strong>Title:</strong> ${artwork.title}</p>
          <p style="margin: 4px 0;"><strong>Artist:</strong> ${artwork.artist}</p>
          <p style="margin: 4px 0;"><strong>Price:</strong> R${artwork.price.toFixed(2)}</p>
          <p style="margin: 4px 0;"><strong>Reserved Until:</strong> ${reservedUntil}</p>
        </div>

        <p><strong>Next Steps:</strong></p>
        <ol style="line-height: 1.8;">
          <li>Our team will prepare a detailed invoice with payment options</li>
          <li>You'll receive the invoice within 24 hours</li>
          <li>The artwork is held exclusively for you for 48 hours</li>
          <li>Complete payment to finalize your purchase</li>
        </ol>

        <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; margin: 24px 0;">
          <p style="margin: 0; font-size: 14px;"><strong>Important:</strong> This reservation will automatically expire on ${reservedUntil}. Please watch for our invoice email to complete your purchase.</p>
        </div>

        <div style="margin-top: 40px; padding-top: 24px; border-top: 1px solid #e5e7eb; text-align: center; color: #6b7280; font-size: 14px;">
          <p>Questions? Reply to this email or contact us at info@dalingcebo.art</p>
        </div>
      </body>
      </html>
    `
  })
}

export function sendAdminPreorderAlert(artwork: Artwork, customerEmail: string, customerName: string, customerMessage: string) {
  const adminEmail = process.env.ADMIN_EMAIL || 'info@dalingcebo.art'
  const reservedUntil = artwork.reservedUntil 
    ? new Date(artwork.reservedUntil).toLocaleDateString('en-ZA', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })
    : '48 hours from now'

  return sendEmail({
    to: adminEmail,
    subject: `⚠️ ACTION REQUIRED: Reservation Placed - ${artwork.title}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif; line-height: 1.6; color: #1f2937; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 32px;">
          <h1 style="font-size: 32px; font-weight: bold; letter-spacing: 2px; margin: 0;">DALINGCEBO</h1>
          <p style="color: #6b7280; margin-top: 8px;">Admin Alert</p>
        </div>

        <div style="background-color: #f59e0b; color: #fff; padding: 24px; text-align: center; margin-bottom: 32px;">
          <div style="font-size: 48px; margin-bottom: 8px;">⚠️</div>
          <h2 style="margin: 0; font-size: 24px;">SOFT HOLD PLACED</h2>
        </div>

        <div style="background-color: #fee2e2; border-left: 4px solid #dc2626; padding: 16px; margin: 24px 0;">
          <p style="margin: 0; font-weight: bold; color: #dc2626;">ACTION REQUIRED</p>
          <p style="margin: 8px 0 0 0;">A customer has placed a reservation. Send invoice or release hold before expiration.</p>
        </div>

        <h3>Artwork Information</h3>
        <div style="background-color: #f3f4f6; padding: 16px; margin: 16px 0;">
          <p style="margin: 4px 0;"><strong>Artwork:</strong> ${artwork.title}</p>
          <p style="margin: 4px 0;"><strong>Artist:</strong> ${artwork.artist}</p>
          <p style="margin: 4px 0;"><strong>Price:</strong> R${artwork.price.toFixed(2)}</p>
          <p style="margin: 4px 0;"><strong>ID:</strong> #${artwork.id}</p>
        </div>

        <h3>Customer Information</h3>
        <div style="background-color: #f3f4f6; padding: 16px; margin: 16px 0;">
          <p style="margin: 4px 0;"><strong>Name:</strong> ${customerName}</p>
          <p style="margin: 4px 0;"><strong>Email:</strong> <a href="mailto:${customerEmail}">${customerEmail}</a></p>
          <p style="margin: 4px 0;"><strong>Reserved Until:</strong> ${reservedUntil}</p>
        </div>

        <h3>Customer Message</h3>
        <div style="background-color: #f9fafb; padding: 16px; margin: 16px 0; border: 1px solid #e5e7eb;">
          <p style="margin: 0; white-space: pre-wrap;">${customerMessage}</p>
        </div>

        <h3>Required Actions</h3>
        <ol style="line-height: 1.8;">
          <li><strong>Send Invoice:</strong> Prepare and send invoice to customer with payment details</li>
          <li><strong>Monitor Payment:</strong> Track payment status before reservation expires</li>
          <li><strong>Alternative:</strong> Release hold from admin dashboard if customer doesn't proceed</li>
        </ol>

        <div style="margin-top: 32px; text-align: center;">
          <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'https://dalingcebo.art'}/admin" style="display: inline-block; background-color: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
            Go to Admin Dashboard
          </a>
        </div>

        <div style="margin-top: 40px; padding-top: 24px; border-top: 1px solid #e5e7eb; text-align: center; color: #6b7280; font-size: 14px;">
          <p>This is an automated alert from Dalingcebo Art Shop</p>
        </div>
      </body>
      </html>
    `
  })
}
