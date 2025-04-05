import { NextResponse } from "next/server"

export async function GET() {
  // Only check if variables exist, not their actual values for security
  const config = {
    hasSuapabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    hasSupabaseAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    nodeEnv: process.env.NODE_ENV
  }

  return NextResponse.json(config)
}
