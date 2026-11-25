export type Profile = {
  id: string
  email: string
  business_name: string
  business_address: string | null
  business_city: string | null
  business_state: string | null
  business_zip: string | null
  business_phone: string | null
  business_email: string | null
  logo_url: string | null
  default_tax_rate: number
  default_payment_terms: string | null
  default_invoice_notes: string | null
  subscription_status: 'trialing' | 'active' | 'cancelled' | 'expired'
  subscription_plan: 'free' | 'starter' | 'pro'
  trial_ends_at: string | null
  lemon_squeezy_customer_id: string | null
  lemon_squeezy_subscription_id: string | null
  created_at: string
  updated_at: string
}

export type Client = {
  id: string
  user_id: string
  full_name: string
  email: string | null
  phone: string | null
  company_name: string | null
  address: string | null
  city: string | null
  state: string | null
  zip: string | null
  created_at: string
  updated_at: string
  // Computed fields from joins
  total_jobs?: number
  total_billed?: number
}

export type JobType = 'plumbing' | 'electrical' | 'painting' | 'roofing' | 'hvac' | 'general' | 'other'
export type JobStatus = 'pending' | 'active' | 'completed' | 'cancelled'

export type Job = {
  id: string
  user_id: string
  client_id: string
  title: string
  job_type: JobType
  status: JobStatus
  start_date: string | null
  end_date: string | null
  location: string | null
  description: string | null
  internal_notes: string | null
  created_at: string
  updated_at: string
  // Joins
  client?: Client
}

export type QuoteStatus = 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired'

export type Quote = {
  id: string
  user_id: string
  client_id: string
  job_id: string | null
  quote_number: string
  status: QuoteStatus
  valid_until: string | null
  subtotal: number
  tax_rate: number
  tax_amount: number
  total: number
  notes: string | null
  terms: string | null
  created_at: string
  updated_at: string
  // Joins
  client?: Client
  job?: Job
  items?: QuoteItem[]
}

export type QuoteItem = {
  id: string
  quote_id: string
  description: string
  quantity: number
  unit_price: number
  total: number
  sort_order: number
}

export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'

export type Invoice = {
  id: string
  user_id: string
  client_id: string
  job_id: string | null
  quote_id: string | null
  invoice_number: string
  status: InvoiceStatus
  due_date: string | null
  subtotal: number
  tax_rate: number
  tax_amount: number
  total: number
  notes: string | null
  terms: string | null
  created_at: string
  updated_at: string
  // Joins
  client?: Client
  job?: Job
  items?: InvoiceItem[]
  payments?: Payment[]
}

export type InvoiceItem = {
  id: string
  invoice_id: string
  description: string
  quantity: number
  unit_price: number
  total: number
  sort_order: number
}

export type PaymentMethod = 'cash' | 'check' | 'bank_transfer' | 'other'

export type Payment = {
  id: string
  invoice_id: string
  user_id: string
  amount: number
  payment_method: PaymentMethod
  payment_date: string
  notes: string | null
  created_at: string
}
