"use client"

import React, { useMemo } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { subMonths, addMonths, getYear, getMonth } from "date-fns"

// Helper to get current year and month from search params or defaults
function getCurrentYearMonth(searchParams: URLSearchParams): {
  year: number
  month: number
} {
  const yearParam = searchParams.get("year")
  const monthParam = searchParams.get("month")
  const now = new Date()
  const year = yearParam ? parseInt(yearParam, 10) : now.getFullYear()
  // Month in JS Date is 0-indexed, but we use 1-indexed in UI/params
  const month = monthParam ? parseInt(monthParam, 10) : now.getMonth() + 1
  return {
    year: isNaN(year) ? now.getFullYear() : year,
    month: isNaN(month) ? now.getMonth() + 1 : month
  }
}

// Define months
const months = [
  { value: 1, label: "January" },
  { value: 2, label: "February" },
  { value: 3, label: "March" },
  { value: 4, label: "April" },
  { value: 5, label: "May" },
  { value: 6, label: "June" },
  { value: 7, label: "July" },
  { value: 8, label: "August" },
  { value: 9, label: "September" },
  { value: 10, label: "October" },
  { value: 11, label: "November" },
  { value: 12, label: "December" }
]

export function MonthNavigator() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { year, month } = getCurrentYearMonth(searchParams)

  // Generate year list (e.g., 2023 to current year + 1)
  const currentYear = getYear(new Date())
  const years = useMemo(() => {
    const startYear = 2023 // Or fetch earliest transaction year later
    const yearList = []
    for (let y = startYear; y <= currentYear + 1; y++) {
      yearList.push(y)
    }
    return yearList
  }, [currentYear])

  const navigateToMonthYear = (newYear: number, newMonth: number) => {
    const params = new URLSearchParams(searchParams)
    params.set("year", newYear.toString())
    params.set("month", newMonth.toString())
    router.push(`/finance?${params.toString()}`)
  }

  const handleMonthChange = (monthValue: string) => {
    navigateToMonthYear(year, parseInt(monthValue, 10))
  }

  const handleYearChange = (yearValue: string) => {
    navigateToMonthYear(parseInt(yearValue, 10), month)
  }

  const handlePreviousMonth = () => {
    const previousMonthDate = subMonths(new Date(year, month - 1), 1)
    navigateToMonthYear(
      getYear(previousMonthDate),
      getMonth(previousMonthDate) + 1
    )
  }

  const handleNextMonth = () => {
    const nextMonthDate = addMonths(new Date(year, month - 1), 1)
    navigateToMonthYear(getYear(nextMonthDate), getMonth(nextMonthDate) + 1)
  }

  return (
    <div className="flex flex-wrap items-center justify-center gap-2 mb-4">
      <Button
        variant="outline"
        size="icon"
        onClick={handlePreviousMonth}
        aria-label="Previous month"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <Select value={month.toString()} onValueChange={handleMonthChange}>
        <SelectTrigger className="w-[130px]">
          <SelectValue placeholder="Select Month" />
        </SelectTrigger>
        <SelectContent>
          {months.map((m) => (
            <SelectItem key={m.value} value={m.value.toString()}>
              {m.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={year.toString()} onValueChange={handleYearChange}>
        <SelectTrigger className="w-[90px]">
          <SelectValue placeholder="Select Year" />
        </SelectTrigger>
        <SelectContent>
          {years.map((y) => (
            <SelectItem key={y} value={y.toString()}>
              {y}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button
        variant="outline"
        size="icon"
        onClick={handleNextMonth}
        aria-label="Next month"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  )
}
