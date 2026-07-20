// utils/supabase/server.js
import { createServerClient } from '@supabase/ssr'

import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

export function createClient() {
  // We do not await it here so that createClient stays a synchronous function
  const cookieStorePromise = cookies()

  return createServerClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_PUBLISHABLE_KEY,
    {
      cookies: {
        // 1. Make this function async to unwrap the Next.js cookies Promise
        async getAll() {
          const cookieStore = await cookieStorePromise
          return cookieStore.getAll()
        },
        // 2. Make this function async to unwrap the Next.js cookies Promise
        async setAll(cookiesToSet) {
          try {
            const cookieStore = await cookieStorePromise
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Next.js safely ignores cookie changes if called during a pure page render
          }
        },
      },
    }
  )
} // <-- Properly closes createClient


export function createAdminClient() {
  return createSupabaseClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SECRET_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}

export const supabaseAdmin = createAdminClient()
export const supabase = createClient()