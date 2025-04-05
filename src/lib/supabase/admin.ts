import { createClient as createSupabaseClient } from "@supabase/supabase-js"

<<<<<<< HEAD
// Create a Supabase client with the service role key
// This client bypasses RLS policies and should ONLY be used server-side
export const createAdminClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error("Missing Supabase URL or service role key")
  }

  return createSupabaseClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
=======
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
>>>>>>> e3a6ed6b7d02761e24a0c75f325f6e1225bbe1e6
}
