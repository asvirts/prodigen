import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const cookieStore = cookies()
    const supabase = await createClient(cookieStore)

    // Check if the user is authenticated
    const {
      data: { user },
      error
    } = await supabase.auth.getUser()

    if (error) {
      console.error("Error getting user:", error)
      return NextResponse.json({
        authenticated: false,
        error: error.message
      })
    }

    if (!user) {
      return NextResponse.json({
        authenticated: false,
        message: "No user is currently authenticated"
      })
    }

    // Return user info (strip sensitive data)
    return NextResponse.json({
      authenticated: true,
      user: {
        id: user.id,
        email: user.email,
        created_at: user.created_at,
        last_sign_in_at: user.last_sign_in_at
      }
    })
  } catch (error) {
    console.error("Exception in user-info API:", error)
    return NextResponse.json(
      {
        authenticated: false,
        error: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}
