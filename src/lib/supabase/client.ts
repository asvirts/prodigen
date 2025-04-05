import { createBrowserClient } from "@supabase/ssr"

export function createClient() {
  try {
    if (
      !process.env.NEXT_PUBLIC_SUPABASE_URL ||
      !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    ) {
      throw new Error("Missing Supabase environment variables")
    }

    // Create a supabase client on the browser with project's credentials
    return createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    )
  } catch (error) {
    console.error("Failed to create Supabase client:", error)
    throw error
  }
}
