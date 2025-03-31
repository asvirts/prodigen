"use client";

import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// Create a client-side Supabase client
export const createClient = () => {
  if (typeof window === "undefined") {
    throw new Error("Client-side Supabase client must be used in the browser");
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
        },
        from: () => ({
          select: () => ({
            order: () => ({
              data: [],
              error: null,
            }),
            eq: () => ({
              data: [],
              error: null,
            }),
            gte: () => ({
              lte: () => ({
                order: () => ({
                  data: [],
                  error: null,
                }),
              }),
            }),
          }),
          insert: () => ({ error: null }),
          update: () => ({ error: null }),
          delete: () => ({ error: null }),
        }),
      };
    }

    throw new Error("Supabase URL or Anonymous Key is missing");
  }

  return createSupabaseClient(supabaseUrl, supabaseAnonKey);
};
