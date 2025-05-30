"use client"

import { useState } from "react"
import { FileUploader } from "@/components/file-uploader"
import { VirtualChatViewer } from "@/components/virtual-chat-viewer"
import { ChatStats } from "@/components/chat-stats"
import { ProgressIndicator } from "@/components/progress-indicator"
import { parseWhatsAppChat } from "@/lib/chat-parser"
import type { Message, ChatStats as ChatStatsType } from "@/lib/types"
import { AnimatePresence, motion } from "framer-motion"
import { Search, Calendar, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useDebounce } from "@/hooks/use-debounce"

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([])
  const [stats, setStats] = useState<ChatStatsType | null>(null)
  const [currentUser, setCurrentUser] = useState("")
  const [isUploaded, setIsUploaded] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [progressText, setProgressText] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [dateFilter, setDateFilter] = useState("")

  const debouncedSearchQuery = useDebounce(searchQuery, 300)

  const handleFileUpload = async (file: File) => {
    setIsLoading(true)
    setError(null)
    setProgress(0)

    try {
      const text = await file.text()

      const result = await parseWhatsAppChat(text, (percent, text) => {
        setProgress(percent)
        setProgressText(text)
      })

      if (result.messages.length === 0) {
        setError("No messages could be parsed from this file. Please check if it's a valid WhatsApp chat export.")
        return
      }

      setMessages(result.messages)
      setStats(result.stats)
      setCurrentUser(result.currentUser)
      setIsUploaded(true)
    } catch (error) {
      console.error("Error parsing chat:", error)
      setError("Failed to parse the chat file. Please make sure it's a valid WhatsApp export.")
    } finally {
      setIsLoading(false)
    }
  }

  const resetApp = () => {
    setIsUploaded(false)
    setMessages([])
    setStats(null)
    setCurrentUser("")
    setError(null)
    setSearchQuery("")
    setDateFilter("")
  }

  const clearSearch = () => {
    setSearchQuery("")
    setDateFilter("")
  }

  return (
    <main className="flex min-h-screen flex-col bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <AnimatePresence mode="wait">
        {isLoading ? (
          <ProgressIndicator progress={progress} text={progressText} />
        ) : !isUploaded ? (
          <motion.div
            key="upload"
            className="flex flex-1 items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="w-full max-w-md space-y-4">
              <FileUploader onFileUpload={handleFileUpload} />
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div key="chat" className="flex flex-1 flex-col" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {/* Header */}
            <header className="sticky top-0 z-20 bg-white dark:bg-gray-900 border-b shadow-sm">
              <div className="p-4">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h1 className="text-xl font-bold mb-1.5">WhatsApp Chat Viewer</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {messages.length.toLocaleString()} messages
                    </p>
                  </div>
                  <Button variant="outline" onClick={resetApp}>
                    <RotateCcw className="h-4 w-4 mr-2" />
                    New File
                  </Button>
                </div>

                {/* Search and filters */}
                <div className="flex gap-3 flex-wrap mb-1">
                  <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search messages..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      type="date"
                      value={dateFilter}
                      onChange={(e) => setDateFilter(e.target.value)}
                      className="pl-10 w-40"
                    />
                  </div>
                  {(debouncedSearchQuery || dateFilter) && (
                    <Button variant="outline" size="sm" onClick={clearSearch}>
                      Clear
                    </Button>
                  )}
                </div>
              </div>

              {/* Stats */}
              {stats && <ChatStats stats={stats} />}
            </header>

            {/* Chat viewer */}
            <VirtualChatViewer messages={messages} currentUser={currentUser} searchQuery={debouncedSearchQuery} />
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  )
}
