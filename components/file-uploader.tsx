"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Upload, FileText, Check, Loader2 } from "lucide-react"
import { motion } from "framer-motion"

interface FileUploaderProps {
  onFileUpload: (file: File) => void
  isLoading?: boolean
}

export function FileUploader({ onFileUpload, isLoading = false }: FileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [file, setFile] = useState<File | null>(null)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0]
      setFile(droppedFile)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0]
      setFile(selectedFile)
    }
  }

  const handleUpload = () => {
    if (file && !isLoading) {
      onFileUpload(file)
    }
  }

  return (
    <motion.div
      className="w-full max-w-md"
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="border-2 border-dashed">
        <CardHeader className="text-center">
          <CardTitle>Upload WhatsApp Chat</CardTitle>
          <CardDescription>
            Upload your exported WhatsApp chat text file to view it in a beautiful interface
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            className={`flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-12 text-center transition-colors ${
              isDragging ? "border-primary bg-primary/10" : "border-gray-300 dark:border-gray-700"
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {isLoading ? (
              <div className="flex flex-col items-center gap-2">
                <div className="rounded-full bg-blue-100 p-2 dark:bg-blue-900">
                  <Loader2 className="h-6 w-6 text-blue-600 dark:text-blue-400 animate-spin" />
                </div>
                <p className="mt-2 text-sm font-medium">Processing chat file...</p>
              </div>
            ) : file ? (
              <div className="flex flex-col items-center gap-2">
                <div className="rounded-full bg-green-100 p-2 dark:bg-green-900">
                  <Check className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <p className="mt-2 text-sm font-medium">{file.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{(file.size / 1024).toFixed(2)} KB</p>
              </div>
            ) : (
              <>
                <div className="rounded-full bg-primary/10 p-4">
                  <Upload className="h-8 w-8 text-primary" />
                </div>
                <p className="mt-4 text-sm font-medium">Drag and drop your file here or click to browse</p>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Supports WhatsApp chat export text files
                </p>
              </>
            )}
            <input type="file" id="file-upload" className="hidden" accept=".txt" onChange={handleFileChange} />
          </div>
          <div className="mt-4 flex justify-between">
            <Button
              variant="outline"
              onClick={() => document.getElementById("file-upload")?.click()}
              disabled={!!file || isLoading}
            >
              <FileText className="mr-2 h-4 w-4" />
              Browse Files
            </Button>
            <Button onClick={handleUpload} disabled={!file || isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "View Chat"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
