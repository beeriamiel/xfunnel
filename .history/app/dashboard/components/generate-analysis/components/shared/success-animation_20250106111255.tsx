'use client'

import { motion } from 'framer-motion'
import { Check } from "lucide-react"

interface SuccessAnimationProps {
  title?: string;
}

export function SuccessAnimation({ title = "Setup Complete!" }: SuccessAnimationProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="fixed inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-50"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="flex flex-col items-center"
      >
        <div className="bg-[#f6efff] border-2 border-[#f9a8c9] rounded-full p-8 shadow-lg">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ 
              type: "spring",
              stiffness: 200,
              damping: 20,
              delay: 0.2 
            }}
          >
            <Check className="h-12 w-12 text-[#30035e]" />
          </motion.div>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-6"
        >
          <h3 className="text-lg font-semibold text-[#30035e]">{title}</h3>
        </motion.div>
      </motion.div>
    </motion.div>
  )
} 