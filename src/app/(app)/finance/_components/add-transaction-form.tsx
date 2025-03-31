"use client"

import React, { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { format } from "date-fns" // For date formatting
import { CalendarIcon } from "lucide-react" // Icon for date picker
import { cn } from "@/lib/utils"

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
import { Textarea } from "@/components/ui/textarea" // Using Textarea for description
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover"
import { useAddTransaction, useUpdateTransaction } from "../hooks" // Import both hooks
import { Transaction } from "../actions" // Import Transaction type

// Form schema using Zod with enhanced client-side validation
const transactionFormSchema = z.object({
  description: z
    .string()
    .min(2, { message: "Description must be at least 2 characters." })
    .max(100, { message: "Description must not exceed 100 characters." }),
  amount: z.coerce
    .number()
    .positive({ message: "Amount must be a positive number." })
    .refine((val) => val <= 1000000, {
      message: "Amount must be less than 1,000,000"
    }), // Add a reasonable max value
  type: z.enum(["income", "expense"], {
    required_error: "Please select a transaction type."
  }),
  date: z
    .date({
      required_error: "A date is required.",
      invalid_type_error: "That's not a valid date!"
    })
    .refine((date) => date >= new Date("1900-01-01"), {
      message: "Date must be after 1900"
    }),
  category: z
    .string()
    .optional()
    .transform((val) => (val === "" ? undefined : val)) // Transform empty string to undefined
})

interface AddTransactionFormProps {
  onSuccess?: () => void
  budgetedCategories: string[]
  initialData?: Transaction
}

export function AddTransactionForm({
  onSuccess,
  budgetedCategories,
  initialData
}: AddTransactionFormProps) {
  const [error, setError] = useState<string | null>(null)

  // Get both mutation hooks
  const { addTransaction: mutateAddTransaction, isSubmitting: isAdding } =
    useAddTransaction()
  const {
    updateTransaction: mutateUpdateTransaction,
    isSubmitting: isUpdating
  } = useUpdateTransaction()

  // Determine if we are editing
  const isEditMode = !!initialData

  const form = useForm<z.infer<typeof transactionFormSchema>>({
    resolver: zodResolver(transactionFormSchema),
    // Set default values based on initialData if editing
    defaultValues: isEditMode
      ? {
          description: initialData.description,
          // Ensure amount is treated as number
          amount: Number(initialData.amount),
          type: initialData.type,
          // Parse date string back to Date object for the form
          date: new Date(initialData.date),
          category: initialData.category ?? "" // Handle null category
        }
      : {
          description: "",
          amount: undefined,
          type: undefined,
          date: new Date(),
          category: ""
        },
    mode: "onChange"
  })

  function onSubmit(values: z.infer<typeof transactionFormSchema>) {
    setError(null)

    const dateString = format(values.date, "yyyy-MM-dd")

    const submissionData = {
      ...values,
      date: dateString
    }

    const mutationOptions = {
      onSuccess: () => {
        form.reset(
          isEditMode
            ? undefined
            : {
                description: "",
                amount: undefined,
                type: undefined,
                date: new Date(),
                category: ""
              } // Reset to defaults only when adding
        )
        onSuccess?.() // Close dialog/modal
      },
      onError: (err: unknown) => {
        // Display a generic error or parse the specific error message
        setError(err instanceof Error ? err.message : String(err))
      }
    }

    if (isEditMode) {
      // Call update mutation
      mutateUpdateTransaction(
        { ...submissionData, id: initialData.id }, // Include ID for update
        mutationOptions
      )
    } else {
      // Call add mutation
      mutateAddTransaction(submissionData, mutationOptions)
    }
  }

  // Determine combined loading state
  const isSubmitting = isAdding || isUpdating

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea placeholder="e.g., Groceries, Salary" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Amount</FormLabel>
                <FormControl>
                  {/* Use type="number" and step for better UX */}
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    {...field}
                    value={field.value ?? ""}
                    onChange={(e) => {
                      // Additional client-side validation
                      const value = e.target.value
                      if (
                        value === "" ||
                        (!isNaN(parseFloat(value)) && parseFloat(value) >= 0)
                      ) {
                        field.onChange(e)
                      }
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Type</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Income or Expense" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="income">Income</SelectItem>
                    <SelectItem value="expense">Expense</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem className="flex flex-col pt-2">
                <FormLabel>Date</FormLabel>
                <Popover modal={true}>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={(date) => {
                        if (date) {
                          field.onChange(date)
                        }
                      }}
                      disabled={(date) => date < new Date("1900-01-01")}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <Select
                  onValueChange={(value) => {
                    // If user selects '+ Create New Category', clear the field
                    // so the input can take over. Otherwise, set the selected value.
                    field.onChange(value === "new" ? "" : value)
                  }}
                  value={
                    field.value === "" && form.watch("category") !== ""
                      ? "new"
                      : (field.value ?? "")
                  }
                >
                  <FormControl>
                    {/* If creating new, show the input field value if typed, else show placeholder */}
                    <SelectTrigger>
                      <SelectValue placeholder="Select or create a category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="z-50">
                    {budgetedCategories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                    <SelectItem value="new">+ Create New Category</SelectItem>
                  </SelectContent>
                </Select>
                {/* Show Input only when explicitly creating new OR if form value is not an existing option */}
                {(form.watch("category") === "" ||
                  !budgetedCategories.includes(form.watch("category") ?? "")) &&
                  field.value !== "new" &&
                  form.watch("category") !== "" && (
                    <FormControl>
                      <Input
                        placeholder="Enter new category name"
                        value={form.watch("category") ?? ""} // Bind directly to form value
                        onChange={(e) => field.onChange(e.target.value)} // Update form value on change
                        className="mt-2"
                        autoFocus
                      />
                    </FormControl>
                  )}
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {error && (
          <p className="text-sm font-medium text-destructive">Error: {error}</p>
        )}

        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting
            ? isEditMode
              ? "Saving Changes..."
              : "Adding Transaction..."
            : isEditMode
              ? "Save Changes"
              : "Add Transaction"}
        </Button>
      </form>
    </Form>
  )
}
