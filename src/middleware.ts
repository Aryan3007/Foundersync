import { NextResponse } from 'next/server'

export async function middleware() {
    return NextResponse.next()
}

// Empty matcher so middleware doesn't run on any routes
export const config = {
    matcher: []
} 