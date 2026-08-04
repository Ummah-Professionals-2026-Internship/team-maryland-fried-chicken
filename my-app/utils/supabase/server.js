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


export function createPublicClient() {
  const supabaseUrl = process.env.SUPABASE_URL
  const publishableKey = process.env.SUPABASE_PUBLISHABLE_KEY

  if (!supabaseUrl || !publishableKey) {
    throw new Error(
      'Missing SUPABASE_URL or SUPABASE_PUBLISHABLE_KEY.'
    )
  }

  return createSupabaseClient(
    supabaseUrl,
    publishableKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false,
      },
    }
  )
}

export function createAdminClient() {
  const supabaseUrl = process.env.SUPABASE_URL
  const secretKey =
    process.env.SUPABASE_SECRET_KEY ||
    process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !secretKey) {
    throw new Error(
      'Missing SUPABASE_URL or Supabase server secret key.'
    )
  }

  return createSupabaseClient(
    supabaseUrl,
    secretKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false,
      },
    }
  )
}
