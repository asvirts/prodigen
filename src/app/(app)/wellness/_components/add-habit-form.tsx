"use client"

import React, { useTransition } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { toast } from "sonner"

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
import { addHabit } from "../actions" // Import the server action

// Form schema using Zod
const habitFormSchema = z.object({
  name: z
    .string()
    .min(2, { message: "Habit name must be at least 2 characters." }),
  description: z.string().optional(),
  goal_frequency: z.string().optional() // Simple text input for now
})

export function AddHabitForm({ onSuccess }: { onSuccess?: () => void }) {
  const [isPending, startTransition] = useTransition()

  const form = useForm<z.infer<typeof habitFormSchema>>({
    resolver: zodResolver(habitFormSchema),
    defaultValues: {
      name: "",
      description: "",
      goal_frequency: ""
    }
  })

  function onSubmit(values: z.infer<typeof habitFormSchema>) {
    startTransition(async () => {
      try {
        const result = await addHabit(values)

        if (result?.error) {
          throw new Error(result.error)
        }

        form.reset()
        toast.success("Habit added successfully!")
        onSuccess?.() // Call callback on success
      } catch (err) {
        console.error(err)
        toast.error(
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
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Habit Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Drink Water, Exercise" {...field} />
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
                <Textarea
                  placeholder="Why is this habit important?"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="goal_frequency"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Goal / Frequency (Optional)</FormLabel>
              <FormControl>
                {/* TODO: Improve this input later (e.g., structured options) */}
                <Input
                  placeholder="e.g., Daily, 3 times a week, 8 glasses"
                  {...field}
                  value={field.value ?? ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isPending} className="w-full">
          {isPending ? "Adding Habit..." : "Add Habit"}
        </Button>
      </form>
    </Form>
  )
}
