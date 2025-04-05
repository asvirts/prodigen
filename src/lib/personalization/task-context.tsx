"use client"

import React, { createContext, useContext, useEffect, useState } from "react"
import { Task, taskService } from "./task-service"
import { usePersonalization } from "./context"

interface TaskContextType {
  tasks: Task[]
  loading: boolean
  createTask: (title: string, description?: string) => Promise<Task>
  updateTaskStatus: (taskId: string, status: Task["status"]) => Promise<Task>
  getTasksByCategory: (category: string) => Task[]
  getTasksByPriority: (priority: Task["priority"]) => Task[]
  refreshTasks: () => Promise<void>
}

const TaskContext = createContext<TaskContextType | undefined>(undefined)

export function TaskProvider({
  children,
  userId
}: {
  children: React.ReactNode
  userId: string
}) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const {} = usePersonalization()

  const refreshTasks = useCallback(async () => {
    try {
      setLoading(true)
      const userTasks = await taskService.getUserTasks(userId)
      setTasks(userTasks)
    } catch (error) {
      console.error("Error loading tasks:", error)
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    if (userId) {
      refreshTasks()
    }
  }, [userId, refreshTasks])

  const refreshTasks = async () => {
    try {
      setLoading(true)
      const userTasks = await taskService.getUserTasks(userId)
      setTasks(userTasks)
    } catch (error) {
      console.error("Error loading tasks:", error)
    } finally {
      setLoading(false)
    }
  }

  const createTask = async (title: string, description?: string) => {
    const task = await taskService.createTask(userId, title, description)
    await refreshTasks()
    return task
  }

  const updateTaskStatus = async (taskId: string, status: Task["status"]) => {
    const task = await taskService.updateTaskStatus(taskId, userId, status)
    await refreshTasks()
    return task
  }

  const getTasksByCategory = (category: string) => {
    return tasks.filter((task) => task.category === category)
  }

  const getTasksByPriority = (priority: Task["priority"]) => {
    return tasks.filter((task) => task.priority === priority)
  }

  return (
    <TaskContext.Provider
      value={{
        tasks,
        loading,
        createTask,
        updateTaskStatus,
        getTasksByCategory,
        getTasksByPriority,
        refreshTasks
      }}
    >
      {children}
    </TaskContext.Provider>
  )
}

export function useTasks() {
  const context = useContext(TaskContext)
  if (context === undefined) {
    throw new Error("useTasks must be used within a TaskProvider")
  }
  return context
}
