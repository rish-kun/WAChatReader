"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { motion } from "framer-motion"

interface ProgressIndicatorProps {
  progress: number
  text: string
}

export function ProgressIndicator({ progress, text }: ProgressIndicatorProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex items-center justify-center min-h-[400px]"
    >
      <Card className="w-full max-w-md">
        <CardContent className="p-8 text-center space-y-6">
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Processing Chat File</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">{text}</p>
          </div>

          <div className="space-y-2">
            <Progress value={progress} className="w-full" />
            <p className="text-sm font-medium">{progress}%</p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
