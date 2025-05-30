"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { CalendarIcon } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import type { Message } from "@/lib/types"

interface DatePickerProps {
  onDateSelect: (date: Date) => void
  messages: Message[]
}

export function DatePicker({ onDateSelect, messages }: DatePickerProps) {
  const [date, setDate] = useState<Date | undefined>(undefined)

  // Get all unique dates from messages
  const availableDates = messages.reduce((dates, message) => {
    const dateStr = message.timestamp.toISOString().split("T")[0]
    if (!dates.includes(dateStr)) {
      dates.push(dateStr)
    }
    return dates
  }, [] as string[])

  const handleSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      setDate(selectedDate)
      onDateSelect(selectedDate)
    }
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon">
          <CalendarIcon className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="end">
        <Calendar
          mode="single"
          selected={date}
          onSelect={handleSelect}
          disabled={(date) => {
            const dateStr = date.toISOString().split("T")[0]
            return !availableDates.includes(dateStr)
          }}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  )
}
