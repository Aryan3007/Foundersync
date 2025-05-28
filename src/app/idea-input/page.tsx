"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Lightbulb, Settings, Users, Zap } from "lucide-react"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { fetchWithAuth } from "@/lib/api-utils"

export default function IdeaInputPage() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [formData, setFormData] = useState({
        startupName: "",
        description: "",
        industry: "",
        goal: "",
        role: "",
    })
    const [showAdvanced, setShowAdvanced] = useState(false)
    const [agents, setAgents] = useState({
        ceo: true,
        cto: true,
        pm: true,
        designer: true,
        marketing: true,
    })

    useEffect(() => {
        // Check authentication on component mount
        const accessToken = localStorage.getItem('sb-rrgrmyonjpuvdsljsrrm-auth-token')
        if (!accessToken) {
            toast.error("Please sign in to continue")
            router.push("/auth")
        }
    }, [router])

    const handleStartSimulation = async () => {
        try {
            setIsLoading(true)

            // Validate required fields
            if (!formData.startupName || !formData.description || !formData.industry) {
                toast.error("Please fill in all required fields")
                return
            }

            const response = await fetchWithAuth("/api/simulate/start", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    startupName: formData.startupName,
                    description: formData.description,
                    industry: formData.industry
                }),
            })

            const data = await response.json()

            if (!response.ok) {
                console.error('Server error response:', data)
                throw new Error(data.message || "Failed to start simulation")
            }

            toast.success("Simulation created successfully!")
            router.push(`/dashboard/simulation/${data.simulationId}`)
        } catch (error) {
            console.error("Error starting simulation:", error)
            toast.error(error instanceof Error ? error.message : "Failed to start simulation. Please try again.")
        } finally {
            setIsLoading(false)
        }
    }

    const industries = [
        "SaaS",
        "E-commerce",
        "Health & Wellness",
        "FinTech",
        "EdTech",
        "AI & Machine Learning",
        "Mobile Apps",
        "Gaming",
        "IoT",
        "Other",
    ]

    const exampleIdeas = [
        {
            name: "FitGenius",
            description: "AI-powered personal fitness coach that creates customized workout and nutrition plans",
            industry: "Health & Wellness",
        },
        {
            name: "CodeReview.ai",
            description: "Automated code review tool for development teams using AI to detect bugs and suggest improvements",
            industry: "SaaS",
        },
        {
            name: "EcoStyle",
            description: "Sustainable fashion marketplace connecting eco-conscious consumers with ethical clothing brands",
            industry: "E-commerce",
        },
    ]

    return (
        <div className="min-h-screen max-w-7xl mx-auto bg-background">
            <div className="container mx-auto max-w-4xl py-8">
                <div className="space-y-6">
                    {/* Header */}
                    <div className="text-center space-y-4">
                        <Badge variant="outline" className="mb-4">
                            <Lightbulb className="mr-1 h-3 w-3" />
                            Startup Idea Input
                        </Badge>
                        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Describe Your Startup Idea</h1>
                        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                            Tell us about your startup concept and watch our AI agents transform it into a complete business plan
                        </p>
                    </div>

                    {/* Main Form */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Startup Details</CardTitle>
                            <CardDescription>Provide as much detail as possible to get the best simulation results</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Startup Name */}
                            <div className="space-y-2">
                                <Label htmlFor="startupName">Startup Name *</Label>
                                <Input
                                    id="startupName"
                                    value={formData.startupName}
                                    onChange={(e) => setFormData((prev) => ({ ...prev, startupName: e.target.value }))}
                                    placeholder="Enter your startup name"
                                    required
                                />
                            </div>

                            {/* Industry */}
                            <div className="space-y-2">
                                <Label htmlFor="industry">Industry *</Label>
                                <Select
                                    value={formData.industry}
                                    onValueChange={(value) => setFormData((prev) => ({ ...prev, industry: value }))}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select your industry" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {industries.map((industry) => (
                                            <SelectItem key={industry} value={industry}>
                                                {industry}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Description */}
                            <div className="space-y-2">
                                <Label htmlFor="description">Description *</Label>
                                <Textarea
                                    id="description"
                                    value={formData.description}
                                    onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                                    placeholder="Describe your startup idea in detail. What problem does it solve? Who is your target audience? What makes it unique?"
                                    className="min-h-[120px]"
                                    required
                                />
                            </div>

                            {/* Example Ideas */}
                            <div className="space-y-2">
                                <Label>Need inspiration? Try these examples:</Label>
                                <div className="grid gap-2 sm:grid-cols-2">
                                    {exampleIdeas.map((example, index) => (
                                        <Button
                                            key={index}
                                            variant="outline"
                                            className="h-auto p-3 text-left justify-start"
                                            onClick={() =>
                                                setFormData((prev) => ({
                                                    ...prev,
                                                    startupName: example.name,
                                                    description: example.description,
                                                    industry: example.industry,
                                                }))
                                            }
                                        >
                                            <div className="space-y-1">
                                                <div className="font-medium">{example.name}</div>
                                                <div className="text-sm text-wrap text-muted-foreground">{example.description}</div>
                                            </div>
                                        </Button>
                                    ))}
                                </div>
                            </div>

                            {/* Goal Selection */}
                            <div className="space-y-2">
                                <Label htmlFor="goal">Primary Goal *</Label>
                                <Select
                                    value={formData.goal}
                                    onValueChange={(value) => setFormData((prev) => ({ ...prev, goal: value }))}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="What do you want to achieve?" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="mvp">Build MVP Strategy</SelectItem>
                                        <SelectItem value="fundraising">Fundraising Plan</SelectItem>
                                        <SelectItem value="gtm">Go-to-Market Strategy</SelectItem>
                                        <SelectItem value="validation">Idea Validation</SelectItem>
                                        <SelectItem value="complete">Complete Business Plan</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* User Role */}
                            <div className="space-y-2">
                                <Label htmlFor="role">Your Role (Optional)</Label>
                                <Select
                                    value={formData.role}
                                    onValueChange={(value) => setFormData((prev) => ({ ...prev, role: value }))}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select your role to tailor the simulation" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="founder">Founder/CEO</SelectItem>
                                        <SelectItem value="technical">Technical Lead/CTO</SelectItem>
                                        <SelectItem value="product">Product Manager</SelectItem>
                                        <SelectItem value="marketing">Marketing Lead</SelectItem>
                                        <SelectItem value="investor">Investor/Advisor</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Advanced Settings Toggle */}
                            <div className="flex items-center space-x-2">
                                <Switch id="advanced" checked={showAdvanced} onCheckedChange={setShowAdvanced} />
                                <Label htmlFor="advanced" className="flex items-center gap-2">
                                    <Settings className="h-4 w-4" />
                                    Advanced Settings
                                </Label>
                            </div>

                            {/* Advanced Settings */}
                            {showAdvanced && (
                                <Card className="border-dashed">
                                    <CardHeader>
                                        <CardTitle className="text-lg">Agent Configuration</CardTitle>
                                        <CardDescription>Choose which AI agents to include in your simulation</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="grid gap-4 sm:grid-cols-2">
                                            {Object.entries(agents).map(([key, enabled]) => (
                                                <div key={key} className="flex items-center justify-between space-x-2">
                                                    <div className="flex items-center space-x-2">
                                                        <Users className="h-4 w-4 text-muted-foreground" />
                                                        <Label htmlFor={key} className="capitalize">
                                                            {key === "ceo"
                                                                ? "CEO"
                                                                : key === "cto"
                                                                    ? "CTO"
                                                                    : key === "pm"
                                                                        ? "Product Manager"
                                                                        : key === "marketing"
                                                                            ? "Marketing Lead"
                                                                            : "Designer"}
                                                        </Label>
                                                    </div>
                                                    <Switch
                                                        id={key}
                                                        checked={enabled}
                                                        onCheckedChange={(checked) => setAgents((prev) => ({ ...prev, [key]: checked }))}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Action Buttons */}
                            <div className="flex flex-col sm:flex-row gap-3 pt-4">
                                <Button
                                    size="lg"
                                    className="flex-1"
                                    onClick={handleStartSimulation}
                                    disabled={isLoading || !formData.startupName || !formData.description || !formData.industry}
                                >
                                    {isLoading ? (
                                        <>
                                            <Zap className="mr-2 h-4 w-4 animate-spin" />
                                            Starting Simulation...
                                        </>
                                    ) : (
                                        <>
                                            <Zap className="mr-2 h-4 w-4" />
                                            Start Simulation
                                            <ArrowRight className="ml-2 h-4 w-4" />
                                        </>
                                    )}
                                </Button>
                            </div>

                            <p className="text-sm text-muted-foreground text-center">
                                Simulation typically takes 2-5 minutes to complete
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
