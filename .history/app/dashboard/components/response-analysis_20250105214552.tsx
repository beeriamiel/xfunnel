'use client'

import React from "react"
const { useState, useRef, useEffect, Fragment } = React

// Update Badge component usage
interface BadgeProps {
  variant?: "outline" | "default";
  className?: string;
  children?: React.ReactNode;
}

// ... existing code ...