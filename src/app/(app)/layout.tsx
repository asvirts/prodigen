import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { createClient as createServerSupabaseClient } from "@/lib/supabase/server"
import Header from "./_components/header" // We will create this component next

export default async function AppLayout({
  children
}: {
  children: React.ReactNode
}) {
  const cookieStore = cookies()
  const supabase = createServerSupabaseClient(cookieStore)

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth")
  }

  const user = data.user

  return (
    <div className="flex flex-col min-h-screen">
      <Header user={user} />
      <main className="flex-1 p-4 md:p-6 lg:p-8">{children}</main>
      {/* Optionally add a footer here later */}
    </div>
  )
}
