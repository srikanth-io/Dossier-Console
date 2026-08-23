import { createClient, type SupabaseClient } from "@supabase/supabase-js"

import { errorMessages } from "@/constants/messages/errors"
import { AppError } from "@/lib/errors"

let client: SupabaseClient | null = null

/**
 * Lazily creates (and caches) the browser Supabase client from Vite env vars.
 * Lazy so the app can boot — and marketing pages render — even when auth
 * env vars are absent; only auth calls fail with a clear error.
 */
export function getSupabase(): SupabaseClient {
  if (client) return client

  const url = import.meta.env.VITE_SUPABASE_URL?.trim()
  const publishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim()

  if (!url || !publishableKey) {
    throw new AppError("ERR_AUTH_NOT_CONFIGURED", errorMessages.authNotConfigured)
  }

  client = createClient(url, publishableKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  })

  return client
}
