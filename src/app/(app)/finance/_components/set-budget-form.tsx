"use client"

import React, { useTransition, useMemo } from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { format } from "date-fns"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { setBudget, Budget } from "../actions"
import { toast } from "sonner"
import { Loader2, PlusCircle, Trash2 } from "lucide-react"

// Schema for a single budget item
const budgetItemSchema = z.object({
  category: z.string().nullable(), // Allow null for overall
  amount: z.coerce.number().min(0, "Budget must be zero or positive.")
})

// Schema for the whole form
const budgetFormSchema = z.object({
  year: z.number(),
  month: z.number(),
  budgets: z.array(budgetItemSchema)
})

interface SetBudgetFormProps {
  year: number
  month: number
  existingBudgets: Budget[] // Pass existing budgets to pre-fill
  detectedCategories: string[] // Pass categories detected from expenses
}

export function SetBudgetForm({
  year,
  month,
  existingBudgets,
  detectedCategories
}: SetBudgetFormProps) {
  const [isPending, startTransition] = useTransition()

  // Prepare initial form values
  const initialBudgetItems = useMemo(() => {
    const items = []
    const existingMap = new Map<string | null, number>()
    existingBudgets.forEach((b) => existingMap.set(b.category, b.amount))

    // Add overall budget if it exists, otherwise default
    items.push({ category: null, amount: existingMap.get(null) ?? 0 })

    // Add existing category budgets
    existingMap.forEach((amount, category) => {
      if (category !== null) {
        items.push({ category, amount })
      }
    })

    // Add detected categories that don't have a budget yet
    detectedCategories.forEach((cat) => {
      if (!existingMap.has(cat)) {
        items.push({ category: cat, amount: 0 })
      }
    })

    // Sort: Overall first, then alphabetically
    items.sort((a, b) => {
      if (a.category === null) return -1
      if (b.category === null) return 1
      // Both categories are strings at this point, but TypeScript doesn't know
      const aCategory = a.category as string
      const bCategory = b.category as string
      return aCategory.localeCompare(bCategory)
    })

    return items
  }, [existingBudgets, detectedCategories])

  const form = useForm<z.infer<typeof budgetFormSchema>>({
    resolver: zodResolver(budgetFormSchema),
    defaultValues: {
      year: year,
      month: month,
      budgets: initialBudgetItems
    }
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "budgets"
  })

  // Handler to add a new, empty category budget row
  const addCategoryBudget = () => {
    append({ category: "", amount: 0 })
  }

  // Function to submit each budget item individually
  const onSubmit = async (values: z.infer<typeof budgetFormSchema>) => {
    startTransition(async () => {
      let hasError = false
      for (const budgetItem of values.budgets) {
        // Basic validation for category name if not overall
        if (budgetItem.category !== null && !budgetItem.category.trim()) {
          toast.warning(`Skipping empty category name.`)
          continue // Skip empty category names
        }

        const result = await setBudget({
          year: values.year,
          month: values.month,
          category: budgetItem.category, // Can be null
          amount: budgetItem.amount
        })
        if (result.error) {
          toast.error(
            `Failed to set budget for ${budgetItem.category ?? "Overall"}: ${
              result.error
            }`
          )
          hasError = true
        }
      }
      if (!hasError) {
        toast.success("Budgets saved successfully!")
        // Potentially close a dialog if this form is in one
      }
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>
              Set Budgets for {format(new Date(year, month - 1), "MMMM yyyy")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {fields.map((field, index) => (
              <div key={field.id} className="flex items-center gap-2">
                {/* Category Input/Label (non-editable for overall/detected) */}
                {form.getValues(`budgets.${index}.category`) === null ? (
                  <FormLabel className="w-1/3 pt-2">Overall Budget</FormLabel>
                ) : (
                  <FormField
                    control={form.control}
                    name={`budgets.${index}.category`}
                    render={({ field: catField }) => (
                      <FormItem className="w-1/3">
                        <FormControl>
                          <Input
                            placeholder="Category Name"
                            {...catField}
                            value={catField.value ?? ""}
                            // Optionally disable if it was a detected category?
                            // disabled={initialBudgetItems[index]?.category !== null && initialBudgetItems[index]?.category !== ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {/* Amount Input */}
                <FormField
                  control={form.control}
                  name={`budgets.${index}.amount`}
                  render={({ field: amountField }) => (
                    <FormItem className="flex-1">
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          {...amountField}
                          value={amountField.value ?? ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {/* Remove button (only for non-overall budgets) */}
                {form.getValues(`budgets.${index}.category`) !== null && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => remove(index)}
                    aria-label="Remove budget row"
                  >
                    <Trash2 className="h-4 w-4 text-muted-foreground" />
                  </Button>
                )}
              </div>
            ))}
            {/* Add New Category Budget Row Button */}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addCategoryBudget}
              className="mt-2"
            >
              <PlusCircle className="mr-2 h-4 w-4" /> Add Category Budget
            </Button>
          </CardContent>
        </Card>
        <Button type="submit" disabled={isPending} className="w-full">
          {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          {isPending ? "Saving Budgets..." : "Save Budgets"}
        </Button>
      </form>
    </Form>
  )
}
