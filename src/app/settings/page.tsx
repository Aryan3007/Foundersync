"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Bot, User, Brain, Bell, Shield, CreditCard, Trash2 } from "lucide-react"
import Link from "next/link"

export default function SettingsPage() {
  const [profile, setProfile] = useState({
    name: "John Doe",
    email: "john@example.com",
    company: "TechCorp Inc.",
    role: "founder",
  })

  const [preferences, setPreferences] = useState({
    llmProvider: "openai",
    simulationDepth: "detailed",
    saveMemory: true,
    emailNotifications: true,
    agentPersonalities: true,
  })

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
          <div className="flex flex-1 items-center justify-between space-x-2">
            <div className="flex items-center space-x-6 text-sm font-medium">
              <Link href="/dashboard" className="text-muted-foreground hover:text-foreground">
                Dashboard
              </Link>
              <Link href="/projects" className="text-muted-foreground hover:text-foreground">
                Projects
              </Link>
              <Link href="/export" className="text-muted-foreground hover:text-foreground">
                Export
              </Link>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/settings">Settings</Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="container max-w-4xl py-6">
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
            <p className="text-muted-foreground">Manage your account preferences and simulation settings</p>
          </div>

          {/* Profile Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Profile Information
              </CardTitle>
              <CardDescription>Update your personal information and preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center space-x-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src="/placeholder.svg?height=80&width=80" />
                  <AvatarFallback>JD</AvatarFallback>
                </Avatar>
                <div className="space-y-2">
                  <Button variant="outline" size="sm">
                    Change Avatar
                  </Button>
                  <p className="text-xs text-muted-foreground">JPG, PNG or GIF. Max size 2MB.</p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={profile.name}
                    onChange={(e) => setProfile((prev) => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile((prev) => ({ ...prev, email: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company">Company</Label>
                  <Input
                    id="company"
                    value={profile.company}
                    onChange={(e) => setProfile((prev) => ({ ...prev, company: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Primary Role</Label>
                  <Select
                    value={profile.role}
                    onValueChange={(value) => setProfile((prev) => ({ ...prev, role: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="founder">Founder/CEO</SelectItem>
                      <SelectItem value="technical">Technical Lead</SelectItem>
                      <SelectItem value="product">Product Manager</SelectItem>
                      <SelectItem value="marketing">Marketing Lead</SelectItem>
                      <SelectItem value="investor">Investor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button>Save Changes</Button>
            </CardContent>
          </Card>

          {/* AI & Simulation Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                AI & Simulation Settings
              </CardTitle>
              <CardDescription>Configure how AI agents behave in your simulations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="llm-provider">LLM Provider</Label>
                  <Select
                    value={preferences.llmProvider}
                    onValueChange={(value) => setPreferences((prev) => ({ ...prev, llmProvider: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="openai">OpenAI (GPT-4)</SelectItem>
                      <SelectItem value="anthropic">Anthropic (Claude)</SelectItem>
                      <SelectItem value="gemini">Google (Gemini)</SelectItem>
                      <SelectItem value="openrouter">OpenRouter</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Choose your preferred AI model for agent conversations
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="simulation-depth">Simulation Depth</Label>
                  <Select
                    value={preferences.simulationDepth}
                    onValueChange={(value) => setPreferences((prev) => ({ ...prev, simulationDepth: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="quick">Quick (2-3 minutes)</SelectItem>
                      <SelectItem value="standard">Standard (5-7 minutes)</SelectItem>
                      <SelectItem value="detailed">Detailed (10-15 minutes)</SelectItem>
                      <SelectItem value="comprehensive">Comprehensive (20+ minutes)</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Longer simulations provide more detailed analysis and discussions
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Agent Personalities</Label>
                    <p className="text-xs text-muted-foreground">Enable distinct personalities for each AI agent</p>
                  </div>
                  <Switch
                    checked={preferences.agentPersonalities}
                    onCheckedChange={(checked) => setPreferences((prev) => ({ ...prev, agentPersonalities: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Save Conversation Memory</Label>
                    <p className="text-xs text-muted-foreground">Allow agents to remember previous discussions</p>
                  </div>
                  <Switch
                    checked={preferences.saveMemory}
                    onCheckedChange={(checked) => setPreferences((prev) => ({ ...prev, saveMemory: checked }))}
                  />
                </div>
              </div>

              <Button>Save AI Settings</Button>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notifications
              </CardTitle>
              <CardDescription>Choose what notifications you want to receive</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Email Notifications</Label>
                  <p className="text-xs text-muted-foreground">
                    Receive updates about simulation completion and new features
                  </p>
                </div>
                <Switch
                  checked={preferences.emailNotifications}
                  onCheckedChange={(checked) => setPreferences((prev) => ({ ...prev, emailNotifications: checked }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Simulation Alerts</Label>
                  <p className="text-xs text-muted-foreground">
                    Get notified when simulations complete or encounter issues
                  </p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Weekly Reports</Label>
                  <p className="text-xs text-muted-foreground">Receive weekly summaries of your simulation activity</p>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>

          {/* Usage & Billing */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Usage & Billing
              </CardTitle>
              <CardDescription>Monitor your usage and manage your subscription</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <p className="text-sm font-medium">Current Plan</p>
                  <p className="text-2xl font-bold">Pro</p>
                  <p className="text-xs text-muted-foreground">$29/month</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">Simulations Used</p>
                  <p className="text-2xl font-bold">47/100</p>
                  <p className="text-xs text-muted-foreground">This month</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">Next Billing</p>
                  <p className="text-2xl font-bold">Feb 15</p>
                  <p className="text-xs text-muted-foreground">2024</p>
                </div>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Upgrade to Enterprise</p>
                  <p className="text-sm text-muted-foreground">
                    Unlimited simulations, priority support, and custom agents
                  </p>
                </div>
                <Button variant="outline">Upgrade</Button>
              </div>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="border-destructive/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <Shield className="h-5 w-5" />
                Danger Zone
              </CardTitle>
              <CardDescription>Irreversible actions that affect your account</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Delete All Projects</p>
                  <p className="text-sm text-muted-foreground">Permanently delete all your simulations and data</p>
                </div>
                <Button variant="destructive" size="sm">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete All
                </Button>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Delete Account</p>
                  <p className="text-sm text-muted-foreground">
                    Permanently delete your account and all associated data
                  </p>
                </div>
                <Button variant="destructive" size="sm">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Account
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
