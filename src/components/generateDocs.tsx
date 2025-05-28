"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "./ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "./ui/dialog"
import { useParams } from "next/navigation"
import { Loader2, Download, Eye, FileText, X, Clock, AlertCircle, CheckCircle2, AlertTriangle } from "lucide-react"
import { toast } from "sonner"
import ReactMarkdown from "react-markdown"
import rehypeRaw from "rehype-raw"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card"
import { Badge } from "./ui/badge"
import { Tabs, TabsList, TabsTrigger } from "./ui/tabs"
import { ScrollArea } from "./ui/scroll-area"
import { motion, AnimatePresence } from "framer-motion"

interface Documentation {
  id: string
  documentation?: string
  content?: string
  metadata: {
    tone: string
    emotion: string
    generated_at: string
  }
}

const getValidAccessToken = async (): Promise<string> => {
  try {
    const authData = localStorage.getItem("sb-rrgrmyonjpuvdsljsrrm-auth-token")
    if (!authData) {
      throw new Error("No auth data found. Please sign in.")
    }

    const parsedAuthData = JSON.parse(authData)
    const { access_token, refresh_token, expires_at } = parsedAuthData

    const isExpired = new Date(expires_at) <= new Date(Date.now() + 60 * 1000)

    if (isExpired && refresh_token) {
      try {
        const response = await fetch("/auth/refresh", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ refresh_token }),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || "Failed to refresh token")
        }

        const {
          access_token: new_access_token,
          refresh_token: new_refresh_token,
          expires_at: new_expires_at,
        } = await response.json()

        if (!new_access_token || !new_refresh_token || !new_expires_at) {
          throw new Error("Invalid refresh response")
        }

        const updatedAuthData = {
          ...parsedAuthData,
          access_token: new_access_token,
          refresh_token: new_refresh_token,
          expires_at: new_expires_at,
        }

        localStorage.setItem("sb-rrgrmyonjpuvdsljsrrm-auth-token", JSON.stringify(updatedAuthData))

        return new_access_token
      } catch {
        throw new Error("Session expired. Please sign in again.")
      }
    }

    return access_token
  } catch (error) {
    throw error instanceof Error ? error : new Error("Authentication error occurred")
  }
}

