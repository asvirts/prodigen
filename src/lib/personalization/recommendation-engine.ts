import { UserBehavior, UserPreference } from "."

interface RecommendationScore {
  category: string
  score: number
  confidence: number
}

interface RecommendationContext {
  recentBehaviors: UserBehavior[]
  preferences: UserPreference[]
  userId: string
}

export class RecommendationEngine {
  private static readonly RECENCY_WEIGHT = 0.7
  private static readonly PREFERENCE_WEIGHT = 0.3
  private static readonly BEHAVIOR_DECAY = 0.9 // Exponential decay factor for older behaviors

  static async generateRecommendations(
    context: RecommendationContext
  ): Promise<Record<string, any>> {
    const behaviorScores = this.analyzeBehaviors(context.recentBehaviors)
    const preferenceScores = this.analyzePreferences(context.preferences)

    const combinedScores = this.combineScores(behaviorScores, preferenceScores)

    return {
      recommendations: this.generatePersonalizedContent(combinedScores),
      adaptations: this.generateUIAdaptations(combinedScores),
      scores: combinedScores
    }
  }

  private static analyzeBehaviors(
    behaviors: UserBehavior[]
  ): RecommendationScore[] {
    const categoryScores = new Map<string, { score: number; count: number }>()

    behaviors.forEach((behavior, index) => {
      const recencyFactor = Math.pow(this.BEHAVIOR_DECAY, index)
      const category = this.extractCategory(behavior.eventType)

      const current = categoryScores.get(category) || { score: 0, count: 0 }
      categoryScores.set(category, {
        score: current.score + recencyFactor,
        count: current.count + 1
      })
    })

    return Array.from(categoryScores.entries()).map(([category, data]) => ({
      category,
      score: data.score / data.count,
      confidence: Math.min(data.count / 10, 1) // Confidence based on sample size
    }))
  }

  private static analyzePreferences(
    preferences: UserPreference[]
  ): RecommendationScore[] {
    return preferences.map((pref) => ({
      category: pref.category,
      score: this.normalizePreferenceValue(pref.value),
      confidence: 1 // Direct user preferences have high confidence
    }))
  }

  private static combineScores(
    behaviorScores: RecommendationScore[],
    preferenceScores: RecommendationScore[]
  ): RecommendationScore[] {
    const combinedMap = new Map<string, RecommendationScore>()

    // Combine behavior scores
    behaviorScores.forEach((score) => {
      combinedMap.set(score.category, {
        category: score.category,
        score: score.score * this.RECENCY_WEIGHT,
        confidence: score.confidence
      })
    })

    // Combine preference scores
    preferenceScores.forEach((score) => {
      const existing = combinedMap.get(score.category)
      if (existing) {
        combinedMap.set(score.category, {
          category: score.category,
          score: existing.score + score.score * this.PREFERENCE_WEIGHT,
          confidence: Math.max(existing.confidence, score.confidence)
        })
      } else {
        combinedMap.set(score.category, {
          category: score.category,
          score: score.score * this.PREFERENCE_WEIGHT,
          confidence: score.confidence
        })
      }
    })

    return Array.from(combinedMap.values())
  }

  private static generatePersonalizedContent(
    scores: RecommendationScore[]
  ): any[] {
    // Sort scores by confidence and score
    const sortedScores = [...scores].sort(
      (a, b) => b.confidence * b.score - a.confidence * a.score
    )

    // Generate content recommendations based on top categories
    return sortedScores.slice(0, 5).map((score) => ({
      category: score.category,
      type: this.determineContentType(score),
      priority: score.score * score.confidence
    }))
  }

  private static generateUIAdaptations(
    scores: RecommendationScore[]
  ): Record<string, any> {
    return {
      layout: this.determineOptimalLayout(scores),
      features: this.determineFeatureVisibility(scores),
      interactions: this.determineInteractionPatterns(scores)
    }
  }

  private static extractCategory(eventType: string): string {
    return eventType.split("_")[0].toLowerCase()
  }

  private static normalizePreferenceValue(value: any): number {
    if (typeof value === "boolean") return value ? 1 : 0
    if (typeof value === "number") return Math.min(Math.max(value, 0), 1)
    if (typeof value === "string") {
      switch (value.toLowerCase()) {
        case "high":
          return 1
        case "medium":
          return 0.5
        case "low":
          return 0.25
        default:
          return 0
      }
    }
    return 0
  }

  private static determineContentType(score: RecommendationScore): string {
    if (score.confidence > 0.8) return "featured"
    if (score.confidence > 0.5) return "recommended"
    return "suggested"
  }

  private static determineOptimalLayout(scores: RecommendationScore[]): string {
    const avgConfidence =
      scores.reduce((sum, s) => sum + s.confidence, 0) / scores.length
    return avgConfidence > 0.7 ? "personalized" : "default"
  }

  private static determineFeatureVisibility(
    scores: RecommendationScore[]
  ): string[] {
    return scores
      .filter((s) => s.score * s.confidence > 0.6)
      .map((s) => s.category)
  }

  private static determineInteractionPatterns(
    scores: RecommendationScore[]
  ): Record<string, boolean> {
    const patterns: Record<string, boolean> = {}
    scores.forEach((s) => {
      patterns[`show_${s.category}_shortcuts`] = s.score > 0.7
      patterns[`enable_${s.category}_suggestions`] = s.confidence > 0.6
    })
    return patterns
  }
}
