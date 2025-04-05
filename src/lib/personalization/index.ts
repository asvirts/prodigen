import { createClient } from "@/lib/supabase/client"
import { RecommendationEngine } from "./recommendation-engine"

export interface UserPreference {
  id: string
  userId: string
  category: string
  setting: string
  value: any
  createdAt: Date
  updatedAt: Date
}

export interface UserBehavior {
  id: string
  userId: string
  eventType: string
  context: Record<string, any>
  timestamp: Date
}

export class PersonalizationService {
  private supabase

  constructor() {
    try {
      this.supabase = createClient()
      if (!this.supabase) {
        throw new Error("Failed to initialize Supabase client")
      }
    } catch (error) {
      console.error("Error initializing Supabase client:", error)
      throw error
    }
  }

  async getUserPreferences(userId: string): Promise<UserPreference[]> {
    if (!userId) {
      throw new Error("User ID is required")
    }

    try {
      const { data, error } = await this.supabase
        .from("p-user_preferences")
        .select("*")
        .eq("id", userId)

      if (error) {
        console.error(
          "Supabase error fetching preferences:",
          JSON.stringify(error, null, 2)
        )
        throw new Error(
          `Failed to fetch preferences: ${error.message || "Unknown error"}`
        )
      }

      if (!data) {
        return []
      }

      return data.map((pref) => ({
        id: pref.id,
        userId: pref.id, // Corrected mapping from id
        category: pref.category,
        setting: pref.setting,
        value: pref.value,
        createdAt: new Date(pref.created_at),
        updatedAt: new Date(pref.updated_at)
      }))
    } catch (error) {
      console.error("Error fetching user preferences:", error)
      throw error
    }
  }

  async trackBehavior(
    userId: string,
    eventType: string,
    context: Record<string, any>
  ): Promise<void> {
    try {
      await this.supabase.from("user_behaviors").insert({
        user_id: userId,
        event_type: eventType,
        context,
        timestamp: new Date().toISOString()
      })
    } catch (error) {
      console.error("Error tracking user behavior:", error)
      throw error
    }
  }

  async updatePreference(
    userId: string,
    category: string,
    setting: string,
    value: any
  ): Promise<void> {
    try {
      await this.supabase.from("p-user_preferences").upsert({
        id: userId, // Corrected column name
        category,
        setting,
        value,
        updated_at: new Date().toISOString()
      })
    } catch (error) {
      console.error("Error updating user preference:", error)
      throw error
    }
  }

  async getPersonalizedRecommendations(
    userId: string
  ): Promise<Record<string, any>> {
    try {
      // Fetch user behaviors and preferences
      const [{ data: behaviors }, preferences] = await Promise.all([
        this.supabase
          .from("user_behaviors")
          .select("*")
          .eq("user_id", userId)
          .order("timestamp", { ascending: false })
          .limit(100),
        this.getUserPreferences(userId)
      ])

      if (!behaviors) {
        throw new Error("Failed to fetch user behaviors")
      }

      // Generate AI-driven recommendations using the recommendation engine
      const recommendations =
        await RecommendationEngine.generateRecommendations({
          recentBehaviors: behaviors,
          preferences,
          userId
        })

      return {
        ...recommendations,
        lastBehavior: behaviors[0] || null,
        preferences
      }
    } catch (error) {
      console.error("Error generating personalized recommendations:", error)
      throw error
    }
  }
}

export const personalizationService = new PersonalizationService()
