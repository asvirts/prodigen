import { createClient } from "@supabase/supabase-js"
import { TaskRecommendationEngine } from "./task-recommendation"
import { personalizationService } from "."

export interface Task {
  id: string
  userId: string
  title: string
  description?: string
  category: string
  priority: "high" | "medium" | "low"
  status: "pending" | "in_progress" | "completed"
  dueDate?: Date
  createdAt: Date
  updatedAt: Date
}

export class TaskService {
  private supabase

  constructor() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  }

  async createTask(
    userId: string,
    title: string,
    description?: string
  ): Promise<Task> {
    try {
      // Get user context for task analysis
      const [behaviors, preferences] = await Promise.all([
        this.supabase
          .from("user_behaviors")
          .select("*")
          .eq("user_id", userId)
          .order("timestamp", { ascending: false })
          .limit(50),
        personalizationService.getUserPreferences(userId)
      ])

      // Generate task recommendations
      const taskAnalysis = await TaskRecommendationEngine.analyzeTask({
        taskTitle: title,
        taskDescription: description,
        userBehaviors: behaviors.data || [],
        userPreferences: preferences
      })

      // Create task with AI-suggested attributes
      const task = {
        user_id: userId,
        title,
        description,
        category: taskAnalysis.category,
        priority: taskAnalysis.priority,
        status: "pending",
        due_date: taskAnalysis.suggestedDueDate?.toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      const { data, error } = await this.supabase
        .from("tasks")
        .insert(task)
        .select()
        .single()

      if (error) throw error

      // Track task creation behavior
      await personalizationService.trackBehavior(userId, "task_created", {
        taskId: data.id,
        taskTitle: title,
        category: taskAnalysis.category,
        priority: taskAnalysis.priority,
        confidence: taskAnalysis.confidence
      })

      return this.mapTaskResponse(data)
    } catch (error) {
      console.error("Error creating task:", error)
      throw error
    }
  }

  async updateTaskStatus(
    taskId: string,
    userId: string,
    status: Task["status"]
  ): Promise<Task> {
    try {
      const { data, error } = await this.supabase
        .from("tasks")
        .update({
          status,
          updated_at: new Date().toISOString()
        })
        .eq("id", taskId)
        .eq("user_id", userId)
        .select()
        .single()

      if (error) throw error

      // Track task status update behavior
      await personalizationService.trackBehavior(userId, `task_${status}`, {
        taskId,
        taskTitle: data.title,
        category: data.category,
        priority: data.priority,
        startTime: data.created_at
      })

      return this.mapTaskResponse(data)
    } catch (error) {
      console.error("Error updating task status:", error)
      throw error
    }
  }

  async getUserTasks(userId: string): Promise<Task[]> {
    try {
      const { data, error } = await this.supabase
        .from("tasks")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })

      if (error) throw error
      return data.map(this.mapTaskResponse)
    } catch (error) {
      console.error("Error fetching user tasks:", error)
      throw error
    }
  }

  private mapTaskResponse(task: any): Task {
    return {
      id: task.id,
      userId: task.user_id,
      title: task.title,
      description: task.description,
      category: task.category,
      priority: task.priority,
      status: task.status,
      dueDate: task.due_date ? new Date(task.due_date) : undefined,
      createdAt: new Date(task.created_at),
      updatedAt: new Date(task.updated_at)
    }
  }
}

export const taskService = new TaskService()
