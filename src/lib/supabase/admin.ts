import { createClient as createSupabaseClient } from "@supabase/supabase-js"

// Ensure environment variables are loaded and available
if (
  !process.env.NEXT_PUBLIC_SUPABASE_URL ||
  !process.env.SUPABASE_SERVICE_ROLE_KEY
) {
  throw new Error(
    "Supabase URL or Service Role Key is missing from environment variables for admin client."
  )
}

// Create and export the Supabase admin client instance.
// Note: This client bypasses RLS. Use it ONLY in secure server-side environments (like API routes, webhooks)
// where you need elevated privileges.
export const createClient = () =>
  createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
