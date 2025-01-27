'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PlusCircle } from "lucide-react"

interface KeywordInputProps {
  onAddKeyword: (keyword: string) => void
  isLoading?: boolean
}

export function KeywordInput({ onAddKeyword, isLoading }: KeywordInputProps) {
  const [keyword, setKeyword] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (keyword.trim()) {
      onAddKeyword(keyword.trim())
      setKeyword("")
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full space-x-2">
      <Input
        type="text"
        placeholder="Enter a keyword or phrase..."
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        className="flex-1"
        disabled={isLoading}
      />
      <Button 
        type="submit" 
        disabled={!keyword.trim() || isLoading}
        variant="secondary"
      >
        <PlusCircle className="h-4 w-4 mr-2" />
        Add
      </Button>
    </form>
  )
} 