"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Bot, Github, Mail } from "lucide-react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { useRouter, useSearchParams } from "next/navigation"
import { AuthError } from "@supabase/supabase-js"
import { toast } from "sonner"

export default function AuthPage() {
    const [isLoading, setIsLoading] = useState(false)
    const [isCheckingSession, setIsCheckingSession] = useState(true)
    const router = useRouter()
    const searchParams = useSearchParams()
    const defaultTab = searchParams?.get('tab') || 'login'

    useEffect(() => {
        const checkSession = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession()
                if (session) {
                    // Check if user exists in our users table
                    const { data: userData, error: userError } = await supabase
                        .from('users')
                        .select('*')
                        .eq('id', session.user.id)
                        .single()

                    if (userError || !userData) {
                        // If user doesn't exist in our table, sign them out
                        await supabase.auth.signOut()
                        toast.error("User profile not found. Please sign in again.")
                        return
                    }

                    // User is authenticated and exists in our table
                    router.replace("/idea-input")
                }
            } catch (error) {
                console.error("Error checking session:", error)
                toast.error("Error checking authentication status")
            } finally {
                setIsCheckingSession(false)
            }
        }

        checkSession()
    }, [router])

    const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsLoading(true)

        const formData = new FormData(e.currentTarget)
        const email = formData.get("email") as string
        const password = formData.get("password") as string

        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            })

            if (error) throw error

            if (!data.user) throw new Error("No user data returned")

            // Verify user exists in our users table
            const { data: userData, error: userError } = await supabase
                .from('users')
                .select('*')
                .eq('id', data.user.id)
                .single()

            if (userError || !userData) {
                await supabase.auth.signOut()
                throw new Error("User profile not found. Please sign up first.")
            }

            toast.success("Logged in successfully")
            router.push("/idea-input")
        } catch (error) {
            console.error("Login error:", error)
            if (error instanceof AuthError) {
                toast.error(error.message)
            } else if (error instanceof Error) {
                toast.error(error.message)
            } else {
                toast.error("An unexpected error occurred")
            }
            await supabase.auth.signOut()
        } finally {
            setIsLoading(false)
        }
    }

    const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsLoading(true)

        const formData = new FormData(e.currentTarget)
        const email = formData.get("signup-email") as string
        const password = formData.get("signup-password") as string
        const fullName = formData.get("name") as string

        try {
            // First, sign up the user with Supabase Auth
            const { data: authData, error: signUpError } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: fullName,
                    },
                },
            })

            if (signUpError) throw signUpError
            if (!authData.user) throw new Error("No user data returned")

            // Then, create the user profile in our users table
            const { error: profileError } = await supabase
                .from("users")
                .insert([
                    {
                        id: authData.user.id,
                        full_name: fullName,
                        email: email,
                        created_at: new Date().toISOString()
                    },
                ])

            if (profileError) {
                // If profile creation fails, clean up by signing out
                await supabase.auth.signOut()
                throw profileError
            }

            toast.success("Account created successfully! Please check your email for verification.")
            router.push("/auth?tab=login")
        } catch (error) {
            console.error("Signup error:", error)
            if (error instanceof AuthError) {
                toast.error(error.message)
            } else if (error instanceof Error) {
                toast.error(error.message)
            } else {
                toast.error("An unexpected error occurred")
            }
        } finally {
            setIsLoading(false)
        }
    }

    const handleOAuthLogin = async (provider: 'github' | 'google') => {
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider,
                options: {
                    redirectTo: `${window.location.origin}/auth/callback`
                }
            })
            if (error) throw error
        } catch (error) {
            console.error(`${provider} login error:`, error)
            if (error instanceof AuthError) {
                toast.error(error.message)
            } else {
                toast.error("An unexpected error occurred")
            }
        }
    }

    if (isCheckingSession) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="animate-pulse">Loading...</div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <div className="w-full max-w-md space-y-6">
                {/* Logo */}
                <div className="text-center space-y-2">
                    <Link href="/" className="inline-flex items-center space-x-2">
                        <Bot className="h-8 w-8" />
                        <span className="text-2xl font-bold">Foundersync</span>
                    </Link>
                    <p className="text-muted-foreground">AI-powered startup simulation platform</p>
                </div>

                {/* Auth Form */}
                <Card>
                    <CardHeader className="text-center">
                        <CardTitle>Welcome to Foundersync</CardTitle>
                        <CardDescription>Sign in to your account or create a new one</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Tabs defaultValue={defaultTab} className="w-full">
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="login">Login</TabsTrigger>
                                <TabsTrigger value="signup">Sign Up</TabsTrigger>
                            </TabsList>

                            <TabsContent value="login" className="space-y-4">
                                <form onSubmit={handleLogin} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email</Label>
                                        <Input name="email" id="email" type="email" placeholder="Enter your email" required />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="password">Password</Label>
                                        <Input name="password" id="password" type="password" placeholder="Enter your password" required />
                                    </div>
                                    <Button type="submit" className="w-full" disabled={isLoading}>
                                        {isLoading ? "Signing in..." : "Sign In"}
                                    </Button>
                                </form>
                            </TabsContent>

                            <TabsContent value="signup" className="space-y-4">
                                <form onSubmit={handleSignUp} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Full Name</Label>
                                        <Input name="name" id="name" placeholder="Enter your full name" required />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="signup-email">Email</Label>
                                        <Input name="signup-email" id="signup-email" type="email" placeholder="Enter your email" required />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="signup-password">Password</Label>
                                        <Input
                                            name="signup-password"
                                            id="signup-password"
                                            type="password"
                                            placeholder="Create a password (min. 6 characters)"
                                            required
                                            minLength={6}
                                        />
                                    </div>
                                    <Button type="submit" className="w-full" disabled={isLoading}>
                                        {isLoading ? "Creating account..." : "Create Account"}
                                    </Button>
                                </form>
                            </TabsContent>
                        </Tabs>

                        <div className="space-y-4 mt-6">
                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <Separator />
                                </div>
                                <div className="relative flex justify-center text-xs uppercase">
                                    <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                <Button
                                    variant="outline"
                                    disabled={isLoading}
                                    onClick={() => handleOAuthLogin('github')}
                                >
                                    <Github className="mr-2 h-4 w-4" />
                                    GitHub
                                </Button>
                                <Button
                                    variant="outline"
                                    disabled={isLoading}
                                    onClick={() => handleOAuthLogin('google')}
                                >
                                    <Mail className="mr-2 h-4 w-4" />
                                    Google
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
