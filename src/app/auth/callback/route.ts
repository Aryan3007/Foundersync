import { createServerSupabaseClient } from "@/lib/supabase-server"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
    const requestUrl = new URL(request.url)

    try {
        const code = requestUrl.searchParams.get('code')

        if (!code) {
            return NextResponse.redirect(`${requestUrl.origin}/auth?error=no_code`)
        }

        const supabase = createServerSupabaseClient()

        // Exchange code for session
        const { data: { user }, error: authError } = await supabase.auth.exchangeCodeForSession(code)

        if (authError) {
            console.error("Auth error:", authError)
            return NextResponse.redirect(`${requestUrl.origin}/auth?error=auth_error`)
        }

        if (!user) {
            return NextResponse.redirect(`${requestUrl.origin}/auth?error=no_user`)
        }

        // Check if user exists in our users table
        const { data: existingUser, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('id', user.id)
            .single()

        if (!existingUser && !userError) {
            // Create user profile if it doesn't exist
            const { error: insertError } = await supabase
                .from('users')
                .insert([
                    {
                        id: user.id,
                        email: user.email,
                        full_name: user.user_metadata.full_name || user.email?.split('@')[0],
                        created_at: new Date().toISOString()
                    }
                ])

            if (insertError) {
                console.error("Error creating user profile:", insertError)
                return NextResponse.redirect(`${requestUrl.origin}/auth?error=profile_creation_failed`)
            }
        }

        // Redirect to idea input page
        return NextResponse.redirect(`${requestUrl.origin}/idea-input`)
    } catch (error) {
        console.error("Callback error:", error)
        return NextResponse.redirect(`${requestUrl.origin}/auth?error=unknown`)
    }
} 