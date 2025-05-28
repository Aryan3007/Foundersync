"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Bot, Lightbulb, Target, Users, Zap, CheckCircle, Github, Twitter, Mail } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

export default function LandingPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        setIsAuthenticated(!!session)
      } catch (error) {
        console.error("Error checking session:", error)
      } finally {
        setIsLoading(false)
      }
    }

    checkSession()

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut()
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  return (
    <div className="min-h-screen max-w-7xl mx-auto bg-background">
      {/* Navigation */}
      <nav className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <div className="mr-4 flex">
            <Link href="/" className="mr-6 flex items-center space-x-2">
              <Bot className="h-6 w-6" />
              <span className="font-bold">Foundersync</span>
            </Link>
          </div>
          <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
            <nav className="flex items-center space-x-6 text-sm font-medium">
              <Link href="#features" className="transition-colors hover:text-foreground/80">
                Features
              </Link>
              <Link href="#how-it-works" className="transition-colors hover:text-foreground/80">
                How it Works
              </Link>
              <Link href="#examples" className="transition-colors hover:text-foreground/80">
                Examples
              </Link>
            </nav>
            <div className="flex items-center space-x-2">
              {!isLoading && (
                isAuthenticated ? (
                  <>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href="/dashboard">Dashboard</Link>
                    </Button>
                    <Button variant="ghost" size="sm" onClick={handleSignOut}>
                      Sign Out
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href="/auth">Login</Link>
                    </Button>
                    <Button size="sm" asChild>
                      <Link href="/idea-input">Try Simulation</Link>
                    </Button>
                  </>
                )
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container space-y-6 py-8 md:py-12 lg:py-32">
        <div className="mx-auto flex max-w-[980px] flex-col items-center gap-2 text-center">
          <Badge variant="outline" className="mb-4">
            <Zap className="mr-1 h-3 w-3" />
            AI-Powered Startup Simulation
          </Badge>
          <h1 className="text-3xl font-bold leading-tight tracking-tighter md:text-6xl lg:leading-[1.1]">
            Turn Your Startup Idea Into a
            <span className="bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
              {" "}
              Complete Business Plan
            </span>
          </h1>
          <p className="max-w-[750px] text-lg text-muted-foreground sm:text-xl">
            Watch AI agents collaborate as a virtual startup team. Get lean canvas, roadmaps, and actionable insights in
            minutes, not months.
          </p>
          <div className="flex flex-col gap-2 min-[400px]:flex-row">
            <Button size="lg" asChild>
              <Link href="/idea-input">
                Create Simulation <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="/projects">View Projects</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="container space-y-6 py-8 md:py-12 lg:py-24">
        <div className="mx-auto flex max-w-[980px] flex-col items-center gap-4 text-center">
          <h2 className="text-3xl font-bold leading-tight tracking-tighter md:text-5xl">How It Works</h2>
          <p className="max-w-[700px] text-lg text-muted-foreground">
            Our AI agents work together like a real startup team to validate and develop your idea
          </p>
        </div>
        <div className="mx-auto grid justify-center gap-4 sm:grid-cols-2 md:max-w-[64rem] md:grid-cols-3">
          <Card className="relative overflow-hidden">
            <CardHeader>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500/10">
                <Lightbulb className="h-6 w-6 text-blue-500" />
              </div>
              <CardTitle>1. Input Your Idea</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Describe your startup concept and goals. Our system tailors the simulation to your specific needs.
              </CardDescription>
            </CardContent>
          </Card>
          <Card className="relative overflow-hidden">
            <CardHeader>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-500/10">
                <Users className="h-6 w-6 text-purple-500" />
              </div>
              <CardTitle>2. AI Agents Collaborate</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Watch CEO, CTO, PM, and Designer agents discuss, debate, and build your startup strategy in real-time.
              </CardDescription>
            </CardContent>
          </Card>
          <Card className="relative overflow-hidden">
            <CardHeader>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-500/10">
                <Target className="h-6 w-6 text-green-500" />
              </div>
              <CardTitle>3. Get Actionable Results</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Export lean canvas, roadmaps, pitch decks, and technical specifications ready for implementation.
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Example Simulations */}
      <section id="examples" className="container space-y-6 py-8 md:py-12 lg:py-24">
        <div className="mx-auto flex max-w-[980px] flex-col items-center gap-4 text-center">
          <h2 className="text-3xl font-bold leading-tight tracking-tighter md:text-5xl">Example Simulations</h2>
          <p className="max-w-[700px] text-lg text-muted-foreground">
            See what our AI agents have built for other startup ideas
          </p>
        </div>
        <div className="mx-auto grid justify-center gap-4 sm:grid-cols-2 md:max-w-[64rem] md:grid-cols-2">
          <Card className="relative overflow-hidden">
            <CardHeader>
              <Badge variant="secondary" className="w-fit">
                SaaS
              </Badge>
              <CardTitle>AI-Powered Code Review Tool</CardTitle>
              <CardDescription>Developer productivity platform with automated code analysis</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Lean Canvas completed in 3 minutes
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle className="h-4 w-4 text-green-500" />
                18-month roadmap with 47 features
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Technical architecture & API specs
              </div>
              <Button variant="outline" size="sm" className="mt-4">
                View Simulation
              </Button>
            </CardContent>
          </Card>
          <Card className="relative overflow-hidden">
            <CardHeader>
              <Badge variant="secondary" className="w-fit">
                E-commerce
              </Badge>
              <CardTitle>Sustainable Fashion Marketplace</CardTitle>
              <CardDescription>Platform connecting eco-conscious consumers with sustainable brands</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Market analysis & competitor research
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Revenue model with projections
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Go-to-market strategy
              </div>
              <Button variant="outline" size="sm" className="mt-4">
                View Simulation
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Features Overview */}
      <section id="features" className="container space-y-6 py-8 md:py-12 lg:py-24">
        <div className="mx-auto flex max-w-[980px] flex-col items-center gap-4 text-center">
          <h2 className="text-3xl font-bold leading-tight tracking-tighter md:text-5xl">
            Everything You Need to Validate Your Startup
          </h2>
        </div>
        <div className="mx-auto grid justify-center gap-4 sm:grid-cols-2 md:max-w-[64rem] md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Lean Canvas Generator</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Auto-generated business model canvas with problem validation, solution fit, and revenue streams.
              </CardDescription>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>MVP Task Board</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Kanban-style board with prioritized features, technical requirements, and development timeline.
              </CardDescription>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Agent Boardroom</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Watch AI agents debate strategy, make decisions, and collaborate like a real founding team.
              </CardDescription>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Feature Roadmap</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Timeline-based roadmap with milestones, dependencies, and resource allocation.
              </CardDescription>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Pitch Deck Export</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Professional pitch deck generation with market analysis, financial projections, and compelling
                narrative.
              </CardDescription>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Technical Specs</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Architecture diagrams, API specifications, and technology stack recommendations.
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container space-y-6 py-8 md:py-12 lg:py-24">
        <div className="mx-auto flex max-w-[980px] flex-col items-center gap-4 text-center">
          <h2 className="text-3xl font-bold leading-tight tracking-tighter md:text-5xl">
            Ready to Simulate Your Startup?
          </h2>
          <p className="max-w-[700px] text-lg text-muted-foreground">
            Join thousands of entrepreneurs who&apos;ve validated their ideas with AI agents
          </p>
          <div className="flex flex-col gap-2 min-[400px]:flex-row">
            <Button size="lg" asChild>
              <Link href="/idea-input">
                Start Free Simulation <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="/auth">Sign Up for Pro</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40">
        <div className="container flex flex-col items-center justify-between gap-4 py-10 md:h-24 md:flex-row md:py-0">
          <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
            <Bot className="h-6 w-6" />
            <p className="text-center text-sm leading-loose md:text-left">
              Built by the Foundersync team. Open source on{" "}
              <Link href="#" className="font-medium underline underline-offset-4">
                GitHub
              </Link>
              .
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="#" className="text-muted-foreground hover:text-foreground">
              <Github className="h-5 w-5" />
            </Link>
            <Link href="#" className="text-muted-foreground hover:text-foreground">
              <Twitter className="h-5 w-5" />
            </Link>
            <Link href="#" className="text-muted-foreground hover:text-foreground">
              <Mail className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
