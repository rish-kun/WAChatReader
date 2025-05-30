"use client"

import type { Message } from "@/lib/types"
import { motion } from "framer-motion"
import { useState } from "react"

interface VirtualMessageItemProps {
  message: Message
  index: number
  currentUser: string
  searchQuery?: string
  isVirtual?: boolean
}

// Match with the value in virtual-chat-viewer for consistency
// Use a larger height to prevent overlapping messages with longer content
const MESSAGE_HEIGHT = 120

export function VirtualMessageItem({
  message,
  index,
  currentUser,
  searchQuery = "",
  isVirtual = true,
}: VirtualMessageItemProps) {
  const [showFullDate, setShowFullDate] = useState(false)

  const isCurrentUser = message.sender === currentUser
  const shouldShowDateSeparator = index === 0 || (index > 0 && message.date !== message.date) // This would need previous message comparison

  // Generate consistent color for each user
  const getUserColor = (sender: string) => {
    const colors = [
      "bg-blue-500",
      "bg-purple-500",
      "bg-orange-500",
      "bg-pink-500",
      "bg-indigo-500",
      "bg-red-500",
      "bg-teal-500",
      "bg-cyan-500",
    ]

    let hash = 0
    for (let i = 0; i < sender.length; i++) {
      hash = sender.charCodeAt(i) + ((hash << 5) - hash)
    }

    return colors[Math.abs(hash) % colors.length]
  }

  // Highlight search terms
  const highlightText = (text: string, query: string) => {
    if (!query) return text

    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi")
    return text.replace(regex, '<mark class="bg-yellow-200 dark:bg-yellow-800 px-1 rounded">$1</mark>')
  }

  // Format date nicely
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr.replace(/\//g, "-"))
    const today = new Date()
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) {
      return "Today"
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday"
    }

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  // Convert URLs to clickable links
  const linkifyText = (text: string) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g
    return text.replace(
      urlRegex,
      '<a href="$1" target="_blank" class="underline hover:opacity-80 text-blue-400">$1</a>',
    )
  }

  const processedContent = linkifyText(highlightText(message.content, searchQuery))

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }} // Remove the index-based delay
      className="w-full px-4 py-3 box-border"
      style={
        isVirtual
          ? {
              position: "absolute",
              top: `${index * MESSAGE_HEIGHT}px`,
              height: `${MESSAGE_HEIGHT}px`,
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-start",
              boxSizing: "border-box", // Ensure padding is included in height
              overflowY: "hidden", // Prevent content from overflowing
            }
          : {
              minHeight: `${MESSAGE_HEIGHT}px`,
              boxSizing: "border-box",
            }
      }
    >
      {/* Date separator */}
      {shouldShowDateSeparator && (
        <div className="flex justify-center mb-5">
          <button
            onClick={() => setShowFullDate(!showFullDate)}
            className="bg-gray-200 dark:bg-gray-700 px-3 py-1.5 rounded-full text-xs font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            {showFullDate ? message.date : formatDate(message.date)}
          </button>
        </div>
      )}

      {/* Message */}
      <div className={`flex ${isCurrentUser ? "justify-end" : "justify-start"} mb-2`}>
        <div className="flex flex-col max-w-[80%]">
          {/* Sender name for received messages */}
          {!isCurrentUser && (
            <div className="flex items-center gap-2 mb-1.5">
              <div
                className={`w-6 h-6 rounded-full ${getUserColor(message.sender)} flex items-center justify-center text-white text-xs font-bold`}
              >
                {message.sender.charAt(0).toUpperCase()}
              </div>
              <span className="text-xs font-medium text-gray-600 dark:text-gray-400">{message.sender}</span>
            </div>
          )}

          {/* Message bubble */}
          <div
            className={`rounded-lg px-4 py-3 shadow-sm max-w-full ${
              isCurrentUser
                ? "bg-green-500 text-white dark:bg-green-600"
                : "bg-white text-gray-800 dark:bg-gray-700 dark:text-gray-100 border border-gray-200 dark:border-gray-600"
            }`}
          >
            <div
              className="text-sm leading-relaxed break-words whitespace-pre-wrap"
              dangerouslySetInnerHTML={{ __html: processedContent }}
            />
            <div className={`text-xs mt-2 ${isCurrentUser ? "text-green-100" : "text-gray-500 dark:text-gray-400"}`}>
              {message.time}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
