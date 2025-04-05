"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

export function ManageSubscriptionButton() {
  const [isLoading, setIsLoading] = useState(false)

  const handleManage = async () => {
    setIsLoading(true)
    try {
      // 1. Call API route to create portal session
      const response = await fetch("/api/create_portal_session", {
        method: "POST"
      })

      if (!response.ok) {
        const body = await response.json()
        throw new Error(body.error || "Failed to create portal session")
      }

      const { url } = await response.json()
      if (!url) {
        throw new Error("Did not receive portal session URL")
      }

      // 2. Redirect user to the Stripe Billing Portal URL
      if (typeof window !== "undefined") {
        window.location.href = url
      }
    } catch (error) {
      console.error("Manage Subscription Error:", error)
      toast.error(error instanceof Error ? error.message : "An error occurred.")
      setIsLoading(false)
    }
    // No need to set isLoading false on success, as user is redirected
  }

  return (
    <Button
      onClick={handleManage}
      disabled={isLoading}
      variant="outline"
      size="sm"
    >
      {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
      {isLoading ? "Loading Portal..." : "Manage Subscription"}
    </Button>
  )
}
