/*
 * Why do we use a Class Component instead of a Functional Component for Error Boundaries?
 *
 * As of React 18, React does not yet provide a hook-equivalent (like `useErrorBoundary`)
 * for the lifecycles required to catch rendering errors (`getDerivedStateFromError` or `componentDidCatch`).
 * Therefore, class components remain the only way to build error boundaries in React.
 */

import { Component, ErrorInfo, ReactNode } from 'react'
import { fallbackVariants, FallbackVariantsType } from './styles'
import { cn } from '../Utils/utils'
import { Text } from '../Text/Text'
import { Button } from '../Button/Button'

type Prettify<T> = {
  [K in keyof T]: T[K]
} & {}

type ErrorBoundaryCustomProps = {
  /** The children nodes wrapped inside the boundary shell */
  children: ReactNode
  /** Optional custom UI component shown when children crash */
  fallback?: ReactNode
  className?: string
}

type CleanProps = Prettify<ErrorBoundaryCustomProps & FallbackVariantsType>

export type ErrorBoundaryProps = CleanProps

interface ErrorBoundaryState {
  /** Tracks whether an error has been intercepted in the wrapped tree */
  hasError: boolean
  /** The actual thrown error object containing details */
  error: Error | null
}

/**
 * ErrorBoundary Component: Intercepts JavaScript crashes occurring inside its child
 * tree, logs the stack telemetry, and renders a fallback UI to prevent the entire app from unmounting.
 */
export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    // part of syntax to pass properties to the base class of React.
    super(props)
    // Initialize state with no errors active
    this.state = { hasError: false, error: null }
  }

  /**
   * RENDER PHASE - getDerivedStateFromError:
   *
   * This is a static method (belonging to the class itself, not the instance).
   * It runs during the React "render phase" immediately after a child component crashes.
   * By returning a state update here, we instruct React to re-render using the fallback UI
   * instead of completing the crashed children render cycle.
   */
  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  /**
   * COMMIT PHASE - componentDidCatch:
   *
   * This runs during the React "commit phase" after the error fallback is mounted.
   * Because side-effects are permitted here, this is the ideal location to perform
   * logging (e.g. console reports, Sentry uploads, or server telemetry).
   */
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  render() {
    const { hasError, error } = this.state
    const { fallback, children, className, variant } = this.props

    if (hasError) {
      // If a custom fallback component is provided by the developer, render it instead of the default layout
      if (fallback) {
        return fallback
      }

      // Default visual fallback layout
      return (
        <div className={cn(fallbackVariants({ variant }), className)}>
          <Text variant="h3" color="danger" className="font-semibold">
            Something went wrong.
          </Text>

          <Text variant="body" color="secondary">
            {error?.message || 'An unexpected rendering error occurred.'}
          </Text>

          {/* Recovery Button: Resets state to attempt re-rendering children */}
          <Button
            variant="secondary"
            size="md"
            className="mt-m"
            onClick={() => this.setState({ hasError: false, error: null })}
          >
            Try Again
          </Button>
        </div>
      )
    }

    // Default path: No errors caught, render child components normally
    return children
  }
}
