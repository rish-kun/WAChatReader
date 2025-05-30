import type { Message, ChatStats } from "./types"

export interface ParseResult {
  messages: Message[]
  stats: ChatStats
  currentUser: string
}

export async function parseWhatsAppChat(
  text: string,
  onProgress?: (percent: number, text: string) => void,
): Promise<ParseResult> {
  const messages: Message[] = []
  const lines = text.split("\n")
  const messageRegex = /^\[(\d{4}\/\d{1,2}\/\d{1,2}),\s+(\d{1,2}:\d{2}:\d{2}\s+[AP]M)\]\s+(.+?):\s+(.*)$/

  let currentMessage: Partial<Message> | null = null
  const participants = new Set<string>()
  const batchSize = 5000

  onProgress?.(0, "Parsing messages...")

  for (let i = 0; i < lines.length; i++) {
    if (i % batchSize === 0) {
      onProgress?.(
        (i / lines.length) * 90,
        `Processing ${i.toLocaleString()} / ${lines.length.toLocaleString()} lines...`,
      )
      await new Promise((resolve) => setTimeout(resolve, 1))
    }

    const line = lines[i].trim()
    if (!line) continue

    const match = line.match(messageRegex)

    if (match) {
      if (currentMessage && currentMessage.sender && currentMessage.content && currentMessage.timestamp) {
        messages.push(currentMessage as Message)
      }

      const [, date, time, sender, text] = match
      participants.add(sender)

      try {
        const timestamp = new Date(`${date.replace(/\//g, "-")} ${time}`)

        currentMessage = {
          id: messages.length,
          date: date,
          time: time,
          sender: sender.trim(),
          content: text.trim(),
          timestamp: isNaN(timestamp.getTime()) ? new Date() : timestamp,
        }
      } catch (error) {
        console.warn("Error parsing timestamp:", error)
        currentMessage = {
          id: messages.length,
          date: date,
          time: time,
          sender: sender.trim(),
          content: text.trim(),
          timestamp: new Date(),
        }
      }
    } else if (currentMessage) {
      currentMessage.content += "\n" + line
    }
  }

  if (currentMessage && currentMessage.sender && currentMessage.content && currentMessage.timestamp) {
    messages.push(currentMessage as Message)
  }

  onProgress?.(95, "Finalizing...")
  await new Promise((resolve) => setTimeout(resolve, 100))

  // Determine current user (most frequent sender)
  const senderCounts: Record<string, number> = {}
  messages.forEach((msg) => {
    senderCounts[msg.sender] = (senderCounts[msg.sender] || 0) + 1
  })

  const currentUser = Object.keys(senderCounts).reduce((a, b) => (senderCounts[a] > senderCounts[b] ? a : b))

  // Calculate statistics
  const stats = calculateStats(messages, participants.size)

  onProgress?.(100, "Complete!")

  return { messages, stats, currentUser }
}

function calculateStats(messages: Message[], participantCount: number): ChatStats {
  if (messages.length === 0) {
    return {
      totalMessages: 0,
      participants: 0,
      dateRange: { start: "", end: "" },
      avgMessagesPerDay: 0,
      durationDays: 0,
    }
  }

  const firstDate = messages[0].date
  const lastDate = messages[messages.length - 1].date

  const startDate = new Date(firstDate.replace(/\//g, "-"))
  const endDate = new Date(lastDate.replace(/\//g, "-"))
  const durationDays = Math.max(1, Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)))
  const avgMessagesPerDay = Math.round(messages.length / durationDays)

  return {
    totalMessages: messages.length,
    participants: participantCount,
    dateRange: { start: firstDate, end: lastDate },
    avgMessagesPerDay,
    durationDays,
  }
}
