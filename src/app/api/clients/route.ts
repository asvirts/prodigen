import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function GET() {
  const supabase = await createClient(await cookies())
  const { data: clients, error } = await supabase
    .from("p-clients")
    .select("*")
    .order("name")

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(clients)
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const supabase = await createClient(await cookies())

    // Validate required fields
    if (!body.name || typeof body.name !== "string") {
      return NextResponse.json(
        { error: "Client name is required and must be a string" },
        { status: 400 }
      )
    }

    // Validate and convert billing_rate if provided
    if (body.billing_rate !== undefined) {
      const rate = parseFloat(body.billing_rate)
      if (isNaN(rate)) {
        return NextResponse.json(
          { error: "Billing rate must be a valid number" },
          { status: 400 }
        )
      }
      body.billing_rate = rate
    }

    // Validate email format if provided
    if (
      body.contact_email &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.contact_email)
    ) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      )
    }

    // Add authenticated user ID to the client data
    const {
      data: { user }
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      )
    }
    body.user_id = user.id

    const { data, error } = await supabase
      .from("p-clients")
      .insert(body)
      .select()

    if (error) {
      console.error("Supabase client creation error:", error)
      // Handle specific Supabase errors
      if (error.code === "23505") {
        // Unique constraint violation
        return NextResponse.json(
          { error: "A client with this name already exists" },
          { status: 409 }
        )
      }
      return NextResponse.json(
        { error: `Failed to create client: ${error.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json(data[0])
  } catch (error) {
    console.error("Client creation error:", error)
    return NextResponse.json(
      {
        error: `Invalid request payload: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      },
      { status: 400 }
    )
  }
}
