import { redirect } from "next/navigation"
import { cookies } from "next/headers" // Import cookies
import { createClient as createServerSupabaseClient } from "@/lib/supabase/server" // Rename import
import { Button } from "@/components/ui/button"

export default async function Home() {
  const cookieStore = await cookies() // Get cookie store
  const supabase = createServerSupabaseClient(cookieStore) // Pass cookie store

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth") // Redirect to login page if not authenticated
  }

  // Server Action for signing out
  const signOut = async () => {
    "use server"

    const cookieStore = await cookies() // Get cookie store within action
    const supabase = createServerSupabaseClient(cookieStore) // Pass cookie store
    await supabase.auth.signOut()
    return redirect("/auth") // Redirect to login after sign out
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="mb-4">
        <p>Hello, {data.user.email}!</p>
        <p>You are logged in.</p>
        {/* TODO: Add actual application content here */}
      </div>
      <form action={signOut}>
        <Button type="submit">Logout</Button>
      </form>
    </div>
  )
}