const GenerateDocs = () => {
  const [isDocViewOpen, setIsDocViewOpen] = useState(false)
  const [isAllDocsOpen, setIsAllDocsOpen] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isLoadingDocs, setIsLoadingDocs] = useState(false)
  const [currentDoc, setCurrentDoc] = useState<Documentation | null>(null)
  const [allDocuments, setAllDocuments] = useState<Documentation[]>([])
  const [showNotification, setShowNotification] = useState(false)
  const [activeTab, setActiveTab] = useState<"grid" | "list">("grid")
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false)
  const params = useParams()
  const notificationTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const loadingTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const fetchAllDocuments = async (retryCount = 0, maxRetries = 2) => {
    try {
      setIsLoadingDocs(true)
      setFetchError(null)

      loadingTimeoutRef.current = setTimeout(() => {
        setIsLoadingDocs(false)
        setFetchError("Request timed out. Please try again.")
      }, 10000)

      const access_token = await getValidAccessToken()

      const response = await fetch(`/api/simulate/${params.id}/docs`, {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to fetch documents")
      }

      const data = await response.json()
      if (!data.documents || !Array.isArray(data.documents)) {
        throw new Error("No documents found")
      }

      const mappedDocuments: Documentation[] = data.documents.map((doc: any) => ({
        id: doc.id,
        content: doc.content || "",
        metadata: {
          tone: doc.metadata?.tone || "unknown",
          emotion: doc.metadata?.emotion || "unknown",
          generated_at: doc.metadata?.generated_at || new Date().toISOString(),
        },
      }))

      mappedDocuments.sort((a, b) => {
        return new Date(b.metadata.generated_at).getTime() - new Date(a.metadata.generated_at).getTime()
      })

      setAllDocuments(mappedDocuments)
      clearTimeout(loadingTimeoutRef.current!)
    } catch (error) {
      console.error("Error fetching documents:", error)
      if (retryCount < maxRetries) {
        toast.info(`Retrying to load documents... (${retryCount + 1}/${maxRetries})`)
        setTimeout(() => fetchAllDocuments(retryCount + 1, maxRetries), 2000)
        return
      }
      if (error instanceof Error) {
        if (error.message.includes("sign in")) {
          toast.error(error.message)
        } else {
          toast.error("Failed to load documents: " + error.message)
          setFetchError(error.message)
        }
      } else {
        toast.error("An unexpected error occurred while loading documents")
        setFetchError("An unexpected error occurred")
      }
      setAllDocuments([])
    } finally {
      setIsLoadingDocs(false)
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current)
      }
    }
  }

  useEffect(() => {
    if (isAllDocsOpen) {
      fetchAllDocuments()
    }
  }, [isAllDocsOpen])

  useEffect(() => {
    return () => {
      if (notificationTimeoutRef.current) {
        clearTimeout(notificationTimeoutRef.current)
      }
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current)
      }
    }
  }, [])

  const generateDocumentation = async () => {
    try {
      setIsGenerating(true)
      setIsConfirmDialogOpen(false)

      const access_token = await getValidAccessToken()

      const response = await fetch(`/api/simulate/${params.id}/generate-docs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${access_token}`,
        },
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to generate documentation")
      }

      const data = await response.json()
      if (!data.metadata || !data.metadata.generated_at) {
        throw new Error("Invalid documentation data received")
      }

      setCurrentDoc(data)
      setShowNotification(true)

      if (notificationTimeoutRef.current) {
        clearTimeout(notificationTimeoutRef.current)
      }

      notificationTimeoutRef.current = setTimeout(() => {
        setShowNotification(false)
      }, 8000)
    } catch (error) {
      console.error("Error generating documentation:", error)
      if (error instanceof Error) {
        if (error.message.includes("sign in")) {
          toast.error(error.message)
        } else {
          toast.error(error.message)
        }
      } else {
        toast.error("An unexpected error occurred while generating documentation")
      }
    } finally {
      setIsGenerating(false)
    }
  }

  const handleDownload = (doc: Documentation) => {
    const content = doc.content || doc.documentation
    if (!content) {
      toast.error("Document content is not available for download")
      return
    }

    const blob = new Blob([content], { type: "text/markdown" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `documentation-${new Date(doc.metadata.generated_at).toISOString().split("T")[0]}.md`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    toast.success("Documentation downloaded successfully")
  }

  const getDocumentPreview = (content?: string) => {
    if (!content) return "No preview available"
    const lines = content.split("\n")
    let preview = ""
    let inOverview = false
    for (const line of lines) {
      if (line.startsWith("## Overview")) {
        inOverview = true
        continue
      }
      if (inOverview && line.startsWith("# ") && !line.startsWith("## ")) {
        break
      }
      if (inOverview && line.trim() && !line.startsWith("#")) {
        preview = line.trim()
        break
      }
    }
    return preview || content.substring(0, 150) + "..."
  }

  const renderDocumentationContent = (doc: Documentation) => (
    <div className="prose prose-sm dark:prose-invert max-w-none bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <ReactMarkdown
        rehypePlugins={[rehypeRaw]}
        components={{
          code: ({ className, children }) => {
            const match = /language-(\w+)/.exec(className || "")
            const isCodeBlock = className?.includes("language-")
            return isCodeBlock && match ? (
              <SyntaxHighlighter style={vscDarkPlus} language={match[1]} PreTag="div" className="rounded-md">
                {String(children).replace(/\n$/, "")}
              </SyntaxHighlighter>
            ) : (
              <code className="bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded-md text-sm">{children}</code>
            )
          },
          h1: (props) => <h1 className="text-2xl font-bold mt-6 mb-4 text-gray-900 dark:text-gray-100" {...props} />,
          h2: (props) => <h2 className="text-xl font-semibold mt-5 mb-3 text-gray-800 dark:text-gray-200" {...props} />,
          h3: (props) => <h3 className="text-lg font-medium mt-4 mb-2 text-gray-700 dark:text-gray-300" {...props} />,
          p: (props) => <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-3" {...props} />,
          ul: (props) => <ul className="list-disc pl-5 mb-4 text-gray-600 dark:text-gray-400" {...props} />,
          li: (props) => <li className="mb-1" {...props} />,
          hr: (props) => <hr className="my-6 border-gray-200 dark:border-gray-700" {...props} />,
        }}
      >
        {doc.content || doc.documentation || "No content available"}
      </ReactMarkdown>
    </div>
  )

  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) {
        throw new Error("Invalid date")
      }
      return date.toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    } catch {
      return "Invalid date"
    }
  }

  return (
    <>
      <div className="flex gap-2">
        <Button
          variant="secondary"
          className="h-12"
          onClick={() => setIsConfirmDialogOpen(true)}
          disabled={isGenerating}
          aria-label="Generate new documentation"
        >
          {isGenerating ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <FileText className="h-4 w-4 mr-2" />
              Generate Docs
            </>
          )}
        </Button>
        <Button
          variant="outline"
          className="h-12"
          onClick={() => setIsAllDocsOpen(true)}
          aria-label="View all documents"
        >
          <Clock className="h-4 w-4 mr-2" />
          View All Docs
        </Button>
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Generate New Documentation
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to generate a new documentation? This will analyze all conversations and create a
              new document.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex justify-end gap-2 sm:justify-end">
            <Button variant="outline" onClick={() => setIsConfirmDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={generateDocumentation} disabled={isGenerating}>
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                "Generate Document"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bottom-right notification for newly generated doc */}
      <AnimatePresence>
        {showNotification && currentDoc && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-4 right-4 z-50 max-w-sm"
          >
            <Card className="border border-green-200 shadow-lg bg-white dark:bg-gray-800">
              <CardHeader className="pb-2 flex flex-row items-start justify-between space-y-0">
                <div>
                  <CardTitle className="text-base font-medium flex items-center">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
                    Documentation Generated
                  </CardTitle>
                  <CardDescription className="text-xs mt-1">
                    {formatDate(currentDoc.metadata.generated_at)}
                  </CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => setShowNotification(false)}
                  aria-label="Close notification"
                >
                  <X className="h-4 w-4" />
                  <span className="sr-only">Close</span>
                </Button>
              </CardHeader>
              <CardContent className="pb-2">
                <p className="text-sm line-clamp-2">{getDocumentPreview(currentDoc.content)}</p>
              </CardContent>
              <CardFooter className="pt-0 flex justify-end gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setIsDocViewOpen(true)
                    setShowNotification(false)
                  }}
                  aria-label="View generated documentation"
                >
                  <Eye className="h-4 w-4 mr-1" />
                  View
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => {
                    handleDownload(currentDoc)
                    setShowNotification(false)
                  }}
                  aria-label="Download generated documentation"
                >
                  <Download className="h-4 w-4 mr-1" />
                  Download
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Document View Dialog */}
      <Dialog open={isDocViewOpen} onOpenChange={setIsDocViewOpen}>
        <DialogContent className="sm:max-w-3xl h-[90vh] flex flex-col p-0">
          <DialogHeader className="p-6 pb-2">
            <DialogTitle className="text-xl font-semibold flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Documentation
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              {currentDoc ? (
                <div className="flex flex-col gap-1">
                  <p>Generated on {formatDate(currentDoc.metadata.generated_at)}</p>
                  <div className="flex gap-2 mt-1">
                    <Badge variant="outline">{currentDoc.metadata.tone}</Badge>
                    <Badge variant="outline">{currentDoc.metadata.emotion}</Badge>
                  </div>
                </div>
              ) : (
                "No document selected"
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-hidden">
            <ScrollArea className="h-[calc(90vh-180px)] px-6">
              <div className="py-4">
                {currentDoc ? (
                  renderDocumentationContent(currentDoc)
                ) : (
                  <div className="flex items-center justify-center py-8">
                    <AlertCircle className="h-8 w-8 text-muted-foreground" />
                    <p className="ml-2">No document selected</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          <DialogFooter className="p-6 pt-4 border-t">
            <div className="flex justify-between w-full">
              <Button
                variant="outline"
                onClick={() => {
                  setIsDocViewOpen(false)
                  setIsAllDocsOpen(true)
                }}
                aria-label="View all documents from dialog"
              >
                View All Documents
              </Button>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsDocViewOpen(false)}
                  aria-label="Close document view dialog"
                >
                  Close
                </Button>
                {currentDoc && (
                  <Button onClick={() => handleDownload(currentDoc)} aria-label="Download current documentation">
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                )}
              </div>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* All Documents Dialog */}
      <Dialog open={isAllDocsOpen} onOpenChange={setIsAllDocsOpen} modal={true}>
        <DialogContent className="sm:max-w-6xl h-[90vh] w-[90vw] flex flex-col p-0">
          <DialogHeader className="p-6 pb-2">
            <DialogTitle className="text-2xl font-semibold flex items-center gap-2">
              <FileText className="h-6 w-6" />
              Documentation History
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Browse, view, and download previously generated documentation.
            </DialogDescription>
          </DialogHeader>

          <div className="px-6 pb-2 flex items-center justify-between">
            <Tabs
              value={activeTab}
              onValueChange={(value) => setActiveTab(value as "grid" | "list")}
              className="w-[200px]"
            >
              <TabsList>
                <TabsTrigger value="grid" aria-label="View documents in grid layout">
                  Grid
                </TabsTrigger>
                <TabsTrigger value="list" aria-label="View documents in list layout">
                  List
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchAllDocuments()}
              disabled={isLoadingDocs}
              aria-label="Refresh document list"
            >
              {isLoadingDocs ? <Loader2 className="h-4 w-4 animate-spin" /> : <span>Refresh</span>}
            </Button>
          </div>

          <div className="flex-1 overflow-hidden">
            <ScrollArea className="h-[calc(90vh-180px)] px-6">
              <div className="py-4">
                {isLoadingDocs ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                    <p className="text-muted-foreground">Loading documents...</p>
                  </div>
                ) : fetchError ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
                    <h3 className="font-medium text-lg">Failed to Load Documents</h3>
                    <p className="text-sm text-muted-foreground max-w-md text-center">{fetchError}</p>
                    <Button onClick={() => fetchAllDocuments()} className="mt-4" aria-label="Retry loading documents">
                      Retry
                    </Button>
                  </div>
                ) : allDocuments.length > 0 ? (
                  activeTab === "grid" ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {allDocuments.map((doc) => (
                        <Card
                          key={doc.id}
                          className="flex flex-col border hover:shadow-md transition-shadow duration-200"
                        >
                          <CardHeader className="pb-2">
                            <CardTitle className="text-lg font-medium flex items-center gap-2">
                              <FileText className="h-4 w-4" />
                              Documentation
                            </CardTitle>
                            <CardDescription className="text-xs">
                              {formatDate(doc.metadata.generated_at)}
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="flex-1 py-3">
                            <div className="flex gap-2 mb-3">
                              <Badge variant="outline" className="text-xs">
                                {doc.metadata.tone}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {doc.metadata.emotion}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground line-clamp-3">
                              {getDocumentPreview(doc.content)}
                            </p>
                          </CardContent>
                          <CardFooter className="flex justify-end gap-2 pt-2 border-t">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setCurrentDoc({ ...doc })
                                setIsDocViewOpen(true)
                                setIsAllDocsOpen(false)
                              }}
                              disabled={!doc.content}
                              aria-label={`View document generated on ${formatDate(doc.metadata.generated_at)}`}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              View
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDownload(doc)}
                              disabled={!doc.content}
                              aria-label={`Download document generated on ${formatDate(doc.metadata.generated_at)}`}
                            >
                              <Download className="h-4 w-4 mr-2" />
                              Download
                            </Button>
                          </CardFooter>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {allDocuments.map((doc) => (
                        <Card key={doc.id} className="hover:bg-muted/30 transition-colors">
                          <div className="flex items-center p-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <FileText className="h-5 w-5 text-muted-foreground" />
                                <div>
                                  <h3 className="font-medium">Documentation</h3>
                                  <p className="text-xs text-muted-foreground">
                                    {formatDate(doc.metadata.generated_at)}
                                  </p>
                                </div>
                              </div>
                              <div className="flex gap-2 mt-2">
                                <Badge variant="outline" className="text-xs">
                                  {doc.metadata.tone}
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                  {doc.metadata.emotion}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mt-2 line-clamp-1">
                                {getDocumentPreview(doc.content)}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setCurrentDoc({ ...doc })
                                  setIsDocViewOpen(true)
                                  setIsAllDocsOpen(false)
                                }}
                                disabled={!doc.content}
                                aria-label={`View document generated on ${formatDate(doc.metadata.generated_at)}`}
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                View
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDownload(doc)}
                                disabled={!doc.content}
                                aria-label={`Download document generated on ${formatDate(doc.metadata.generated_at)}`}
                              >
                                <Download className="h-4 w-4 mr-2" />
                                Download
                              </Button>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )
                ) : (
                  <div className="text-center py-12">
                    <div className="flex flex-col items-center gap-3">
                      <FileText className="h-12 w-12 text-muted-foreground" />
                      <h3 className="font-medium text-lg">No Documentation Found</h3>
                      <p className="text-sm text-muted-foreground max-w-md">
                        It looks like you haven&apos;t generated any documentation yet. Click &ldquo;Generate Docs&ldquo; to create your
                        first document.
                      </p>
                      <Button
                        onClick={() => {
                          setIsAllDocsOpen(false)
                          setTimeout(() => {
                            setIsConfirmDialogOpen(true)
                          }, 300)
                        }}
                        className="mt-2"
                        aria-label="Generate first document"
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        Generate Your First Document
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

        
        </DialogContent>
      </Dialog>
    </>
  )
}

export default GenerateDocs
