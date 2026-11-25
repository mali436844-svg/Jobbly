import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().min(1, 'Please enter your email or username'),
  password: z.string().min(1, 'Please enter your password'),
})

export const registerSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  businessName: z.string().min(2, 'Business name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(4, 'Password must be at least 4 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})

export const adminLoginSchema = z.object({
  email: z.string().min(1, 'Please enter admin username or email'),
  password: z.string().min(1, 'Please enter admin password'),
})

export type AdminLoginFormData = z.infer<typeof adminLoginSchema>

export const clientSchema = z.object({
  full_name: z.string().min(1, 'Full name is required'),
  email: z.string().email('Invalid email').or(z.literal('')).optional(),
  phone: z.string().optional(),
  company_name: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zip: z.string().optional(),
})

export const jobSchema = z.object({
  title: z.string().min(1, 'Job title is required'),
  client_id: z.string().min(1, 'Client is required'),
  job_type: z.enum(['plumbing', 'electrical', 'painting', 'roofing', 'hvac', 'general', 'other']),
  status: z.enum(['pending', 'active', 'completed', 'cancelled']).default('pending'),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  location: z.string().optional(),
  description: z.string().optional(),
  internal_notes: z.string().optional(),
})

export const lineItemSchema = z.object({
  description: z.string().min(1, 'Description is required'),
  quantity: z.number().min(0.01, 'Quantity must be greater than 0'),
  unit_price: z.number().min(0, 'Unit price must be 0 or greater'),
})

export const quoteSchema = z.object({
  client_id: z.string().min(1, 'Client is required'),
  job_id: z.string().optional(),
  valid_until: z.string().optional(),
  tax_rate: z.number().min(0).max(100).default(0),
  notes: z.string().optional(),
  terms: z.string().optional(),
  items: z.array(lineItemSchema).min(1, 'At least one line item is required'),
})

export const invoiceSchema = z.object({
  client_id: z.string().min(1, 'Client is required'),
  job_id: z.string().optional(),
  quote_id: z.string().optional(),
  due_date: z.string().optional(),
  tax_rate: z.number().min(0).max(100).default(0),
  notes: z.string().optional(),
  terms: z.string().optional(),
  items: z.array(lineItemSchema).min(1, 'At least one line item is required'),
})

export const paymentSchema = z.object({
  amount: z.number().min(0.01, 'Amount must be greater than 0'),
  payment_method: z.enum(['cash', 'check', 'bank_transfer', 'other']),
  payment_date: z.string().min(1, 'Payment date is required'),
  notes: z.string().optional(),
})

export const businessProfileSchema = z.object({
  business_name: z.string().min(1, 'Business name is required'),
  business_email: z.string().email('Invalid email').or(z.literal('')).optional(),
  business_phone: z.string().optional(),
  business_address: z.string().optional(),
  business_city: z.string().optional(),
  business_state: z.string().optional(),
  business_zip: z.string().optional(),
  default_tax_rate: z.number().min(0).max(100).default(0),
  default_payment_terms: z.string().optional(),
  default_invoice_notes: z.string().optional(),
})

export type LoginFormData = z.infer<typeof loginSchema>
export type RegisterFormData = z.infer<typeof registerSchema>
export type ClientFormData = z.infer<typeof clientSchema>
export type JobFormData = z.infer<typeof jobSchema>
export type QuoteFormData = z.infer<typeof quoteSchema>
export type InvoiceFormData = z.infer<typeof invoiceSchema>
export type PaymentFormData = z.infer<typeof paymentSchema>
export type BusinessProfileFormData = z.infer<typeof businessProfileSchema>
