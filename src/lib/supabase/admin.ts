import { createClient as createSupabaseClient } from "@supabase/supabase-js"

// Create and export the Supabase admin client instance.
// Note: This client bypasses RLS. Use it ONLY in secure server-side environments (like API routes, webhooks)
export const createClient = () => {
  // Handle missing environment variables in development
  if (
    process.env.NODE_ENV !== "production" &&
    (!process.env.NEXT_PUBLIC_SUPABASE_URL ||
      !process.env.SUPABASE_SERVICE_ROLE_KEY)
  ) {
    console.warn("Development mode: Using mock Supabase admin client")
    // Return a mock client with essential methods for development
    return {
      from: () => ({
        update: () => ({
          eq: () => ({ error: null }),
          error: null
        }),
        select: () => ({ data: [], error: null }),
        delete: () => ({
          eq: () => ({ error: null })
        })
      })
    }
  }

  // Ensure environment variables are loaded and available in production
  if (
    process.env.NODE_ENV === "production" &&
    (!process.env.NEXT_PUBLIC_SUPABASE_URL ||
      !process.env.SUPABASE_SERVICE_ROLE_KEY)
  ) {
    throw new Error(
      "Supabase URL or Service Role Key is missing from environment variables for admin client."
    )
  }

  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}
