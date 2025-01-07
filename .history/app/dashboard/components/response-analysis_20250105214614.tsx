'use client'

import React, { useState, useRef, useEffect, Fragment } from "react"
import type { Query, ICP, Persona, Product, Competitor, CompletedStep, StepId } from './types'

// Update Badge component usage
interface BadgeProps {
  variant?: "outline" | "default";
  className?: string;
  children?: React.ReactNode;
}

// ... existing code ...