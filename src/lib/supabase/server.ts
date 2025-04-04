import { type CookieOptions, createServerClient } from "@supabase/ssr"
import { type ReadonlyRequestCookies } from "next/dist/server/web/spec-extension/adapters/request-cookies"

export function createClient(cookieStore: ReadonlyRequestCookies) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        async get(name: string) {
          if (!cookieStore) return undefined
          const cookie = await cookieStore.get(name)
          return cookie?.value
        },
        async set(name: string, value: string, options: CookieOptions) {
          try {
            if (!cookieStore) return
            await cookieStore.set({ name, value, ...options })
          } catch (error) {
            console.warn(`Failed to set cookie '${name}':`, error)
          }
        },
        async remove(name: string, options: CookieOptions) {
          try {
            if (!cookieStore) return
            await cookieStore.set({ name, value: "", ...options })
          } catch (error) {
            console.warn(`Failed to remove cookie '${name}':`, error)
          }
        }
      }
    }
  )
}
