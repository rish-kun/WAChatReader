"use client"

import { useEffect, useRef, useState } from "react"
import type { Message } from "@/lib/types"
import { MessageItem } from "@/components/message-item"
import { Button } from "@/components/ui/button"
import { ChevronDown } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface ChatViewerProps {
  messages: Message[]
}

export function ChatViewer({ messages }: ChatViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [showScrollButton, setShowScrollButton] = useState(false)
  const [currentDateHeader, setCurrentDateHeader] = useState<string | null>(null)

  console.log("ChatViewer received messages:", messages.length)

  // Group messages by date for rendering date headers
  const messagesByDate = messages.reduce(
    (acc, message) => {
      const dateStr = message.timestamp.toISOString().split("T")[0]
      if (!acc[dateStr]) {
        acc[dateStr] = []
      }
      acc[dateStr].push(message)
      return acc
    },
    {} as Record<string, Message[]>,
  )

  console.log("Messages grouped by date:", Object.keys(messagesByDate).length)

  // Handle scroll events to show/hide scroll button
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100
      setShowScrollButton(!isNearBottom)

      // Update current date header
      const dateHeaders = container.querySelectorAll("[data-date-header]")
      let currentHeader = null

      for (let i = 0; i < dateHeaders.length; i++) {
        const header = dateHeaders[i] as HTMLElement
        const headerTop = header.getBoundingClientRect().top

        if (headerTop <= 80) {
          currentHeader = header.dataset.dateHeader || null
        } else {
          break
        }
      }

      setCurrentDateHeader(currentHeader)
    }

    container.addEventListener("scroll", handleScroll)
    return () => container.removeEventListener("scroll", handleScroll)
  }, [])

  // Scroll to bottom when messages are loaded
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        scrollToBottom()
      }, 100)
    }
  }, [messages.length])

  const scrollToBottom = () => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight
    }
  }

  if (messages.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="text-center text-gray-500 dark:text-gray-400">
          <p>No messages found in the uploaded file.</p>
          <p className="text-sm mt-2">Please check if the file format is correct.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative flex flex-1 flex-col overflow-hidden">
      {/* Sticky date header */}
      <AnimatePresence>
        {currentDateHeader && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute left-0 right-0 top-0 z-10 bg-gray-100/80 p-2 text-center text-sm font-medium backdrop-blur-sm dark:bg-gray-800/80"
          >
            {new Date(currentDateHeader).toLocaleDateString(undefined, {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat container */}
      <div ref={containerRef} className="flex flex-1 flex-col overflow-y-auto p-4 space-y-1">
        {Object.entries(messagesByDate)
          .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
          .map(([dateStr, dateMessages]) => {
            const date = new Date(dateStr)
            const formattedDate = date.toLocaleDateString(undefined, {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })

            return (
              <div key={dateStr} id={`date-${dateStr}`}>
                <div className="sticky top-0 z-10 my-4 text-center" data-date-header={dateStr}>
                  <span className="inline-block rounded-full bg-gray-200 px-4 py-1 text-xs font-medium dark:bg-gray-700">
                    {formattedDate}
                  </span>
                </div>
                {dateMessages
                  .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
                  .map((message, index) => (
                    <MessageItem key={`${dateStr}-${index}`} message={message} index={index} />
                  ))}
              </div>
            )
          })}
      </div>

      {/* Scroll to bottom button */}
      <AnimatePresence>
        {showScrollButton && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute bottom-4 right-4"
          >
            <Button size="icon" className="rounded-full shadow-lg" onClick={scrollToBottom}>
              <ChevronDown className="h-4 w-4" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
