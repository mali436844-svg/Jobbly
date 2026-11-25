import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, parseISO } from 'date-fns'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)
}

export function formatDate(dateString: string): string {
  return format(parseISO(dateString), 'MMM d, yyyy')
}

export function generateQuoteNumber(count: number): string {
  const year = new Date().getFullYear()
  const num = String(count + 1).padStart(3, '0')
  return `Q-${year}-${num}`
}

export function generateInvoiceNumber(count: number): string {
  const year = new Date().getFullYear()
  const num = String(count + 1).padStart(3, '0')
  return `INV-${year}-${num}`
}

export function calculateLineItemTotal(quantity: number, unitPrice: number): number {
  return Math.round(quantity * unitPrice * 100) / 100
}

export function calculateSubtotal(items: { quantity: number; unit_price: number }[]): number {
  return items.reduce((sum, item) => sum + calculateLineItemTotal(item.quantity, item.unit_price), 0)
}

export function calculateTax(subtotal: number, taxRate: number): number {
  return Math.round(subtotal * (taxRate / 100) * 100) / 100
}

export function calculateTotal(subtotal: number, taxAmount: number): number {
  return Math.round((subtotal + taxAmount) * 100) / 100
}
