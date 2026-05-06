import { createBrowserClient } from '@supabase/ssr'

// browser/client-side supabase instance
// only import this in 'use client' components
export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
