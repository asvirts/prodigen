"use client";

import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// Create a mock query builder that handles all the chaining methods
const createMockQueryBuilder = () => {
  const mockData = { data: [], error: null };

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
  });

  return createChainableMethods();
};

// Create a client-side Supabase client
export const createClient = () => {
  // During SSR, return a mock client to avoid errors
  if (typeof window === "undefined") {
    return {
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
    };
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn("Supabase URL or Anonymous Key is missing");
    // For development, we'll return a mock client that doesn't throw
    if (process.env.NODE_ENV !== "production") {
      return {
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
      };
    }

    throw new Error("Supabase URL or Anonymous Key is missing");
  }

  return createSupabaseClient(supabaseUrl, supabaseAnonKey);
};
