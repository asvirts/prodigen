import { createServerClient, type CookieOptions } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  console.log(`[middleware] Running for path: ${request.nextUrl.pathname}`) // Log path
  let response = NextResponse.next({
    request: {
      headers: request.headers
    }
  })

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // Log if env vars are missing
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("[middleware] Error: Missing Supabase environment variables!")
    // Potentially redirect to an error page or just return early
    // depending on how critical this is for non-auth paths
    return response // Allow request to proceed but log the error
  }

  const supabase = createServerClient(supabaseUrl!, supabaseAnonKey!, {
    cookies: {
      get(name: string) {
        const cookie = request.cookies.get(name)?.value
        // console.log(`[middleware] Cookie GET: ${name}`, cookie ? 'found' : 'not found');
        return cookie
      },
      set(name: string, value: string, options: CookieOptions) {
        // console.log(`[middleware] Cookie SET: ${name}`);
        request.cookies.set({ name, value, ...options })
        // Re-create response to reflect updated request cookies
        response = NextResponse.next({ request: { headers: request.headers } })
        response.cookies.set({ name, value, ...options })
      },
      remove(name: string, options: CookieOptions) {
        // console.log(`[middleware] Cookie REMOVE: ${name}`);
        request.cookies.set({ name, value: "", ...options })
        // Re-create response to reflect updated request cookies
        response = NextResponse.next({ request: { headers: request.headers } })
        response.cookies.set({ name, value: "", ...options })
      }
    }
  })

  // Refresh session if expired - required for Server Components
  console.log("[middleware] Attempting to refresh session (getUser)...;")
  const {
    data: { user },
    error: getUserError
  } = await supabase.auth.getUser()

  // Log the result of getUser within middleware
  console.log("[middleware] getUser result:", {
    userId: user?.id,
    error: getUserError?.message
  })

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"
  ]
}
