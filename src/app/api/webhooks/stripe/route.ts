import Stripe from "stripe"
import { headers } from "next/headers"
import { NextResponse } from "next/server"
import { stripe } from "@/lib/stripe" // Use our Stripe utility
import { createClient } from "@/lib/supabase/admin" // We need admin client to update profiles based on webhook

// Ensure Supabase admin client is configured correctly (using SERVICE_ROLE_KEY)
// You'll need to create this file and add your Supabase Service Role Key to env vars
// Example src/lib/supabase/admin.ts:
// import { createClient } from '@supabase/supabase-js';
// export const createClient = () => createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

export async function POST(req: Request) {
  const body = await req.text() // Need raw body for verification
  const signature = headers().get("Stripe-Signature") as string
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  if (!webhookSecret) {
    console.error("Stripe webhook secret is not set.")
    return NextResponse.json(
      { error: "Webhook secret not configured." },
      { status: 500 }
    )
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error"
    console.error(
      ` Stripe webhook signature verification failed: ${errorMessage}`
    )
    return NextResponse.json(
      { error: `Webhook Error: ${errorMessage}` },
      { status: 400 }
    )
  }

  // Initialize Supabase Admin Client (use with caution)
  const supabaseAdmin = createClient()
  if (!supabaseAdmin) {
    console.error("Failed to create Supabase admin client")
    return NextResponse.json(
      { error: "Server configuration error." },
      { status: 500 }
    )
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const checkoutSession = event.data.object as Stripe.Checkout.Session
        if (
          checkoutSession.mode === "subscription" &&
          checkoutSession.customer
        ) {
          // First payment successful, subscription is now active.
          // We can potentially retrieve the Supabase user ID from customer metadata here if needed,
          // but updating based on subscription status changes might be more robust.
          console.log(
            `Checkout session completed for customer: ${checkoutSession.customer}`
          )
          // Optionally: Update profile here immediately if needed, or rely on subscription updated event.
        }
        break
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription
        const status = subscription.status
        const priceId = subscription.items.data[0]?.price.id
        const customer = subscription.customer as string

        console.log(
          `Subscription updated for customer ${customer}. Status: ${status}`
        )

        // Map Stripe status to your internal plan representation (e.g., 'pro', 'free')
        let newPlan = "free" // Default to free if inactive
        if (status === "active" || status === "trialing") {
          // Determine plan based on Price ID (add more if you have multiple plans)
          if (priceId === process.env.NEXT_PUBLIC_STRIPE_PRICE_ID) {
            newPlan = "pro" // Assuming this price ID corresponds to your 'pro' plan
          }
        }

        // Update the user's profile in Supabase via Stripe Customer ID
        const { error } = await supabaseAdmin
          .from("p-profiles")
          .update({ subscription_plan: newPlan })
          .eq("stripe_customer_id", customer)

        if (error) {
          console.error(
            "Supabase profile update error (on subscription update):",
            error
          )
          throw new Error("Failed to update user subscription status.")
        }
        console.log(`Updated profile for ${customer} to plan: ${newPlan}`)
        break
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription
        const customer = subscription.customer as string

        console.log(
          `Subscription deleted for customer ${customer}. Setting plan to free.`
        )

        // Subscription cancelled/ended, revert user to free plan
        const { error } = await supabaseAdmin
          .from("p-profiles")
          .update({ subscription_plan: "free" })
          .eq("stripe_customer_id", customer)

        if (error) {
          console.error(
            "Supabase profile update error (on subscription delete):",
            error
          )
          throw new Error(
            "Failed to update user plan on subscription deletion."
          )
        }
        console.log(`Updated profile for ${customer} to plan: free`)
        break
      }

      // ... handle other event types as needed (e.g., payment_failed)

      default:
        console.log(`Unhandled event type ${event.type}`)
    }

    // Return a 200 response to acknowledge receipt of the event
    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Webhook handler error:", error)
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Webhook handler failed."
      },
      { status: 500 }
    )
  }
}
