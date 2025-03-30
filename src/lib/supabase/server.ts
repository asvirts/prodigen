import { type CookieOptions, createServerClient } from "@supabase/ssr"
import { type ReadonlyRequestCookies } from "next/dist/server/web/spec-extension/adapters/request-cookies"

export function createClient(cookieStore: ReadonlyRequestCookies) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch (error) {
            console.warn(
              `Failed to set cookie '${name}' in Supabase server client:`,
              error
            )
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: "", ...options })
          } catch (error) {
            console.warn(
              `Failed to remove cookie '${name}' in Supabase server client:`,
              error
            )
          }
        }
      }
    }
  )
}
