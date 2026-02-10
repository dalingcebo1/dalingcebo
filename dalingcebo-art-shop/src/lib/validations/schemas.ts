import { z } from 'zod'

const phoneRegex = /^[+()\-\d\s\.]{7,}$/

const preprocessString = (value: unknown) => {
  if (typeof value !== 'string') return value
  const trimmed = value.trim()
  return trimmed.length === 0 ? undefined : trimmed
}

const nameSchema = z
  .string({ message: 'Name is required' })
  .trim()
  .min(2, 'Name is required')

const emailSchema = z
  .string({ message: 'Email is required' })
  .trim()
  .email('Valid email is required')

const messageSchema = z
  .string({ message: 'Message is required' })
  .trim()
  .min(10, 'Message must be at least 10 characters')

const addressSchema = z
  .string({ message: 'Address is required' })
  .trim()
  .min(10, 'Address must be at least 10 characters')

const optionalTextSchema = z
  .string()
  .optional()

const optionalPhoneSchema = z
  .string()
  .optional()
  .refine((value) => !value || phoneRegex.test(value), 'Enter a valid phone number')

const inquiryKindSchema = z.enum(['artwork', 'general'])

export const contactFormSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  subject: z.enum(['purchase', 'commission', 'press', 'other'], {
    message: 'Please select a subject',
  }),
  message: messageSchema,
})

const baseInquirySchema = z.object({
  name: nameSchema,
  email: emailSchema,
  phone: optionalPhoneSchema,
  message: messageSchema,
})

export const inquiryFormSchema = baseInquirySchema

export const inquiryPayloadSchema = baseInquirySchema.extend({
  kind: inquiryKindSchema,
  artworkId: z.number().int().positive().optional(),
  artworkTitle: optionalTextSchema,
})

const baseCheckoutSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  phone: optionalPhoneSchema,
  address: addressSchema,
  notes: optionalTextSchema,
})

export const checkoutFormSchema = baseCheckoutSchema

const orderItemSchema = z.object({
  id: z.number().int().positive('Invalid artwork identifier'),
  title: z.string({ message: 'Artwork title is required' }).trim().min(1, 'Artwork title is required'),
  price: z.number().positive('Invalid item price'),
  quantity: z.number().int().positive('Invalid item quantity'),
})

export const orderPayloadSchema = baseCheckoutSchema.extend({
  items: z.array(orderItemSchema).min(1, 'At least one item is required'),
  total: z.number().positive('Invalid total'),
})

export const newsletterSchema = z.object({
  email: emailSchema,
})

export const authEmailSchema = z.object({
  email: emailSchema,
})

export type ContactFormValues = z.infer<typeof contactFormSchema>
export type InquiryFormValues = z.infer<typeof inquiryFormSchema>
export type CheckoutFormValues = z.infer<typeof checkoutFormSchema>
export type InquiryPayload = z.infer<typeof inquiryPayloadSchema>
export type OrderPayload = z.infer<typeof orderPayloadSchema>
export type NewsletterFormValues = z.infer<typeof newsletterSchema>
export type AuthEmailFormValues = z.infer<typeof authEmailSchema>
