'use client'

import * as React from 'react'
import type { Query, ICP, Persona, Product, Competitor, CompletedStep, StepId } from './types'

const { useState, useRef, useEffect, Fragment } = React

// Update Badge component usage
interface BadgeProps {
  variant?: "outline" | "default";
  className?: string;
  children?: React.ReactNode;
}

// ... existing code ...