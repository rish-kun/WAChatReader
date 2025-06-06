"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import type { Message, VisibleRange } from "@/lib/types"
import { VirtualMessageItem } from "@/components/virtual-message-item"
import { Button } from "@/components/ui/button"
import { ChevronUp } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface VirtualChatViewerProps {
  messages: Message[]
  currentUser: string
  searchQuery?: string
}

// Increase chunk size for better handling of large message volumes
const CHUNK_SIZE = 30
// Buffer size for loading messages above and below viewport
const BUFFER_SIZE = 15
// Using a fixed height to prevent message overlapping
const MESSAGE_HEIGHT = 120

export function VirtualChatViewer({ messages, currentUser, searchQuery = "" }: VirtualChatViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [visibleRange, setVisibleRange] = useState<VisibleRange>({ start: 0, end: CHUNK_SIZE })
  const [showScrollButton, setShowScrollButton] = useState(false)
  const [filteredMessages, setFilteredMessages] = useState<Message[]>(messages)

  // Filter messages based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredMessages(messages)
    } else {
      const filtered = messages.filter(
        (msg) =>
          msg.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
          msg.sender.toLowerCase().includes(searchQuery.toLowerCase()),
      )
      setFilteredMessages(filtered)
    }
  }, [messages, searchQuery])

  // Handle scroll events for virtual scrolling with improved performance
  const handleScroll = useCallback(() => {
    const container = containerRef.current
    if (!container) return

    const scrollTop = container.scrollTop
    const containerHeight = container.clientHeight

    setShowScrollButton(scrollTop > 500)

    if (searchQuery) return // Don't update visible range during search

    // Calculate how many messages can fit in the viewport
    const visibleCount = Math.ceil(containerHeight / MESSAGE_HEIGHT)
    
    // Calculate the first visible message index
    const firstVisibleIndex = Math.floor(scrollTop / MESSAGE_HEIGHT)
    
    // Calculate start and end with buffer zones for smoother scrolling
    const newStart = Math.max(0, firstVisibleIndex - BUFFER_SIZE)
    const newEnd = Math.min(firstVisibleIndex + visibleCount + BUFFER_SIZE, filteredMessages.length)

    // Only update if range has changed significantly to avoid frequent rerenders
    if (
      Math.abs(newStart - visibleRange.start) > Math.floor(BUFFER_SIZE / 2) || 
      Math.abs(newEnd - visibleRange.end) > Math.floor(BUFFER_SIZE / 2) ||
      newStart === 0 || 
      newEnd === filteredMessages.length
    ) {
      setVisibleRange({
        start: newStart,
        end: newEnd,
      })
    }
  }, [visibleRange, filteredMessages.length, searchQuery, BUFFER_SIZE])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    container.addEventListener("scroll", handleScroll)
    return () => container.removeEventListener("scroll", handleScroll)
  }, [handleScroll])

  // Reset visible range when messages change
  useEffect(() => {
    // Calculate appropriate initial chunk size based on viewport height
    if (containerRef.current) {
      const containerHeight = containerRef.current.clientHeight
      const visibleCount = Math.ceil(containerHeight / MESSAGE_HEIGHT)
      
      // Set initial range with appropriate buffer for smoother experience
      setVisibleRange({ 
        start: 0, 
        end: Math.min(visibleCount + BUFFER_SIZE * 2, filteredMessages.length)
      })
      containerRef.current.scrollTop = 0
    } else {
      // Fallback if container ref not available yet
      setVisibleRange({ start: 0, end: Math.min(CHUNK_SIZE, filteredMessages.length) })
    }
  }, [filteredMessages, MESSAGE_HEIGHT, BUFFER_SIZE])

  const scrollToTop = () => {
    if (containerRef.current) {
      containerRef.current.scrollTo({
        top: 0,
        behavior: "smooth",
      })
    }
  }

  const scrollToBottom = () => {
    if (containerRef.current) {
      containerRef.current.scrollTo({
        top: containerRef.current.scrollHeight,
        behavior: "smooth",
      })
    }
  }

  // Jump to specific date
  const jumpToDate = useCallback(
    (targetDate: string) => {
      const messageIndex = filteredMessages.findIndex((msg) => msg.date === targetDate)
      if (messageIndex !== -1 && containerRef.current) {
        containerRef.current.scrollTo({
          top: messageIndex * MESSAGE_HEIGHT,
          behavior: "smooth",
        })
      }
    },
    [filteredMessages],
  )

  if (filteredMessages.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="text-center text-gray-500 dark:text-gray-400">
          {searchQuery ? (
            <div className="space-y-2">
              <p className="text-lg">No messages found</p>
              <p className="text-sm">Try a different search term</p>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-lg">No messages found in the uploaded file</p>
              <p className="text-sm">Please check if the file format is correct</p>
            </div>
          )}
        </div>
      </div>
    )
  }

  // Calculate total scrollable height
  const totalHeight = filteredMessages.length * MESSAGE_HEIGHT
  
  // For search results, show all messages; otherwise, only show messages in the visible range
  const visibleMessages = searchQuery 
    ? filteredMessages 
    : filteredMessages.slice(visibleRange.start, visibleRange.end)

  // Show stats about the currently visible messages for debugging
  const percentageVisible = ((visibleRange.end - visibleRange.start) / filteredMessages.length * 100).toFixed(1)
  
  return (
    <div className="relative flex flex-1 flex-col overflow-hidden">
      {/* Search results info */}
      {searchQuery && (
        <div className="bg-blue-50 dark:bg-blue-900/20 px-4 py-2 text-sm text-blue-700 dark:text-blue-300 border-b">
          Found <strong>{filteredMessages.length}</strong> message{filteredMessages.length !== 1 ? "s" : ""} matching "
          <strong>{searchQuery}</strong>"
        </div>
      )}

      {/* Virtual scrolling container with improved performance */}
      <div ref={containerRef} className="flex-1 overflow-y-auto" style={{ height: "100%" }}>
        <div
          style={{
            height: searchQuery ? "auto" : `${totalHeight}px`,
            position: "relative",
            paddingBottom: "24px" // Add padding at the bottom to improve spacing
          }}
        >
          {visibleMessages.map((message, index) => {
            // When in search mode, use the direct index; otherwise, calculate the actual position in the full list
            const actualIndex = searchQuery ? index : visibleRange.start + index
            return (
              <VirtualMessageItem
                key={`${message.id}-${actualIndex}`}
                message={message}
                index={actualIndex}
                currentUser={currentUser}
                searchQuery={searchQuery}
                isVirtual={!searchQuery}
              />
            )
          })}
        </div>
      </div>

      {/* Scroll to top button */}
      <AnimatePresence>
        {showScrollButton && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute bottom-4 right-4 z-10"
          >
            <Button size="icon" className="rounded-full shadow-lg" onClick={scrollToTop}>
              <ChevronUp className="h-4 w-4" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Scroll to bottom button */}
      <div className="absolute bottom-4 left-4 z-10">
        <Button size="icon" variant="outline" className="rounded-full shadow-lg" onClick={scrollToBottom}>
          <ChevronUp className="h-4 w-4 rotate-180" />
        </Button>
      </div>
    </div>
  )
}
