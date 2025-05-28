import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase-server"

export async function POST(request: Request) {
    try {
        const { refresh_token } = await request.json()

        if (!refresh_token) {
            return NextResponse.json({ error: "Refresh token is required" }, { status: 400 })
        }

        // Use the existing Supabase client with the refresh token as the access token
        const supabase = createServerSupabaseClient(refresh_token)

        // Exchange refresh token for new access token
        const { data: { session }, error } = await supabase.auth.refreshSession({
            refresh_token
        })

        if (error) {
            console.error("Error refreshing token:", error)
            return NextResponse.json({ error: "Failed to refresh token" }, { status: 401 })
        }

        if (!session) {
            return NextResponse.json({ error: "No session returned" }, { status: 401 })
        }

        // Return new tokens and expiry
        return NextResponse.json({
            access_token: session.access_token,
            refresh_token: session.refresh_token,
            expires_at: new Date(Date.now() + (session.expires_in || 3600) * 1000).toISOString()
        })

    } catch (error) {
        console.error("Error in refresh token route:", error)
        return NextResponse.json({
            error: "Internal server error",
            details: error instanceof Error ? error.message : "Unknown error"
        }, { status: 500 })
    }
} 