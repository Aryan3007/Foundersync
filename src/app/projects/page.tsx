"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Bot, Search, Filter, MoreHorizontal, Calendar, Users, Eye, Plus } from "lucide-react"
import Link from "next/link"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

interface Conversation {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  emotion?: string;
  tone?: string;
}

interface Simulation {
  id: string;
  startup_name: string;
  description: string;
  industry: string;
  created_at: string;
  status: string;
  agents: string[];
  conversations: Record<string, Conversation[]>;
}

export default function ProjectsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState("recent")
  const [simulations, setSimulations] = useState<Simulation[]>([])
  const [loading, setLoading] = useState(true)

  const supabase = createClientComponentClient()

  // Get access token from localStorage
  const getAccessToken = () => {
    try {
      const authData = localStorage.getItem('sb-rrgrmyonjpuvdsljsrrm-auth-token')
      if (!authData) return null
      const parsedData = JSON.parse(authData)
      return parsedData.access_token
    } catch (error) {
      console.error('Error getting access token:', error)
      return null
    }
  }

  useEffect(() => {
    fetchSimulations()
  }, [])

  const fetchSimulations = async () => {
    try {
      const accessToken = getAccessToken()

      if (!accessToken) {
        console.error("No access token found")
        return
      }

      // First fetch simulations
      const { data: simulationsData, error: simulationsError } = await supabase
        .from('simulations')
        .select('*')
        .order('created_at', { ascending: false })

      if (simulationsError) {
        console.error("Error fetching simulations:", simulationsError)
        return
      }

      // Then fetch conversations for each simulation
      const simulationsWithConversations = await Promise.all(
        (simulationsData || []).map(async (simulation) => {
          const { data: conversationsData, error: conversationsError } = await supabase
            .from('conversations')
            .select('*')
            .eq('simulation_id', simulation.id)
            .order('created_at', { ascending: true })

          if (conversationsError) {
            console.error(`Error fetching conversations for simulation ${simulation.id}:`, conversationsError)
            return {
              ...simulation,
              conversations: []
            }
          }

          // Group conversations by agent
          const conversationsByAgent = conversationsData?.reduce((acc: Record<string, Conversation[]>, conv) => {
            if (!acc[conv.agent_name]) {
              acc[conv.agent_name] = [];
            }
            acc[conv.agent_name].push({
              role: conv.user_message ? 'user' : 'assistant',
              content: conv.user_message || conv.agent_response.message,
              timestamp: conv.created_at,
              emotion: conv.agent_response?.emotion,
              tone: conv.agent_response?.tone
            });
            return acc;
          }, {}) || {};

          return {
            ...simulation,
            conversations: conversationsByAgent
          }
        })
      )

      setSimulations(simulationsWithConversations)
      console.log("Simulations with conversations:", simulationsWithConversations)
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "default"
      case "in-progress":
        return "secondary"
      case "draft":
        return "outline"
      default:
        return "outline"
    }
  }

  const getStatusText = (status: string) => {
    return status ? status.charAt(0).toUpperCase() + status.slice(1) : "Draft"
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

        </div>
      </nav>

      <div className="container py-6">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
              <p className="text-muted-foreground">Manage and view your startup simulations</p>
            </div>
            <div className="flex items-center space-x-2">
              <Button size="sm" asChild>
                <Link href="/idea-input">
                  <Plus className="mr-2 h-4 w-4" />
                  New Project
                </Link>
              </Button>
            </div>
          </div>

          {/* Filters and Search */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col space-y-4 md:flex-row md:items-center md:space-x-4 md:space-y-0">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Search projects..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="recent">Most Recent</SelectItem>
                      <SelectItem value="oldest">Oldest First</SelectItem>
                      <SelectItem value="name">Name A-Z</SelectItem>
                      <SelectItem value="status">Status</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Projects Grid */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {simulations.map((simulation) => (
                <Card key={simulation.id} className="group hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-lg">{simulation.startup_name}</CardTitle>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline">{simulation.industry}</Badge>
                          <Badge variant={getStatusColor(simulation.status)}>{getStatusText(simulation.status)}</Badge>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                    <CardDescription className="line-clamp-2">{simulation.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Agents */}
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <Users className="h-4 w-4" />
                        <span>Agents:</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {["CEO", "CTO", "PM", "Designer", "Marketing"].map((agent) => (
                          <Badge key={agent} variant="secondary" className="text-xs">
                            {agent}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Date */}
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>Created {new Date(simulation.created_at).toLocaleDateString()}</span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-2 pt-2">
                      <Button size="sm" className="flex-1" asChild>
                        <Link href={`/dashboard/simulation/${simulation.id}`}>
                          <Eye className="mr-2 h-4 w-4" />
                          Open
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!loading && simulations.length === 0 && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Bot className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No projects yet</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Start your first startup simulation to see it here
                </p>
                <Button asChild>
                  <Link href="/idea-input">
                    <Plus className="mr-2 h-4 w-4" />
                    Create First Project
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
