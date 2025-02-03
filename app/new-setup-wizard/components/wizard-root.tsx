'use client'

import { useRef, useCallback } from 'react'
import { WizardProvider } from '../context'
import { WizardWrapper } from './wizard-wrapper'
import { WizardContent } from './wizard-content'
import { motion } from 'framer-motion'
import Dot from '@/components/animata/background/dot'

interface WizardRootProps {
  accountId: string
}

export function WizardRoot({ accountId }: WizardRootProps) {
  const reviewStepRef = useRef<{ handleSubmit: () => Promise<void> }>(null)
  
  const handleReviewSubmit = useCallback(async () => {
    if (reviewStepRef.current) {
      await reviewStepRef.current.handleSubmit()
    }
  }, [])
  
  return (
    <Dot className="min-h-screen">
      <main className="container max-w-3xl mx-auto py-10">
        <motion.div 
          className="space-y-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              Welcome to x<span className="italic">f</span>unnel
            </h1>
            <p className="text-muted-foreground">
              We need to set up your company - don&apos;t worry, you don&apos;t need to do much, and it takes only a minute.
            </p>
          </div>
          
          <motion.div 
            className="bg-white rounded-xl shadow-lg overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <WizardProvider>
              <WizardWrapper onReviewSubmit={handleReviewSubmit}>
                <WizardContent ref={reviewStepRef} accountId={accountId} />
              </WizardWrapper>
            </WizardProvider>
          </motion.div>
        </motion.div>
      </main>
    </Dot>
  )
} 