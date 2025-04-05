import { UserBehavior, UserPreference } from "."

interface TaskRecommendation {
  category: string
  priority: "high" | "medium" | "low"
  suggestedDueDate?: Date
  confidence: number
  similarTasks?: string[]
}

interface TaskAnalysisContext {
  taskTitle: string
  taskDescription?: string
  userBehaviors: UserBehavior[]
  userPreferences: UserPreference[]
}

export class TaskRecommendationEngine {
  private static readonly TITLE_WEIGHT = 0.6
  private static readonly BEHAVIOR_WEIGHT = 0.3
  private static readonly PREFERENCE_WEIGHT = 0.1

  static async analyzeTask(
    context: TaskAnalysisContext
  ): Promise<TaskRecommendation> {
    const categoryScore = await this.determineCategoryAndPriority(context)
    const schedulingInsights = await this.generateSchedulingInsights(context)

    return {
      category: categoryScore.category,
      priority: this.calculatePriority(categoryScore.score),
      suggestedDueDate: schedulingInsights.suggestedDueDate,
      confidence: categoryScore.confidence,
      similarTasks: await this.findSimilarTasks(context)
    }
  }

  private static async determineCategoryAndPriority(
    context: TaskAnalysisContext
  ) {
    // Analyze task title and description for category hints
    const titleWords = context.taskTitle.toLowerCase().split(" ")
    const categories = new Map<string, number>()

    // Common category keywords and their weights
    const categoryKeywords = {
      development: ["code", "bug", "feature", "test", "deploy"],
      design: ["design", "ui", "ux", "layout", "style"],
      content: ["write", "content", "document", "article"],
      meeting: ["meet", "call", "discuss", "review"],
      planning: ["plan", "strategy", "roadmap", "timeline"]
    }

    // Analyze title keywords
    Object.entries(categoryKeywords).forEach(([category, keywords]) => {
      const matchCount = titleWords.filter((word) =>
        keywords.some((keyword) => word.includes(keyword))
      ).length
      if (matchCount > 0) {
        categories.set(
          category,
          (categories.get(category) || 0) + matchCount * this.TITLE_WEIGHT
        )
      }
    })

    // Factor in user behavior patterns
    const recentBehaviors = context.userBehaviors.slice(0, 10)
    recentBehaviors.forEach((behavior) => {
      const category = behavior.eventType.split("_")[0].toLowerCase()
      categories.set(
        category,
        (categories.get(category) || 0) + this.BEHAVIOR_WEIGHT
      )
    })

    // Consider user preferences
    context.userPreferences.forEach((pref) => {
      if (pref.category === "task_categories") {
        categories.set(
          pref.setting,
          (categories.get(pref.setting) || 0) + this.PREFERENCE_WEIGHT
        )
      }
    })

    // Determine the highest scoring category
    let maxScore = 0
    let bestCategory = "other"
    categories.forEach((score, category) => {
      if (score > maxScore) {
        maxScore = score
        bestCategory = category
      }
    })

    return {
      category: bestCategory,
      score: maxScore,
      confidence: Math.min(maxScore / 2, 1) // Normalize confidence score
    }
  }

  private static calculatePriority(score: number): "high" | "medium" | "low" {
    if (score >= 1.5) return "high"
    if (score >= 0.8) return "medium"
    return "low"
  }

  private static async generateSchedulingInsights(
    context: TaskAnalysisContext
  ) {
    // Analyze user's task completion patterns from behaviors
    const taskCompletionBehaviors = context.userBehaviors.filter(
      (b) => b.eventType === "task_completed"
    )

    // Calculate average task duration based on similar tasks
    const averageTaskDuration = this.calculateAverageTaskDuration(
      taskCompletionBehaviors
    )

    // Suggest due date based on task priority and user's completion patterns
    const suggestedDueDate = new Date()
    suggestedDueDate.setHours(suggestedDueDate.getHours() + averageTaskDuration)

    return {
      suggestedDueDate,
      averageTaskDuration
    }
  }

  private static calculateAverageTaskDuration(
    behaviors: UserBehavior[]
  ): number {
    if (behaviors.length === 0) return 24 // Default to 24 hours if no data

    const durations = behaviors.map((b) => {
      const startTime = b.context.startTime
        ? new Date(b.context.startTime)
        : null
      const endTime = new Date(b.timestamp)
      return startTime
        ? (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60)
        : 24
    })

    return (
      durations.reduce((sum, duration) => sum + duration, 0) / durations.length
    )
  }

  private static async findSimilarTasks(
    context: TaskAnalysisContext
  ): Promise<string[]> {
    // Find tasks with similar titles or in the same category from recent behaviors
    const taskBehaviors = context.userBehaviors.filter(
      (b) => b.eventType === "task_created" || b.eventType === "task_completed"
    )

    const similarTasks = taskBehaviors
      .filter((b) => {
        const taskTitle = b.context.taskTitle?.toLowerCase() || ""
        const currentTitle = context.taskTitle.toLowerCase()
        return (
          taskTitle !== currentTitle &&
          this.calculateSimilarity(taskTitle, currentTitle) > 0.3
        )
      })
      .map((b) => b.context.taskTitle)
      .slice(0, 3)

    return similarTasks
  }

  private static calculateSimilarity(str1: string, str2: string): number {
    const words1 = str1.split(" ")
    const words2 = str2.split(" ")
    const commonWords = words1.filter((word) => words2.includes(word))
    return commonWords.length / Math.max(words1.length, words2.length)
  }
}
