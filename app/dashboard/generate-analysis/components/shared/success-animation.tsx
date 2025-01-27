'use client'

import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle } from 'lucide-react'
import confetti from 'canvas-confetti'

interface SuccessAnimationProps {
  onComplete: () => void;
}

export function SuccessAnimation({ onComplete }: SuccessAnimationProps) {
  useEffect(() => {
    // Fire confetti
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#f9a8c9', '#30035e', '#f6efff'],
    })

    setTimeout(() => {
      confetti({
        particleCount: 50,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#f9a8c9', '#30035e', '#f6efff'],
      })
    }, 200)

    setTimeout(() => {
      confetti({
        particleCount: 50,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#f9a8c9', '#30035e', '#f6efff'],
      })
    }, 400)

    // Call onComplete after animations
    const timer = setTimeout(() => {
      onComplete()
    }, 2000)

    return () => clearTimeout(timer)
  }, [onComplete])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm z-50"
    >
      <div className="text-center">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h3 className="text-xl font-semibold mb-2">Setup Complete!</h3>
        <p className="text-muted-foreground">Your company profile has been created.</p>
      </div>
    </motion.div>
  )
} 