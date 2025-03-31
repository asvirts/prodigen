"use client"

import { createClient as createSupabaseClient } from "@supabase/supabase-js"

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
    delete: () => ({ error: null }),
  })

  return createChainableMethods()
}

// Create a mock Supabase client that implements the required interface
const createMockClient = () => ({
  supabaseUrl: "http://mock-url.com",
  supabaseKey: "mock-key",
  realtimeUrl: "ws://mock-url.com",
  authUrl: "http://mock-url.com/auth",
  storageUrl: "http://mock-url.com/storage",
  functionsUrl: "http://mock-url.com/functions",
  realtime: {
    connect: () => {},
    disconnect: () => {},
    channel: () => ({}),
  },
  auth: {
    getUser: () => Promise.resolve({ data: { user: null }, error: null }),
    signOut: () => Promise.resolve({ error: null }),
    signInWithPassword: () =>
      Promise.resolve({
        data: {
          user: { id: "mock-user-id", email: "mock@example.com" },
          session: { access_token: "mock-token" },
        },
        error: null,
      }),
    signUp: () =>
      Promise.resolve({
        data: {
          user: {
            id: "mock-user-id",
            email: "mock@example.com",
            identities: [],
          },
          session: { access_token: "mock-token" },
        },
        error: null,
      }),
  },
  from: () => createMockQueryBuilder(),
  rest: {
    from: () => createMockQueryBuilder(),
  },
  storage: {
    from: () => ({
      upload: () => Promise.resolve({ data: null, error: null }),
      download: () => Promise.resolve({ data: null, error: null }),
      remove: () => Promise.resolve({ data: null, error: null }),
      list: () => Promise.resolve({ data: [], error: null }),
    }),
  },
  functions: {
    invoke: () => Promise.resolve({ data: null, error: null }),
  },
})

import { devConfig } from "./dev-config"

// Create a client-side Supabase client
export const createClient = async () => {
  // During SSR, return a mock client to avoid errors
  if (typeof window === "undefined") {
    return createMockClient()
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    const error = new Error(
      "Supabase configuration is missing. Please check your environment variables: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY"
    )
    console.error(error)
    throw error
  }

  const client = createSupabaseClient(supabaseUrl, supabaseAnonKey)

  // Auto-login in development mode if configured
  if (devConfig.enableAutoLogin && devConfig.email && devConfig.password) {
    try {
      const {
        data: { user },
      } = await client.auth.getUser()

      // Only attempt login if not already authenticated
      if (!user) {
        await client.auth.signInWithPassword({
          email: devConfig.email,
          password: devConfig.password,
        })
        console.log("Development mode: Auto-login successful")
      }
    } catch (error) {
      console.error("Development mode: Auto-login failed", error)
    }
  }

  return client
}
