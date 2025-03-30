"use client"

import React, { useState, useTransition, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { addWellnessLog } from "../actions" // Import the action
import { Loader2, Check } from "lucide-react" // For loading spinner and Check icon

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
  const [error, setError] = useState<string | null>(null)
  // Use isLoggedToday prop for initial logged state, allow temporary success state
  const [isLocallyLogged, setIsLocallyLogged] = useState(isLoggedToday)
  const [showSuccess, setShowSuccess] = useState(false)

  // Sync local state if the prop changes (e.g., after revalidation)
  useEffect(() => {
    setIsLocallyLogged(isLoggedToday)
  }, [isLoggedToday])

  const handleLog = () => {
    if (isLocallyLogged) return // Don't re-log if already logged

    setError(null)
    setShowSuccess(false)
    startTransition(async () => {
      const result = await addWellnessLog(habitId)
      if (result?.error) {
        setError(result.error)
        console.error(`Log failed for ${habitName}:`, result.error)
        // Revert local state on error?
        // setIsLocallyLogged(false);
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
      {error && <p className="text-xs text-red-500">Error: {error}</p>}
    </div>
  )
}
