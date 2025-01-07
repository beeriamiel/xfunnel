'use client'

import * as React from 'react'
import type { Query, ICP, Persona, Product, Competitor, CompletedStep, StepId } from './types'

interface BadgeProps {
  variant?: "outline" | "default";
  className?: string;
  children?: React.ReactNode;
}

// ... existing code ...