"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Mic,
  MicOff,
  Send,
  Settings,
  Users,
  Target,
  Code,
  Palette,
  TrendingUp,
  BarChart3,
  User,
  Volume2,
  Maximize,
  Minimize,
  Loader2,
  MessageSquare,
  Clock,
  Zap,
  Menu,
} from "lucide-react"
import { toast } from "sonner"

// Define types
interface SpeechRecognitionEvent extends Event {
  results: {
    [index: number]: {
      [index: number]: {
        transcript: string
      }
    }
  }
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean
  interimResults: boolean
  lang: string
  onresult: (event: SpeechRecognitionEvent) => void
  onerror: (event: SpeechRecognitionErrorEvent) => void
  onend: () => void
  start: () => void
  stop: () => void
}

interface CustomWindow extends Window {
  webkitSpeechRecognition?: {
    new(): SpeechRecognition
  }
  SpeechRecognition?: {
    new(): SpeechRecognition
  }
}

interface Conversation {
  user_message?: string
  agent_response: {
    message: string
    emotion?: string
    tone?: string
  }
  created_at: string
}

interface Agent {
  id: string
  name: string
  role: string
  iconComponent: React.ComponentType<{ className?: string }>
  color: string
  description: string
  avatar: string
  status: string
  lastMessage: string
}

interface Message {
  role: "user" | "assistant"
  content: string
  timestamp: Date
  emotion?: string
  tone?: string
}

const agents: Agent[] = [
  {
    id: "ceo",
    name: "Alex Chen",
    role: "CEO",
    iconComponent: Target,
    color: "bg-blue-500",
    description: "Strategic vision and business model",
    avatar: "/placeholder.svg?height=120&width=120",
    status: "active",
    lastMessage: "Let's discuss the market opportunity...",
  },
  {
    id: "cto",
    name: "Sarah Kim",
    role: "CTO",
    iconComponent: Code,
    color: "bg-green-500",
    description: "Technical architecture and development",
    avatar: "/placeholder.svg?height=120&width=120",
    status: "active",
    lastMessage: "The technical architecture looks solid...",
  },
  {
    id: "pm",
    name: "Mike Johnson",
    role: "Product Manager",
    iconComponent: BarChart3,
    color: "bg-purple-500",
    description: "Product roadmap and user experience",
    avatar: "/placeholder.svg?height=120&width=120",
    status: "active",
    lastMessage: "User feedback is crucial for our roadmap...",
  },
  {
    id: "designer",
    name: "Emma Davis",
    role: "Designer",
    iconComponent: Palette,
    color: "bg-pink-500",
    description: "Design system and user interface",
    avatar: "/placeholder.svg?height=120&width=120",
    status: "active",
    lastMessage: "The user experience should be intuitive...",
  },
  {
    id: "marketing",
    name: "Jordan Lee",
    role: "Marketing Lead",
    iconComponent: TrendingUp,
    color: "bg-orange-500",
    description: "Go-to-market and growth strategy",
    avatar: "/placeholder.svg?height=120&width=120",
    status: "active",
    lastMessage: "Our target audience is eco-conscious consumers...",
  },
]

const user = {
  id: "user",
  name: "You",
  role: "Founder",
  icon: User,
  color: "bg-slate-600",
  avatar: "/placeholder.svg?height=120&width=120",
  status: "active",
}

