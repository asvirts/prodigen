"use client"

import React, { useState, useTransition } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import { Task, updateTask } from "../actions" // Import action and Task type

// Define the form schema for editing
const editFormSchema = z.object({
  title: z.string().min(2, { message: "Title must be at least 2 characters." }),
  description: z.string().optional(),
  status: z.enum(["todo", "in_progress", "done"]) // Add status field
  // due_date: z.date().optional(), // Add later
})

interface EditTaskFormProps {
  task: Task // Receive the task data to edit
  onSuccess?: () => void // Optional callback for when edit succeeds (e.g., close dialog)
}

export function EditTaskForm({ task, onSuccess }: EditTaskFormProps) {
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const form = useForm<z.infer<typeof editFormSchema>>({
    resolver: zodResolver(editFormSchema),
    defaultValues: {
      title: task.title || "",
      description: task.description || "",
      status: task.status || "todo"
      // due_date: task.due_date ? new Date(task.due_date) : undefined,
    }
  })

  function onSubmit(values: z.infer<typeof editFormSchema>) {
    setError(null)
    startTransition(async () => {
      try {
        const result = await updateTask({
          id: task.id, // Include the task ID
          ...values
        })

        if (result?.error) {
          throw new Error(result.error)
        }

        // Optionally: Show success message
        console.log("Task updated successfully!")
        onSuccess?.() // Call the callback if provided
      } catch (err) {
        console.error(err)
        setError(
          err instanceof Error ? err.message : "An unexpected error occurred."
        )
      }
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="Task title" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description (Optional)</FormLabel>
              <FormControl>
                {/* Pass the value prop correctly for controlled Textarea */}
                <Textarea
                  placeholder="Task description"
                  {...field}
                  value={field.value ?? ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="todo">To Do</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="done">Done</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* TODO: Add Date Picker Field here */}

        {error && (
          <p className="text-sm font-medium text-destructive">Error: {error}</p>
        )}

        <Button type="submit" disabled={isPending} className="w-full">
          {isPending ? "Saving Changes..." : "Save Changes"}
        </Button>
      </form>
    </Form>
  )
}
