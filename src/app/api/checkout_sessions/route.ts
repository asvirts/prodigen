import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server" // Use server client
import { stripe } from "@/lib/stripe" // Use our stripe utility

export async function POST(req: Request) {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  try {
    // 1. Get User
    const {
      data: { user },
      error: userError
    } = await supabase.auth.getUser()
    if (userError || !user) {
      console.error("Checkout user error:", userError)
      return NextResponse.json(
        { error: "User not authenticated" },
        { status: 401 }
      )
    }

    // 2. Get Subscription Price ID from environment variable
    const priceId = process.env.NEXT_PUBLIC_STRIPE_PRICE_ID
    if (!priceId) {
      throw new Error("Stripe Price ID is not set in environment variables.")
    }

    // 3. Get or Create Stripe Customer
    // Check if user already has a stripe_customer_id in p-profiles
    const { data: profile, error: profileError } = await supabase
      .from("p-profiles")
      .select("stripe_customer_id")
      .eq("id", user.id)
      .single()

    if (profileError && profileError.code !== "PGRST116") {
      // PGRST116: row not found
      console.error("Error fetching profile:", profileError)
      throw new Error("Could not retrieve user profile.")
    }

    let customerId = profile?.stripe_customer_id
    if (!customerId) {
      // Create a new Stripe customer
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          supabaseUUID: user.id // Link Supabase user ID in Stripe metadata
        }
      })
      customerId = customer.id

      // Update the user's profile in Supabase with the new Stripe Customer ID
      const { error: updateError } = await supabase
        .from("p-profiles")
        .update({ stripe_customer_id: customerId })
        .eq("id", user.id)

      if (updateError) {
        console.error("Error updating profile with Stripe ID:", updateError)
        // Non-fatal, but log it. Proceed with checkout.
      }
    }

    // 4. Create Stripe Checkout Session
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000" // Define your base URL
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "subscription", // Specify subscription mode
      customer: customerId,
      line_items: [
        {
          price: priceId,
          quantity: 1
        }
      ],
      // Define success and cancel URLs
      success_url: `${baseUrl}/?checkout=success`, // Redirect back to home with success query param
      cancel_url: `${baseUrl}/?checkout=cancel` // Redirect back to home with cancel query param
    })

    if (!session.id) {
      throw new Error("Failed to create Stripe checkout session.")
    }

    // 5. Return Session ID
    return NextResponse.json({ sessionId: session.id })
  } catch (error) {
    console.error("Stripe Checkout Error:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal Server Error"
      },
      { status: 500 }
    )
  }
}
