import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { createClient as createServerSupabaseClient } from "@/lib/supabase/server"
import Header from "./_components/header" // We will create this component next
import { ClientLayout } from "./client-layout"

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
<<<<<<< HEAD
  const cookieStore = await cookies() // Restore await here
  const supabase = await createServerSupabaseClient(cookieStore) // Keep await here
=======
  console.log("[/app layout] Running auth check...")
  const cookieStore = await cookies()
  const supabase = createServerSupabaseClient(cookieStore)
>>>>>>> e3a6ed6b7d02761e24a0c75f325f6e1225bbe1e6

  // 1. Get Auth
  const {
    data: { user },
    error: authError
  } = await supabase.auth.getUser()

  // Add detailed logging
  console.log("[/app layout] Auth check result:", {
    userId: user?.id,
    authError: authError?.message
  })

  if (authError || !user) {
    console.log(
      "[/app layout] Redirecting to /auth due to missing user or error."
    )
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
<<<<<<< HEAD
    <ClientLayout userId={user.id}>
      <div className="flex flex-col min-h-screen">
        <Header user={user} profile={profile} />
        {/* Display profile loading error if needed */}
        {profileError && (
          <div className="container text-red-500 p-4">{profileError}</div>
        )}
        <main className="container mx-auto flex-1 p-4 md:p-6 lg:p-8">
          {children}
        </main>
        {/* Optionally add a footer here later */}
      </div>
    </ClientLayout>
=======
    <div className="p-4 container">
      <Header user={user} profile={profile} />
      {/* Display profile loading error if needed */}
      {profileError && (
        <div className="container text-red-500 p-4">{profileError}</div>
      )}
      <main>{children}</main>
      {/* Optionally add a footer here later */}
    </div>
>>>>>>> e3a6ed6b7d02761e24a0c75f325f6e1225bbe1e6
  )
}
