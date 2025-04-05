"use client"

import { createBrowserClient } from "@supabase/ssr"
import type { SupabaseClient } from "@supabase/supabase-js"
import { devConfig } from "./dev-config"

// Create a mock query builder that handles all the chaining methods
const createMockQueryBuilder = () => {
  const mockData = { data: [], error: null }

  // Create a function that returns an object with all query methods
  const createChainableMethods = () => ({
    ...mockData,
    select: () => createChainableMethods(),
    order: () => createChainableMethods(),
    eq: () => createChainableMethods(),
    gte: () => createChainableMethods(),
    lte: () => createChainableMethods(),
    insert: () => ({ error: null }),
    update: () => ({ error: null }),
    delete: () => ({ error: null })
  })

  return createChainableMethods()
}

// Create a mock Supabase client that implements the required interface
const createMockClient = () =>
  ({
    supabaseUrl: "http://mock-url.com",
    supabaseKey: "mock-key",
    realtimeUrl: "ws://mock-url.com",
    authUrl: "http://mock-url.com/auth",
    storageUrl: "http://mock-url.com/storage",
    functionsUrl: "http://mock-url.com/functions",
    realtime: {
      connect: () => {},
      disconnect: () => {},
      channel: () => ({})
    },
    auth: {
      getUser: () => Promise.resolve({ data: { user: null }, error: null }),
      signOut: () => Promise.resolve({ error: null }),
      signInWithPassword: () =>
        Promise.resolve({
          data: {
            user: { id: "mock-user-id", email: "mock@example.com" },
            session: { access_token: "mock-token" }
          },
          error: null
        }),
      signUp: () =>
        Promise.resolve({
          data: {
            user: {
              id: "mock-user-id",
              email: "mock@example.com",
              identities: []
            },
            session: { access_token: "mock-token" }
          },
          error: null
        })
    },
    from: () => createMockQueryBuilder(),
    rest: {
      from: () => createMockQueryBuilder()
    },
    storage: {
      from: () => ({
        upload: () => Promise.resolve({ data: null, error: null }),
        download: () => Promise.resolve({ data: null, error: null }),
        remove: () => Promise.resolve({ data: null, error: null }),
        list: () => Promise.resolve({ data: [], error: null })
      })
    },
    functions: {
      invoke: () => Promise.resolve({ data: null, error: null })
    }
  }) as unknown as SupabaseClient

// Global variable to hold the client instance (Singleton pattern)
let supabaseSingleton: SupabaseClient | null = null

export const createClient = (): SupabaseClient => {
  // Return the existing instance if it's already created
  if (supabaseSingleton) {
    return supabaseSingleton
  }

  // During SSR or in environments without window, return a mock client
  // Be cautious with mocks, ensure they fulfill the necessary contract
  if (typeof window === "undefined") {
    console.warn(
      "Returning mock Supabase client during SSR/non-browser environment."
    )
    supabaseSingleton = createMockClient()
    return supabaseSingleton
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY. Falling back to mock client."
    )
    supabaseSingleton = createMockClient()
    return supabaseSingleton
  }

  // Create the browser client using @supabase/ssr
  // This automatically handles cookie storage
  try {
    supabaseSingleton = createBrowserClient(supabaseUrl, supabaseAnonKey)

    // Optional: Implement auto-login for development ONLY if truly needed
    // This is generally discouraged in the client creation logic itself
    // Consider handling dev-specific logic elsewhere.
    if (devConfig.enableAutoLogin && devConfig.email && devConfig.password) {
      console.log(
        "Dev Mode: Attempting auto-login (consider moving this logic)"
      )
      // Don't await here, let it happen in the background or handle post-initialization
      supabaseSingleton.auth
        .signInWithPassword({
          email: devConfig.email,
          password: devConfig.password
        })
        .then(({ error }) => {
          if (error) {
            console.error("Dev Mode: Auto-login failed:", error.message)
          } else {
            console.log("Dev Mode: Auto-login successful.")
          }
        })
    }

    return supabaseSingleton
  } catch (error) {
    console.error("Error creating Supabase browser client:", error)
    console.warn("Falling back to mock Supabase client due to error.")
    supabaseSingleton = createMockClient()
    return supabaseSingleton
  }
}
