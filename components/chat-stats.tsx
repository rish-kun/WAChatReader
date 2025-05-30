"use client"

import { useEffect, useState } from "react"
import type { ChatStats } from "@/lib/types"
import { Card, CardContent } from "@/components/ui/card"
import { Users, MessageCircle, Calendar, TrendingUp } from "lucide-react"
import { motion } from "framer-motion"

interface ChatStatsProps {
  stats: ChatStats
}

export function ChatStatsComponent({ stats }: ChatStatsProps) {
  const [animatedStats, setAnimatedStats] = useState({
    totalMessages: 0,
    participants: 0,
    avgMessagesPerDay: 0,
  })

  // Animate counters
  useEffect(() => {
    const animateCounter = (key: keyof typeof animatedStats, target: number) => {
      const duration = 1000
      const stepTime = 20
      const steps = duration / stepTime
      const increment = target / steps

      let current = 0
      const timer = setInterval(() => {
        current += increment
        if (current >= target) {
          clearInterval(timer)
          setAnimatedStats((prev) => ({ ...prev, [key]: target }))
        } else {
          setAnimatedStats((prev) => ({ ...prev, [key]: Math.floor(current) }))
        }
      }, stepTime)
    }

    animateCounter("totalMessages", stats.totalMessages)
    animateCounter("participants", stats.participants)
    animateCounter("avgMessagesPerDay", stats.avgMessagesPerDay)
  }, [stats])

  const formatDateShort = (dateStr: string) => {
    const date = new Date(dateStr.replace(/\//g, "-"))
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    })
  }

  const statItems = [
    {
      icon: MessageCircle,
      label: "Total Messages",
      value: animatedStats.totalMessages.toLocaleString(),
      color: "text-blue-500",
    },
    {
      icon: Users,
      label: "Participants",
      value: animatedStats.participants.toString(),
      color: "text-green-500",
    },
    {
      icon: TrendingUp,
      label: "Msgs/Day",
      value: animatedStats.avgMessagesPerDay.toLocaleString(),
      color: "text-purple-500",
    },
    {
      icon: Calendar,
      label: "Duration",
      value: `${stats.durationDays} days`,
      color: "text-orange-500",
    },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4">
      {statItems.map((item, index) => (
        <motion.div
          key={item.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card className="text-center">
            <CardContent className="p-4">
              <item.icon className={`h-6 w-6 mx-auto mb-2 ${item.color}`} />
              <div className="text-2xl font-bold">{item.value}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">{item.label}</div>
            </CardContent>
          </Card>
        </motion.div>
      ))}

      {stats.dateRange.start && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="col-span-2 md:col-span-4"
        >
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Chat Period: {formatDateShort(stats.dateRange.start)} → {formatDateShort(stats.dateRange.end)}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  )
}

export const ChatStats = ChatStatsComponent
