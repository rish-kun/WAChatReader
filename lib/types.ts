export interface Message {
  id: number
  date: string
  time: string
  sender: string
  content: string
  timestamp: Date
}

export interface ChatStats {
  totalMessages: number
  participants: number
  dateRange: { start: string; end: string }
  avgMessagesPerDay: number
  durationDays: number
}

export interface VisibleRange {
  start: number
  end: number
}