export default function Dashboard() {
  const params = useParams()

  const [message, setMessage] = useState("")
  const [isRecording, setIsRecording] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(true)
  const [rightSidebarOpen, setRightSidebarOpen] = useState(true)

  // Speech recognition setup
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null)

  // Chat states
  const [activeAgent, setActiveAgent] = useState<string | null>(null)
  const [conversations, setConversations] = useState<Record<string, Message[]>>({})
  const [isAgentSpeaking, setIsAgentSpeaking] = useState<Record<string, boolean>>({})

  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])
  const speechSynthesis = typeof window !== "undefined" ? window.speechSynthesis : null

  // Update getAccessToken function to use localStorage
  const getAccessToken = () => {
    try {
      const authData = localStorage.getItem("sb-rrgrmyonjpuvdsljsrrm-auth-token")
      if (!authData) return null

      const parsedData = JSON.parse(authData)
      return parsedData.access_token
    } catch (error) {
      console.error("Error getting access token:", error)
      return null
    }
  }

  useEffect(() => {
    if (typeof window !== "undefined") {
      const customWindow = window as CustomWindow
      if (customWindow.webkitSpeechRecognition || customWindow.SpeechRecognition) {
        const SpeechRecognitionConstructor = customWindow.webkitSpeechRecognition || customWindow.SpeechRecognition
        if (SpeechRecognitionConstructor) {
          const recognitionInstance = new SpeechRecognitionConstructor()
          recognitionInstance.continuous = false
          recognitionInstance.interimResults = false
          recognitionInstance.lang = "en-US"

          recognitionInstance.onresult = (event: SpeechRecognitionEvent) => {
            const transcript = event.results[0][0].transcript
            setMessage((prev) => prev + transcript)
          }

          recognitionInstance.onerror = (event: SpeechRecognitionErrorEvent) => {
            console.error("Speech recognition error:", event.error)
            toast.error("Speech recognition failed")
            setIsRecording(false)
          }

          recognitionInstance.onend = () => {
            setIsRecording(false)
          }

          setRecognition(recognitionInstance)
        }
      }
    }
  }, [])

  useEffect(() => {
    if (speechSynthesis) {
      const loadVoices = () => {
        const availableVoices = speechSynthesis.getVoices()
        console.log("Available voices:", availableVoices)
        setVoices(availableVoices)
      }

      loadVoices()
      speechSynthesis.addEventListener("voiceschanged", loadVoices)

      return () => {
        speechSynthesis.removeEventListener("voiceschanged", loadVoices)
      }
    }
  }, [])

  const startRecording = () => {
    if (recognition) {
      setIsRecording(true)
      recognition.start()
      toast.info("Listening... Speak now")
    } else {
      toast.error("Speech recognition not supported")
    }
  }

  const stopRecording = () => {
    if (recognition && isRecording) {
      recognition.stop()
      setIsRecording(false)
    }
  }

  const handleSendMessage = async () => {
    console.log("Send button clicked", { activeAgent, message }) // Debug log

    if (!activeAgent) {
      toast.error("Please select an agent first")
      return
    }

    if (!message.trim()) {
      toast.error("Please enter a message")
      return
    }

    try {
      setIsSending(true)
      await sendMessage(activeAgent, message)
    } catch (error) {
      console.error("Error in handleSendMessage:", error)
      toast.error("Failed to send message")
    } finally {
      setIsSending(false)
    }
  }

  const sendMessage = async (agentId: string, message: string) => {
    if (!message.trim()) return

    try {
      const accessToken = getAccessToken()
      console.log("Got access token:", !!accessToken) // Debug log

      if (!accessToken) {
        toast.error("Please sign in to continue")
        return
      }

      // Add user message to conversations immediately for UI feedback
      const userMessage = {
        role: "user" as const,
        content: message.trim(),
        timestamp: new Date(),
      }

      setConversations((prev) => ({
        ...prev,
        [agentId]: [...(prev[agentId] || []), userMessage],
      }))

      // Clear input and set loading state
      setMessage("")
      setIsAgentSpeaking((prev) => ({ ...prev, [agentId]: true }))

      const response = await fetch(`/api/simulate/${params.id}/conversations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          agentName: agentId,
          message: message.trim(),
          simulationId: params.id,
        }),
      })

      console.log("API Response status:", response.status) // Debug log

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error("API Error:", errorData) // Debug log
        throw new Error(errorData.error || "Failed to send message")
      }

      const data = await response.json()
      console.log("API Response data:", data) // Debug log

      if (!data.response) {
        throw new Error("Invalid response from server")
      }

      // Add agent response to conversations
      const agentMessage = {
        role: "assistant" as const,
        content: data.response.message,
        timestamp: new Date(),
        emotion: data.response.emotion,
        tone: data.response.tone,
      }

      setConversations((prev) => ({
        ...prev,
        [agentId]: [...(prev[agentId] || []), agentMessage],
      }))

      // Speak the response if not muted
      if (!isMuted) {
        speakText(data.response.message, agentId)
      }
    } catch (error) {
      console.error("Error in sendMessage:", error)
      toast.error(error instanceof Error ? error.message : "Failed to send message")

      // Remove the failed message from conversations
      setConversations((prev) => ({
        ...prev,
        [agentId]: prev[agentId]?.filter((msg) => msg.role !== "user" || msg.content !== message.trim()) || [],
      }))
      throw error
    } finally {
      setIsAgentSpeaking((prev) => ({ ...prev, [agentId]: false }))
    }
  }

  // Enhanced speakText function with complete response handling
  const speakText = (text: string, agentId: string) => {
    if (!speechSynthesis || isMuted) return

    try {
      // Cancel any ongoing speech
      speechSynthesis.cancel()

      // Ensure we have voices loaded
      if (voices.length === 0) {
        console.warn("No voices available, attempting to load voices")
        const availableVoices = speechSynthesis.getVoices()
        if (availableVoices.length > 0) {
          setVoices(availableVoices)
        } else {
          console.error("No voices available for speech synthesis")
          return
        }
      }

      // Split text into smaller chunks to prevent synthesis errors
      const chunks = text.match(/[^.!?]+[.!?]+/g) || [text]
      const processedChunks = chunks.map(chunk => chunk.trim()).filter(chunk => chunk.length > 0)

      if (processedChunks.length === 0) {
        console.warn("No valid text chunks to speak")
        return
      }

      // Create utterances for each chunk
      const utterances = processedChunks.map(chunk => {
        const utterance = new SpeechSynthesisUtterance(chunk)

        // Get all English voices
        const englishVoices = voices.filter((v) => v.lang.startsWith("en"))

        if (englishVoices.length === 0) {
          console.warn("No English voices available, using default voice")
          return utterance
        }

        // Voice preferences for each agent
        const voicePreferences = {
          ceo: {
            preferences: ["Microsoft David", "Google UK English Male", "Daniel"],
            gender: "male",
            backup: (v: SpeechSynthesisVoice) => v.name.includes("Male") && v.name.includes("US"),
          },
          cto: {
            preferences: ["Microsoft Zira", "Google UK English Female", "Samantha"],
            gender: "female",
            backup: (v: SpeechSynthesisVoice) => v.name.includes("Female") && v.name.includes("UK"),
          },
          pm: {
            preferences: ["Microsoft Mark", "US English Male", "Alex"],
            gender: "male",
            backup: (v: SpeechSynthesisVoice) => v.name.includes("Male") && v.name.includes("British"),
          },
          designer: {
            preferences: ["Microsoft Catherine", "Google US English Female", "Victoria"],
            gender: "female",
            backup: (v: SpeechSynthesisVoice) => v.name.includes("Female") && v.name.includes("Australian"),
          },
          marketing: {
            preferences: ["Microsoft Susan", "Karen", "Moira"],
            gender: "female",
            backup: (v: SpeechSynthesisVoice) => v.name.includes("Female") && v.name.includes("Irish"),
          },
        }

        try {
          // Get voice preferences for current agent
          const agentPrefs = voicePreferences[agentId as keyof typeof voicePreferences]

          // Try to find a voice matching preferences
          let selectedVoice = null

          if (agentPrefs) {
            // 1. Try to find exact match from preferences
            for (const prefName of agentPrefs.preferences) {
              const voice = englishVoices.find((v) => v.name.includes(prefName))
              if (voice) {
                selectedVoice = voice
                break
              }
            }

            // 2. If no preferred voice found, try backup criteria
            if (!selectedVoice) {
              selectedVoice = englishVoices.find(agentPrefs.backup)
            }

            // 3. Final fallback: any voice matching gender
            if (!selectedVoice) {
              selectedVoice = englishVoices.find((v) => v.name.toLowerCase().includes(agentPrefs.gender.toLowerCase()))
            }
          }

          // 4. Ultimate fallback: first available English voice
          if (!selectedVoice && englishVoices.length > 0) {
            selectedVoice = englishVoices[0]
          }

          if (selectedVoice) {
            utterance.voice = selectedVoice
          }

          // Customize voice parameters based on agent
          switch (agentId) {
            case "ceo":
              utterance.pitch = 1.0
              utterance.rate = 0.9
              break
            case "cto":
              utterance.pitch = 1.1
              utterance.rate = 1.1
              break
            case "pm":
              utterance.pitch = 1.0
              utterance.rate = 1.0
              break
            case "designer":
              utterance.pitch = 1.1
              utterance.rate = 1.0
              break
            case "marketing":
              utterance.pitch = 1.1
              utterance.rate = 1.0
              break
            default:
              utterance.pitch = 1.0
              utterance.rate = 1.0
          }

          // Set volume
          utterance.volume = 1.0

        } catch (error) {
          console.warn("Error setting up voice preferences:", error)
          // Return basic utterance if voice setup fails
          return utterance
        }

        return utterance
      })

      // Set speaking state at the start
      setIsAgentSpeaking((prev) => ({ ...prev, [agentId]: true }))

      let currentUtteranceIndex = 0
      let isSpeaking = true

      // Function to speak the next chunk
      const speakNext = () => {
        if (!isSpeaking) return

        if (currentUtteranceIndex < utterances.length) {
          const currentUtterance = utterances[currentUtteranceIndex]

          currentUtterance.onend = () => {
            if (!isSpeaking) return
            currentUtteranceIndex++
            if (currentUtteranceIndex < utterances.length) {
              // Add a small pause between sentences
              setTimeout(speakNext, 150)
            } else {
              // All chunks completed
              isSpeaking = false
              setIsAgentSpeaking((prev) => ({ ...prev, [agentId]: false }))
            }
          }

          currentUtterance.onerror = (event) => {
            console.error(`Speech error for agent ${agentId}:`, event)
            isSpeaking = false
            setIsAgentSpeaking((prev) => ({ ...prev, [agentId]: false }))

            // Try to recover by moving to next chunk
            currentUtteranceIndex++
            if (currentUtteranceIndex < utterances.length) {
              setTimeout(speakNext, 150)
            }
          }

          try {
            speechSynthesis.speak(currentUtterance)
          } catch (error) {
            console.error("Error speaking utterance:", error)
            isSpeaking = false
            setIsAgentSpeaking((prev) => ({ ...prev, [agentId]: false }))
          }
        }
      }

      // Start speaking the first chunk
      speakNext()

      // Add a cleanup function
      return () => {
        isSpeaking = false
        speechSynthesis.cancel()
        setIsAgentSpeaking((prev) => ({ ...prev, [agentId]: false }))
      }

    } catch (error) {
      console.error("Error in speech synthesis:", error)
      setIsAgentSpeaking((prev) => ({ ...prev, [agentId]: false }))
    }
  }

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }

  const handleAgentClick = (agentId: string) => {
    setActiveAgent(agentId)
    loadAgentConversations(agentId)
  }

  const loadAgentConversations = async (agentId: string) => {
    try {
      const accessToken = getAccessToken()
      if (!accessToken) {
        toast.error("Please sign in to continue")
        return
      }

      const response = await fetch(`/api/simulate/${params.id}/conversations?agent=${agentId}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error("Conversation loading error:", errorData)
        throw new Error(errorData.error || "Failed to load conversations")
      }

      const { conversations } = await response.json()

      if (!conversations || conversations.length === 0) {
        // If no conversations exist yet, initialize with empty array
        setConversations((prev) => ({
          ...prev,
          [agentId]: [],
        }))
        return
      }

      // Update conversations state with both user and agent messages
      const mappedConversations: Message[] = []
      conversations.forEach((conv: Conversation) => {
        // Add user message if it exists
        if (conv.user_message) {
          mappedConversations.push({
            role: "user",
            content: conv.user_message,
            timestamp: new Date(conv.created_at),
          })
        }
        // Add agent response
        mappedConversations.push({
          role: "assistant",
          content: conv.agent_response.message,
          timestamp: new Date(conv.created_at),
          emotion: conv.agent_response.emotion,
          tone: conv.agent_response.tone,
        })
      })

      setConversations((prev) => ({
        ...prev,
        [agentId]: mappedConversations,
      }))
    } catch (error) {
      console.error("Error loading conversations:", error)
      toast.error(error instanceof Error ? error.message : "Failed to load conversation history")
    }
  }

  // Add keypress handler for Enter key
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  // Format timestamp for display
  const formatTimestamp = (timestamp: Date) => {
    return timestamp.toLocaleString("en-US", {
      hour: "numeric",
      minute: "numeric",
      hour12: true,
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  // Get current agent
  const getCurrentAgent = () => {
    return activeAgent ? agents.find((a) => a.id === activeAgent) : null
  }

  // Render agent icon
  const renderAgentIcon = (agent: Agent | null | undefined) => {
    if (!agent?.iconComponent) return null
    const IconComponent = agent.iconComponent
    return <IconComponent className="h-4 w-4 text-white" />
  }

  // Add mute toggle function
  const toggleMute = () => {
    if (!isMuted && speechSynthesis?.speaking) {
      speechSynthesis.cancel()
    }
    setIsMuted(!isMuted)
  }

  return (
    <div className="h-screen w-screen p-2 overflow-hidden">
      {/* Floating Header Card */}
      <Card className="mb-2 py-0 shadow-lg border-0 backdrop-blur supports-[backdrop-filter]">
        <CardContent className="p-4 ">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLeftSidebarOpen(!leftSidebarOpen)}
              className="lg:hidden"
            >
              <Menu className="h-4 w-4" />
            </Button>

            <div className="flex items-center gap-3 flex-1">
              {getCurrentAgent() && (
                <>
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={getCurrentAgent()?.avatar || "/placeholder.svg"} />
                    <AvatarFallback className={getCurrentAgent()?.color}>
                      {renderAgentIcon(getCurrentAgent())}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h1 className="text-lg font-semibold">{getCurrentAgent()?.name}</h1>
                    <p className="text-sm text-muted-foreground">{getCurrentAgent()?.role}</p>
                  </div>
                </>
              )}
              {!activeAgent && (
                <div>
                  <h1 className="text-lg font-semibold">AI Team Dashboard</h1>
                  <p className="text-sm text-muted-foreground">Select an agent to start chatting</p>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              

              <Button variant="outline" size="sm">
                <Users className="h-4 w-4 mr-2" />
                {agents.length + 1}
              </Button>

              <Button variant="outline" size="sm" onClick={toggleFullscreen}>
                {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
              </Button>

           

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setRightSidebarOpen(!rightSidebarOpen)}
                className="lg:hidden"
              >
                <MessageSquare className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Area */}
      <div className="flex gap-4 h-[calc(100vh-110px)]">
        {/* Left Floating Sidebar - Agents */}
        {leftSidebarOpen && (
          <Card className="w-80 shadow-lg border-0 backdrop-blur supports-[backdrop-filter]">
            <CardContent className="p-0 h-full flex flex-col">
              {/* Sidebar Header */}
              <div className="border-b p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                    <Zap className="h-4 w-4 text-primary-foreground" />
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold">AI Team</h2>
                    <p className="text-xs text-muted-foreground">Select an agent</p>
                  </div>
                </div>
              </div>

              {/* Agents List */}
              <div className="flex-1 h-full overflow-y-auto p-4">
                <div className="space-y-1">

                  {agents.map((agent) => {
                    const IconComponent = agent.iconComponent
                    return (
                      <button
                        key={agent.id}
                        onClick={() => handleAgentClick(agent.id)}
                        className={`w-full p-3 rounded-lg text-left transition-all duration-200 hover:bg-muted/50 ${activeAgent === agent.id ? "bg-primary/10 border border-primary/20" : "hover:shadow-sm"
                          }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={agent.avatar || "/placeholder.svg"} />
                              <AvatarFallback className={agent.color}>
                                <IconComponent className="h-4 w-4 text-white" />
                              </AvatarFallback>
                            </Avatar>
                            <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 bg-green-500 rounded-full border-2 border-background"></div>
                          </div>
                          <div className="flex-1">
                            <div className="font-medium text-sm">{agent.name}</div>
                            <div className="text-xs text-muted-foreground">{agent.role}</div>
                          </div>
                          {isAgentSpeaking[agent.id] && (
                            <div className="flex items-center gap-1">
                              <div className="h-2 w-2 bg-blue-500 rounded-full animate-pulse"></div>
                              <Volume2 className="h-3 w-3 text-blue-500" />
                            </div>
                          )}
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Sidebar Footer */}
              <div className="border-t p-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.avatar || "/placeholder.svg"} />
                    <AvatarFallback className={user.color}>
                      <User className="h-4 w-4 text-white" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="font-medium text-sm">{user.name}</div>
                    <div className="text-xs text-muted-foreground">{user.role}</div>
                  </div>
                  <div className="flex items-center gap-1">
                    {isMuted ? <MicOff className="h-4 w-4 text-red-500" /> : <Mic className="h-4 w-4 text-green-500" />}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Center Content - Video Grid */}
        <div className="flex-1">
          <Card className="h-full shadow-lg border-0 backdrop-blur supports-[backdrop-filter]">
            <CardContent className="p-6 h-full overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
                {/* User Panel */}
                <Card className="relative  pb-0 overflow-hidden group border-2 border-primary/20">
                  <CardContent className="h-full w-full relative">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="relative">
                        <Avatar className="h-20 w-20 border-4 border-background shadow-lg">
                          <AvatarImage src={user.avatar || "/placeholder.svg"} />
                          <AvatarFallback className={user.color}>
                            <User className="h-10 w-10 text-white" />
                          </AvatarFallback>
                        </Avatar>
                        <div className="absolute -bottom-1 -right-1 h-6 w-6 bg-green-500 rounded-full border-3 border-background flex items-center justify-center">
                          <div className="h-2 w-2 bg-white rounded-full"></div>
                        </div>
                      </div>
                    </div>

                    {/* User Info Overlay */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-white text-sm">{user.name}</h3>
                          <p className="text-xs text-gray-300">{user.role}</p>
                        </div>
                        <div className="flex items-center gap-2">

                          {isMuted ? (
                            <MicOff className="h-4 w-4 text-red-400" />
                          ) : (
                            <Mic className="h-4 w-4 text-green-400" />
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Speaking Indicator */}
                    {!isMuted && (
                      <div className="absolute top-3 left-3">
                        <div className="flex items-center gap-1 bg-green-500/90 px-2 py-1 rounded-full">
                          <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                          <span className="text-xs text-white font-medium">Speaking</span>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Agent Panels */}
                {agents.map((agent) => {
                  const IconComponent = agent.iconComponent
                  return (
                    <Card
                      key={agent.id}
                      className={`relative overflow-hidden pb-0 group cursor-pointer transition-all duration-200 hover:shadow-lg ${activeAgent === agent.id ? "ring-2 ring-primary shadow-lg scale-[1.02]" : "hover:scale-[1.01]"
                        }`}
                      onClick={() => handleAgentClick(agent.id)}
                    >
                      <CardContent className="pb-0 aspect-video relative">
                        <div className="absolute inset-0 h-full w-full flex items-center justify-center">
                          <div className="relative">
                            <Avatar className="h-20 w-20 border-4 border-background shadow-lg">
                              <AvatarImage src={agent.avatar || "/placeholder.svg"} />
                              <AvatarFallback className={agent.color}>
                                <IconComponent className="h-10 w-10 text-white" />
                              </AvatarFallback>
                            </Avatar>
                            <div className="absolute -bottom-1 -right-1 h-6 w-6 bg-green-500 rounded-full border-3 border-background flex items-center justify-center">
                              <div className="h-2 w-2 bg-white rounded-full"></div>
                            </div>
                          </div>
                        </div>

                        {/* Agent Info Overlay */}
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="font-semibold text-white text-sm">{agent.name}</h3>
                              <p className="text-xs text-gray-300">{agent.role}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Volume2 className="h-4 w-4 text-green-400" />
                            </div>
                          </div>
                        </div>

                        {/* Agent Status */}
                        <div className="absolute top-3 right-3 flex items-center gap-2">
                          <Badge variant="secondary" className="bg-purple-600 text-white text-xs">
                            AI
                          </Badge>
                          {isSending && activeAgent === agent.id && (
                            <Badge variant="secondary" className="bg-amber-600 text-white text-xs">
                              <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                              Thinking
                            </Badge>
                          )}
                        </div>

                        {/* Speaking Indicator */}
                        {isAgentSpeaking[agent.id] && (
                          <div className="absolute top-3 left-3">
                            <div className="flex items-center gap-1 bg-blue-500/90 px-2 py-1 rounded-full">
                              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                              <span className="text-xs text-white font-medium">Speaking</span>
                            </div>
                          </div>
                        )}


                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Floating Sidebar - Chat */}
        {rightSidebarOpen && (
          <Card className="w-80 shadow-lg border-0  backdrop-blur supports-[backdrop-filter]">
            <CardContent className="p-0 h-full flex flex-col">
              {/* Chat Header */}
              <div className="border-b p-4">
                <div className="flex items-center gap-2 mb-2">
                  <MessageSquare className="h-5 w-5" />
                  <h3 className="text-lg font-semibold">
                    {activeAgent ? `Response with ${agents.find((a) => a.id === activeAgent)?.name}` : "Select an Agent"}
                  </h3>
                </div>
                {activeAgent && (
                  <p className="text-sm text-muted-foreground">
                    {agents.find((a) => a.id === activeAgent)?.description}
                  </p>
                )}
              </div>

              {/* Chat Messages - Scrollable */}
              <div className="flex-1 overflow-y-auto p-4">
                <div className="space-y-4">
                  {activeAgent && conversations[activeAgent]?.length > 0 ? (
                    conversations[activeAgent].map((msg, index) => (
                      <div
                        key={index}
                        className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} animate-in slide-in-from-bottom-2 duration-300`}
                      >
                        <div
                          className={`max-w-[85%] rounded-2xl px-4 py-3 ${msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
                            }`}
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <Avatar className="h-5 w-5">
                              <AvatarImage
                                src={
                                  msg.role === "user" ? user.avatar : agents.find((a) => a.id === activeAgent)?.avatar
                                }
                              />
                              <AvatarFallback
                                className={`text-xs ${msg.role === "user" ? user.color : getCurrentAgent()?.color}`}
                              >
                                {msg.role === "user" ? (
                                  <User className="h-3 w-3 text-white" />
                                ) : (
                                  renderAgentIcon(getCurrentAgent())
                                )}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-xs font-medium">
                              {msg.role === "user" ? user.name : agents.find((a) => a.id === activeAgent)?.name}
                            </span>
                          </div>
                          <p className="text-sm leading-relaxed">{msg.content}</p>
                          <div className="flex items-center gap-2 mt-2 text-xs opacity-70">
                            <Clock className="h-3 w-3" />
                            <span>{formatTimestamp(msg.timestamp)}</span>

                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center py-12">
                      <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="font-medium text-lg mb-2">
                        {activeAgent ? "Start the conversation" : "Select an agent"}
                      </h3>
                      <p className="text-sm text-muted-foreground max-w-sm">
                        {activeAgent
                          ? `Begin chatting with ${agents.find((a) => a.id === activeAgent)?.name} to get expert insights.`
                          : "Choose an AI agent from the sidebar to start a conversation."}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Floating Bottom Input Deck */}
      <div className="fixed md:w-fit w-full bottom-8 left-1/2  transform -translate-x-1/2 z-50">
        <Card className="shadow-xl p-2 w-full border-0  backdrop-blur supports-[backdrop-filter]">
          <CardContent className="p-2">
            <div className="flex items-center gap-3 w-full max-w-[780px]">
              {/* Input Section */}
              <div className="flex-1 relative">
                <Input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={
                    activeAgent
                      ? `Ask ${agents.find((a) => a.id === activeAgent)?.name} something...`
                      : "Select an agent to start chatting..."
                  }
                  className="pr-12 h-12 text-base"
                  onKeyPress={handleKeyPress}
                  disabled={!activeAgent || isSending}
                />
                <Button
                  size="sm"
                  variant="ghost"
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
                  onClick={isRecording ? stopRecording : startRecording}
                  disabled={!activeAgent}
                >
                  {isRecording ? (
                    <MicOff className="h-4 w-4 text-red-500" />
                  ) : (
                    <Mic className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>

              {/* Send Button */}
              <Button
                onClick={handleSendMessage}
                disabled={!message.trim() || isSending || !activeAgent}
                className="h-12 px-6"
              >
                {isSending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Sending
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Send
                  </>
                )}
              </Button>

              {/* Control Buttons */}
              <div className="flex items-center gap-2">
                <Button
                  variant={isMuted ? "destructive" : "outline"}
                  size="sm"
                  onClick={toggleMute}
                  className="h-12 w-12 p-0"
                >
                  {isMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                </Button>

                <Button variant="outline" size="sm" className="h-12 w-12 p-0">
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Recording Indicator */}
            {isRecording && (
              <div className="flex items-center justify-center mt-3 pt-3 border-t">
                <div className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-full">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium">Recording voice input...</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
