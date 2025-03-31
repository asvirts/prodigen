import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { stripe } from "@/lib/stripe"

export async function POST() {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  try {
    // 1. Get User
    const {
      data: { user },
      error: userError
    } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json(
        { error: "User not authenticated" },
        { status: 401 }
      )
    }

    // 2. Get Stripe Customer ID from user's profile
    const { data: profile, error: profileError } = await supabase
      .from("p-profiles")
      .select("stripe_customer_id")
      .eq("id", user.id)
      .single()

    if (profileError) {
      console.error("Portal session - Error fetching profile:", profileError)
      throw new Error("Could not retrieve user profile.")
    }

    const customerId = profile?.stripe_customer_id
    if (!customerId) {
      throw new Error("Stripe customer ID not found for user.")
    }

    // 3. Create Stripe Billing Portal Session
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${baseUrl}/` // URL to return to after managing subscription
    })

    if (!portalSession.url) {
      throw new Error("Failed to create Stripe billing portal session.")
    }

    // 4. Return Portal Session URL
    return NextResponse.json({ url: portalSession.url })
  } catch (error) {
    console.error("Stripe Portal Session Error:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal Server Error"
      },
      { status: 500 }
    )
  }
}
