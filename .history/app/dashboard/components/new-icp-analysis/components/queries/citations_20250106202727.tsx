"use client"

import * as React from "react"
import { useState } from "react"
import { ChevronDown } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { engineDisplayNames } from "../../types/query-types"
import type { Query } from "../../types/query-types"

interface CitationsProps {
  engineResults: Query['engineResults']
}

export function Citations({ engineResults }: CitationsProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  
  const totalCitations = Object.values(engineResults).reduce((total, result) => {
    return total + (result.citations?.length || 0)
  }, 0)
  
  if (totalCitations === 0) {
    return null
  }

  return (
    <div className="mt-4 border-t pt-4">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors w-full"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className="w-4 h-4"
        >
          <path d="M15.5 4h-11A1.5 1.5 0 003 5.5v9A1.5 1.5 0 004.5 16h11a1.5 1.5 0 001.5-1.5v-9A1.5 1.5 0 0015.5 4zM5 7h2v2H5V7zm4 0h2v2H9V7zm4 0h2v2h-2V7z" />
        </svg>
        <span>Citations ({totalCitations})</span>
        <div className={`ml-auto transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
          <ChevronDown className="h-4 w-4" />
        </div>
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="mt-4 space-y-4">
              {Object.entries(engineResults).map(([engine, result]) => {
                if (!result.citations?.length) return null
                
                return (
                  <div key={engine} className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">
                        {engineDisplayNames[engine]}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        ({result.citations.length})
                      </span>
                    </div>
                    <div className="space-y-1.5 pl-4">
                      {result.citations.map((citation, index) => (
                        <a
                          key={index}
                          href={citation}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block text-sm text-blue-500 hover:text-blue-600 hover:underline break-all max-w-full"
                        >
                          {citation}
                        </a>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
} 