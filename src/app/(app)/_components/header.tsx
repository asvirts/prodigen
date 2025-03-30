"use client" // DropdownMenu requires client-side interactivity

import Link from "next/link"
import { User } from "@supabase/supabase-js"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { createClient } from "@/lib/supabase/client" // Use client client for actions triggered by user
import { useRouter } from "next/navigation"

interface HeaderProps {
  user: User
}

export default function Header({ user }: HeaderProps) {
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/auth") // Redirect client-side after sign out
    router.refresh() // Ensure layout re-renders and checks auth state
  }

  const getInitials = (email: string | undefined): string => {
    if (!email) return "U"
    return email.substring(0, 2).toUpperCase()
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center">
        <div className="mr-4 hidden md:flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            {/* <Icons.logo className="h-6 w-6" /> // Replace with your logo later */}
            <span className="hidden font-bold sm:inline-block">Prodigen</span>
          </Link>
          <nav className="flex items-center gap-6 text-sm">
            {/* Add Navigation Links here later e.g., Tasks, Finance, Wellness */}
            <Link
              href="/"
              className="transition-colors hover:text-foreground/80 text-foreground/60"
            >
              Dashboard
            </Link>
            {/* Add Tasks link */}
            <Link
              href="/tasks"
              className="transition-colors hover:text-foreground/80 text-foreground/60"
            >
              Tasks
            </Link>
            {/* Add Finance link */}
            <Link
              href="/finance"
              className="transition-colors hover:text-foreground/80 text-foreground/60"
            >
              Finance
            </Link>
            {/* Add Wellness link */}
            <Link
              href="/wellness"
              className="transition-colors hover:text-foreground/80 text-foreground/60"
            >
              Wellness
            </Link>
            {/* Example for other links (create pages later) */}
          </nav>
        </div>
        {/* TODO: Add mobile navigation toggle */}
        <div className="flex flex-1 items-center justify-end space-x-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  {/* Placeholder for user avatar image if available */}
                  {/* <AvatarImage src={user.user_metadata?.avatar_url} alt={user.email} /> */}
                  <AvatarFallback>{getInitials(user.email)}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">My Account</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {/* Add links to Profile, Settings etc. later */}
              {/* <DropdownMenuItem>Profile</DropdownMenuItem> */}
              {/* <DropdownMenuItem>Settings</DropdownMenuItem> */}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut}>
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
