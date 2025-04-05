import { type CookieOptions, createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  // if "next" is in param, use it as the redirect URL
  const next = searchParams.get("next") ?? "/"

  if (code) {
    // Explicitly await cookies() despite being in a Route Handler
    const cookieStore = await cookies()

    // Define cookie handler functions separately
    const getCookie = (name: string) => {
      return cookieStore.get(name)?.value
    }
    const setCookie = (name: string, value: string, options: CookieOptions) => {
      cookieStore.set({ name, value, ...options })
    }
    const removeCookie = (name: string, options: CookieOptions) => {
      cookieStore.set({ name, value: "", ...options })
    }

    // Pass the defined functions to the client
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get: getCookie,
          set: setCookie,
          remove: removeCookie
        }
      }
    )

    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
    console.error("Auth code exchange error:", error)
  }

  console.error(
    "Redirecting to auth-code-error: Code missing or exchange failed."
  )
  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}
