"use client"

import type { Message } from "@/lib/types"
import { motion } from "framer-motion"
import { format } from "date-fns"

interface MessageItemProps {
  message: Message
  index: number
}

export function MessageItem({ message, index }: MessageItemProps) {
  // Generate a consistent color for each user based on their name
  const getUserColor = (sender: string) => {
    const colors = [
      "bg-blue-500 text-white",
      "bg-green-500 text-white",
      "bg-purple-500 text-white",
      "bg-orange-500 text-white",
      "bg-pink-500 text-white",
      "bg-indigo-500 text-white",
      "bg-red-500 text-white",
      "bg-teal-500 text-white",
    ]

    let hash = 0
    for (let i = 0; i < sender.length; i++) {
      hash = sender.charCodeAt(i) + ((hash << 5) - hash)
    }

    return colors[Math.abs(hash) % colors.length]
  }

  const userColor = getUserColor(message.sender)
  const isFirstUser = message.sender === "User 1" || message.sender.toLowerCase().includes("you")

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }} // Remove the index-based delay
      className={`mb-2 flex ${isFirstUser ? "justify-end" : "justify-start"}`}
    >
      <div className="flex flex-col max-w-[80%]">
        {/* Sender name */}
        <div
          className={`text-xs font-medium mb-1 ${isFirstUser ? "text-right" : "text-left"} text-gray-600 dark:text-gray-400`}
        >
          {message.sender}
        </div>

        {/* Message bubble */}
        <div
          className={`rounded-lg px-4 py-2.5 shadow-sm ${
            isFirstUser ? "bg-green-500 text-white dark:bg-green-600" : `${userColor} dark:opacity-90`
          }`}
        >
          <div className="whitespace-pre-wrap break-words text-sm leading-relaxed">{message.content}</div>
          <div className={`mt-1.5 text-right text-xs opacity-70`}>{format(message.timestamp, "h:mm a")}</div>
        </div>
      </div>
    </motion.div>
  )
}
