import Stripe from "stripe"

// Safely check for environment variables
const stripeSecretKey = process.env.STRIPE_SECRET_KEY || ""

// Only throw in production, use a dummy key in development/test if not provided
if (!stripeSecretKey && process.env.NODE_ENV === "production") {
  throw new Error("STRIPE_SECRET_KEY environment variable is not set.")
}

// Initialize Stripe with the secret key
export const stripe = new Stripe(stripeSecretKey, {
  apiVersion: "2025-02-24.acacia", // Current API version
  typescript: true
})
