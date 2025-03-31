import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { createClient as createServerSupabaseClient } from "@/lib/supabase/server"
import Header from "./_components/header" // We will create this component next

// Define a simple Profile type
type UserProfile = {
  id: string
  subscription_plan?: string | null
  // Add other profile fields if needed
}

export default async function AppLayout({
  children
}: {
  children: React.ReactNode
}) {
  const cookieStore = cookies()
  const supabase = createServerSupabaseClient(cookieStore)

  // 1. Get Auth User
  const {
    data: { user },
    error: authError
  } = await supabase.auth.getUser()
  if (authError || !user) {
    redirect("/auth")
  }

  // 2. Get User Profile (including subscription plan)
  let profile: UserProfile | null = null
  let profileError: string | null = null

  const { data: profileData, error: profileFetchError } = await supabase
    .from("p-profiles")
    .select("id, subscription_plan")
    .eq("id", user.id)
    .single()

  if (profileFetchError && profileFetchError.code !== "PGRST116") {
    // Ignore row not found error
    console.error("Error fetching profile:", profileFetchError)
    profileError = "Could not load profile data."
    // Decide if you want to block rendering or show a degraded state
  } else {
    profile = profileData as UserProfile | null
    // Handle case where profile might not exist yet (new user)
    if (!profile) {
      console.warn(`Profile not found for user ${user.id}. Defaulting plan.`)
      profile = { id: user.id, subscription_plan: "free" } // Default to free if no profile
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header user={user} profile={profile} />
      {/* Display profile loading error if needed */}
      {profileError && (
        <div className="container text-red-500 p-4">{profileError}</div>
      )}
      <main className="flex-1 p-4 md:p-6 lg:p-8">{children}</main>
      {/* Optionally add a footer here later */}
    </div>
  )
}
