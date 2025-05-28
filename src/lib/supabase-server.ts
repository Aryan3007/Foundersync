import { createClient } from '@supabase/supabase-js'

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    throw new Error('Missing Supabase environment variables')
}

export function createServerSupabaseClient(accessToken?: string) {
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        {
            auth: {
                autoRefreshToken: false,
                persistSession: false,
            },
            global: {
                headers: {
                    Authorization: accessToken ? `Bearer ${accessToken}` : undefined,
                },
            },
        }
    )

    return supabase
} 