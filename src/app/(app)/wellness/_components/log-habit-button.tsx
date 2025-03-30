"use client"

import React, { useState, useTransition, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { addWellnessLog } from "../actions" // Import the action
import { Loader2, Check } from "lucide-react" // For loading spinner and Check icon
import { toast } from "sonner" // Import toast

interface LogHabitButtonProps {
  habitId: number
  habitName: string
  isLoggedToday: boolean // Add prop
}

export function LogHabitButton({
  habitId,
  habitName,
  isLoggedToday
}: LogHabitButtonProps) {
  const [isPending, startTransition] = useTransition()
  const [isLocallyLogged, setIsLocallyLogged] = useState(isLoggedToday)
  const [showSuccess, setShowSuccess] = useState(false)

  // Sync local state if the prop changes (e.g., after revalidation)
  useEffect(() => {
    setIsLocallyLogged(isLoggedToday)
  }, [isLoggedToday])

  const handleLog = () => {
    if (isLocallyLogged) return // Don't re-log if already logged

    setShowSuccess(false)
    startTransition(async () => {
      const result = await addWellnessLog(habitId)
      if (result?.error) {
        toast.error(`Failed to log ${habitName}: ${result.error}`) // Error toast
      } else {
        setIsLocallyLogged(true) // Optimistically update local state
        setShowSuccess(true)
        // Reset visual success indicator after a delay
        setTimeout(() => setShowSuccess(false), 2000)
        // No need to call revalidate here, parent page revalidation is preferred
      }
    })
  }

  // Determine button content and appearance
  let buttonContent: React.ReactNode
  let buttonVariant:
    | "default"
    | "outline"
    | "secondary"
    | "ghost"
    | "link"
    | "destructive"
    | null
    | undefined = "outline"
  let isDisabled = isPending || isLocallyLogged

  if (isPending) {
    buttonContent = <Loader2 className="mr-2 h-4 w-4 animate-spin" />
    buttonVariant = "secondary"
  } else if (isLocallyLogged) {
    buttonContent = (
      <>
        <Check className="mr-2 h-4 w-4" /> Logged
      </>
    )
    buttonVariant = "default" // Use default filled variant when logged
  } else {
    buttonContent = "Log Today"
    buttonVariant = "outline"
  }
  // Keep success state separate for temporary visual feedback
  if (showSuccess && isLocallyLogged) {
    buttonContent = (
      <>
        <Check className="mr-2 h-4 w-4" /> Logged!
      </>
    )
  }

  return (
    <div className="flex flex-col items-start gap-1 mt-2">
      <Button
        onClick={handleLog}
        disabled={isDisabled} // Use combined disabled state
        size="sm"
        variant={buttonVariant}
        className="w-full md:w-auto transition-all duration-200 ease-in-out"
      >
        {buttonContent}
      </Button>
    </div>
  )
}
