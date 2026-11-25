import { createBrowserClient } from '@supabase/ssr'
import { createBrowserMockClient } from './mock-browser-client'

export function createClient() {
  const isPlaceholder = !process.env.NEXT_PUBLIC_SUPABASE_URL || 
    process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder");

  if (isPlaceholder) {
    return createBrowserMockClient() as any;
  }

  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

