"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Bot, Download, FileText, Presentation, Code, Mail, CheckCircle, ExternalLink } from "lucide-react"
import Link from "next/link"

export default function ExportPage() {
  const [selectedFormats, setSelectedFormats] = useState<string[]>([])
  const [email, setEmail] = useState("")
  const [isExporting, setIsExporting] = useState(false)

  const exportOptions = [
    {
      id: "pdf",
      title: "PDF Export",
      description: "Complete business plan with lean canvas, roadmap, and agent notes",
      icon: FileText,
      formats: ["Business Plan PDF", "Lean Canvas PDF", "Roadmap PDF"],
      size: "2.3 MB",
    },
    {
      id: "presentation",
      title: "Pitch Deck",
      description: "Professional presentation ready for investors",
      icon: Presentation,
      formats: ["PowerPoint", "Google Slides", "PDF"],
      size: "1.8 MB",
    },
    {
      id: "markdown",
      title: "Markdown Export",
      description: "Text-based format perfect for documentation",
      icon: FileText,
      formats: ["Markdown", "Notion Import"],
      size: "156 KB",
    },
    {
      id: "dev-tools",
      title: "Developer Tools",
      description: "Technical specifications and API schemas",
      icon: Code,
      formats: ["API Schema (JSON)", "Tech Stack", "Architecture Diagrams"],
      size: "892 KB",
    },
  ]

  const handleFormatToggle = (formatId: string) => {
    setSelectedFormats((prev) => (prev.includes(formatId) ? prev.filter((id) => id !== formatId) : [...prev, formatId]))
  }

  const handleExportAll = async () => {
    setIsExporting(true)
    // Simulate export process
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setIsExporting(false)
  }

  const handleSendToEmail = async () => {
    if (!email) return
    setIsExporting(true)
    // Simulate email sending
    await new Promise((resolve) => setTimeout(resolve, 1500))
    setIsExporting(false)
  }

  return (
    <div className="min-h-screen  bg-background">
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
              <Link href="/export" className="text-foreground">
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

      <div className="container mx-auto max-w-4xl py-6">
        <div className="space-y-6">
          {/* Header */}
          <div className="text-center space-y-4">
            <Badge variant="outline" className="mb-4">
              <Download className="mr-1 h-3 w-3" />
              Export & Download
            </Badge>
            <h1 className="text-3xl font-bold tracking-tight">Export Your Startup Assets</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Download your complete business plan, pitch deck, and technical specifications in various formats
            </p>
          </div>

          {/* Current Project Info */}
          <Card>
            <CardHeader>
              <CardTitle>Current Project: AI Code Review Tool</CardTitle>
              <CardDescription>Generated on January 15, 2024 • Simulation completed with 4 agents</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                <div className="flex items-center space-x-1">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Lean Canvas</span>
                </div>
                <div className="flex items-center space-x-1">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>MVP Roadmap</span>
                </div>
                <div className="flex items-center space-x-1">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Agent Discussions</span>
                </div>
                <div className="flex items-center space-x-1">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Technical Specs</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Export Options */}
          <div className="grid gap-6 md:grid-cols-2">
            {exportOptions.map((option) => (
              <Card
                key={option.id}
                className={`cursor-pointer transition-all ${selectedFormats.includes(option.id) ? "ring-2 ring-primary" : ""}`}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        <option.icon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{option.title}</CardTitle>
                        <CardDescription>{option.description}</CardDescription>
                      </div>
                    </div>
                    <Checkbox
                      checked={selectedFormats.includes(option.id)}
                      onCheckedChange={() => handleFormatToggle(option.id)}
                    />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Available formats:</span>
                      <Badge variant="outline">{option.size}</Badge>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {option.formats.map((format) => (
                        <Badge key={format} variant="secondary" className="text-xs">
                          {format}
                        </Badge>
                      ))}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => handleFormatToggle(option.id)}
                    >
                      <Download className="mr-2 h-4 w-4" />
                      {selectedFormats.includes(option.id) ? "Selected" : "Select"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Export Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Export Options</CardTitle>
              <CardDescription>Choose how you want to receive your exported files</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Download All */}
              <div className="space-y-3">
                <h4 className="font-medium">Download All Selected</h4>
                <p className="text-sm text-muted-foreground">
                  Download all selected formats as a ZIP file to your device
                </p>
                <Button
                  size="lg"
                  className="w-full"
                  onClick={handleExportAll}
                  disabled={selectedFormats.length === 0 || isExporting}
                >
                  <Download className="mr-2 h-4 w-4" />
                  {isExporting
                    ? "Preparing Download..."
                    : `Download ${selectedFormats.length} Format${selectedFormats.length !== 1 ? "s" : ""}`}
                </Button>
              </div>

              <Separator />

              {/* Send to Email */}
              <div className="space-y-3">
                <h4 className="font-medium">Send to Email</h4>
                <p className="text-sm text-muted-foreground">
                  Receive download links via email for easy access across devices
                </p>
                <div className="flex space-x-2">
                  <div className="flex-1">
                    <Label htmlFor="email" className="sr-only">
                      Email address
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <Button onClick={handleSendToEmail} disabled={!email || selectedFormats.length === 0 || isExporting}>
                    <Mail className="mr-2 h-4 w-4" />
                    Send
                  </Button>
                </div>
              </div>

              <Separator />

              {/* Export to Third-party */}
              <div className="space-y-3">
                <h4 className="font-medium">Export to Third-party Services</h4>
                <p className="text-sm text-muted-foreground">Directly export to your favorite productivity tools</p>
                <div className="grid gap-2 sm:grid-cols-3">
                  <Button variant="outline" size="sm" className="justify-start">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Export to Notion
                  </Button>
                  <Button variant="outline" size="sm" className="justify-start">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Save to Google Drive
                  </Button>
                  <Button variant="outline" size="sm" className="justify-start">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Send to Slack
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Export History */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Exports</CardTitle>
              <CardDescription>Your recent downloads and exports</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Complete Business Plan (PDF)</p>
                    <p className="text-xs text-muted-foreground">Exported 2 hours ago • 2.3 MB</p>
                  </div>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
                <Separator />
                <div className="flex items-center justify-between py-2">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Pitch Deck (PowerPoint)</p>
                    <p className="text-xs text-muted-foreground">Exported yesterday • 1.8 MB</p>
                  </div>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
                <Separator />
                <div className="flex items-center justify-between py-2">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">API Documentation (JSON)</p>
                    <p className="text-xs text-muted-foreground">Exported 3 days ago • 156 KB</p>
                  </div>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
