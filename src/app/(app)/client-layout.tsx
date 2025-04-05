"use client"

import { ReactNode } from "react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { Toaster } from "sonner"
import { PersonalizationProvider } from "@/lib/personalization/context"

// Create a new QueryClient for React Query
const queryClient = new QueryClient()

interface ClientLayoutProps {
  children: React.ReactNode
  userId: string
}

export function ClientLayout({ children, userId }: ClientLayoutProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <PersonalizationProvider userId={userId}>
        {children}
      </PersonalizationProvider>
      <Toaster position="top-right" />
    </QueryClientProvider>
  )
}
