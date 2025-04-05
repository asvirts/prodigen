"use client"

import React, { createContext, useContext, useEffect, useState } from "react"
import { UserPreference, personalizationService } from "."

interface PersonalizationContextType {
  preferences: UserPreference[]
  loading: boolean
  trackBehavior: (
    eventType: string,
    context: Record<string, unknown>
  ) => Promise<void>
  updatePreference: <T = string | number | boolean>(
    category: string,
    setting: string,
    value: T
  ) => Promise<void>
  getRecommendations: () => Promise<Record<string, unknown>>
}

const PersonalizationContext = createContext<
  PersonalizationContextType | undefined
>(undefined)

export function PersonalizationProvider({
  children,
  userId
}: {
  children: React.ReactNode
  userId: string
}) {
  const [preferences, setPreferences] = useState<UserPreference[]>([])
  const [loading, setLoading] = useState(true)

  const loadPreferences = React.useCallback(async () => {
    try {
      const userPreferences = await personalizationService.getUserPreferences(
        userId
      )
      setPreferences(userPreferences)
    } catch (error) {
      console.error("Error loading preferences:", error)
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    if (userId) {
      loadPreferences()
    }
  }, [userId, loadPreferences])

  const trackBehavior = async (
    eventType: string,
    context: Record<string, any>
  ) => {
    await personalizationService.trackBehavior(userId, eventType, context)
  }

  const updatePreference = async (
    category: string,
    setting: string,
    value: any
  ) => {
    await personalizationService.updatePreference(
      userId,
      category,
      setting,
      value
    )
    await loadPreferences() // Reload preferences after update
  }

  const getRecommendations = async () => {
    return personalizationService.getPersonalizedRecommendations(userId)
  }

  return (
    <PersonalizationContext.Provider
      value={{
        preferences,
        loading,
        trackBehavior,
        updatePreference,
        getRecommendations
      }}
    >
      {children}
    </PersonalizationContext.Provider>
  )
}

export function usePersonalization() {
  const context = useContext(PersonalizationContext)
  if (context === undefined) {
    throw new Error(
      "usePersonalization must be used within a PersonalizationProvider"
    )
  }
  return context
}
