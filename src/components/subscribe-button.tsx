"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { loadStripe } from "@stripe/stripe-js"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

// Load Stripe.js with your publishable key
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
)

export function SubscribeButton() {
  const [isLoading, setIsLoading] = useState(false)

  const handleSubscribe = async () => {
    setIsLoading(true)
    try {
      // 1. Call your API route to create a checkout session
      const response = await fetch("/api/checkout_sessions", {
        method: "POST"
      })

      if (!response.ok) {
        const body = await response.json()
        throw new Error(body.error || "Failed to create checkout session")
      }

      const { sessionId } = await response.json()
      if (!sessionId) {
        throw new Error("Did not receive session ID")
      }

      // 2. Redirect to Stripe Checkout
      const stripe = await stripePromise
      if (!stripe) {
        throw new Error("Stripe.js failed to load.")
      }

      const { error } = await stripe.redirectToCheckout({ sessionId })

      if (error) {
        console.error("Stripe redirect error:", error)
        throw new Error(
          error.message || "Failed to redirect to Stripe Checkout."
        )
      }
      // If redirectToCheckout fails, it throws an error or the user stays on the page
      // If successful, the user is redirected and won't reach here directly.
    } catch (error) {
      console.error("Subscription Error:", error)
      toast.error(
        error instanceof Error
          ? error.message
          : "An error occurred during subscription."
      )
      setIsLoading(false) // Ensure loading stops on error
    }
    // No need to set isLoading false on success, as user is redirected
  }

  return (
    <Button onClick={handleSubscribe} disabled={isLoading}>
      {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
      {isLoading ? "Redirecting..." : "Upgrade to Pro"}
    </Button>
  )
}
