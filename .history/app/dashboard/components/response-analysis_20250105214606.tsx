'use client'

import React from "react"
import type { ChangeEvent, ReactNode } from 'react'
import type { BadgeProps } from "@/components/ui/badge"
import type { Query, ICP, Persona, Product, Competitor, CompletedStep, StepId } from './types'

// Update Badge component usage
interface BadgeProps {
  variant?: "outline" | "default";
  className?: string;
  children?: React.ReactNode;
}

// ... existing code ...