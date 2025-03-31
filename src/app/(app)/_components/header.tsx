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
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { createClient } from "@/lib/supabase/client" // Use client client for actions triggered by user
import { useRouter } from "next/navigation"
import { ThemeToggle } from "@/components/theme-toggle" // Import ThemeToggle
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet" // Import Sheet
import { Menu } from "lucide-react" // Import Menu icon
import { SubscribeButton } from "@/components/subscribe-button" // Import SubscribeButton
import { ManageSubscriptionButton } from "@/components/manage-subscription-button" // Import Manage Button
import { Badge } from "@/components/ui/badge" // Import Badge

// Define Profile type matching the layout
type UserProfile = {
  id: string
  subscription_plan?: string | null
}

interface HeaderProps {
  user: User
  profile: UserProfile | null // Add profile prop
}

export default function Header({ user, profile }: HeaderProps) {
  // Destructure profile
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

  // Explicitly check profile exists before accessing plan
  const plan = profile ? profile.subscription_plan : null
  const isProUser = plan === "pro"

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center justify-between">
        {/* Left Side: Add flex-shrink-0 */}
        <div className="flex items-center flex-shrink-0">
          {/* Desktop Navigation Area */}
          <div className="mr-4 hidden md:flex">
            <Link href="/" className="mr-6 flex items-center space-x-2">
              {/* <Icons.logo className="h-6 w-6" /> // Replace with your logo later */}
              <span className="hidden font-bold sm:inline-block">Prodigen</span>
            </Link>
            {/* Desktop Nav Links */}
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
          {/* Mobile Menu Trigger */}
          <div className="md:hidden mr-4">
            {" "}
            {/* Show only on md and below */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Toggle Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left">
                {" "}
                {/* Slide from left */}
                {/* Mobile Nav Links */}
                <nav className="grid gap-6 text-lg font-medium mt-6">
                  <Link
                    href="/"
                    className="hover:text-foreground/80 text-foreground/60"
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/tasks"
                    className="hover:text-foreground/80 text-foreground/60"
                  >
                    Tasks
                  </Link>
                  <Link
                    href="/finance"
                    className="hover:text-foreground/80 text-foreground/60"
                  >
                    Finance
                  </Link>
                  <Link
                    href="/wellness"
                    className="hover:text-foreground/80 text-foreground/60"
                  >
                    Wellness
                  </Link>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center space-x-2 md:space-x-4">
          {/* Theme Toggle and User Menu */}
          <ThemeToggle />
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
                  <div className="flex items-center justify-between">
                    {" "}
                    {/* Flex container for name/badge */}
                    <p className="text-sm font-medium leading-none">
                      My Account
                    </p>
                    {/* Conditionally render Pro badge */}
                    {isProUser && <Badge variant="premium">Pro</Badge>}
                  </div>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {/* Conditionally show Subscribe/Manage button */}
              <div className="p-2">
                {isProUser ? (
                  <ManageSubscriptionButton /> // Use the manage button
                ) : (
                  <SubscribeButton />
                )}
              </div>
              <DropdownMenuSeparator />
              {/* Add links to Profile, Settings etc. later */}
              {/* <DropdownMenuItem>Profile</DropdownMenuItem> */}
              {/* <DropdownMenuItem>Settings</DropdownMenuItem> */}
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
