"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, ArrowUp, ArrowDown } from "lucide-react"
import type { Message } from "@/lib/types"
import { format } from "date-fns"
import { highlightSearchTerm } from "./highlight-search-term" // Import the highlightSearchTerm function

interface SearchDialogProps {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  messages: Message[]
}

export function SearchDialog({ isOpen, setIsOpen, messages }: SearchDialogProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<Message[]>([])
  const [selectedResultIndex, setSelectedResultIndex] = useState(0)

  useEffect(() => {
    if (searchQuery.trim().length > 0) {
      const results = messages.filter((message) => message.content.toLowerCase().includes(searchQuery.toLowerCase()))
      setSearchResults(results)
      setSelectedResultIndex(0)
    } else {
      setSearchResults([])
    }
  }, [searchQuery, messages])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchResults.length > 0) {
      navigateToResult(selectedResultIndex)
    }
  }

  const navigateToResult = (index: number) => {
    if (searchResults.length === 0) return

    const result = searchResults[index]
    const dateStr = result.timestamp.toISOString().split("T")[0]
    const element = document.getElementById(`date-${dateStr}`)

    if (element) {
      element.scrollIntoView({ behavior: "smooth" })

      // Highlight the message (this is a simplified approach)
      setTimeout(() => {
        const messageContent = result.content
        const messageElements = document.querySelectorAll("div")

        for (const el of messageElements) {
          if (el.textContent?.includes(messageContent)) {
            el.scrollIntoView({ behavior: "smooth", block: "center" })

            // Flash effect
            el.classList.add("bg-yellow-200", "dark:bg-yellow-900")
            setTimeout(() => {
              el.classList.remove("bg-yellow-200", "dark:bg-yellow-900")
            }, 2000)

            break
          }
        }
      }, 500)
    }
  }

  const navigatePrevious = () => {
    if (searchResults.length === 0) return
    const newIndex = (selectedResultIndex - 1 + searchResults.length) % searchResults.length
    setSelectedResultIndex(newIndex)
    navigateToResult(newIndex)
  }

  const navigateNext = () => {
    if (searchResults.length === 0) return
    const newIndex = (selectedResultIndex + 1) % searchResults.length
    setSelectedResultIndex(newIndex)
    navigateToResult(newIndex)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Search Messages</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSearch} className="flex items-center space-x-2">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
            <Input
              placeholder="Search messages..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
            />
          </div>
          <Button type="submit" size="sm" disabled={searchResults.length === 0}>
            Search
          </Button>
        </form>

        <div className="mt-4 max-h-[300px] overflow-y-auto">
          {searchResults.length > 0 ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500 dark:text-gray-400">{searchResults.length} results found</span>
                <div className="flex items-center space-x-1">
                  <Button variant="outline" size="icon" className="h-8 w-8" onClick={navigatePrevious}>
                    <ArrowUp className="h-4 w-4" />
                  </Button>
                  <span className="text-xs">
                    {selectedResultIndex + 1}/{searchResults.length}
                  </span>
                  <Button variant="outline" size="icon" className="h-8 w-8" onClick={navigateNext}>
                    <ArrowDown className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {searchResults.map((result, index) => (
                <div
                  key={index}
                  className={`cursor-pointer rounded-lg border p-3 transition-colors ${
                    index === selectedResultIndex
                      ? "border-primary bg-primary/5"
                      : "border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600"
                  }`}
                  onClick={() => {
                    setSelectedResultIndex(index)
                    navigateToResult(index)
                    setIsOpen(false)
                  }}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{result.sender}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {format(result.timestamp, "MMM d, yyyy h:mm a")}
                    </span>
                  </div>
                  <p className="mt-1 text-sm">{highlightSearchTerm(result.content, searchQuery)}</p>
                </div>
              ))}
            </div>
          ) : searchQuery.trim().length > 0 ? (
            <div className="py-8 text-center text-gray-500 dark:text-gray-400">
              No results found for "{searchQuery}"
            </div>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  )
}
