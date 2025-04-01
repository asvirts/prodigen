"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createClient } from "@/lib/supabase/client"

export default function AuthPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  // Initialize supabase client synchronously
  const supabase = createClient()

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    // Remove supabase check, it's guaranteed to be initialized
    setLoading(true)
    setError(null)
    setMessage(null)

    try {
      const { error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (loginError) {
        // Simplified error handling for brevity (keep existing logic if preferred)
        if (loginError.message.includes("Invalid login credentials")) {
          setError("Invalid email or password.")
        } else {
          setError(`Authentication error: ${loginError.message}`)
        }
      } else {
        setMessage("Login successful! Redirecting...")
        router.push("/")
        // Keep refresh if server data needs immediate update after redirect
        router.refresh()
      }
    } catch (e: unknown) {
      console.error("Login catch block error:", e)
      setError("An unexpected error occurred during login.")
    } finally {
      setLoading(false)
    }
  }

  const handleSignUp = async () => {
    // Remove supabase check
    setLoading(true)
    setError(null)
    setMessage(null)

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      })

      if (signUpError) {
        setError(signUpError.message)
      } else if (data.user && data.user.identities?.length === 0) {
        setError("Account exists, but confirmation required or already sent.")
      } else {
        setMessage("Sign up successful! Check email for confirmation.")
      }
    } catch (e: unknown) {
      console.error("Signup catch block error:", e)
      setError("An unexpected error occurred during sign up.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center w-full justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Login / Sign Up</CardTitle>
          <CardDescription>
            Enter your email below to login or sign up.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            {message && <p className="text-green-500 text-sm">{message}</p>}
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Processing..." : "Sign in"}
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={handleSignUp}
              type="button"
              disabled={loading}
            >
              {loading ? "Processing..." : "Sign up"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
