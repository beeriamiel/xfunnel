'use client'

import { createContext, useContext, useReducer, useMemo, ReactNode } from 'react'
import type { WizardState, WizardAction, WizardContextType, WizardStep } from './types'

const initialState: WizardState = {
  currentStep: 'company',
  companyName: '',
  products: [],
  competitors: [],
  icps: [],
  isLoading: false,
  error: null,
  isTransitioning: false,
  isGenerating: false,
  generationProgress: null,
  generatedData: null
}

function wizardReducer(state: WizardState, action: WizardAction): WizardState {
  switch (action.type) {
    case 'SET_STEP':
      return { ...state, currentStep: action.payload, isTransitioning: false }
    case 'START_TRANSITION':
      return { ...state, isTransitioning: true }
    case 'SET_COMPANY_NAME':
      return { ...state, companyName: action.payload }
    case 'SET_PRODUCTS':
      return { ...state, products: action.payload }
    case 'SET_COMPETITORS':
      return { ...state, competitors: action.payload }
    case 'SET_ICPS':
      return { ...state, icps: action.payload }
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload }
    case 'SET_ERROR':
      return { ...state, error: action.payload }
    case 'START_GENERATION':
      return { 
        ...state, 
        isGenerating: true,
        generationProgress: { step: 'Starting generation...', progress: 0, message: 'Initializing...' }
      }
    case 'UPDATE_GENERATION_PROGRESS':
      return { ...state, generationProgress: action.payload }
    case 'SET_GENERATED_DATA':
      return { 
        ...state,
        isGenerating: false,
        generatedData: action.payload,
        // Pre-populate the wizard state with generated data
        products: action.payload.products,
        competitors: action.payload.competitors,
        icps: action.payload.icps
      }
    default:
      return state
  }
}

const WizardContext = createContext<WizardContextType | null>(null)

const stepOrder: WizardStep[] = ['company', 'products', 'competitors', 'icps', 'personas', 'review']

export function WizardProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(wizardReducer, initialState)

  const nextStep = () => {
    const currentIndex = stepOrder.indexOf(state.currentStep)
    if (currentIndex < stepOrder.length - 1) {
      dispatch({ type: 'START_TRANSITION', payload: true })
      // Add a small delay for the transition effect
      setTimeout(() => {
        dispatch({ type: 'SET_STEP', payload: stepOrder[currentIndex + 1] })
      }, 150)
    }
  }

  const prevStep = () => {
    const currentIndex = stepOrder.indexOf(state.currentStep)
    if (currentIndex > 0) {
      dispatch({ type: 'START_TRANSITION', payload: true })
      // Add a small delay for the transition effect
      setTimeout(() => {
        dispatch({ type: 'SET_STEP', payload: stepOrder[currentIndex - 1] })
      }, 150)
    }
  }

  const isStepComplete = (step: WizardStep): boolean => {
    switch (step) {
      case 'company':
        return state.companyName.length > 0 && !state.isGenerating && !!state.generatedData
      case 'products':
        return state.products.length > 0
      case 'competitors':
        return state.competitors.length > 0
      case 'icps':
        return state.icps.length > 0
      case 'personas':
        return state.icps.some(icp => icp.personas.length > 0)
      case 'review':
        return true // Review is always completable
      default:
        return false
    }
  }

  const value = useMemo(() => ({
    ...state,
    dispatch,
    nextStep,
    prevStep,
    isStepComplete
  }), [state])

  return (
    <WizardContext.Provider value={value}>
      {children}
    </WizardContext.Provider>
  )
}

export function useWizard() {
  const context = useContext(WizardContext)
  if (!context) {
    throw new Error('useWizard must be used within a WizardProvider')
  }
  return context
} 